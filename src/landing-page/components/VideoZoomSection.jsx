import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function VideoZoomSection() {
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Zoom effect: starts at 1.3 (zoomed in), ends at 1.0 (normal)
    const scale = useTransform(
        scrollYProgress,
        [0, 0.5, 1],
        [1.3, 1.0, 1.0]
    );

    // Fade effect
    const opacity = useTransform(
        scrollYProgress,
        [0, 0.2, 0.8, 1],
        [0.5, 1, 1, 0.5]
    );

    return (
        <section
            ref={containerRef}
            className="min-h-screen flex items-center justify-center bg-black px-4 md:px-10 py-16 md:py-20 overflow-hidden relative"
        >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black opacity-50" />

            <motion.div
                style={{ scale, opacity }}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 30
                }}
                className="max-w-6xl w-full rounded-3xl overflow-hidden shadow-2xl relative z-10"
            >
                {/* Placeholder for video - replace with actual video */}
                <div className="w-full aspect-video bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <svg className="w-24 h-24 mx-auto text-white/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-white/70 font-medium">KPI Dashboard Demo Video</p>
                        <p className="text-sm text-white/50 mt-1">Replace with actual video file</p>
                    </div>
                </div>

                {/* Uncomment when you have the video file */}
                {/* <video 
          className="w-full h-auto block"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/kpi-dashboard-demo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video> */}
            </motion.div>
        </section>
    );
}
