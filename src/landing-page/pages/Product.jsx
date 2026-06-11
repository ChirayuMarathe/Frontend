import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

const features = [
    {
        title: "Instant answers to financial questions",
        description: "Get immediate insights without waiting for manual analysis",
    },
    {
        title: "Trend analysis and forecasting",
        description: "Predict future performance based on historical data patterns",
    },
    {
        title: "Deep Insights from Documents",
        description: "Extract meaningful information from financial PDFs and statements",
    },
    {
        title: "Context-Aware Intelligence",
        description: "AI that understands your unique business context and goals",
    },
];

const capabilities = [
    {
        title: "Natural Language Queries",
        description: "Ask questions like you're talking to a colleague. No SQL needed.",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
        ),
    },
    {
        title: "Real-Time Analysis",
        description: "Connect directly to your PostgreSQL database for live insights.",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
    },
    {
        title: "Context-Aware Intelligence",
        description: "RAG-powered AI that understands your business context.",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
    },
    {
        title: "Document Analysis",
        description: "Extract key insights and trends from complex financial documents.",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 11-2 2z" />
            </svg>
        ),
    },
];

const useCases = [
    {
        title: "Revenue Analysis",
        query: "Analyze our revenue growth for Q3 compared to last year",
        result: "18% YoY growth driven by new enterprise plan adoption",
    },
    {
        title: "Trend Forecasting",
        query: "What's our projected cash flow for next quarter?",
        result: "Based on trends, expect ₹2.4M with 15% variance",
    },
    {
        title: "Customer Insights",
        query: "Which customer segment has the highest retention?",
        result: "Enterprise users: 94% retention, 23% higher than SMB",
    },
];

export default function Product() {
    const { theme } = useTheme();
    const heroRef = useRef(null);
    const capabilitiesRef = useRef(null);
    const useCasesRef = useRef(null);
    const ctaRef = useRef(null);

    const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
    const capabilitiesInView = useInView(capabilitiesRef, { once: true, margin: "-100px" });
    const useCasesInView = useInView(useCasesRef, { once: true, margin: "-100px" });
    const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });

    const isDark = theme === "dark";

    return (
        <div className={`min-h-screen ${isDark ? "bg-[#0a0a0a]" : "bg-[#f0f0f0]"}`}>
            {/* Hero Section */}
            <section ref={heroRef} className="pt-32 pb-20 px-6 md:px-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left - Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={heroInView ? { opacity: 1, x: 0 } : {}}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full mb-6 bg-gradient-to-r from-[#81E6D9]/20 to-[#81E6D9]/10 text-[#81E6D9] border border-[#81E6D9]/30 shadow-lg shadow-[#81E6D9]/10"
                            >
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#81E6D9] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#81E6D9] shadow-lg shadow-[#81E6D9]/50"></span>
                                </span>
                                MEET DABBY
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l2.5 7.5H22l-6 4.5 2.5 7.5L12 17l-6.5 4.5L8 14 2 9.5h7.5L12 2z" />
                                </svg>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.1 }}
                                className={`text-5xl md:text-6xl font-bold mb-6 ${isDark ? "text-white" : "text-[#1a1a1a]"
                                    }`}
                            >
                                Your AI Financial Consultant
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.2 }}
                                className={`text-xl mb-8 ${isDark ? "text-[#787878]" : "text-gray-600"}`}
                            >
                                Don't just stare at spreadsheets. Talk to your data. Ask questions, get insights, and uncover hidden trends using natural language.
                            </motion.p>

                            {/* Feature List */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.3 }}
                                className="space-y-4 mb-8"
                            >
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#81E6D9]/20 flex items-center justify-center mt-0.5">
                                            <svg className="w-4 h-4 text-[#81E6D9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className={`font-semibold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                                                {feature.title}
                                            </p>
                                            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>

                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.4 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`px-8 py-4 bg-[#81E6D9] text-black font-semibold rounded-full border border-[#81E6D9] hover:bg-transparent transition-colors ${isDark
                                        ? "hover:text-white hover:border-white"
                                        : "hover:text-[#1a1a1a] hover:border-[#1a1a1a]"
                                    }`}
                            >
                                Try Dabby Free
                            </motion.button>
                        </motion.div>

                        {/* Right - Mockup */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={heroInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.2 }}
                            className={`rounded-2xl border p-6 ${isDark ? "bg-[#111111] border-white/10" : "bg-white border-[#1a1a1a]/10 shadow-xl"
                                }`}
                        >
                            {/* Chat Header */}
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                                <div className="w-10 h-10 rounded-full bg-[#81E6D9]/20 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[#81E6D9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className={`font-semibold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                                        Dabby Consultant
                                    </p>
                                    <p className="text-xs text-[#81E6D9]">● Online</p>
                                </div>
                            </div>

                            {/* User Message */}
                            <div className="mb-4">
                                <div className={`inline-block px-4 py-3 rounded-2xl max-w-[80%] ${isDark ? "bg-[#81E6D9] text-black" : "bg-[#81E6D9] text-black"
                                    }`}>
                                    <p className="text-sm">Analyze our revenue growth for Q3 compared to last year</p>
                                </div>
                            </div>

                            {/* AI Response */}
                            <div className="mb-6">
                                <div className={`p-4 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                                    <p className={`text-sm mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                        Based on the uploaded financial data, here is the Q3 Revenue Analysis:
                                    </p>

                                    {/* Revenue Cards */}
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-white"}`}>
                                            <p className="text-xs text-gray-500 mb-1">Q3 2024 Revenue</p>
                                            <p className={`text-xl font-bold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                                                ₹42.5L
                                            </p>
                                            <p className="text-xs text-[#81E6D9]">↑ 18% YoY</p>
                                        </div>
                                        <div className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-white"}`}>
                                            <p className="text-xs text-gray-500 mb-1">Q3 2023 Revenue</p>
                                            <p className={`text-xl font-bold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                                                ₹36.0L
                                            </p>
                                        </div>
                                    </div>

                                    <p className={`text-sm mb-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                        The 18% growth is primarily driven by the new enterprise plan adoption. Would you like me to analyze the specific cost drivers next?
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${isDark ? "bg-white/10 text-white hover:bg-white/15" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            }`}>
                                            Analyze Costs
                                        </button>
                                        <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${isDark ? "bg-white/10 text-white hover:bg-white/15" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            }`}>
                                            View Forecast
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Input */}
                            <div className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-100"
                                }`}>
                                <input
                                    type="text"
                                    placeholder="Ask Dabby about your finances..."
                                    className={`flex-1 bg-transparent text-sm outline-none ${isDark ? "text-white placeholder-gray-500" : "text-[#1a1a1a] placeholder-gray-400"
                                        }`}
                                />
                                <button className="w-8 h-8 rounded-full bg-[#81E6D9] flex items-center justify-center">
                                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Capabilities Section */}
            <section ref={capabilitiesRef} className={`py-20 px-6 md:px-10 ${isDark ? "bg-[#111111]" : "bg-gray-50"}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                            Powerful Capabilities
                        </h2>
                        <p className={`text-lg max-w-2xl mx-auto ${isDark ? "text-[#787878]" : "text-gray-600"}`}>
                            Built on cutting-edge AI technology to make financial analysis accessible to everyone
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {capabilities.map((capability, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={capabilitiesInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: index * 0.1 }}
                                className={`p-6 rounded-2xl border ${isDark ? "bg-[#0a0a0a] border-white/5" : "bg-white border-[#1a1a1a]/10"
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark ? "bg-[#81E6D9]/10" : "bg-[#81E6D9]/15"
                                    }`}>
                                    <div className="text-[#81E6D9]">{capability.icon}</div>
                                </div>
                                <h3 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                                    {capability.title}
                                </h3>
                                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                    {capability.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section ref={useCasesRef} className="py-20 px-6 md:px-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                            See Dabby in Action
                        </h2>
                        <p className={`text-lg max-w-2xl mx-auto ${isDark ? "text-[#787878]" : "text-gray-600"}`}>
                            Real examples of how Dabby helps teams get instant insights
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {useCases.map((useCase, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={useCasesInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: index * 0.1 }}
                                className={`p-6 rounded-2xl border ${isDark ? "bg-[#111111] border-white/5" : "bg-white border-[#1a1a1a]/10"
                                    }`}
                            >
                                <h3 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                                    {useCase.title}
                                </h3>
                                <div className={`p-4 rounded-xl mb-4 ${isDark ? "bg-[#81E6D9]/10" : "bg-[#81E6D9]/10"
                                    }`}>
                                    <p className={`text-sm italic ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                        "{useCase.query}"
                                    </p>
                                </div>
                                <div className={`p-4 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                        {useCase.result}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section ref={ctaRef} className={`py-20 px-6 md:px-10 ${isDark ? "bg-[#111111]" : "bg-gray-50"}`}>
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                        className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
                    >
                        Ready to transform your financial analysis?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.1 }}
                        className={`text-lg mb-8 ${isDark ? "text-[#787878]" : "text-gray-600"}`}
                    >
                        Start your free trial today. No credit card required.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <button className={`px-8 py-4 bg-[#81E6D9] text-black font-semibold rounded-full border border-[#81E6D9] hover:bg-transparent transition-colors ${isDark
                                ? "hover:text-white hover:border-white"
                                : "hover:text-[#1a1a1a] hover:border-[#1a1a1a]"
                            }`}>
                            Start Free Trial
                        </button>
                        <button className={`px-8 py-4 font-semibold rounded-full border ${isDark
                            ? "border-white/20 text-white hover:bg-white/5"
                            : "border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-gray-100"
                            } transition-colors`}>
                            Schedule Demo
                        </button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

