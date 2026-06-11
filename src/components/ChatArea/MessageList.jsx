import React, { useEffect, useRef } from "react";
import Message from "./Message";

const MessageList = ({ messages, searchTerm }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSuggestionClick = (suggestion) => {
    // Dispatch event for MainApp or ChatInput to handle
    const event = new CustomEvent('suggestionClicked', { detail: suggestion });
    window.dispatchEvent(event);
  };

  return (
    <div
      className="h-full overflow-y-auto px-4 md:px-6 py-4 scroll-smooth"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#333 transparent",
      }}
    >
      <div className="w-full max-w-[95%] xl:max-w-7xl mx-auto space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-md mb-6">
              <span className="text-white font-bold text-4xl">D</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Welcome to Dabby
            </h3>
            <p className="text-gray-400 max-w-md mb-6">
              Your AI business consultant is ready to help with financial
              analysis, data insights, and strategic recommendations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              {[
                "Analyze my financial data",
                "Explain my business performance",
                "How can I improve my margins?",
                "Draft a summary of my latest files",
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white transition-all hover:border-white/20 backdrop-blur-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <Message 
                key={message.id || `msg-${message.timestamp}-${index}`} 
                message={message} 
                searchTerm={searchTerm}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          width: 8px;
        }

        div::-webkit-scrollbar-track {
          background: transparent;
        }

        div::-webkit-scrollbar-thumb {
          background: #1f2937;
          border-radius: 4px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: #374151;
        }
      `}</style>
    </div>
  );
};

export default MessageList;
