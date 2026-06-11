import React, { useState, useEffect } from "react";

const ThinkingIndicator = ({ context = "processing" }) => {
    const [stage, setStage] = useState(0);

    // Define stages based on context
    const getStages = () => {
        if (context.includes("upload")) {
            return ["Reading files...", "Extracting data...", "Preparing analysis..."];
        }
        if (context.includes("web")) {
            return ["Searching web...", "Reading sources...", "Synthesizing answer..."];
        }
        return ["Analyzing query...", "checking context...", "Drafting response..."];
    };

    const stages = getStages();

    useEffect(() => {
        const interval = setInterval(() => {
            setStage((prev) => (prev + 1) % stages.length);
        }, 2000); // Change text every 2 seconds
        return () => clearInterval(interval);
    }, [stages.length]);

    return (
        <div className="flex items-center gap-3 py-2 px-1 animate-fade-in">
            {/* Animated Pulse Ring */}
            <div className="relative flex items-center justify-center w-6 h-6">
                <span className="absolute w-full h-full rounded-full bg-teal-500/20 animate-ping"></span>
                <div className="relative w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>
            </div>

            {/* Typing Text Effect */}
            <div className="flex flex-col">
                <span className="text-sm font-medium text-teal-300/90 tracking-wide">
                    {stages[stage]}
                </span>
            </div>
        </div>
    );
};

export default ThinkingIndicator;
