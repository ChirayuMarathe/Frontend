import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

/**
 * SplitText - Animated text component that reveals characters/words one by one
 * Inspired by React Bits Pro SplitText, built with Framer Motion
 */
export default function SplitText({
    text,
    className = "",
    delay = 0.03,
    duration = 0.5,
    ease = [0.22, 1, 0.36, 1],
    splitType = "chars", // 'chars' | 'words'
    from = { opacity: 0, y: 40 },
    to = { opacity: 1, y: 0 },
    threshold = 0.1,
    tag = "p",
    staggerDelay = 0,
    highlightWords = [], // Array of words to highlight with gradient
    highlightClassName = "bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent",
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px", amount: threshold });
    const { theme } = useTheme();

    // Split text into characters or words
    const splitText = () => {
        if (splitType === "words") {
            return text.split(" ").map((word, i) => ({
                content: word,
                isHighlight: highlightWords.includes(word) || highlightWords.some(hw => word.includes(hw)),
            }));
        }
        // For chars, we need to handle words for highlighting
        const words = text.split(" ");
        const chars = [];
        words.forEach((word, wordIndex) => {
            const isHighlight = highlightWords.includes(word) || highlightWords.some(hw => word.includes(hw));
            word.split("").forEach((char) => {
                chars.push({ content: char, isHighlight });
            });
            if (wordIndex < words.length - 1) {
                chars.push({ content: "\u00A0", isHighlight: false }); // Non-breaking space
            }
        });
        return chars;
    };

    const items = splitText();

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: delay,
                delayChildren: staggerDelay,
            },
        },
    };

    const itemVariants = {
        hidden: from,
        visible: {
            ...to,
            transition: {
                duration,
                ease,
            },
        },
    };

    const Tag = tag;

    const baseStyle = {
        display: "inline-block",
        overflow: "hidden",
        whiteSpace: "normal",
        wordWrap: "break-word",
    };

    return (
        <Tag ref={ref} className={className} style={baseStyle}>
            <motion.span
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                style={{ display: "inline" }}
                aria-label={text}
            >
                {items.map((item, index) => (
                    <motion.span
                        key={index}
                        variants={itemVariants}
                        style={{
                            display: "inline-block",
                            willChange: "transform, opacity",
                        }}
                        className={item.isHighlight ? highlightClassName : ""}
                    >
                        {item.content === " " ? "\u00A0" : item.content}
                        {splitType === "words" && index < items.length - 1 && "\u00A0"}
                    </motion.span>
                ))}
            </motion.span>
        </Tag>
    );
}

/**
 * AnimatedHeading - Pre-configured SplitText for section headings
 */
export function AnimatedHeading({
    children,
    className = "",
    tag = "h2",
    highlightWords = [],
    delay = 0.02,
    ...props
}) {
    const { theme } = useTheme();

    return (
        <SplitText
            text={children}
            tag={tag}
            className={className}
            delay={delay}
            splitType="chars"
            highlightWords={highlightWords}
            from={{ opacity: 0, y: 50, rotateX: -45 }}
            to={{ opacity: 1, y: 0, rotateX: 0 }}
            {...props}
        />
    );
}

/**
 * AnimatedParagraph - Pre-configured SplitText for paragraphs (word-by-word)
 */
export function AnimatedParagraph({
    children,
    className = "",
    delay = 0.05,
    ...props
}) {
    return (
        <SplitText
            text={children}
            tag="p"
            className={className}
            delay={delay}
            splitType="words"
            from={{ opacity: 0, y: 20 }}
            to={{ opacity: 1, y: 0 }}
            {...props}
        />
    );
}
