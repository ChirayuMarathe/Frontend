import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BsShieldLock, BsArrowRight, BsStars } from "react-icons/bs";
import InvestorView from "../components/Workbenches/InvestorView";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

export default function SharedSnapshot() {
  const { shareId } = useParams();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Validate share link and password via Supabase
      const { data: snapshot, error: snapError } = await supabase
        .from('shared_snapshots')
        .select('*')
        .eq('share_id', shareId)
        .eq('status', 'active')
        .single();

      if (snapError || !snapshot) {
        throw new Error("Invalid or expired share link");
      }

      // Simple password check (in production, use bcrypt on server)
      if (snapshot.password_hash !== password) {
        throw new Error("Incorrect password");
      }
      
      setIsAuthenticated(true);
    } catch (err) {
      console.error(err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-[24px] flex items-center justify-center text-primary border border-primary/20 mx-auto mb-6">
                 <BsShieldLock size={32} />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">Private Access</h2>
              <p className="text-gray-500 mt-2 text-sm font-medium">This financial snapshot is password protected.</p>
           </div>

           <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative group">
                 <BsShieldLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
                 <input 
                   type="password"
                   autoFocus
                   placeholder="Enter Access Password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-white/[0.03] border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white focus:outline-none focus:border-primary/50 transition-all font-medium text-lg"
                 />
              </div>

              {error && (
                <p className="text-rose-500 text-xs font-bold text-center uppercase tracking-widest">{error}</p>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-primary text-black rounded-[24px] font-black text-sm uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {loading ? "Verifying..." : (
                  <>
                    <span>Decrypt Snapshot</span>
                    <BsArrowRight />
                  </>
                )}
              </button>
           </form>

           <div className="flex items-center justify-center gap-2 pt-8 opacity-20 grayscale">
              <BsStars className="text-primary" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Datalis Intelligence Suite</span>
           </div>
        </div>
      </div>
    );
  }

  // Once authenticated, show the InvestorView in a clean wrapper
  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-auto custom-scrollbar">
       <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-4">
             <div className="text-primary font-black text-xl tracking-tighter">DATALIS</div>
             <div className="h-4 w-[1px] bg-white/10" />
             <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Shared Investor Insight</div>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                Verified Ledger
             </div>
          </div>
       </header>
       <main className="max-w-[1400px] mx-auto py-12">
          {/* Note: In shared mode, we don't pass workbenchId because we use the share content logic */}
          <InvestorView workbenchId={null} shareId={shareId} sharePassword={password} />
       </main>
    </div>
  );
}
