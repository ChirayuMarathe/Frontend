import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const docSections = [
  {
    title: "Getting Started",
    description:
      "Spin up your workspace, connect your spreadsheets or databases, and invite teammates in under five minutes.",
    topics: [
      "Create your Datalis workspace",
      "Sync data from Supabase, AWS, and Google Sheets",
      "Configure environments and permissions",
    ],
  },
  {
    title: "Data Analysis",
    description:
      "Learn how to map columns, normalize source data, and make it analytics-ready for AI-driven insights.",
    topics: [
      "Column mapping best practices",
      "Versioning datasets",
      "Data validation & cleansing",
    ],
  },
  {
    title: "AI Insights",
    description:
      "Unlock natural-language querying, automated narratives, and deep document analysis powered by our in-house models.",
    topics: [
      "Prompt library",
      "Context-aware querying",
      "Document extraction techniques",
    ],
  },
  {
    title: "Automation",
    description:
      "Automate insight delivery, escalate threshold breaches, and push data back into your apps.",
    topics: [
      "Workflow builder",
      "Notifications & webhooks",
      "Audit logs & security",
    ],
  },
];

export default function Documentation() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen pt-28 pb-24 px-6 md:px-12 ${
        isDark ? "bg-[#050505]" : "bg-[#f7f7f7]"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <section className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 text-xs font-semibold rounded-full bg-[#81E6D9]/10 text-[#81E6D9] border border-[#81E6D9]/30"
          >
            Documentation
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-4xl md:text-5xl font-bold mt-6 mb-4 ${
              isDark ? "text-white" : "text-[#1a1a1a]"
            }`}
          >
            Build clarity with step-by-step guides.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`max-w-3xl mx-auto text-lg ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Deep dives, checklists, and architecture diagrams to help you ship reliable
            financial intelligence workflows with Datalis.
          </motion.p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {docSections.map((section) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`p-6 rounded-2xl border ${
                isDark
                  ? "bg-[#0b0b0b] border-white/5"
                  : "bg-white border-[#d9d9d9]"
              }`}
            >
              <h3
                className={`text-xl font-semibold mb-3 ${
                  isDark ? "text-white" : "text-[#1a1a1a]"
                }`}
              >
                {section.title}
              </h3>
              <p
                className={`text-sm mb-4 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {section.description}
              </p>
              <ul className="space-y-2 text-sm">
                {section.topics.map((topic) => (
                  <li
                    key={topic}
                    className={`flex items-center gap-2 ${
                      isDark ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#81E6D9]" />
                    {topic}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <section
          className={`rounded-3xl border px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 ${
            isDark ? "bg-[#0b0b0b] border-white/5" : "bg-white border-[#e0e0e0]"
          }`}
        >
          <div>
            <h2
              className={`text-2xl font-bold mb-3 ${
                isDark ? "text-white" : "text-[#1a1a1a]"
              }`}
            >
              Need something specific documented?
            </h2>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              Drop us a line and we will add walkthroughs tailored to your use case.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:opportunities@datalis.in?subject=Request%20for%20documentation"
              className="px-6 py-3 text-center rounded-full border border-[#81E6D9] text-[#81E6D9] hover:bg-[#81E6D9]/10 transition"
            >
              Email the Docs Team
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

