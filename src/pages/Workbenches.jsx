import React, { useState, useEffect, useCallback } from "react";
import { 
  BsBuilding, 
  BsPlusLg, 
  BsArrowRight, 
  BsGlobe, 
  BsCurrencyDollar, 
  BsCalendarCheck 
} from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import Card from "../components/shared/Card";
import CreateWorkbenchModal from "../components/Workbenches/CreateWorkbenchModal";

export default function Workbenches() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [workbenches, setWorkbenches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchWorkbenches = useCallback(async () => {
    // Wait for auth to resolve before doing anything
    if (authLoading) return;
    
    // If auth resolved and no user, we can stop loading
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log("[DEBUG] Workbenches: Fetching list for user", user.id);
      setLoading(true);

      // Fetch memberships first
      const { data: memberships, error: memError } = await supabase
        .from("workbench_members")
        .select("workbench_id")
        .eq("user_id", user.id);

      if (memError) throw memError;

      if (!memberships || memberships.length === 0) {
        setWorkbenches([]);
        return;
      }

      const workbenchIds = memberships.map(m => m.workbench_id);

      const { data, error } = await supabase
        .from("workbenches")
        .select("*")
        .in("id", workbenchIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[DEBUG] Workbenches: Error fetching list:", error);
        throw error;
      }
      console.log("[DEBUG] Workbenches: Response:", data);
      setWorkbenches(data || []);
    } catch (err) {
      console.error("Error fetching workbenches:", err);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchWorkbenches();
  }, [fetchWorkbenches]);

  const handleCreateSuccess = () => {
    fetchWorkbenches();
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto font-dm-sans">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Workbenches</h1>
        <p className="text-gray-400">Your collaborative financial workbenches</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Existing Workbenches */}
        {workbenches.map((wb) => (
          <button
            key={wb.id}
            onClick={() => navigate(`/dashboard/workbenches/${wb.id}`)}
            className="text-left transition-all duration-300 group"
          >
            <Card 
              variant="dark" 
              className="h-full flex flex-col relative overflow-hidden border-white/5 group-hover:border-primary-300/50 group-hover:bg-primary-300/5 transition-all duration-300 p-6"
              hover={true}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-primary-300/10 border border-primary-300/20 text-primary-300 group-hover:bg-primary-300/20 group-hover:border-primary-300/40 transition-all">
                  <BsBuilding className="text-lg" />
                </div>
                <BsArrowRight className="text-gray-600 group-hover:text-primary-300 transition-colors text-sm" />
              </div>

              <h3 className="text-base font-bold text-white mb-4 group-hover:text-primary-200 transition-colors truncate">
                {wb.name}
              </h3>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-gray-500 text-[13px] group-hover:text-gray-400 transition-colors">
                  <div className="w-6 flex justify-start">
                    <BsGlobe className="text-sm" />
                  </div>
                  <span>India</span>
                </div>
                <div className="flex items-center text-gray-500 text-[13px] group-hover:text-gray-400 transition-colors">
                  <div className="w-6 flex justify-start">
                    <BsCurrencyDollar className="text-sm" />
                  </div>
                  <span>INR</span>
                </div>
                <div className="flex items-center text-gray-500 text-[13px] group-hover:text-gray-400 transition-colors">
                  <div className="w-6 flex justify-start">
                    <BsCalendarCheck className="text-sm" />
                  </div>
                  <span>FY starts April</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/20">
                  {wb.status || 'Active'}
                </span>
                <span className="text-[10px] text-gray-600 group-hover:text-gray-500">
                  {getTimeAgo(wb.created_at)}
                </span>
              </div>
            </Card>
          </button>
        ))}

        {/* Create Workbench Card */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-left group h-full"
        >
          <div className="h-full min-h-[220px] rounded-3xl border-2 border-dashed border-white/10 hover:border-primary-300/40 bg-transparent hover:bg-primary-300/5 flex flex-col items-center justify-center p-6 transition-all duration-300 group-hover:-translate-y-1">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mb-4 group-hover:bg-primary-300/20 group-hover:text-primary-300 transition-all">
              <BsPlusLg className="text-lg" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Create Workbench</h3>
            <p className="text-gray-500 text-[13px] text-center">Set up a new financial workspace</p>
          </div>
        </button>
      </div>

      <CreateWorkbenchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleCreateSuccess}
      />

      <div className="mt-20 text-center">
        <p className="text-gray-600 text-sm max-w-xl mx-auto leading-relaxed">
          Dabby is a collaborative financial workbench where documents become transactions, 
          transactions power intelligence, and every stakeholder works on the same financial truth.
        </p>
      </div>
    </div>
  );
}
