import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsX, BsArrowRight, BsJournalText, BsCashStack, BsArrowRepeat } from "react-icons/bs";
import { toast } from "react-hot-toast";
import ProofUploader from "../shared/ProofUploader";
import { backendService } from "../../../services/backendService";
import { supabase } from "../../../lib/supabase";

export default function TransactionModal({ isOpen, onClose, workbenchId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [labels, setLabels] = useState([]);
  const [parties, setParties] = useState([]);
  const [formData, setFormData] = useState({
    from_label_id: "",
    to_label_id: "",
    amount: "",
    description: "",
    transaction_date: new Date().toISOString().split("T")[0],
    source_party_id: "",
    source_entity_id: "",
    destination_party_id: "",
    destination_entity_id: "",
  });

  useEffect(() => {
    if (isOpen && workbenchId) {
      fetchLabels();
      fetchParties();
    }
  }, [isOpen, workbenchId]);

  const fetchLabels = async () => {
    try {
      const { data, error } = await supabase.from('labels').select('*').eq('workbench_id', workbenchId);
      if (error) throw error;
      setLabels(data || []);
    } catch (err) {
      console.error("Error fetching labels:", err);
    }
  };

  const fetchParties = async () => {
    try {
      const { data, error } = await supabase.from('parties').select('*, entities(*)').eq('workbench_id', workbenchId);
      if (error) throw error;
      setParties(data || []);
    } catch (err) {
      console.error("Error fetching parties:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.from_label_id || !formData.to_label_id || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const txPayload = {
        workbench_id: workbenchId,
        ...formData,
        amount: parseFloat(formData.amount),
        source_party_id: formData.source_party_id || null,
        source_entity_id: formData.source_entity_id || null,
        destination_party_id: formData.destination_party_id || null,
        destination_entity_id: formData.destination_entity_id || null,
      };

      const { data: result, error: txError } = await supabase
        .from('ledger_transactions')
        .insert(txPayload)
        .select()
        .single();

      if (txError) {
        console.error("Supabase Error:", txError);
        throw new Error(txError.message || "Failed to record transaction");
      }
      
      // 2. If there's a proof file, upload it
      if (proofFile && result.transaction?.id) {
        toast.loading("Uploading proof document...", { id: "upload-proof" });
        try {
          await backendService.uploadDocument(
            workbenchId, 
            proofFile, 
            'expense', // Default type for general transactions
            result.transaction.id
          );
          toast.success("Proof document linked!", { id: "upload-proof" });
        } catch (uploadErr) {
          console.error("Proof upload failed:", uploadErr);
          toast.error("Trade recorded, but proof upload failed", { id: "upload-proof" });
        }
      }

      toast.success("Trade recorded successfully");
      onSuccess?.();
      onClose();
      setFormData({
        from_label_id: "",
        to_label_id: "",
        amount: "",
        description: "",
        transaction_date: new Date().toISOString().split("T")[0],
        source_party_id: "",
        source_entity_id: "",
        destination_party_id: "",
        destination_entity_id: "",
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEntities = (partyId) => {
    const party = parties.find(p => p.id === partyId);
    return party?.entities || [];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <BsArrowRepeat size={20} className="animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Record Trade</h3>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Counterparty Ledger System</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 transition-all">
                <BsX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                {/* Visual Connector */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black border border-white/10 z-10 items-center justify-center text-teal-400 shadow-xl">
                  <BsArrowRight size={20} />
                </div>

                {/* Source Side */}
                <div className="space-y-4 p-5 rounded-3xl bg-white/[0.02] border border-white/5">
                  <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1 mb-2">Side A (Source)</h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter ml-1">COA Account</label>
                      <select
                        required
                        value={formData.from_label_id}
                        onChange={(e) => setFormData({ ...formData, from_label_id: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-teal-500/50 appearance-none"
                      >
                        <option value="" disabled>Select Label</option>
                        {labels.map(l => <option key={l.id} value={l.id} className="bg-black">{l.name}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter ml-1">Party</label>
                        <select
                          value={formData.source_party_id}
                          onChange={(e) => setFormData({ ...formData, source_party_id: e.target.value, source_entity_id: "" })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-[11px] text-gray-300 focus:border-teal-500/50 appearance-none"
                        >
                          <option value="">N/A</option>
                          {parties.map(p => (
                            <option key={p.id} value={p.id} className="bg-black">
                              {p.name} {p.is_self ? "(Self)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter ml-1">Entity</label>
                        <select
                          disabled={!formData.source_party_id}
                          value={formData.source_entity_id}
                          onChange={(e) => setFormData({ ...formData, source_entity_id: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-[11px] text-gray-300 focus:border-teal-500/50 appearance-none disabled:opacity-30"
                        >
                          <option value="">Select Vessel</option>
                          {getEntities(formData.source_party_id).map(e => <option key={e.id} value={e.id} className="bg-black">{e.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Destination Side */}
                <div className="space-y-4 p-5 rounded-3xl bg-white/[0.02] border border-white/5">
                  <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1 mb-2">Side B (Destination)</h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter ml-1">COA Account</label>
                      <select
                        required
                        value={formData.to_label_id}
                        onChange={(e) => setFormData({ ...formData, to_label_id: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-teal-500/50 appearance-none"
                      >
                        <option value="" disabled>Select Label</option>
                        {labels.map(l => <option key={l.id} value={l.id} className="bg-black">{l.name}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter ml-1">Party</label>
                        <select
                          value={formData.destination_party_id}
                          onChange={(e) => setFormData({ ...formData, destination_party_id: e.target.value, destination_entity_id: "" })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-[11px] text-gray-300 focus:border-teal-500/50 appearance-none"
                        >
                          <option value="">N/A</option>
                          {parties.map(p => (
                            <option key={p.id} value={p.id} className="bg-black">
                              {p.name} {p.is_self ? "(Self)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter ml-1">Entity</label>
                        <select
                          disabled={!formData.destination_party_id}
                          value={formData.destination_entity_id}
                          onChange={(e) => setFormData({ ...formData, destination_entity_id: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-[11px] text-gray-300 focus:border-teal-500/50 appearance-none disabled:opacity-30"
                        >
                          <option value="">Select Vessel</option>
                          {getEntities(formData.destination_party_id).map(e => <option key={e.id} value={e.id} className="bg-black">{e.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Amount (₹)</label>
                  <div className="relative">
                    <BsCashStack className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500" />
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-white focus:border-teal-500/50 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Transaction Date</label>
                  <input
                    type="date"
                    required
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white focus:border-teal-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Memo / Description</label>
                <div className="relative">
                  <BsJournalText className="absolute left-4 top-4 text-gray-600" />
                  <textarea
                    rows="2"
                    required
                    placeholder="Describe the nature of this trade..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-sm text-white focus:border-teal-500/50 transition-all resize-none"
                  />
                </div>
              </div>
            
              <div className="pt-2">
                <ProofUploader 
                  selectedFile={proofFile} 
                  onFileSelect={setProofFile} 
                  label="Transaction Proof (Screenshot/Bill/Invoice)" 
                />
              </div>

              <div className="pt-2 flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-8 py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-white/5 transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] px-8 py-4 bg-teal-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/20 disabled:opacity-50"
                >
                  {loading ? "Recording Trade..." : "Authorize Transaction"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
