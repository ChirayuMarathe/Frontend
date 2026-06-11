import { supabase } from "../lib/supabase";

/**
 * Context Service (Frontend-Only Edition)
 * 
 * Responsible for aggregating real-time workbench data 
 * into a structured format for the AI Consultant.
 * All data is fetched directly from Supabase.
 */
export const contextService = {
  /**
   * Fetches the complete state of a workbench from Supabase directly
   */
  async getWorkbenchIntelligence(workbenchId) {
    try {
      // Fetch all required data in parallel
      const [
        workbenchRes,
        labelsRes,
        transactionsRes,
        inventoryRes,
        partiesRes,
        ledgerRes
      ] = await Promise.all([
        supabase.from('workbenches').select('*').eq('id', workbenchId).single(),
        supabase.from('labels').select('*').eq('workbench_id', workbenchId),
        supabase.from('workbench_records')
          .select('*')
          .eq('workbench_id', workbenchId)
          .eq('record_type', 'transaction')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase.from('inventory_items').select('*').eq('workbench_id', workbenchId),
        supabase.from('parties').select('*').eq('workbench_id', workbenchId),
        supabase.from('ledger_entries').select('*').eq('workbench_id', workbenchId)
      ]);

      const workbench = workbenchRes.data;
      const labels = labelsRes.data || [];
      const transactions = (transactionsRes.data || []).map(t => ({
        date: t.metadata?.transaction_date || t.created_at?.split('T')[0],
        description: t.summary,
        amount: t.metadata?.amount || 0,
        labels: t.metadata?.labels || []
      }));
      const inventory = inventoryRes.data || [];
      const parties = partiesRes.data || [];

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

      return {
        workbench,
        labels,
        balances,
        transactions,
        inventory,
        parties,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error("[ContextService] Failed to fetch workbench intelligence:", err);
      throw err;
    }
  },

  /**
   * Formats raw intelligence into a highly dense but readable context for LLMs
   */
  formatForLLM(intel) {
    if (!intel || !intel.workbench) return "No workbench context available.";

    const { workbench, balances, transactions, inventory, parties, labels } = intel;

    let context = `### REAL-TIME BUSINESS CONTEXT: ${workbench.name} ###\n`;
    context += `Report Generated: ${new Date().toLocaleString()}\n\n`;

    // 1. Map Balances with their Label Metadata
    // labels is an array of {id, name, type, sub_account}
    // balances is a dict of {label_id: {gross, net}}
    const mergedBalances = labels.map(l => ({
      ...l,
      ...(balances[l.id] || { gross: 0, net: 0 })
    }));

    // 1. Financial Snapshot (Aggregated)
    const assets = mergedBalances.filter(b => b.type === 'asset').reduce((s, b) => s + (b.net || 0), 0);
    const liabilities = mergedBalances.filter(b => b.type === 'liability').reduce((s, b) => s + (b.net || 0), 0);
    const revenue = mergedBalances.filter(b => b.type === 'revenue').reduce((s, b) => s + (b.net || 0), 0);
    const expenses = mergedBalances.filter(b => b.type === 'expense').reduce((s, b) => s + (b.net || 0), 0);

    // Fix for natural balance orientation (liabilities/revenue are negative in DB)
    const displayLiabilities = Math.abs(liabilities);
    const displayRevenue = Math.abs(revenue);

    context += `## 1. FINANCIAL SUMMARY\n`;
    context += `- Total Assets (Cash/Bank/Inventory): ₹${assets.toLocaleString()}\n`;
    context += `- Total Liabilities (Debt/Payables): ₹${displayLiabilities.toLocaleString()}\n`;
    context += `- Net Worth (Assets - Liabilities): ₹${(assets - displayLiabilities).toLocaleString()}\n`;
    context += `- YTD Revenue: ₹${displayRevenue.toLocaleString()}\n`;
    context += `- YTD Expenses: ₹${expenses.toLocaleString()}\n`;
    context += `- Gross Profit: ₹${(displayRevenue - expenses).toLocaleString()}\n\n`;

    // 2. Critical Account Balances (Cash & Bank)
    context += `## 2. BANK & CASH BALANCES\n`;
    mergedBalances.filter(b => b.sub_account?.toLowerCase().includes('bank') || b.type === 'asset')
      .sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
      .forEach(b => {
        if (Math.abs(b.net) > 0) {
          context += `- ${b.name}: ₹${b.net.toLocaleString()}\n`;
        }
      });
    context += `\n`;

    // 3. Other Account Balances
    context += `## 3. OTHER BALANCES\n`;
    mergedBalances.filter(b => !b.sub_account?.toLowerCase().includes('bank') && b.type !== 'asset')
      .sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
      .slice(0, 10)
      .forEach(b => {
        if (Math.abs(b.net) > 0) {
          context += `- ${b.name} (${b.type}): ₹${Math.abs(b.net).toLocaleString()}\n`;
        }
      });
    context += `\n`;

    // 3. Recent Transactions
    context += `## 3. RECENT TRANSACTIONS (Audit Trail)\n`;
    transactions.slice(0, 10).forEach(tx => {
      context += `- [${tx.date}] ${tx.description}: ₹${tx.amount.toLocaleString()} (Labels: ${tx.labels.join(", ")})\n`;
    });
    context += `\n`;

    // 4. Party Analysis
    context += `## 4. TOP COUNTERPARTIES (Vendors/Customers)\n`;
    parties.slice(0, 8).forEach(p => {
      context += `- ${p.name} (${p.category}): `;
      const entries = [];
      if (p.total_receivable) entries.push(`Receivable: ₹${p.total_receivable.toLocaleString()}`);
      if (p.total_payable) entries.push(`Payable: ₹${p.total_payable.toLocaleString()}`);
      context += entries.length > 0 ? entries.join(", ") : "No pending balance";
      context += `\n`;
    });
    context += `\n`;

    // 5. Inventory Summary
    if (inventory && inventory.length > 0) {
      context += `## 5. INVENTORY & STOCK\n`;
      inventory.slice(0, 5).forEach(i => {
        context += `- ${i.name}: ${i.stock_level} ${i.unit} (Price: ₹${i.price || 0})\n`;
      });
      context += `\n`;
    }

    context += `### END OF BUSINESS CONTEXT ###\n`;
    return context;
  }
};
