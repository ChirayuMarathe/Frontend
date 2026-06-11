import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const openings = [
  {
    title: "Founding Account Executive",
    location: "Remote · India",
    type: "Full-time",
    blurb: "Own revenue from discovery to close for mid-market finance teams adopting Datalis.",
  },
  {
    title: "Senior Fullstack Engineer",
    location: "Hybrid · Mumbai",
    type: "Full-time",
    blurb: "Ship production-grade retrieval pipelines and finance-specific workflows.",
  },
  {
    title: "Customer Success Lead",
    location: "Remote · India",
    type: "Full-time",
    blurb: "Design onboarding playbooks and be the voice of our customers."
  },
];

export default function Careers() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen pt-28 pb-24 px-6 md:px-12 ${isDark ? "bg-[#050505]" : "bg-[#f6f7fb]"}`}>
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 text-xs font-semibold rounded-full bg-[#81E6D9]/10 text-[#81E6D9] border border-[#81E6D9]/20"
          >
            Careers
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-4xl md:text-5xl font-bold mt-6 mb-4 ${isDark ? "text-white" : "text-[#101828]"}`}
          >
            Build finance intelligence for millions.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`max-w-3xl mx-auto text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            We're assembling a small, obsessive team of engineers, product operators, and finance experts.
          </motion.p>
        </header>

        <div className="space-y-6 mb-16">
          {openings.map((role) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`p-6 rounded-3xl border ${isDark ? "bg-[#080808] border-white/5" : "bg-white border-[#e4e7ec]"}`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-[#111827]"}`}>{role.title}</h2>
                  <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{role.blurb}</p>
                  <p className={`mt-3 text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                    {role.location} · {role.type}
                  </p>
                </div>
                <a
                  href={`mailto:opportunities@datalis.in?subject=Application%20-%20${encodeURIComponent(role.title)}`}
                  className="px-6 py-3 rounded-full border border-[#81E6D9] text-[#81E6D9] text-center hover:bg-[#81E6D9]/10 transition"
                >
                  Apply via Email
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <section className={`rounded-3xl border px-8 py-10 ${isDark ? "bg-[#080808] border-white/5" : "bg-white border-[#e4e7ec]"}`}>
          <h2 className={`text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-[#111827]"}`}>
            Don’t see a perfect role?
          </h2>
          <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Tell us how you can move the mission forward. We regularly craft custom roles for exceptional people.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:opportunities@datalis.in?subject=Future%20roles"
              className="px-6 py-3 rounded-full border border-[#81E6D9] text-[#81E6D9] text-center hover:bg-[#81E6D9]/10 transition"
            >
              Introduce yourself
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

