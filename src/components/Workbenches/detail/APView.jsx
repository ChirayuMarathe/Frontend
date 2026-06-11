import React, { useState, useEffect } from "react";
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
  BsCloudDownload,
  BsCreditCard
} from "react-icons/bs";
import { backendService } from "../../../services/backendService";
import { supabase } from "../../../lib/supabase";
import { useWorkbench } from "../../../context/WorkbenchContext";
import Card from "../../shared/Card";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import RecordVendorPaymentModal from "../ops/RecordVendorPaymentModal";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import ScanMapperModal from "../ops/ScanMapperModal";

export default function APView({ workbenchId }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("payables");
  const [bills, setBills] = useState([]);
  const [vaultBills, setVaultBills] = useState([]);
  const [metrics, setMetrics] = useState({ total_payable: 0, dpo: 0, aging: {} });
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [extractedBill, setExtractedBill] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMapperOpen, setIsMapperOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);

  const { labels } = useWorkbench();

  useEffect(() => {
    fetchData();
  }, [workbenchId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [billData, vaultData, metricData] = await Promise.all([
        backendService.listBills(workbenchId).catch(() => []),
        supabase.from('workbench_documents')
          .select('*')
          .eq('workbench_id', workbenchId)
          .in('document_type', ['Expense', 'Liability', 'AP_Bill', 'invoice', 'AP_Receipt'])
          .is('metadata->extracted_bill', null),



        backendService.getAPMetrics(workbenchId).catch(() => ({ total_payable: 0, dpo: 0, aging: {} }))
      ]);

      setBills(billData);
      setVaultBills(vaultData.data || []);
      setMetrics(metricData);
    } catch (err) {
      console.error("Error fetching AP data:", err);
      toast.error("Failed to load AP records");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    toast.loading("AI Scanning & Extracting Bill...", { id: "quick-scan" });
    try {
      const extracted = await backendService.scanInvoiceDoc(workbenchId, file);
      // ScanInvoiceDoc returns { ...extracted, doc_id: doc.id }
      // We need to fetch the full doc metadata for the mapper
      const { data: docData } = await supabase.from('workbench_documents').select('*').eq('id', extracted.doc_id).single();
      
      setExtractedBill(extracted);
      setCurrentDoc(docData);
      setIsMapperOpen(true);
      toast.success("Data Extracted! Review and Confirm.", { id: "quick-scan" });
    } catch (err) {
      toast.error("Extraction failed: " + err.message, { id: "quick-scan" });
    }
  };

  const handleConfirmBill = async () => {
    if (!extractedBill) return;
    
    try {
      setLoading(true);
      const payload = {
        workbench_id: workbenchId,
        party_id: extractedBill.party_id || '',
        bill_number: extractedBill.invoiceNumber || `SCAN-${Date.now()}`,
        amount: extractedBill.totalAmount || extractedBill.amount || 0,
        issue_date: extractedBill.date || new Date().toISOString().split('T')[0],
        category: "expense",
        expense_label_id: labels.find(l => l.type === 'expense')?.id || '',
        ap_label_id: labels.find(l => l.type === 'liability')?.id || '',
        description: `Scanned Bill: ${extractedBill.vendorName || 'Vendor'}`,
        doc_id: extractedBill.doc_id
      };

      await backendService.createBill(payload);
      setExtractedBill(null);
      fetchData();
      toast.success("Bill successfully recorded in Ledger");
    } catch (err) {
      toast.error("Failed to record: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScanDoc = async (doc) => {
    toast.loading("AI Scanning Bill...", { id: "scan-bill" });
    try {
      const extracted = await backendService.scanInvoice(doc.id);
      setExtractedBill(extracted);
      setCurrentDoc(doc);
      setIsMapperOpen(true);
      toast.success("Extraction Complete!", { id: "scan-bill" });
    } catch (err) {
      toast.error("Scanning failed: " + err.message, { id: "scan-bill" });
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
              className="absolute inset-0 backface-hidden bg-white/[0.02] border border-white/10 rounded-3xl p-6 flex flex-col justify-between overflow-hidden group border-l-4 border-l-rose-500/50"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                 <BsCurrencyRupee size={60} className="text-rose-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Total Payable</span>
                <h3 className="text-3xl font-black text-white">₹{Number(metrics.total_payable || 0).toLocaleString()}</h3>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-2">
                  <BsGraphUp className="text-rose-400 text-xs rotate-180" />
                  <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Active Liability</span>
                </div>
                <span className="text-[9px] text-gray-600 font-bold uppercase">Click to flip</span>
              </div>
            </div>

            {/* Back Side */}
            <div 
              className="absolute inset-0 backface-hidden rotate-y-180 bg-rose-500/10 border border-rose-500/20 rounded-3xl p-6 flex flex-col justify-between overflow-hidden group"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="absolute right-0 top-0 p-4 opacity-10">
                 <BsGraphUp size={60} className="text-rose-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-rose-400/60 uppercase tracking-widest block mb-2">Total Expense/Payable</span>
                <h3 className="text-3xl font-black text-white">₹{Number(metrics.total_gross_expense || 0).toLocaleString()}</h3>
              </div>
              <div className="mt-auto">
                <p className="text-[10px] text-rose-400/80 font-medium">Gross expenses booked in timeframe</p>
              </div>
            </div>


          </motion.div>
        </div>


        <Card className="p-6 bg-white/[0.02] border-white/5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Avg. DPO</span>
          <h3 className="text-3xl font-black text-white">{metrics.dpo} <span className="text-xs font-medium text-gray-500">Days</span></h3>
          <p className="text-[10px] text-gray-600 font-medium mt-2">Time to pay vendors</p>
        </Card>

        <Card className="col-span-2 p-6 bg-white/[0.02] border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-4">Aging Buckets (INR)</span>
          <div className="flex h-4 w-full bg-white/5 rounded-full overflow-hidden mb-4">
            {Object.entries(metrics.aging || {}).map(([key, val]) => {
              const percentage = metrics.total_payable > 0 ? (val / metrics.total_payable) * 100 : 0;
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

      {/* Quick Drop & Scan Area */}
      <div className="relative group">
        <div className={`p-8 rounded-[40px] border-2 border-dashed transition-all flex flex-col items-center justify-center bg-rose-500/[0.02] ${loading ? "border-rose-500/20" : "border-white/10 hover:border-rose-500/30"}`}>
            <div className="flex items-center space-x-6">
              <div className="p-4 bg-rose-500/10 text-rose-400 rounded-3xl">
                  <BsCloudDownload size={32} />
              </div>
              <div>
                  <h3 className="text-xl font-black text-white">Scan Vendor Invoice</h3>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1">Drop PDF or UPI Screenshot to record instantly</p>
              </div>
              <div className="h-10 w-[1px] bg-white/10 mx-4" />
              <label className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-gray-400 hover:text-white hover:bg-rose-500 hover:border-rose-500 transition-all cursor-pointer uppercase tracking-widest">
                  Browse Files
                  <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
        </div>
      </div>

      {/* Tabs and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab("payables")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "payables" ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
          >
            Outstanding Bills
          </button>
          <button 
            onClick={() => setActiveTab("vault")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative ${activeTab === "vault" ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
          >
            Import from Vault
            {vaultBills.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[9px] flex items-center justify-center rounded-full border border-black animate-bounce">
                {vaultBills.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden min-h-[400px]">
        {activeTab === "payables" ? (
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-white/5">
                   <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Vendor / Service</th>
                   <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Bill #</th>
                   <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Expense Label</th>
                   <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>

                   <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Balance Due</th>
                   <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Due Date</th>
                   <th className="p-6 text-right pr-10"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/[0.03]">
                 {bills.length === 0 ? (
                   <tr>
                     <td colSpan="7" className="py-24 text-center opacity-30">
                        <BsCreditCard size={48} className="mx-auto mb-4" />
                        <p className="text-sm font-medium">No payables found. Record your first bill to track obligations.</p>
                     </td>
                   </tr>
                 ) : (
                   bills.map((bill) => (
                     <tr key={bill.id} className="group hover:bg-white/[0.01] transition-colors">
                       <td className="p-6">
                         <div className="flex flex-col">
                           <span className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">{bill.parties?.name || 'Unknown Vendor'}</span>
                           <span className="text-[10px] text-gray-600 font-bold uppercase mt-0.5 tracking-tighter">{bill.description || 'General Expense'}</span>
                         </div>
                       </td>
                       <td className="p-6 text-center text-xs font-mono text-gray-400">{bill.bill_number}</td>
                       <td className="p-6 text-center">
                          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                            {bill.labels?.name || bill.category}
                          </span>
                       </td>

                       <td className="p-6 text-center">
                         <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                           bill.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                           bill.status === 'partial' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                           bill.status === 'overdue' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                           'bg-amber-500/10 text-amber-400 border-amber-500/20'
                         }`}>
                           {bill.status}
                         </span>
                       </td>
                       <td className="p-6 text-right font-black text-white">₹{Number(bill.balance_due).toLocaleString()}</td>
                       <td className="p-6 text-right text-xs text-gray-500 font-medium">{bill.due_date ? new Date(bill.due_date).toLocaleDateString() : 'No Due Date'}</td>
                       <td className="p-6 text-right pr-8">
                         <button 
                           onClick={() => {
                             setSelectedBill(bill);
                             setIsPaymentModalOpen(true);
                           }}
                           className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-gray-400 hover:text-white hover:border-rose-500/30 transition-all uppercase tracking-widest"
                         >
                           Pay Vendor
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
            {vaultBills.length === 0 ? (
              <div className="col-span-full py-24 text-center opacity-30">
                 <BsCloudDownload size={48} className="mx-auto mb-4" />
                 <p className="text-sm font-medium">No unlinked bills in vault. Upload docs as 'AP_Bill' to see them here.</p>
              </div>
            ) : (
              vaultBills.map((doc) => (
                <div key={doc.id} className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl group hover:border-rose-500/30 transition-all flex flex-col justify-between h-[200px]">
                   <div className="flex items-start justify-between">
                     <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                        <BsFileEarmarkPdf size={20} />
                     </div>
                     <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Bill Source</span>
                   </div>
                   <div className="mt-4">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-rose-400 transition-colors">{doc.filename}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Added: {new Date(doc.created_at).toLocaleDateString()}</p>
                   </div>
                   <button 
                     onClick={() => handleScanDoc(doc)}
                     className="mt-6 w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-gray-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all uppercase tracking-widest"
                   >
                     AI Scan & Extract
                   </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <RecordVendorPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bill={selectedBill}
        onSuccess={() => {
          fetchData();
          setIsPaymentModalOpen(false);
        }}
      />
      <ScanMapperModal 
        isOpen={isMapperOpen}
        onClose={() => setIsMapperOpen(false)}
        extractedData={extractedBill}
        doc={currentDoc}
        mode="AP"
        onSuccess={() => {
          fetchData();
          setExtractedBill(null);
          setCurrentDoc(null);
        }}
      />
    </div>
  );
}
