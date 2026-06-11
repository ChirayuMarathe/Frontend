import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

const testimonials = [
  {
    id: 1,
    quote: "Datalis has completely transformed how we approach financial analysis. The AI insights are incredibly accurate and professional.",
    author: "Aditi Rao",
    role: "CFO",
    company: "Vistara Dynamics",
    initials: "AR"
  },
  {
    id: 2,
    quote: "The ability to ask natural language questions to our financial data has been a game-changer. No more waiting for manual data processing.",
    author: "Rahul Deshmukh",
    role: "Finance Head",
    company: "Indus Logistics",
    initials: "RD"
  },
  {
    id: 4,
    quote: "The document analysis is incredible. We can now get deep insights from our financial statements in seconds.",
    author: "Vikram Singh",
    role: "VP Finance",
    company: "Apex Healthcare",
    initials: "VS"
  },
  {
    id: 5,
    quote: "Dabby AI understands our business context better than any tool we've used before. It's like having a financial analyst on demand.",
    author: "Sneha Gupta",
    role: "Controller",
    company: "Kaveri Software",
    initials: "SG"
  },
  {
    id: 8,
    quote: "We love how easy it is to manage our company data. Direct, real-time insights that help us make better decisions.",
    author: "Manish Pandey",
    role: "Director",
    company: "Trident Solutions",
    initials: "MP"
  }
];

export default function Testimonial() {
  const { theme } = useTheme();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const isDark = theme === "dark";

  // Duplicate testimonials for seamless loop
  const allTestimonials = [...testimonials, ...testimonials];

  // Split into 3 columns
  const column1 = allTestimonials.filter((_, i) => i % 3 === 0);
  const column2 = allTestimonials.filter((_, i) => i % 3 === 1);
  const column3 = allTestimonials.filter((_, i) => i % 3 === 2);

  const TestimonialCard = ({ testimonial }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-6 rounded-2xl border transition-all duration-300 mb-4 ${isDark
          ? "bg-[#0a0a0a] border-white/5 hover:border-[#81E6D9]/30"
          : "bg-white border-[#1a1a1a]/10 hover:border-[#81E6D9]/50 shadow-sm"
        }`}
    >
      {/* Avatar circle with initials */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 font-bold text-sm ${isDark ? "bg-[#81E6D9]/20 text-[#81E6D9]" : "bg-[#81E6D9]/20 text-[#0D9488]"
        }`}>
        {testimonial.initials}
      </div>

      {/* Quote */}
      <p className={`text-sm md:text-base leading-relaxed mb-4 ${isDark ? "text-gray-300" : "text-gray-700"
        }`}>
        "{testimonial.quote}"
      </p>

      {/* Author info */}
      <div>
        <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
          {testimonial.author}
        </p>
        <p className={`text-xs ${isDark ? "text-[#787878]" : "text-gray-500"}`}>
          {testimonial.role} • {testimonial.company}
        </p>
      </div>
    </motion.div>
  );

  const AnimatedColumn = ({ testimonials: items, delay = 0 }) => (
    <div className="relative">
      <motion.div
        animate={{ y: [0, "-50%"] }}
        transition={{
          y: {
            duration: 40,
            repeat: Infinity,
            ease: "linear",
            delay: delay
          }
        }}
        className="will-change-transform"
      >
        {items.map((t, index) => (
          <TestimonialCard key={`${t.id}-${index}`} testimonial={t} />
        ))}
      </motion.div>
    </div>
  );

  // Panel colors based on theme
  const panelColor = isDark ? "rgba(129, 230, 217, 0.03)" : "rgba(26, 26, 26, 0.02)";
  const panelBorder = isDark ? "rgba(129, 230, 217, 0.1)" : "rgba(26, 26, 26, 0.05)";

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Background with diagonal panels */}
      <div className={`relative py-20 md:py-28 px-6 md:px-10 ${isDark ? "bg-[#111111]" : "bg-gray-50"
        }`}>

        {/* Left diagonal panel */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[200px] md:w-[350px] h-[400px] md:h-[600px] -translate-x-1/3"
          style={{
            background: `linear-gradient(135deg, ${panelColor} 0%, transparent 100%)`,
            transform: "translateY(-50%) translateX(-33%) rotate(-15deg) skewY(-3deg)",
            borderRadius: "30px",
            border: `1px solid ${panelBorder}`,
          }}
        />

        {/* Right diagonal panel */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[200px] md:w-[350px] h-[400px] md:h-[600px] translate-x-1/3"
          style={{
            background: `linear-gradient(225deg, ${panelColor} 0%, transparent 100%)`,
            transform: "translateY(-50%) translateX(33%) rotate(15deg) skewY(3deg)",
            borderRadius: "30px",
            border: `1px solid ${panelBorder}`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${isDark ? "text-white" : "text-[#1a1a1a]"
                }`}
            >
              Trusted by Finance Teams Worldwide
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.5 }}
              className={`text-base md:text-lg max-w-2xl mx-auto ${isDark ? "text-[#787878]" : "text-gray-600"
                }`}
            >
              Join a growing community of finance professionals who choose Datalis for seamless insights.
            </motion.p>
          </div>

          {/* Masonry Grid with Infinite Scroll */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] md:max-h-[600px] overflow-hidden relative">
            {/* Gradient fade top */}
            <div className={`absolute top-0 left-0 right-0 h-24 z-10 pointer-events-none ${isDark ? "bg-gradient-to-b from-[#111111] to-transparent" : "bg-gradient-to-b from-gray-50 to-transparent"
              }`} />

            {/* Gradient fade bottom */}
            <div className={`absolute bottom-0 left-0 right-0 h-24 z-10 pointer-events-none ${isDark ? "bg-gradient-to-t from-[#111111] to-transparent" : "bg-gradient-to-t from-gray-50 to-transparent"
              }`} />

            <AnimatedColumn testimonials={column1} delay={0} />
            <div className="hidden sm:block">
              <AnimatedColumn testimonials={column2} delay={0.5} />
            </div>
            <div className="hidden lg:block">
              <AnimatedColumn testimonials={column3} delay={1} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
