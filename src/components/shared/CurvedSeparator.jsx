import { useTheme } from "../../context/ThemeContext";

export default function CurvedSeparator() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className="relative w-full">
            {/* Simple curved SVG separator */}
            <svg
                viewBox="0 0 1440 100"
                className="w-full h-[60px] md:h-[80px]"
                preserveAspectRatio="none"
            >
                <path
                    d="M0,0 L0,40 Q720,100 1440,40 L1440,0 Z"
                    fill={isDark ? "#0a0a0a" : "#f0f0f0"}
                />
            </svg>

            {/* Center neon glow line */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] md:w-[300px] h-[2px]"
                style={{
                    background: "linear-gradient(90deg, transparent, #81E6D9, transparent)",
                    boxShadow: "0 0 20px rgba(129, 230, 217, 0.6), 0 0 40px rgba(129, 230, 217, 0.3)",
                }}
            />
        </div>
    );
}
