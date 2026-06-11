import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

const steps = [
  {
    number: "1",
    title: "Workbench Documents",
    description: "Upload and organize all your financial documents, CSVs, and invoices in a centralized, secure workbench.",
    mockup: "upload"
  },
  {
    number: "2",
    title: "Investor View Dashboard",
    description: "Share customized, real-time financial dashboards and polished reports directly with your investors and stakeholders.",
    mockup: "dashboard"
  },
  {
    number: "3",
    title: "AI Chat Assistant",
    description: "Ask complex financial questions in plain English. Get instant answers, visualizations, and deep insights.",
    mockup: "insights"
  }
];

function UploadMockup({ theme }) {
  const isDark = theme === "dark";
  return (
    <div className={`p-6 rounded-xl border ${isDark ? "bg-[#0a0a0a] border-white/5" : "bg-white border-[#1a1a1a]/10"
      }`}>
      {/* Email Input */}
      <div className="mb-4">
        <label className={`text-xs font-medium mb-2 block ${isDark ? "text-gray-400" : "text-gray-500"
          }`}>
          Email
        </label>
        <div className={`px-4 py-2.5 rounded-lg border ${isDark ? "bg-[#111111] border-white/10" : "bg-gray-50 border-[#1a1a1a]/10"
          }`}>
          <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            rahul@company.com
          </span>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="mb-5">
        <label className={`text-xs font-medium mb-2 block ${isDark ? "text-gray-400" : "text-gray-500"
          }`}>
          Upload File
        </label>
        <div className={`px-4 py-8 rounded-lg border-2 border-dashed text-center ${isDark ? "border-white/10 bg-[#111111]" : "border-[#1a1a1a]/20 bg-gray-50"
          }`}>
          <svg className={`w-8 h-8 mx-auto mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            Drop CSV or Excel
          </span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-3 rounded-full text-sm font-semibold text-black bg-[#81E6D9] border border-[#81E6D9] hover:bg-transparent transition-colors ${isDark
          ? "hover:text-white hover:border-white"
          : "hover:text-[#1a1a1a] hover:border-[#1a1a1a]"
          }`}
      >
        Upload Data
      </motion.button>
    </div>
  );
}

function ChatMockup({ theme }) {
  const isDark = theme === "dark";
  return (
    <div className={`p-6 rounded-xl border ${isDark ? "bg-[#0a0a0a] border-white/5" : "bg-white border-[#1a1a1a]/10"
      }`}>
      {/* Chat Messages */}
      <div className="space-y-4 mb-5">
        <div className={`p-3 rounded-lg text-xs ${isDark ? "bg-[#111111] text-gray-300" : "bg-gray-50 text-gray-700"}`}>
          "What was our net profit in Q4?"
        </div>
        <div className={`p-3 rounded-lg text-xs border ${isDark ? "bg-[#111111]/50 border-teal-500/20 text-teal-400" : "bg-teal-50 border-teal-500/20 text-teal-700"}`}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></div>
            <span className="font-bold">Dabby</span>
          </div>
          Your net profit for Q4 was ₹2.4M, up 18% from Q3.
        </div>
      </div>

      {/* Input Box */}
      <div className={`px-4 py-2.5 rounded-lg border flex items-center justify-between ${isDark ? "bg-[#111111] border-white/10" : "bg-gray-50 border-[#1a1a1a]/10"
        }`}>
        <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          Type a message...
        </span>
        <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      </div>
    </div>
  );
}

function DashboardMockup({ theme }) {
  const isDark = theme === "dark";
  return (
    <div className={`p-6 rounded-xl border ${isDark ? "bg-[#0a0a0a] border-white/5" : "bg-white border-[#1a1a1a]/10"
      }`}>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`p-3 rounded-lg border flex flex-col justify-between ${isDark ? "bg-[#111111] border-white/10" : "bg-gray-50 border-[#1a1a1a]/10"}`}>
          <p className={`text-[10px] font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Total Revenue</p>
          <p className={`text-sm font-bold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>₹2.4M</p>
          <p className="text-[10px] text-teal-500 mt-1 font-medium">+18% <span className={isDark ? "text-gray-500" : "text-gray-400"}>vs last mth</span></p>
        </div>
        <div className={`p-3 rounded-lg border flex flex-col justify-between ${isDark ? "bg-[#111111] border-white/10" : "bg-gray-50 border-[#1a1a1a]/10"}`}>
          <p className={`text-[10px] font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Runway</p>
          <p className={`text-sm font-bold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>14 Months</p>
          <p className="text-[10px] text-teal-500 mt-1 font-medium">Stable</p>
        </div>
      </div>
      {/* Chart mock */}
      <div className={`h-16 rounded-lg border flex items-end p-2 gap-1.5 ${isDark ? "bg-[#111111] border-white/10" : "bg-gray-50 border-[#1a1a1a]/10"}`}>
        <div className="w-full bg-[#81E6D9]/20 rounded-t-sm h-[40%]"></div>
        <div className="w-full bg-[#81E6D9]/40 rounded-t-sm h-[60%]"></div>
        <div className="w-full bg-[#81E6D9]/60 rounded-t-sm h-[80%]"></div>
        <div className="w-full bg-[#81E6D9]/80 rounded-t-sm h-[100%]"></div>
      </div>
    </div>
  );
}

export default function FeaturesGrid() {
  const { theme } = useTheme();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const isDark = theme === "dark";

  const getMockup = (type) => {
    switch (type) {
      case "upload": return <UploadMockup theme={theme} />;
      case "insights": return <ChatMockup theme={theme} />;
      case "dashboard": return <DashboardMockup theme={theme} />;
      default: return null;
    }
  };

  return (
    <section ref={sectionRef} className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Section Header */}
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${isDark ? "text-white" : "text-[#1a1a1a]"
              }`}
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
            className={`text-base md:text-lg max-w-xl mx-auto mb-6 ${isDark ? "text-[#787878]" : "text-gray-600"
              }`}
          >
            A simple, fast, and secure platform to manage your financial data in just a few steps.
          </motion.p>

          {/* Cyan link */}
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            href="/signup"
            className={`inline-flex items-center gap-2 font-medium transition-colors ${isDark ? "text-[#81E6D9] hover:text-[#4FD1C5]" : "text-[#0D9488] hover:text-[#14b8a6]"
              }`}
          >
            Get started now
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.a>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              className={`p-6 md:p-8 rounded-2xl border transition-all duration-300 ${isDark
                ? "bg-[#111111] border-white/5 hover:border-[#81E6D9]/30"
                : "bg-white border-[#1a1a1a]/10 hover:border-[#81E6D9]/50 shadow-sm"
                }`}
            >
              {/* Numbered Badge - Cyan */}
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold mb-6 text-black bg-[#81E6D9]">
                {step.number}
              </div>

              {/* Mockup */}
              <div className="mb-6">
                {getMockup(step.mockup)}
              </div>

              {/* Title */}
              <h3 className={`text-xl font-semibold mb-3 ${isDark ? "text-white" : "text-[#1a1a1a]"
                }`}>
                {step.title}
              </h3>

              {/* Description */}
              <p className={`text-sm leading-relaxed ${isDark ? "text-[#787878]" : "text-gray-600"
                }`}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
