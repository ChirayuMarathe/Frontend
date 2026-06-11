import React, { useState, useEffect } from "react";
import { 
  BsSearch, 
  BsFilter, 
  BsChevronRight,
  BsFileEarmarkText,
  BsChatLeftText,
  BsShieldCheck,
  BsPieChart,
  BsLightningCharge,
  BsReceipt,
  BsArrowLeftRight,
  BsPlusLg,
  BsUpload,
  BsClockHistory,
  BsHammer,
  BsBuilding,
  BsInfoCircle
} from "react-icons/bs";
import Card from "../shared/Card";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import AdjustmentModal from "./AdjustmentModal";

const TYPE_CONFIG = {
  transaction: {
    icon: BsReceipt,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    label: "Transaction"
  },
  document: {
    icon: BsUpload,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    label: "Document"
  },
  chat: {
    icon: BsChatLeftText,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    label: "Chat"
  },
  compliance: {
    icon: BsShieldCheck,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    label: "Compliance"
  },
  budget: {
    icon: BsPieChart,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    label: "Budget"
  },
  adjustment: {
    icon: BsArrowLeftRight,
    color: "text-rose-400",
    bgColor: "bg-rose-400/10",
    label: "Adjustment"
  },
  party: {
    icon: BsBuilding,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    label: "Party"
  }
};

const TABS = [
  { id: "all", label: "All Records" },
  { id: "transaction", label: "Transactions" },
  { id: "compliance", label: "Compliance" },
  { id: "budget", label: "Budget" },
  { id: "chat", label: "Chat" },
  { id: "document", label: "Documents" }
];

export default function LogsView({ workbenchId }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRecordId, setExpandedRecordId] = useState(null);
  
  // Adjustment State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  useEffect(() => {
    if (workbenchId) {
      fetchRecords();
    }

    // Listen for refresh events
    const handleUpdate = () => {
      fetchRecords();
    };

    window.addEventListener('refresh-workbench-data', handleUpdate);
    return () => window.removeEventListener('refresh-workbench-data', handleUpdate);
  }, [workbenchId]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("workbench_records")
        .select("*")
        .eq("workbench_id", workbenchId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error("Error fetching records:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesTab = activeTab === "all" || record.record_type === activeTab;
    const matchesSearch = 
      record.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + " · " + date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
  };

  return (
    <div className="p-8 space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Logs & Records</h2>
          <p className="text-gray-500 text-sm">Every action is a record — unified audit trail</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-black shadow-lg shadow-primary/20"
                  : "bg-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10"
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="bg-black/10 px-1.5 py-0.5 rounded text-[10px]">
                    {filteredRecords.length}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>

        <div className="relative group">
          <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all w-full md:w-64"
          />
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading audit trail...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-full bg-white/5 mb-4">
              <BsClockHistory className="text-3xl text-gray-600" />
            </div>
            <h3 className="text-white font-bold mb-2">No records found</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              We couldn't find any records matching your filters.
            </p>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const config = TYPE_CONFIG[record.record_type] || TYPE_CONFIG.transaction;
            const Icon = config.icon;
            const isExpanded = expandedRecordId === record.id;
            
            return (
              <Card 
                key={record.id} 
                variant="dark" 
                className={`group border-white/5 hover:border-white/10 transition-all bg-[#0d0d0d]/50 ${isExpanded ? 'ring-1 ring-primary/30 border-primary/20' : ''}`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center justify-between p-4">
                    <div 
                      className="flex items-center space-x-4 flex-1 min-w-0 cursor-pointer"
                      onClick={() => setExpandedRecordId(isExpanded ? null : record.id)}
                    >
                      <div className={`p-3 rounded-xl ${config.bgColor} ${config.color} shrink-0`}>
                        <Icon className="text-xl" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="text-white font-bold truncate">
                            {record.summary}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${config.bgColor} ${config.color} border border-white/5`}>
                            {config.label}
                          </span>
                        </div>
                        <div className="flex items-center text-[11px] text-gray-500 font-medium space-x-3">
                          <span className="flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-1.5" />
                            {formatDate(record.created_at)}
                          </span>
                          <span>•</span>
                          <span>ID: {record.id.slice(0, 8)}</span>
                          <span>•</span>
                          <span>By: {record.metadata?.user || "System"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {(record.record_type === 'transaction' || record.record_type === 'compliance' || record.record_type === 'party') && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(record);
                            setIsAdjustmentModalOpen(true);
                          }}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-black transition-all text-[10px] font-black uppercase tracking-widest border border-rose-500/20"
                        >
                          <BsHammer className="text-xs" />
                          <span>Adjust</span>
                        </button>
                      )}
                      <button 
                        onClick={() => setExpandedRecordId(isExpanded ? null : record.id)}
                        className={`p-2 text-gray-600 hover:text-white transition-all transform ${isExpanded ? 'rotate-90 text-primary' : ''}`}
                      >
                        <BsChevronRight className="text-lg" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-6 pt-2 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Core Data Card */}
                        <div className="lg:col-span-1 space-y-4">
                          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center">
                              <BsInfoCircle className="mr-2" />
                              Primary Data
                            </h4>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Type</span>
                                <span className="text-xs text-white capitalize">{record.record_type}</span>
                              </div>
                              
                              <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Status</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                                  record.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                }`}>
                                  {record.status || 'draft'}
                                </span>
                              </div>

                              {/* Amount Display with Fallback */}
                              {(record.net_amount !== null || record.gross_amount !== null || record.metadata?.amount || record.metadata?.adjustment_amount) && (
                                <div className="pt-2">
                                  <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Financial Impact</span>
                                  <div className="flex items-baseline space-x-2">
                                    <span className="text-2xl font-black text-white font-mono">
                                      ₹{(
                                        record.net_amount || 
                                        record.gross_amount || 
                                        parseFloat(record.metadata?.amount) || 
                                        parseFloat(record.metadata?.adjustment_amount) || 
                                        0
                                      ).toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">INR</span>
                                  </div>
                                  {record.tax_amount > 0 && (
                                    <p className="text-[9px] text-gray-500 mt-1">Incl. ₹{record.tax_amount.toLocaleString()} tax</p>
                                  )}
                                </div>
                              )}

                              {record.issue_date && (
                                <div className="flex justify-between items-center pt-2">
                                  <span className="text-[10px] text-gray-500 uppercase font-bold">Issue Date</span>
                                  <span className="text-xs text-gray-300">{new Date(record.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                              )}
                              
                              {record.due_date && (
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-gray-500 uppercase font-bold">Due Date</span>
                                  <span className={`text-xs ${new Date(record.due_date) < new Date() ? 'text-rose-400' : 'text-gray-300'}`}>
                                    {new Date(record.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Context & Metadata Card */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Context & Raw Data</h4>
                            <div className="max-h-[300px] overflow-y-auto scrollbar-hide pr-2">
                              {record.metadata && Object.keys(record.metadata).length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                  {Object.entries(record.metadata).map(([key, value]) => {
                                    if (key === 'user') return null;
                                    
                                    const isLongValue = typeof value === 'string' && value.length > 40;
                                    const isObject = typeof value === 'object' && value !== null;

                                    return (
                                      <div key={key} className={`flex flex-col border-b border-white/[0.03] pb-2 last:border-0 ${isLongValue || isObject ? 'md:col-span-2' : ''}`}>
                                        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider mb-1">{key.replace(/_/g, ' ')}</span>
                                        <div className="text-xs text-gray-300 break-words leading-relaxed">
                                          {isObject ? (
                                            <pre className="mt-2 p-3 bg-black/50 rounded-lg text-[10px] font-mono border border-white/[0.05] overflow-x-auto">
                                              {JSON.stringify(value, null, 2)}
                                            </pre>
                                          ) : (
                                            <span className={isLongValue ? "text-gray-400" : "font-medium"}>
                                              {String(value || '—')}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-12 opacity-20">
                                  <BsFileEarmarkText className="text-3xl mb-3" />
                                  <p className="text-[10px] uppercase font-black tracking-[0.2em]">No Metadata Records</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      <AdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => {
          setIsAdjustmentModalOpen(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        workbenchId={workbenchId}
        onSuccess={fetchRecords}
      />
    </div>
  );
}
