import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

const logos = [
  { id: 1, name: "TechCorp" },
  { id: 2, name: "FinanceHub" },
  { id: 3, name: "DataFlow" },
  { id: 4, name: "CloudScale" },
  { id: 5, name: "AIVentures" },
  { id: 6, name: "GlobalTech" },
];

export default function CustomerLogos() {
  const { theme } = useTheme();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  return (
    <section
      ref={sectionRef}
      className={`py-16 md:py-20 px-6 md:px-10 border-y ${theme === "dark" ? "border-white/5" : "border-gray-100"
        }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header - Centered */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className={`text-center text-sm font-medium uppercase tracking-wider mb-10 ${theme === "dark" ? "text-[#787878]" : "text-[#666666]"
            }`}
        >
          Trusted by Finance Teams at Leading Companies
        </motion.p>

        {/* Logo Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-8"
        >
          {logos.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + index * 0.05, duration: 0.4 }}
              className={`flex items-center justify-center h-12 md:h-14 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-300 ${theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-50"
                }`}
            >
              <span className={`font-semibold text-xs md:text-sm transition-all duration-300 ${theme === "dark"
                  ? "text-[#787878] hover:text-white"
                  : "text-[#666666] hover:text-[#292929]"
                }`}>
                {company.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
