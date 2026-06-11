import React, { useState, useRef } from "react";
import { 
  BsUpload, 
  BsFileEarmarkPdf, 
  BsFileEarmarkImage, 
  BsX, 
  BsCheckCircleFill,
  BsFileEarmarkText
} from "react-icons/bs";

export default function ProofUploader({ onFileSelect, selectedFile, label = "Upload Proof Document" }) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getFileIcon = (file) => {
    if (file.type.includes('image')) return <BsFileEarmarkImage className="text-emerald-400" size={24} />;
    if (file.type.includes('pdf')) return <BsFileEarmarkPdf className="text-rose-400" size={24} />;
    return <BsFileEarmarkText className="text-blue-400" size={24} />;
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{label}</label>
      
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative group cursor-pointer
            border-2 border-dashed rounded-2xl p-6
            transition-all duration-300
            ${dragActive 
              ? "border-teal-500 bg-teal-500/5 scale-[1.01]" 
              : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,.pdf"
          />
          
          <div className="flex flex-col items-center justify-center space-y-2 py-2">
            <div className="p-3 rounded-xl bg-white/5 text-gray-500 group-hover:text-teal-400 transition-colors">
              <BsUpload size={20} />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-white group-hover:text-teal-400 transition-colors">
                Drop your invoice or screenshot here
              </p>
              <p className="text-[10px] text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative p-4 rounded-2xl bg-white/5 border border-teal-500/30 flex items-center justify-between group animate-in fade-in zoom-in duration-200">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-xl bg-white/5">
              {getFileIcon(selectedFile)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate max-w-[200px]">
                {selectedFile.name}
              </p>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-emerald-500 bg-emerald-500/10 p-1.5 rounded-lg">
              <BsCheckCircleFill size={14} />
            </div>
            <button
              onClick={clearFile}
              className="p-1.5 rounded-lg bg-white/5 text-gray-500 hover:text-rose-400 hover:bg-rose-400/10 transition-all"
            >
              <BsX size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
