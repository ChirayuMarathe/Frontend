import React, { useState, useEffect, useCallback } from "react";
import { 
  BsClockHistory,
  BsBoxSeam, 
  BsSearch, 
  BsFilter, 
  BsPlusLg, 
  BsArrowUpRight, 
  BsArrowDownLeft,
  BsExclamationTriangle,
  BsGrid,
  BsListUl,
  BsArrowRepeat,
  BsGraphUp,
  BsLayers,
  BsShieldCheck,
  BsStars
} from "react-icons/bs";
import { useWorkbench } from "../../../context/WorkbenchContext";
import Card from "../../shared/Card";
import AddInventoryItemModal from "../AddInventoryItemModal";
import RecordPurchaseModal from "../RecordPurchaseModal";
import RecordSaleModal from "../RecordSaleModal";
import StockLedgerModal from "../StockLedgerModal";

export default function InventoryView({ workbenchId }) {
  const { inventory: items, loading, refreshContext } = useWorkbench();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all, goods, service
  const [usageFilter, setUsageFilter] = useState("all"); // all, trading, internal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [purchaseModal, setPurchaseModal] = useState({ isOpen: false, item: null });
  const [saleModal, setSaleModal] = useState({ isOpen: false, item: null });
  const [historyModal, setHistoryModal] = useState({ isOpen: false, item: null });
  const [viewMode, setViewMode] = useState("list"); // list, grid

  const filteredItems = items.filter(item => {
    const matchesSearch = (item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.sku?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesUsage = usageFilter === "all" || item.usage_type === usageFilter;
    
    return matchesSearch && matchesType && matchesUsage;
  });

  const stats = {
    totalItems: items.length,
    totalValue: items.reduce((acc, item) => acc + (item.price * (item.stock_level || 0)), 0),
    lowStock: items.filter(item => item.type === 'goods' && item.stock_level <= item.min_stock_level && item.stock_level > 0).length,
    outOfStock: items.filter(item => item.type === 'goods' && item.stock_level <= 0).length,
  };

  const getStockStatus = (item) => {
    if (item.type === 'service') return { label: 'Active', color: 'text-blue-400', bg: 'bg-blue-400/10' };
    if (item.stock_level <= 0) return { label: 'Out of Stock', color: 'text-red-400', bg: 'bg-red-400/10' };
    if (item.stock_level <= item.min_stock_level) return { label: 'Low Stock', color: 'text-amber-400', bg: 'bg-amber-400/10' };
    return { label: 'In Stock', color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center space-x-3">
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Inventory & Stock</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Track warehouse levels, purchase pricing, and tax compliance</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative group">
            <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors" />
            <input 
              type="text"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all w-72"
            />
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-teal-500 text-black rounded-2xl text-sm font-black hover:opacity-90 transition-all shadow-lg shadow-teal-500/20 active:scale-95"
          >
            <BsPlusLg strokeWidth={1.5} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Items", value: stats.totalItems, icon: BsBoxSeam, color: "teal" },
          { label: "Stock Value", value: `₹${stats.totalValue.toLocaleString()}`, icon: BsGraphUp, color: "emerald" },
          { label: "Low Stock", value: stats.lowStock, icon: BsLayers, color: "amber" },
          { label: "Out of Stock", value: stats.outOfStock, icon: BsExclamationTriangle, color: "red" },
        ].map((stat, i) => (
          <Card key={i} variant="dark" className="p-6 border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
             <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 blur-3xl rounded-full -mr-8 -mt-8 group-hover:bg-${stat.color}-500/10 transition-colors`} />
             <div className="flex items-center space-x-4 relative">
                <div className={`p-3.5 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="text-xl" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{stat.label}</p>
                  <p className="text-2xl font-black text-white mt-0.5">{stat.value}</p>
                </div>
             </div>
          </Card>
        ))}
      </div>

      {/* Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card variant="dark" className="p-6 border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Items Available %</span>
               <span className="text-xs font-black text-teal-400">{stats.totalItems > 0 ? Math.round(((stats.totalItems - stats.outOfStock) / stats.totalItems) * 100) : 0}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-teal-500 rounded-full transition-all duration-1000" 
                 style={{ width: `${stats.totalItems > 0 ? ((stats.totalItems - stats.outOfStock) / stats.totalItems) * 100 : 0}%` }}
               />
            </div>
         </Card>
         <Card variant="dark" className="p-6 border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Replenishment Pressure</span>
               <span className={`text-xs font-black ${stats.lowStock > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                 {stats.lowStock > (stats.totalItems * 0.3) ? 'HIGH' : stats.lowStock > 0 ? 'MEDIUM' : 'LOW'}
               </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
               <div 
                 className={`h-full rounded-full transition-all duration-1000 ${stats.lowStock > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                 style={{ width: `${stats.totalItems > 0 ? (stats.lowStock / stats.totalItems) * 100 : 0}%` }}
               />
            </div>
         </Card>
         <Card variant="dark" className="p-6 border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Scope</span>
               <span className="text-xs font-black text-white">{filteredItems.length} / {items.length}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-white/20 rounded-full transition-all duration-1000" 
                 style={{ width: `${items.length > 0 ? (filteredItems.length / items.length) * 100 : 0}%` }}
               />
            </div>
         </Card>
      </div>

      {/* Spotlight */}
      {stats.lowStock > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-[24px] p-6 flex items-center justify-between">
           <div className="flex items-center space-x-4">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                 <BsExclamationTriangle className="text-xl" />
              </div>
              <div>
                 <h4 className="text-sm font-bold text-amber-400 uppercase tracking-widest">Replenishment Spotlight</h4>
                 <p className="text-xs text-gray-400 mt-1">You have {stats.lowStock} items currently under replenishment pressure. Review stock levels.</p>
              </div>
           </div>
           <button 
             onClick={() => {
                setUsageFilter('trading');
                setTypeFilter('goods');
             }}
             className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-xl transition-all border border-amber-500/20"
           >
              Review Now
           </button>
        </div>
      )}

      {/* Filters and View Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="flex flex-wrap items-center gap-4">
            <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
               {[
                 { id: "all", label: "All Items" },
                 { id: "goods", label: "Goods" },
                 { id: "service", label: "Services" }
               ].map((f) => (
                 <button
                   key={f.id}
                   onClick={() => setTypeFilter(f.id)}
                   className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                     typeFilter === f.id 
                       ? "bg-white/10 text-white shadow-lg" 
                       : "text-gray-500 hover:text-gray-300"
                   }`}
                 >
                   {f.label}
                 </button>
               ))}
            </div>

            <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
               {[
                 { id: "all", label: "All Usage" },
                 { id: "trading", label: "Trading" },
                 { id: "internal", label: "Internal" }
               ].map((f) => (
                 <button
                   key={f.id}
                   onClick={() => setUsageFilter(f.id)}
                   className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                     usageFilter === f.id 
                       ? "bg-white/10 text-white shadow-lg" 
                       : "text-gray-500 hover:text-gray-300"
                   }`}
                 >
                   {f.label}
                 </button>
               ))}
            </div>
         </div>

         <div className="flex items-center space-x-3">
            <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
               <button 
                 onClick={() => setViewMode('grid')}
                 className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/10 text-teal-400' : 'text-gray-600 hover:text-gray-400'}`}
               >
                  <BsGrid className="text-lg" />
               </button>
               <button 
                 onClick={() => setViewMode('list')}
                 className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/10 text-teal-400' : 'text-gray-600 hover:text-gray-400'}`}
               >
                  <BsListUl className="text-lg" />
               </button>
            </div>
            <button 
              onClick={() => refreshContext()}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-white transition-all active:rotate-180 duration-500"
            >
               <BsArrowRepeat className="text-lg" />
            </button>
         </div>
      </div>

      {/* Main Table */}
      <Card variant="dark" className="border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Product / Service</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">SKU</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Stock Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Reference Price</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                      <span className="text-sm text-gray-500 font-bold uppercase tracking-widest">Inventory Synchronizing...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center space-y-4 opacity-30">
                       <BsBoxSeam size={64} className="text-gray-500" />
                       <div>
                          <p className="text-lg font-black text-white">No items found</p>
                          <p className="text-xs text-gray-500 mt-1">{searchQuery ? "Try adjusting your search filters" : "Start by adding your first inventory item"}</p>
                       </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-all group cursor-pointer">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-2xl ${item.type === 'goods' ? 'bg-teal-500/10 text-teal-400' : 'bg-blue-500/10 text-blue-400'} group-hover:scale-110 transition-transform`}>
                            {item.type === 'goods' ? <BsBoxSeam className="text-lg" /> : <BsShieldCheck className="text-lg" />}
                          </div>
                          <div>
                            <div className="text-sm font-black text-white group-hover:text-teal-400 transition-colors">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                              {item.usage_type} scope
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-mono text-gray-400 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                          {item.sku}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                         <span className="text-xs text-gray-400 font-bold">
                            {item.category}
                         </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col space-y-1.5">
                           <div className="flex items-center space-x-2">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${status.bg} ${status.color} border border-white/5`}>
                                 {status.label}
                              </span>
                              {item.type === 'goods' && (
                                <span className="text-[10px] font-bold text-gray-500">
                                   {item.stock_level} {item.unit || 'pcs'}
                                </span>
                              )}
                           </div>
                           {item.type === 'goods' && item.stock_level <= item.min_stock_level && (
                              <p className="text-[9px] text-amber-500/70 font-bold uppercase">Replenish threshold: {item.min_stock_level}</p>
                           )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="text-sm font-black text-white">
                          ₹{item.price?.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">
                          {item.type === 'goods' ? 'Base Price' : 'Rate'}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setHistoryModal({ isOpen: true, item });
                              }}
                              className="p-1.5 bg-white/5 text-gray-500 hover:text-white rounded-lg transition-all"
                              title="View History"
                            >
                               <BsClockHistory className="text-sm" />
                            </button>
                            {item.type !== 'service' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPurchaseModal({ isOpen: true, item });
                                }}
                                className="px-3 py-1.5 bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase rounded-lg border border-teal-500/10 hover:bg-teal-500/20 transition-all"
                              >
                                 Purchase
                              </button>
                            )}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSaleModal({ isOpen: true, item });
                              }}
                              className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase rounded-lg border border-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                            >
                               Sell
                            </button>
                         </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals */}
      <AddInventoryItemModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        workbenchId={workbenchId}
        onSuccess={refreshContext}
      />

      <RecordPurchaseModal 
        isOpen={purchaseModal.isOpen}
        onClose={() => setPurchaseModal({ isOpen: false, item: null })}
        workbenchId={workbenchId}
        item={purchaseModal.item}
        onSuccess={refreshContext}
      />

      <RecordSaleModal 
        isOpen={saleModal.isOpen}
        onClose={() => setSaleModal({ isOpen: false, item: null })}
        workbenchId={workbenchId}
        item={saleModal.item}
        onSuccess={refreshContext}
      />

      <StockLedgerModal 
        isOpen={historyModal.isOpen}
        onClose={() => setHistoryModal({ isOpen: false, item: null })}
        item={historyModal.item}
      />
    </div>
  );
}
