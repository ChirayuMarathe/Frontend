import React, { useState, useEffect } from "react";
// Cache bust: 17:24
import { 
  BsFileEarmarkPdf, 
  BsClockHistory, 
  BsCheckCircleFill, 
  BsExclamationTriangle,
  BsPlusLg,
  BsSearch,
  BsFilter,
  BsArrowRight,
  BsCurrencyRupee,
  BsGraphUp,
  BsLayers,
  BsCloudDownload
} from "react-icons/bs";
import { backendService } from "../../../services/backendService";
import { supabase } from "../../../lib/supabase";
import Card from "../../shared/Card";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import RecordPaymentModal from "../ops/RecordPaymentModal";
import { motion, AnimatePresence } from "framer-motion";
import ScanMapperModal from "../ops/ScanMapperModal";


export default function ARView({ workbenchId }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("receivables");
  const [invoices, setInvoices] = useState([]);
  const [vaultInvoices, setVaultInvoices] = useState([]);
  const [metrics, setMetrics] = useState({ total_receivable: 0, dso: 0, aging: {} });
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMapperOpen, setIsMapperOpen] = useState(false);
  const [extractedInvoice, setExtractedInvoice] = useState(null);
  const [currentDoc, setCurrentDoc] = useState(null);


  useEffect(() => {
    fetchData();
  }, [workbenchId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invData, vaultData, metricData] = await Promise.all([
        backendService.listInvoices(workbenchId).catch(() => []),
        supabase.from('workbench_documents')
          .select('*')
          .eq('workbench_id', workbenchId)
          .in('document_type', ['Revenue', 'AR_Invoice', 'invoice', 'AR_Receipt'])
          .is('metadata->extracted_invoice', null),



        backendService.getARMetrics(workbenchId).catch(() => ({ total_receivable: 0, dso: 0, aging: {} }))
      ]);

      setInvoices(invData);
      setVaultInvoices(vaultData.data || []);
      setMetrics(metricData);
    } catch (err) {
      console.error("Error fetching AR data:", err);
      toast.error("Failed to load AR records");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    toast.loading("AI Scanning & Extracting Invoice...", { id: "quick-scan-ar" });
    try {
      const doc = await backendService.uploadDocument(workbenchId, file, 'AR_Invoice');
      const extracted = await backendService.scanInvoice(doc.id);
      
      setExtractedInvoice(extracted);
      setCurrentDoc(doc);
      setIsMapperOpen(true);
      toast.success("Data Extracted! Review and Map.", { id: "quick-scan-ar" });
    } catch (err) {
      toast.error("Extraction failed: " + err.message, { id: "quick-scan-ar" });
    }
  };

  const handleScanDoc = async (doc) => {
    toast.loading("AI Scanning Invoice...", { id: "scan-doc" });
    try {
      const extracted = await backendService.scanInvoice(doc.id);
      setExtractedInvoice(extracted);
      setCurrentDoc(doc);
      setIsMapperOpen(true);
      toast.success("Extraction Complete!", { id: "scan-doc" });
    } catch (err) {
      toast.error("Scanning failed: " + err.message, { id: "scan-doc" });
    }
  };

  const agingColors = {
    "0-30": "bg-emerald-500",
    "31-60": "bg-blue-500",
    "61-90": "bg-amber-500",
    "90+": "bg-rose-500"
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          className="relative h-[160px] cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <motion.div
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            className="w-full h-full relative preserve-3d"
          >
            {/* Front Side */}
            <div 
              className="absolute inset-0 backface-hidden bg-white/[0.02] border border-white/10 rounded-3xl p-6 flex flex-col justify-between overflow-hidden group"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                 <BsCurrencyRupee size={60} className="text-teal-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Total Receivable</span>
                <h3 className="text-3xl font-black text-white">₹{Number(metrics.total_receivable || 0).toLocaleString()}</h3>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-2">
                  <BsGraphUp className="text-teal-400 text-xs" />
                  <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">Active Credit</span>
                </div>
                <span className="text-[9px] text-gray-600 font-bold uppercase">Click to flip</span>
              </div>
            </div>

            {/* Back Side */}
            <div 
              className="absolute inset-0 backface-hidden rotate-y-180 bg-teal-500/10 border border-teal-500/20 rounded-3xl p-6 flex flex-col justify-between overflow-hidden group"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="absolute right-0 top-0 p-4 opacity-10">
                 <BsGraphUp size={60} className="text-teal-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-teal-400/60 uppercase tracking-widest block mb-2">Total Sales Revenue</span>
                <h3 className="text-3xl font-black text-white">₹{Number(metrics.total_sales_revenue || 0).toLocaleString()}</h3>
              </div>
              <div className="mt-auto">
                <p className="text-[10px] text-teal-400/80 font-medium">Gross revenue booked in timeframe</p>
              </div>
            </div>


          </motion.div>
        </div>


        <Card className="p-6 bg-white/[0.02] border-white/5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Avg. DSO</span>
          <h3 className="text-3xl font-black text-white">{metrics.dso} <span className="text-xs font-medium text-gray-500">Days</span></h3>
          <p className="text-[10px] text-gray-600 font-medium mt-2">Time to collect payment</p>
        </Card>

        <Card className="col-span-2 p-6 bg-white/[0.02] border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-4">Aging Buckets (INR)</span>
          <div className="flex h-4 w-full bg-white/5 rounded-full overflow-hidden mb-4">
            {Object.entries(metrics.aging || {}).map(([key, val]) => {
              const percentage = metrics.total_receivable > 0 ? (val / metrics.total_receivable) * 100 : 0;
              return (
                <div 
                  key={key} 
                  style={{ width: `${percentage}%` }} 
                  className={`${agingColors[key]} transition-all`}
                  title={`${key}: ₹${val}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between items-center">
            {Object.entries(metrics.aging || {}).map(([key, val]) => (
              <div key={key} className="flex flex-col items-center">
                <div className="flex items-center space-x-1.5 mb-1">
                   <div className={`w-2 h-2 rounded-full ${agingColors[key]}`} />
                   <span className="text-[9px] font-bold text-gray-500">{key}</span>
                </div>
                <span className="text-xs font-bold text-gray-300">₹{val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tabs and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab("receivables")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "receivables" ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
          >
            Receivables
          </button>
          <button 
            onClick={() => setActiveTab("vault")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative ${activeTab === "vault" ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
          >
            Import from Vault
            {vaultInvoices.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[9px] flex items-center justify-center rounded-full border border-black animate-bounce">
                {vaultInvoices.length}
              </span>
            )}
          </button>
        </div>

        <button 
          onClick={() => {
            navigate('/templates/gst-invoice', { 
              state: { 
                fromWorkbench: true,
                workbenchId
              }
            });
          }}
          className="flex items-center space-x-3 px-8 py-3 bg-[#81E6D9] text-black rounded-2xl text-sm font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-[#81E6D9]/10"
        >
          <BsPlusLg />
          <span>Issue Invoice</span>
        </button>
      </div>
      
      {/* Quick Drop & Scan Area */}
      {activeTab === "receivables" && (
        <div className="relative group">
          <div className={`p-8 rounded-[40px] border-2 border-dashed transition-all flex flex-col items-center justify-center bg-teal-500/[0.02] ${loading ? "border-teal-500/20" : "border-white/10 hover:border-teal-500/30"}`}>
             <div className="flex items-center space-x-6">
                <div className="p-4 bg-teal-500/10 text-teal-400 rounded-3xl">
                   <BsCloudDownload size={32} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-white">Scan Customer Invoice</h3>
                   <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1">Drop PDF or Proof to record & issue instantly</p>
                </div>
                <div className="h-10 w-[1px] bg-white/10 mx-4" />
                <label className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-gray-400 hover:text-white hover:bg-teal-500 hover:text-black hover:border-teal-500 transition-all cursor-pointer uppercase tracking-widest">
                   Browse Files
                   <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
             </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden min-h-[400px]">
        {activeTab === "receivables" ? (
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-white/5">
                   <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Client / Entity</th>
                   <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Inv #</th>
                   <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Revenue Label</th>
                   <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
                   <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Balance Due</th>
                   <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Due Date</th>
                   <th className="p-6 text-right pr-10"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/[0.03]">
                 {invoices.length === 0 ? (
                   <tr>
                     <td colSpan="7" className="py-24 text-center opacity-30">
                        <BsLayers size={48} className="mx-auto mb-4" />
                        <p className="text-sm font-medium">No receivables found. Issue your first invoice to get started.</p>
                     </td>
                   </tr>
                 ) : (
                   invoices.map((inv) => (
                     <tr key={inv.id} className="group hover:bg-white/[0.01] transition-colors">
                       <td className="p-6">
                         <div className="flex flex-col">
                           <span className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">{inv.parties?.name || 'Unknown Client'}</span>
                           <span className="text-[10px] text-gray-600 font-bold uppercase mt-0.5 tracking-tighter">{inv.description || 'Service/Product Invoice'}</span>
                         </div>
                       </td>
                       <td className="p-6 text-center text-xs font-mono text-gray-400">{inv.invoice_number}</td>
                       <td className="p-6 text-center">
                         <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                           {inv.labels?.name || 'General Revenue'}
                         </span>
                       </td>
                       <td className="p-6 text-center">
                         <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                           inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                           inv.status === 'partial' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                           inv.status === 'overdue' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                           'bg-amber-500/10 text-amber-400 border-amber-500/20'
                         }`}>
                           {inv.status}
                         </span>
                       </td>
                       <td className="p-6 text-right font-black text-white">₹{Number(inv.balance_due).toLocaleString()}</td>
                       <td className="p-6 text-right text-xs text-gray-500 font-medium">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'No Due Date'}</td>
                       <td className="p-6 text-right pr-8">
                         <button 
                           onClick={() => {
                             setSelectedInvoice(inv);
                             setIsPaymentModalOpen(true);
                           }}
                           className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-gray-400 hover:text-white hover:border-teal-500/30 transition-all uppercase tracking-widest"
                         >
                           Record Payment
                         </button>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
          </div>
        ) : (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaultInvoices.length === 0 ? (
              <div className="col-span-full py-24 text-center opacity-30">
                 <BsCloudDownload size={48} className="mx-auto mb-4" />
                 <p className="text-sm font-medium">No unlinked invoices in vault. Upload docs as 'AR_Invoice' to see them here.</p>
              </div>
            ) : (
              vaultInvoices.map((doc) => (
                <div key={doc.id} className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl group hover:border-teal-500/30 transition-all flex flex-col justify-between h-[200px]">
                   <div className="flex items-start justify-between">
                     <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                        <BsFileEarmarkPdf size={20} />
                     </div>
                     <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Document Source</span>
                   </div>
                   <div className="mt-4">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-teal-400 transition-colors">{doc.filename}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Added: {new Date(doc.created_at).toLocaleDateString()}</p>
                   </div>
                   <button 
                     onClick={() => handleScanDoc(doc)}
                     className="mt-6 w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-gray-400 hover:bg-teal-500 hover:text-black hover:border-teal-500 transition-all uppercase tracking-widest"
                   >
                     AI Scan & Extract
                   </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>


      <RecordPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoice={selectedInvoice}
        onSuccess={() => {
          fetchData();
          setIsPaymentModalOpen(false);
        }}
      />
      <ScanMapperModal 
        isOpen={isMapperOpen}
        onClose={() => setIsMapperOpen(false)}
        extractedData={extractedInvoice}
        doc={currentDoc}
        mode="AR"
        onSuccess={() => {
          fetchData();
          setExtractedInvoice(null);
          setCurrentDoc(null);
        }}
      />
    </div>
  );
}
