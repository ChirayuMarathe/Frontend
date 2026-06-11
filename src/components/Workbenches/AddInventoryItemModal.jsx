import React, { useState } from "react";
import {
  BsX,
  BsBoxSeam,
  BsTag,
  BsHash,
  BsCurrencyRupee,
  BsLayers,
  BsCheck2,
  BsGear,
  BsArrowRepeat
} from "react-icons/bs";
import { supabase } from "../../lib/supabase";
import { backendService } from "../../services/backendService";
import { useWorkbench } from "../../context/WorkbenchContext";
import { toast } from "react-hot-toast";

const ITEM_TYPES = [
  { id: 'goods', label: 'Goods', icon: BsBoxSeam, color: 'text-teal-400', bgColor: 'bg-teal-400/10' },
  { id: 'service', label: 'Service', icon: BsGear, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
];

const USAGE_TYPES = [
  { id: 'trading', label: 'Trading', icon: BsArrowRepeat, description: 'Items for resale' },
  { id: 'internal', label: 'Internal', icon: BsLayers, description: 'Office supplies/assets' },
];

export default function AddInventoryItemModal({ isOpen, onClose, workbenchId, onSuccess }) {
  const { labels } = useWorkbench();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'General',
    type: 'goods',
    usage_type: 'trading',
    stock_level: '',
    min_stock_level: '10',
    price: '',
    unit: 'pcs',
    inventory_label_id: '',
    cogs_label_id: '',
    revenue_label_id: '',
    cost_method: 'FIFO'
  });

  // Filter labels by type for the selectors
  const assetLabels = labels.filter(l => l.type === 'asset');
  const expenseLabels = labels.filter(l => l.type === 'expense');
  const revenueLabels = labels.filter(l => l.type === 'revenue');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sku) {
      toast.error("Name and SKU are required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        workbench_id: workbenchId,
        stock_level: parseFloat(formData.stock_level) || 0,
        min_stock_level: parseFloat(formData.min_stock_level) || 0,
        price: parseFloat(formData.price) || 0,
      };

      await backendService.createInventoryItem(payload);

      toast.success("Item added to inventory");
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        sku: '',
        category: 'General',
        type: 'goods',
        usage_type: 'trading',
        stock_level: '',
        min_stock_level: '10',
        price: '',
        unit: 'pcs',
        inventory_label_id: '',
        cogs_label_id: '',
        revenue_label_id: '',
        cost_method: 'FIFO'
      });
    } catch (err) {
      console.error("Error adding inventory item:", err);
      toast.error(err.message || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-[#0A0A0A] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Add New Item</h2>
            <p className="text-[11px] text-gray-500 mt-1 font-medium">Track a new product or service in your inventory</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full"
          >
            <BsX className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
            {/* Item Type Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Item Type</label>
              <div className="grid grid-cols-2 gap-4">
                {ITEM_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isActive = formData.type === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.id })}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${isActive
                        ? `${type.bgColor} border-white/20 ${type.color} ring-1 ring-white/10`
                        : "bg-white/2 border-white/5 text-gray-500 hover:bg-white/5 hover:text-gray-400"
                        }`}
                    >
                      <Icon className={`text-xl mb-2.5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Item Name</label>
                <div className="relative group">
                  <BsBoxSeam className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-sm group-focus-within:text-teal-400 transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Macbook Pro M3"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all font-medium"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">SKU / ID</label>
                <div className="relative group">
                  <BsHash className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-sm group-focus-within:text-teal-400 transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. MBP-M3-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Category & Usage */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Category</label>
                <div className="relative group">
                  <BsTag className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-sm group-focus-within:text-teal-400 transition-colors" />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-10 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all appearance-none font-medium"
                  >
                    <option value="General" className="bg-[#0A0A0A]">General</option>
                    <option value="Electronics" className="bg-[#0A0A0A]">Electronics</option>
                    <option value="Software" className="bg-[#0A0A0A]">Software</option>
                    <option value="Furniture" className="bg-[#0A0A0A]">Furniture</option>
                    <option value="Services" className="bg-[#0A0A0A]">Services</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Usage Scope</label>
                <div className="relative group">
                  <BsLayers className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-sm group-focus-within:text-teal-400 transition-colors" />
                  <select
                    value={formData.usage_type}
                    onChange={(e) => setFormData({ ...formData, usage_type: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-10 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all appearance-none font-medium"
                  >
                    {USAGE_TYPES.map(u => (
                      <option key={u.id} value={u.id} className="bg-[#0A0A0A]">{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Stock Levels & Price */}
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Stock Level</label>
                <input
                  type="number"
                  placeholder="0"
                  disabled={formData.type === 'service'}
                  value={formData.stock_level}
                  onChange={(e) => setFormData({ ...formData, stock_level: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all font-medium disabled:opacity-30"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Min. Alert</label>
                <input
                  type="number"
                  placeholder="10"
                  disabled={formData.type === 'service'}
                  value={formData.min_stock_level}
                  onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all font-medium disabled:opacity-30"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Unit Price</label>
                <div className="relative group">
                  <BsCurrencyRupee className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-sm group-focus-within:text-teal-400 transition-colors" />
                  <input
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-10 pr-5 py-4 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Financial Mapping */}
            <div className="space-y-6 bg-white/5 p-6 rounded-[24px] border border-white/5">
              <h3 className="text-[10px] font-black text-teal-400 uppercase tracking-widest flex items-center space-x-2">
                <BsCurrencyRupee />
                <span>Financial Ledger Mapping</span>
              </h3>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Inventory Asset Account</label>
                  <select
                    value={formData.inventory_label_id}
                    onChange={(e) => setFormData({ ...formData, inventory_label_id: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all appearance-none font-medium"
                  >
                    <option value="" className="bg-[#0A0A0A]">Select Asset Label...</option>
                    {assetLabels.map(l => (
                      <option key={l.id} value={l.id} className="bg-[#0A0A0A]">{l.name} ({l.sub_account})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Revenue Account</label>
                    <select
                      value={formData.revenue_label_id}
                      onChange={(e) => setFormData({ ...formData, revenue_label_id: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all appearance-none font-medium"
                    >
                      <option value="" className="bg-[#0A0A0A]">Select Revenue Label...</option>
                      {revenueLabels.map(l => (
                        <option key={l.id} value={l.id} className="bg-[#0A0A0A]">{l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">COGS Account</label>
                    <select
                      value={formData.cogs_label_id}
                      onChange={(e) => setFormData({ ...formData, cogs_label_id: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all appearance-none font-medium"
                    >
                      <option value="" className="bg-[#0A0A0A]">Select Expense Label...</option>
                      {expenseLabels.map(l => (
                        <option key={l.id} value={l.id} className="bg-[#0A0A0A]">{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Costing Method</label>
                  <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
                    {['FIFO', 'Average'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setFormData({ ...formData, cost_method: method })}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          formData.cost_method === method 
                            ? "bg-white/10 text-white shadow-lg" 
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 border-t border-white/5 flex items-center justify-end space-x-6 shrink-0 bg-[#0A0A0A]">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 text-sm font-bold text-gray-500 hover:text-white transition-all hover:bg-white/5 rounded-2xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-3 px-10 py-3.5 bg-teal-500 text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-xl shadow-teal-500/20"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <BsCheck2 className="text-xl" />
              )}
              <span>{loading ? "Adding..." : "Add to Inventory"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
