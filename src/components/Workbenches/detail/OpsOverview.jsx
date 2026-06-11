import React, { useState, useEffect } from "react";
import {
  BsCashStack,
  BsArrowUpRight,
  BsArrowDownLeft,
  BsHeartPulse,
  BsExclamationCircle,
  BsClockHistory,
  BsPlusLg,
  BsListTask,
  BsCheck2Circle,
  BsTrash,
  BsPerson,
  BsCalendar,
  BsPieChart
} from "react-icons/bs";
import Card from "../../shared/Card";
import { useWorkbench } from "../../../context/WorkbenchContext";
import { backendService } from "../../../services/backendService";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import PulseDetailModal from "../ops/PulseDetailModal";

export default function OpsOverview({ workbenchId }) {
  const { labels, balances, loading: contextLoading } = useWorkbench();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [taskFilter, setTaskFilter] = useState("all"); // 'all' or 'mine'
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assigned_to: '', priority: 'medium', due_date: '' });
  const [selectedExpCategory, setSelectedExpCategory] = useState(null);


  // Modal State
  const [isPulseModalOpen, setIsPulseModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [modalDetails, setModalDetails] = useState([]);

  const [metrics, setMetrics] = useState([
    {
      label: "CASH POSITION",
      value: "₹0",
      change: "Loading...",
      changeType: "neutral",
      icon: BsCashStack,
      color: "amber",
      subValue: "Net: ₹0"
    },
    {
      label: "PAYABLES",
      value: "₹0",
      change: "No bills due",
      changeType: "neutral",
      icon: BsArrowUpRight,
      color: "red"
    },
    {
      label: "RECEIVABLES",
      value: "₹0",
      change: "No overdue invoices",
      changeType: "neutral",
      icon: BsArrowDownLeft,
      color: "emerald"
    },
    {
      label: "HEALTH SCORE",
      value: "--/100",
      change: "Calculating...",
      changeType: "neutral",
      icon: BsHeartPulse,
      color: "teal"
    },
  ]);

  const [exceptions, setExceptions] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    if (labels.length > 0 && Object.keys(balances).length > 0) {
      calculateMetrics();
    }
  }, [labels, balances]);

  useEffect(() => {
    fetchTasks();
    fetchMembers();
  }, [workbenchId]);

  const fetchTasks = async () => {
    try {
      const data = await backendService.listTasks(workbenchId);
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const fetchMembers = async () => {
    try {
      const data = await backendService.listWorkbenchMembers(workbenchId);
      setMembers(data);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    }
  };

  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return "₹0";
    const absAmount = Math.abs(amount);
    if (absAmount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (absAmount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (absAmount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    } else {
      return `₹${Math.round(amount).toLocaleString()}`;
    }
  };

  const calculateMetrics = () => {
    try {
      setLoading(true);

      const pillarTotals = labels.reduce((acc, l) => {
        const bal = balances[l.id] || { gross: 0, net: 0 };
        if (!acc[l.type]) acc[l.type] = { gross: 0, net: 0 };
        acc[l.type].net += bal.net;
        acc[l.type].gross += bal.gross;
        return acc;
      }, {});

      const getNet = (type) => {
        const val = pillarTotals[type]?.net || 0;
        return ["liability", "equity", "revenue", "income"].includes(type) ? -val : val;
      };

      const newMetrics = [...metrics];
      
      const totalAssets = getNet("asset");
      // 1. RECEIVABLES (AR + Trade Debtors)
      const arLabels = labels.filter(l => 
        l.sub_account === "Accounts Receivable" || 
        l.sub_account === "Accounts Receivable (AR)" ||
        l.sub_account === "Trade Debtors" ||
        l.name.toLowerCase().includes("receivable")
      );
      const arTotal = arLabels.reduce((sum, l) => sum + Math.max(0, balances[l.id]?.net || 0), 0);
      
      newMetrics[0].value = formatAmount(totalAssets - arTotal);
      newMetrics[0].subValue = `Total: ${formatAmount(totalAssets)}`;

      // 2. PAYABLES (AP + Accrued Expenses)
      const apLabels = labels.filter(l => 
        l.sub_account === "Accounts Payable" || 
        l.sub_account === "Accounts Payable (AP)" ||
        l.sub_account === "AP" ||
        l.sub_account === "Accrued Expenses" ||
        l.name.toLowerCase().includes("payable")
      );
      const apTotal = apLabels.reduce((sum, l) => sum + Math.max(0, -(balances[l.id]?.net || 0)), 0);
      
      newMetrics[1].value = formatAmount(apTotal);
      newMetrics[1].change = apTotal > 0 ? "Pending settlements" : "All clear";
      newMetrics[1].changeType = apTotal > 0 ? "warning" : "neutral";

      // 3. RECEIVABLES Display
      newMetrics[2].value = formatAmount(arTotal);
      newMetrics[2].change = arTotal > 0 ? "Outstanding invoices" : "No open invoices";
      newMetrics[2].changeType = arTotal > 0 ? "positive" : "neutral";

      // 4. HEALTH SCORE (Liquidity + Profitability)
      const revenue = getNet("revenue");
      const expense = getNet("expense");
      const profit = revenue - expense;
      
      let score = 0;
      if (revenue > 0) {
        // Profitability (60%) + Liquidity (40%)
        const profitMargin = Math.min(100, Math.max(0, (profit / revenue) * 100));
        const currentRatio = (totalAssets) / (apTotal || 1);
        const liquidityScore = Math.min(100, currentRatio * 20); // 5.0 ratio is 100%
        score = Math.round((profitMargin * 0.6) + (liquidityScore * 0.4));
      } else if (expense > 0) {
        // Pre-revenue health based on runway (Cash / Avg Expense)
        const cash = totalAssets - arTotal;
        const runwayScore = Math.min(100, (cash / (expense || 1)) * 10); // 10 months runway is 100%
        score = Math.round(runwayScore);
      } else {
        score = totalAssets > 0 ? 100 : 0;
      }

      newMetrics[3].value = `${score}/100`;
      newMetrics[3].change = score > 70 ? "Excellent" : score > 40 ? "Stable" : "Critical";
      newMetrics[3].changeType = score > 70 ? "positive" : score > 40 ? "warning" : "danger";

      setMetrics(newMetrics);
      
      const expLabels = labels.filter(l => l.type === "expense");
      const subAccTotals = expLabels.reduce((acc, l) => {
        if (!acc[l.sub_account]) acc[l.sub_account] = 0;
        acc[l.sub_account] += (balances[l.id]?.net || 0);
        return acc;
      }, {});

      const totalExp = Object.values(subAccTotals).reduce((a, b) => a + b, 0);
      setExpenses(Object.entries(subAccTotals).map(([sub, val]) => ({
        category: sub,
        progress: totalExp > 0 ? Math.round((val / totalExp) * 100) : 0,
        count: formatAmount(val),
        color: getCategoryColor(sub),
        labels: expLabels.filter(l => l.sub_account === sub).map(l => ({
          name: l.name,
          amount: balances[l.id]?.net || 0
        }))
      })));

    } catch (err) {
      console.error("Error calculating dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = ["bg-primary-300", "bg-primary-200", "bg-primary-400", "bg-primary-100", "bg-gray-600"];
    const index = Math.abs(category.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length;
    return colors[index];
  };

  const getMetricStyles = (color) => {
    switch (color) {
      case 'amber': return 'bg-primary-300/10 text-primary-300 group-hover:bg-primary-300/20';
      case 'red': return 'bg-red-500/10 text-red-400 group-hover:bg-red-500/20';
      case 'emerald': return 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20';
      case 'teal': return 'bg-primary-200/10 text-primary-200 group-hover:bg-primary-200/20';
      default: return 'bg-gray-500/10 text-gray-400 group-hover:bg-gray-500/20';
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      // Sanitize payload: Empty strings for optional fields should be null
      const taskPayload = {
        ...newTask,
        workbench_id: workbenchId,
        assigned_to: newTask.assigned_to || null,
        due_date: newTask.due_date || null
      };
      
      await backendService.createTask(taskPayload);
      toast.success("Task created");
      setIsTaskModalOpen(false);
      setNewTask({ title: '', assigned_to: '', priority: 'medium', due_date: '' });
      fetchTasks();
    } catch (err) {
      toast.error("Failed to create task");
    }
  };

  const handleToggleTaskStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await backendService.updateTask(task.id, { status: nextStatus });
      fetchTasks();
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await backendService.deleteTask(taskId);
      toast.success("Task deleted");
      fetchTasks();
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const handleCardClick = (metric) => {
    setSelectedMetric(metric);
    let details = [];

    if (metric.label === "CASH POSITION") {
      details = labels
        .filter(l => l.type === "asset" && (l.sub_account === "Bank Accounts" || l.sub_account === "Cash & Cash Equivalents"))
        .map(l => ({
          name: l.name,
          category: l.sub_account,
          amount: Math.abs(balances[l.id]?.net || 0)
        }));
    } else if (metric.label === "PAYABLES") {
      details = labels
        .filter(l => 
          l.sub_account === "Accounts Payable" || 
          l.sub_account === "Accounts Payable (AP)" || 
          l.sub_account === "AP" || 
          l.sub_account === "Accrued Expenses" ||
          l.name.toLowerCase().includes("payable")
        )
        .map(l => ({
          name: l.name,
          category: l.sub_account,
          amount: Math.abs(balances[l.id]?.net || 0)
        }));
    } else if (metric.label === "RECEIVABLES") {
      details = labels
        .filter(l => 
          l.sub_account === "Accounts Receivable" || 
          l.sub_account === "Accounts Receivable (AR)" ||
          l.sub_account === "Trade Debtors" ||
          l.name.toLowerCase().includes("receivable")
        )
        .map(l => ({
          name: l.name,
          category: l.sub_account,
          amount: Math.abs(balances[l.id]?.net || 0)
        }));
    } else if (metric.label === "HEALTH SCORE") {
      const revenue = labels.filter(l => l.type === 'revenue' || l.type === 'income').reduce((s, l) => s + Math.abs(balances[l.id]?.net || 0), 0);
      const expense = labels.filter(l => l.type === 'expense').reduce((s, l) => s + Math.abs(balances[l.id]?.net || 0), 0);
      details = [
        { name: "Total Operating Revenue", category: "Revenue", amount: revenue },
        { name: "Total Operating Expenses", category: "Expense", amount: expense },
        { name: "Net Profit / Loss", category: "Profitability", amount: revenue - expense }
      ];
    }

    setModalDetails(details);
    setIsPulseModalOpen(true);
  };

  return (
    <div className="space-y-12">
      {/* Daily Operations Metrics */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1 tracking-tight">Daily Financial Pulse</h3>
            <p className="text-gray-500 text-xs font-medium">Real-time assets, liabilities and liquidity health</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <Card 
              key={i} 
              variant="dark" 
              onClick={() => handleCardClick(m)}
              className="border-white/5 p-6 hover:border-white/10 transition-all group relative overflow-hidden cursor-pointer"
            >
              <div className="flex items-center space-x-3 mb-4 relative z-10">
                <div className={`p-2 rounded-lg transition-all ${getMetricStyles(m.color)}`}>
                  <m.icon className="text-lg" />
                </div>
                <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">{m.label}</span>
              </div>
              <div className="space-y-1 relative z-10">
                <div className="text-2xl font-black text-white tracking-tight">{m.value}</div>
                <div className="flex justify-between items-center">
                  <div className={`text-[11px] font-bold ${m.changeType === 'positive' ? 'text-emerald-500' :
                    m.changeType === 'warning' ? 'text-amber-500' :
                      m.changeType === 'danger' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                    {m.change}
                  </div>
                  {m.subValue && (
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-tighter bg-white/5 px-1.5 py-0.5 rounded">
                      {m.subValue}
                    </div>
                  )}
                </div>
              </div>
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${m.color}-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />
            </Card>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Management Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-300/10 text-primary-300 rounded-lg">
                  <BsListTask size={20} />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Ops Tasks</h3>
              </div>
              <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5">
                <button
                  onClick={() => setTaskFilter("all")}
                  className={`px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider font-black transition-all ${
                    taskFilter === "all" ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTaskFilter("mine")}
                  className={`px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider font-black transition-all ${
                    taskFilter === "mine" ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  My Tasks
                </button>
              </div>
            </div>
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="p-2 bg-white/5 border border-white/10 rounded-xl text-teal-400 hover:bg-teal-500 hover:text-black transition-all"
            >
              <BsPlusLg size={14} />
            </button>
          </div>

          <Card variant="dark" className="border-white/5 bg-[#0E1117]/80 divide-y divide-white/5 min-h-[300px]">
            {tasks.filter(t => taskFilter === "all" || t.assigned_to === user?.id).length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-3 opacity-30">
                <BsCheck2Circle size={40} />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  {taskFilter === "mine" ? "No tasks assigned to you" : "No active tasks"}
                </p>
              </div>
            ) : (
              tasks
                .filter(t => taskFilter === "all" || t.assigned_to === user?.id)
                .map(task => (
                  <div key={task.id} className="p-4 flex items-start justify-between group">
                    <div className="flex items-start space-x-4">
                      <button 
                        onClick={() => handleToggleTaskStatus(task)}
                        className={`mt-1 p-1 rounded-full border transition-all ${
                          task.status === 'completed' ? 'bg-teal-500 border-teal-500 text-black' : 'border-white/20 text-transparent hover:border-teal-500'
                        }`}
                      >
                        <BsCheck2Circle size={12} />
                      </button>
                      <div>
                        <h4 className={`text-sm font-bold ${task.status === 'completed' ? 'text-gray-600 line-through' : 'text-gray-200'}`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center space-x-3 mt-1.5">
                          {task.assigned_to && (
                            <div className="flex items-center space-x-1 text-[10px] text-gray-500 font-bold uppercase">
                              <BsPerson size={10} />
                              <span>
                                {task.assigned_user?.name || 'Assigned'}
                                {task.assigned_user?.role && (
                                  <span className="ml-1 text-primary-300 opacity-80">
                                    [{task.assigned_user.role}]
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                          {task.due_date && (
                            <div className="flex items-center space-x-1 text-[10px] text-amber-500/70 font-bold uppercase">
                              <BsCalendar size={10} />
                              <span>{new Date(task.due_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                            task.priority === 'urgent' ? 'bg-red-500/10 text-red-400' :
                            task.priority === 'high' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-white/5 text-gray-600'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-red-400 transition-all"
                    >
                      <BsTrash size={14} />
                    </button>
                  </div>
                ))
            )}
          </Card>
        </section>


        {/* Expense Categorization Health */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <BsPieChart size={20} />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Categorization Drill-down</h3>
          </div>

          <Card variant="dark" className="border-white/5 p-6 bg-[#0E1117]/80 space-y-8">
            <div className="space-y-6">
              {expenses.map((exp, i) => (
                <div 
                  key={i} 
                  className="space-y-3 cursor-pointer group"
                  onClick={() => setSelectedExpCategory(selectedExpCategory === exp.category ? null : exp.category)}
                >
                  <div className="flex justify-between text-sm">
                    <span className={`font-bold transition-colors ${selectedExpCategory === exp.category ? 'text-teal-400' : 'text-gray-300 group-hover:text-white'}`}>
                      {exp.category}
                    </span>
                    <span className="text-gray-500 text-xs font-black">{exp.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${exp.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${exp.progress}%` }}
                    />
                  </div>

                  {/* Drill-down details */}
                  {selectedExpCategory === exp.category && (
                    <div className="pl-4 border-l border-white/5 space-y-2 mt-4 animate-in slide-in-from-left-2 duration-300">
                      {exp.labels.map((l, j) => (
                        <div key={j} className="flex justify-between items-center text-[11px]">
                          <span className="text-gray-500 font-medium">{l.name}</span>
                          <span className="text-gray-400 font-bold">{formatAmount(l.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>

      {/* Task Creation Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <Card variant="dark" className="bg-[#0E1117] border-white/10 p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 tracking-tight">Create Ops Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Task Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Verify Rent TDS payment"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500/50 outline-none"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Priority</label>
                  <select 
                    className="w-full bg-[#1A1F26] border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none"
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Assign Member</label>
                  <select 
                    className="w-full bg-[#1A1F26] border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none"
                    value={newTask.assigned_to}
                    onChange={e => setNewTask({...newTask, assigned_to: e.target.value})}
                  >
                    <option value="">Unassigned</option>
                    {members.map(m => (
                      <option key={m.user_id} value={m.user_id}>
                        {m.users?.name || `Member ${m.user_id.slice(0, 5)}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Due Date</label>
                <input 
                  type="date"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  value={newTask.due_date}
                  onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-teal-500 text-black rounded-xl text-sm font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-400"
                >
                  Create Task
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Pulse Insight Modal */}
      <PulseDetailModal 
        isOpen={isPulseModalOpen}
        onClose={() => setIsPulseModalOpen(false)}
        metric={selectedMetric}
        details={modalDetails}
      />
    </div>
  );
}
