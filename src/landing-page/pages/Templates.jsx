/**
 * Templates.jsx
 * A proper template marketplace with search, filtering, and rich previews.
 */
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { saveRedirectIntent } from "../../utils/redirectUtility";
import {
  FileText,
  ShoppingCart,
  FileCheck,
  Receipt,
  Truck,
  FileSpreadsheet,
  ArrowRight,
  Search,
  Filter,
  Star,
  Clock,
  Zap,
  TrendingUp
} from "lucide-react";

const CATEGORIES = ["All", "Financial", "Trackers", "Operations", "Legal", "Sales"];

const TEMPLATES = [
  {
    id: "invoice",
    title: "Professional Invoice",
    description: "Multi-currency invoicing with tax breakdown and professional branding. Perfect for freelancers and agencies.",
    category: "Financial",
    type: "AI-Generated",
    badge: "Popular",
    icon: <FileText className="w-6 h-6" />,
    color: "from-blue-500/20 to-blue-600/5",
    accent: "text-blue-500",
    path: "/templates/gst-invoice"
  },
  {
    id: "quotation",
    title: "Project Quotation",
    description: "Detailed price estimates with itemized costs and terms. Includes dynamic tax calculation.",
    category: "Sales",
    type: "AI-Generated",
    badge: "New",
    icon: <FileCheck className="w-6 h-6" />,
    color: "from-cyan-500/20 to-cyan-600/5",
    accent: "text-cyan-500"
  },
  {
    id: "cashflow-tracker",
    title: "Cashflow Planner",
    description: "Track monthly inflows and outflows. Forecast your business runway based on current burn rate.",
    category: "Financial",
    type: "AI-Generated",
    icon: <Zap className="w-6 h-6" />,
    color: "from-teal-500/20 to-teal-600/5",
    accent: "text-teal-500"
  },
  {
    id: "receivables-tracker",
    title: "Receivables Tracker",
    description: "Keep track of unpaid customer invoices and aging reports. Never miss a payment followup.",
    category: "Trackers",
    type: "AI-Generated",
    icon: <Clock className="w-6 h-6" />,
    color: "from-amber-500/20 to-amber-600/5",
    accent: "text-amber-500"
  },
  {
    id: "expense-tracker",
    title: "Business Expense Log",
    description: "Categorize business spending, track receipts, and monitor budget vs actual performance.",
    category: "Financial",
    type: "AI-Generated",
    icon: <Receipt className="w-6 h-6" />,
    color: "from-pink-500/20 to-pink-600/5",
    accent: "text-pink-500"
  },
  {
    id: "inventory-tracker",
    title: "Stock & Inventory",
    description: "Manage SKUs, reorder points, and inventory valuation for small businesses and e-commerce.",
    category: "Operations",
    type: "AI-Generated",
    icon: <Truck className="w-6 h-6" />,
    color: "from-emerald-500/20 to-emerald-600/5",
    accent: "text-emerald-500"
  },
  {
    id: "profit-loss",
    title: "P&L Statement",
    description: "Quarterly profit and loss summaries. Visualize your net margins and cost structures.",
    category: "Financial",
    type: "Financial Model",
    icon: <FileSpreadsheet className="w-6 h-6" />,
    color: "from-purple-500/20 to-purple-600/5",
    accent: "text-purple-500"
  },
  {
    id: "budget-planner",
    title: "Departmental Budget",
    description: "Allocate and track budgets across different teams or projects. View percentage utilization.",
    category: "Financial",
    type: "Trackers",
    icon: <Star className="w-6 h-6" />,
    color: "from-indigo-500/20 to-indigo-600/5",
    accent: "text-indigo-500"
  },
  {
    id: "financial-model",
    title: "Financial Model",
    description: "Detailed multi-year financial projections, valuation metrics, and scenario analysis for businesses.",
    category: "Financial",
    type: "AI-Generated",
    badge: "Hot",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "from-fuchsia-500/20 to-fuchsia-600/5",
    accent: "text-fuchsia-500"
  }
];

export default function Templates() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("id")?.replace(/-/g, " ") || "";

  const [search, setSearch] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "All" || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const handleAction = (template) => {
    // Map template IDs to descriptive natural language prompts
    const PROMPT_MAP = {
      "invoice": "Generate a professional invoice for my service business",
      "quotation": "Create a detailed quotation for a project estimate",
      "cashflow-tracker": "Build a monthly cashflow planner for my startup",
      "receivables-tracker": "Create an accounts receivable tracker for my agency",
      "expense-tracker": "Generate a business expense log to track my spending",
      "inventory-tracker": "Build a stock and inventory tracker for my warehouse",
      "profit-loss": "Create a quarterly profit and loss statement",
      "budget-planner": "Generate a departmental budget planner",
      "financial-model": "Build a 5-year financial model for a SaaS business"
    };

    const prompt = PROMPT_MAP[template.id] || `Generate a ${template.title} template`;
    navigate(`/?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className={`min-h-screen py-24 px-4 md:px-12 ${isDark ? "bg-black" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <section className="text-center mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${isDark ? "bg-[#81E6D9]/10 border-[#81E6D9]/25 text-[#81E6D9]" : "bg-[#0D9488]/10 border-[#0D9488]/25 text-[#0D9488]"
              }`}>
              <Zap className="w-3 h-3 fill-current" />
              Template Marketplace
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-4xl md:text-5xl font-bold mb-6 tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Tools to <span className="text-[#81E6D9]">Amplify</span> Your Business
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-lg max-w-2xl mx-auto mb-10 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Choose from our library of AI-powered financial documents and interactive trackers.
            Customize them instantly to fit your specific niche.
          </motion.p>

          {/* Search & Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Search Input */}
            <div className="relative group">
              <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isDark ? "text-gray-600 group-focus-within:text-[#81E6D9]" : "text-gray-400 group-focus-within:text-[#0D9488]"
                }`} />
              <input
                type="text"
                placeholder="Search for templates (e.g. invoice, payroll, roofing quota...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-14 pr-6 py-4 rounded-2xl border transition-all outline-none text-base ${isDark
                  ? "bg-[#111111] border-white/10 text-white focus:border-[#81E6D9]/50 focus:ring-4 focus:ring-[#81E6D9]/5"
                  : "bg-white border-gray-200 text-gray-900 focus:border-[#0D9488]/50 focus:ring-4 focus:ring-[#0D9488]/5 shadow-sm"
                  }`}
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === cat
                    ? "bg-[#81E6D9] text-black shadow-lg shadow-[#81E6D9]/20"
                    : isDark
                      ? "bg-[#111111] border border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Templates Marketplace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, index) => (
              <motion.div
                layout
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className={`group rounded-3xl border p-7 flex flex-col items-start transition-all relative overflow-hidden ${isDark
                  ? "bg-[#111111] border-white/10 hover:border-[#81E6D9]/40 shadow-xl shadow-black/50"
                  : "bg-white border-gray-200 hover:shadow-xl hover:border-[#0D9488]/30"
                  }`}
              >
                {/* Background Accent Gradient */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${template.color} blur-3xl -mr-12 -mt-12`} />

                {/* Card Header: Icon & Badges */}
                <div className="flex justify-between items-start w-full mb-6 relative">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"
                    }`}>
                    <div className={template.accent}>
                      {template.icon}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {template.badge && (
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-tight uppercase ${template.badge === "Popular"
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        : "bg-[#81E6D9]/10 text-[#81E6D9] border border-[#81E6D9]/20"
                        }`}>
                        {template.badge}
                      </span>
                    )}
                    <span className={`text-[10px] font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      {template.type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {template.title}
                  </h3>
                  <p className={`text-sm leading-relaxed mb-8 h-12 overflow-hidden line-clamp-2 ${isDark ? "text-gray-400" : "text-gray-600"
                    }`}>
                    {template.description}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="mt-auto w-full pt-6 border-t border-white/5 relative">
                  <button
                    onClick={() => handleAction(template)}
                    className={`w-full py-3 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 group/btn ${isDark
                      ? "bg-white/5 text-white hover:bg-[#81E6D9] hover:text-black border border-white/10 hover:border-transparent"
                      : "bg-gray-900 text-white hover:bg-[#0D9488]"
                      }`}
                  >
                    Generate with AI
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
              <Filter className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>No templates found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
          </motion.div>
        )}

        {/* Custom Request CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className={`mt-24 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden text-center border ${isDark ? "bg-[#111111] border-white/10" : "bg-white border-gray-200 shadow-xl"
            }`}
        >
          {/* Decorative glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#81E6D9]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Need a custom financial model?
            </h2>
            <p className={`text-base mb-10 max-w-xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Our AI can build complex trackers and models tailored to your business industry in seconds. Just tell us what you need.
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-10 py-4 text-base font-bold text-black bg-[#81E6D9] rounded-full hover:bg-[#71d6c9] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#81E6D9]/10"
            >
              Back to AI Generator <Zap className="w-4 h-4 fill-current" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


