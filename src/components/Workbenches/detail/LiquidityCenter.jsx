import React, { useState, useEffect } from "react";
import { 
  BsPlusLg, 
  BsWallet2, 
  BsBank, 
  BsCashStack, 
  BsArrowRight,
  BsGrid3X3Gap,
  BsFileText,
  BsShieldCheck,
  BsArrowUpRight,
  BsChevronRight,
  BsChevronDown,
  BsStars
} from "react-icons/bs";
import { useWorkbench } from "../../../context/WorkbenchContext";
import Card from "../../shared/Card";

export default function LiquidityCenter({ workbenchId }) {
  const { coa: accounts, loading, refreshContext } = useWorkbench();
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [selectedSubAccount, setSelectedSubAccount] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeParent, setActiveParent] = useState(null);
  const [newNodeName, setNewNodeName] = useState("");
  const [metrics, setMetrics] = useState({
    totalLiquidity: 8470000,
    activeUnits: 0,
    nodeCount: 0,
    totalUnits: 0
  });

  useEffect(() => {
    if (accounts.length > 0) {
      if (!selectedPillar) setSelectedPillar(accounts.find(a => a.level === 1));
      
      setMetrics(prev => ({
        ...prev,
        activeUnits: accounts.filter(a => a.level === 4).length,
        nodeCount: accounts.length,
        totalUnits: accounts.filter(a => a.level === 4).length
      }));
    }
  }, [accounts, selectedPillar]);

  const handleAddNode = async (e) => {
    e.preventDefault();
    if (!activeParent || !newNodeName) return;

    try {
      const { data, error } = await supabase
        .from('coa_accounts')
        .insert({
          workbench_id: workbenchId,
          name: newNodeName,
          type: activeParent.type,
          parent_id: activeParent.id,
          level: activeParent.level + 1,
          is_system: false,
          display_order: accounts.filter(a => a.parent_id === activeParent.id).length + 1
        })
        .select();

      if (error) throw error;
      refreshContext();
      setIsAddModalOpen(false);
      setNewNodeName("");
    } catch (err) {
      alert("Error adding account: " + err.message);
    }
  };

  const pillars = accounts.filter(a => a.level === 1);
  const PILLAR_CONFIG = {
    "ASSETS": { icon: BsShieldCheck, color: "text-teal-400", bg: "bg-teal-400/10" },
    "LIABILITIES": { icon: BsWallet2, color: "text-rose-400", bg: "bg-rose-400/10" },
    "EQUITY": { icon: BsPlusLg, color: "text-indigo-400", bg: "bg-indigo-400/10" },
    "REVENUE": { icon: BsArrowUpRight, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    "EXPENSES": { icon: BsPlusLg, color: "text-amber-400", bg: "bg-amber-400/10" }
  };

  const getSubAccounts = (pillarId) => accounts.filter(a => a.parent_id === pillarId);
  const getLabels = (subId) => accounts.filter(a => a.parent_id === subId);
  const getUnits = (labelId) => accounts.filter(a => a.parent_id === labelId);

  return (
    <div className="flex h-full bg-[#0d0f12] text-white font-dm-sans animate-in fade-in duration-500">
      {/* Internal Sidebar: Account Categories */}
      <div className="w-[340px] border-r border-white/5 bg-[#0d0f12] flex flex-col p-6 space-y-6">
        <div className="space-y-1">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Account Categories</h3>
          <p className="text-[10px] text-gray-600">Select a pillar to view details</p>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
          {pillars.map((pillar) => {
            const config = PILLAR_CONFIG[pillar.name] || PILLAR_CONFIG["ASSETS"];
            const subCount = getSubAccounts(pillar.id).length;
            const isSelected = selectedPillar?.id === pillar.id;

            return (
              <div 
                key={pillar.id}
                onClick={() => {
                  setSelectedPillar(pillar);
                  setSelectedSubAccount(null);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                  isSelected 
                    ? "bg-white/[0.04] border-teal-500/30 shadow-lg shadow-teal-500/5" 
                    : "bg-transparent border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${isSelected ? config.bg : "bg-white/5"} ${isSelected ? config.color : "text-gray-500"} transition-colors`}>
                    <config.icon size={18} />
                  </div>
                  <BsChevronRight size={12} className={`transition-transform ${isSelected ? "rotate-90 text-teal-500" : "text-gray-600"}`} />
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${isSelected ? "text-white" : "text-gray-400"} group-hover:text-white transition-colors`}>
                    {pillar.name.charAt(0) + pillar.name.slice(1).toLowerCase()}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{subCount} sub-categories</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 group cursor-pointer hover:bg-white/[0.04] transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <BsPlusLg size={16} />
              </div>
              <div>
                <h5 className="text-[11px] font-bold text-white">AI Assistant</h5>
                <p className="text-[10px] text-gray-500">Ask Dabby anything</p>
              </div>
            </div>
            <BsChevronRight size={10} className="text-gray-600" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
        <header className="p-8 pb-4">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">Chart of Accounts</h2>
              <p className="text-xs text-gray-500">Organize and manage your financial accounts</p>
            </div>
            <div className="flex items-center space-x-4">
               <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('start-ai-chat', { 
                    detail: { 
                      query: "Analyze my company's liquidity and cash position. Is my current net worth healthy? Are there any upcoming liabilities I should be concerned about based on my ledger activity?",
                      workbenchId: workbenchId 
                    } 
                  }));
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl text-xs font-bold hover:bg-teal-500 hover:text-black transition-all"
               >
                 <BsStars />
                 <span>AI Health Check</span>
               </button>
               <button className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all">
                  <BsGrid3X3Gap size={18} />
               </button>
               <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-black rounded-xl text-xs font-bold hover:opacity-90 transition-all">
                 <BsPlusLg size={12} />
                 <span>New Record</span>
               </button>
            </div>
          </div>

          {/* Liquidity Center Header Card */}
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <BsShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Liquidity Center</h3>
                <p className="text-xs text-gray-500">Real-time overview of your liquid assets and cash flow architecture.</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setActiveParent(selectedSubAccount || selectedPillar);
                setIsAddModalOpen(true);
              }}
              className="flex items-center space-x-2 px-5 py-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-all"
            >
              <BsPlusLg size={12} />
              <span>Record Transaction</span>
            </button>
          </div>
        </header>

        <main className="px-8 pb-12 space-y-8">
          {/* Metrics Row */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Liquidity", val: "₹84,70,000", sub: "Sparkline here", spark: true },
              { label: "Active Liquid Units", val: metrics.activeUnits, sub: "Across all accounts" },
              { label: "Account Nodes", val: metrics.nodeCount, sub: "Mapped to COA" },
              { label: "Posted Entries", val: "0", sub: "All entries cleared" }
            ].map((m, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 group hover:bg-white/[0.03] transition-all">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{m.label}</p>
                <div className="flex items-end justify-between">
                  <h4 className="text-xl font-bold text-white tracking-tight">{m.val}</h4>
                  {m.spark && (
                    <div className="flex space-x-1 items-end h-6">
                      {[30, 50, 40, 60, 45, 70, 55].map((h, j) => (
                        <div key={j} className="w-1 bg-teal-500/40 rounded-full" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-600">{m.sub}</p>
              </div>
            ))}
          </div>

          {/* Drill-Down Content */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">
                  {selectedSubAccount ? selectedSubAccount.name : (selectedPillar?.name.charAt(0) + selectedPillar?.name.slice(1).toLowerCase() + " Accounts")}
                </h3>
                <span className="text-[10px] font-bold px-2 py-1 bg-white/5 rounded-lg text-gray-500">
                  {selectedSubAccount 
                    ? `${getLabels(selectedSubAccount.id).length} labels` 
                    : `${getSubAccounts(selectedPillar?.id).length} sub-categories`}
                </span>
              </div>
              {selectedSubAccount && (
                <button 
                  onClick={() => setSelectedSubAccount(null)}
                  className="text-xs text-teal-400 hover:underline font-bold"
                >
                  Back to {selectedPillar?.name}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {(selectedSubAccount ? getLabels(selectedSubAccount.id) : getSubAccounts(selectedPillar?.id)).map((item) => {
                const count = selectedSubAccount ? getUnits(item.id).length : getLabels(item.id).length;
                return (
                  <div 
                    key={item.id}
                    onClick={() => {
                      if (!selectedSubAccount) setSelectedSubAccount(item);
                    }}
                    className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-white/5 text-gray-500 group-hover:text-teal-400 transition-colors">
                        {selectedSubAccount ? <BsFileText size={20} /> : <BsShieldCheck size={20} />}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">{item.name}</h5>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {count} {selectedSubAccount ? "accounts" : "categories"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {selectedSubAccount && count > 0 && (
                         <div className="text-right">
                            <p className="text-xs font-bold text-white tracking-tight">₹0.00</p>
                            <p className="text-[9px] text-gray-600 uppercase font-black tracking-tighter">Balance</p>
                         </div>
                      )}
                      <BsChevronRight size={12} className="text-gray-700 group-hover:text-white transition-all group-hover:translate-x-1" />
                    </div>
                  </div>
                );
              })}

              {(selectedSubAccount ? getLabels(selectedSubAccount.id).length : getSubAccounts(selectedPillar?.id).length) === 0 && (
                <div className="p-12 border-2 border-dashed border-white/5 rounded-3xl text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                    <BsPlusLg className="text-gray-600" size={24} />
                  </div>
                  <p className="text-gray-500">No {selectedSubAccount ? "labels" : "sub-categories"} found.</p>
                  <button 
                    onClick={() => {
                      setActiveParent(selectedSubAccount || selectedPillar);
                      setIsAddModalOpen(true);
                    }}
                    className="text-teal-400 font-bold hover:underline"
                  >
                    Create first {selectedSubAccount ? "label" : "sub-category"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Node Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0E1117] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl shadow-teal-500/10">
            <div className="flex items-center space-x-3 mb-6">
               <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400">
                  <BsPlusLg size={24} />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-white">Add Item</h3>
                  <p className="text-xs text-gray-500">Under {activeParent?.name}</p>
               </div>
            </div>
            
            <form onSubmit={handleAddNode} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Name</label>
                <input 
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Current Assets, Bank Account..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-teal-500/50 transition-all"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-4 rounded-2xl border border-white/10 text-gray-400 font-bold hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-4 rounded-2xl bg-primary text-black font-bold hover:opacity-90 shadow-xl shadow-primary/20 transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
