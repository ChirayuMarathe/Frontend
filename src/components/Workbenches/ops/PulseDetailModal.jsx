import React from "react";
import { 
  BsX, 
  BsInfoCircle, 
  BsArrowRight, 
  BsGraphUpArrow, 
  BsGraphDownArrow, 
  BsShieldCheck,
  BsExclamationTriangle,
  BsBank,
  BsWallet2,
  BsArrowUpRight,
  BsArrowDownLeft
} from "react-icons/bs";
import Card from "../../shared/Card";
import { motion, AnimatePresence } from "framer-motion";

export default function PulseDetailModal({ isOpen, onClose, metric, details }) {
  if (!isOpen || !metric) return null;

  const formatAmount = (amount) => {
    return `₹${Math.round(amount).toLocaleString()}`;
  };

  const getHealthAnalysis = () => {
    const score = parseInt(metric.value);
    if (score >= 80) return {
      status: "Excellent",
      color: "text-emerald-400",
      icon: BsShieldCheck,
      message: "Your business is in a strong financial position with healthy reserves and manageable liabilities.",
      tips: ["Consider reinvesting surplus cash into growth.", "Maintain the current efficiency levels."]
    };
    if (score >= 50) return {
      status: "Stable",
      color: "text-amber-400",
      icon: BsInfoCircle,
      message: "Your financial health is stable, but there are areas for optimization in liquidity or profitability.",
      tips: ["Review operational expenses.", "Accelerate accounts receivable collection."]
    };
    return {
      status: "Critical",
      color: "text-red-400",
      icon: BsExclamationTriangle,
      message: "Your business is facing financial stress. High burn rate or low liquidity needs immediate attention.",
      tips: ["Cut non-essential costs immediately.", "Focus on cash-generating activities.", "Negotiate longer payment terms with vendors."]
    };
  };

  const analysis = metric.label === "HEALTH SCORE" ? getHealthAnalysis() : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0E1117] border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-2xl ${metric.changeType === 'positive' ? 'bg-emerald-500/10 text-emerald-400' : metric.changeType === 'danger' ? 'bg-red-500/10 text-red-400' : 'bg-primary-300/10 text-primary-300'}`}>
              <metric.icon size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">{metric.label}</h3>
              <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-widest font-black">{metric.value}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
            <BsX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
          
          {/* Analysis Section (for Health Score) */}
          {analysis && (
            <div className="space-y-4">
              <div className={`flex items-center space-x-2 ${analysis.color}`}>
                <analysis.icon size={20} />
                <span className="text-sm font-black uppercase tracking-widest">{analysis.status} Position</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {analysis.message}
              </p>
              <div className="bg-white/5 rounded-2xl p-5 space-y-3">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Recommended Actions</h4>
                <ul className="space-y-2">
                  {analysis.tips.map((tip, i) => (
                    <li key={i} className="flex items-start space-x-2 text-[11px] text-gray-300">
                      <BsArrowRight className="mt-0.5 text-teal-400 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Breakdown Section */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center justify-between">
              <span>Detailed Breakdown</span>
              <span className="text-white">Total: {metric.value}</span>
            </h4>
            
            <div className="space-y-3">
              {details.length === 0 ? (
                <div className="text-center py-12 opacity-30">
                  <p className="text-sm font-medium">No detailed entries found</p>
                </div>
              ) : (
                details.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/5 rounded-xl text-gray-400">
                        {metric.label === "CASH POSITION" ? <BsBank size={14} /> : 
                         metric.label === "PAYABLES" ? <BsArrowUpRight size={14} /> :
                         metric.label === "RECEIVABLES" ? <BsArrowDownLeft size={14} /> :
                         <BsInfoCircle size={14} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{item.name}</p>
                        <p className="text-[10px] text-gray-500 font-medium">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">{formatAmount(item.amount)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Explanatory Note */}
          <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/10">
            <p className="text-[10px] text-teal-500/70 leading-relaxed italic">
              {metric.label === "CASH POSITION" && "This represents liquid assets currently available in your bank accounts and cash on hand. It does not include expected revenue or pending bills."}
              {metric.label === "PAYABLES" && "These are obligations recorded in your ledger that are not yet paid. This includes trade payables, accrued rent, and pending utility bills."}
              {metric.label === "RECEIVABLES" && "This represents product revenue or service fees that have been invoiced but the payment has not hit your bank account yet."}
              {metric.label === "HEALTH SCORE" && "This score is a real-time calculation combining your Net Profit Margin and your Current Liquidity Ratio (Assets vs Liabilities)."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-white/[0.01]">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
          >
            Close Insight
          </button>
        </div>
      </motion.div>
    </div>
  );
}
