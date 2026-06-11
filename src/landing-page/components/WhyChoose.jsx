import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const features = [
  {
    badge: "Real-time sync",
    title: "Powered by Your Data",
    description:
      "Connect directly to your PostgreSQL database. No data duplication, real-time insights from your own data.",
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
        />
      </svg>
    ),
  },
  {
    badge: "No-code queries",
    title: "Self-Service for Everyone",
    description:
      "No SQL required. Natural language queries. Empower your entire finance team to get insights without technical barriers.",
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    badge: "RAG-powered AI",
    title: "AI-Native Platform",
    description:
      "Built for the AI era from day one. RAG-powered insights, not just dashboards. Contextual understanding of your financial data.",
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

export default function WhyChoose() {
  const { theme } = useTheme();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section
      ref={sectionRef}
      className={`py-20 md:py-32 px-6 md:px-10 ${theme === "dark" ? "bg-[#0a0a0a]" : "bg-[#f0f0f0]"
        }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className={`text-4xl md:text-5xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-[#1a1a1a]"
              }`}
          >
            Why Choose Datalis
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className={`text-lg max-w-2xl mx-auto ${theme === "dark" ? "text-[#787878]" : "text-gray-600"
              }`}
          >
            Built different from day one. Here's what sets us apart from traditional BI tools.
          </motion.p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`group relative ${index === 2 ? "sm:col-span-2 lg:col-span-1" : ""}`}
            >
              <div
                className={`relative h-full p-6 md:p-8 rounded-2xl border transition-all duration-300 ${theme === "dark"
                    ? "bg-[#111111] border-white/5"
                    : "bg-white border-[#1a1a1a]/10"
                  } ${hoveredIndex === index
                    ? theme === "dark"
                      ? "border-[#81E6D9]/30 shadow-lg shadow-[#81E6D9]/5"
                      : "border-[#81E6D9]/50 shadow-xl shadow-[#81E6D9]/10"
                    : ""
                  }`}
              >
                {/* Icon */}
                <div className="relative mb-6">
                  <motion.div
                    animate={{
                      scale: hoveredIndex === index ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`w-16 h-16 rounded-xl flex items-center justify-center ${theme === "dark"
                        ? "bg-[#81E6D9]/10"
                        : "bg-[#81E6D9]/15"
                      }`}
                  >
                    <div className="w-8 h-8 text-[#81E6D9]">
                      {feature.icon}
                    </div>
                  </motion.div>

                  {/* Glow effect on hover */}
                  {hoveredIndex === index && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 rounded-xl bg-[#81E6D9]/20 blur-xl -z-10"
                    />
                  )}
                </div>

                {/* Badge */}
                <div className="mb-4">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${theme === "dark"
                        ? "bg-[#81E6D9]/10 text-[#81E6D9]"
                        : "bg-[#81E6D9]/15 text-[#0D9488]"
                      }`}
                  >
                    {feature.badge}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-[#1a1a1a]"
                    }`}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  className={`text-base leading-relaxed ${theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                >
                  {feature.description}
                </p>

                {/* Bottom accent line */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: hoveredIndex === index ? "100%" : 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#81E6D9] to-transparent"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
