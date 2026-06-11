import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

export default function PrivacyPolicy({ isModal = false }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const sections = [
        {
            title: "1. Definitions (DPDP Aligned)",
            content: [
                "Personal Data: Any data about an individual who is identifiable by or in relation to such data.",
                "Data Principal: The individual to whom the personal data relates (you).",
                "Data Fiduciary: Datalis, which determines the purpose and means of processing personal data.",
                "Data Processor: Any third party that processes data on behalf of Datalis."
            ]
        },
        {
            title: "2. Scope of This Policy",
            content: [
                "This Privacy Policy applies to:",
                "• The Dabby web application",
                "• Associated websites, dashboards, and services operated by Datalis",
                "It does not apply to third-party services integrated with Dabby, which are governed by their own privacy policies."
            ]
        },
        {
            title: "3. Personal Data We Collect",
            subsections: [
                {
                    subtitle: "3.1 Information You Provide",
                    content: [
                        "We may collect:",
                        "• Name",
                        "• Email address",
                        "• Organization name",
                        "• Account credentials",
                        "• Uploaded files containing business or financial data",
                        "• Communication details (support requests, feedback)"
                    ]
                },
                {
                    subtitle: "3.2 Automatically Collected Data",
                    content: [
                        "• IP address",
                        "• Browser and device information",
                        "• Usage logs and activity data",
                        "• Session and performance analytics"
                    ]
                },
                {
                    subtitle: "3.3 Uploaded Business Data",
                    content: [
                        "You may upload documents such as:",
                        "• Financial statements",
                        "• Accounting data",
                        "• Audit-related files",
                        "• CSV, Excel, PDF, or similar formats",
                        "Note: You are responsible for ensuring you have lawful rights to upload such data."
                    ]
                }
            ]
        },
        {
            title: "4. Purpose of Data Processing",
            content: [
                "We process personal data for the following lawful purposes under the DPDP Act:",
                "• To provide and operate the Dabby platform",
                "• To authenticate users and manage accounts",
                "• To process uploaded data and generate insights",
                "• To improve product performance and user experience",
                "• To provide customer support and service communication",
                "• To comply with legal or regulatory obligations",
                "• To prevent fraud, abuse, or security threats",
                "We do not sell personal data."
            ]
        },
        {
            title: "5. Consent & Lawful Use",
            content: [
                "By using Dabby, you provide explicit consent for data processing as described.",
                "You may withdraw consent at any time, subject to legal or contractual restrictions.",
                "Certain data processing may continue if required by law."
            ]
        },
        {
            title: "6. AI Processing & Automated Outputs",
            content: [
                "Dabby uses automated and AI-based systems to analyze uploaded data.",
                "AI-generated outputs are informational and depend on the quality of input data.",
                "We do not use uploaded customer data to train public AI models without consent.",
                "Users remain responsible for validating outputs before use."
            ]
        },
        {
            title: "7. Data Sharing & Disclosure",
            content: [
                "We may share data only with:",
                "• Authorized employees and contractors (need-to-know basis)",
                "• Trusted service providers (cloud hosting, analytics, payment processors)",
                "• Legal or regulatory authorities when required by law",
                "All data processors are contractually obligated to maintain confidentiality and security."
            ]
        },
        {
            title: "8. Data Storage & Retention",
            content: [
                "Data is stored on secure servers with reasonable safeguards.",
                "Personal data is retained only as long as necessary to fulfill stated purposes.",
                "Upon account deletion, data will be deleted or anonymized unless retention is required by law."
            ]
        },
        {
            title: "9. Data Security Measures",
            content: [
                "We implement reasonable safeguards, including:",
                "• Encryption in transit and at rest (where applicable)",
                "• Access control and authentication mechanisms",
                "• Regular monitoring and security reviews",
                "However, no system is completely secure, and absolute security cannot be guaranteed."
            ]
        },
        {
            title: "10. Rights of Data Principals (Your Rights)",
            content: [
                "Under the DPDP Act, you have the right to:",
                "• Access your personal data",
                "• Request correction or updating of inaccurate data",
                "• Request deletion of personal data",
                "• Withdraw consent",
                "• Grievance redressal",
                "Requests can be made by contacting us at the details provided below."
            ]
        },
        {
            title: "11. Grievance Redressal Officer",
            content: [
                "In accordance with Indian law, the following is our grievance contact:",
                "Grievance Officer",
                "Datalis - Founder's email",
                "📧 Email: medhanshk02@gmail.com",
                "Response Time: Within reasonable period as prescribed by law"
            ]
        },
        {
            title: "12. Children’s Data",
            content: [
                "Dabby is not intended for individuals under 18 years of age.",
                "We do not knowingly collect personal data of children."
            ]
        },
        {
            title: "13. Cross-Border Data Transfers",
            content: [
                "Where required for service delivery (e.g., cloud infrastructure), data may be processed outside India with appropriate safeguards and compliance measures."
            ]
        },
        {
            title: "14. Changes to This Policy",
            content: [
                "We may update this Privacy Policy periodically.",
                "Updates will be posted on this page, and continued use of the Service constitutes acceptance of the revised policy."
            ]
        },
        {
            title: "15. Contact Us",
            content: [
                "For any privacy-related questions or requests:",
                "Datalis",
                "📧 Email: opportunities@datalis.in",
                "📍 Operating from India"
            ]
        }
    ];

    return (
        <div className={`min-h-screen ${isModal ? "pt-8" : "pt-32"} pb-20 px-6 ${isDark ? "bg-black text-white" : "bg-[#f0f0f0] text-[#1e293b]"}`}>
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
                    <p className={`text-lg mb-12 ${isDark ? "text-white/60" : "text-[#1e293b]/60"}`}>
                        Last Updated: December 31, 2025
                    </p>

                    <div className="space-y-12">
                        <div className={`space-y-6 ${isDark ? "text-white/80" : "text-[#1e293b]/80"}`}>
                            <p className="text-lg leading-relaxed">
                                Datalis (“Company”, “we”, “us”, or “our”) respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, process, and protect personal data when you use Dabby, our Software-as-a-Service (SaaS) platform.
                            </p>
                            <p className="text-lg leading-relaxed font-medium">
                                This Policy is published in compliance with the Digital Personal Data Protection Act, 2023 (India) (“DPDP Act”).
                            </p>
                            <p className="text-lg leading-relaxed">
                                By accessing or using Dabby, you consent to the practices described in this Privacy Policy.
                            </p>
                        </div>

                        <div className="space-y-12 mt-12">
                            {sections.map((section, index) => (
                                <motion.section
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="scroll-mt-32"
                                    id={section.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}
                                >
                                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-[#1e293b]"}`}>
                                        {section.title}
                                    </h2>
                                    {section.content && (
                                        <div className="space-y-3">
                                            {section.content.map((p, i) => (
                                                <p key={i} className={isDark ? "text-white/80" : "text-[#1e293b]/80"}>
                                                    {p}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                    {section.subsections && (
                                        <div className="space-y-8 mt-6">
                                            {section.subsections.map((sub, i) => (
                                                <div key={i}>
                                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? "text-white" : "text-[#1e293b]"}`}>
                                                        {sub.subtitle}
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {sub.content.map((p, j) => (
                                                            <p key={j} className={isDark ? "text-white/80" : "text-[#1e293b]/80"}>
                                                                {p}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.section>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

