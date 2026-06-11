import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

const teamMembers = [
    {
        name: "Chirayu",
        role: "Frontend Developer & UI/UX Lead",
        description: "Crafting beautiful user interfaces and ensuring seamless user experiences.",
        initials: "C",
        linkedin: "https://www.linkedin.com/in/chirayu-marathe69/"
    },
    {
        name: "Medhansh",
        role: "Founder and CEO, Backend Dev",
        description: "Building scalable, secure backend systems and optimizing data processing pipelines.",
        initials: "M",
        linkedin: "https://www.linkedin.com/in/medhansh-khedekar45/"
    },
    {
        name: "Roshan Ajith",
        role: "Cyber Security",
        description: "Managing cloud infrastructure and ensuring reliable, secure deployment pipelines.",
        initials: "RA",
        linkedin: "https://www.linkedin.com/in/roshanajith/"
    },
    {
        name: "Parth",
        role: "AI/ML Engineer",
        description: "Developing and implementing cutting-edge AI models for data analysis and insights.",
        initials: "P",
        linkedin: "https://www.linkedin.com/in/parthparmar04/"
    }
];

const domains = [
    {
        icon: (
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        title: "Financial Analytics",
        description: "Advanced AI-powered analysis of financial data, forecasting, and trend detection for informed decision-making.",
        features: [
            "Real-time financial analysis",
            "Predictive trends",
            "Pattern recognition",
            "Insight generation"
        ]
    },
    {
        icon: (
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
        title: "Business Intelligence",
        description: "Transform raw business data into actionable insights with our AI-driven analysis tools and contextual intelligence.",
        features: [
            "Document analysis",
            "Market trend analysis",
            "Competitive insights",
            "Growth opportunities"
        ]
    },
    {
        icon: (
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        title: "Process Automation",
        description: "Streamline operations with intelligent automation of repetitive tasks and workflow optimization.",
        features: [
            "Workflow automation",
            "Task optimization",
            "Resource management",
            "AI-driven suggestions"
        ]
    }
];

export default function About() {
    const { theme } = useTheme();
    const heroRef = useRef(null);
    const visionRef = useRef(null);
    const domainRef = useRef(null);
    const teamRef = useRef(null);
    const contactRef = useRef(null);

    const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
    const visionInView = useInView(visionRef, { once: true, margin: "-100px" });
    const domainInView = useInView(domainRef, { once: true, margin: "-100px" });
    const teamInView = useInView(teamRef, { once: true, margin: "-100px" });
    const contactInView = useInView(contactRef, { once: true, margin: "-100px" });

    const isDark = theme === "dark";

    return (
        <div className={`min-h-screen ${isDark ? "bg-[#0a0a0a]" : "bg-[#f0f0f0]"}`}>
            {/* Hero Section */}
            <section ref={heroRef} className="pt-32 pb-20 px-6 md:px-10">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={heroInView ? { opacity: 1, y: 0 } : {}}
                        className="inline-block px-4 py-1.5 text-xs font-semibold rounded-full mb-6 bg-[#81E6D9]/10 text-[#81E6D9] border border-[#81E6D9]/20"
                    >
                        About Datalis
                    </motion.span>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={heroInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.1 }}
                        className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${isDark ? "text-white" : "text-[#1a1a1a]"
                            }`}
                    >
                        Transforming Business
                        <br />
                        With AI Intelligence
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={heroInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.2 }}
                        className={`text-lg md:text-xl max-w-2xl mx-auto ${isDark ? "text-[#787878]" : "text-gray-600"
                            }`}
                    >
                        Founded in 2025, Datalis is revolutionizing how businesses handle data analysis and decision-making through advanced AI technologies.
                    </motion.p>
                </div>
            </section>

            {/* Vision & Mission */}
            <section ref={visionRef} className="py-20 px-6 md:px-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-1.5 text-xs font-semibold rounded-full bg-[#81E6D9]/10 text-[#81E6D9] border border-[#81E6D9]/20">
                            What Drives Us
                        </span>
                    </div>

                    <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${isDark ? "text-white" : "text-[#1a1a1a]"
                        }`}>
                        Vision & Mission
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Vision Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={visionInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.2 }}
                            className={`p-8 rounded-2xl border ${isDark
                                ? "bg-gradient-to-br from-[#81E6D9]/10 to-transparent border-[#81E6D9]/20"
                                : "bg-gradient-to-br from-[#81E6D9]/10 to-transparent border-[#81E6D9]/30"
                                }`}
                        >
                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${isDark ? "bg-[#81E6D9]/10" : "bg-[#81E6D9]/15"
                                }`}>
                                <svg className="w-8 h-8 text-[#81E6D9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <h3 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                                To empower every SME and accountant
                            </h3>
                            <p className={`text-base leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                To empower every SME and accountant in India with a virtual data team that turns cluttered data into clarity and actionable insights.
                            </p>
                        </motion.div>

                        {/* Mission Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={visionInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.3 }}
                            className={`p-8 rounded-2xl border ${isDark
                                ? "bg-gradient-to-br from-[#4FD1C5]/10 to-transparent border-[#4FD1C5]/20"
                                : "bg-gradient-to-br from-[#4FD1C5]/10 to-transparent border-[#4FD1C5]/30"
                                }`}
                        >
                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${isDark ? "bg-[#4FD1C5]/10" : "bg-[#4FD1C5]/15"
                                }`}>
                                <svg className="w-8 h-8 text-[#4FD1C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <h3 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                                To build India's first intelligent platform
                            </h3>
                            <p className={`text-base leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                To build India's first intelligent, and modular data platform that simplifies ETL, automates insights, and personalizes decision support for SMBs.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Domain Excellence */}
            <section ref={domainRef} className={`py-20 px-6 md:px-10 ${isDark ? "bg-[#111111]" : "bg-gray-50"}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-1.5 text-xs font-semibold rounded-full bg-[#81E6D9]/10 text-[#81E6D9] border border-[#81E6D9]/20 mb-6">
                            Our Expertise
                        </span>
                        <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                            Domain Excellence
                        </h2>
                        <p className={`text-lg max-w-2xl mx-auto ${isDark ? "text-[#787878]" : "text-gray-600"}`}>
                            We specialize in transforming complex business challenges into streamlined solutions through our core domains of expertise.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {domains.map((domain, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={domainInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: index * 0.1 }}
                                className={`p-8 rounded-2xl border ${isDark ? "bg-[#0a0a0a] border-white/5" : "bg-white border-[#1a1a1a]/10"
                                    }`}
                            >
                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${isDark ? "bg-[#81E6D9]/10 text-[#81E6D9]" : "bg-[#81E6D9]/15 text-[#0D9488]"
                                    }`}>
                                    {domain.icon}
                                </div>

                                <h3 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                                    {domain.title}
                                </h3>

                                <p className={`text-sm leading-relaxed mb-6 ${isDark ? "text-[#787878]" : "text-gray-600"}`}>
                                    {domain.description}
                                </p>

                                <ul className="space-y-2">
                                    {domain.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#81E6D9]"></span>
                                            <span className={isDark ? "text-gray-400" : "text-gray-600"}>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section ref={teamRef} className="py-20 px-6 md:px-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-1.5 text-xs font-semibold rounded-full bg-[#81E6D9]/10 text-[#81E6D9] border border-[#81E6D9]/20 mb-6">
                            Our Team
                        </span>
                        <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                            Meet the Innovators
                        </h2>
                        <p className={`text-lg max-w-2xl mx-auto ${isDark ? "text-[#787878]" : "text-gray-600"}`}>
                            Our diverse team of experts is passionate about creating cutting-edge solutions that drive business success through AI innovation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={teamInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: index * 0.1 }}
                                className={`p-6 rounded-2xl border text-center ${isDark ? "bg-[#111111] border-white/5" : "bg-white border-[#1a1a1a]/10"
                                    }`}
                            >
                                {/* Avatar */}
                                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold ${isDark ? "bg-[#81E6D9]/20 text-[#81E6D9]" : "bg-[#81E6D9]/20 text-[#0D9488]"
                                    }`}>
                                    {member.initials}
                                </div>

                                {/* Name */}
                                <h3 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                                    {member.name}
                                </h3>

                                {/* Role */}
                                <p className="text-sm text-[#81E6D9] mb-3">
                                    {member.role}
                                </p>

                                {/* Description */}
                                <p className={`text-sm leading-relaxed mb-4 ${isDark ? "text-[#787878]" : "text-gray-600"}`}>
                                    {member.description}
                                </p>

                                {/* LinkedIn Icon */}
                                <a
                                    href={member.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"
                                        }`}
                                >
                                    <svg className={`w-5 h-5 ${isDark ? "text-white" : "text-[#1a1a1a]"}`} fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </a>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section
                ref={contactRef}
                id="connect-with-us"
                className={`py-20 px-6 md:px-10 ${isDark ? "bg-[#111111]" : "bg-gray-50"}`}
            >
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-1.5 text-xs font-semibold rounded-full bg-[#81E6D9]/10 text-[#81E6D9] border border-[#81E6D9]/20 mb-6">
                            Get in Touch
                        </span>
                        <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                            Connect With Us
                        </h2>
                        <p className={`text-lg max-w-2xl mx-auto ${isDark ? "text-[#787878]" : "text-gray-600"}`}>
                            Have questions about how Datalis can transform your business? We're here to help you get started.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Office Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={contactInView ? { opacity: 1, y: 0 } : {}}
                            className={`p-8 rounded-2xl border ${isDark ? "bg-[#0a0a0a] border-white/5" : "bg-white border-[#1a1a1a]/10"
                                }`}
                        >
                            <h3 className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                                Visit Our Office
                            </h3>
                            <div className="space-y-4">
                                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                    105 prism industrial estate<br />
                                    dombivli, thane, maharashtra<br />
                                    India
                                </p>
                                <div className={`pt-4 border-t ${isDark ? "border-white/5" : "border-gray-200"}`}>
                                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                        Monday - Friday<br />
                                        9:00 AM - 6:00 PM IST
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Contact Details Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={contactInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.1 }}
                            className={`p-8 rounded-2xl border ${isDark ? "bg-[#0a0a0a] border-white/5" : "bg-white border-[#1a1a1a]/10"
                                }`}
                        >
                            <h3 className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                                Contact Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-[#81E6D9] mb-1">Email</p>
                                    <a href="mailto:opportunities@datalis.in" className={`text-sm ${isDark ? "text-white" : "text-[#1a1a1a]"} hover:text-[#81E6D9]`}>
                                        opportunities@datalis.in
                                    </a>
                                </div>
                                <div>
                                    <p className="text-sm text-[#81E6D9] mb-1">Phone</p>
                                    <a href="tel:7506461004" className={`text-sm ${isDark ? "text-white" : "text-[#1a1a1a]"} hover:text-[#81E6D9]`}>
                                        7506461004
                                    </a>
                                </div>
                                <div>
                                    <p className="text-sm text-[#81E6D9] mb-1">Website</p>
                                    <a href="https://www.datalis.in" className={`text-sm ${isDark ? "text-white" : "text-[#1a1a1a]"} hover:text-[#81E6D9]`}>
                                        www.datalis.in
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}

