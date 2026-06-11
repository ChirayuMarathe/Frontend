import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BsX, BsCommand } from "react-icons/bs";
import { HiOutlineCommandLine } from "react-icons/hi2";

const shortcuts = [
  {
    category: "Navigation",
    items: [
      { keys: ["Ctrl", "K"], description: "Open search" },
      { keys: ["Ctrl", "N"], description: "New chat" },
      { keys: ["Ctrl", "/"], description: "Toggle sidebar" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
    ],
  },
  {
    category: "Chat",
    items: [
      { keys: ["Enter"], description: "Send message" },
      { keys: ["Shift", "Enter"], description: "New line in message" },
      { keys: ["Ctrl", "Enter"], description: "Send with web search enabled" },
      { keys: ["Esc"], description: "Close modal / Cancel" },
    ],
  },
  {
    category: "General",
    items: [
      { keys: ["Ctrl", ","], description: "Open settings" },
      { keys: ["Ctrl", "B"], description: "Toggle sidebar collapse" },
    ],
  },
];

const KeyBadge = ({ children }) => (
  <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-black/40 border border-white/10 rounded-md text-xs font-mono text-gray-300 shadow-sm">
    {children}
  </span>
);

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                  <HiOutlineCommandLine className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Keyboard Shortcuts
                  </h2>
                  <p className="text-sm text-gray-500">
                    Navigate Dabby faster with shortcuts
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Close shortcuts modal"
              >
                <BsX className="text-xl" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {shortcuts.map((section) => (
                  <div key={section.category} className="space-y-3">
                    <h3 className="text-sm font-medium text-teal-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                      {section.category}
                    </h3>
                    <div className="space-y-2">
                      {section.items.map((shortcut, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                        >
                          <span className="text-sm text-gray-300">
                            {shortcut.description}
                          </span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, keyIdx) => (
                              <React.Fragment key={keyIdx}>
                                <KeyBadge>{key}</KeyBadge>
                                {keyIdx < shortcut.keys.length - 1 && (
                                  <span className="text-gray-600 text-xs mx-0.5">
                                    +
                                  </span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pro tip */}
              <div className="mt-6 p-4 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <BsCommand className="text-teal-400 text-lg flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-teal-400">Pro Tip</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Press <KeyBadge>?</KeyBadge> anytime to open this
                      shortcuts panel. Use <KeyBadge>Ctrl</KeyBadge> +{" "}
                      <KeyBadge>K</KeyBadge> for quick search across your chats.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-white/10 bg-black/20">
              <p className="text-xs text-gray-500 text-center">
                Press <span className="text-gray-400">Esc</span> to close
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
