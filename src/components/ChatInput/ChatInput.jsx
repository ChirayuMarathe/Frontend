import React, {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  BsPaperclip,
  BsSend,
  BsGlobe2,
  BsX,
  BsFileEarmark,
  BsBriefcase,
} from "react-icons/bs";
import FileSuggestions from "./FileSuggestions";
import { toast } from "react-hot-toast";
import VoiceInput from "../VoiceInput";

const PLACEHOLDERS = [
  "Ask about profit margins...",
  "Compare Q3 and Q4 revenue...",
  "Identify risks in the balance sheet...",
  "Upload a CSV to begin analysis...",
  "Draft a financial summary...",
];

const ChatInput = forwardRef(function ChatInput(
  {
    onSendMessage,
    disabled = false,
    placeholder = "Message Dabby Consultant...",
    initialMessage = "",
    webSearchEnabled = false,
    uploadedFiles = [],
    workbenchContext = null,
    availableWorkbenches = [],
    onToggleWorkbenchContext = null,
  },
  ref
) {
  const [message, setMessage] = useState(initialMessage);
  const [isFocused, setIsFocused] = useState(false);
  const [showWorkbenchSelector, setShowWorkbenchSelector] = useState(false);
  const [webEnabled, setWebEnabled] = useState(webSearchEnabled);
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Rotating Placeholder Logic
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(PLACEHOLDERS[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentPlaceholder(PLACEHOLDERS[placeholderIndex]);
  }, [placeholderIndex]);

  // Sync with parent's uploadedFiles - REMOVED to prevent document stacking
  // attachedFiles is now purely local to this component instance
  // and cleared after each send.

  // Listen for suggestion clicks from Chat Messages
  useEffect(() => {
    const handleSuggestionClick = (e) => {
      const suggestion = e.detail;
      setMessage(suggestion);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    };

    window.addEventListener('suggestionClicked', handleSuggestionClick);
    return () => window.removeEventListener('suggestionClicked', handleSuggestionClick);
  }, []);

  const handleFileAttachment = (e) => {
    const files = Array.from(e.target.files);
    const MAX_FILES = 8;

    setAttachedFiles((prev) => {
      // uploadedFiles comes from props, representing files already in the session
      const totalFiles = (uploadedFiles?.length || 0) + prev.length + files.length;

      if (totalFiles > MAX_FILES) {
        const remainingSpace = MAX_FILES - ((uploadedFiles?.length || 0) + prev.length);
        const filesToAdd = files.slice(0, remainingSpace);

        if (remainingSpace <= 0) {
          toast.error(`Maximum session limit of ${MAX_FILES} files reached.`);
          return prev;
        } else {
          toast(`Only ${filesToAdd.length} of ${files.length} files added. Max session limit is ${MAX_FILES}.`, {
            icon: '⚠️',
          });
          const newFiles = [...prev, ...filesToAdd];
          setShowSuggestions(true);
          return newFiles;
        }
      }

      const newFiles = [...prev, ...files];
      setShowSuggestions(true);
      return newFiles;
    });

    // Reset input so the same file can be selected again if needed
    if (e.target) e.target.value = "";
  };

  const fileInputRef = useRef(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const textareaRef = useRef(null);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    setIsTyping(true);
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => setIsTyping(false), 500);
    setTypingTimeout(timeout);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [message]);

  // Handle initial message changes
  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
    }
  }, [initialMessage]);

  // Sync web search state
  useEffect(() => {
    setWebEnabled(webSearchEnabled);
  }, [webSearchEnabled]);

  const sendMessage = async (customMessage = null) => {
    const messageToSend = customMessage !== null ? customMessage : message;
    if ((messageToSend.trim() || attachedFiles.length > 0 || workbenchContext?.active) && !disabled && !isLoading) {
      setIsLoading(true);

      try {
        if (onSendMessage) {
          onSendMessage(
            messageToSend,
            {
              web: webEnabled,
              uploadedFiles: attachedFiles,
              workbenchId: workbenchContext?.active ? workbenchContext.id : null,
              response: null,
              hasContext:
                webEnabled ||
                attachedFiles.length > 0 ||
                workbenchContext?.active,
            },
            false
          );
        }

        setMessage("");
        setAttachedFiles([]);
        setShowSuggestions(false);
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        setIsTyping(false);
      } catch (error) {
        console.error("ChatInput: Error sending message:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const canRunInference = () => {
    return webEnabled || attachedFiles.length > 0 || workbenchContext?.active;
  };

  useImperativeHandle(ref, () => ({
    sendMessage,
    triggerSend: sendMessage,
    canRunInference,
    setMessage,
    getMessage: () => message,
    getWebEnabled: () => webEnabled,
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
    setShowSuggestions(false);
    if (textareaRef.current) textareaRef.current.focus();
  };

  return (
    <div
      className="bg-black/40 backdrop-blur-md px-3 sm:px-4 py-4 sm:py-6 border-t border-white/5 fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto safe-area-bottom"
      data-tour="chat-input"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Suggestion Files */}
        {showSuggestions && attachedFiles.length > 0 && (
          <div className="mb-2 animate-slide-up">
            <FileSuggestions
              files={attachedFiles}
              onSuggestionClick={handleSuggestionClick}
              compact={true}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative group/form">
          {/* Main Input Container */}
          <div
            className={`
                relative flex items-center gap-1 sm:gap-2 bg-[#0D1117] rounded-xl sm:rounded-2xl border transition-all duration-300
                ${isFocused || isTyping || message.length > 0
                ? "border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.1)] bg-[#0D1117]"
                : "border-white/10 hover:border-white/20 bg-white/5"
              }
            `}
          >
            {/* Left Actions Pool (Data Input) - Collapsed on mobile */}
            <div className="flex items-center gap-0.5 sm:gap-1 pl-2 sm:pl-3 pr-1 sm:pr-2 border-r border-white/5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileAttachment}
                multiple
                accept=".pdf,.docx,.csv,.xlsx,.xls,.txt,.json"
                className="hidden"
                aria-label="Attach file"
              />
              <button
                type="button"
                className="group/btn relative p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-gray-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all duration-200"
                title="Attach Files"
                disabled={disabled || isLoading}
                onClick={() => fileInputRef.current?.click()}
              >
                <BsPaperclip className="text-base sm:text-lg" />
              </button>
            </div>

            {/* Web Search Toggle - Hidden on very small screens */}
            <div className="hidden xs:flex items-center gap-1 px-1">
              <button
                type="button"
                onClick={() => setWebEnabled((v) => !v)}
                disabled={disabled || isLoading}
                title={webEnabled ? "Web Search: ON" : "Web Search: OFF"}
                className={`group/btn relative p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-200 ${webEnabled
                  ? "text-blue-400 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                  : "text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
                  }`}
              >
                <BsGlobe2 className="text-base sm:text-lg" />
              </button>
            </div>

            {/* Workbench Context Toggle */}
            <div className="flex items-center gap-1 px-1 relative">
              <button
                type="button"
                onClick={() => {
                  if (workbenchContext && !showWorkbenchSelector) {
                    // Toggle current if one exists
                    onToggleWorkbenchContext();
                  } else {
                    // Otherwise show selector (even if empty, to show the "No workbenches" message)
                    setShowWorkbenchSelector(!showWorkbenchSelector);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (availableWorkbenches.length > 0) {
                    setShowWorkbenchSelector(!showWorkbenchSelector);
                  }
                }}
                disabled={disabled || isLoading}
                title={
                  workbenchContext?.active
                    ? `Using Context: ${workbenchContext.name} (Click to toggle, Right-click to change)`
                    : availableWorkbenches.length > 0
                      ? "Attach Workbench Context (Right-click for options)"
                      : "Attach Workbench Context"
                }
                className={`group/btn relative p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-200 ${workbenchContext?.active
                  ? "text-teal-400 bg-teal-500/10 shadow-[0_0_10px_rgba(20,184,166,0.1)]"
                  : "text-gray-400 hover:text-teal-400 hover:bg-teal-500/10"
                  }`}
              >
                <BsBriefcase className="text-base sm:text-lg" />
              </button>

              {/* Workbench Selector Dropdown */}
              {showWorkbenchSelector && (
                <div className="absolute bottom-full mb-2 left-0 w-64 bg-[#161B22] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-slide-up">
                  <div className="px-3 py-2 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Workbench</span>
                    <button onClick={() => setShowWorkbenchSelector(false)} className="text-gray-500 hover:text-white">
                      <BsX />
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {availableWorkbenches.length > 0 ? (
                      availableWorkbenches.map((wb) => (
                        <button
                          key={wb.id}
                          onClick={() => {
                            onToggleWorkbenchContext(wb);
                            setShowWorkbenchSelector(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-all border-b border-white/5 last:border-0 ${workbenchContext?.id === wb.id ? "bg-teal-500/5 text-teal-400" : "text-gray-300"
                            }`}
                        >
                          <BsBriefcase className="text-sm flex-shrink-0" />
                          <span className="text-xs truncate font-medium">{wb.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <BsBriefcase className="text-gray-600 text-2xl mx-auto mb-2 opacity-20" />
                        <p className="text-xs text-gray-500">No workbenches found.</p>
                        <p className="text-[10px] text-gray-600 mt-1">Create one in the sidebar first.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Main Text Input Area */}
            <div className="flex-1 relative py-2.5 sm:py-3 px-1 sm:px-2 min-w-0">
              {/* Rotating Placeholder */}
              {!message && !isFocused && (attachedFiles.length === 0 && !workbenchContext?.active) && (
                <span className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 text-gray-500/50 pointer-events-none text-sm sm:text-[15px] animate-fade-in truncate max-w-[calc(100%-1rem)]">
                  {currentPlaceholder}
                </span>
              )}

              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={isFocused || attachedFiles.length > 0 || workbenchContext?.active ? placeholder : ""} // Default placeholder when focused
                disabled={disabled || isLoading}
                className="w-full bg-transparent text-gray-100 placeholder-transparent resize-none focus:outline-none text-sm sm:text-[15px] leading-relaxed max-h-[80px] sm:max-h-[120px] overflow-y-auto"
                style={{ scrollbarWidth: "none" }}
                rows={1}
              />
            </div>

            {/* Right Actions (Voice & Send) */}
            <div className="flex items-center gap-1 sm:gap-2 pr-2 sm:pr-3 pl-1 sm:pl-2 border-l border-white/5">
              <div className="hidden sm:block">
                <VoiceInput
                  disabled={disabled || isLoading}
                  onTranscript={setMessage}
                  onFinalTranscript={(text) => {
                    setMessage(text);
                    if (textareaRef.current) textareaRef.current.focus();
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={(!message.trim() && attachedFiles.length === 0 && !workbenchContext?.active) || disabled || isLoading}
                className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center min-w-[40px] sm:min-w-[44px] ${(message.trim() || attachedFiles.length > 0 || workbenchContext?.active) && !disabled && !isLoading
                  ? "bg-teal-500 text-black hover:bg-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_20px_rgba(20,184,166,0.5)] transform hover:-translate-y-0.5"
                  : "bg-white/5 text-gray-600 cursor-not-allowed"
                  }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-black/50 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <BsSend className="text-base sm:text-lg" />
                )}
              </button>
            </div>

            {/* Workbench Context Preview */}
            {workbenchContext?.active && (
              <div className="absolute bottom-full left-0 right-0 sm:right-auto mb-2 sm:mb-4 p-2 bg-[#161B22]/95 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-teal-500/30 shadow-2xl flex flex-col gap-2 sm:min-w-[250px] animate-slide-up z-30 mx-2 sm:mx-0">
                <div className="px-2 py-1 flex justify-between items-center border-b border-white/5 mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Workbench Context</span>
                  <span className="text-[10px] text-teal-400">Active</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-teal-500/5 border border-teal-500/10 group/workbench">
                  <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 flex-shrink-0">
                      <BsBriefcase className="text-xs sm:text-sm" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-gray-200 truncate font-medium">{workbenchContext.name}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Financial Data Included</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleWorkbenchContext}
                    className="text-gray-500 hover:text-red-400 p-1 flex-shrink-0"
                  >
                    <BsX className="text-lg" />
                  </button>
                </div>
              </div>
            )}

            {/* File Preview Cards (Absolute above) - Mobile optimized */}
            {attachedFiles.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 sm:right-auto mb-2 sm:mb-4 p-2 bg-[#161B22]/95 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-2 sm:min-w-[250px] animate-slide-up z-30 mx-2 sm:mx-0">
                <div className="px-2 py-1 flex justify-between items-center border-b border-white/5 mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ready to Upload</span>
                  <span className="text-[10px] text-teal-400">{attachedFiles.length} file(s)</span>
                </div>
                {attachedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group/file"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 flex-shrink-0">
                        <BsPaperclip className="text-xs sm:text-sm" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-gray-200 truncate font-medium">{file.name}</span>
                        <span className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                      className="text-gray-500 hover:text-red-400 p-1 flex-shrink-0"
                    >
                      <BsX className="text-lg" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Helper Footer - Hidden on mobile */}
        <div className="hidden sm:flex mt-3 justify-between items-center px-2 opacity-50 text-[10px] text-gray-500">
          <span>AI responses can be inaccurate. Double check critical financial data.</span>
          <span>{message.length} / 2000</span>
        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        
        @keyframes slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
});

ChatInput.displayName = "ChatInput";

export default ChatInput;
