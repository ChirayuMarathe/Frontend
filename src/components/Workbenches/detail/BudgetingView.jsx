import React, { useState, useEffect } from "react";
import { BsArrowRight, BsChevronDown, BsChevronUp } from "react-icons/bs";
import Card from "../../shared/Card";
import { backendService } from "../../../services/backendService";

export default function BudgetingView({ workbenchId }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState([
    { label: "TOTAL BUDGET", value: "₹0" },
    { label: "TOTAL ACTUAL", value: "₹0" },
    { label: "VARIANCE", value: "0%", color: "text-gray-500" },
  ]);

  const [accounts, setAccounts] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [rowTransactions, setRowTransactions] = useState({});

  useEffect(() => {
    if (workbenchId) {
      fetchBudgetData();
    }

    const handleRefresh = () => {
      console.log("Refreshing BudgetingView data...");
      fetchBudgetData();
    };

    window.addEventListener('refresh-workbench-data', handleRefresh);
    return () => window.removeEventListener('refresh-workbench-data', handleRefresh);
  }, [workbenchId]);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);

      const data = await backendService.getBudgetPerformance(workbenchId);

      if (data && data.length > 0) {
        const totalBudgeted = data.reduce((sum, item) => sum + parseFloat(item.budgeted_amount || 0), 0);
        const totalActual = data.reduce((sum, item) => sum + parseFloat(item.actual_amount || 0), 0);
        const variance = totalBudgeted > 0
          ? ((totalBudgeted - totalActual) / totalBudgeted * 100).toFixed(1)
          : 0;

        const formatCurrency = (val) => {
          if (!val) return "₹0";
          if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
          if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
          return `₹${val}`;
        };

        const remainingTotal = totalBudgeted - totalActual;

        setSummary([
          { label: "TOTAL BUDGET", value: formatCurrency(totalBudgeted) },
          { label: "TOTAL ACTUAL", value: formatCurrency(totalActual) },
          {
            label: "REMAINING",
            value: formatCurrency(remainingTotal),
            color: remainingTotal >= 0 ? "text-emerald-500" : "text-red-500"
          },
        ]);

        setAccounts(data.map(item => {
          const itemRemaining = parseFloat(item.budgeted_amount || 0) - parseFloat(item.actual_amount || 0);
          return {
            name: item.category,
            budgeted: formatCurrency(item.budgeted_amount),
            actual: formatCurrency(item.actual_amount),
            variance: formatCurrency(itemRemaining),
            varianceColor: itemRemaining >= 0 ? 'text-emerald-500' : 'text-red-500',
            progress: Math.round(item.progress_percentage || 0),
            color: (item.progress_percentage || 0) > 100 ? "bg-red-500" : "bg-primary-300"
          };
        }));
      } else {
        setAccounts([]);
      }
    } catch (err) {
      console.error("Error fetching budget data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (category) => {
    if (expandedRow === category) {
      setExpandedRow(null);
      return;
    }
    
    setExpandedRow(category);
    
    if (!rowTransactions[category]) {
      try {
        const txs = await backendService.getBudgetTransactions(workbenchId, category);
        setRowTransactions(prev => ({ ...prev, [category]: txs }));
      } catch (err) {
        console.error("Failed to fetch transactions for category", err);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Budget vs Actual</h3>
        <p className="text-gray-500 text-xs mb-6">Q3 FY26 — Period-wise budget tracking by account</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {summary.map((s, i) => (
            <Card key={i} variant="dark" className="border-white/5 p-6 bg-[#0E1117]/80">
              <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block mb-3">{s.label}</span>
              <div className={`text-2xl font-bold ${s.color || 'text-white'}`}>{s.value}</div>
            </Card>
          ))}
        </div>

        {/* Account Table */}
        <Card variant="dark" className="border-white/5 overflow-hidden bg-[#0E1117]/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Account</th>
                  <th className="px-6 py-4 text-right">Budgeted</th>
                  <th className="px-6 py-4 text-right">Actual</th>
                  <th className="px-6 py-4 text-right">Remaining</th>
                  <th className="px-6 py-4 min-w-[200px]">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {accounts.map((acc, i) => (
                  <React.Fragment key={i}>
                    <tr 
                      className="group hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(acc.name)}
                    >
                      <td className="px-6 py-5 text-sm font-medium text-gray-300 group-hover:text-primary-300 transition-colors flex items-center space-x-2">
                        {expandedRow === acc.name ? <BsChevronUp size={12} className="text-gray-500" /> : <BsChevronDown size={12} className="text-gray-500" />}
                        <span>{acc.name}</span>
                      </td>
                      <td className="px-6 py-5 text-sm text-right text-gray-500">{acc.budgeted}</td>
                      <td className="px-6 py-5 text-sm text-right text-white font-medium">{acc.actual}</td>
                      <td className={`px-6 py-5 text-sm text-right font-medium ${acc.varianceColor}`}>
                        {acc.variance}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${acc.color} rounded-full`}
                              style={{ width: `${Math.min(acc.progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-gray-500 w-8">{acc.progress}%</span>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Clubbed Transactions Drill-down */}
                    {expandedRow === acc.name && (
                      <tr className="bg-black/20">
                        <td colSpan="5" className="px-10 py-6 border-b border-white/5">
                          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2">
                              Transactions Clubbed to {acc.name}
                            </h4>
                            {!rowTransactions[acc.name] ? (
                              <div className="text-xs text-gray-500">Loading transactions...</div>
                            ) : rowTransactions[acc.name].length === 0 ? (
                              <div className="text-xs text-gray-500">No transactions recorded for this budget yet.</div>
                            ) : (
                              <div className="space-y-3">
                                {rowTransactions[acc.name].map((tx, j) => (
                                  <div key={j} className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                    <div>
                                      <div className="text-gray-300 font-medium">{tx.description || 'No description'}</div>
                                      <div className="text-[10px] text-gray-500 mt-1 flex space-x-2">
                                        <span>{new Date(tx.date).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{tx.label_name}</span>
                                      </div>
                                    </div>
                                    <div className="text-white font-bold">
                                      ₹{parseFloat(tx.amount).toLocaleString()}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
