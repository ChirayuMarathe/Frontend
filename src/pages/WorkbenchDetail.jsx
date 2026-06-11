import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BsChevronLeft,
  BsSearch,
  BsFileEarmarkText,
  BsStars,
  BsShieldCheck,
  BsFolder2,
  BsLightningCharge,
  BsArrowUpRight,
  BsBoxSeam,
  BsGear,
  BsPlusLg
} from "react-icons/bs";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

// Sub-components
import LiquidityCenter from "../components/Workbenches/detail/LiquidityCenter";
import COAView from "../components/Workbenches/detail/COAView";
import OpsOverview from "../components/Workbenches/detail/OpsOverview";
import InvestorView from "../components/Workbenches/InvestorView";
import LogsView from "../components/Workbenches/LogsView";
import DocVault from "../components/Workbenches/detail/DocVault";
import OperationsView from "../components/Workbenches/OperationsView";
import ReportGenerationModal from "../components/Workbenches/ReportGenerationModal";
// Sub-components
import InventoryView from "../components/Workbenches/detail/InventoryView";
import WorkbenchSettings from "../components/Workbenches/WorkbenchSettings";
import TransactionModal from "../components/Workbenches/ledger/TransactionModal";

import { WorkbenchProvider } from "../context/WorkbenchContext";

export default function WorkbenchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [workbench, setWorkbench] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("COA");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const fetchWorkbench = useCallback(async () => {
    if (authLoading || !user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("workbenches")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        navigate("/dashboard/workbenches");
        return;
      }
      setWorkbench(data);
    } catch (err) {
      console.error("Error fetching workbench:", err);
      navigate("/dashboard/workbenches");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, user, authLoading]);

  useEffect(() => {
    fetchWorkbench();
  }, [fetchWorkbench]);

  useEffect(() => {
    const handleOpenModal = () => setIsTransactionModalOpen(true);
    window.addEventListener('open-transaction-modal', handleOpenModal);
    return () => window.removeEventListener('open-transaction-modal', handleOpenModal);
  }, []);

  const navItems = [
    { id: "COA", label: "Chart of Accounts", icon: BsShieldCheck },
    { id: "DocVault", label: "Doc Vault", icon: BsFolder2 },
    { id: "Ops", label: "Ops", icon: BsLightningCharge },
    { id: "Investor", label: "Investor View", icon: BsArrowUpRight },
    { id: "Inventory", label: "Inventory & Stock", icon: BsBoxSeam },
    { id: "Settings", label: "Settings", icon: BsGear },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <WorkbenchProvider workbenchId={id}>
      <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden">
        {/* Workbench Internal Sidebar */}
        <div className="w-64 border-r border-white/5 bg-[#0d1117]/50 flex flex-col flex-shrink-0">
          <div className="p-6 flex items-center space-x-4 border-b border-white/5">
            <button 
              onClick={() => navigate("/dashboard/workbenches")}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all"
            >
              <BsChevronLeft />
            </button>
            <div>
              <h2 className="text-sm font-bold text-white truncate w-32">{workbench?.name}</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Active Workbench</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            <div className="px-4 py-2">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Architecture</span>
            </div>
            
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activeTab === item.id 
                    ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-lg shadow-teal-500/5" 
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent"
                }`}
              >
                <item.icon className={`text-lg transition-transform duration-200 ${activeTab === item.id ? "scale-110" : "group-hover:scale-110"}`} />
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/5">
             <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
                <div className="flex items-center space-x-2 mb-2">
                   <BsStars className="text-teal-400" />
                   <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">AI Context</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">Currently analyzing this workbench for optimization.</p>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md z-10">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{activeTab}</span>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                 onClick={() => setIsReportModalOpen(true)}
                 className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <BsStars className="text-teal-400" />
                <span>Invoice & Reports</span>
              </button>
              
              <button 
                onClick={() => setIsTransactionModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-teal-500 text-black rounded-xl text-xs font-bold hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/10"
              >
                <BsPlusLg />
                <span>New Transaction</span>
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-auto relative">
            {activeTab === "COA" && <COAView workbenchId={id} />}
            {activeTab === "Ops" && <OperationsView workbenchId={id} />}
            {activeTab === "Investor" && <div className="p-8"><InvestorView workbenchId={id} workbenchName={workbench?.name} /></div>}
            {activeTab === "DocVault" && <DocVault workbenchId={id} />}
            {activeTab === "Inventory" && <InventoryView workbenchId={id} />}
            {activeTab === "Settings" && <WorkbenchSettings workbench={workbench} workbenchId={id} />}
          </main>
        </div>

        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          workbenchId={id}
          onSuccess={() => {
            // Trigger refresh event for any listener
            window.dispatchEvent(new Event('refresh-ledger-data'));
          }}
        />

        <ReportGenerationModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          workbenchId={id}
          workbenchName={workbench?.name}
        />
      </div>
    </WorkbenchProvider>
  );
}
