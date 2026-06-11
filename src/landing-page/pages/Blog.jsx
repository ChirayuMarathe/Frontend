import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const posts = [
  {
    title: "Why finance teams need agentic AI",
    summary:
      "A practical lens on how controllers use Datalis to consolidate books, automate reconciliations, and push faster closes.",
    tag: "Insights",
    readTime: "6 min read",
  },
  {
    title: "Inside the Datalis data stack",
    summary:
      "From Supabase to our semantic layer—here's the architecture blueprint and the trade-offs we made along the way.",
    tag: "Engineering",
    readTime: "8 min read",
  },
  {
    title: "Playbook: Launching a finance command center",
    summary:
      "Step-by-step guide to stand up a KPI cockpit for CXOs with zero spreadsheets ping-ponging around.",
    tag: "Playbook",
    readTime: "5 min read",
  },
];

export default function Blog() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen pt-28 pb-24 px-6 md:px-12 ${isDark ? "bg-black" : "bg-[#f7f7f7]"}`}>
      <div className="max-w-5xl mx-auto">
        <header className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 text-xs font-semibold rounded-full bg-[#81E6D9]/10 text-[#81E6D9] border border-[#81E6D9]/20"
          >
            Blog
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-4xl md:text-5xl font-bold mt-5 mb-4 ${isDark ? "text-white" : "text-[#101010]"}`}
          >
            Notes from the Datalis team
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-lg max-w-2xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Product drops, finance automation deep-dives, and customer playbooks delivered without fluff.
          </motion.p>
        </header>

        <div className="space-y-6">
          {posts.map((post) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`p-6 rounded-3xl border ${isDark ? "bg-[#0a0a0a] border-white/5" : "bg-white border-[#e5e5e5]"}`}
            >
              <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-[#81E6D9]">
                <span>{post.tag}</span>
                <span className={isDark ? "text-gray-500" : "text-gray-400"}>•</span>
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>{post.readTime}</span>
              </div>
              <h2 className={`text-2xl font-semibold mt-4 mb-2 ${isDark ? "text-white" : "text-[#111]"}`}>
                {post.title}
              </h2>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>{post.summary}</p>
              <button className="mt-5 inline-flex items-center gap-2 text-[#81E6D9] text-sm font-semibold">
                Read story
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}

