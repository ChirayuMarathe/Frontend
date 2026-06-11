import React, { useState, useEffect } from 'react';
import { BsX, BsCurrencyDollar } from 'react-icons/bs';
import { backendService } from '../../../services/backendService';
import { useWorkbench } from '../../../context/WorkbenchContext';

export default function CreateBudgetModal({ isOpen, onClose, workbenchId, onSuccess }) {
  const { coa } = useWorkbench();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    total_amount: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    if (isOpen && workbenchId && coa.length > 0) {
      // Find IDs for LIABILITIES and EXPENSES
      const targetParents = coa.filter(d => 
        d.level === 1 && 
        (d.name.toUpperCase() === 'LIABILITIES' || d.name.toUpperCase() === 'EXPENSES')
      );
      const parentIds = targetParents.map(p => p.id);
      
      // Filter Level 2 accounts that belong to these parents
      const subAccounts = coa.filter(d => 
        d.level === 2 && parentIds.includes(d.parent_id)
      );

      // Group them by parent name for the UI
      const grouped = targetParents.map(parent => ({
        category: parent.name,
        items: subAccounts.filter(sub => sub.parent_id === parent.id).map(sub => sub.name).sort()
      })).filter(g => g.items.length > 0);

      setAvailableCategories(grouped);
      
      if (grouped.length > 0 && grouped[0].items.length > 0 && !formData.name) {
        setFormData(prev => ({ ...prev, name: grouped[0].items[0] }));
      }
    }
  }, [isOpen, workbenchId, coa]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name || !formData.total_amount || !formData.start_date || !formData.end_date) {
        throw new Error("All fields are required");
      }

      await backendService.createBudget({
        workbench_id: workbenchId,
        name: formData.name,
        total_amount: parseFloat(formData.total_amount),
        start_date: formData.start_date,
        end_date: formData.end_date
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create budget");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0E1117] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div>
            <h2 className="text-lg font-bold text-white">Create Budget Allocation</h2>
            <p className="text-sm text-gray-500 mt-1">Set a budget for a specific expense category</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <BsX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Category / Sub-account
              </label>
              <select
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all appearance-none"
                required
              >
                <option value="" disabled>Select a sub-account</option>
                {availableCategories.map((group, idx) => (
                  <optgroup key={idx} label={group.category} className="bg-black/90 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    {group.items.map((cat, i) => (
                      <option key={i} value={cat} className="text-sm normal-case font-medium text-white">{cat}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Allocated Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                  <BsCurrencyDollar />
                </div>
                <input
                  type="number"
                  name="total_amount"
                  value={formData.total_amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all [color-scheme:dark]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all [color-scheme:dark]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary-500 text-black hover:bg-primary-400 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Budget'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
