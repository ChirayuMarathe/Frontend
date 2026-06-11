import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github-dark.css";
import ThinkingIndicator from "./ThinkingIndicator";

const HighlightedText = ({ text, highlight }) => {
    if (!highlight || !highlight.trim()) return text;

    // Handle nested React elements or arrays of children
    if (typeof text !== 'string') {
        if (Array.isArray(text)) {
            return text.map((child, i) => (
                <HighlightedText key={i} text={child} highlight={highlight} />
            ));
        }
        if (React.isValidElement(text)) {
            // If it's an element with children, try to highlight its children
            if (text.props && text.props.children) {
                return React.cloneElement(text, {
                    children: <HighlightedText text={text.props.children} highlight={highlight} />
                });
            }
            return text;
        }
        return text;
    }

    // Escape regex special characters
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-teal-500/30 text-white rounded-sm px-0.5 border-b border-teal-400/50">{part}</mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

const Message = ({ message, searchTerm }) => {

    const formattedTime = format(new Date(message.timestamp), "h:mm a");
    const isUser = message.role === "user";
    const isAI = message.role === "assistant";

    // Parse Content for Chips
    const parseContent = (content) => {
        if (!content) return { text: "", chips: [] };

        let text = content;
        const chips = [];

        // 1. Extract Chips
        const chipRegex = /\[SUGGESTION: (.*?)\]/g;
        let match;
        while ((match = chipRegex.exec(content)) !== null) {
            chips.push(match[1].trim());
        }
        text = text.replace(chipRegex, "").trim();

        return { text, chips };
    };

    const { text: displayContent, chips } = isAI && !message.isLoading
        ? parseContent(message.content)
        : { text: message.content, chips: [] };

    return (
        <div
            className={`mb-6 flex ${isUser ? "justify-end" : "justify-start"
                } animate-in fade-in slide-in-from-bottom-2 duration-500 group`}
        >
            <div
                className={`flex gap-3 max-w-[90%] xl:max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"
                    }`}
            >
                {/* Assistant Avatar - Larger & authoritative */}
                {isAI && (
                    <div className="flex-shrink-0 mt-1">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0E1117] to-[#161B22] border border-white/5 flex items-center justify-center shadow-lg group-hover:border-teal-500/30 transition-colors duration-300">
                            <span className="text-teal-400 font-bold text-lg">D</span>
                        </div>
                    </div>
                )}

                <div className={`flex flex-col space-y-1 ${isUser ? "items-end" : "items-start"}`}>
                    {/* Sender Name & Time */}
                    <div
                        className={`flex items-center gap-2 px-1 ${isUser ? "justify-end" : "justify-start"
                            }`}
                    >
                        <span className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
                            {isAI ? "Dabby Consultant" : "You"}
                        </span>
                        <span className="text-[10px] text-gray-600 font-mono">{formattedTime}</span>
                    </div>

                    {/* Message Bubble struct */}
                    <div
                        className={`
              relative rounded-2xl px-6 py-5 shadow-sm
              ${isUser
                                ? "bg-[#161B22] text-white border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                                : "bg-[#0E1117] text-gray-200 border border-white/5"
                            }
              ${isUser ? "rounded-tr-sm" : "rounded-tl-sm"}
              backdrop-blur-sm
              transition-all duration-200
            `}
                    >
                        <div className="relative z-10 w-full">
                            {isUser ? (
                                // User Message - Simple text with system font
                                <div>
                                    <div
                                        className="text-base leading-relaxed font-normal break-words font-sans"
                                    >
                                        <HighlightedText text={message.content} highlight={searchTerm} />

                                        {/* Attached Files Display */}
                                        {(message.metadata?.files || message.options?.uploadedFiles) && (message.metadata?.files?.length > 0 || message.options?.uploadedFiles?.length > 0) && (
                                            <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-white/10">
                                                {(message.metadata?.files || message.options?.uploadedFiles || []).map((file, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 text-sm hover:border-teal-500/30 transition-colors"
                                                    >
                                                        <div className="w-8 h-8 rounded bg-teal-500/10 flex items-center justify-center text-teal-400">
                                                            {file.name.endsWith('.pdf') ? (
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-white text-xs truncate max-w-[150px]">{file.name}</span>
                                                            <span className="text-[10px] text-gray-400 font-mono">
                                                                {file.size ? (file.size / 1024).toFixed(1) + ' KB' : 'File'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : message.isLoading ? (
                                // Loading / Thinking State
                                <ThinkingIndicator context={message.content.toLowerCase()} />
                            ) : (
                                // AI Message with Markdown
                                <div className="w-full">
                                    <div className="prose prose-invert max-w-none break-words prose-p:leading-relaxed prose-pre:bg-[#0D1117] prose-pre:border prose-pre:border-gray-800">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeHighlight, rehypeRaw]}
                                            components={{
                                                // Custom Text Highlighting
                                                p: ({ children }) => <p><HighlightedText text={children} highlight={searchTerm} /></p>,
                                                li: ({ children }) => <li><HighlightedText text={children} highlight={searchTerm} /></li>,
                                                // Custom Code Block Styling
                                                code({ node, inline, className, children, ...props }) {
                                                    return inline ? (
                                                        <code className="bg-[#1C2128] text-teal-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                                            <HighlightedText text={children} highlight={searchTerm} />
                                                        </code>
                                                    ) : (
                                                        <code className={`${className} block bg-[#0D1117] p-4 rounded-lg overflow-x-auto text-sm leading-relaxed`} {...props}>{children}</code>
                                                    );
                                                },
                                                // Table Styling
                                                table: ({ children }) => <div className="overflow-x-auto my-4 rounded-xl border border-white/5"><table className="min-w-full text-left">{children}</table></div>,
                                                thead: ({ children }) => <thead className="bg-[#1C2128] text-gray-200 border-b border-gray-700 font-bold">{children}</thead>,
                                                th: ({ children }) => <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-teal-400/90">{children}</th>,
                                                td: ({ children }) => <td className="px-4 py-3 border-b border-gray-800/50 text-sm opacity-90"><HighlightedText text={children} highlight={searchTerm} /></td>,
                                                a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300 underline underline-offset-4 decoration-teal-500/30">{children}</a>,
                                                blockquote: ({ children }) => <blockquote className="border-l-4 border-teal-500/50 pl-4 py-1.5 my-4 bg-teal-500/5 rounded-r text-gray-300 italic">{children}</blockquote>
                                            }}
                                        >
                                            {displayContent}
                                        </ReactMarkdown>
                                    </div>

                                    {/* Suggestion Chips Section */}
                                    {chips.length > 0 && (
                                        <div className="mt-6 flex flex-wrap gap-2 animate-in fade-in duration-500 border-t border-white/5 pt-4">
                                            <span className="text-[10px] uppercase tracking-wider text-gray-500 w-full mb-1 ml-1 font-semibold">Suggested Actions:</span>
                                            {chips.map((chip, idx) => (
                                                <button
                                                    key={idx}
                                                    className="px-3.5 py-1.5 bg-teal-500/5 hover:bg-teal-500/10 border border-teal-500/20 hover:border-teal-500/40 rounded-full text-xs font-medium text-teal-400 transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1.5 group/chip"
                                                    onClick={() => {
                                                        // Dispatch event for MainApp or ChatInput to handle
                                                        const event = new CustomEvent('suggestionClicked', { detail: chip });
                                                        window.dispatchEvent(event);
                                                    }}
                                                >
                                                    <span>{chip}</span>
                                                    <svg className="w-3 h-3 opacity-50 group-hover/chip:opacity-100 group-hover/chip:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Message;
