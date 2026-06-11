import React, { useState, useEffect } from "react";
import {
  BsX,
  BsListUl,
  BsArrowUpRight,
  BsArrowDownLeft,
  BsClockHistory,
  BsCalendar
} from "react-icons/bs";
import { supabase } from "../../lib/supabase";
import Card from "../shared/Card";

export default function StockLedgerModal({ isOpen, onClose, item }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      fetchMovements();
    }
  }, [isOpen, item]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("stock_ledger")
        .select("*, transactions(description, transaction_date)")
        .eq("item_id", item.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMovements(data);
    } catch (err) {
      console.error("Error fetching stock movements:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 shrink-0">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/5 text-gray-400 rounded-2xl">
              <BsClockHistory className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Stock Movement History</h2>
              <p className="text-[11px] text-gray-500 mt-1 font-medium">{item.name} • SKU: {item.sku}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full">
            <BsX className="text-2xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Loading Movements...</span>
            </div>
          ) : movements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
              <BsListUl size={48} />
              <p className="text-sm font-bold mt-4">No stock movements recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {movements.map((move) => {
                const isPositive = move.quantity_change > 0;
                return (
                  <Card key={move.id} variant="dark" className="p-5 border-white/5 flex items-center justify-between hover:border-white/10 transition-all">
                    <div className="flex items-center space-x-5">
                      <div className={`p-3 rounded-xl ${isPositive ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-400'}`}>
                        {isPositive ? <BsArrowDownLeft className="text-lg" /> : <BsArrowUpRight className="text-lg" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center space-x-2">
                           <span>{move.reason.toUpperCase()}</span>
                           <span className="text-gray-600 text-[10px]">•</span>
                           <span className="text-xs text-gray-500">{move.transactions?.description || 'Internal Adjustment'}</span>
                        </div>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center">
                            <BsCalendar className="mr-1.5" />
                            {new Date(move.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-black ${isPositive ? 'text-teal-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{move.quantity_change}
                      </div>
                      <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                        Cost: ₹{move.unit_cost.toLocaleString()}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
