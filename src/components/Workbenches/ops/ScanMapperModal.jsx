import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Building, Wallet, Calendar, Hash, FileText, ChevronRight, Search } from "lucide-react";
import { backendService } from "../../../services/backendService";
import { toast } from "react-hot-toast";
import { useWorkbench } from "../../../context/WorkbenchContext";

export default function ScanMapperModal({ isOpen, onClose, extractedData, doc, mode = "AP", onSuccess }) {
  const { parties, labels, workbenchId } = useWorkbench();
  const [docUrl, setDocUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    party_id: "",
    vessel_id: "",
    label_id: "", // Expense or Revenue Label
    amount: 0,
    date: "",
    invoice_number: "",
    description: "",
    items: []
  });

  const [entities, setEntities] = useState([]);

  useEffect(() => {
    if (isOpen && doc?.file_path) {
      backendService.getDocumentUrl(doc.file_path).then(setDocUrl).catch(console.error);
      fetchEntities();
    }
  }, [isOpen, doc]);

  useEffect(() => {
    if (extractedData) {
      setFormData({
        party_id: extractedData.party_id || "",
        amount: extractedData.totalAmount || extractedData.amount || 0,
        date: extractedData.date || new Date().toISOString().split('T')[0],
        invoice_number: extractedData.invoiceNumber || extractedData.invoice_no || "",
        description: extractedData.description || `Scanned ${mode}: ${extractedData.vendorName || extractedData.clientName || "Document"}`,
        items: extractedData.items || []
      });

      // Try to auto-match party
      const nameToMatch = (extractedData.vendorName || extractedData.clientName || "").toLowerCase();
      if (nameToMatch) {
        const matched = parties.find(p => p.name.toLowerCase().includes(nameToMatch));
        if (matched) {
          setFormData(prev => ({ ...prev, party_id: matched.id }));
        }
      }
    }
  }, [extractedData, parties, mode]);

  const fetchEntities = async () => {
    try {
      const data = await backendService.listWorkbenchEntities(workbenchId);
      setEntities(data);
    } catch (err) {
      console.error("Failed to fetch entities:", err);
    }
  };

  const handleSave = async () => {
    if (!formData.party_id) return toast.error("Please select a Party (Vendor/Client)");
    if (!formData.label_id) return toast.error(`Please select a ${mode === "AP" ? "Expense" : "Revenue"} Label`);
    
    try {
      setLoading(true);
      if (mode === "AP") {
        const apLabel = labels.find(l => l.sub_account === "Accounts Payable (AP)" || l.sub_account === "Accounts Payable");
        const payload = {
          workbench_id: workbenchId,
          party_id: formData.party_id,
          bill_number: formData.invoice_number,
          amount: formData.amount,
          issue_date: formData.date,
          category: "expense",
          expense_label_id: formData.label_id,
          ap_label_id: apLabel?.id || "",
          description: formData.description,
          items_json: formData.items,
          doc_id: doc.id
        };
        await backendService.createBill(payload);
      } else {
        const arLabel = labels.find(l => l.sub_account === "Accounts Receivable (AR)" || l.sub_account === "Accounts Receivable");
        const payload = {
          workbench_id: workbenchId,
          party_id: formData.party_id,
          invoice_number: formData.invoice_number,
          amount: formData.amount,
          issue_date: formData.date,
          revenue_label_id: formData.label_id,
          ar_label_id: arLabel?.id || "",
          description: formData.description,
          items_json: formData.items,
          doc_id: doc.id
        };
        await backendService.createInvoice(payload);
      }

      toast.success(`${mode} Record Created Successfully!`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to save record");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0a0a0a] border border-white/10 w-full max-w-7xl h-[90vh] rounded-[40px] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-2xl ${mode === 'AP' ? 'bg-rose-500/20 text-rose-400' : 'bg-teal-500/20 text-teal-400'}`}>
              <CheckCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">AI Scan Mapper</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Verify and link extracted document data</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-colors text-gray-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left: Document Preview */}
          <div className="hidden lg:flex w-1/2 border-r border-white/5 bg-black p-6 items-center justify-center relative">
            {docUrl ? (
              doc.mime_type?.includes('pdf') ? (
                <iframe src={docUrl} className="w-full h-full rounded-2xl border border-white/10" />
              ) : (
                <img src={docUrl} alt="Document" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl shadow-white/5" />
              )
            ) : (
              <div className="animate-pulse text-gray-600 font-bold uppercase tracking-widest">Loading Preview...</div>
            )}
            <div className="absolute top-10 left-10 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest">
              Original Document
            </div>
          </div>

          {/* Right: Mapper Form */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            {/* Step 1: Identity */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px]">1</span>
                Match Party & Target Bucket
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-600 uppercase ml-2">Select {mode === 'AP' ? 'Vendor' : 'Client'}</label>
                  <select 
                    value={formData.party_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, party_id: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-rose-500/50 outline-none transition-all"
                  >
                    <option value="">-- Choose Party --</option>
                    {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-600 uppercase ml-2">Ledger Label ({mode === 'AP' ? 'Expense' : 'Revenue'})</label>
                  <select 
                    value={formData.label_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, label_id: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-teal-500/50 outline-none transition-all"
                  >
                    <option value="">-- Choose Label --</option>
                    {labels.filter(l => l.type === (mode === 'AP' ? 'expense' : 'revenue') || l.type === (mode === 'AP' ? 'expense' : 'income')).map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Financial Details */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px]">2</span>
                Extracted Financials
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/[0.03] p-6 rounded-3xl border border-white/5 space-y-2">
                   <div className="flex items-center space-x-2 text-gray-500">
                     <Wallet size={14} />
                     <span className="text-[10px] font-bold uppercase">Amount</span>
                   </div>
                   <div className="flex items-center">
                     <span className="text-xl font-black text-white mr-2">₹</span>
                     <input 
                       type="number" 
                       value={formData.amount} 
                       onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                       className="bg-transparent text-2xl font-black text-white w-full outline-none"
                     />
                   </div>
                </div>

                <div className="bg-white/[0.03] p-6 rounded-3xl border border-white/5 space-y-2">
                   <div className="flex items-center space-x-2 text-gray-500">
                     <Calendar size={14} />
                     <span className="text-[10px] font-bold uppercase">Issue Date</span>
                   </div>
                   <input 
                     type="date" 
                     value={formData.date} 
                     onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                     className="bg-transparent text-lg font-bold text-white w-full outline-none"
                   />
                </div>

                <div className="bg-white/[0.03] p-6 rounded-3xl border border-white/5 space-y-2">
                   <div className="flex items-center space-x-2 text-gray-500">
                     <Hash size={14} />
                     <span className="text-[10px] font-bold uppercase">Doc #</span>
                   </div>
                   <input 
                     type="text" 
                     value={formData.invoice_number} 
                     onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                     placeholder="INV-000"
                     className="bg-transparent text-lg font-bold text-white w-full outline-none"
                   />
                </div>
              </div>

              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-600 uppercase ml-2">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-white/30 outline-none transition-all h-24 resize-none"
                  />
                </div>
            </div>

            {/* Items (If any) */}
            {formData.items.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Line Items Detected</h3>
                <div className="space-y-3">
                   {formData.items.map((item, idx) => (
                     <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <div className="flex items-center space-x-4">
                           <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400">{idx + 1}</div>
                           <div>
                              <p className="text-sm font-bold text-white">{item.description}</p>
                              <p className="text-[10px] text-gray-500 font-bold uppercase">{item.hsn_code ? `HSN: ${item.hsn_code}` : 'No HSN'}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-black text-white">₹{item.price * item.quantity}</p>
                           <p className="text-[10px] text-gray-500 font-bold">{item.quantity} x ₹{item.price}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-400">
            <AlertCircle size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">Check values against the original document on the left</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={onClose}
              className="px-8 py-3 text-xs font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className={`px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center space-x-3 shadow-2xl ${
                mode === 'AP' 
                ? 'bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600' 
                : 'bg-teal-500 text-black shadow-teal-500/20 hover:bg-teal-600'
              } disabled:opacity-50`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Confirm & Record to Ledger</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
