import React, { useState, useEffect, useCallback } from "react";
import { 
  BsClock, 
  BsCheckCircle, 
  BsExclamationCircle,
  BsSearch,
  BsFilter
} from "react-icons/bs";
import { supabase } from "../../../lib/supabase";

export default function ComplianceView({ workbenchId }) {
  const [compliances, setCompliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCompliances = useCallback(async () => {
    if (!workbenchId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("compliances")
        .select("*")
        .eq("workbench_id", workbenchId)
        .order("deadline", { ascending: true });

      if (error) throw error;
      setCompliances(data || []);
    } catch (err) {
      console.error("Error fetching compliances:", err);
    } finally {
      setLoading(false);
    }
  }, [workbenchId]);

  useEffect(() => {
    fetchCompliances();
    
    window.addEventListener('refresh-workbench-data', fetchCompliances);
    return () => window.removeEventListener('refresh-workbench-data', fetchCompliances);
  }, [workbenchId, fetchCompliances]);

  const processStatus = (item) => {
    if (item.status === 'filed') return 'filed';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(item.deadline);
    
    if (deadline < today) return 'overdue';
    return item.status;
  };

  const filteredCompliances = compliances.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.form && item.form.toLowerCase().includes(searchQuery.toLowerCase()))
  ).map(item => ({
    ...item,
    displayStatus: processStatus(item)
  }));

  const stats = filteredCompliances.reduce((acc, curr) => {
    acc[curr.displayStatus] = (acc[curr.displayStatus] || 0) + 1;
    return acc;
  }, { filed: 0, pending: 0, overdue: 0 });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'filed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'overdue': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'pending': return 'bg-primary-300/10 text-primary-300 border-primary-300/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'filed': return <BsCheckCircle className="text-emerald-500/70" />;
      case 'overdue': return <BsExclamationCircle />;
      case 'pending': return <BsClock className="text-primary-300" />;
      default: return null;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Compliance Checklist</h3>
          <div className="flex items-center space-x-4 text-[10px] font-bold tracking-wider uppercase">
            <span className="text-emerald-500">{stats.filed} compliant</span>
            <span className="text-primary-300">{stats.pending} pending</span>
            <span className="text-red-500">{stats.overdue} overdue</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input 
              type="text"
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary/30 w-64"
            />
          </div>
        </div>
      </div>
      
      {/* Checklist Table */}
      <div className="bg-[#0E1117] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Compliance Form</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Due Date</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-gray-500 font-medium">Loading compliance data...</span>
                  </div>
                </td>
              </tr>
            ) : filteredCompliances.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <div className="text-sm text-gray-500">No compliance records found</div>
                </td>
              </tr>
            ) : (
              filteredCompliances.map((item, i) => (
                <tr key={item.id || i} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5">
                    <div className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors">{item.name}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{item.form || "General"}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm text-gray-300">{formatDate(item.deadline)}</div>
                    {item.filed_date && (
                      <div className="text-[10px] text-emerald-500 mt-0.5">Filed: {formatDate(item.filed_date)}</div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(item.displayStatus)}`}>
                        {getStatusIcon(item.displayStatus)}
                        {item.displayStatus.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <button className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors">
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
