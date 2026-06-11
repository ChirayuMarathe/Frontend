import React, { useState, useEffect } from "react";
import { 
  BsGear, 
  BsPeople, 
  BsShieldCheck, 
  BsClockHistory,
  BsPersonPlus,
  BsTrash,
  BsCheck2Circle,
  BsInfoCircle
} from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import InviteMemberModal from "./InviteMemberModal";

export default function WorkbenchSettings({ workbench, workbenchId }) {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: workbench?.name || "",
    legal_name: workbench?.legal_name || "",
    pan: workbench?.pan || "",
    gstin: workbench?.gstin || "",
    industry: workbench?.industry || ""
  });

  useEffect(() => {
    if (activeTab === "members") {
      fetchMembers();
    }
  }, [activeTab, workbenchId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workbench_members')
        .select('*')
        .eq('workbench_id', workbenchId);
      
      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase
        .from('workbenches')
        .update(formData)
        .eq('id', workbenchId);
      
      if (error) throw error;
      toast.success("Settings updated");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "general", label: "Workbench Settings", icon: BsGear },
    { id: "members", label: "Org Members & Roles", icon: BsPeople },
    { id: "audit", label: "Audit Trail", icon: BsClockHistory },
  ];

  return (
    <div className="p-12 max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-gray-400 shadow-2xl">
          <BsGear size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Workbench Configuration</h2>
          <p className="text-gray-500 font-medium mt-1">Manage permissions, governance, and organizational metadata.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id 
                ? "bg-white/10 text-white shadow-lg" 
                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
            }`}
          >
            <tab.icon />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "general" && renderGeneralTab(formData, setFormData, handleUpdate, loading)}
            {activeTab === "members" && renderMembersTab(members, loading, () => setIsInviteModalOpen(true))}
            {activeTab === "audit" && renderAuditTab()}
          </motion.div>
        </AnimatePresence>
      </div>

      <InviteMemberModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workbenchId={workbenchId}
      />
    </div>
  );
}

function renderGeneralTab(formData, setFormData, handleUpdate, loading) {

  return (
    <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-8">
       <div className="space-y-6">
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Display Name</label>
             <input 
               value={formData.name}
               onChange={(e) => setFormData({...formData, name: e.target.value})}
               className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
             />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Legal Business Name</label>
             <input 
               value={formData.legal_name}
               onChange={(e) => setFormData({...formData, legal_name: e.target.value})}
               className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
             />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Industry Sector</label>
             <input 
               value={formData.industry}
               onChange={(e) => setFormData({...formData, industry: e.target.value})}
               className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
             />
          </div>
       </div>

       <div className="space-y-6">
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Tax ID (PAN)</label>
             <input 
               value={formData.pan}
               onChange={(e) => setFormData({...formData, pan: e.target.value})}
               className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
             />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">GSTIN Number</label>
             <input 
               value={formData.gstin}
               onChange={(e) => setFormData({...formData, gstin: e.target.value})}
               className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
             />
          </div>

          <div className="pt-8">
             <button 
               type="submit"
               disabled={loading}
               className="w-full py-4 bg-primary text-black rounded-2xl font-bold text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
             >
               {loading ? "Saving..." : "Update Workbench"}
             </button>
          </div>
       </div>
    </form>
  );
}

function renderMembersTab(members, loading, onInvite) {
  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
          <h4 className="text-sm font-bold text-white">Manage Team Access</h4>
          <button 
            onClick={onInvite}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all"
          >
             <BsPersonPlus />
             Invite Member
          </button>
       </div>


       <div className="bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full">
             <thead>
                <tr className="border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/[0.02]">
                   <th className="px-8 py-4 text-left">User Identifier</th>
                   <th className="px-8 py-4 text-left">Role / Privilege</th>
                   <th className="px-8 py-4 text-left">Status</th>
                   <th className="px-8 py-4 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-white/[0.02]">
                {loading ? (
                  <tr>
                     <td colSpan="4" className="px-8 py-12 text-center text-gray-500 italic">Syncing organizational tree...</td>
                  </tr>
                ) : members.map((m, i) => (
                  <tr key={i} className="hover:bg-white/[0.01] transition-all group">
                     <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400">
                              {m.user_id.slice(0, 2).toUpperCase()}
                           </div>
                           <span className="text-xs font-medium text-gray-300">{m.user_id}</span>
                        </div>
                     </td>
                     <td className="px-8 py-5">
                        <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-gray-500 uppercase tracking-widest">
                           {m.role}
                        </span>
                     </td>
                     <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-emerald-500">
                           <BsCheck2Circle size={12} />
                           <span className="text-[10px] font-bold uppercase tracking-widest">Active</span>
                        </div>
                     </td>
                     <td className="px-8 py-5 text-right">
                        <button className="p-2 text-gray-600 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                           <BsTrash />
                        </button>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
}

function renderAuditTab() {
  return (
    <div className="space-y-8">
       <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-4">
          <BsInfoCircle className="text-amber-500 mt-0.5" />
          <p className="text-[11px] text-amber-500/70 font-medium leading-relaxed">
             The Audit Trail provides a tamper-proof log of all administrative actions, ledger mutations, and security events. 
             This data is essential for financial compliance and investor due diligence.
          </p>
       </div>

       <div className="space-y-4">
          {[
            { action: "Settings Updated", user: "Admin", time: "2 hours ago", details: "Changed Legal Business Name" },
            { action: "New Transaction", user: "medhansh", time: "5 hours ago", details: "Recorded product sale of ₹50,000" },
            { action: "Member Invited", user: "Admin", time: "1 day ago", details: "Invited investor@fund.com as Viewer" },
            { action: "Ledger Stabilized", user: "System", time: "2 days ago", details: "Automated reconciliation of Asset pillar" },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 flex items-center justify-between hover:border-white/10 transition-all group">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 group-hover:text-primary transition-all">
                     <BsShieldCheck />
                  </div>
                  <div>
                     <div className="text-sm font-bold text-white">{item.action}</div>
                     <div className="text-[10px] text-gray-500 font-medium mt-0.5">{item.details}</div>
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.user}</div>
                  <div className="text-[9px] text-gray-600 font-medium mt-0.5">{item.time}</div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
}
