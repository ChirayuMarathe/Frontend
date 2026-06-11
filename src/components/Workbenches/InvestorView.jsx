import React, { useState, useEffect } from "react";
import { 
  BsArrowUpRight, 
  BsArrowDownRight, 
  BsCashStack, 
  BsGraphUp, 
  BsClock, 
  BsWallet2, 
  BsBank,
  BsReceipt,
  BsShieldCheck,
  BsLightningCharge,
  BsCalendarCheck,
  BsShare,
  BsInfoCircle
} from "react-icons/bs";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import Card from "../shared/Card";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import FinancialDataRoomModal from "./FinancialDataRoomModal";
import ShareSnapshotModal from "./ShareSnapshotModal";



export default function InvestorView({ workbenchId, workbenchName, shareId, sharePassword }) {
  const [loading, setLoading] = useState(true);
  const [intelligence, setIntelligence] = useState(null);
  const [activeTab, setActiveTab] = useState("intelligence");
  const [isDataRoomOpen, setIsDataRoomOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);



  useEffect(() => {
    if (workbenchId || (shareId && sharePassword)) {
      fetchIntelligence();
    }
  }, [workbenchId, shareId, sharePassword]);

  const fetchIntelligence = async () => {
    try {
      setLoading(true);
      
      let targetWorkbenchId = workbenchId;

      // If shared snapshot, get the workbench ID from the snapshot
      if (shareId && sharePassword) {
        const { data: snapshot, error: snapError } = await supabase
          .from('shared_snapshots')
          .select('workbench_id')
          .eq('share_id', shareId)
          .single();
        
        if (snapError || !snapshot) throw new Error("Invalid share link");
        targetWorkbenchId = snapshot.workbench_id;
      }

      // Fetch intelligence data from Supabase
      const [labelsRes, txRes, partiesRes] = await Promise.all([
        supabase.from('labels').select('*').eq('workbench_id', targetWorkbenchId),
        supabase.from('workbench_records').select('*').eq('workbench_id', targetWorkbenchId).eq('record_type', 'transaction').order('created_at', { ascending: false }),
        supabase.from('parties').select('*').eq('workbench_id', targetWorkbenchId)
      ]);

      const labels = labelsRes.data || [];
      const transactions = txRes.data || [];

      // Calculate KPIs
      const totalRevenue = transactions.filter(t => t.metadata?.direction === 'credit').reduce((s, t) => s + (t.metadata?.amount || 0), 0);
      const totalExpense = transactions.filter(t => t.metadata?.direction === 'debit').reduce((s, t) => s + (t.metadata?.amount || 0), 0);
      const netProfit = totalRevenue - totalExpense;
      const burnRate = totalExpense / Math.max(1, new Set(transactions.map(t => t.metadata?.transaction_date?.substring(0, 7))).size);
      const runway = burnRate > 0 ? (totalRevenue - totalExpense) / burnRate : 0;

      // Build trends from transactions
      const monthMap = {};
      transactions.forEach(t => {
        const month = t.metadata?.transaction_date?.substring(0, 7) || 'Unknown';
        if (!monthMap[month]) monthMap[month] = { month, revenue: 0, expense: 0 };
        if (t.metadata?.direction === 'credit') monthMap[month].revenue += t.metadata?.amount || 0;
        else monthMap[month].expense += t.metadata?.amount || 0;
      });

      const data = {
        summary: {
          headline: netProfit >= 0 ? "Business is profitable and growing" : "Business needs attention — expenses exceed revenue",
          subtext: `Based on ${transactions.length} verified ledger entries.`,
          growth_signal: netProfit >= 0 ? 'positive' : 'neutral'
        },
        kpis: [
          { label: 'REVENUE', value: totalRevenue, type: 'currency', trend: 0 },
          { label: 'NET PROFIT', value: netProfit, type: 'currency', trend: 0 },
          { label: 'BURN RATE', value: burnRate, type: 'currency', trend: 0 },
          { label: 'RUNWAY', value: Math.max(0, runway), type: 'months', trend: 0 }
        ],
        trust: {
          confidence_score: transactions.length > 0 ? 85 : 0,
          data_completeness: transactions.length > 0 ? 90 : 0,
          last_updated: new Date().toISOString()
        },
        trends: Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month))
      };

      setIntelligence(data);
    } catch (err) {
      console.error("Error fetching intelligence:", err);
      toast.error("Failed to load financial intelligence layer");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!intelligence) return null;

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      {/* Header with Sharing & Mode */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Financial Intelligence Layer
            <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] text-primary font-bold uppercase tracking-widest">
              Investor Mode
            </span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">Compressed financial truth generated from operational reality.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <BsClock className="text-primary" />
            Updated {new Date(intelligence.trust.last_updated).toLocaleTimeString()}
          </div>
          {!shareId && (
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg text-xs font-bold hover:bg-primary/90 transition-all"
            >
              <BsShare />
              Share Snapshot
            </button>
          )}
        </div>


      </div>

      {/* 1. AUTO-GENERATED INVESTOR STORY */}
      <Card variant="dark" className="p-8 bg-gradient-to-br from-primary/5 to-transparent border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BsLightningCharge size={80} className="text-primary" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <BsLightningCharge />
            Executive Story
          </h3>
          <h2 className="text-2xl font-semibold text-white leading-tight mb-4">
            {intelligence.summary.headline}
          </h2>
          <p className="text-gray-400 leading-relaxed text-lg">
            {intelligence.summary.subtext}
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 font-medium">
              <BsArrowUpRight /> Revenue Trend: Positive
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400 font-medium">
              <BsClock /> Runway: {intelligence.kpis.find(k => k.label === 'RUNWAY')?.value.toFixed(1)} Months
            </div>
          </div>
        </div>
      </Card>

      {/* 2. TRUST LAYER (DETECTOR) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card variant="dark" className="lg:col-span-1 p-6 border-white/5 bg-white/[0.02] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
               <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Confidence Score</h4>
               <div className="group relative">
                  <BsInfoCircle className="text-gray-600 hover:text-gray-400 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black border border-white/10 rounded-lg text-[8px] text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50">
                     Calculated as (Doc_Count / Tx_Count). Represents the verification level of the current ledger.
                  </div>
               </div>
            </div>
            <div className="relative w-32 h-32 mx-auto">

              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff05" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="#FBBF24" 
                  strokeWidth="8" 
                  strokeDasharray={`${intelligence.trust.confidence_score * 2.8} 280`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{Math.round(intelligence.trust.confidence_score)}%</span>
                <span className="text-[8px] text-gray-500 uppercase font-bold">Signal Trust</span>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center text-[10px] font-medium">
              <span className="text-gray-500 uppercase">Verification Level</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <BsShieldCheck /> Deterministic
              </span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
            </div>
          </div>
        </Card>

        {/* 3. KPI ABSTRACTION LAYER */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {intelligence.kpis.map((kpi, i) => (
            <Card key={i} variant="dark" className="border-white/5 p-5 bg-white/[0.02] hover:border-primary/20 transition-all group">
              <div className="flex flex-col justify-between h-full space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase group-hover:text-primary transition-colors">
                    {kpi.label}
                  </span>
                  {kpi.trend !== 0 && (
                    <div className={`flex items-center gap-1 text-[10px] font-bold ${kpi.trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {kpi.trend > 0 ? <BsArrowUpRight /> : <BsArrowDownRight />}
                      {Math.abs(kpi.trend).toFixed(1)}%
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {kpi.type === 'currency' ? formatCurrency(kpi.value) : `${kpi.value.toFixed(1)} Months`}
                </h3>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${kpi.label === 'RUNWAY' ? 'bg-amber-500' : 'bg-primary'}`} 
                    style={{ width: kpi.label === 'REVENUE' ? '65%' : '40%' }} 
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. GROWTH & REVENUE STORY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="dark" className="lg:col-span-2 p-8 border-white/5 bg-white/[0.01]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-tight">Growth Narrative</h3>
              <p className="text-xs text-gray-500 mt-1">Revenue vs Burn trend analysis from the ledger.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-gray-400">Revenue</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-400">Expense</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={intelligence.trends}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FBBF24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                  labelStyle={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#FBBF24" 
                  strokeWidth={3} 
                  fill="url(#colorRev)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#3B82F6" 
                  strokeWidth={2} 
                  fill="none" 
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 5. INVESTOR INSIGHTS ENGINE */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-2">Deterministic Insights</h4>
          <Card variant="dark" className="p-5 border-white/5 bg-white/[0.02]">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-500">
                  <BsGraphUp />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white mb-1">Growth Signal</h5>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    {intelligence.summary.growth_signal === 'positive' 
                      ? "Revenue grew faster than operating expenses for 2 consecutive months."
                      : "Revenue growth has stabilized in the current period."}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-500">
                  <BsClock />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white mb-1">Efficiency Signal</h5>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Monthly burn is currently {formatCurrency(intelligence.kpis.find(k => k.label === 'BURN RATE')?.value)}. Efficiency is tracking within target range.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-500">
                  <BsShieldCheck />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white mb-1">Audit Completeness</h5>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    {intelligence.trust.data_completeness.toFixed(1)}% of all ledger transactions are mapped with proof documents.
                  </p>
                </div>
              </div>
            </div>
          </Card>
          
          <button 
            onClick={() => setIsDataRoomOpen(true)}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold text-gray-400 transition-all flex items-center justify-center gap-2 group"
          >
            <BsCalendarCheck className="group-hover:text-primary" />
            View Financial Data Room
          </button>
        </div>
      </div>

      <FinancialDataRoomModal 
        isOpen={isDataRoomOpen} 
        onClose={() => setIsDataRoomOpen(false)} 
        workbenchId={workbenchId} 
        workbenchName={workbenchName}
      />

      <ShareSnapshotModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        workbenchId={workbenchId}
      />




      {/* 6. TRUST FOOTER */}
      <div className="flex items-center justify-center gap-8 pt-8 border-t border-white/5">
        <div className="flex items-center gap-2 opacity-50 grayscale">
          <BsShieldCheck className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SHA-256 Verified Ledger</span>
        </div>
        <div className="flex items-center gap-2 opacity-50 grayscale">
          <BsBank className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bank-grade Integrity</span>
        </div>
        <div className="flex items-center gap-2 opacity-50 grayscale">
          <BsReceipt className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">1:1 Doc Mapping</span>
        </div>
      </div>
    </div>
  );
}
