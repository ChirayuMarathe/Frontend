import { motion } from "framer-motion";

const variants = {
  // Note: For light mode, use dark:hover classes or handle in component
  primary: "bg-[#81E6D9] text-black border border-[#81E6D9] hover:bg-transparent dark:hover:text-white dark:hover:border-white hover:text-[#1a1a1a] hover:border-[#1a1a1a]",
  secondary:
    "bg-transparent text-gray-900 border border-gray-300 hover:border-gray-400 hover:bg-gray-100",
  yellow: "bg-primary-400 text-black hover:bg-primary-500",
  outline:
    "bg-transparent text-white border border-white/30 hover:border-white/50 hover:bg-white/10",
  dark: "bg-gray-900 text-white hover:bg-gray-800",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  rounded = "full",
  className = "",
  href,
  ...props
}) {
  const baseClasses = `inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-${rounded}`;
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  const Component = href ? "a" : "button";

  return (
    <Component href={href} className={classes} {...props}>
      {children}
    </Component>
  );
}
