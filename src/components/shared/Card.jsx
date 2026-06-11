import { motion } from "framer-motion";

const variants = {
  light: "bg-white border border-gray-200 hover:shadow-lg",
  dark: "bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20",
  glass: "bg-white/10 backdrop-blur-xl border border-white/20",
  gradient:
    "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700",
};

export default function Card({
  children,
  variant = "dark",
  className = "",
  hover = true,
  ...props
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.02 } : {}}
      transition={{ duration: 0.3 }}
      className={`rounded-3xl transition-all duration-300 ${variants[variant]} ${className.includes('p-') ? '' : 'p-8'} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
