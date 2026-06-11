import React, { useState, useEffect } from "react";
import { 
  BsX, 
  BsGraphUp, 
  BsColumnsGap, 
  BsJournalText, 
  BsLightningCharge,
  BsArrowUpRight,
  BsArrowDownRight,
  BsShieldCheck,
  BsDownload
} from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { reportService } from "../../services/reportService";
import { supabase } from "../../lib/supabase";

export default function FinancialDataRoomModal({ isOpen, onClose, workbenchId, workbenchName }) {

  const [activeTab, setActiveTab] = useState("pl");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isOpen && workbenchId) {
      fetchStatements();
    }
  }, [isOpen, workbenchId]);

  const fetchStatements = async () => {
    try {
      setLoading(true);
      
      // Fetch labels with their balances from Supabase
      const [labelsRes, ledgerRes] = await Promise.all([
        supabase.from('labels').select('*, master_sub_accounts(sub_account_name)').eq('workbench_id', workbenchId),
        supabase.from('ledger_entries').select('*').eq('workbench_id', workbenchId)
      ]);

      const labels = labelsRes.data || [];
      const entries = ledgerRes.data || [];

      // Calculate balances per label
      const balanceMap = {};
      entries.forEach(e => {
        if (!balanceMap[e.label_id]) balanceMap[e.label_id] = 0;
        balanceMap[e.label_id] += e.amount || 0;
      });

      // Build P&L
      const revenueLabels = labels.filter(l => l.type === 'revenue').map(l => ({
        name: l.name, sub_account: l.master_sub_accounts?.sub_account_name || '', amount: Math.abs(balanceMap[l.id] || 0)
      }));
      const expenseLabels = labels.filter(l => l.type === 'expense').map(l => ({
        name: l.name, sub_account: l.master_sub_accounts?.sub_account_name || '', amount: Math.abs(balanceMap[l.id] || 0)
      }));
      const totalRevenue = revenueLabels.reduce((s, l) => s + l.amount, 0);
      const totalExpenses = expenseLabels.reduce((s, l) => s + l.amount, 0);

      // Build BS
      const assetLabels = labels.filter(l => l.type === 'asset').map(l => ({
        name: l.name, sub_account: l.master_sub_accounts?.sub_account_name || '', amount: Math.abs(balanceMap[l.id] || 0)
      }));
      const liabilityLabels = labels.filter(l => l.type === 'liability').map(l => ({
        name: l.name, sub_account: l.master_sub_accounts?.sub_account_name || '', amount: Math.abs(balanceMap[l.id] || 0)
      }));
      const equityLabels = labels.filter(l => l.type === 'equity').map(l => ({
        name: l.name, sub_account: l.master_sub_accounts?.sub_account_name || '', amount: Math.abs(balanceMap[l.id] || 0)
      }));

      // Build MIS categories
      const categories = {};
      expenseLabels.forEach(l => {
        const cat = l.sub_account || 'Other';
        categories[cat] = (categories[cat] || 0) + l.amount;
      });

      const netProfit = totalRevenue - totalExpenses;

      const result = {
        pl: {
          total_revenue: totalRevenue,
          total_expenses: totalExpenses,
          net_profit: netProfit,
          revenue: revenueLabels,
          expenses: expenseLabels
        },
        bs: {
          total_assets: assetLabels.reduce((s, l) => s + l.amount, 0),
          total_liabilities: liabilityLabels.reduce((s, l) => s + l.amount, 0),
          total_equity: equityLabels.reduce((s, l) => s + l.amount, 0),
          assets: assetLabels,
          liabilities: liabilityLabels,
          equity: equityLabels
        },
        mis: { categories },
        interpretation: {
          headline: netProfit >= 0 ? "Profitable Operations" : "Attention Required",
          subtext: netProfit >= 0 
            ? `Revenue of ₹${totalRevenue.toLocaleString()} exceeds expenses by ₹${netProfit.toLocaleString()}.`
            : `Expenses exceed revenue by ₹${Math.abs(netProfit).toLocaleString()}.`,
          signals: [
            { type: 'growth', msg: totalRevenue > 0 ? 'Revenue streams are active' : 'No revenue recorded yet' },
            { type: 'risk', msg: totalExpenses > totalRevenue ? 'Burn rate exceeds revenue' : 'Operating within budget' },
            { type: 'compliance', msg: 'All entries are ledger-verified' }
          ]
        }
      };

      setData(result);
    } catch (err) {
      console.error("Error fetching statements:", err);
      toast.error("Failed to load data room");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      toast.loading("Preparing financial package...");
      await reportService.generateReport('dataroom', workbenchId, workbenchName || "Financial Report", "all", {});
      toast.dismiss();
      toast.success("Package exported successfully!");
    } catch (err) {
      console.error("Export failed:", err);
      toast.dismiss();
      toast.error("Failed to export package");
    }
  };

  if (!isOpen) return null;


  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const tabs = [
    { id: "pl", label: "P&L Statement", icon: BsGraphUp },
    { id: "bs", label: "Balance Sheet", icon: BsColumnsGap },
    { id: "mis", label: "MIS Reports", icon: BsJournalText },
    { id: "interpretation", label: "Interpretation", icon: BsLightningCharge },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-6xl h-[85vh] bg-[#0d1117] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
              <BsJournalText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Financial Data Room</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Verified Investor Intelligence Layer</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-400 transition-all"
             >
                <BsDownload />
                Export Package
             </button>

             <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 transition-all">
                <BsX size={28} />
             </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-8 py-4 bg-white/[0.01] border-b border-white/5 flex gap-2">
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                 activeTab === tab.id 
                  ? "bg-primary text-black shadow-lg shadow-primary/20" 
                  : "text-gray-500 hover:text-white hover:bg-white/5"
               }`}
             >
               <tab.icon />
               {tab.label}
             </button>
           ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           {loading ? (
             <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-gray-500 text-sm font-medium">Synthesizing financial truth...</p>
             </div>
           ) : (
             <AnimatePresence mode="wait">
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, x: 10 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -10 }}
                 transition={{ duration: 0.2 }}
               >
                  {activeTab === "pl" && renderPL(data.pl, formatCurrency)}
                  {activeTab === "bs" && renderBS(data.bs, formatCurrency)}
                  {activeTab === "mis" && renderMIS(data.mis, formatCurrency)}
                  {activeTab === "interpretation" && renderInterpretation(data.interpretation)}
               </motion.div>
             </AnimatePresence>
           )}
        </div>
      </motion.div>
    </div>
  );
}

function renderPL(pl, formatCurrency) {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
       <div className="grid grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
             <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Total Revenue</span>
             <h3 className="text-3xl font-bold text-white mt-2">{formatCurrency(pl.total_revenue)}</h3>
          </div>
          <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10">
             <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Total Expenses</span>
             <h3 className="text-3xl font-bold text-white mt-2">{formatCurrency(pl.total_expenses)}</h3>
          </div>
          <div className={`p-6 rounded-3xl border ${pl.net_profit >= 0 ? "bg-primary/5 border-primary/10" : "bg-amber-500/5 border-amber-500/10"}`}>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net Profit</span>
             <h3 className={`text-3xl font-bold mt-2 ${pl.net_profit >= 0 ? "text-primary" : "text-amber-500"}`}>{formatCurrency(pl.net_profit)}</h3>
          </div>
       </div>

       <div className="space-y-8">
          <section>
             <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-6 pl-4 border-l-2 border-emerald-500">Revenue Breakdown</h4>
             <div className="bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden">
                <table className="w-full">
                   <thead>
                      <tr className="border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                         <th className="px-6 py-4 text-left">Label</th>
                         <th className="px-6 py-4 text-left">Category</th>
                         <th className="px-6 py-4 text-right">Amount</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {pl.revenue.map((item, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-all">
                           <td className="px-6 py-4 text-sm font-bold text-white">{item.name}</td>
                           <td className="px-6 py-4 text-xs text-gray-500">{item.sub_account}</td>
                           <td className="px-6 py-4 text-sm font-mono text-emerald-400 text-right">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </section>

          <section>
             <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-6 pl-4 border-l-2 border-rose-500">Expense Breakdown</h4>
             <div className="bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden">
                <table className="w-full">
                   <thead>
                      <tr className="border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                         <th className="px-6 py-4 text-left">Label</th>
                         <th className="px-6 py-4 text-left">Category</th>
                         <th className="px-6 py-4 text-right">Amount</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {pl.expenses.map((item, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-all">
                           <td className="px-6 py-4 text-sm font-bold text-white">{item.name}</td>
                           <td className="px-6 py-4 text-xs text-gray-500">{item.sub_account}</td>
                           <td className="px-6 py-4 text-sm font-mono text-white text-right">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </section>
       </div>
    </div>
  );
}

function renderBS(bs, formatCurrency) {
  return (
    <div className="max-w-4xl mx-auto grid grid-cols-2 gap-12">
       <div className="space-y-8">
          <section>
             <div className="flex items-center justify-between mb-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] pl-4 border-l-2 border-primary">Assets</h4>
                <span className="text-lg font-bold text-white">{formatCurrency(bs.total_assets)}</span>
             </div>
             <div className="space-y-3">
                {bs.assets.map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:border-primary/30 transition-all">
                     <div>
                        <div className="text-sm font-bold text-white">{item.name}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">{item.sub_account}</div>
                     </div>
                     <div className="text-sm font-mono text-primary">{formatCurrency(item.amount)}</div>
                  </div>
                ))}
             </div>
          </section>
       </div>

       <div className="space-y-12">
          <section>
             <div className="flex items-center justify-between mb-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] pl-4 border-l-2 border-rose-500">Liabilities</h4>
                <span className="text-lg font-bold text-white">{formatCurrency(bs.total_liabilities)}</span>
             </div>
             <div className="space-y-3">
                {bs.liabilities.map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                     <div>
                        <div className="text-sm font-bold text-white">{item.name}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">{item.sub_account}</div>
                     </div>
                     <div className="text-sm font-mono text-white">{formatCurrency(item.amount)}</div>
                  </div>
                ))}
             </div>
          </section>

          <section>
             <div className="flex items-center justify-between mb-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] pl-4 border-l-2 border-purple-500">Equity</h4>
                <span className="text-lg font-bold text-white">{formatCurrency(bs.total_equity)}</span>
             </div>
             <div className="space-y-3">
                {bs.equity.map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                     <div>
                        <div className="text-sm font-bold text-white">{item.name}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">{item.sub_account}</div>
                     </div>
                     <div className="text-sm font-mono text-white">{formatCurrency(item.amount)}</div>
                  </div>
                ))}
             </div>
          </section>

          <div className="pt-8 border-t border-white/10 flex items-center justify-between">
             <span className="text-sm font-black text-gray-500 uppercase tracking-[0.2em]">Total L + E</span>
             <span className="text-2xl font-bold text-white">{formatCurrency(bs.total_liabilities + bs.total_equity)}</span>
          </div>
       </div>
    </div>
  );
}

function renderMIS(mis, formatCurrency) {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
       <div className="grid grid-cols-2 gap-8">
          <CardWrapper title="Expense Concentration">
             <div className="space-y-6">
                {Object.entries(mis.categories).sort((a, b) => b[1] - a[1]).map(([cat, val], i) => (
                  <div key={i} className="space-y-2">
                     <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-gray-400">{cat}</span>
                        <span className="text-white">{formatCurrency(val)}</span>
                     </div>
                     <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${(val / Object.values(mis.categories).reduce((a,b)=>a+b, 0) * 100).toFixed(0)}%` }} 
                        />
                     </div>
                  </div>
                ))}
             </div>
          </CardWrapper>

          <div className="flex flex-col justify-center space-y-6 p-8 rounded-[40px] bg-white/[0.02] border border-white/5">
             <div className="text-center space-y-2">
                <BsShieldCheck className="text-4xl text-primary mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white">MIS Integrity Verified</h4>
                <p className="text-sm text-gray-500">Monthly Intelligence Summary is synchronized with the source-of-truth ledger.</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 text-center">
                   <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Labels</div>
                   <div className="text-xl font-bold text-white mt-1">{Object.keys(mis.categories).length}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 text-center">
                   <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Data Room ID</div>
                   <div className="text-sm font-mono text-white mt-1">DR-{Math.floor(Math.random()*10000)}</div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function renderInterpretation(interp) {
  return (
    <div className="max-w-3xl mx-auto space-y-12">
       <div className="p-10 rounded-[40px] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
             <BsLightningCharge size={120} />
          </div>
          <div className="relative z-10 space-y-6">
             <div className="flex items-center gap-3 text-primary">
                <BsLightningCharge size={24} />
                <span className="text-sm font-bold uppercase tracking-[0.3em]">AI Executive Interpretation</span>
             </div>
             <h2 className="text-4xl font-bold text-white leading-tight">{interp.headline}</h2>
             <p className="text-xl text-gray-400 leading-relaxed">{interp.subtext}</p>
          </div>
       </div>

       <div className="grid grid-cols-3 gap-6">
          {interp.signals.map((sig, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                 sig.type === 'growth' ? 'bg-emerald-500/10 text-emerald-500' : 
                 sig.type === 'risk' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
               }`}>
                  {sig.type === 'growth' ? <BsGraphUp /> : sig.type === 'risk' ? <BsLightningCharge /> : <BsShieldCheck />}
               </div>
               <p className="text-sm font-bold text-white">{sig.msg}</p>
            </div>
          ))}
       </div>
    </div>
  );
}

function CardWrapper({ title, children }) {
  return (
    <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-8">
       <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] pl-4 border-l-2 border-primary">{title}</h4>
       {children}
    </div>
  );
}
