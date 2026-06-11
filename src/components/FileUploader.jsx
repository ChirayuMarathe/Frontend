import React, { useCallback, useState } from "react";
import { UploadCloud, File, AlertCircle, CheckCircle, X } from "lucide-react";

export default function FileUploader({ onFileAccepted, maxSizeBytes = 10 * 1024 * 1024, isLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file) => {
    setError(null);
    if (!file) return false;

    // 1. Validate Type
    const validExtensions = [".csv", ".xlsx", ".xls", ".xml"];
    const fileExtension = file.name.slice((Math.max(0, file.name.lastIndexOf(".")) || Infinity)).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setError(`Invalid file type. Please upload a CSV or Excel file.`);
      return false;
    }

    // 2. Validate Size
    if (file.size > maxSizeBytes) {
      setError(`File is too large. Maximum size is ${maxSizeBytes / (1024 * 1024)}MB.`);
      return false;
    }

    return true;
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileAccepted(file);
      }
    }
  }, [onFileAccepted, maxSizeBytes]);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileAccepted(file);
      }
    }
  }, [onFileAccepted, maxSizeBytes]);

  return (
    <div className="w-full">
      <div 
        className={`relative w-full rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
          dragActive 
            ? "border-[#81E6D9] bg-[#81E6D9]/5 scale-[1.02]" 
            : error 
              ? "border-red-500/50 bg-red-500/5"
              : "border-gray-300 dark:border-white/10 hover:border-[#81E6D9]/50 hover:bg-[#81E6D9]/5"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          accept=".csv,.xlsx,.xls,.xml"
          onChange={handleChange}
          disabled={isLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
          id="file-upload"
        />
        
        <div className="flex flex-col items-center justify-center gap-4 pointer-events-none">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
            error ? "bg-red-500/10 text-red-500" : "bg-[#81E6D9]/10 text-[#81E6D9]"
          }`}>
            <UploadCloud className="w-7 h-7" />
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Drag & drop your financial data
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              CSV, Excel, or Tally XML exports. Up to {maxSizeBytes / (1024 * 1024)}MB.
            </p>
          </div>
          
          <button 
            type="button" 
            disabled={isLoading}
            className="mt-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-gray-900 text-white dark:bg-white/10 dark:text-white dark:hover:bg-white/15 hover:bg-gray-800 transition-colors pointer-events-auto shadow-sm"
          >
            {isLoading ? "Processing..." : "Browse Files"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
