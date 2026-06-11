import { motion } from "framer-motion";

const variants = {
  primary: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-800",
  accent: "bg-cyan-100 text-cyan-700",
  dark: "bg-gray-800 text-white",
  new: "bg-gradient-to-r from-blue-600 to-cyan-500 text-white",
};

export default function Badge({
  children,
  variant = "primary",
  pulse = false,
  className = "",
  ...props
}) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${variants[variant]} ${className}`}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {children}
    </motion.span>
  );
}
