import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  BsShieldCheck, 
  BsChevronRight, 
  BsChevronDown, 
  BsStars, 
  BsPlusLg, 
  BsSearch,
  BsFolder2Open,
  BsHash,
  BsArrowRepeat,
  BsJournalText,
  BsArrowRight
} from "react-icons/bs";
import { toast } from "react-hot-toast";
import TransactionModal from "../ledger/TransactionModal";
import LabelModal from "../ledger/LabelModal";
import { useWorkbench } from "../../../context/WorkbenchContext";

export default function COAView({ workbenchId }) {
  const { labels, balances, transactions, loading, refreshContext } = useWorkbench();
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);

  useEffect(() => {
    if (labels.length > 0 && expandedRows.size === 0) {
      const types = [...new Set(labels.map(l => l.type))];
      setExpandedRows(new Set(types));
    }
  }, [labels, expandedRows.size]);

  // Listen for global open-transaction-modal event
  useEffect(() => {
    const handleOpenModal = () => setIsTransactionModalOpen(true);
    window.addEventListener('open-transaction-modal', handleOpenModal);
    return () => {
      window.removeEventListener('open-transaction-modal', handleOpenModal);
    };
  }, []);

  const toggleExpand = (id) => {
    const next = new Set(expandedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedRows(next);
  };

  // Group labels by type -> sub_account (Filtering out shadow labels)
  const organizedData = labels.reduce((acc, label) => {
    if (label.is_shadow) return acc; // Skip shadow labels in hierarchy
    if (!acc[label.type]) acc[label.type] = {};
    if (!acc[label.type][label.sub_account]) acc[label.type][label.sub_account] = [];
    acc[label.type][label.sub_account].push(label);
    return acc;
  }, {});

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const getPillarBalance = (type) => {
    if (!organizedData[type]) return { gross: 0, net: 0 };
    const items = Object.values(organizedData[type]).flat();
    const gross = items.reduce((sum, l) => sum + (balances[l.id]?.gross || 0), 0);
    const rawNet = items.reduce((sum, l) => sum + (balances[l.id]?.net || 0), 0);
    
    let net = rawNet;
    if (["equity", "revenue", "income"].includes(type)) {
      net = -rawNet;
    }
    
    if (type === "liability") {
      net = Math.max(0, -rawNet);
    }

    // Advanced Business Intelligence (User-Defined Model):
    // 1. Revenue "Left" = The unspent surplus currently in Assets.
    // 2. If Assets are 0 or negative, Revenue "Left" is 0 (it was used to cover debt).
    if (type === "revenue") {
      const assetData = getPillarBalance("asset");
      net = Math.max(0, assetData.net); 
    }
    
    // Ensure 0 is always clean
    if (Math.abs(net) < 0.01) net = 0;

    return { gross, net };
  };

  const getLabelBalance = (label) => {
    const data = balances[label.id] || { gross: 0, net: 0 };
    let net = data.net;
    if (["liability", "equity", "revenue", "income"].includes(label.type)) {
      net = -data.net;
    }
    return { gross: data.gross, net };
  };

  const [flippedCards, setFlippedCards] = useState(new Set());

  const toggleFlip = (type) => {
    const next = new Set(flippedCards);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setFlippedCards(next);
  };

  // Seeding logic removed as per user request

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white animate-in fade-in duration-500 overflow-hidden">
      {/* Header */}
      <div className="p-8 pb-6 flex flex-col space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-6">
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-lg shadow-teal-500/5">
              <BsShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Financial Ledger</h1>
              <div className="flex items-center space-x-3 mt-1">
                <p className="text-sm text-gray-500 font-medium italic whitespace-nowrap">Strict double-entry engine • {labels.length} active categories</p>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest">Net Profit:</span>
                  <span className={`text-sm font-bold ${getPillarBalance("revenue").net - getPillarBalance("expense").net < 0 ? "text-red-400" : "text-teal-400"}`}>
                    {formatCurrency(getPillarBalance("revenue").net - getPillarBalance("expense").net)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
             <div className="relative group">
                <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors" />
                <input 
                  type="text"
                  placeholder="Search ledger labels..."
                  className="bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm w-72 focus:outline-none focus:border-teal-500/50 transition-all font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button 
                onClick={() => setIsLabelModalOpen(true)}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center space-x-2"
              >
                <BsPlusLg />
                <span>New Label</span>
              </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 perspective-1000">
          {["asset", "liability", "equity", "revenue", "expense"].map(type => {
            const { gross, net } = getPillarBalance(type);
            const isFlipped = flippedCards.has(type);
            return (
              <div 
                key={type} 
                className="relative h-32 w-full cursor-pointer"
                onClick={() => toggleFlip(type)}
              >
                <motion.div
                  className="w-full h-full relative preserve-3d"
                  animate={{ rotateX: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                >
                  {/* Front: Left/Net */}
                  <div className="absolute inset-0 backface-hidden p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col space-y-1 group-hover:border-teal-500/30 transition-all shadow-xl">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{type}</span>
                    <div className="flex-1 flex flex-col justify-end">
                      <span className={`text-lg font-bold ${net < 0 ? "text-red-400" : "text-white"}`}>
                        {formatCurrency(net)}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-tighter text-gray-600">
                        LEFT / NET
                      </span>
                    </div>
                  </div>

                  {/* Back: Marked/Gross */}
                  <div className="absolute inset-0 backface-hidden p-4 rounded-2xl bg-teal-500/5 border border-teal-500/20 flex flex-col space-y-1 rotate-x-180 shadow-2xl">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">{type} Incurred</span>
                    <div className="flex-1 flex flex-col justify-end">
                      <span className="text-lg font-bold text-teal-400">
                        {formatCurrency(gross)}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-tighter text-teal-400/40">
                        MARKED / GROSS
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area: Side-by-Side Containers */}
      <div className="flex-1 px-8 pb-8 overflow-hidden flex space-x-6">
        
        {/* Left Container: Hierarchy & Labels */}
        <div className="flex-[3] bg-white/[0.01] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-2xl">
          <div className="bg-white/[0.02] border-b border-white/5 px-8 py-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BsJournalText className="text-teal-400" />
              <span className="text-xs font-black text-white uppercase tracking-widest">Hierarchy & Labels</span>
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Current Balance</span>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-20">
                <div className="flex flex-col items-center space-y-4">
                  <BsArrowRepeat className="animate-spin text-teal-400" size={32} />
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Synchronizing Ledger...</p>
                </div>
              </div>
            ) : labels.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-24 text-center">
                 <BsFolder2Open size={64} className="mb-6 text-gray-800 animate-pulse" />
                 <h3 className="text-xl font-bold text-white mb-2">No Ledger Data Found</h3>
                 <p className="text-gray-500 max-w-xs mx-auto text-sm font-medium mb-8">Your Chart of Accounts is currently empty.</p>
                 <button 
                  onClick={() => setIsLabelModalOpen(true)}
                  className="px-8 py-3 bg-teal-500 text-black rounded-2xl font-bold text-sm hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20 flex items-center space-x-2"
                 >
                   <BsPlusLg />
                   <span>Create First Label</span>
                 </button>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.03]">
                {Object.entries(organizedData).map(([type, subAccounts]) => {
                  const isExpanded = expandedRows.has(type);
                  return (
                    <div key={type} className="flex flex-col">
                      <div 
                        onClick={() => toggleExpand(type)}
                        className="flex items-center justify-between px-8 py-5 bg-white/[0.01] hover:bg-white/[0.02] cursor-pointer group transition-all"
                      >
                        <div className="flex items-center space-x-4">
                          {isExpanded ? <BsChevronDown size={14} className="text-teal-400" /> : <BsChevronRight size={14} className="text-gray-600" />}
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-white uppercase tracking-wider">{type}</span>
                            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">Top-Level Pillar</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-gray-400">{formatCurrency(getPillarBalance(type).net)}</span>
                        </div>
                      </div>

                      {isExpanded && Object.entries(subAccounts).map(([subAcc, labels]) => (
                        <div key={subAcc} className="flex flex-col bg-white/[0.005]">
                          <div className="flex items-center px-14 py-3 border-b border-white/[0.02] bg-white/[0.01]">
                            <BsHash className="text-gray-600 mr-2" size={14} />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{subAcc}</span>
                          </div>
                          
                          <div className="divide-y divide-white/[0.01]">
                            {labels.map(label => (
                              <div key={label.id} className="flex items-center justify-between px-16 py-4 hover:bg-white/[0.03] group transition-all">
                                <div className="flex items-center space-x-4">
                                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-teal-400 group-hover:border-teal-500/30 transition-all">
                                    <BsJournalText size={14} />
                                  </div>
                                  <span className="text-sm font-bold text-gray-200">{label.name}</span>
                                </div>
                                <div className="flex items-center space-x-8">
                                  <div className="text-right">
                                    <p className={`text-sm font-bold ${getLabelBalance(label).net < 0 ? "text-red-400" : "text-gray-200"}`}>
                                      {formatCurrency(getLabelBalance(label).net)}
                                    </p>
                                  </div>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setIsTransactionModalOpen(true); }}
                                    className="p-2 rounded-xl bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-black transition-all shadow-lg"
                                  >
                                    <BsPlusLg size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Container: Recent Activity */}
        <div className="flex-[2] bg-white/[0.01] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
          <div className="bg-white/[0.02] border-b border-white/5 px-8 py-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BsStars className="text-teal-400" />
              <span className="text-xs font-black text-white uppercase tracking-widest">Recent Activity</span>
            </div>
            <button className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors">VIEW ALL</button>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar p-2">
            <TransactionList />
          </div>
        </div>

      </div>

      <TransactionModal 
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        workbenchId={workbenchId}
        onSuccess={refreshContext}
      />

      <LabelModal 
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        workbenchId={workbenchId}
        onSuccess={refreshContext}
      />
    </div>
  );
}

function TransactionList() {
  const { transactions, loading } = useWorkbench();

  if (loading) return (
    <div className="p-8 flex justify-center">
      <div className="w-6 h-6 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <table className="w-full text-left border-collapse">
      <thead className="bg-white/[0.02] sticky top-0 z-10">
        <tr className="border-b border-white/5">
          <th className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">Date & Trade Context</th>
          <th className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-widest text-right">Volume (INR)</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/[0.02]">
        {transactions.map(tx => {
          // Identify source and destination entries
          const sourceEntry = tx.entries.find(e => e.amount < 0);
          const destEntry = tx.entries.find(e => e.amount > 0);

          return (
            <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors group">
              <td className="px-6 py-5">
                <div className="flex items-start space-x-6">
                  <div className="flex flex-col items-center space-y-1 mt-1">
                    <span className="text-[10px] font-mono text-gray-600 uppercase">{new Date(tx.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>
                    <div className="w-px h-12 bg-white/5" />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-300 group-hover:text-teal-400 transition-colors">{tx.description}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Source Side */}
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Source</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg">
                            {sourceEntry?.labels?.name || "Unlabeled"}
                          </span>
                          {tx.source && (
                            <span className="text-[9px] text-gray-500 font-bold">
                              {tx.source.party} <span className="opacity-40 ml-0.5">&gt;</span> {tx.source.entity}
                            </span>
                          )}
                        </div>
                      </div>

                      <BsArrowRight className="text-gray-700 mt-4" size={12} />

                      {/* Destination Side */}
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Destination</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] px-2 py-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-lg">
                            {destEntry?.labels?.name || "Unlabeled"}
                          </span>
                          {tx.destination && (
                            <span className="text-[9px] text-gray-500 font-bold">
                              {tx.destination.party} <span className="opacity-40 ml-0.5">&gt;</span> {tx.destination.entity}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 text-right align-top">
                <span className="text-sm font-black text-white tracking-tight">₹{Math.abs(sourceEntry?.amount || 0).toLocaleString()}</span>
              </td>
            </tr>
          );
        })}
        {transactions.length === 0 && (
          <tr>
            <td colSpan="2" className="px-6 py-16 text-center">
              <div className="flex flex-col items-center space-y-2 opacity-30">
                <BsJournalText size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest">No activity in this workbench</p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
