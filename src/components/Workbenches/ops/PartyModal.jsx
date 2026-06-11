import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BsX, 
  BsBuilding, 
  BsPerson, 
  BsBank, 
  BsCashStack, 
  BsShieldCheck,
  BsPersonBadge,
  BsEnvelope,
  BsPhone,
  BsArrowRight,
  BsPlusLg
} from "react-icons/bs";
import { toast } from "react-hot-toast";
import { supabase } from "../../../lib/supabase";

export default function PartyModal({ isOpen, onClose, workbenchId, onSuccess, initialMode = "party", initialParty = null }) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(initialMode); // "party" or "entity"
  const [selectedParty, setSelectedParty] = useState(initialParty);

  // Sync with props when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSelectedParty(initialParty);
    }
  }, [isOpen, initialMode, initialParty]);
  
  const [partyData, setPartyData] = useState({
    name: "",
    category: "individual",
    email: "",
    phone: ""
  });

  const [entityData, setEntityData] = useState({
    name: "",
    type: "bank",
    metadata: {
      account_no: "",
      ifsc: "",
      bank_name: "",
      upi_id: ""
    }
  });

  const categories = [
    { id: "individual", name: "Individual", icon: BsPerson, color: "teal", desc: "Private Person" },
    { id: "corporation", name: "Corporation", icon: BsBuilding, color: "blue", desc: "Legal Body" },
    { id: "group", name: "Group", icon: BsPersonBadge, color: "purple", desc: "Collective" }
  ];

  const entityTypes = [
    { id: "bank", name: "Bank Transfer", icon: BsBank, color: "teal", desc: "Bank Account Details" },
    { id: "upi", name: "UPI / QR", icon: BsArrowRight, color: "purple", desc: "VPA / PhonePe / GPay" },
    { id: "cash", name: "Cash", icon: BsCashStack, color: "orange", desc: "Physical Currency" },
    { id: "property", name: "Property", icon: BsBuilding, color: "rose", desc: "Real Estate/Office" }
  ];

  const handlePartySubmit = async (e) => {
    e.preventDefault();
    if (!partyData.name) return toast.error("Name is required");

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('parties')
        .insert({
          workbench_id: workbenchId,
          ...partyData
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Party created successfully");
      setSelectedParty(data);
      setMode("entity");
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEntitySubmit = async (e) => {
    e.preventDefault();
    if (!entityData.name) return toast.error("Entity name is required");

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('entities')
        .insert({
          party_id: selectedParty.id,
          ...entityData
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Vessel linked successfully");
      onSuccess();
      onClose();
      setMode("party");
      setPartyData({ name: "", category: "individual", email: "", phone: "" });
      setEntityData({ name: "", type: "bank", metadata: { account_no: "", ifsc: "", bank_name: "", upi_id: "" } });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    setMode("party");
    setSelectedParty(null);
    setPartyData({ name: "", category: "individual", email: "", phone: "" });
    setEntityData({ name: "", type: "bank", metadata: { account_no: "", ifsc: "", bank_name: "", upi_id: "" } });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
            className="relative w-full max-w-xl bg-[#0d0d0d] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                  {mode === "party" ? <BsPerson size={20} /> : <BsPlusLg size={20} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {mode === "party" ? "Create New Party" : `Add Vessel to ${selectedParty?.name}`}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {mode === "party" ? "Identify the individual or group" : "Link a payment or legal vessel"}
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-xl text-gray-400 transition-all">
                <BsX size={24} />
              </button>
            </div>

            {mode === "party" ? (
              <form onSubmit={handlePartySubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {categories.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setPartyData({ ...partyData, category: c.id })}
                      className={`flex flex-col items-center p-4 rounded-2xl border transition-all space-y-2 ${
                        partyData.category === c.id 
                          ? `bg-${c.color}-500/10 border-${c.color}-500/50 text-${c.color}-400` 
                          : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10"
                      }`}
                    >
                      <c.icon size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{c.name}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Party Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Rahul Landlord or Medhansh"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-all"
                    value={partyData.name}
                    onChange={(e) => setPartyData({ ...partyData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1 flex items-center">
                      <BsEnvelope className="mr-2 opacity-50" /> Email
                    </label>
                    <input 
                      type="email"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-all"
                      value={partyData.email}
                      onChange={(e) => setPartyData({ ...partyData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1 flex items-center">
                      <BsPhone className="mr-2 opacity-50" /> Phone
                    </label>
                    <input 
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-all"
                      value={partyData.phone}
                      onChange={(e) => setPartyData({ ...partyData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Next: Add Vessel"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleEntitySubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-3">
                  {entityTypes.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setEntityData({ ...entityData, type: t.id })}
                      className={`flex flex-col items-center p-4 rounded-2xl border transition-all space-y-2 ${
                        entityData.type === t.id 
                          ? `bg-${t.color}-500/10 border-${t.color}-500/50 text-${t.color}-400` 
                          : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10"
                      }`}
                    >
                      <t.icon size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{t.name}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Vessel Label</label>
                  <input 
                    type="text"
                    placeholder="e.g. Personal Bank A/c or Office No. 402"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-all"
                    value={entityData.name}
                    onChange={(e) => setEntityData({ ...entityData, name: e.target.value })}
                  />
                </div>

                {entityData.type === "bank" && (
                  <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/10 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-teal-500/50 uppercase tracking-widest px-1">Account No</label>
                        <input 
                          type="text"
                          className="w-full bg-black/20 border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
                          value={entityData.metadata.account_no}
                          onChange={(e) => setEntityData({ ...entityData, metadata: { ...entityData.metadata, account_no: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-teal-500/50 uppercase tracking-widest px-1">IFSC Code</label>
                        <input 
                          type="text"
                          className="w-full bg-black/20 border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
                          value={entityData.metadata.ifsc}
                          onChange={(e) => setEntityData({ ...entityData, metadata: { ...entityData.metadata, ifsc: e.target.value } })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-teal-500/50 uppercase tracking-widest px-1">Bank Name</label>
                      <input 
                        type="text"
                        className="w-full bg-black/20 border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
                        value={entityData.metadata.bank_name}
                        onChange={(e) => setEntityData({ ...entityData, metadata: { ...entityData.metadata, bank_name: e.target.value } })}
                      />
                    </div>
                  </div>
                )}

                {entityData.type === "upi" && (
                  <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 space-y-2">
                    <label className="text-[9px] font-black text-purple-500/50 uppercase tracking-widest px-1">VPA / UPI ID</label>
                    <input 
                      type="text"
                      placeholder="username@bank"
                      className="w-full bg-black/20 border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
                      value={entityData.metadata.upi_id}
                      onChange={(e) => setEntityData({ ...entityData, metadata: { ...entityData.metadata, upi_id: e.target.value } })}
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => setMode("party")}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-4 bg-teal-500 hover:bg-teal-400 text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
                  >
                    {loading ? "Linking..." : "Save Vessel"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
