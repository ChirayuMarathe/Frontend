import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiX, FiMessageSquare, FiClock, FiArrowUp, FiArrowDown } from 'react-icons/fi';

export default function ChatSearch({ 
  isOpen, 
  onClose, 
  chatHistory = [], 
  onSelectChat,
  onSearchMessages 
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef();
  const resultsRef = useRef();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      
      // Search in chat history
      const queryLower = query.toLowerCase();
      const filtered = chatHistory
        .filter(chat => 
          chat.title?.toLowerCase().includes(queryLower) ||
          chat.messages?.some(msg => 
            msg.content?.toLowerCase().includes(queryLower)
          )
        )
        .map(chat => {
          // Find matching messages
          const matchingMessages = chat.messages?.filter(msg =>
            msg.content?.toLowerCase().includes(queryLower)
          ) || [];
          
          return {
            ...chat,
            matchCount: matchingMessages.length,
            preview: matchingMessages[0]?.content?.slice(0, 100) || chat.title
          };
        })
        .sort((a, b) => b.matchCount - a.matchCount)
        .slice(0, 10);

      setResults(filtered);
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(searchTimeout);
  }, [query, chatHistory]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      onSelectChat?.(results[selectedIndex]);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [results, selectedIndex, onSelectChat, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = resultsRef.current?.children[selectedIndex];
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Search Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-[#12121a] rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden animate-slide-up">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800/50">
          <FiSearch className="text-gray-400 flex-shrink-0" size={20} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search chats and messages..."
            className="flex-1 bg-transparent text-white text-lg outline-none placeholder-gray-500"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FiX className="text-gray-400" size={18} />
            </button>
          )}
          <kbd className="hidden sm:flex px-2.5 py-1 text-xs bg-gray-800 rounded-lg text-gray-400 font-medium">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={resultsRef} className="max-h-96 overflow-y-auto">
          {/* Loading State */}
          {isSearching && (
            <div className="py-8 text-center">
              <div className="inline-flex items-center gap-2 text-gray-400">
                <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isSearching && query && results.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <FiSearch size={32} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">No results found</p>
              <p className="text-sm mt-1 text-gray-500">Try a different search term</p>
            </div>
          )}

          {/* Prompt State */}
          {!query && (
            <div className="py-12 text-center text-gray-400">
              <FiMessageSquare size={32} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">Search your chat history</p>
              <p className="text-sm mt-1 text-gray-500">Find messages and conversations quickly</p>
            </div>
          )}

          {/* Results List */}
          {results.map((chat, index) => (
            <button
              key={chat.id}
              onClick={() => { onSelectChat?.(chat); onClose(); }}
              className={`w-full flex items-start gap-4 px-5 py-4 text-left transition-colors border-b border-gray-800/30 last:border-0 ${
                index === selectedIndex 
                  ? 'bg-teal-500/10' 
                  : 'hover:bg-gray-800/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                index === selectedIndex ? 'bg-teal-500/20' : 'bg-gray-800/50'
              }`}>
                <FiMessageSquare className={index === selectedIndex ? 'text-teal-400' : 'text-gray-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">
                  {chat.title || 'Untitled Chat'}
                </h4>
                <p className="text-gray-400 text-sm truncate mt-1">
                  {highlightMatch(chat.preview || 'No messages', query)}
                </p>
                {chat.matchCount > 0 && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-teal-500/10 text-teal-400 text-xs rounded-full">
                    {chat.matchCount} match{chat.matchCount > 1 ? 'es' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-xs flex-shrink-0">
                <FiClock size={12} />
                <span>{formatDate(chat.updated_at || chat.created_at)}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-900/50 border-t border-gray-800/50 flex items-center justify-between text-xs text-gray-500">
          <span>Search across all your conversations</span>
          <div className="hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-1">
              <FiArrowUp size={12} />
              <FiArrowDown size={12} />
              <span className="ml-1">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">↵</kbd>
              <span className="ml-1">Select</span>
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

// Helper function to highlight matching text
function highlightMatch(text, query) {
  if (!query || !text) return text;
  
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'));
  
  return parts.map((part, i) => 
    part.toLowerCase() === query.toLowerCase() 
      ? <span key={i} className="text-teal-400 font-medium">{part}</span>
      : part
  );
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
