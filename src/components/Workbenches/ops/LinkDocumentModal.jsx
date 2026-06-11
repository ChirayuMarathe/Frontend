import React, { useState, useEffect } from "react";
import { 
  BsX, 
  BsSearch, 
  BsLink45Deg, 
  BsFileEarmarkPdf, 
  BsFileEarmarkText,
  BsCheckCircleFill,
  BsPlusLg,
  BsArrowRight
} from "react-icons/bs";
import { backendService } from "../../../services/backendService";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function LinkDocumentModal({ isOpen, onClose, document, workbenchId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
    }
  }, [isOpen]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await backendService.listTransactions(workbenchId);
      setTransactions(data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!selectedTx) return;
    try {
      setLoading(true);
      await backendService.linkDocumentToTransaction(document.id, selectedTx.id);
      toast.success("Document linked to transaction!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Linking failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.labels.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0E1117] border border-white/10 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400">
              <BsLink45Deg size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Link to Transaction</h3>
              <p className="text-xs text-gray-500 mt-1">Map <span className="text-teal-400 font-bold">{document?.filename}</span> to a ledger entry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
            <BsX size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 pb-2">
          <div className="relative group">
            <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors" />
            <input 
              type="text"
              placeholder="Search by description or label..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
          {loading && transactions.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Fetching Ledger...</p>
             </div>
          ) : filteredTransactions.length === 0 ? (
             <div className="text-center py-12 opacity-30">
                <BsFileEarmarkText size={48} className="mx-auto mb-4" />
                <p className="text-sm font-medium">No matching transactions found</p>
             </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div 
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                  selectedTx?.id === tx.id 
                    ? "bg-teal-500/10 border-teal-500/30" 
                    : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-xl ${selectedTx?.id === tx.id ? "bg-teal-500 text-black" : "bg-white/5 text-gray-400"} transition-all`}>
                       <BsArrowRight size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">{tx.description}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] text-gray-500 font-medium">{new Date(tx.date).toLocaleDateString()}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-700" />
                        <div className="flex items-center space-x-1">
                          {tx.labels.map((l, i) => (
                            <span key={i} className="text-[9px] font-black text-teal-500/80 uppercase tracking-tighter bg-teal-500/5 px-1.5 py-0.5 rounded">
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white">₹{Number(tx.amount).toLocaleString()}</p>
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">Total</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest max-w-[200px]">
            {selectedTx ? `Linking to ${selectedTx.description}` : "Select a transaction to proceed"}
          </p>
          <div className="flex space-x-3">
             <button 
               onClick={onClose}
               className="px-6 py-3 rounded-xl text-xs font-bold text-gray-500 hover:text-white transition-colors"
             >
               Cancel
             </button>
             <button 
               onClick={handleLink}
               disabled={!selectedTx || loading}
               className="px-8 py-3 bg-[#81E6D9] text-black rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-teal-500/10 disabled:opacity-50"
             >
               Confirm Link
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
