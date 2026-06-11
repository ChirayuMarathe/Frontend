import React, { useState, useEffect } from "react";
import { 
  BsX, 
  BsArrowLeftRight,
  BsExclamationTriangle,
  BsCheck2,
  BsFileEarmarkText,
  BsLightningCharge
} from "react-icons/bs";
import { backendService } from "../../services/backendService";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";

const ADJUSTMENT_TYPES = [
  { id: 'reverse', label: 'Reverse Entry', description: 'Completely undo the financial impact', types: ['transaction', 'budget'] },
  { id: 'reclassify', label: 'Reclassify', description: 'Change category or party association', types: ['transaction'] },
  { id: 'correct_budget', label: 'Budget Correction', description: 'Adjust impact on allocated budget', types: ['budget'] },
  { id: 'party_correction', label: 'Party Correction', description: 'Link to a different vendor/customer', types: ['transaction', 'party'] },
  { id: 'status_correction', label: 'Status Correction', description: 'Update compliance filing status', types: ['compliance'] }
];

export default function AdjustmentModal({ isOpen, onClose, record, workbenchId, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [parties, setParties] = useState([]);
  const [formData, setFormData] = useState({
    adjustment_type: '',
    reason: '',
    adjustment_amount: 0,
    corrected_party_id: '',
    new_status: '',
    filed_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isOpen && workbenchId) {
      fetchParties();
    }
  }, [isOpen, workbenchId]);

  const fetchParties = async () => {
    try {
      const { data, error } = await supabase
        .from('workbench_parties')
        .select('id, name')
        .eq('workbench_id', workbenchId);
      if (error) throw error;
      setParties(data || []);
    } catch (err) {
      console.error("Error fetching parties:", err);
    }
  };

  useEffect(() => {
    if (record) {
      const defaultType = record.record_type === 'compliance' ? 'status_correction' : 
                          record.record_type === 'party' ? 'party_correction' : 'reverse';
      
      const existingAmount = record.net_amount || record.gross_amount || parseFloat(record.metadata?.amount) || 0;
      
      setFormData(prev => ({
        ...prev,
        adjustment_type: defaultType,
        adjustment_amount: -existingAmount,
        reason: `Correction for: ${record.summary}`,
        corrected_party_id: record.party_id || '',
        new_status: record.metadata?.status || 'pending',
        filed_date: record.metadata?.filed_date || new Date().toISOString().split('T')[0]
      }));
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const filteredTypes = ADJUSTMENT_TYPES.filter(t => t.types.includes(record.record_type));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reason) {
      toast.error("Please provide a reason for adjustment");
      return;
    }

    try {
      setLoading(true);

      await backendService.pushAdjustment(
        workbenchId,
        record.id,
        formData.adjustment_type,
        formData.reason,
        formData
      );

      toast.success("Adjustment pushed successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error pushing adjustment:", err);
      toast.error(err.message || "Failed to push adjustment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-xl bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                <BsArrowLeftRight className="text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Push Adjustment</h3>
                <p className="text-gray-500 text-sm mt-1">Correcting record: <span className="text-gray-300 font-medium">{record.summary}</span></p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <BsX className="text-2xl" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
          {/* Adjustment Types */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Adjustment Type</label>
            <div className="grid grid-cols-1 gap-3">
              {filteredTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, adjustment_type: type.id })}
                  className={`flex items-start p-4 rounded-2xl border transition-all text-left ${
                    formData.adjustment_type === type.id
                      ? "bg-rose-500/10 border-rose-500/50"
                      : "bg-white/[0.02] border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className={`mt-1 mr-4 rounded-full p-1 ${formData.adjustment_type === type.id ? "bg-rose-500 text-black" : "bg-gray-800 text-gray-500"}`}>
                    <BsCheck2 className="text-xs" />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${formData.adjustment_type === type.id ? "text-rose-400" : "text-white"}`}>
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{type.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Compliance Status Update */}
          {record.record_type === 'compliance' && formData.adjustment_type === 'status_correction' && (
            <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">New Status</label>
                <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/10">
                  {['pending', 'filed'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({ ...formData, new_status: status })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        formData.new_status === status
                          ? "bg-rose-500 text-black shadow-lg"
                          : "text-gray-500 hover:text-white"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {formData.new_status === 'filed' && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Filed Date</label>
                  <input
                    type="date"
                    value={formData.filed_date}
                    onChange={(e) => setFormData({ ...formData, filed_date: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500/30 transition-all [color-scheme:dark]"
                  />
                </div>
              )}
            </div>
          )}

          {/* Party Selection */}
          {formData.adjustment_type === 'party_correction' && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Corrected Party / Entity</label>
              <select
                value={formData.corrected_party_id}
                onChange={(e) => setFormData({ ...formData, corrected_party_id: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500/30 transition-all appearance-none"
              >
                <option value="" className="bg-[#0d0d0d]">Select a party...</option>
                {parties.map(party => (
                  <option key={party.id} value={party.id} className="bg-[#0d0d0d]">
                    {party.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-gray-500 px-1">
                Changing this will re-link the record to the selected party.
              </p>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Reason for Adjustment</label>
            <div className="relative group">
              <BsFileEarmarkText className="absolute left-5 top-5 text-gray-500 group-focus-within:text-rose-400 transition-colors" />
              <textarea
                required
                placeholder="Why is this adjustment necessary?"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500/30 transition-all placeholder:text-gray-700 font-medium resize-none"
              />
            </div>
          </div>

          {/* Amount Impact (Only for financial records) */}
          {record.record_type !== 'compliance' && (
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Monetary Impact (INR)</label>
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-rose-400 font-bold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formData.adjustment_amount}
                  onChange={(e) => setFormData({ ...formData, adjustment_amount: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500/30 transition-all font-bold"
                />
              </div>
              <p className="text-[10px] text-gray-500 flex items-center px-1">
                <BsExclamationTriangle className="mr-1 text-amber-500" />
                Use negative value to reverse or reduce original amount.
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-white/[0.02]">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 rounded-2xl border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-[2] py-4 px-6 rounded-2xl bg-rose-500 text-black text-sm font-black uppercase tracking-widest hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <BsLightningCharge className="text-lg" />
                  <span>Push Adjustment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
