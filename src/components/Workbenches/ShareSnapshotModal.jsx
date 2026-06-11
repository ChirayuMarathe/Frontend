import React, { useState } from "react";
import { BsX, BsLink45Deg, BsShieldLock, BsClipboard, BsCheck2 } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

export default function ShareSnapshotModal({ isOpen, onClose, workbenchId }) {
  const [password, setPassword] = useState("");
  const [shareId, setShareId] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!password) {
      toast.error("Please set a password first");
      return;
    }

    try {
      setLoading(true);
      const newShareId = crypto.randomUUID();
      const { data, error } = await supabase
        .from('shared_snapshots')
        .insert({
          workbench_id: workbenchId,
          share_id: newShareId,
          password_hash: password, // In production, hash this server-side
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      setShareId(newShareId);
      toast.success("Private link generated!");
    } catch (err) {
      console.error(err);
      toast.error("Sharing failed");
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = `${window.location.origin}/share/${shareId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
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
              <h3 className="text-xl font-bold text-white">Share Snapshot</h3>
              <p className="text-xs text-gray-500 mt-1">Generate a private, password-protected link.</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500">
              <BsX size={24} />
           </button>
        </div>

        {!shareId ? (
          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Set Access Password</label>
                <div className="relative">
                   <BsShieldLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                   <input 
                     type="password"
                     placeholder="Enter a secure password..."
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                   />
                </div>
             </div>

             <button 
               onClick={handleGenerate}
               disabled={loading}
               className="w-full py-4 bg-primary text-black rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50"
             >
               {loading ? "Generating..." : "Generate Private Link"}
             </button>
          </div>
        ) : (
          <div className="space-y-6">
             <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl text-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-4">
                   <BsLink45Deg size={24} />
                </div>
                <h4 className="text-white font-bold mb-1">Link is Live</h4>
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">This link is now active and protected by your password.</p>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Shareable URL</label>
                <div className="flex gap-2">
                   <input 
                     readOnly
                     value={shareUrl}
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

             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Password</span>
                   <span className="text-xs font-mono text-white">••••••••</span>
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
