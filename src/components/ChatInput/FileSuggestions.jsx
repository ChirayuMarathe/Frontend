import React from "react";
import { BsLightbulb, BsArrowRight } from "react-icons/bs";

/**
 * Generate contextual suggestions based on file type and name
 */
const generateFileSuggestions = (file) => {
  const fileName = file.name.toLowerCase();
  const extension = fileName.split(".").pop();

  // Financial/CSV files
  if (
    extension === "csv" ||
    fileName.includes("finance") ||
    fileName.includes("expense") ||
    fileName.includes("transaction") ||
    fileName.includes("sales")
  ) {
    return [
      "Analyze spending patterns by category",
      "Generate monthly expense summary",
      "Identify unusual transactions or outliers",
      "Identify financial trends based on this data",
      "Compare income vs expenses trends",
      "Show top 5 expense categories",
    ];
  }

  // Excel files - more comprehensive
  if (extension === "xlsx" || extension === "xls") {
    if (fileName.includes("balance") || fileName.includes("trial")) {
      return [
        "Analyze the trial balance for any imbalances",
        "Generate financial ratios from this data",
        "Identify key financial strengths and weaknesses",
        "Compare assets vs liabilities breakdown",
        "Suggest financial improvements",
      ];
    }
    if (
      fileName.includes("income") ||
      fileName.includes("p&l") ||
      fileName.includes("profit")
    ) {
      return [
        "Analyze revenue trends and patterns",
        "Calculate profit margins by category",
        "Identify major cost drivers",
        "Compare revenue vs expenses over time",
        "Generate income statement insights",
      ];
    }
    // Generic Excel
    return [
      "Summarize the key data points in this spreadsheet",
      "Identify trends and patterns in the data",
      "Generate insights and recommendations",
      "Find correlations between different variables",
      "Explain the data structure and content",
    ];
  }

  // PDF documents
  if (extension === "pdf") {
    if (fileName.includes("statement") || fileName.includes("analysis")) {
      return [
        "Summarize the key findings from this document",
        "Extract important financial insights",
        "Identify key recommendations or action items",
        "Compare this document to industry standards",
      ];
    }
    return [
      "Summarize the main points of this document",
      "Extract key data and insights",
      "Identify action items or recommendations",
      "Explain the document in simple terms",
    ];
  }

  // Word documents
  if (extension === "docx" || extension === "doc") {
    return [
      "Summarize the main content of this document",
      "Extract key points and insights",
      "Identify important sections or highlights",
      "Generate an executive summary",
    ];
  }

  // Generic fallback
  return [
    "Analyze this file and provide insights",
    "Summarize the main content",
    "Identify key patterns or trends",
    "Generate recommendations based on the data",
    "Explain what this file contains",
  ];
};

/**
 * FileSuggestions Component
 * Displays contextual suggestions based on attached files
 */
const FileSuggestions = ({
  files,
  onSuggestionClick,
  className = "",
  compact = false,
}) => {
  if (!files || files.length === 0) {
    return null;
  }

  // Generate suggestions for the first file (most relevant)
  const primaryFile = files[0];
  const suggestions = generateFileSuggestions(primaryFile);

  // If multiple files, add a combined analysis suggestion
  const allSuggestions =
    files.length > 1
      ? [
          `Analyze all ${files.length} files together and find connections`,
          ...suggestions.slice(0, 4),
        ]
      : suggestions.slice(0, 5);

  // In compact mode, show fewer suggestions
  const displaySuggestions = compact
    ? allSuggestions.slice(0, 3)
    : allSuggestions;

  return (
    <>
      <div className={`${className}`}>
        {!compact && (
          <div className="flex items-center gap-2 text-[#00C6C2] font-semibold text-sm mb-3">
            <div className="p-1.5 bg-[#00C6C2]/10 rounded-lg">
              <BsLightbulb className="text-base" />
            </div>
            <span>Quick questions</span>
          </div>
        )}

        <div
          className={`flex gap-1.5 overflow-x-auto scrollbar-hide ${
            compact ? "flex-nowrap" : "flex-wrap"
          }`}
        >
          {displaySuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className={`suggestion-card group relative bg-gradient-to-br from-[#1F242C] to-[#161B22] hover:from-[#2A2F36] hover:to-[#1F242C] border border-[#2A2F36] hover:border-[#00C6C2]/50 rounded-lg text-[#9BA3AF] hover:text-white transition-all duration-200 hover:shadow-md hover:shadow-[#00C6C2]/10 focus:outline-none focus:ring-1 focus:ring-[#00C6C2] whitespace-nowrap flex-shrink-0 ${
                compact ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-sm"
              }`}
              style={{ animationDelay: `${index * 30}ms` }}
              title={suggestion}
              aria-label={`Use suggestion: ${suggestion}`}
            >
              <div className="flex items-center gap-1.5">
                <span className="leading-tight">
                  {compact
                    ? suggestion.slice(0, 35) +
                      (suggestion.length > 35 ? "..." : "")
                    : suggestion}
                </span>
                <BsArrowRight
                  className={`text-[#00C6C2] opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                    compact ? "text-[9px]" : "text-xs"
                  }`}
                />
              </div>
            </button>
          ))}
        </div>

        {!compact && (
          <div className="mt-3 text-xs text-[#6B7280] italic flex items-center gap-1.5">
            <span className="text-[#00C6C2]">💡</span>
            <span>
              Click any suggestion to auto-fill, or write your own question
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes stagger-in {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .suggestion-card {
          animation: stagger-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .suggestion-card {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default FileSuggestions;
