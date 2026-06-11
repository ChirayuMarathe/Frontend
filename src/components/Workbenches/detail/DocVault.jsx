import React, { useState, useEffect, useRef } from "react";
import { 
  BsShieldLock, 
  BsUpload, 
  BsSearch, 
  BsFilter, 
  BsFileEarmarkPdf, 
  BsFileEarmarkText, 
  BsLink45Deg, 
  BsEye, 
  BsDownload, 
  BsTrash, 
  BsCheckCircleFill, 
  BsClockHistory, 
  BsExclamationCircleFill,
  BsPlusLg,
  BsThreeDotsVertical,
  BsArrowRight,
  BsMagic
} from "react-icons/bs";
import { supabase } from "../../../lib/supabase";
import { backendService } from "../../../services/backendService";
import { useWorkbench } from "../../../context/WorkbenchContext";
import Card from "../../shared/Card";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import LinkDocumentModal from "../ops/LinkDocumentModal";
import { useNavigate } from "react-router-dom";

const DOC_TYPES = [
  { id: 'all', label: 'All', color: 'bg-teal-500/10 text-teal-400' },
  { id: 'Revenue', label: 'Revenue (AR)', color: 'bg-blue-500/10 text-blue-400' },
  { id: 'Expense', label: 'Expense (AP)', color: 'bg-rose-500/10 text-rose-400' },
  { id: 'Liability', label: 'Liability (AP)', color: 'bg-amber-500/10 text-amber-400' },
  { id: 'Asset', label: 'Asset', color: 'bg-emerald-500/10 text-emerald-400' },
  { id: 'Equity', label: 'Equity', color: 'bg-purple-500/10 text-purple-400' },
  { id: 'Bank_Statement', label: 'Bank Statement', color: 'bg-gray-500/10 text-gray-400' },
];


export default function DocVault({ workbenchId }) {
  const { labels } = useWorkbench();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocForLinking, setSelectedDocForLinking] = useState(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, [workbenchId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // Fetch from workbench_documents and join with transactions for better display
      const { data, error } = await supabase
        .from('workbench_documents')
        .select('*, transactions(description, transaction_entries(amount))')
        .eq('workbench_id', workbenchId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching documents:", error);
        setDocuments([]);
      } else {
        console.log(`Fetched ${data?.length || 0} documents for workbench ${workbenchId}`);
        // Map the data to include a friendly 'linked_unit' label and absolute amount
        const processedData = (data || []).map(doc => {
          const txAmount = doc.transactions?.transaction_entries?.find(e => e.amount > 0)?.amount;
          return {
            ...doc,
            display_linked_unit: doc.transactions?.description || doc.transaction_id || null,
            display_amount: txAmount || doc.metadata?.amount || null
          };
        });
        console.log('[DEBUG] Processed documents:', processedData);
        setDocuments(processedData);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAICategorize = async (doc) => {
    try {
      toast.loading("Analyzing with AI...", { id: `ai-cat-${doc.id}` });
      
      // We only send expense labels to narrow down classification
      const expenseLabels = labels.filter(l => l.type === 'expense').map(l => ({
        id: l.id,
        name: l.name,
        sub_account: l.sub_account
      }));

      if (expenseLabels.length === 0) {
        toast.error("No expense labels found in COA to categorize against.", { id: `ai-cat-${doc.id}` });
        return;
      }

      const result = await backendService.aiCategorize(doc.filename, expenseLabels);
      
      if (result.label_id) {
        toast.success(
          (t) => (
            <div className="flex flex-col">
              <span className="font-bold text-xs uppercase tracking-widest mb-1">AI Suggestion</span>
              <span className="text-sm">This looks like <span className="text-teal-500 font-bold">{result.label_name}</span></span>
              <span className="text-[10px] text-gray-500 mt-1 italic">"{result.reasoning}"</span>
            </div>
          ), 
          { id: `ai-cat-${doc.id}`, duration: 5000 }
        );
      } else {
        toast.error("AI couldn't find a confident match.", { id: `ai-cat-${doc.id}` });
      }
    } catch (err) {
      console.error("AI Categorization failed:", err);
      toast.error("AI Analysis failed", { id: `ai-cat-${doc.id}` });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      toast.loading("Sending to Doc_vault_Raw...", { id: "upload-doc" });
      
      // Use active filter as type if it's a valid doc type, else default to invoice
      const docType = activeFilter !== 'all' ? activeFilter : 'invoice';
      await backendService.uploadDocument(workbenchId, file, docType);
      
      toast.success("Document uploaded to raw bucket!", { id: "upload-doc" });
      // We wait a bit before fetching as processing might take time
      setTimeout(() => fetchDocuments(), 1500);
    } catch (err) {
      toast.error("Upload failed: " + err.message, { id: "upload-doc" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesFilter = activeFilter === 'all' || doc.document_type === activeFilter;
    const matchesSearch = doc.filename?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.metadata?.linked_unit?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: documents.length,
    mapped: documents.filter(d => d.metadata?.linked_unit).length,
    unmapped: documents.filter(d => !d.metadata?.linked_unit).length
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white animate-in fade-in duration-500 overflow-hidden">
      {/* Header Section */}
      <div className="p-8 pb-6">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <BsShieldLock size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Document Vault</h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">Secure storage for organization proofs and support docs for transactions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors" />
              <input 
                type="text"
                placeholder="Search documents or linked units..."
                className="bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm w-80 focus:outline-none focus:border-teal-500/50 transition-all font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button 
              onClick={handleUploadClick}
              disabled={isUploading}
              className="flex items-center space-x-2 px-6 py-3 bg-[#81E6D9] text-black rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-[#81E6D9]/10 disabled:opacity-50"
            >
              <BsUpload size={16} strokeWidth={1} />
              <span>Upload & Map</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.csv"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-3 mb-8 overflow-x-auto pb-2 custom-scrollbar">
          {DOC_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setActiveFilter(type.id)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeFilter === type.id 
                  ? "bg-teal-500/10 text-teal-400 border-teal-500/30" 
                  : "bg-white/5 text-gray-500 border-transparent hover:bg-white/10"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Docs", val: stats.total, color: "text-white" },
            { label: "Mapped to Units", val: stats.mapped, color: "text-teal-400" },
            { label: "Unmapped", val: stats.unmapped, color: "text-rose-400" },
            { label: "Active Filter", val: DOC_TYPES.find(t => t.id === activeFilter)?.label, color: "text-gray-400", isFilter: true },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden group">
              <div className="flex flex-col space-y-1 relative z-10">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
                <span className={`text-2xl font-bold ${stat.color}`}>{stat.val}</span>
              </div>
              {!stat.isFilter && (
                <div className="absolute right-0 bottom-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                   <BsShieldLock size={40} className={stat.color} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Document Table Area */}
      <div className="flex-1 px-8 pb-8 overflow-hidden flex flex-col">
        <div className="flex-1 bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden flex flex-col relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-20">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
          ) : null}

          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#0d1117] z-10 border-b border-white/5">
                <tr>
                  <th className="p-4 w-12"><input type="checkbox" className="rounded bg-white/5 border-white/10" /></th>
                  <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Name <span className="ml-1">⇅</span></th>
                  <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Type</th>
                  <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Linked Unit</th>
                  <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Amount</th>
                  <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Date Added</th>
                  <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right pr-6">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-20 text-center">
                       <div className="flex flex-col items-center space-y-4 opacity-40">
                          <BsFileEarmarkText size={48} className="text-gray-600" />
                          <h3 className="text-lg font-bold">No documents found</h3>
                          <p className="text-sm max-w-xs">Upload your first organization document or refine your search/filters.</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc, idx) => (
                    <motion.tr 
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="p-4"><input type="checkbox" className="rounded bg-white/5 border-white/10" /></td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-white/5 text-gray-500 group-hover:text-teal-400 transition-colors">
                             {doc.filename?.endsWith('.pdf') ? <BsFileEarmarkPdf size={18} /> : <BsFileEarmarkText size={18} />}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors truncate block max-w-xs">
                              {doc.filename}
                            </span>
                            {doc.status === 'processing' && (
                              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest animate-pulse flex items-center">
                                <BsClockHistory className="mr-1" /> Processing
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${
                          DOC_TYPES.find(t => t.id === doc.document_type)?.color || 'bg-white/5 text-gray-500'
                        }`}>
                          {doc.document_type || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="p-4">
                        {doc.display_linked_unit ? (
                          <div className="flex items-center space-x-1.5 text-teal-400">
                             <BsLink45Deg className="text-lg" />
                             <span className="text-xs font-bold underline underline-offset-4 decoration-teal-500/30 truncate max-w-[150px]">
                               {doc.display_linked_unit}
                             </span>
                          </div>
                         ) : (
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDocForLinking(doc);
                                setIsLinkModalOpen(true);
                              }}
                              className="flex items-center space-x-1.5 text-gray-600 hover:text-teal-400 transition-colors group/link"
                            >
                               <BsPlusLg size={10} className="group-hover/link:rotate-90 transition-transform" />
                               <span className="text-[10px] font-bold uppercase tracking-widest">Link Unit</span>
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleAICategorize(doc);
                              }}
                              title="AI Categorize Suggestion"
                              className="p-1 rounded-md bg-teal-500/5 text-teal-500/40 hover:text-teal-400 hover:bg-teal-500/10 transition-all"
                            >
                               <BsMagic size={10} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right text-sm font-bold text-white">
                        {doc.display_amount ? `₹${Number(doc.display_amount).toLocaleString()}` : '—'}
                      </td>
                      <td className="p-4 text-right text-xs text-gray-500 font-medium">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end space-x-3">
                          <span className="text-[10px] text-gray-600 font-bold">{(doc.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             {doc.filename?.toLowerCase().match(/\.(csv|xlsx|xls)$/) && (
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   navigate(`/data-ingestion?workbench=${workbenchId}&docId=${doc.id}`);
                                 }}
                                 title="Ingest to Ledger"
                                 className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-black transition-all"
                               >
                                  <BsArrowRight size={14} />
                               </button>
                             )}
                             <button 
                               onClick={async (e) => {
                                 e.stopPropagation();
                                 try {
                                   const url = await backendService.getDocumentUrl(doc.file_path);
                                   window.open(url, '_blank');
                                 } catch (err) {
                                   toast.error("Failed to open document");
                                 }
                               }}
                               title="View Document"
                               className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                             >
                                <BsEye size={14} />
                             </button>
                             <button 
                               onClick={async (e) => {
                                 e.stopPropagation();
                                 try {
                                   toast.loading("Preparing download...", { id: "dl-doc" });
                                   await backendService.downloadDocument(doc.file_path, doc.filename);
                                   toast.success("Download started", { id: "dl-doc" });
                                 } catch (err) {
                                   toast.error("Download failed", { id: "dl-doc" });
                                 }
                               }}
                               title="Download Document"
                               className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                             >
                                <BsDownload size={14} />
                             </button>
                             <button 
                               onClick={async (e) => {
                                 e.stopPropagation();
                                 if (!window.confirm(`Are you sure you want to delete ${doc.filename}?`)) return;
                                 try {
                                   toast.loading("Deleting...", { id: "del-doc" });
                                   await backendService.deleteDocument(doc.id, doc.file_path);
                                   toast.success("Document deleted", { id: "del-doc" });
                                   fetchDocuments();
                                 } catch (err) {
                                   toast.error("Delete failed: " + err.message, { id: "del-doc" });
                                 }
                               }}
                               title="Delete Document"
                               className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10"
                             >
                                <BsTrash size={14} />
                             </button>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <LinkDocumentModal 
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        document={selectedDocForLinking}
        workbenchId={workbenchId}
        onSuccess={fetchDocuments}
      />
    </div>
  );
}
