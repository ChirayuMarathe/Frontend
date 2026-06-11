import { useTheme } from "../../context/ThemeContext";
import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import {
  HowItWorks,
  WhatYouCanGenerate,
  TheWorkspace,
  AIIntelligence,
  DataToDecisions,
  PricingSection,
  FinalCTASection,
} from "../components/LandingSections";

export default function Home() {
  const { theme } = useTheme();
  const [bgSize, setBgSize] = useState("100% auto");

  useEffect(() => {
    const updateBgSize = () => {
      const width = window.innerWidth;
      if (width < 640) setBgSize("300% auto");
      else if (width < 1024) setBgSize("180% auto");
      else setBgSize("100% auto");
    };
    updateBgSize();
    window.addEventListener("resize", updateBgSize);
    return () => window.removeEventListener("resize", updateBgSize);
  }, []);

  return (
    <div
      className={`min-h-screen relative ${theme === "dark" ? "bg-[#0a0a0a]" : "bg-[#f0f0f0]"}`}
      style={{
        backgroundImage: `url('/${theme === "dark" ? "bg-pattern.png" : "Basic Set (3).png"}')`,
        backgroundSize: bgSize,
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative z-10">
        <main>
          {/* Hero — AI Template Generator (do not modify) */}
          <Hero />

          {/* S1: How It Works */}
          <HowItWorks />

          {/* S2: Template Gallery */}
          <WhatYouCanGenerate />

          {/* S3: The Workspace */}
          <TheWorkspace />

          {/* S4: AI Intelligence */}
          <AIIntelligence />

          {/* S5: Data to Decisions */}
          <DataToDecisions />

          {/* S6: Pricing */}
          <PricingSection />

          {/* S7: Final CTA */}
          <FinalCTASection />
        </main>
      </div>
    </div>
  );
}


