import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

const features = [
  { label: "AI-Powered Insights" },
  { label: "Document Analysis" },
  { label: "Data Discovery" },
];

const logos = [
  { name: "TechCorp" },
  { name: "FinanceHub" },
  { name: "DataFlow" },
  { name: "CloudScale" },
  { name: "AIVentures" },
  { name: "GlobalTech" },
  { name: "TechCorp" },
  { name: "FinanceHub" },
  { name: "DataFlow" },
  { name: "CloudScale" },
];

export default function FinalCTA() {
  const { theme } = useTheme();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const isDark = theme === "dark";

  // Colors based on theme
  const panelColor = isDark
    ? "rgba(129, 230, 217, 0.05)"
    : "rgba(26, 26, 26, 0.03)";
  const panelBorder = isDark
    ? "rgba(129, 230, 217, 0.15)"
    : "rgba(26, 26, 26, 0.08)";
  const panelGlow = isDark
    ? "rgba(129, 230, 217, 0.1)"
    : "rgba(26, 26, 26, 0.05)";

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Background */}
      <div
        className={`relative py-20 md:py-28 px-6 md:px-10 ${isDark ? "bg-[#0a0a0a]" : "bg-[#f0f0f0]"
          }`}
      >
        {/* Left diagonal panels */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[150px] md:w-[250px] h-[300px] md:h-[400px] -translate-x-1/3"
          style={{
            background: `linear-gradient(135deg, ${panelColor} 0%, transparent 100%)`,
            transform:
              "translateY(-50%) translateX(-33%) rotate(-15deg) skewY(-5deg)",
            borderRadius: "20px",
            border: `1px solid ${panelBorder}`,
            boxShadow: `0 0 60px ${panelGlow}`,
          }}
        />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[100px] md:w-[180px] h-[250px] md:h-[350px] -translate-x-1/2"
          style={{
            background: `linear-gradient(135deg, ${panelColor} 0%, transparent 100%)`,
            transform:
              "translateY(-50%) translateX(-50%) rotate(-20deg) skewY(-8deg)",
            borderRadius: "20px",
            border: `1px solid ${panelBorder}`,
          }}
        />

        {/* Right diagonal panels */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[150px] md:w-[250px] h-[300px] md:h-[400px] translate-x-1/3"
          style={{
            background: `linear-gradient(225deg, ${panelColor} 0%, transparent 100%)`,
            transform:
              "translateY(-50%) translateX(33%) rotate(15deg) skewY(5deg)",
            borderRadius: "20px",
            border: `1px solid ${panelBorder}`,
            boxShadow: `0 0 60px ${panelGlow}`,
          }}
        />
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[100px] md:w-[180px] h-[250px] md:h-[350px] translate-x-1/2"
          style={{
            background: `linear-gradient(225deg, ${panelColor} 0%, transparent 100%)`,
            transform:
              "translateY(-50%) translateX(50%) rotate(20deg) skewY(8deg)",
            borderRadius: "20px",
            border: `1px solid ${panelBorder}`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <span className="px-2.5 py-1 text-xs font-semibold rounded bg-[#81E6D9] text-black">
              NEW
            </span>
            <span
              className={`px-3 py-1 text-sm rounded-full border ${isDark
                ? "border-white/10 text-gray-400"
                : "border-[#1a1a1a]/10 text-gray-500"
                }`}
            >
              Financial Intelligence
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
            className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 px-4 md:px-0 ${isDark ? "text-white" : "text-[#1a1a1a]"
              }`}
          >
            Ready to Transform Your
            <br className="hidden sm:block" />
            {" "}Financial Analysis?
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className={`text-sm md:text-lg mb-8 max-w-xl mx-auto px-6 md:px-0 ${isDark ? "text-gray-400" : "text-gray-600"
              }`}
          >
            Join hundreds of finance teams using Datalis to make faster, smarter
            decisions. Start your journey today.
          </motion.p>

          {/* Feature pills - No emojis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-8 px-4"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 px-4 md:px-5 py-1.5 md:py-2 rounded-full border ${isDark
                  ? "border-white/10 bg-white/5"
                  : "border-[#1a1a1a]/10 bg-white"
                  }`}
              >
                <span
                  className={`text-xs md:text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                >
                  {feature.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="px-6 md:px-0"
          >
            <a
              href="/signup"
              className={`w-full sm:w-auto inline-block px-8 md:px-10 py-3.5 md:py-4 text-base md:text-lg font-semibold text-black bg-[#81E6D9] rounded-full border border-[#81E6D9] hover:bg-transparent transition-all duration-200 ${isDark
                  ? "hover:text-white hover:border-white"
                  : "hover:text-[#1a1a1a] hover:border-[#1a1a1a]"
                }`}
            >
              Start Free Trial
            </a>
          </motion.div>

          {/* No credit card text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={`text-sm mt-4 mb-16 ${isDark ? "text-gray-500" : "text-gray-500"
              }`}
          >
            Start your data journey today • Cancel anytime
          </motion.p>

          {/* Logo Carousel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="relative w-full overflow-hidden"
          >
            <div
              className={`text-center text-xs font-medium uppercase tracking-wider mb-6 ${isDark ? "text-[#787878]" : "text-gray-400"
                }`}
            >
              Trusted by finance teams at
            </div>

            <div className="flex overflow-hidden">
              <motion.div
                className="flex gap-12 md:gap-20 items-center whitespace-nowrap"
                animate={{ x: [0, -1000] }}
                transition={{
                  repeat: Infinity,
                  duration: 20,
                  ease: "linear",
                }}
              >
                {[...logos, ...logos].map((logo, index) => (
                  <span
                    key={index}
                    className={`text-lg md:text-xl font-bold ${isDark
                      ? "text-[#787878] opacity-50"
                      : "text-gray-400 opacity-60"
                      }`}
                  >
                    {logo.name}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Gradient masks for fade effect */}
            <div
              className={`absolute inset-y-0 left-0 w-20 bg-gradient-to-r ${isDark
                ? "from-[#0a0a0a] to-transparent"
                : "from-[#f0f0f0] to-transparent"
                }`}
            />
            <div
              className={`absolute inset-y-0 right-0 w-20 bg-gradient-to-l ${isDark
                ? "from-[#0a0a0a] to-transparent"
                : "from-[#f0f0f0] to-transparent"
                }`}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
