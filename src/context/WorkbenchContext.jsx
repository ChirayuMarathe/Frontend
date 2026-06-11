import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const WorkbenchContext = createContext();

export const useWorkbench = () => {
    const context = useContext(WorkbenchContext);
    if (!context) {
        throw new Error('useWorkbench must be used within a WorkbenchProvider');
    }
    return context;
};

export const WorkbenchProvider = ({ children, workbenchId }) => {
    const [data, setData] = useState({
        workbench: null,
        coa: [],
        labels: [],
        balances: {},
        transactions: [],
        inventory: [],
        parties: [],
        loading: true,
        error: null,
    });

    const fetchContext = useCallback(async (showLoading = true) => {
        if (!workbenchId) return;

        try {
            if (showLoading) setData(prev => ({ ...prev, loading: true }));
            
            // Fetch all data in parallel from Supabase directly
            const [workbenchRes, labelsRes, transactionsRes, inventoryRes, partiesRes, ledgerRes] = await Promise.all([
                supabase.from('workbenches').select('*').eq('id', workbenchId).single(),
                supabase.from('labels').select('*').eq('workbench_id', workbenchId),
                supabase.from('workbench_records').select('*').eq('workbench_id', workbenchId).eq('record_type', 'transaction').order('created_at', { ascending: false }).limit(50),
                supabase.from('inventory_items').select('*').eq('workbench_id', workbenchId),
                supabase.from('parties').select('*').eq('workbench_id', workbenchId),
                supabase.from('ledger_entries').select('*').eq('workbench_id', workbenchId)
            ]);

            if (workbenchRes.error) throw new Error(workbenchRes.error.message || 'Failed to fetch workbench context');

            // Calculate balances from ledger entries
            const balances = {};
            (ledgerRes.data || []).forEach(entry => {
                if (!balances[entry.label_id]) {
                    balances[entry.label_id] = { gross: 0, net: 0 };
                }
                const amount = entry.amount || 0;
                balances[entry.label_id].gross += Math.abs(amount);
                balances[entry.label_id].net += amount;
            });

            const contextData = {
                workbench: workbenchRes.data,
                labels: labelsRes.data || [],
                coa: labelsRes.data || [],
                balances,
                transactions: (transactionsRes.data || []).map(t => ({
                    ...t,
                    date: t.metadata?.transaction_date || t.created_at?.split('T')[0],
                    description: t.summary,
                    amount: t.metadata?.amount || 0,
                    labels: t.metadata?.labels || []
                })),
                inventory: inventoryRes.data || [],
                parties: partiesRes.data || [],
            };

            setData({
                ...contextData,
                loading: false,
                error: null,
            });
            
            console.log(`[DEBUG] Workbench context synced for: ${workbenchId}`);
        } catch (err) {
            console.error('Error syncing workbench context:', err);
            setData(prev => ({ ...prev, loading: false, error: err.message }));
            toast.error(`Sync failed: ${err.message}`);
        }
    }, [workbenchId]);

    // Initial fetch
    useEffect(() => {
        fetchContext();
    }, [fetchContext]);

    // Listen for refresh events
    useEffect(() => {
        const handleRefresh = () => fetchContext(false); // Refresh in background
        window.addEventListener('refresh-ledger-data', handleRefresh);
        return () => window.removeEventListener('refresh-ledger-data', handleRefresh);
    }, [fetchContext]);

    const value = {
        ...data,
        refreshContext: fetchContext,
    };

    return (
        <WorkbenchContext.Provider value={value}>
            {children}
        </WorkbenchContext.Provider>
    );
};
