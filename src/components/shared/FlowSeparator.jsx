import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

/**
 * FlowSeparator - BlackLine-style visual flow component
 * Shows data flow from external sources → platform → applications
 */
export default function FlowSeparator({
    items = [
        {
            title: "YOUR DATA",
            subtitle: "Connect Sources",
            description: "Upload CSV, Excel, or connect directly to PostgreSQL databases",
            gridColor: "gray",
        },
        {
            title: "DATALIS PLATFORM",
            subtitle: "AI Processing",
            description: "Intelligent analysis with Dabby AI and automated KPI calculations",
            gridColor: "accent",
        },
        {
            title: "ACTIONABLE INSIGHTS",
            subtitle: "Export & Share",
            description: "Generate reports, dashboards, and real-time financial intelligence",
            gridColor: "gradient",
        },
    ],
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const { theme } = useTheme();

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    const arrowVariants = {
        hidden: { opacity: 0, scale: 0, x: -20 },
        visible: {
            opacity: 1,
            scale: 1,
            x: 0,
            transition: {
                duration: 0.4,
                delay: 0.3,
            },
        },
    };

    // Grid cell colors based on type
    const getGridColors = (type, index, total) => {
        if (type === "gray") {
            const opacity = theme === "dark" ? 0.3 + (index / total) * 0.2 : 0.1 + (index / total) * 0.15;
            return theme === "dark"
                ? `rgba(100, 100, 100, ${opacity})`
                : `rgba(50, 50, 50, ${opacity})`;
        }
        if (type === "accent") {
            return theme === "dark" ? "#81E6D9" : "#4FD1C5";
        }
        if (type === "gradient") {
            const colors = [
                theme === "dark" ? "#3b82f6" : "#2563eb", // blue
                theme === "dark" ? "#14b8a6" : "#0d9488", // teal
                theme === "dark" ? "#4FD1C5" : "#38B2AC", // teal
                theme === "dark" ? "#ec4899" : "#db2777", // pink
            ];
            return colors[index % colors.length];
        }
        return theme === "dark" ? "#333" : "#ddd";
    };

    // Render the grid icon based on type
    const renderGrid = (type, animate = false) => {
        const baseDelay = animate ? 0.1 : 0;

        if (type === "gray") {
            // 4x4 grid with varying opacity
            return (
                <div className="grid grid-cols-4 gap-1 w-24 h-24">
                    {[...Array(16)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={animate ? { scale: 0, opacity: 0 } : {}}
                            animate={animate && isInView ? { scale: 1, opacity: 1 } : {}}
                            transition={{ delay: baseDelay + i * 0.02, duration: 0.3 }}
                            className="rounded-sm"
                            style={{
                                backgroundColor: getGridColors("gray", i, 16),
                            }}
                        />
                    ))}
                </div>
            );
        }

        if (type === "accent") {
            // BlackLine-style yellow grid (2 large + 2 small on right)
            return (
                <div className="w-24 h-24 flex flex-col gap-1">
                    <div className="flex gap-1 flex-1">
                        <motion.div
                            initial={animate ? { scale: 0 } : {}}
                            animate={animate && isInView ? { scale: 1 } : {}}
                            transition={{ delay: baseDelay, duration: 0.4 }}
                            className="flex-1 rounded-md"
                            style={{ backgroundColor: getGridColors("accent", 0, 4) }}
                        />
                        <div className="w-8 flex flex-col gap-1">
                            <motion.div
                                initial={animate ? { scale: 0 } : {}}
                                animate={animate && isInView ? { scale: 1 } : {}}
                                transition={{ delay: baseDelay + 0.1, duration: 0.3 }}
                                className="flex-1 rounded-sm"
                                style={{ backgroundColor: getGridColors("accent", 1, 4) }}
                            />
                            <motion.div
                                initial={animate ? { scale: 0 } : {}}
                                animate={animate && isInView ? { scale: 1 } : {}}
                                transition={{ delay: baseDelay + 0.15, duration: 0.3 }}
                                className="flex-1 rounded-sm"
                                style={{ backgroundColor: getGridColors("accent", 2, 4) }}
                            />
                        </div>
                    </div>
                    <motion.div
                        initial={animate ? { scale: 0 } : {}}
                        animate={animate && isInView ? { scale: 1 } : {}}
                        transition={{ delay: baseDelay + 0.2, duration: 0.4 }}
                        className="h-8 rounded-md"
                        style={{ backgroundColor: getGridColors("accent", 3, 4) }}
                    />
                </div>
            );
        }

        if (type === "gradient") {
            // Colorful 2x2 grid
            return (
                <div className="grid grid-cols-2 gap-2 w-24 h-24">
                    {[...Array(4)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={animate ? { scale: 0, rotate: -10 } : {}}
                            animate={animate && isInView ? { scale: 1, rotate: 0 } : {}}
                            transition={{ delay: baseDelay + i * 0.1, duration: 0.4, type: "spring" }}
                            className="rounded-lg"
                            style={{ backgroundColor: getGridColors("gradient", i, 4) }}
                        />
                    ))}
                </div>
            );
        }

        return null;
    };

    return (
        <section
            ref={ref}
            className={`py-20 px-6 md:px-10 relative overflow-hidden ${theme === "dark" ? "bg-[#0a0a0a]" : "bg-[#f5f5f5]"
                }`}
        >
            <div className="max-w-6xl mx-auto">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4"
                >
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 md:gap-6">
                            {/* Item Card */}
                            <motion.div
                                variants={itemVariants}
                                className="flex flex-col items-center text-center max-w-xs"
                            >
                                {/* Grid Icon */}
                                <div className="mb-6">
                                    {renderGrid(item.gridColor, true)}
                                </div>

                                {/* Title */}
                                <span
                                    className={`text-xs font-semibold uppercase tracking-wider mb-2 ${item.gridColor === "accent"
                                        ? "text-[#81E6D9]"
                                        : theme === "dark" ? "text-white/50" : "text-[#292929]/50"
                                        }`}
                                >
                                    {item.title}
                                </span>

                                {/* Subtitle */}
                                <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-[#292929]"
                                    }`}>
                                    {item.subtitle}
                                </h3>

                                {/* Description */}
                                <p className={`text-sm leading-relaxed ${theme === "dark" ? "text-white/60" : "text-[#292929]/60"
                                    }`}>
                                    {item.description}
                                </p>
                            </motion.div>

                            {/* Arrow Connector (not after last item) */}
                            {index < items.length - 1 && (
                                <motion.div
                                    variants={arrowVariants}
                                    className="hidden md:block"
                                >
                                    <svg
                                        className={`w-8 h-8 ${theme === "dark" ? "text-white/20" : "text-[#292929]/20"
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                                        />
                                    </svg>
                                </motion.div>
                            )}
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
