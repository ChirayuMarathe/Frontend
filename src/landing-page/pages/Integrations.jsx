import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const connectors = [
  {
    name: "Supabase",
    description: "Realtime database sync with row-level security respected out of the box.",
  },
  {
    name: "QuickBooks",
    description: "Pull ledgers, invoices, and journal entries without brittle CSV uploads.",
  },
  {
    name: "Stripe",
    description: "Stream payouts, disputes, and subscription health directly into your analysis.",
  },
  {
    name: "Google Sheets",
    description: "Two-way sync for ad-hoc models that still live in spreadsheets.",
  },
];

export default function Integrations() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen pt-28 pb-24 px-6 md:px-12 ${isDark ? "bg-[#040607]" : "bg-[#f3f4f6]"}`}>
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 text-xs font-semibold rounded-full bg-[#81E6D9]/10 text-[#81E6D9] border border-[#81E6D9]/30"
          >
            Integrations
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-4xl md:text-5xl font-bold mt-6 mb-4 ${isDark ? "text-white" : "text-[#0f172a]"}`}
          >
            Plug into the tools you already run on.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`text-lg max-w-3xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Datalis keeps your finance data in sync across warehouses, SaaS systems, and spreadsheets with governed access controls.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {connectors.map((connector, index) => (
            <motion.div
              key={connector.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ delay: index * 0.05 }}
              className={`p-6 rounded-2xl border ${
                isDark ? "bg-[#080b0c] border-white/5" : "bg-white border-[#dfe3ea]"
              }`}
            >
              <h2 className={`text-2xl font-semibold mb-2 ${isDark ? "text-white" : "text-[#111827]"}`}>
                {connector.name}
              </h2>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>{connector.description}</p>
            </motion.div>
          ))}
        </div>

        <section className={`rounded-3xl border px-8 py-10 ${isDark ? "bg-[#070a0b] border-white/5" : "bg-white border-[#dfe3ea]"}`}>
          <h2 className={`text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-[#111827]"}`}>
            Need a custom connector?
          </h2>
          <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Our integration team ships new adapters in days, not sprints. Tell us what you need synced.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:opportunities@datalis.in?subject=New%20integration%20request"
              className="px-6 py-3 rounded-full border border-[#81E6D9] text-[#81E6D9] text-center hover:bg-[#81E6D9]/10 transition"
            >
              Email us
            </a>
            <a
              href="https://calendly.com/medhansh_k/new-meeting"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full text-center font-semibold bg-[#81E6D9] text-black hover:opacity-90 transition"
            >
              Talk to Founder
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

