import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

// Feature data
const featuresData = [
    {
        id: 1,
        title: "Natural Language Queries",
        highlight: "Ask questions in plain English",
        description: "Your finance team can get instant insights without writing complex queries. Simply type 'What was our revenue last quarter?' and get immediate answers.",
        details: [
            "No SQL or technical skills required",
            "Context-aware responses based on your data",
            "Supports follow-up questions for deeper analysis"
        ],
        workflowType: "branching-right"
    },
    {
        id: 2,
        title: "Real-Time Data Access (Upcoming)",
        highlight: "Live connection to your data sources",
        description: "Connect directly to Supabase for real-time data access. No data duplication, always current information for accurate decision-making.",
        details: [
            "Direct Supabase integration",
            "Real-time data synchronization",
            "Secure encrypted connections"
        ],
        workflowType: "converging"
    },
    {
        id: 3,
        title: "Deep Insights from Documents",
        highlight: "Analyze complex financial PDFs",
        description: "Extract meaningful information from financial statements, invoices, and various documents. Dabby understands the structure of financial data to give you deep analysis.",
        details: [
            "Extract key insights from PDFs",
            "Identify trends across multiple documents",
            "Summarize long financial statements"
        ],
        workflowType: "grid-output"
    }
];

// Workflow 1: Branching Right with proper arrows
const WorkflowBranchingRight = ({ isDark, isInView }) => {
    const lineColor = isDark ? "#81E6D9" : "#0D9488";

    return (
        <div className="flex items-center justify-center min-h-[320px] py-6">
            <div className="relative flex items-center">
                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5 }}
                    className="relative z-10"
                >
                    <div className="w-40 h-44 rounded-2xl bg-[#81E6D9] flex flex-col items-center justify-center p-4 shadow-lg shadow-[#81E6D9]/20">
                        <div className="flex gap-1.5 absolute top-3 left-3">
                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                        </div>
                        <svg className="w-10 h-10 text-white mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-white font-bold text-sm text-center uppercase tracking-wide">Natural Language</span>
                    </div>
                </motion.div>

                {/* SVG Connector with Arrows */}
                <svg width="120" height="200" className="mx-2" style={{ overflow: 'visible' }}>
                    <defs>
                        <marker id="arrowhead1" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill={lineColor} />
                        </marker>
                    </defs>
                    {/* Top arrow */}
                    <motion.path
                        d="M 0 100 Q 60 100 60 30 L 120 30"
                        fill="none"
                        stroke={lineColor}
                        strokeWidth="2"
                        strokeDasharray="8 4"
                        markerEnd="url(#arrowhead1)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    />
                    {/* Middle arrow */}
                    <motion.path
                        d="M 0 100 L 120 100"
                        fill="none"
                        stroke={lineColor}
                        strokeWidth="2"
                        strokeDasharray="8 4"
                        markerEnd="url(#arrowhead1)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    />
                    {/* Bottom arrow */}
                    <motion.path
                        d="M 0 100 Q 60 100 60 170 L 120 170"
                        fill="none"
                        stroke={lineColor}
                        strokeWidth="2"
                        strokeDasharray="8 4"
                        markerEnd="url(#arrowhead1)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                        transition={{ delay: 0.5, duration: 0.6 }}
                    />
                </svg>

                {/* Output Cards */}
                <div className="flex flex-col gap-4">
                    {[
                        { label: "Contextual Analysis", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
                        { label: "Data Insights", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
                        { label: "Quick Answers", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.5 + idx * 0.15, duration: 0.4 }}
                            className={`w-36 h-[60px] rounded-xl flex flex-col items-center justify-center p-3 ${isDark
                                ? "bg-[#1a1a1a] border border-[#81E6D9]/30"
                                : "bg-white border border-gray-200 shadow-md"
                                }`}
                        >
                            <svg className={`w-5 h-5 mb-1 ${isDark ? "text-[#81E6D9]" : "text-[#0D9488]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                            </svg>
                            <span className={`text-[10px] font-bold text-center uppercase tracking-wide ${isDark ? "text-white" : "text-gray-800"
                                }`}>{item.label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Workflow 2: Converging with arrows pointing down
const WorkflowConverging = ({ isDark, isInView }) => {
    const lineColor = isDark ? "#81E6D9" : "#0D9488";

    return (
        <div className="flex flex-col items-center justify-center min-h-[320px] py-6">
            {/* Top Row - Input Cards */}
            <div className="flex items-end justify-center gap-8 mb-2">
                {[
                    { label: "Supabase", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
                    { label: "AWS Storage", icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" },
                    { label: "Data Files", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" }
                ].map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: -20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: idx * 0.1, duration: 0.4 }}
                        className={`w-28 h-20 rounded-xl flex flex-col items-center justify-center p-2 ${isDark
                            ? "bg-[#1a1a1a] border border-[#81E6D9]/30"
                            : "bg-white border border-gray-200 shadow-md"
                            }`}
                    >
                        <svg className={`w-6 h-6 mb-1 ${isDark ? "text-[#81E6D9]" : "text-[#0D9488]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                        </svg>
                        <span className={`text-[10px] font-bold text-center uppercase tracking-wide ${isDark ? "text-white" : "text-gray-800"
                            }`}>{item.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* SVG Connector Lines */}
            <svg width="320" height="60" className="my-1" style={{ overflow: 'visible' }}>
                <defs>
                    <marker id="arrowhead2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill={lineColor} />
                    </marker>
                </defs>
                {/* Left line */}
                <motion.path
                    d="M 56 0 L 56 30 L 160 30 L 160 60"
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="2"
                    strokeDasharray="8 4"
                    markerEnd="url(#arrowhead2)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                    transition={{ delay: 0.3, duration: 0.5 }}
                />
                {/* Center line */}
                <motion.path
                    d="M 160 0 L 160 60"
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="2"
                    strokeDasharray="8 4"
                    markerEnd="url(#arrowhead2)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                    transition={{ delay: 0.4, duration: 0.5 }}
                />
                {/* Right line */}
                <motion.path
                    d="M 264 0 L 264 30 L 160 30 L 160 60"
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="2"
                    strokeDasharray="8 4"
                    markerEnd="url(#arrowhead2)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                    transition={{ delay: 0.5, duration: 0.5 }}
                />
            </svg>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.6, duration: 0.5 }}
            >
                <div className="w-44 h-40 rounded-2xl bg-[#81E6D9] flex flex-col items-center justify-center p-4 shadow-lg shadow-[#81E6D9]/20 relative">
                    <div className="flex gap-1.5 absolute top-3 left-3">
                        <div className="w-2 h-2 rounded-full bg-white/50"></div>
                        <div className="w-2 h-2 rounded-full bg-white/50"></div>
                        <div className="w-2 h-2 rounded-full bg-white/50"></div>
                    </div>
                    <svg className="w-10 h-10 text-white mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-white font-bold text-sm text-center uppercase tracking-wide">Real-Time Access</span>
                </div>
            </motion.div>
        </div>
    );
};

// Workflow 3: Grid Output with connecting line
const WorkflowGridOutput = ({ isDark, isInView }) => {
    const lineColor = isDark ? "#81E6D9" : "#0D9488";

    return (
        <div className="flex items-center justify-center min-h-[320px] py-6">
            <div className="flex items-center">
                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-40 h-44 rounded-2xl bg-[#81E6D9] flex flex-col items-center justify-center p-4 shadow-lg shadow-[#81E6D9]/20 relative">
                        <div className="flex gap-1.5 absolute top-3 left-3">
                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                        </div>
                        <svg className="w-10 h-10 text-white mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="text-white font-bold text-sm text-center uppercase tracking-wide">Analysis Engine</span>
                    </div>
                </motion.div>

                {/* SVG Connector */}
                <svg width="80" height="180" className="mx-2" style={{ overflow: 'visible' }}>
                    <defs>
                        <marker id="arrowhead3" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill={lineColor} />
                        </marker>
                    </defs>
                    {/* Horizontal line from card */}
                    <motion.path
                        d="M 0 90 L 40 90"
                        fill="none"
                        stroke={lineColor}
                        strokeWidth="2"
                        strokeDasharray="8 4"
                        initial={{ pathLength: 0 }}
                        animate={isInView ? { pathLength: 1 } : {}}
                        transition={{ delay: 0.3, duration: 0.3 }}
                    />
                    {/* Vertical line */}
                    <motion.path
                        d="M 40 30 L 40 150"
                        fill="none"
                        stroke={lineColor}
                        strokeWidth="2"
                        strokeDasharray="8 4"
                        initial={{ pathLength: 0 }}
                        animate={isInView ? { pathLength: 1 } : {}}
                        transition={{ delay: 0.4, duration: 0.3 }}
                    />
                    {/* Top branch */}
                    <motion.path d="M 40 45 L 80 45" fill="none" stroke={lineColor} strokeWidth="2" strokeDasharray="8 4" markerEnd="url(#arrowhead3)"
                        initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 0.5, duration: 0.2 }} />
                    {/* Middle branch */}
                    <motion.path d="M 40 90 L 80 90" fill="none" stroke={lineColor} strokeWidth="2" strokeDasharray="8 4" markerEnd="url(#arrowhead3)"
                        initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 0.55, duration: 0.2 }} />
                    {/* Bottom branch */}
                    <motion.path d="M 40 135 L 80 135" fill="none" stroke={lineColor} strokeWidth="2" strokeDasharray="8 4" markerEnd="url(#arrowhead3)"
                        initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 0.6, duration: 0.2 }} />
                </svg>

                {/* Output Grid */}
                <div className="flex flex-col gap-3">
                    {["Insight Extraction", "Trend ID", "Summarization"].map((label, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.6 + idx * 0.1, duration: 0.3 }}
                            className={`w-32 h-[52px] rounded-xl flex flex-col items-center justify-center ${isDark
                                ? "bg-[#1a1a1a] border border-[#81E6D9]/30"
                                : "bg-white border border-gray-200 shadow-md"
                                }`}
                        >
                            <svg className={`w-5 h-5 mb-0.5 ${isDark ? "text-[#81E6D9]" : "text-[#0D9488]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${isDark ? "text-white" : "text-gray-800"}`}>{label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Workflow 4: Trend Analysis with curved arrows
const WorkflowCurvedBranching = ({ isDark, isInView }) => {
    const lineColor = isDark ? "#81E6D9" : "#0D9488";

    return (
        <div className="flex items-center justify-center min-h-[320px] py-6">
            <div className="flex items-center">
                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-40 h-44 rounded-2xl bg-[#81E6D9] flex flex-col items-center justify-center p-4 shadow-lg shadow-[#81E6D9]/20 relative">
                        <div className="flex gap-1.5 absolute top-3 left-3">
                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                        </div>
                        <svg className="w-10 h-10 text-white mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span className="text-white font-bold text-sm text-center uppercase tracking-wide">Data Hub</span>
                    </div>
                </motion.div>

                {/* SVG Connector with curved arrows */}
                <svg width="100" height="200" className="mx-2" style={{ overflow: 'visible' }}>
                    <defs>
                        <marker id="arrowhead4" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill={lineColor} />
                        </marker>
                    </defs>
                    {/* Top curved arrow */}
                    <motion.path
                        d="M 0 100 C 30 100 30 35 100 35"
                        fill="none"
                        stroke={lineColor}
                        strokeWidth="2"
                        strokeDasharray="8 4"
                        markerEnd="url(#arrowhead4)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    />
                    {/* Middle straight arrow */}
                    <motion.path
                        d="M 0 100 L 100 100"
                        fill="none"
                        stroke={lineColor}
                        strokeWidth="2"
                        strokeDasharray="8 4"
                        markerEnd="url(#arrowhead4)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    />
                    {/* Bottom curved arrow */}
                    <motion.path
                        d="M 0 100 C 30 100 30 165 100 165"
                        fill="none"
                        stroke={lineColor}
                        strokeWidth="2"
                        strokeDasharray="8 4"
                        markerEnd="url(#arrowhead4)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    />
                </svg>

                {/* Output Cards */}
                <div className="flex flex-col gap-4">
                    {["Personal Scope", "Team Projects", "Company Data"].map((label, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.5 + idx * 0.15, duration: 0.4 }}
                            className={`w-40 h-[52px] rounded-xl flex items-center justify-center px-4 ${isDark
                                ? "bg-[#1a1a1a] border border-[#81E6D9]/30"
                                : "bg-white border border-gray-200 shadow-md"
                                }`}
                        >
                            <span className={`text-xs font-bold uppercase tracking-wide ${isDark ? "text-white" : "text-gray-800"}`}>{label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Workflow 5: Horizontal Flow with step-by-step arrows
const WorkflowHorizontalFlow = ({ isDark, isInView }) => {
    const lineColor = isDark ? "#81E6D9" : "#0D9488";

    return (
        <div className="flex items-center justify-center min-h-[320px] py-6">
            <div className="flex items-center gap-2">
                {/* Step 1 - Input */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center"
                >
                    <div className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center ${isDark
                        ? "bg-[#1a1a1a] border-2 border-[#81E6D9]/40"
                        : "bg-white border-2 border-[#81E6D9]/40 shadow-md"
                        }`}>
                        <svg className={`w-8 h-8 ${isDark ? "text-[#81E6D9]" : "text-[#0D9488]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                    </div>
                    <span className={`text-xs font-bold mt-2 uppercase tracking-wide ${isDark ? "text-white" : "text-gray-800"}`}>Raw Data</span>
                </motion.div>

                {/* Arrow 1 */}
                <svg width="60" height="24" style={{ overflow: 'visible' }}>
                    <defs>
                        <marker id="arrowhead5" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill={lineColor} />
                        </marker>
                    </defs>
                    <motion.path
                        d="M 0 12 L 50 12"
                        fill="none"
                        stroke={lineColor}
                        strokeWidth="2"
                        strokeDasharray="8 4"
                        markerEnd="url(#arrowhead5)"
                        initial={{ pathLength: 0 }}
                        animate={isInView ? { pathLength: 1 } : {}}
                        transition={{ delay: 0.3, duration: 0.4 }}
                    />
                </svg>

                {/* Step 2 - Processing (Main) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="flex flex-col items-center"
                >
                    <div className="w-36 h-36 rounded-2xl bg-[#81E6D9] flex flex-col items-center justify-center p-4 shadow-lg shadow-[#81E6D9]/20 relative">
                        <div className="flex gap-1.5 absolute top-3 left-3">
                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                        </div>
                        <svg className="w-10 h-10 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-white font-bold text-xs text-center uppercase tracking-wide">Intelligence Engine</span>
                    </div>
                </motion.div>

                {/* Arrow 2 */}
                <svg width="60" height="24" style={{ overflow: 'visible' }}>
                    <motion.path
                        d="M 0 12 L 50 12"
                        fill="none"
                        stroke={lineColor}
                        strokeWidth="2"
                        strokeDasharray="8 4"
                        markerEnd="url(#arrowhead5)"
                        initial={{ pathLength: 0 }}
                        animate={isInView ? { pathLength: 1 } : {}}
                        transition={{ delay: 0.5, duration: 0.4 }}
                    />
                </svg>

                {/* Step 3 - Output */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="flex flex-col items-center"
                >
                    <div className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center ${isDark
                        ? "bg-[#1a1a1a] border-2 border-[#81E6D9]/40"
                        : "bg-white border-2 border-[#81E6D9]/40 shadow-md"
                        }`}>
                        <svg className={`w-8 h-8 ${isDark ? "text-[#81E6D9]" : "text-[#0D9488]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <span className={`text-xs font-bold mt-2 uppercase tracking-wide ${isDark ? "text-white" : "text-gray-800"}`}>Insights</span>
                </motion.div>
            </div>
        </div>
    );
};

// Workflow Selector
const WorkflowDiagram = ({ type, isDark, isInView }) => {
    return (
        <div className="w-full overflow-x-auto overflow-y-hidden pb-4 no-scrollbar">
            <div className="min-w-[400px] md:min-w-0 flex justify-center scale-90 md:scale-100">
                {(() => {
                    switch (type) {
                        case "branching-right": return <WorkflowBranchingRight isDark={isDark} isInView={isInView} />;
                        case "converging": return <WorkflowConverging isDark={isDark} isInView={isInView} />;
                        case "grid-output": return <WorkflowGridOutput isDark={isDark} isInView={isInView} />;
                        case "curved-branching": return <WorkflowCurvedBranching isDark={isDark} isInView={isInView} />;
                        case "horizontal-flow": return <WorkflowHorizontalFlow isDark={isDark} isInView={isInView} />;
                        default: return <WorkflowBranchingRight isDark={isDark} isInView={isInView} />;
                    }
                })()}
            </div>
        </div>
    );
};

// Demo Modal - Just the dashboard window
const DemoModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-16"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/90" />

            {/* Close button - top right corner */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Dashboard Window */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-6xl rounded-xl md:rounded-2xl overflow-hidden bg-[#111111] border border-white/10 shadow-2xl"
            >
                {/* Window Title Bar */}
                <div className="flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2 md:py-3 bg-[#1a1a1a] border-b border-white/10">
                    <div className="flex gap-1.5 md:gap-2">
                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#ff5f57]"></div>
                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#febc2e]"></div>
                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#28c840]"></div>
                    </div>
                    <div className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar">
                        <span className="px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium bg-white/10 rounded-md text-white whitespace-nowrap">Dashboard</span>
                        <span className="px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium text-gray-400 hover:text-white cursor-pointer whitespace-nowrap">Dabby AI</span>
                    </div>
                </div>

                {/* Demo Content */}
                <div className="flex items-center justify-center min-h-[300px] md:min-h-[600px]">
                    <span className="text-4xl md:text-8xl font-bold text-white/20 tracking-wider uppercase">Demo Coming Soon</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Feature Section
const FeatureSection = ({ feature, index, isDark }) => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isReversed = index % 2 === 1;

    return (
        <>
            <section ref={sectionRef} className={`py-10 md:py-16 px-6 md:px-10 ${index % 2 === 0 ? (isDark ? "bg-[#0a0a0a]" : "bg-[#e8e8e8]") : (isDark ? "bg-[#0f0f0f]" : "bg-[#f0f0f0]")}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: isReversed ? 30 : -30 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.6 }}
                            className={isReversed ? "lg:order-2" : ""}
                        >
                            <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-500"}`}>Feature {String(index + 1).padStart(2, '0')}</span>
                            <h2 className={`text-3xl md:text-4xl font-bold mt-2 mb-4 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>{feature.title}</h2>
                            <p className="text-[#81E6D9] text-lg font-medium mb-4">{feature.highlight}</p>
                            <p className={`text-base leading-relaxed mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{feature.description}</p>
                            <ul className="space-y-3 mb-8">
                                {feature.details.map((detail, idx) => (
                                    <motion.li key={idx} initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.3 + idx * 0.1 }} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#81E6D9]/20 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-[#81E6D9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{detail}</span>
                                    </motion.li>
                                ))}
                            </ul>
                            <motion.button initial={{ opacity: 0, y: 10 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }} onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 text-[#81E6D9] font-medium hover:underline group">
                                How it works
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </motion.button>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: isReversed ? -30 : 30 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className={`${isReversed ? "lg:order-1" : ""} ${isDark ? "bg-[#080808]" : "bg-[#f5f5f5]"} rounded-2xl border ${isDark ? "border-white/5" : "border-gray-200"}`}
                        >
                            <WorkflowDiagram type={feature.workflowType} isDark={isDark} isInView={isInView} />
                        </motion.div>
                    </div>
                </div>
            </section>
            <DemoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

// Main Page
export default function Features() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const heroRef = useRef(null);
    const heroInView = useInView(heroRef, { once: true, margin: "-100px" });

    return (
        <div className={`min-h-screen ${isDark ? "bg-[#0a0a0a]" : "bg-[#e8e8e8]"}`}>
            <section ref={heroRef} className="pt-24 pb-8 px-6 md:px-10">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.span initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full mb-6 bg-[#81E6D9]/10 text-[#81E6D9] border border-[#81E6D9]/20">Features</motion.span>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>Powerful Features for Modern Finance Teams</motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} className={`text-lg md:text-xl max-w-2xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}>Discover how Datalis empowers your team with AI-driven insights, automated reporting, and real-time financial intelligence.</motion.p>
                </div>
            </section>
            {featuresData.map((feature, index) => (<FeatureSection key={feature.id} feature={feature} index={index} isDark={isDark} />))}
            <section className={`py-20 px-6 md:px-10 ${isDark ? "bg-[#0f0f0f]" : "bg-[#e0e0e0]"}`}>
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>Ready to transform your financial analysis?</h2>
                    <p className={`text-lg mb-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Start your free trial today. No credit card required.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className={`px-8 py-4 bg-[#81E6D9] text-black font-semibold rounded-full border border-[#81E6D9] hover:bg-transparent transition-colors ${isDark ? "hover:text-white hover:border-white" : "hover:text-[#1a1a1a] hover:border-[#1a1a1a]"}`}>Start Free Trial</button>
                        <button className={`px-8 py-4 font-semibold rounded-full border ${isDark ? "border-white/20 text-white hover:bg-white/5" : "border-gray-400 text-[#1a1a1a] hover:bg-gray-200"} transition-colors`}>Schedule Demo</button>
                    </div>
                </div>
            </section>
        </div>
    );
}

