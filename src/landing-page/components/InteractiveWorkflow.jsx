import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const workflowSteps = [
  {
    id: 1,
    title: "Workbench Ops",
    heading: "Unified Financial Operations",
    description: "Manage transactions, invoices, and accounting seamlessly from one unified interface. Simplify your daily financial workflows.",
    cta: "Explore workbench",
    ctaLink: "/features/workbench",
  },
  {
    id: 2,
    title: "Investor View",
    heading: "Board-Ready Dashboards",
    description: "Give stakeholders real-time access to key metrics and automated reports. Never spend hours building another presentation deck.",
    cta: "View dashboards",
    ctaLink: "/features/investor",
  },
  {
    id: 3,
    title: "Logs",
    heading: "Comprehensive Audit Trials",
    description: "Track every change, approval, and transaction with immutable history logs. Keep your compliance and security posture unassailable.",
    cta: "See compliance",
    ctaLink: "/features/compliance",
  }
];

export default function InteractiveWorkflow() {
  const [activeStep, setActiveStep] = useState(0);
  const { theme } = useTheme();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Section Header - Centered */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-[#1a1a1a]"
              }`}
          >
            Financial Intelligence Made Simple
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
            className={`text-base md:text-lg max-w-2xl mx-auto ${theme === "dark" ? "text-[#787878]" : "text-gray-600"
              }`}
          >
            Empower your finance team to explore, analyze, and act on data—in the way that works for them.
          </motion.p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 md:mb-12 px-4">
          <div className={`inline-flex flex-wrap justify-center rounded-2xl md:rounded-full p-1.5 border transition-colors ${theme === "dark" ? "bg-[#111111] border-white/10" : "bg-white border-gray-200 shadow-sm"}`}>
            {workflowSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(index)}
                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${activeStep === index
                  ? theme === "dark"
                    ? "bg-[#81E6D9] text-black shadow-lg shadow-[#81E6D9]/20"
                    : "bg-[#1a1a1a] text-white shadow-lg shadow-black/10"
                  : theme === "dark"
                    ? "text-[#787878] hover:text-white"
                    : "text-gray-500 hover:text-[#1a1a1a]"
                  }`}
              >
                {step.title}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Display */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative group">
            {/* Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#81E6D9]/20 to-[#4FD1C5]/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>

            {/* Main Container */}
            <div className={`relative rounded-[2rem] border overflow-hidden shadow-2xl transition-colors ${theme === "dark" ? "bg-[#0a0a0a] border-white/10" : "bg-white border-gray-200"}`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 lg:grid-cols-2"
                >
                  {/* Left: Text Content */}
                  <div className="order-2 lg:order-1 p-6 md:p-10 flex flex-col justify-center">
                    <motion.h3
                      key={`heading-${activeStep}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className={`text-2xl md:text-3xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-[#1a1a1a]"
                        }`}
                    >
                      {workflowSteps[activeStep].heading}
                    </motion.h3>
                    <motion.p
                      key={`desc-${activeStep}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className={`text-base leading-relaxed mb-6 ${theme === "dark" ? "text-[#787878]" : "text-gray-600"
                        }`}
                    >
                      {workflowSteps[activeStep].description}
                    </motion.p>
                    {/* Link */}
                    <motion.a
                      key={`cta-${activeStep}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      href={workflowSteps[activeStep].ctaLink}
                      className={`inline-flex items-center gap-2 font-medium transition-colors ${theme === "dark"
                        ? "text-[#81E6D9] hover:text-[#4FD1C5]"
                        : "text-[#1a1a1a] hover:text-black underline underline-offset-4"
                        }`}
                    >
                      {workflowSteps[activeStep].cta}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </motion.a>
                  </div>

                  {/* Right: Screenshot/Visual */}
                  <div className="order-1 lg:order-2 p-4 md:p-6 flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={`w-full rounded-2xl overflow-hidden border ${theme === "dark"
                        ? "bg-[#111111] border-white/10"
                        : "bg-white border-gray-200 shadow-lg"
                        }`}
                    >
                      {/* Browser chrome */}
                      <div className={`flex items-center gap-2 px-4 py-3 border-b ${theme === "dark" ? "bg-[#0a0a0a] border-white/5" : "bg-gray-50 border-gray-100"
                        }`}>
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-[#81E6D9]/80"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                        </div>
                        <div className="flex-1 mx-4">
                          <div className={`rounded-md px-3 py-1.5 text-xs max-w-xs mx-auto text-center ${theme === "dark" ? "bg-[#1a1a1a] text-[#787878]" : "bg-gray-100 text-gray-500"
                            }`}>
                            dabby
                          </div>
                        </div>
                      </div>

                      {/* App content mockup */}
                      <div className={`aspect-auto sm:aspect-[4/3] p-4 md:p-6 ${theme === "dark" ? "bg-[#0a0a0a]" : "bg-gray-50"
                        }`}>

                        {/* Workbench Ops Mockup */}
                        {activeStep === 0 && (
                          <div className={`h-full rounded-lg p-3 md:p-4 flex flex-col ${theme === "dark" ? "bg-[#111111]" : "bg-white border border-gray-200"}`}>
                            <div className="flex justify-between items-center mb-4 border-b pb-2 border-white/5">
                              <div className={`h-5 md:h-6 rounded w-32 md:w-40 ${theme === "dark" ? "bg-white/10" : "bg-gray-100"}`}></div>
                              <div className={`h-6 md:h-8 rounded-md w-20 md:w-24 ${theme === "dark" ? "bg-[#81E6D9]" : "bg-[#1a1a1a]"}`}></div>
                            </div>
                            <div className="space-y-3 mb-2 flex-1">
                              {[...Array(3)].map((_, i) => (
                                <div key={i} className={`h-12 flex items-center justify-between p-2 rounded ${theme === "dark" ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
                                  <div className={`h-3 rounded w-1/4 ${theme === "dark" ? "bg-white/10" : "bg-gray-200"}`}></div>
                                  <div className={`h-5 rounded-full w-12 ${theme === "dark" ? "bg-[#81E6D9]/20" : "bg-[#1a1a1a]/10"}`}></div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Investor View Mockup */}
                        {activeStep === 1 && (
                          <div className={`h-full rounded-lg p-3 md:p-4 flex flex-col flex-wrap gap-2 ${theme === "dark" ? "bg-[#111111]" : "bg-white border border-gray-200"}`}>
                            <div className="grid grid-cols-2 gap-2 w-full h-1/3">
                              <div className={`rounded-lg p-2 flex flex-col justify-end ${theme === "dark" ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
                                <div className={`w-3/4 h-2 mb-2 rounded ${theme === "dark" ? "bg-white/20" : "bg-gray-300"}`}></div>
                                <div className={`w-1/2 h-4 rounded ${theme === "dark" ? "bg-white/60" : "bg-gray-800"}`}></div>
                              </div>
                              <div className={`rounded-lg p-2 flex flex-col justify-end ${theme === "dark" ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
                                <div className={`w-3/4 h-2 mb-2 rounded ${theme === "dark" ? "bg-[#81E6D9]/50" : "bg-[#1a1a1a]/50"}`}></div>
                                <div className={`w-1/2 h-4 rounded ${theme === "dark" ? "bg-[#81E6D9]" : "bg-[#1a1a1a]"}`}></div>
                              </div>
                            </div>
                            <div className={`w-full flex-1 rounded-lg p-2 flex items-end gap-1 ${theme === "dark" ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
                              <div className="w-1/4 h-[30%] bg-[#81E6D9]/40 rounded-t-sm"></div>
                              <div className="w-1/4 h-[50%] bg-[#81E6D9]/60 rounded-t-sm"></div>
                              <div className="w-1/4 h-[70%] bg-[#81E6D9]/80 rounded-t-sm"></div>
                              <div className="w-1/4 h-[100%] bg-[#81E6D9] rounded-t-sm"></div>
                            </div>
                          </div>
                        )}

                        {/* Logs Mockup */}
                        {activeStep === 2 && (
                          <div className={`h-full rounded-lg p-3 md:p-4 flex flex-col gap-2 ${theme === "dark" ? "bg-[#111111]" : "bg-white border border-gray-200"}`}>
                            <div className={`w-full h-6 mb-2 rounded ${theme === "dark" ? "bg-white/5" : "bg-gray-100"}`}></div>
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="flex gap-2 items-center">
                                <div className={`w-12 h-3 rounded ${theme === "dark" ? "bg-white/20" : "bg-gray-300"}`}></div>
                                <div className={`flex-1 h-3 rounded ${theme === "dark" ? "bg-white/10" : "bg-gray-200"}`}></div>
                                <div className={`w-8 h-3 rounded ${theme === "dark" ? "bg-[#81E6D9]/40" : "bg-[#1a1a1a]/20"}`}></div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
