import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

export default function HelpCenter() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen pt-28 pb-24 px-6 md:px-12 ${isDark ? "bg-[#030303]" : "bg-[#f5f5f5]"}`}>
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 text-xs font-semibold rounded-full bg-[#81E6D9]/10 text-[#81E6D9] border border-[#81E6D9]/20"
          >
            Help Center
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-4xl md:text-5xl font-bold mt-5 mb-4 ${isDark ? "text-white" : "text-[#0f172a]"}`}
          >
            We're here when you need real humans.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-lg max-w-2xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Ask a question, report an issue, or request a walkthrough. Our team responds to
            every request at opportunities@datalis.in within one business day.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className={`p-6 rounded-3xl border ${isDark ? "bg-[#070707] border-white/5" : "bg-white border-[#dcdcdc]"}`}>
            <h2 className={`text-xl font-semibold mb-3 ${isDark ? "text-white" : "text-[#111]"}`}>Office hours</h2>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>Monday to Friday · 9 AM – 6 PM IST</p>
            <p className={`mt-4 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              We'll acknowledge every ticket within six working hours.
            </p>
          </div>
          <div className={`p-6 rounded-3xl border ${isDark ? "bg-[#070707] border-white/5" : "bg-white border-[#dcdcdc]"}`}>
            <h2 className={`text-xl font-semibold mb-3 ${isDark ? "text-white" : "text-[#111]"}`}>Talk to a founder</h2>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              Need strategic help? We host whiteboard sessions for product evaluation.
            </p>
            <a
              href="https://calendly.com/medhansh_k/new-meeting"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold bg-[#81E6D9] text-black hover:opacity-90 transition"
            >
              Talk to Founder
            </a>
          </div>
          <div className={`p-6 rounded-3xl border ${isDark ? "bg-[#070707] border-white/5" : "bg-white border-[#dcdcdc]"}`}>
            <h2 className={`text-xl font-semibold mb-3 ${isDark ? "text-white" : "text-[#111]"}`}>WhatsApp Community</h2>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              Swap ideas with finance leaders and early adopters.
            </p>
            <a
              href="https://chat.whatsapp.com/Jn0lBRC9EHX8cXERcYX3IP"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center px-6 py-3 rounded-full border border-[#81E6D9] text-[#81E6D9] hover:bg-[#81E6D9]/10 transition"
            >
              Join the Community
            </a>
          </div>
        </div>

        <section className={`p-8 rounded-3xl border ${isDark ? "bg-[#050505] border-white/5" : "bg-white border-[#e3e3e3]"}`}>
          <h2 className={`text-2xl font-semibold mb-2 ${isDark ? "text-white" : "text-[#111]"}`}>
            Raise a support request
          </h2>
          <p className={`mb-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Your message lands directly in our shared inbox at opportunities@datalis.in.
          </p>
          <form
            action="mailto:opportunities@datalis.in"
            method="POST"
            encType="text/plain"
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex flex-col gap-2 text-sm font-medium">
                <span className={isDark ? "text-gray-200" : "text-gray-800"}>Full name</span>
                <input
                  type="text"
                  name="name"
                  required
                  className={`px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#81E6D9] ${
                    isDark
                      ? "bg-transparent border-white/10 text-white placeholder:text-gray-500"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                  placeholder="Priya Shah"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                <span className={isDark ? "text-gray-200" : "text-gray-800"}>Work email</span>
                <input
                  type="email"
                  name="email"
                  required
                  className={`px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#81E6D9] ${
                    isDark
                      ? "bg-transparent border-white/10 text-white placeholder:text-gray-500"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                  placeholder="you@company.com"
                />
              </label>
            </div>
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span className={isDark ? "text-gray-200" : "text-gray-800"}>Topic</span>
              <select
                name="topic"
                className={`px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#81E6D9] ${
                  isDark ? "bg-[#050505] border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <option value="support">Product support</option>
                <option value="billing">Billing</option>
                <option value="feature">Feature request</option>
                <option value="success">Implementation help</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span className={isDark ? "text-gray-200" : "text-gray-800"}>Message</span>
              <textarea
                name="message"
                rows="5"
                required
                className={`px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#81E6D9] ${
                  isDark
                    ? "bg-transparent border-white/10 text-white placeholder:text-gray-500"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
                placeholder="Tell us what's happening..."
              ></textarea>
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                className="px-8 py-3 rounded-full font-semibold bg-[#81E6D9] text-black hover:opacity-90 transition"
              >
                Submit request
              </button>
              <a
                href="https://calendly.com/medhansh_k/new-meeting"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 rounded-full font-semibold border border-[#81E6D9] text-[#81E6D9] text-center hover:bg-[#81E6D9]/10 transition"
              >
                Talk to Founder
              </a>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

