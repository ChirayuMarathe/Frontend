import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

export default function TermsOfService({ isModal = false }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const sections = [
        {
            title: "1. About Datalis & Dabby",
            content: [
                "Datalis is a Software-as-a-Service (SaaS) solutions provider operating from India.",
                "Dabby is a data intelligence and analytics platform designed to help users upload, process, analyze, and derive insights from financial and business data.",
                "All services are governed by the laws of India."
            ]
        },
        {
            title: "2. Eligibility",
            content: [
                "To use Dabby, you must:",
                "Be at least 18 years of age",
                "Have the legal capacity to enter into a binding contract under Indian law",
                "Use the Service only for lawful purposes",
                "If you are using Dabby on behalf of an organization, you represent that you are authorized to bind that organization to these Terms."
            ]
        },
        {
            title: "3. Account Registration & Security",
            content: [
                "You must provide accurate, complete, and current information during registration.",
                "You are responsible for maintaining the confidentiality of your login credentials.",
                "You are fully responsible for all activities conducted through your account.",
                "You must notify us immediately of any unauthorized use or security breach.",
                "We reserve the right to suspend or terminate accounts that violate these Terms."
            ]
        },
        {
            title: "4. Use of the Service",
            content: [
                "You agree to use Dabby only for legitimate business and analytical purposes.",
                "You must not:",
                "• Upload illegal, misleading, or malicious content",
                "• Attempt to reverse engineer, decompile, or exploit the platform",
                "• Interfere with system security, performance, or integrity",
                "• Use the Service to violate any applicable laws or regulations",
                "• Use automated scripts or bots without authorization",
                "We may impose usage limits, rate limits, or feature restrictions to ensure fair usage."
            ]
        },
        {
            title: "5. Data Uploads & User Content",
            subsections: [
                {
                    subtitle: "5.1 Ownership",
                    content: [
                        "You retain full ownership of all data, documents, and content you upload (“User Data”).",
                        "By using Dabby, you grant us a limited, non-exclusive, revocable license to process your data solely to provide and improve the Service."
                    ]
                },
                {
                    subtitle: "5.2 Responsibility",
                    content: [
                        "You are solely responsible for the accuracy, legality, and integrity of your User Data.",
                        "Datalis does not verify the correctness or completeness of uploaded data."
                    ]
                },
                {
                    subtitle: "5.3 Confidentiality",
                    content: [
                        "We implement reasonable technical and organizational measures to protect your data. However, no system is completely secure, and we cannot guarantee absolute security."
                    ]
                }
            ]
        },
        {
            title: "6. AI-Generated Outputs & Insights",
            content: [
                "Dabby may generate automated insights, summaries, reports, or recommendations using AI models.",
                "These outputs are informational only and do not constitute professional, legal, financial, or audit advice.",
                "You are solely responsible for verifying outputs before relying on them for decision-making.",
                "Datalis shall not be liable for actions taken based on AI-generated results."
            ]
        },
        {
            title: "7. Subscription, Pricing & Payments",
            content: [
                "Certain features of Dabby may require paid subscriptions.",
                "Pricing, billing cycles, and plan details will be displayed at the time of purchase.",
                "All payments are non-refundable unless explicitly stated otherwise.",
                "We reserve the right to modify pricing or plans with reasonable notice.",
                "Taxes applicable under Indian law (including GST) may be charged additionally."
            ]
        },
        {
            title: "8. Intellectual Property Rights",
            content: [
                "All software, UI/UX, logos, trademarks, workflows, and proprietary technology used in Dabby are owned by Datalis.",
                "You are granted a limited, non-transferable, non-exclusive license to use the Service.",
                "You may not copy, modify, distribute, or create derivative works without written permission."
            ]
        },
        {
            title: "9. Third-Party Services & Integrations",
            content: [
                "Dabby may integrate with third-party tools (e.g., accounting software, data sources).",
                "We are not responsible for third-party services, content, or failures.",
                "Your use of third-party services is governed by their respective terms."
            ]
        },
        {
            title: "10. Suspension & Termination",
            content: [
                "We may suspend or terminate your access if:",
                "• You violate these Terms",
                "• Your use poses security or legal risks",
                "• Required by law or regulatory authorities",
                "Upon termination:",
                "• Your right to access the Service ends immediately",
                "• Data retention and deletion will follow our internal policies"
            ]
        },
        {
            title: "11. Disclaimer of Warranties",
            content: [
                "The Service is provided “as is” and “as available”.",
                "We do not warrant that:",
                "• The Service will be uninterrupted or error-free",
                "• Results will be accurate or reliable",
                "• The Service will meet all specific requirements",
                "To the maximum extent permitted by law, we disclaim all warranties, express or implied."
            ]
        },
        {
            title: "12. Limitation of Liability",
            content: [
                "To the fullest extent permitted under Indian law:",
                "• Datalis shall not be liable for indirect, incidental, special, or consequential damages",
                "• Our total liability shall not exceed the amount paid by you for the Service in the preceding 3 months"
            ]
        },
        {
            title: "13. Indemnification",
            content: [
                "You agree to indemnify and hold harmless Datalis from any claims, damages, losses, or expenses arising from:",
                "• Your use of the Service",
                "• Your violation of these Terms",
                "• Your violation of any law or third-party rights"
            ]
        },
        {
            title: "14. Changes to Terms",
            content: [
                "We may update these Terms from time to time.",
                "Continued use of the Service after updates constitutes acceptance of the revised Terms."
            ]
        },
        {
            title: "15. Governing Law & Jurisdiction",
            content: [
                "These Terms shall be governed by and construed in accordance with the laws of India.",
                "Any disputes shall be subject to the exclusive jurisdiction of courts located in India."
            ]
        },
        {
            title: "16. Contact Information",
            content: [
                "For questions or concerns regarding these Terms:",
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
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
                    <p className={`text-lg mb-12 ${isDark ? "text-white/60" : "text-[#1e293b]/60"}`}>
                        Last Updated: December 31, 2025
                    </p>

                    <div className="space-y-12">
                        <div className={`space-y-6 ${isDark ? "text-white/80" : "text-[#1e293b]/80"}`}>
                            <p className="text-lg leading-relaxed">
                                Welcome to Datalis. These Terms of Service (“Terms”) govern your access to and use of the Dabby software platform, applications, websites, and services (collectively, the “Service”) operated by Datalis (“Company”, “we”, “us”, or “our”).
                            </p>
                            <p className="text-lg leading-relaxed">
                                By accessing or using Dabby, you agree to be bound by these Terms. If you do not agree, please do not use the Service.
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

