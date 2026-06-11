import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import Pricing from "../components/Pricing";
import BrandLogo from "../../components/common/BrandLogo";
import { Link } from "react-router-dom";

export default function PricingPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0a0a0a]" : "bg-[#f0f0f0]"}`}>
      {/* Simple Header for Pricing Page */}
      <div className="pt-12 pb-6 px-6 flex justify-center">
        <Link to="/">
          <BrandLogo iconSize={48} label="Dabby" />
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Pricing showDetails />
      </motion.div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-6 pb-24 text-center">
        <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          Secure checkout via Razorpay. Need help?{" "}
          <a href="mailto:opportunities@datalis.in" className="text-[#81E6D9] hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}


