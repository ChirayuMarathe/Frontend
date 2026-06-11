import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import { generateTemplateData } from "../../services/templateGeneratorService";
import { saveRedirectIntent } from "../../utils/redirectUtility";

// ─── Intent Classifier ──────────────────────────────────────────────────────

const INTENT_RULES = [
  { key: "quotation_template", keywords: ["quote", "quotation", "proposal", "pricing proposal", "price estimate", "client quote", "cost estimate", "project estimate", "business proposal", "rate card", "service quote"] },
  { key: "receivables_tracker", keywords: ["receivable", "unpaid invoice", "customer payment", "money owed", "collect payment", "outstanding payment", "debtors", "accounts receivable", "payment tracking", "pending payment", "overdue payment", "receivables checklist", "who owes me"] },
  { key: "payables_tracker", keywords: ["payable", "vendor payment", "accounts payable", "pay vendor", "supplier payment", "bill to pay", "outstanding bill", "creditors", "pay supplier", "vendor invoice", "i owe"] },
  { key: "invoice_template", keywords: ["invoice", "billing template", "bill client", "send invoice", "generate invoice", "tax invoice", "proforma invoice", "gst invoice"] },
  { key: "expense_tracker", keywords: ["expense", "spending", "cost tracker", "track spend", "reimbursement", "employee expense", "business expense", "petty cash"] },
  { key: "cashflow_tracker", keywords: ["cashflow", "cash flow", "cash in", "cash out", "liquidity", "runway", "inflow", "outflow", "burn rate"] },
  { key: "profit_loss", keywords: ["profit", "loss", "p&l", "income statement", "gross margin", "net income", "earnings", "profitability", "net profit"] },
  { key: "budget_planner", keywords: ["budget", "allocation", "spending plan", "forecast", "annual plan", "department budget", "monthly budget", "quarterly budget"] },
  { key: "sales_tracker", keywords: ["sales", "deal", "pipeline", "lead tracker", "crm", "conversion rate", "revenue target", "sales rep", "closed deals", "quota"] },
  { key: "inventory_tracker", keywords: ["inventory", "stock", "sku", "product quantity", "warehouse", "reorder", "units in stock"] },
  { key: "financial_model", keywords: ["financial model", "financial modeling", "financial projection", "three statement model", "3 statement model", "dcf", "valuation model", "financial forecast", "projections"] },
  { key: "custom_template", keywords: ["template", "dashboard", "tracker", "planner", "model", "sheet", "record", "log", "report", "journal", "register", "book"] },
];

function classifyIntent(prompt) {
  const p = prompt.toLowerCase();
  for (const rule of INTENT_RULES) {
    if (rule.keywords.some((kw) => p.includes(kw))) return rule.key;
  }
  return null;
}

// ─── Template Metadata (layouts — no hardcoded rows) ───────────────────────

const TEMPLATE_META = {
  quotation_template: { name: "Quotation Template", type: "quotation" },
  invoice_template: { name: "Invoice Template", type: "invoice" },
  receivables_tracker: { name: "Accounts Receivable Tracker", type: "receivables" },
  payables_tracker: { name: "Accounts Payable Tracker", type: "payables" },
  expense_tracker: { name: "Expense Tracker", type: "expense" },
  cashflow_tracker: { name: "Cashflow Planner", type: "cashflow" },
  profit_loss: { name: "Profit & Loss Sheet", type: "profit_loss" },
  budget_planner: { name: "Budget Planner", type: "budget" },
  sales_tracker: { name: "Sales Tracker", type: "sales" },
  inventory_tracker: { name: "Inventory Tracker", type: "inventory" },
  financial_model: { name: "Financial Model", type: "financial_model" },
  custom_template: { name: "Custom Financial Tracker", type: "custom" },
};

// ─── Currency Formatter ─────────────────────────────────────────────────────

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const pct = (n) => `${Number(n || 0).toFixed(1)}%`;

// ─── AI Data → Display Template Transformers ────────────────────────────────
// Each function receives the raw AI JSON and returns { headers, rows, meta?, summary? }

const TRANSFORMERS = {
  quotation_template(ai) {
    const items = ai.items || [];
    const meta = [
      { label: "Client Name", value: ai.client_name || "—" },
      { label: "Project", value: ai.project || "—" },
      { label: "Prepared Date", value: ai.prepared_date || new Date().toLocaleDateString("en-IN") },
      { label: "Validity", value: `${ai.validity_days || 30} days` },
    ];
    let grandTotal = 0;
    const rows = items.map((item) => {
      const subtotal = (item.qty || 0) * (item.unit_price || 0);
      const tax = subtotal * ((item.tax_percent || 18) / 100);
      const total = subtotal + tax;
      grandTotal += total;
      return [
        item.description || "—",
        `${item.qty} ${item.unit || ""}`.trim(),
        fmt(item.unit_price),
        fmt(subtotal),
        fmt(tax),
        fmt(total),
      ];
    });
    rows.push(["", "", "", "", "Grand Total", fmt(grandTotal)]);
    meta.push({ label: "Grand Total", value: `${fmt(grandTotal)} (incl. GST)` });
    return {
      headers: ["Item Description", "Qty / Unit", "Unit Price", "Subtotal", "Tax (18%)", "Total"],
      rows,
      meta,
    };
  },

  invoice_template(ai) {
    const items = ai.items || [];
    let grandTotal = 0;
    const rows = items.map((item) => {
      const subtotal = (item.qty || 0) * (item.unit_price || 0);
      const tax = subtotal * ((item.tax_percent || 18) / 100);
      const total = subtotal + tax;
      grandTotal += total;
      return [
        item.description || "—",
        `${item.qty} ${item.unit || ""}`.trim(),
        fmt(item.unit_price),
        `${item.tax_percent || 18}%`,
        fmt(total),
      ];
    });
    rows.push(["", "", "", "Grand Total", fmt(grandTotal)]);
    const meta = [
      { label: "Client", value: ai.client_name || "—" },
      { label: "Invoice No.", value: ai.invoice_no || "INV-001" },
      { label: "Date", value: ai.invoice_date || "—" },
      { label: "Due Date", value: ai.due_date || "—" },
      { label: "Grand Total", value: fmt(grandTotal) },
    ];
    return {
      headers: ["Item Description", "Qty / Unit", "Unit Price", "Tax %", "Amount"],
      rows,
      meta,
    };
  },

  receivables_tracker(ai) {
    const invoices = ai.invoices || [];
    const s = ai.summary || {};
    const summary = [
      { label: "Total Receivables", value: fmt(s.total_receivable) },
      { label: "Overdue Amount", value: fmt(s.overdue_amount) },
      { label: "Pending Invoices", value: String(s.pending_count ?? invoices.filter(i => i.status !== "Paid").length) },
    ];
    const rows = invoices.map((inv) => [
      inv.id || "—", inv.customer || "—", fmt(inv.amount),
      inv.issue_date || "—", inv.due_date || "—",
      inv.status || "Pending", inv.notes || "—",
    ]);
    return {
      headers: ["Invoice ID", "Customer", "Amount", "Issue Date", "Due Date", "Status", "Notes"],
      rows,
      summary,
    };
  },

  payables_tracker(ai) {
    const vendors = ai.vendors || [];
    const s = ai.summary || {};
    const summary = [
      { label: "Total Payable", value: fmt(s.total_payable) },
      { label: "Overdue Bills", value: fmt(s.overdue_bills) },
      { label: "Due This Week", value: String(s.due_this_week ?? 0) },
    ];
    const rows = vendors.map((v) => [
      v.vendor || "—", v.invoice_no || "—", fmt(v.amount),
      v.issue_date || "—", v.due_date || "—",
      v.status || "Pending", v.method || "NEFT",
    ]);
    return {
      headers: ["Vendor", "Invoice No.", "Amount", "Issue Date", "Due Date", "Status", "Method"],
      rows,
      summary,
    };
  },

  expense_tracker(ai) {
    const expenses = ai.expenses || [];
    const s = ai.summary || {};
    const summary = [
      { label: `Total Spent (${ai.month || "Month"})`, value: fmt(s.total_spent) },
      { label: "Budget Remaining", value: fmt(s.remaining) },
      { label: "Categories", value: String(s.category_count ?? new Set(expenses.map(e => e.category)).size) },
    ];
    const rows = expenses.map((e) => [
      e.date || "—", e.category || "—", e.description || "—",
      fmt(e.amount), e.paid_by || "—", e.receipt || "Pending",
    ]);
    return {
      headers: ["Date", "Category", "Description", "Amount", "Paid By", "Receipt"],
      rows,
      summary,
    };
  },

  cashflow_tracker(ai) {
    const months = ai.months || [];
    const s = ai.summary || {};
    const summary = [
      { label: "Cash on Hand", value: fmt(s.cash_on_hand) },
      { label: "Monthly Burn", value: fmt(s.monthly_burn) },
      { label: "Runway", value: `${s.runway_months ?? "—"} months` },
    ];
    let cumulative = 0;
    const rows = months.map((m) => {
      const net = (m.inflows || 0) - (m.outflows || 0);
      cumulative += net;
      return [
        m.label || "—",
        fmt(m.inflows),
        fmt(m.outflows),
        fmt(net),
        fmt(cumulative),
      ];
    });
    return {
      headers: ["Month", "Cash Inflows", "Cash Outflows", "Net Cashflow", "Cumulative"],
      rows,
      summary,
    };
  },

  profit_loss(ai) {
    const quarters = ai.quarters || [];
    const s = ai.summary || {};
    const summary = [
      { label: "FY Revenue", value: fmt(s.fy_revenue) },
      { label: "Net Profit", value: fmt(s.net_profit) },
      { label: "Profit Margin", value: pct(s.profit_margin_pct) },
    ];
    // Compute totals
    const totals = quarters.reduce((acc, q) => {
      acc.revenue += q.revenue || 0; acc.cogs += q.cost_of_goods || 0;
      acc.gross += (q.revenue - q.cost_of_goods) || 0;
      acc.sal += q.salaries || 0; acc.mkt += q.marketing || 0;
      acc.ga += q.general_admin || 0;
      return acc;
    }, { revenue: 0, cogs: 0, gross: 0, sal: 0, mkt: 0, ga: 0 });
    const fy_net = totals.gross - totals.sal - totals.mkt - totals.ga;

    const build = (label, fn) => [label, ...quarters.map(fn), fmt(quarters.reduce((a, q) => a + (fn(q) ? Number(fn(q).replace(/[₹,]/g, "")) : 0), 0))];

    const rows = [
      ["Gross Revenue", ...quarters.map(q => fmt(q.revenue)), fmt(totals.revenue)],
      ["Cost of Goods", ...quarters.map(q => fmt(q.cost_of_goods)), fmt(totals.cogs)],
      ["Gross Profit", ...quarters.map(q => fmt((q.revenue || 0) - (q.cost_of_goods || 0))), fmt(totals.gross)],
      ["Salaries & Payroll", ...quarters.map(q => fmt(q.salaries)), fmt(totals.sal)],
      ["Marketing & Ads", ...quarters.map(q => fmt(q.marketing)), fmt(totals.mkt)],
      ["General & Admin", ...quarters.map(q => fmt(q.general_admin)), fmt(totals.ga)],
      ["Net Profit", ...quarters.map(q => fmt((q.revenue || 0) - (q.cost_of_goods || 0) - (q.salaries || 0) - (q.marketing || 0) - (q.general_admin || 0))), fmt(fy_net)],
    ];
    return {
      headers: ["P&L Line Item", "Q1", "Q2", "Q3", "Q4", "Full Year"],
      rows,
      summary,
    };
  },

  budget_planner(ai) {
    const depts = ai.departments || [];
    const s = ai.summary || {};
    const summary = [
      { label: "Total Budget", value: fmt(s.total_budget) },
      { label: "Total Spent", value: fmt(s.total_spent) },
      { label: "Overall Used", value: pct(s.used_pct) },
    ];
    const rows = depts.map((d) => {
      const remaining = (d.budget || 0) - (d.spent || 0);
      const usedPct = d.budget ? ((d.spent / d.budget) * 100).toFixed(1) : "0";
      const status = Number(usedPct) >= 80 ? "Overdue" : Number(usedPct) >= 60 ? "Pending" : "Healthy";
      return [d.name, fmt(d.budget), fmt(d.spent), fmt(remaining), `${usedPct}%`, status];
    });
    return {
      headers: ["Department", "Annual Budget", "Spent (YTD)", "Remaining", "% Used", "Status"],
      rows,
      summary,
    };
  },

  sales_tracker(ai) {
    const team = ai.team || [];
    const s = ai.summary || {};
    const summary = [
      { label: "Total Pipeline", value: fmt(s.total_pipeline) },
      { label: "Closed Revenue", value: fmt(s.closed_revenue) },
      { label: "Avg. Conv. Rate", value: pct(s.avg_conversion_pct) },
    ];
    const rows = team.map((rep) => {
      const convPct = rep.leads ? ((rep.deals_closed / rep.leads) * 100).toFixed(1) : "0";
      const status = Number(convPct) >= 40 ? "Healthy" : Number(convPct) >= 25 ? "Pending" : "Overdue";
      return [rep.name, String(rep.leads), String(rep.deals_closed), fmt(rep.revenue), `${convPct}%`, status];
    });
    return {
      headers: ["Sales Rep", "Active Leads", "Deals Closed", "Revenue", "Conv. Rate", "Status"],
      rows,
      summary,
    };
  },

  inventory_tracker(ai) {
    const items = ai.items || [];
    const s = ai.summary || {};
    const summary = [
      { label: "Total SKUs", value: String(s.total_skus ?? items.length) },
      { label: "Low Stock Items", value: String(s.low_stock_items ?? items.filter(i => i.in_stock <= i.reorder_point).length) },
      { label: "Inventory Value", value: fmt(s.inventory_value ?? items.reduce((a, i) => a + (i.in_stock * i.unit_cost), 0)) },
    ];
    const rows = items.map((item) => {
      const value = (item.in_stock || 0) * (item.unit_cost || 0);
      const status = item.in_stock <= 0 ? "Critical" : item.in_stock <= item.reorder_point ? "Reorder" : "Healthy";
      return [item.sku, item.name, String(item.in_stock), String(item.reorder_point), fmt(item.unit_cost), fmt(value), status];
    });
    return {
      headers: ["SKU", "Product Name", "In Stock", "Reorder Pt.", "Unit Cost", "Stock Value", "Status"],
      rows,
      summary,
    };
  },

  financial_model(ai) {
    const years = ai.years || [];
    const s = ai.summary || {};
    const summary = [
      { label: "NPV", value: fmt(s.npv) },
      { label: "IRR", value: pct(s.irr) },
      { label: "Payback Period", value: `${s.payback_period} Yrs` },
    ];
    let cumulative = 0;
    const rows = years.map((y) => {
      const net = (y.revenue || 0) - (y.expenses || 0);
      cumulative += net;
      return [
        y.year || "—",
        fmt(y.revenue),
        fmt(y.expenses),
        fmt(y.ebitda),
        fmt(net),
        fmt(cumulative),
      ];
    });
    return {
      headers: ["Year", "Revenue", "Expenses", "EBITDA", "Net Cashflow", "Cumulative"],
      rows,
      summary,
    };
  },

  custom_template(ai) {
    const rows = (ai.rows || []).map((r) => [
      r.category, r.description, fmt(r.amount), r.date, r.status || "Active", r.notes || "—",
    ]);
    return {
      headers: ["Category", "Description", "Amount", "Date", "Status", "Notes"],
      rows,
    };
  },
};

function buildTemplate(key, aiData) {
  const meta = TEMPLATE_META[key] || TEMPLATE_META.custom_template;
  const transformer = TRANSFORMERS[key] || TRANSFORMERS.custom_template;
  const transformed = transformer(aiData);
  return { name: meta.name, type: meta.type, ...transformed };
}

// ─── Suggestion Pills ───────────────────────────────────────────────────────

const SUGGESTIONS = [
  { label: "Financial Model", prompt: "Build a 5-year financial model for a SaaS startup" },
  { label: "Invoice", prompt: "Generate an invoice for a digital marketing agency" },
  { label: "Quotation", prompt: "Create a quotation for roofing materials" },
  { label: "Expense Tracker", prompt: "Track expenses for a restaurant business" },
  { label: "Cashflow", prompt: "Build a cashflow planner for a startup" },
  { label: "Profit & Loss", prompt: "Create a profit and loss sheet for a retail business" },
  { label: "Sales Tracker", prompt: "Track sales pipeline for my SaaS team" },
];

const PLACEHOLDERS = [
  "Create a cashflow tracker for my startup",
  "Build a quotation for roofing materials",
  "Generate an invoice for web development services",
  "Track expenses for my restaurant business",
];

// ─── Loading Steps ──────────────────────────────────────────────────────────

const LOADING_STEPS = [
  { key: "detecting", label: "Detecting template type…" },
  { key: "generating", label: "Generating items with AI…" },
  { key: "preparing", label: "Preparing your template…" },
];

// ─── Status Badges ──────────────────────────────────────────────────────────

const STATUS_STYLES = {
  Paid: "bg-emerald-500/15 text-emerald-400", Confirmed: "bg-emerald-500/15 text-emerald-400",
  Healthy: "bg-emerald-500/15 text-emerald-400", Active: "bg-emerald-500/15 text-emerald-400",
  Pending: "bg-amber-500/15 text-amber-400", Reorder: "bg-amber-500/15 text-amber-400",
  Overdue: "bg-red-500/15 text-red-400", Critical: "bg-red-500/15 text-red-400",
  Due: "bg-red-500/15 text-red-400",
};

function CellContent({ value }) {
  return STATUS_STYLES[value]
    ? <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLES[value]}`}>{value}</span>
    : <>{value}</>;
}

// ─── Auth Modal ─────────────────────────────────────────────────────────────

function AuthModal({ onClose, theme }) {
  const isDark = theme === "dark";
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-2xl p-8 shadow-2xl border relative ${isDark ? "bg-[#111111] border-white/10" : "bg-white border-gray-200"}`}
      >
        <button onClick={onClose} className={`absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full transition-colors ${isDark ? "text-gray-500 hover:bg-white/10" : "text-gray-400 hover:bg-gray-100"}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="w-12 h-12 rounded-xl bg-[#81E6D9]/15 flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-[#81E6D9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>Generate your template</h3>
        <p className={`text-sm leading-relaxed mb-6 ${isDark ? "text-[#787878]" : "text-gray-500"}`}>
          Create a free account to generate and download AI-powered financial templates instantly.
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/signup" className="w-full py-3 px-6 text-sm font-semibold text-black bg-[#81E6D9] rounded-xl text-center hover:bg-[#5fd3c7] transition-colors duration-200">Create a free account</Link>
          <Link to="/login" className={`w-full py-3 px-6 text-sm font-semibold rounded-xl text-center border transition-colors duration-200 ${isDark ? "border-white/15 text-white hover:bg-white/5" : "border-gray-200 text-[#1a1a1a] hover:bg-gray-50"}`}>Sign in to existing account</Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Loading State UI ───────────────────────────────────────────────────────

function LoadingTemplate({ step, theme }) {
  const isDark = theme === "dark";
  const currentIdx = LOADING_STEPS.findIndex((s) => s.key === step);
  return (
    <motion.div key="loading" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="mt-10 w-full max-w-3xl mx-auto"
    >
      <div className={`rounded-2xl border p-8 ${isDark ? "bg-[#111111] border-white/10" : "bg-white border-gray-200"}`}>
        <div className="flex flex-col items-center gap-5">
          <div className="w-12 h-12 rounded-full border-2 border-[#81E6D9] border-t-transparent animate-spin" />
          <div className="space-y-2 text-center">
            {LOADING_STEPS.map((s, i) => (
              <motion.p key={s.key}
                initial={{ opacity: 0 }} animate={{ opacity: i <= currentIdx ? 1 : 0.25 }}
                className={`text-sm font-medium flex items-center justify-center gap-2 ${i < currentIdx ? (isDark ? "text-[#81E6D9]/60" : "text-[#0D9488]/60")
                  : i === currentIdx ? (isDark ? "text-white" : "text-[#1a1a1a]")
                    : (isDark ? "text-[#787878]/40" : "text-gray-300")
                  }`}
              >
                {i < currentIdx && <svg className="w-3.5 h-3.5 text-[#81E6D9]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                {i === currentIdx && <span className="w-1.5 h-1.5 rounded-full bg-[#81E6D9] animate-pulse inline-block" />}
                {s.label}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Template Preview Card ──────────────────────────────────────────────────

function TemplatePreview({ template, templateKey, onDownload, theme }) {
  const isDark = theme === "dark";
  const isFooterRow = (row) => row.filter(c => c !== "").length <= 2;

  return (
    <motion.div key={templateKey} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mt-8 w-full max-w-3xl mx-auto"
    >
      {/* Detected label */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs ${isDark ? "text-[#787878]" : "text-gray-400"}`}>Detected template:</span>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${isDark ? "bg-[#81E6D9]/10 border-[#81E6D9]/25 text-[#81E6D9]" : "bg-[#0D9488]/10 border-[#0D9488]/25 text-[#0D9488]"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#81E6D9]" />
          {template.name}
        </span>
      </div>

      <div className={`rounded-2xl border overflow-hidden shadow-xl ${isDark ? "bg-[#111111] border-white/10" : "bg-white border-gray-200"}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-white/8" : "border-gray-100"}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#81E6D9]/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[#81E6D9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>{template.name}</p>
          </div>
          <button onClick={onDownload} id="hero-download-btn"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-[#81E6D9] rounded-lg hover:bg-[#5fd3c7] transition-colors duration-200 whitespace-nowrap ml-4 flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download .xlsx
          </button>
        </div>

        {/* Meta strip (quotation / invoice) */}
        {template.meta && (
          <div className={`grid grid-cols-2 sm:grid-cols-3 gap-px border-b ${isDark ? "border-white/8 bg-white/4" : "border-gray-100 bg-gray-100"}`}>
            {template.meta.map((item) => (
              <div key={item.label} className={`px-4 py-3 ${isDark ? "bg-[#111111]" : "bg-white"}`}>
                <p className={`text-[10px] mb-0.5 ${isDark ? "text-[#787878]" : "text-gray-400"}`}>{item.label}</p>
                <p className={`text-xs font-semibold ${item.label === "Grand Total" ? "text-[#81E6D9]" : isDark ? "text-white" : "text-[#1a1a1a]"}`}>{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Summary strip */}
        {template.summary && (
          <div className={`grid grid-cols-3 divide-x border-b ${isDark ? "border-white/8 divide-white/8" : "border-gray-100 divide-gray-100"}`}>
            {template.summary.map((item) => (
              <div key={item.label} className="px-4 py-3 text-center">
                <p className={`text-sm font-bold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>{item.value}</p>
                <p className={`text-[10px] mt-0.5 ${isDark ? "text-[#787878]" : "text-gray-400"}`}>{item.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={isDark ? "bg-white/4" : "bg-gray-50"}>
                {template.headers.map((h) => (
                  <th key={h} className={`text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${isDark ? "text-[#787878]" : "text-gray-400"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {template.rows.map((row, ri) => {
                const footer = isFooterRow(row);
                return (
                  <tr key={ri} className={`border-t transition-colors ${isDark ? "border-white/5 hover:bg-white/3" : "border-gray-100 hover:bg-gray-50/60"}`}>
                    {row.map((cell, ci) => (
                      <td key={ci} className={`px-4 py-2.5 text-xs whitespace-nowrap ${footer && ci === row.length - 1 ? "font-bold text-[#81E6D9]" : isDark ? "text-gray-300" : "text-gray-700"}`}>
                        <CellContent value={cell} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className={`px-5 py-3 flex items-center gap-2 border-t ${isDark ? "border-white/5" : "border-gray-100"}`}>
          <svg className="w-3.5 h-3.5 text-[#81E6D9] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          <span className={`text-xs ${isDark ? "text-[#787878]" : "text-gray-400"}`}>Generated by Datalis AI · Powered by Groq</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Hero ──────────────────────────────────────────────────────────────

export default function Hero() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";

  const [searchParams, setSearchParams] = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [loadingStep, setLoadingStep] = useState(null);   // null | "detecting" | "generating" | "preparing"
  const [result, setResult] = useState(null);              // { key, template }
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [placeholderIndex] = useState(() => Math.floor(Math.random() * PLACEHOLDERS.length));
  const inputRef = useRef(null);

  // Auto-trigger from URL params
  const hasTriggered = useRef(false);
  useState(() => {
    const incomingPrompt = searchParams.get("prompt");
    if (incomingPrompt && !hasTriggered.current) {
        // We set the prompt and trigger after the first render
        setPrompt(incomingPrompt);
    }
  });

  const handleGenerate = async (overridePrompt) => {
    // If overridePrompt is a string (passed manually), use it.
    // If it's an event (from onClick) or null, use the state prompt.
    const activePrompt = (typeof overridePrompt === 'string') ? overridePrompt : prompt;
    
    if (!activePrompt || !activePrompt.trim()) { 
      inputRef.current?.focus(); 
      return; 
    }
    setResult(null);
    setError(null);

    try {
      // Step 1: Classify
      setLoadingStep("detecting");
      const key = classifyIntent(activePrompt);
      
      if (!key) {
        setError("Hey, I didn't get which template do you want, can you specify.");
        setLoadingStep(null);
        return;
      }
      
      await new Promise((r) => setTimeout(r, 400));

      // Step 2: Call Groq
      setLoadingStep("generating");
      const aiData = await generateTemplateData(activePrompt, key);

      // Step 3: Transform + render
      setLoadingStep("preparing");
      await new Promise((r) => setTimeout(r, 400));
      const template = buildTemplate(key, aiData);
      setResult({ key, template });

      // Clear search param after successful trigger
      setSearchParams({}, { replace: true });
    } catch (err) {
      console.error("[Hero] Generation failed:", err);
      setError(err.message || "Failed to generate template. Please try again.");
    } finally {
      setLoadingStep(null);
    }
  };

  // Trigger effect
  useState(() => {
    const incomingPrompt = searchParams.get("prompt");
    if (incomingPrompt && !hasTriggered.current) {
        hasTriggered.current = true;
        setTimeout(() => handleGenerate(incomingPrompt), 500);
    }
  });

  const handleKeyDown = (e) => { if (e.key === "Enter") handleGenerate(); };
  const handleSuggestion = (p) => { setPrompt(p); inputRef.current?.focus(); };

  const handleDownload = () => {
    if (!user) {
      saveRedirectIntent('/');
      setShowAuthModal(true);
      return;
    }
    if (!result) return;
    const { template, key } = result;
    const dataRows = template.rows.filter((row) => row.some((c) => c !== ""));
    const wsData = [template.headers, ...dataRows];
    const metaRows = [];
    if (template.meta) template.meta.forEach(({ label, value }) => metaRows.push([label, value]));
    if (template.summary) template.summary.forEach(({ label, value }) => metaRows.push([label, value]));
    if (metaRows.length) metaRows.push(["---"]);
    const fullSheet = [...metaRows, ...wsData];
    const ws = XLSX.utils.aoa_to_sheet(fullSheet);
    const colWidths = fullSheet[0]?.map((_, ci) =>
      Math.max(...fullSheet.map((row) => String(row[ci] ?? "").length), 10)
    ) ?? [];
    ws["!cols"] = colWidths.map((w) => ({ wch: Math.min(w + 4, 40) }));
    const wb = XLSX.utils.book_new();
    const sheetName = (template.name || "Template").substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${(template.name || "template").replace(/\s+/g, "_")}_Datalis.xlsx`);
  };

  const isLoading = loadingStep !== null;

  return (
    <>
      <AnimatePresence>
        {showAuthModal && <AuthModal theme={theme} onClose={() => setShowAuthModal(false)} />}
      </AnimatePresence>

      <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-3xl mx-auto">

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-center mb-6">
            <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${isDark ? "bg-[#81E6D9]/10 border-[#81E6D9]/25 text-[#81E6D9]" : "bg-[#0D9488]/10 border-[#0D9488]/25 text-[#0D9488]"}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#81E6D9] animate-pulse" />
              Autonomous Financial Operations
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className={`font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight text-center mb-4 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
          >
            The AI Workspace for
            <br className="hidden sm:block" />
            <span className="text-[#81E6D9]"> Financial Operations Teams.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-base md:text-lg text-center leading-relaxed mb-10 ${isDark ? "text-[#787878]" : "text-gray-500"}`}
          >
            Autonomous financial engine that transforms raw data into living intelligence.
            <br className="hidden md:block" />
            Automate ingestion, semantic mapping, and real-time monitoring in one collaborative workspace.
          </motion.p>

          {/* Input */}
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <div className={`flex flex-wrap sm:flex-nowrap items-center gap-2 p-2 rounded-2xl border shadow-lg transition-shadow ${isDark ? "bg-[#111111] border-white/10 shadow-black/30 focus-within:border-[#81E6D9]/40" : "bg-white border-gray-200 shadow-gray-100/80 focus-within:border-[#81E6D9]/60"}`}>
              <div className={`pl-3 flex-shrink-0 ${isDark ? "text-[#787878]" : "text-gray-400"}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </div>
              <input
                ref={inputRef} id="hero-prompt-input" type="text"
                value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={handleKeyDown}
                placeholder={PLACEHOLDERS[placeholderIndex]}
                disabled={isLoading}
                className={`flex-1 w-full bg-transparent text-sm md:text-base py-3 outline-none disabled:opacity-50 ${isDark ? "text-white placeholder-[#787878]" : "text-[#1a1a1a] placeholder-gray-400"}`}
              />
              <button id="hero-generate-btn" onClick={handleGenerate} disabled={isLoading}
                className="flex-shrink-0 w-full sm:w-auto flex items-center gap-2 px-5 py-3 text-sm font-semibold text-black bg-[#81E6D9] rounded-xl hover:bg-[#5fd3c7] disabled:opacity-60 transition-all duration-200"
              >
                {isLoading
                  ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span className="hidden sm:inline">Working…</span></>
                  : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg><span className="hidden sm:inline">Generate Template</span><span className="sm:hidden">Generate</span></>
                }
              </button>
            </div>
          </motion.div>

          {/* Auth hint */}
          {!user && (
            <p className={`text-center text-xs mt-3 ${isDark ? "text-[#787878]" : "text-gray-400"}`}>
              <span className="mr-1">🔒</span>
              Free account required to generate &amp; download templates.
              <Link to="/signup" className="ml-1 underline underline-offset-2 hover:text-[#81E6D9] transition-colors">Sign up free →</Link>
            </p>
          )}

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Suggestion Pills */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }} className="flex flex-wrap justify-center gap-2 mt-5">
            {SUGGESTIONS.map((s) => (
              <button key={s.label} onClick={() => handleSuggestion(s.prompt)} disabled={isLoading}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 disabled:opacity-40 ${isDark ? "border-white/12 text-[#b0b0b0] hover:border-[#81E6D9]/40 hover:text-[#81E6D9] hover:bg-[#81E6D9]/8" : "border-gray-200 text-gray-500 hover:border-[#81E6D9]/50 hover:text-[#0D9488] hover:bg-[#81E6D9]/10"}`}
              >
                {s.label}
              </button>
            ))}
          </motion.div>

          {/* Loading / Preview */}
          <AnimatePresence mode="wait">
            {isLoading && <LoadingTemplate key="loading" step={loadingStep} theme={theme} />}
            {!isLoading && result && (
              <TemplatePreview key={result.key} template={result.template} templateKey={result.key} onDownload={handleDownload} theme={theme} />
            )}
          </AnimatePresence>

          {/* Social proof */}
          <AnimatePresence>
            {!isLoading && !result && !error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className={`flex flex-wrap items-center justify-center gap-6 mt-10 pt-8 border-t ${isDark ? "border-white/8" : "border-gray-100"}`}
              >
                {[{ stat: "11+", label: "Template types" }, { stat: "Groq AI", label: "Instant generation" }, { stat: "Free", label: "To get started" }].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className={`text-base font-bold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>{item.stat}</span>
                    <span className={`text-sm ${isDark ? "text-[#787878]" : "text-gray-400"}`}>{item.label}</span>
                    {i < 2 && <span className={`ml-3 hidden sm:block w-px h-4 ${isDark ? "bg-white/10" : "bg-gray-200"}`} />}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>
    </>
  );
}
