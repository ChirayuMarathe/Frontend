import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UploadCloud, FileSpreadsheet, Activity, CheckCircle, ChevronRight } from 'lucide-react';
import { parseCSVLocally, uploadCSVFile } from '../services/dataIngestionService';
import FileUploader from '../components/FileUploader';
import ColumnMapper from '../components/ColumnMapper';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export default function DataIngestionPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workbenchId = searchParams.get('workbench');

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ingestionResult, setIngestionResult] = useState(null);
  const [error, setError] = useState(null);
  const docId = searchParams.get('docId');

  React.useEffect(() => {
    if (docId && workbenchId) {
      fetchVaultDocument();
    }
  }, [docId, workbenchId]);

  const fetchVaultDocument = async () => {
    try {
      setIsProcessing(true);
      // 1. Fetch doc metadata
      const { data: doc, error: docError } = await supabase
        .from('workbench_documents')
        .select('*')
        .eq('id', docId)
        .single();
      
      if (docError) throw docError;

      // 2. Download file from storage
      const { data: blob, error: dlError } = await supabase.storage
        .from('Doc_vault_Raw')
        .download(doc.file_path);
      
      if (dlError) throw dlError;

      // 3. Create a File object
      const vaultFile = new File([blob], doc.filename, { type: doc.mime_type });
      
      // 4. Trigger the standard flow
      handleFileAccepted(vaultFile);
    } catch (err) {
      console.error("Error fetching vault doc:", err);
      setError("Failed to fetch document from vault: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileAccepted = async (acceptedFile) => {
    setFile(acceptedFile);
    setIsProcessing(true);
    setError(null);

    try {
      // Step 2: Trigger Local Preview Parsing
      const result = await parseCSVLocally(acceptedFile, { previewOnly: true });
      if (!result.success) throw new Error(result.error);
      
      setParsedData(result.data);
      setStep(2); // Move to Column Mapping Step
    } catch (err) {
      setError(err.message || "Failed to process file locally.");
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveMapping = async (mapping) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Step 6: Begin real backend storage upload triggered by step 4 mapping
      const result = await uploadCSVFile(file, mapping, workbenchId);
      if (!result.success) throw new Error(result.error);
      
      setIngestionResult(result.dataset || result);
      
      // NEW: Link vault document if present
      if (docId) {
        try {
          await supabase
            .from('workbench_documents')
            .update({ 
              status: 'processed',
              metadata: { 
                ...(ingestionResult?.metadata || {}), 
                ingested: true,
                ingested_at: new Date().toISOString()
              }
            })
            .eq('id', docId);
        } catch (linkErr) {
          console.warn("Failed to update vault doc status:", linkErr);
        }
      }

      setStep(3); // Move to Success/Insights Step
    } catch (err) {
      setError(err.message || "Failed to finalize database ingestion.");
    } finally {
      setIsProcessing(false);
    }
  };

  const PipelineSteps = () => (
    <div className="flex items-center justify-center space-x-4 mb-10 w-full max-w-2xl mx-auto">
      <StepBadge active={step >= 1} current={step === 1} icon={UploadCloud} label="Upload" />
      <div className={`h-px w-10 ${step >= 2 ? "bg-teal-500" : isDark ? "bg-white/10" : "bg-gray-200"}`} />
      <StepBadge active={step >= 2} current={step === 2} icon={FileSpreadsheet} label="Mapping" />
      <div className={`h-px w-10 ${step >= 3 ? "bg-teal-500" : isDark ? "bg-white/10" : "bg-gray-200"}`} />
      <StepBadge active={step >= 3} current={step === 3} icon={Activity} label="Insights" />
    </div>
  );

  return (
    <div className={`min-h-[calc(100vh-80px)] pt-24 px-6 pb-12 ${isDark ? "bg-black" : "bg-[#F8FAFC]"}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className={`text-3xl md:text-4xl font-bold mb-3 tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            Financial Data Ingestion
          </h1>
          <p className={`text-lg max-w-xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Seamlessly import your accounting exports, clean data, and trigger dynamic insights instantly.
          </p>
        </div>

        <PipelineSteps />

        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto relative">
            <FileUploader 
              onFileAccepted={handleFileAccepted} 
              isLoading={isProcessing} 
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Analyzing File Schema...</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Mapping Validation */}
        {step === 2 && parsedData && (
          <div className="w-full space-y-6">
            <div className={`w-full max-w-4xl mx-auto rounded-2xl border p-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm ${
              isDark ? "bg-[#111] border-white/10" : "bg-white border-gray-200"
            }`}>
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  file?.name.endsWith('.csv') ? "bg-blue-500/10 text-blue-500" : "bg-[#81E6D9]/10 text-[#81E6D9]"
                }`}>
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    File detected: {file?.name.endsWith('.csv') ? 'CSV Document (.csv)' : 'Excel Spreadsheet (.xlsx)'}
                  </h3>
                  <div className={`flex items-center space-x-3 text-sm mt-1 font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    <span>Rows detected: <strong className={isDark ? "text-white" : "text-gray-900"}>{parsedData.rowCount}</strong></span>
                    <span className="w-1 h-1 rounded-full bg-gray-400/50" />
                    <span>Columns detected: <strong className={isDark ? "text-white" : "text-gray-900"}>{parsedData.columns?.length || 0}</strong></span>
                  </div>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg text-sm font-bold ${
                isDark ? "bg-white/5 text-gray-300" : "bg-gray-100 text-gray-700"
              }`}>
                Ready for Schema Mapping
              </div>
            </div>

            <ColumnMapper 
              detectedColumns={parsedData.columns}
              previewRows={parsedData.rows}
              onSaveMapping={handleSaveMapping}
              isProcessing={isProcessing}
            />
          </div>
        )}

        {/* Step 3: Success & Insights */}
        {step === 3 && (
          <div className={`w-full max-w-3xl mx-auto rounded-3xl border p-8 md:p-12 text-center shadow-xl ${
            isDark ? "bg-[#111] border-[#81E6D9]/20 shadow-[#81E6D9]/5" : "bg-white border-teal-100 shadow-teal-500/5"
          }`}>
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
               <CheckCircle className="w-10 h-10" />
            </div>
            
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Dataset Ingested Successfully!
            </h2>
            <p className={`mb-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Your edge function worker has started processing <strong className="text-white">{file?.name}</strong> in the background.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#1a1a1a] border-white/5" : "bg-gray-50 border-gray-100"}`}>
                 <p className={`text-sm tracking-wide uppercase font-semibold mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Preview Valid Rows</p>
                 <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{parsedData?.parsedRowCount || 0}</p>
               </div>
               <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#1a1a1a] border-white/5" : "bg-gray-50 border-gray-100"}`}>
                 <p className={`text-sm tracking-wide uppercase font-semibold mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Estimated Entries</p>
                 <p className={`text-3xl font-bold ${isDark ? "text-[#81E6D9]" : "text-teal-600"}`}>~{parsedData?.rowCount || 0}</p>
               </div>
            </div>

            <button 
              onClick={() => navigate('/dashboard')}
              className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg ${
                isDark 
                  ? "bg-[#81E6D9] text-gray-900 hover:bg-[#5fd3c7] shadow-[#81E6D9]/20" 
                  : "bg-teal-600 text-white hover:bg-teal-700 shadow-teal-500/20"
              }`}
            >
              Go to Dashboard <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const StepBadge = ({ active, current, icon: Icon, label }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  return (
    <div className={`flex flex-col items-center justify-center gap-2 transition-all ${
      current ? "opacity-100 scale-110" : active ? "opacity-100" : "opacity-40 grayscale"
    }`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        active 
          ? isDark ? "bg-[#81E6D9] text-black shadow-[0_0_15px_rgba(129,230,217,0.3)]" : "bg-teal-600 text-white shadow-md shadow-teal-500/30"
          : isDark ? "bg-[#222] text-gray-400 border border-white/10" : "bg-gray-100 text-gray-400 border border-gray-200"
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className={`text-[11px] font-bold uppercase tracking-wider ${
        current ? (isDark ? "text-[#81E6D9]" : "text-teal-600") : isDark ? "text-gray-500" : "text-gray-400"
      }`}>
        {label}
      </span>
    </div>
  );
};
