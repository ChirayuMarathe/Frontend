import React, { useState } from "react";
import { BsX, BsEnvelope, BsShieldLock, BsClipboard, BsCheck2, BsPeople, BsPersonPlus } from "react-icons/bs";

import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

export default function InviteMemberModal({ isOpen, onClose, workbenchId }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [inviteToken, setInviteToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setLoading(true);
      const token = crypto.randomUUID();
      const { data, error } = await supabase
        .from('workbench_invites')
        .insert({
          workbench_id: workbenchId,
          email,
          role,
          token,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      setInviteToken(token);
      toast.success("Invitation generated!");
    } catch (err) {
      console.error(err);
      toast.error("Invitation failed");
    } finally {
      setLoading(false);
    }
  };

  const inviteUrl = `${window.location.origin}/invite/${inviteToken}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success("Invite link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-[#0d1117] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden p-8"
      >
        <div className="flex justify-between items-center mb-8">
           <div>
              <h3 className="text-xl font-bold text-white">Invite Team Member</h3>
              <p className="text-xs text-gray-500 mt-1">Grant access to this specific workbench.</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500">
              <BsX size={24} />
           </button>
        </div>

        {!inviteToken ? (
          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Email Address</label>
                <div className="relative">
                   <BsEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                   <input 
                     type="email"
                     placeholder="colleague@company.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                   />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Role & Permissions</label>
                <div className="grid grid-cols-2 gap-3">
                   {['viewer', 'editor'].map(r => (
                     <button
                       key={r}
                       onClick={() => setRole(r)}
                       className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                         role === r 
                           ? "bg-primary/10 border-primary text-primary" 
                           : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20"
                       }`}
                     >
                       {r}
                     </button>
                   ))}
                </div>
             </div>

             <button 
               onClick={handleInvite}
               disabled={loading}
               className="w-full py-4 bg-primary text-black rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
             >
               {loading ? "Generating..." : <><BsPersonPlus /> Generate Invite Link</>}
             </button>
          </div>
        ) : (
          <div className="space-y-6">
             <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                   <BsPeople size={24} />
                </div>
                <h4 className="text-white font-bold mb-1">Invitation Ready</h4>
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Share this link with <b>{email}</b>. They will be added as a <b>{role}</b>.</p>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Shareable Link</label>
                <div className="flex gap-2">
                   <input 
                     readOnly
                     value={inviteUrl}
                     className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl py-3 px-4 text-xs text-gray-400 focus:outline-none"
                   />
                   <button 
                     onClick={copyToClipboard}
                     className="px-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all"
                   >
                     {copied ? <BsCheck2 /> : <BsClipboard />}
                   </button>
                </div>
             </div>

             <button 
               onClick={onClose}
               className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-gray-400 transition-all"
             >
               Done
             </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
