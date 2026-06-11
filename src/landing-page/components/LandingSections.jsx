/**
 * LandingSections.jsx
 * Sections 1–7 below the AI Template Generator hero.
 * Narrative: How It Works → Templates → Workspace → AI Intelligence → Data to Decisions → Pricing → CTA
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

// ─── Shared Utilities ────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

function Pill({ children, isDark }) {
    return (
        <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border mb-5 ${isDark
            ? "bg-[#81E6D9]/10 border-[#81E6D9]/25 text-[#81E6D9]"
            : "bg-[#0D9488]/10 border-[#0D9488]/25 text-[#0D9488]"
            }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#81E6D9]" />
            {children}
        </span>
    );
}

function H2({ children, className = "", isDark }) {
    return (
        <h2 className={`font-display text-3xl sm:text-4xl md:text-[2.75rem] font-bold leading-tight tracking-tight ${isDark ? "text-white" : "text-[#1a1a1a]"} ${className}`}>
            {children}
        </h2>
    );
}

function Sub({ children, isDark }) {
    return (
        <p className={`text-base md:text-lg leading-relaxed mt-4 max-w-2xl mx-auto ${isDark ? "text-[#787878]" : "text-gray-500"}`}>
            {children}
        </p>
    );
}

// ─── SECTION 1: HOW IT WORKS ─────────────────────────────────────────────────

const STEPS = [
    {
        num: "01",
        title: "Connect & Ingest Data",
        desc: `Upload raw bank statements, invoices, or spreadsheets. Datalis ingests data from any source instantly.`,
        badge: 'Upload .pdf · .csv · .xlsx',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
        ),
    },
    {
        num: "02",
        title: "Semantic AI Mapping",
        desc: "Our AI automatically maps every transaction to your 3-layer Chart of Accounts with 99% accuracy.",
        badge: "Automated Taxonomy Mapping",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
    },
    {
        num: "03",
        title: "Autonomous Monitoring",
        desc: "Monitor liquidity, runway, and department spend in real-time. Turn raw data into board-ready insights.",
        badge: "Real-time Liquidity Intelligence",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
];

export function HowItWorks() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <section className="py-20 md:py-28 px-4 sm:px-6 md:px-12">
            <div className="max-w-5xl mx-auto">
                <motion.div {...fadeUp()} className="text-center mb-14">
                    <Pill isDark={isDark}>The Operations Engine</Pill>
                    <H2 isDark={isDark}>
                        From Raw Data to <span className="text-[#81E6D9]">Financial Command</span>
                    </H2>
                </motion.div>

                <div className="flex flex-col md:flex-row items-stretch">
                    {STEPS.map((s, i) => (
                        <div key={s.num} className="flex-1 flex flex-col md:flex-row items-stretch">
                            <motion.div
                                {...fadeUp(i * 0.12)}
                                className={`flex-1 rounded-2xl border p-6 md:p-8 flex flex-col ${isDark ? "bg-[#161616] border-white/12 shadow-xl shadow-black/50" : "bg-white border-gray-200 shadow-lg"
                                    }`}
                            >
                                <span className={`text-[10px] font-bold tracking-widest mb-3 ${isDark ? "text-[#81E6D9]/50" : "text-[#0D9488]/50"}`}>{s.num}</span>
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${isDark ? "bg-[#81E6D9]/10 text-[#81E6D9]" : "bg-[#0D9488]/10 text-[#0D9488]"}`}>
                                    {s.icon}
                                </div>
                                <h3 className={`text-base font-bold mb-2.5 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>{s.title}</h3>
                                <p className={`text-sm leading-relaxed mb-5 flex-1 ${isDark ? "text-[#aaaaaa]" : "text-gray-500"}`}>{s.desc}</p>
                                <div className={`text-xs px-3 py-2 rounded-lg border font-semibold ${isDark ? "bg-[#81E6D9]/8 border-[#81E6D9]/20 text-[#81E6D9]" : "bg-[#0D9488]/8 border-[#0D9488]/20 text-[#0D9488]"
                                    }`}>{s.badge}</div>
                            </motion.div>

                            {i < STEPS.length - 1 && (
                                <motion.div
                                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }} transition={{ delay: i * 0.12 + 0.35 }}
                                    className="flex items-center justify-center md:w-10 my-3 md:my-0 flex-shrink-0"
                                >
                                    <svg className={`w-4 h-4 md:rotate-0 rotate-90 ${isDark ? "text-[#81E6D9]/30" : "text-[#0D9488]/30"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── SECTION 2: WHAT YOU CAN GENERATE ───────────────────────────────────────

const TEMPLATE_CARDS = [
    {
        id: "financial-model",
        name: "Financial Models",
        headers: ["Year", "Revenue", "EBITDA", "Net Cash"],
        rows: [["2024", "₹1.2Cr", "₹40L", "₹35L"], ["2025", "₹2.5Cr", "₹90L", "₹82L"]],
    },
    {
        id: "invoice",
        name: "Invoices",
        headers: ["Item", "Qty", "Tax", "Total"],
        rows: [["Brand Strategy", "2 hrs", "18%", "₹18,880"], ["SoMe Design", "1 proj", "18%", "₹25,960"]],
    },
    {
        id: "quotation",
        name: "Quotations",
        headers: ["Item", "Qty", "Unit Price", "Total"],
        rows: [["GI Sheets", "100 sqft", "₹850", "₹85,000"], ["Membrane", "50 m²", "₹320", "₹16,000"]],
    },
    {
        id: "expense-tracker",
        name: "Expense Trackers",
        headers: ["Date", "Category", "Amount"],
        rows: [["03 Mar", "Marketing", "₹12,000"], ["06 Mar", "SaaS Tools", "₹8,500"], ["10 Mar", "Office", "₹3,200"]],
    },
    {
        id: "cashflow-tracker",
        name: "Cashflow Planners",
        headers: ["Month", "Inflows", "Outflows", "Net"],
        rows: [["January", "₹4.2L", "₹3.1L", "₹1.1L"], ["February", "₹3.8L", "₹2.9L", "₹0.9L"]],
    },
    {
        id: "receivables-tracker",
        name: "Receivable Trackers",
        headers: ["Invoice", "Client", "Amount", "Status"],
        rows: [["INV-001", "Acme Corp", "₹45,000", "Overdue"], ["INV-002", "Beta Tech", "₹78,000", "Paid"]],
    },
];

const STATUS_STYLES = {
    Overdue: "bg-red-500/15 text-red-400",
    Paid: "bg-emerald-500/15 text-emerald-400",
    Pending: "bg-amber-500/15 text-amber-400",
};

export function WhatYouCanGenerate() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <section className={`py-20 md:py-28 px-4 sm:px-6 md:px-12 ${isDark ? "bg-white/[0.02]" : "bg-gray-50/70"}`}>
            <div className="max-w-6xl mx-auto">
                <motion.div {...fadeUp()} className="text-center mb-12">
                    <Pill isDark={isDark}>Template Gallery</Pill>
                    <H2 isDark={isDark}>
                        AI Financial Templates for
                        <br className="hidden sm:block" />
                        <span className="text-[#81E6D9]"> Everyday Business Tasks</span>
                    </H2>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {TEMPLATE_CARDS.map((tpl, i) => (
                        <motion.div
                            key={tpl.name}
                            {...fadeUp(i * 0.07)}
                            whileHover={{ y: -3, transition: { duration: 0.2 } }}
                            className={`group rounded-2xl border overflow-hidden transition-all duration-300 ${isDark
                                ? "bg-[#141414] border-white/12 shadow-xl shadow-black/50 hover:border-[#81E6D9]/35"
                                : "bg-white border-gray-200 shadow-md hover:shadow-lg hover:border-[#81E6D9]/40"
                                }`}
                        >
                            {/* Header */}
                            <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-white/8" : "border-gray-100"}`}>
                                <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>{tpl.name}</p>
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isDark ? "bg-[#81E6D9]/10" : "bg-[#0D9488]/10"}`}>
                                    <svg className={`w-3 h-3 ${isDark ? "text-[#81E6D9]" : "text-[#0D9488]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Mini table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className={isDark ? "bg-white/[0.03]" : "bg-gray-50"}>
                                            {tpl.headers.map((h) => (
                                                <th key={h} className={`text-left px-3 py-2 font-semibold tracking-wide text-[10px] uppercase whitespace-nowrap ${isDark ? "text-[#787878]" : "text-gray-400"}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tpl.rows.map((row, ri) => (
                                            <tr key={ri} className={`border-t ${isDark ? "border-white/5" : "border-gray-100"}`}>
                                                {row.map((cell, ci) => (
                                                    <td key={ci} className={`px-3 py-2 whitespace-nowrap ${STATUS_STYLES[cell]
                                                        ? ""
                                                        : isDark ? "text-gray-300" : "text-gray-600"
                                                        }`}>
                                                        {STATUS_STYLES[cell] ? (
                                                            <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLES[cell]}`}>{cell}</span>
                                                        ) : cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* CTA link */}
                            <div className={`px-4 py-2.5 border-t ${isDark ? "border-white/5" : "border-gray-100"}`}>
                                <Link
                                    to="/templates"
                                    onClick={() => {
                                        // Save specific intent so Marketplace or Onboarding can use it
                                        import("../../utils/redirectUtility").then(m => m.saveRedirectIntent(`/templates?id=${tpl.id}`));
                                    }}
                                    className={`text-[11px] font-semibold flex items-center gap-1 transition-colors ${isDark ? "text-[#81E6D9]/70 hover:text-[#81E6D9]" : "text-[#0D9488]/70 hover:text-[#0D9488]"}`}
                                >
                                    Generate this template
                                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── SECTION 3: THE WORKSPACE ────────────────────────────────────────────────

function WorkspaceMock({ isDark }) {
    const coa_structure = [
        { pillar: "Liquidity Center", accounts: ["Main Operating", "Payroll Reserve"], balance: "₹42.5L", trend: "+12%" },
        { pillar: "Operating Assets", accounts: ["Inventory Control", "Fleet Management"], balance: "₹18.2L", trend: "-2%" },
        { pillar: "Liabilities", accounts: ["Accounts Payable", "GST Obligations"], balance: "₹8.4L", trend: "+5%" },
    ];

    return (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-[#0f0f0f] border-white/12 shadow-2xl shadow-black/60" : "bg-white border-gray-200 shadow-xl"}`}>
            {/* Toolbar */}
            <div className={`flex items-center justify-between px-4 py-3 border-b gap-3 ${isDark ? "border-white/8 bg-white/[0.02]" : "border-gray-100 bg-gray-50"}`}>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#81E6D9]" />
                    <div className={`text-[10px] font-bold tracking-widest uppercase ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>Active Workbench: Financial Ops</div>
                </div>
                <div className={`text-[10px] px-2 py-0.5 rounded-full border ${isDark ? "border-[#81E6D9]/20 text-[#81E6D9]/70" : "border-[#0D9488]/20 text-[#0D9488]/70"}`}>3-Layer Hierarchy</div>
            </div>

            {/* COA Hierarchy grid */}
            <div className="p-4 space-y-3">
                {coa_structure.map((item, i) => (
                    <div key={item.pillar} className={`p-3 rounded-xl border transition-all ${isDark ? "bg-white/[0.02] border-white/5" : "bg-gray-50 border-gray-100"}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className={`text-[11px] font-bold ${isDark ? "text-[#81E6D9]" : "text-[#0D9488]"}`}>{item.pillar}</span>
                            <span className={`text-xs font-bold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>{item.balance}</span>
                        </div>
                        <div className="space-y-1.5 pl-2 border-l border-[#81E6D9]/20">
                            {item.accounts.map(acc => (
                                <div key={acc} className="flex justify-between items-center">
                                    <span className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>{acc}</span>
                                    <span className={`text-[9px] ${item.trend.startsWith('+') ? "text-emerald-400" : "text-red-400"}`}>{item.trend}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Insight Overlay */}
            <div className={`px-4 py-3 border-t ${isDark ? "border-white/5 bg-[#81E6D9]/5" : "border-gray-100 bg-teal-50/30"}`}>
                <div className="flex gap-2 items-start">
                    <div className="mt-0.5 w-4 h-4 rounded bg-[#81E6D9]/20 flex items-center justify-center text-[10px]">🤖</div>
                    <p className={`text-[10px] leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        <span className="font-bold text-[#81E6D9]">AI Insight:</span> Liquidity is stable. We've detected a 5% increase in Payroll Reserve based on recent bank statement ingestion.
                    </p>
                </div>
            </div>
        </div>
    );
}

const WORKSPACE_FEATURES = [
    { icon: "📁", label: "Upload Excel, CSV or financial statements" },
    { icon: "🗂️", label: "Organize business datasets in one place" },
    { icon: "📊", label: "Build charts and dashboards instantly" },
    { icon: "🤖", label: "Run AI analysis on your financial data" },
];

export function TheWorkspace() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <section className="py-20 md:py-28 px-4 sm:px-6 md:px-12">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                    {/* Left: Workspace mock */}
                    <motion.div {...fadeUp(0)}>
                        <WorkspaceMock isDark={isDark} />
                    </motion.div>

                    {/* Right: Copy */}
                    <motion.div {...fadeUp(0.12)}>
                        <Pill isDark={isDark}>The AI Workbench</Pill>
                        <H2 isDark={isDark} className="mb-4">
                            Beyond Sheets:
                            <br />
                            <span className="text-[#81E6D9]">A Team-First Workbench</span>
                        </H2>
                        <p className={`text-base leading-relaxed mb-8 ${isDark ? "text-[#787878]" : "text-gray-500"}`}>
                            Stop managing flat, disconnected spreadsheets. The Datalis Workbench provides a centralized source of truth with a professional 3-layer hierarchy.
                        </p>

                        <div className="space-y-6 mb-8">
                            <div className="flex gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-[#81E6D9]/10 text-[#81E6D9]" : "bg-[#0D9488]/10 text-[#0D9488]"}`}>
                                    🚀
                                </div>
                                <div>
                                    <h4 className={`text-sm font-bold mb-1 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>Multi-Entity Support</h4>
                                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Manage multiple companies or departments within dedicated workbenches, each with its own COA.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-[#81E6D9]/10 text-[#81E6D9]" : "bg-[#0D9488]/10 text-[#0D9488]"}`}>
                                    🧬
                                </div>
                                <div>
                                    <h4 className={`text-sm font-bold mb-1 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>Semantic Hierarchy</h4>
                                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Structured taxonomy (Pillars &gt; Accounts &gt; Labels) that mirrors professional accounting standards.</p>
                                </div>
                            </div>
                        </div>

                        <Link to="/signup" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-black bg-[#81E6D9] rounded-xl hover:bg-[#5fd3c7] transition-colors duration-200">
                            Create Your Workbench
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// ─── SECTION 4: AI FINANCIAL INTELLIGENCE ───────────────────────────────────

const AI_CARDS = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
        ),
        title: "Financial Analysis",
        desc: "AI detects trends in revenue, expenses and cashflow — surfacing patterns that matter before they become problems.",
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        title: "Instant Reports",
        desc: "Generate structured P&L statements, cashflow summaries and financial reports from raw data — in plain English.",
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
        title: "Smart Insights",
        desc: "AI highlights anomalies, spending risks and growth opportunities hidden inside your business numbers.",
    },
];

export function AIIntelligence() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <section className={`py-20 md:py-28 px-4 sm:px-6 md:px-12 ${isDark ? "bg-white/[0.02]" : "bg-gray-50/70"}`}>
            <div className="max-w-5xl mx-auto">
                <motion.div {...fadeUp()} className="text-center mb-12">
                    <Pill isDark={isDark}>AI Intelligence</Pill>
                    <H2 isDark={isDark}>
                        AI That <span className="text-[#81E6D9]">Understands Business Data</span>
                    </H2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {AI_CARDS.map((card, i) => (
                        <motion.div
                            key={card.title}
                            {...fadeUp(i * 0.1)}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className={`group relative rounded-2xl border p-7 overflow-hidden transition-all duration-300 cursor-default ${isDark
                                ? "bg-[#161616] border-white/12 shadow-xl shadow-black/50 hover:border-[#81E6D9]/35"
                                : "bg-white border-gray-200 shadow-md hover:border-[#81E6D9]/40 hover:shadow-xl"
                                }`}
                        >
                            {/* Glow */}
                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                                style={{ background: "radial-gradient(ellipse at top, rgba(129,230,217,0.07) 0%, transparent 70%)" }} />

                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${isDark ? "bg-[#81E6D9]/10 text-[#81E6D9]" : "bg-[#0D9488]/10 text-[#0D9488]"}`}>
                                {card.icon}
                            </div>
                            <h3 className={`text-lg font-bold mb-2.5 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>{card.title}</h3>
                            <p className={`text-sm leading-relaxed ${isDark ? "text-[#aaaaaa]" : "text-gray-500"}`}>{card.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── SECTION 5: DATA TO DECISIONS ───────────────────────────────────────────

const FLOW = [
    {
        icon: "📂",
        title: "Upload Files",
        sub: "Excel · CSV · Financial statements",
    },
    {
        icon: "🗂️",
        title: "Organize Data",
        sub: "Structured datasets inside the workspace",
    },
    {
        icon: "💬",
        title: "Ask AI Questions",
        quote: '"Why did expenses increase this month?"',
    },
    {
        icon: "📈",
        title: "Generate Insights",
        sub: "Reports, summaries and visual dashboards",
    },
];

export function DataToDecisions() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <section className="py-20 md:py-28 px-4 sm:px-6 md:px-12">
            <div className="max-w-3xl mx-auto">
                <motion.div {...fadeUp()} className="text-center mb-14">
                    <Pill isDark={isDark}>Data to Decisions</Pill>
                    <H2 isDark={isDark}>
                        From Raw Data to <span className="text-[#81E6D9]">Business Insights</span>
                    </H2>
                </motion.div>

                <div className="relative">
                    {/* Gradient connector line */}
                    <div className={`absolute left-6 top-8 bottom-8 w-px ${isDark
                        ? "bg-gradient-to-b from-[#81E6D9]/40 via-[#81E6D9]/20 to-transparent"
                        : "bg-gradient-to-b from-[#0D9488]/30 via-[#0D9488]/15 to-transparent"
                        }`} />

                    <div className="space-y-4">
                        {FLOW.map((item, i) => (
                            <motion.div key={item.title} {...fadeUp(i * 0.1)}>
                                <div className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 group ${isDark
                                    ? "bg-[#161616] border-white/12 shadow-lg shadow-black/40 hover:bg-[#1c1c1c] hover:border-[#81E6D9]/25"
                                    : "bg-white border-gray-200 shadow-sm hover:border-[#81E6D9]/40 hover:shadow-md"
                                    }`}>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border flex-shrink-0 ${isDark ? "bg-[#81E6D9]/10 border-[#81E6D9]/20" : "bg-[#0D9488]/8 border-[#0D9488]/20"
                                        }`}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>{item.title}</p>
                                        {item.sub && (
                                            <p className={`text-xs mt-0.5 ${isDark ? "text-[#787878]" : "text-gray-400"}`}>{item.sub}</p>
                                        )}
                                        {item.quote && (
                                            <p className={`text-xs mt-1 italic px-2.5 py-1 rounded-lg inline-block border ${isDark ? "bg-[#81E6D9]/8 border-[#81E6D9]/20 text-[#81E6D9]" : "bg-[#0D9488]/8 border-[#0D9488]/20 text-[#0D9488]"
                                                }`}>{item.quote}</p>
                                        )}
                                    </div>
                                    <span className={`ml-auto text-[10px] font-bold flex-shrink-0 ${isDark ? "text-[#81E6D9]/25" : "text-[#0D9488]/25"}`}>0{i + 1}</span>
                                </div>

                                {i < FLOW.length - 1 && (
                                    <div className="flex justify-center py-1">
                                        <svg className={`w-4 h-4 ${isDark ? "text-[#81E6D9]/30" : "text-[#0D9488]/30"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── SECTION 6: PRICING ──────────────────────────────────────────────────────

const PLANS = [
    {
        name: "Go",
        price: "₹5,000",
        period: "/month",
        tagline: "For startups needing active tracking",
        popular: true,
        features: [
            "5 active workbenches",
            "Document Vault (Basic)",
            "500 AI requests / month",
            "Standard account labels",
            "Email support",
        ],
        cta: "Get Started",
    },
    {
        name: "Pro",
        price: "₹10,000",
        period: "/month",
        tagline: "Advanced tools for growing teams",
        popular: false,
        features: [
            "10 active workbenches",
            "Investor View unlocked",
            "Advanced COA mapping",
            "Priority AI processing",
            "Priority support",
        ],
        cta: "Start Free Trial",
    },
    {
        name: "Enterprise",
        price: "₹20,000",
        period: "+",
        tagline: "Custom solutions for organizations",
        popular: false,
        features: [
            "Custom workbench count",
            "Investor View & Audit logs",
            "Custom account labels",
            "Dedicated onboarding",
            "24/7 Priority support",
        ],
        cta: "Contact Sales",
    },
];

export function PricingSection() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <section className={`py-20 md:py-28 px-4 sm:px-6 md:px-12 ${isDark ? "bg-white/[0.02]" : "bg-gray-50/70"}`}>
            <div className="max-w-5xl mx-auto">
                <motion.div {...fadeUp()} className="text-center mb-14">
                    <Pill isDark={isDark}>Pricing</Pill>
                    <H2 isDark={isDark}>
                        <span className="text-[#81E6D9]">Simple</span> Pricing
                    </H2>
                    <Sub isDark={isDark}>Start free. Scale as your team grows. No hidden fees.</Sub>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                    {PLANS.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            {...fadeUp(i * 0.1)}
                            className={`relative rounded-2xl border flex flex-col ${plan.popular
                                ? isDark
                                    ? "bg-[#81E6D9]/5 border-[#81E6D9]/40 shadow-[0_0_50px_rgba(129,230,217,0.07)]"
                                    : "bg-[#0D9488]/5 border-[#0D9488]/40 shadow-lg"
                                : isDark
                                    ? "bg-white/[0.03] border-white/10"
                                    : "bg-white border-gray-200"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                    <span className="inline-block px-4 py-1 rounded-full text-[11px] font-bold text-black bg-[#81E6D9]">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className={`text-base font-bold mb-0.5 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>{plan.name}</h3>
                                <p className={`text-xs mb-5 ${isDark ? "text-[#787878]" : "text-gray-500"}`}>{plan.tagline}</p>

                                <div className="flex items-end gap-1 mb-6">
                                    <span className={`text-4xl font-bold tracking-tight ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>{plan.price}</span>
                                    <span className={`text-sm mb-1.5 ${isDark ? "text-[#787878]" : "text-gray-400"}`}>{plan.period}</span>
                                </div>

                                <ul className="space-y-2.5 mb-8 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2.5">
                                            <svg className="w-4 h-4 text-[#81E6D9] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link to="/signup" className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all duration-200 ${plan.popular
                                    ? "text-black bg-[#81E6D9] hover:bg-[#5fd3c7]"
                                    : isDark
                                        ? "text-white border border-white/20 hover:bg-white/8"
                                        : "text-[#1a1a1a] border border-gray-200 hover:bg-gray-50"
                                    }`}>
                                    {plan.cta}
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── SECTION 7: FINAL CTA ────────────────────────────────────────────────────

export function FinalCTASection() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <section className="py-20 md:py-28 px-4 sm:px-6 md:px-12">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    {...fadeUp()}
                    className={`relative rounded-3xl overflow-hidden border text-center px-8 py-16 md:py-20 ${isDark ? "border-white/10" : "border-gray-200"
                        }`}
                >
                    {/* Radial gradient glow */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                        background: isDark
                            ? "radial-gradient(ellipse 90% 70% at 50% -10%, rgba(129,230,217,0.12) 0%, rgba(10,10,10,0) 65%)"
                            : "radial-gradient(ellipse 90% 70% at 50% -10%, rgba(13,148,136,0.09) 0%, transparent 65%)",
                    }} />
                    {/* Dot grid */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{
                        backgroundImage: "radial-gradient(rgba(129,230,217,1) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }} />

                    <div className="relative z-10">
                        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border mb-6 ${isDark ? "bg-[#81E6D9]/10 border-[#81E6D9]/25 text-[#81E6D9]" : "bg-[#0D9488]/10 border-[#0D9488]/25 text-[#0D9488]"
                            }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#81E6D9] animate-pulse" />
                            Ready to start?
                        </div>

                        <h2 className={`font-display text-4xl sm:text-5xl md:text-[3.25rem] font-bold leading-[1.05] tracking-tight mb-4 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                            Stop Building Financial
                            <br />
                            <span className="text-[#81E6D9]">Sheets Manually</span>
                        </h2>

                        <p className={`text-base md:text-lg max-w-xl mx-auto mb-10 ${isDark ? "text-[#787878]" : "text-gray-500"}`}>
                            Generate templates, analyze data and discover insights with AI. Your next financial document is one prompt away.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/signup" className="px-8 py-3.5 text-sm font-bold text-black bg-[#81E6D9] rounded-full hover:bg-[#5fd3c7] transition-colors duration-200">
                                Start Generating Templates
                            </Link>
                            <Link to="/signup" className={`px-8 py-3.5 text-sm font-semibold rounded-full border transition-colors duration-200 ${isDark ? "text-white border-white/20 hover:bg-white/8" : "text-[#1a1a1a] border-gray-300 hover:bg-gray-100"
                                }`}>
                                Create Account
                            </Link>
                        </div>

                        <p className={`text-xs mt-8 ${isDark ? "text-[#787878]/60" : "text-gray-400"}`}>
                            No credit card required · Free tier available · Setup in under 2 minutes
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
