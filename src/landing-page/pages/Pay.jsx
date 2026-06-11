import React, { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import BrandLogo from "../../components/common/BrandLogo";
import { backendService } from "../../services/backendService";

const PLAN_MAP = {
  starter: {
    id: "plan_SRmsVhJ0QhqV9c",
    name: "Starter",
    price: "₹4,000 / month",
  },
  professional: {
    id: "plan_SRmtPDeo0nETyy",
    name: "Professional",
    price: "₹10,000 / month",
  },
  business: {
    id: "plan_SRmu8QhH36PlP1",
    name: "Business",
    price: "₹15,000 / month",
  },
};

export default function Pay() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const planKey = params.get("plan")?.toLowerCase() || "starter";
  const plan = useMemo(() => PLAN_MAP[planKey] || PLAN_MAP.starter, [planKey]);

  const handleProceed = async () => {
    try {
      setLoading(true);
      const res = await backendService.createSubscriptionLink(plan.id);
      const url = res?.short_url;
      if (url) {
        window.location.href = url;
      } else {
        alert("Failed to create payment link. Please try again.");
      }
    } catch (e) {
      alert("Failed to create payment link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-black" : "bg-[#f0f0f0]"} px-6 py-12`}>
      <div className="max-w-lg mx-auto">
        <div className="flex justify-center mb-8">
          <BrandLogo iconSize={48} label="Dabby" />
        </div>

        <div className={`${isDark ? "bg-[#0a0a0a] border-white/10" : "bg-white border-gray-200"} border rounded-2xl p-8`}>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
            Proceed to Payment
          </h1>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"} mb-6`}>
            You selected the <span className="font-semibold">{plan.name}</span> plan
            ({plan.price}). Clicking the button below will open a secure Razorpay checkout.
          </p>

          <button
            onClick={handleProceed}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold transition-all ${isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-black text-white hover:bg-gray-800"}`}
          >
            {loading ? "Creating Link..." : "Proceed to Payment"}
          </button>

          <button
            onClick={() => navigate(-1)}
            className={`mt-4 w-full py-3 rounded-xl font-medium ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}



