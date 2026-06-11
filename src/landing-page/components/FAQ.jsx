import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const faqItems = [
    {
        id: 1,
        question: "How does Datalis connect to my financial data?",
        answer: "Datalis connects directly to your PostgreSQL database or accepts CSV/Excel file uploads. We use secure, encrypted connections and never store your raw data - only the calculated insights and metrics you choose to save."
    },
    {
        id: 3,
        question: "How does Dabby AI work?",
        answer: "Dabby uses RAG (Retrieval-Augmented Generation) technology to understand your financial data context. You can ask complex questions in natural language like 'What was our best performing product last quarter?' and get accurate, data-backed answers instantly."
    },
    {
        id: 5,
        question: "What kind of reports can I generate?",
        answer: "You can generate professional PDF reports with customizable templates. Add your company logo, choose which metrics to include, and create branded financial summaries perfect for stakeholder presentations and board meetings."
    },
    {
        id: 6,
        question: "Is there a free trial available?",
        answer: "Yes! We give you 30 free credits with full access to all features. No credit card required to start. You can explore spreadsheets, Dabby AI, and report generation before committing."
    }
];

export default function FAQ() {
    const [openId, setOpenId] = useState(null);
    const { theme } = useTheme();
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    const toggleFaq = (id) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <section ref={sectionRef} className="py-16 md:py-28 px-4 md:px-10">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                    {/* Left side - Title */}
                    <div className="text-center lg:text-left">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 mb-6"
                        >
                            <span className="px-2.5 py-1 text-[10px] md:text-xs font-semibold rounded bg-[#81E6D9] text-black">
                                NEW
                            </span>
                            <span className={`px-3 py-1 text-[10px] md:text-sm rounded-full border ${theme === "dark"
                                ? "border-white/10 text-[#787878]"
                                : "border-[#1a1a1a]/20 text-gray-600"
                                }`}>
                                FAQ
                            </span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className={`text-3xl md:text-5xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-[#1a1a1a]"
                                }`}
                        >
                            Frequently
                            <span className="hidden lg:inline"><br /></span>
                            <span className="lg:hidden"> </span>
                            <span className={theme === "dark" ? "text-[#81E6D9]" : "text-[#0D9488]"}>Asked Questions</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className={`text-sm md:text-base max-w-sm mx-auto lg:mx-0 mb-8 lg:mb-0 ${theme === "dark" ? "text-[#787878]" : "text-gray-600"
                                }`}
                        >
                            Have questions? Our FAQ section has you covered with quick answers to the most common inquiries.
                        </motion.p>
                    </div>

                    {/* Right side - Accordion */}
                    <div className="space-y-3">
                        {faqItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.2 + index * 0.05, duration: 0.4 }}
                            >
                                <button
                                    onClick={() => toggleFaq(item.id)}
                                    className={`w-full flex items-center justify-between p-4 md:p-5 rounded-xl text-left transition-all duration-300 border ${theme === "dark"
                                        ? "bg-[#111111] hover:bg-[#161616] border-white/5"
                                        : "bg-white hover:bg-gray-50 border-[#1a1a1a]/10"
                                        } ${openId === item.id ? "border-[#81E6D9]/30" : ""}`}
                                >
                                    <span className={`text-sm md:text-base font-medium pr-4 ${theme === "dark" ? "text-white" : "text-[#1a1a1a]"
                                        }`}>
                                        {item.question}
                                    </span>
                                    <motion.span
                                        animate={{ rotate: openId === item.id ? 45 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full ${openId === item.id
                                            ? "bg-[#81E6D9] text-black"
                                            : theme === "dark"
                                                ? "bg-white/5 text-[#787878]"
                                                : "bg-gray-100 text-gray-500"
                                            }`}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </motion.span>
                                </button>

                                <AnimatePresence>
                                    {openId === item.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className={`px-4 md:px-5 py-4 text-sm leading-relaxed ${theme === "dark" ? "text-[#787878]" : "text-gray-600"
                                                }`}>
                                                {item.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
