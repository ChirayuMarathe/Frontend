import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const capabilities = [
  {
    title: "Secure authentication",
    description: "Issue service tokens with granular scopes and rotate them instantly.",
  },
  {
    title: "Intelligence API",
    description: "Push datasets from any system and fetch normalized insights back.",
  },
  {
    title: "Workflow triggers",
    description: "Kick off automations, send alerts, or push data downstream via REST webhooks.",
  },
];

export default function Api() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen pt-28 pb-24 px-6 md:px-12 ${isDark ? "bg-[#030712]" : "bg-[#f3f4f6]"}`}>
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 text-xs font-semibold rounded-full bg-[#81E6D9]/10 text-[#81E6D9] border border-[#81E6D9]/30"
          >
            API
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-4xl md:text-5xl font-bold mt-6 mb-4 ${isDark ? "text-white" : "text-[#0f172a]"}`}
          >
            Programmatic access to Datalis intelligence.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`text-lg max-w-3xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Stream data in, orchestrate automations, and embed AI insights into your own products.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {capabilities.map((capability) => (
            <motion.div
              key={capability.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              className={`p-6 rounded-2xl border ${
                isDark ? "bg-[#050a14] border-white/5" : "bg-white border-[#dfe3ea]"
              }`}
            >
              <h2 className={`text-xl font-semibold mb-3 ${isDark ? "text-white" : "text-[#0f172a]"}`}>
                {capability.title}
              </h2>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>{capability.description}</p>
            </motion.div>
          ))}
        </div>

        <section className={`rounded-3xl border px-8 py-10 ${isDark ? "bg-[#050a14] border-white/5" : "bg-white border-[#dfe3ea]"}`}>
          <h2 className={`text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-[#0f172a]"}`}>
            Access the API beta
          </h2>
          <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Request credentials and we’ll share the OpenAPI spec, Postman collection, and usage guardrails.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:opportunities@datalis.in?subject=API%20Access%20request"
              className="px-6 py-3 rounded-full border border-[#81E6D9] text-[#81E6D9] text-center hover:bg-[#81E6D9]/10 transition"
            >
              Email our team
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

