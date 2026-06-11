import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsX, BsTag, BsGrid } from "react-icons/bs";
import { toast } from "react-hot-toast";
import { supabase } from "../../../lib/supabase";

export default function LabelModal({ isOpen, onClose, workbenchId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [masterAccounts, setMasterAccounts] = useState([]);
  const [masterSubAccounts, setMasterSubAccounts] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    master_sub_account_id: "",
    description: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchLookups();
    }
  }, [isOpen]);

  const fetchLookups = async () => {
    try {
      setLoadingLookups(true);
      const [accsRes, subsRes] = await Promise.all([
        supabase.from('master_accounts').select('*'),
        supabase.from('master_sub_accounts').select('*')
      ]);
      if (accsRes.error || subsRes.error) throw new Error("Failed to fetch account definitions");
      
      const accs = accsRes.data || [];
      const subs = subsRes.data || [];
      
      setMasterAccounts(accs);
      setMasterSubAccounts(subs);
      
      // Select the first sub-account of the default type (expense)
      const nameMap = {
        asset: "ASSETS",
        liability: "LIABILITIES",
        equity: "EQUITY",
        revenue: "REVENUE",
        expense: "EXPENSES"
      };
      const expenseAcc = accs.find(acc => acc.account_name.toUpperCase() === nameMap["expense"]);
      if (expenseAcc) {
        const firstSub = subs.find(sub => sub.master_account_id === expenseAcc.id);
        if (firstSub) {
          setFormData(prev => ({
            ...prev,
            master_sub_account_id: firstSub.id
          }));
        }
      }
    } catch (err) {
      console.error("Error loading account groups:", err);
      toast.error("Failed to load Chart of Account groups");
    } finally {
      setLoadingLookups(false);
    }
  };

  const nameMap = {
    asset: "ASSETS",
    liability: "LIABILITIES",
    equity: "EQUITY",
    revenue: "REVENUE",
    expense: "EXPENSES"
  };

  const getMasterAccountByType = (type) => {
    const targetName = nameMap[type];
    return masterAccounts.find(acc => acc.account_name.toUpperCase() === targetName);
  };

  const selectedMasterAcc = getMasterAccountByType(formData.type);
  const filteredSubAccounts = selectedMasterAcc 
    ? masterSubAccounts.filter(sub => sub.master_account_id === selectedMasterAcc.id)
    : [];

  const types = ["asset", "liability", "equity", "revenue", "expense"];

  const handleTypeChange = (type) => {
    const targetAcc = getMasterAccountByType(type);
    const firstSub = targetAcc 
      ? masterSubAccounts.find(sub => sub.master_account_id === targetAcc.id)
      : null;
      
    setFormData({ 
      ...formData, 
      type, 
      master_sub_account_id: firstSub ? firstSub.id : ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedMasterAcc = getMasterAccountByType(formData.type);

    if (!formData.name || !formData.master_sub_account_id || !selectedMasterAcc) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('labels')
        .insert({
          workbench_id: workbenchId,
          master_account_id: selectedMasterAcc.id,
          master_sub_account_id: formData.master_sub_account_id,
          name: formData.name,
          description: formData.description || "",
          type: formData.type,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message || "Failed to create label");
      }

      toast.success("Ledger account created successfully");
      onSuccess?.();
      onClose();
      // Reset name and description
      setFormData(prev => ({
        ...prev,
        name: "",
        description: "",
      }));
    } catch (err) {
      console.error("Error creating label:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#0d1117] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <BsTag size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Create Category</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">New Financial Label</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 transition-all">
                <BsX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Label Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Label Name</label>
                <div className="relative">
                  <BsTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rent, HDFC Bank, Service Revenue"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white transition-all"
                  />
                </div>
              </div>

              {/* Account Type (Pillar) */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Account Pillar</label>
                <div className="grid grid-cols-5 gap-2">
                  {types.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTypeChange(t)}
                      className={`px-2 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider border transition-all ${
                        formData.type === t
                          ? "bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-lg shadow-blue-500/5"
                          : "bg-white/5 border-white/5 text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-Account Tags */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Sub-Account Group</label>
                <div className="flex flex-wrap gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-2xl min-h-[100px]">
                  {loadingLookups ? (
                    <div className="w-full flex items-center justify-center py-4">
                      <div className="w-5 h-5 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                    </div>
                  ) : filteredSubAccounts.length === 0 ? (
                    <span className="text-xs text-gray-600 font-bold m-auto">No groups found under this pillar</span>
                  ) : (
                    filteredSubAccounts.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, master_sub_account_id: sub.id })}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                          formData.master_sub_account_id === sub.id
                            ? "bg-teal-500/10 border-teal-500/30 text-teal-400 shadow-lg"
                            : "bg-white/5 border-white/5 text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        {sub.sub_account_name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Additional details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white transition-all"
                />
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-white/10 rounded-2xl text-xs font-bold text-gray-400 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || loadingLookups}
                  className="flex-[2] px-6 py-3 bg-blue-500 text-white rounded-2xl text-xs font-bold hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Category"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
