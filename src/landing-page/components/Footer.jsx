import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const footerLinks = {
  Product: [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Integrations", href: "/integrations" },
    { name: "API", href: "/api" },
  ],
  Company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/about#connect-with-us" },
  ],
  Resources: [
    { name: "Documentation", href: "/docs" },
    { name: "Help Center", href: "/help" },
    {
      name: "Community",
      href: "https://chat.whatsapp.com/Jn0lBRC9EHX8cXERcYX3IP",
      external: true,
    },
  ],
  Legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ],
};

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer
      className={`pt-16 md:pt-20 pb-10 px-6 md:px-10 relative border-t ${theme === "dark" ? "border-white/10" : "border-black/10"
        }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 md:gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <img
                src={theme === "dark" ? "/Datalis_Logo.png" : "/Datalis_Logo-2.png"}
                alt="Datalis"
                className="h-8 md:h-10 w-auto"
                loading="lazy"
                decoding="async"
              />
            </Link>
            <p
              className={`text-sm max-w-xs mb-4 ${theme === "dark" ? "text-white/60" : "text-[#292929]/60"
                }`}
            >
              AI-Powered Financial Intelligence for Modern Finance Teams
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4
                className={`font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-[#292929]"
                  }`}
              >
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm transition-colors ${theme === "dark"
                          ? "text-white/60 hover:text-white"
                          : "text-[#292929]/60 hover:text-[#292929]"
                          }`}
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className={`text-sm transition-colors ${theme === "dark"
                          ? "text-white/60 hover:text-white"
                          : "text-[#292929]/60 hover:text-[#292929]"
                          }`}
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div
          className={`pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 ${theme === "dark" ? "border-white/10" : "border-black/10"
            }`}
        >
          <p
            className={`text-sm ${theme === "dark" ? "text-white/50" : "text-[#292929]/50"
              }`}
          >
            © {new Date().getFullYear()} Datalis. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className={`text-sm transition-colors ${theme === "dark"
                ? "text-white/50 hover:text-white"
                : "text-[#292929]/50 hover:text-[#292929]"
                }`}
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className={`text-sm transition-colors ${theme === "dark"
                ? "text-white/50 hover:text-white"
                : "text-[#292929]/50 hover:text-[#292929]"
                }`}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
