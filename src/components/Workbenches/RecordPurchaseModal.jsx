import React, { useState, useEffect } from "react";
import {
  BsX,
  BsCartPlus,
  BsBoxSeam,
  BsCurrencyRupee,
  BsBuilding,
  BsCheck2,
  BsCalendar
} from "react-icons/bs";
import { backendService } from "../../services/backendService";
import { useWorkbench } from "../../context/WorkbenchContext";
import { toast } from "react-hot-toast";
import ProofUploader from "./shared/ProofUploader";

export default function RecordPurchaseModal({ isOpen, onClose, workbenchId, item, onSuccess }) {
  const { labels } = useWorkbench();
  const [loading, setLoading] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [entities, setEntities] = useState([]);
  const [formData, setFormData] = useState({
    quantity: '',
    unit_cost: item?.price || '',
    source_label_id: '', // This will be the Vendor's Shadow Label
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isOpen && workbenchId) {
      fetchEntities();
    }
  }, [isOpen, workbenchId]);

  const fetchEntities = async () => {
    try {
      const data = await backendService.listWorkbenchEntities(workbenchId);
      setEntities(data);
    } catch (err) {
      console.error("Failed to fetch entities:", err);
    }
  };

  if (!isOpen || !item) return null;

  // Filter for external party vessels (Vendors)
  const vendorVessels = entities.filter(e => !e.parties?.is_self && e.label_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.quantity || !formData.unit_cost || !formData.source_label_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        workbench_id: workbenchId,
        item_id: item.id,
        quantity: parseFloat(formData.quantity),
        unit_cost: parseFloat(formData.unit_cost),
        source_entity_id: formData.source_label_id, // This field name in backend should probably be source_label_id or similar, but checking backend routers
        description: formData.description || `Purchase of ${item.name}`,
        transaction_date: formData.transaction_date
      };

      const result = await backendService.recordStockPurchase(payload);
      
      // 2. If there's a proof file, upload it
      if (proofFile && result.transaction?.id) {
        toast.loading("Uploading proof document...", { id: "upload-proof" });
        try {
          await backendService.uploadDocument(
            workbenchId, 
            proofFile, 
            'AP_Bill', 
            result.transaction.id
          );
          toast.success("Proof document linked!", { id: "upload-proof" });
        } catch (uploadErr) {
          console.error("Proof upload failed:", uploadErr);
          toast.error("Transaction recorded, but proof upload failed", { id: "upload-proof" });
        }
      }

      toast.success("Purchase recorded successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error recording purchase:", err);
      toast.error(err.message || "Failed to record purchase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl">
              <BsCartPlus className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Purchase Stock</h2>
              <p className="text-[11px] text-gray-500 mt-1 font-medium">{item.name} • {item.sku}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full">
            <BsX className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Quantity</label>
              <div className="relative group">
                <BsBoxSeam className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-sm group-focus-within:text-teal-400 transition-colors" />
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="0.00"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all font-medium"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Unit Cost</label>
              <div className="relative group">
                <BsCurrencyRupee className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-sm group-focus-within:text-teal-400 transition-colors" />
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="0.00"
                  value={formData.unit_cost}
                  onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Bought From (Vendor Vessel)</label>
            <div className="relative group">
              <BsBuilding className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-sm group-focus-within:text-teal-400 transition-colors" />
              <select
                required
                value={formData.source_label_id}
                onChange={(e) => setFormData({ ...formData, source_label_id: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-10 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all appearance-none font-medium"
              >
                <option value="" className="bg-[#0A0A0A]">Select Vendor...</option>
                {vendorVessels.map(v => (
                  <option key={v.id} value={v.label_id} className="bg-[#0A0A0A]">
                    {v.parties?.name} - {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Purchase Date</label>
              <div className="relative group">
                <BsCalendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-sm group-focus-within:text-teal-400 transition-colors" />
                <input
                  type="date"
                  required
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all font-medium"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Notes</label>
              <textarea
                placeholder="Vendor details, invoice #, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all font-medium min-h-[100px] resize-none"
              />
            </div>
            <div className="space-y-3">
              <ProofUploader 
                selectedFile={proofFile} 
                onFileSelect={setProofFile} 
                label="Invoice / Bill Proof" 
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-6 pt-4">
            <button type="button" onClick={onClose} className="px-8 py-3 text-sm font-bold text-gray-500 hover:text-white transition-all hover:bg-white/5 rounded-2xl">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-3 px-10 py-3.5 bg-teal-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 hover:scale-[1.02] transition-all shadow-xl shadow-teal-500/20"
            >
              {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <BsCheck2 className="text-xl" />}
              <span>{loading ? "Recording..." : "Confirm Purchase"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
