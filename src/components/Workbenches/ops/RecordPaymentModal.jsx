import React, { useState, useEffect } from "react";
import {
  BsX,
  BsCheck2,
  BsCurrencyRupee,
  BsCalendar,
  BsBank,
  BsLayers,
  BsBuilding
} from "react-icons/bs";
import { useWorkbench } from "../../../context/WorkbenchContext";
import { backendService } from "../../../services/backendService";
import { toast } from "react-hot-toast";
import { supabase } from "../../../lib/supabase";


export default function RecordPaymentModal({ isOpen, onClose, invoice, onSuccess }) {
  const { labels } = useWorkbench();
  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState([]);
  const [formData, setFormData] = useState({
    amount: invoice?.balance_due || 0,
    payment_date: new Date().toISOString().split('T')[0],
    bank_label_id: '',
    ar_label_id: invoice?.ar_label_id || '',
    description: '',
    doc_id: null
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen && invoice) {
      fetchEntities();
    }
  }, [isOpen, invoice]);

  const fetchEntities = async () => {
    try {
      const data = await backendService.listWorkbenchEntities(invoice.workbench_id);
      setEntities(data);
    } catch (err) {
      console.error("Failed to fetch entities:", err);
    }
  };

  if (!isOpen || !invoice) return null;

  // Filter for bank/cash asset vessels of 'Self'
  const selfVessels = entities.filter(e => e.parties?.is_self && e.label_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bank_label_id) {
      toast.error("Please select a destination account (Vessel)");
      return;
    }

    try {
      setLoading(true);
      await backendService.recordPayment(invoice.id, {
        ...formData,
        ar_label_id: invoice.ar_label_id
      });
      toast.success("Payment recorded!");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error recording payment:", err);
      toast.error(err.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      toast.loading("Uploading proof...", { id: 'upload-proof' });
      
      const fileName = `${invoice.workbench_id}/payments/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('workbench-documents')
        .upload(fileName, file);

      if (error) throw error;

      // Create document record
      const { data: doc, error: docError } = await supabase
        .from('workbench_documents')
        .insert({
          workbench_id: invoice.workbench_id,
          filename: file.name,
          file_path: data.path,
          document_type: 'Payment_Proof',
          status: 'verified'
        })
        .select()
        .single();

      if (docError) throw docError;

      setFormData({ ...formData, doc_id: doc.id });
      toast.success("Proof uploaded & linked!", { id: 'upload-proof' });
    } catch (err) {
      toast.error("Upload failed: " + err.message, { id: 'upload-proof' });
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
        
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
              <BsBank className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Record Receipt</h2>
              <p className="text-[10px] text-gray-500 mt-0.5 font-bold uppercase tracking-widest">Inv: {invoice.invoice_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full">
            <BsX className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-3">
             <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center">
               <BsCurrencyRupee className="mr-2" /> Amount Received
             </label>
             <div className="relative">
               <BsCurrencyRupee className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
               <input 
                 type="number"
                 required
                 max={invoice.balance_due}
                 step="any"
                 value={formData.amount}
                 onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                 className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-bold"
               />
               <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-600">
                 of ₹{Number(invoice.balance_due).toLocaleString()}
               </div>
             </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center">
               <BsBuilding className="mr-2" /> Deposit To
             </label>
              <select 
                required
                value={formData.bank_label_id}
                onChange={(e) => setFormData({ ...formData, bank_label_id: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-bold appearance-none"
              >
                <option value="" className="bg-black text-gray-500">Select Your Account (Vessel)...</option>
                {selfVessels.map(v => (
                  <option key={v.id} value={v.label_id} className="bg-black">
                    {v.name} ({v.type})
                  </option>
                ))}
              </select>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center">
                 <BsCalendar className="mr-2" /> Receipt Date
               </label>
               <input 
                 type="date"
                 required
                 value={formData.payment_date}
                 onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                 className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-bold"
               />
            </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
               Payment Proof (Optional)
             </label>
             <label className={`w-full flex items-center justify-center p-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${formData.doc_id ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}>
                <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                <div className="flex flex-col items-center">
                   {uploading ? (
                     <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                   ) : formData.doc_id ? (
                     <span className="text-[10px] font-bold text-emerald-400">✓ Proof Attached</span>
                   ) : (
                     <span className="text-[10px] font-bold text-gray-500">Upload Receipt / Screenshot</span>
                   )}
                </div>
             </label>
          </div>


          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
             <button type="button" onClick={onClose} className="text-xs font-bold text-gray-600 hover:text-white transition-colors">Cancel</button>
             <button 
               type="submit"
               disabled={loading}
               className="flex items-center space-x-3 px-10 py-3 bg-emerald-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-emerald-500/20"
             >
               {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <BsCheck2 className="text-xl" />}
               <span>{loading ? "Recording..." : "Confirm Receipt"}</span>
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
