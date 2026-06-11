import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

/**
 * SectionDivider - Animated gradient divider between sections
 */
export default function SectionDivider({
    variant = "gradient", // 'gradient' | 'line' | 'dots' | 'wave'
    className = "",
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const { theme } = useTheme();

    if (variant === "gradient") {
        return (
            <div ref={ref} className={`relative h-px overflow-hidden ${className}`}>
                <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className={`absolute inset-0 ${theme === "dark"
                            ? "bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            : "bg-gradient-to-r from-transparent via-black/10 to-transparent"
                        }`}
                    style={{ transformOrigin: "center" }}
                />
            </div>
        );
    }

    if (variant === "line") {
        return (
            <div ref={ref} className={`flex items-center justify-center py-8 ${className}`}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: "100%" } : {}}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className={`h-px max-w-md ${theme === "dark" ? "bg-white/10" : "bg-black/10"
                        }`}
                />
            </div>
        );
    }

    if (variant === "dots") {
        return (
            <div ref={ref} className={`flex items-center justify-center gap-2 py-8 ${className}`}>
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={isInView ? { scale: 1, opacity: 1 } : {}}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        className={`w-1.5 h-1.5 rounded-full ${theme === "dark" ? "bg-white/30" : "bg-black/20"
                            }`}
                    />
                ))}
            </div>
        );
    }

    if (variant === "wave") {
        return (
            <div ref={ref} className={`relative h-16 overflow-hidden ${className}`}>
                <motion.svg
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 1440 64"
                    preserveAspectRatio="none"
                >
                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={isInView ? { pathLength: 1 } : {}}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        d="M0,32 C360,64 720,0 1080,32 C1260,48 1380,16 1440,32"
                        fill="none"
                        stroke={theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                        strokeWidth="1"
                    />
                </motion.svg>
            </div>
        );
    }

    return null;
}
