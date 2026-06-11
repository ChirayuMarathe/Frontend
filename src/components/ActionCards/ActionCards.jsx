import React from "react";
import {
  BsTrophy,
  BsLightning,
  BsFileText,
  BsGraphUp,
  BsSearch,
  BsCalculator,
  BsBarChart,
  BsPeople,
  BsShield,
  BsArrowRight,
  BsGrid3X3Gap,
} from "react-icons/bs";

export default function ActionCards({
  onQuestionCardClick,
  activeWorkbench
}) {
  if (!activeWorkbench || !activeWorkbench.active) {
    return null;
  }

  const subCards = [
    // Top 3 - Exceptions/Warnings
    {
      title: "Expense Spikes",
      description: "Identify any unusual expense spikes this month",
      category: "WARNINGS",
      icon: BsLightning,
      onClick: () => onQuestionCardClick?.("Identify any unusual expense spikes this month"),
    },
    {
      title: "Overdue Payments",
      description: "Are there any overdue invoices or bills?",
      category: "EXCEPTIONS",
      icon: BsShield,
      onClick: () => onQuestionCardClick?.("Are there any overdue invoices or bills?"),
    },
    {
      title: "Budget Limits",
      description: "Highlight budget categories nearing their limits",
      category: "WARNINGS",
      icon: BsGrid3X3Gap,
      onClick: () => onQuestionCardClick?.("Highlight any budget categories nearing their limits"),
    },
    // Bottom 3 - Growth/Clarity
    {
      title: "Top Revenue",
      description: "What are our most profitable revenue streams?",
      category: "GROWTH",
      icon: BsGraphUp,
      onClick: () => onQuestionCardClick?.("What are our most profitable revenue streams?"),
    },
    {
      title: "Performance Summary",
      description: "Summarize financial performance for the last quarter",
      category: "CLARITY",
      icon: BsTrophy,
      onClick: () => onQuestionCardClick?.("Summarize our financial performance for the last quarter"),
    },
    {
      title: "Operating Expenses",
      description: "Provide a breakdown of our operating expenses",
      category: "CLARITY",
      icon: BsBarChart,
      onClick: () => onQuestionCardClick?.("Provide a breakdown of our operating expenses"),
    },
  ];

  return (
    <div className="px-3 sm:px-5 lg:px-8 py-4 sm:py-6 max-w-5xl mx-auto">
      {/* Ask Dabby Section - Hidden on mobile, visible tablet+ */}
      <div className="sm:block">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">
            Ask Dabby
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Tablet: 2 col, Desktop: 3 col */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {subCards.map((card, idx) => (
            <button
              key={idx}
              onClick={card.onClick}
              className="group bg-[#0a0a0a] hover:bg-white/5 border border-white/5 hover:border-teal-500/30 rounded-xl p-3 sm:p-4 lg:p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/5 hover:-translate-y-0.5 text-left w-full overflow-hidden active:scale-[0.98]"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="mt-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-teal-500/30 group-hover:bg-teal-500/10 transition-colors duration-300">
                  <card.icon className="text-xs text-gray-400 group-hover:text-teal-400 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[8px] sm:text-[9px] font-bold text-gray-600 group-hover:text-teal-500/70 uppercase tracking-wider border border-white/5 px-1.5 py-0.5 rounded transition-colors">
                      {card.category}
                    </span>
                  </div>
                  <div className="text-white text-xs sm:text-sm font-medium font-dm-sans group-hover:text-teal-400 transition-colors">
                    {card.title}
                  </div>
                  <div className="text-gray-500 text-[10px] sm:text-xs leading-snug font-dm-sans group-hover:text-gray-400 line-clamp-1 mt-1 hidden lg:block">
                    {card.description}
                  </div>
                </div>
                <BsArrowRight className="text-gray-700 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all text-xs opacity-0 group-hover:opacity-100 self-center flex-shrink-0 hidden sm:block" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
