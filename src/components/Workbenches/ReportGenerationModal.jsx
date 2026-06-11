import React, { useState } from "react";
import { BsX, BsFileEarmarkPdf, BsPieChart, BsShieldCheck, BsDownload, BsCalendarDate, BsCheckCircle, BsBuilding, BsWallet2, BsGraphUp, BsReceipt, BsCart3, BsFileEarmarkText, BsTruck, BsFileSpreadsheet, BsUpload, BsArrowRight } from "react-icons/bs";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { reportService } from "../../services/reportService";

const ANALYTICAL_REPORTS = [
    {
        id: 'cashflow',
        label: 'Cash Flow & Liquidity',
        icon: BsWallet2,
        desc: 'Real-time cash position & runway analysis',
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10'
    },
    {
        id: 'budget',
        label: 'Budget Variance',
        icon: BsPieChart,
        desc: 'Department-wise budget vs actual tracking',
        color: 'text-blue-400',
        bg: 'bg-blue-400/10'
    },
    {
        id: 'compliance',
        label: 'Tax Compliance',
        icon: BsShieldCheck,
        desc: 'Filing scorecard & upcoming deadlines',
        color: 'text-amber-400',
        bg: 'bg-amber-400/10'
    },
    {
        id: 'aging',
        label: 'Receivables & Payables',
        icon: BsGraphUp,
        desc: 'Detailed aging of invoices & bills',
        color: 'text-purple-400',
        bg: 'bg-purple-400/10'
    },
    {
        id: 'vendor',
        label: 'Vendor Intelligence',
        icon: BsBuilding,
        desc: 'Expense breakdown by category & merchant',
        color: 'text-rose-400',
        bg: 'bg-rose-400/10'
    }
];

const DOCUMENT_TEMPLATES = [
    {
        id: 'invoice',
        label: 'Tax Invoice',
        icon: BsReceipt,
        desc: 'Create professional tax invoices',
        color: 'text-cyan-400',
        bg: 'bg-cyan-400/10',
        link: '/templates/invoice'
    },
    {
        id: 'purchase-order',
        label: 'Purchase Order',
        icon: BsCart3,
        desc: 'Generate formal procurement orders',
        color: 'text-pink-400',
        bg: 'bg-pink-400/10',
        link: '/templates/purchase-order'
    },
    {
        id: 'quotation',
        label: 'Sales Quotation',
        icon: BsFileEarmarkText,
        desc: 'Detailed pricing proposals',
        color: 'text-orange-400',
        bg: 'bg-orange-400/10',
        link: '/templates/quotation'
    },
    {
        id: 'gst-invoice',
        label: 'GST Invoice',
        icon: BsFileEarmarkPdf,
        desc: 'GST-compliant tax invoices',
        color: 'text-indigo-400',
        bg: 'bg-indigo-400/10',
        link: '/templates/gst-invoice'
    },
    {
        id: 'delivery-challan',
        label: 'Delivery Challan',
        icon: BsTruck,
        desc: 'Goods movement documentation',
        color: 'text-green-400',
        bg: 'bg-green-400/10',
        link: '/templates/delivery-challan'
    },
    {
        id: 'proforma',
        label: 'Proforma Invoice',
        icon: BsFileSpreadsheet,
        desc: 'Preliminary bill of sale',
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        link: '/templates/proforma-invoice'
    }
];

export default function GenerateReportModal({ isOpen, onClose, workbenchId, workbenchName }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState('cashflow');
    const [activeTab, setActiveTab] = useState('analytical'); // 'analytical' or 'documents'
    const [dateRange, setDateRange] = useState('this-month');
    const [reportConfig, setReportConfig] = useState({
        logo: null,
        preparedFor: '',
        notes: '',
        // Specific Report Parameters
        cashflow: { includeProjections: false, detailedBreakdown: true },
        budget: { varianceThreshold: 10, filterType: 'all' },
        compliance: { showFiled: true, highlightOverdue: true },
        aging: { bucketSize: '30', minAmount: 0 },
        vendor: { topN: 10, sortBy: 'amount' }
    });

    if (!isOpen) return null;

    const currentReport = (activeTab === 'analytical' ? ANALYTICAL_REPORTS : DOCUMENT_TEMPLATES).find(r => r.id === selectedType) || ANALYTICAL_REPORTS[0];
    const isTemplate = DOCUMENT_TEMPLATES.some(t => t.id === selectedType);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReportConfig(prev => ({ ...prev, logo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleParamChange = (type, param, value) => {
        setReportConfig(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [param]: value
            }
        }));
    };

    const handleGenerate = async () => {
        // Handle Document Template Navigation
        const template = DOCUMENT_TEMPLATES.find(t => t.id === selectedType);
        if (template) {
            navigate(template.link, {
                state: {
                    fromWorkbench: true,
                    workbenchId,
                    workbenchName,
                    defaultDate: new Date().toISOString().split('T')[0]
                }
            });
            onClose();
            return;
        }

        // Handle Analytical Report Generation
        try {
            setLoading(true);
            // Pass the specific config for the selected type merged with global config
            const finalConfig = {
                ...reportConfig,
                params: reportConfig[selectedType] || {}
            };
            await reportService.generateReport(selectedType, workbenchId, workbenchName, dateRange, finalConfig);
            toast.success("Report generated successfully!");
            onClose();
        } catch (err) {
            console.error("Report generation failed:", err);
            toast.error("Failed to generate report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Render Specific Parameters based on Report Type
    const renderSpecificParams = () => {
        switch (selectedType) {
            case 'cashflow':
                return (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-medium">Report Detail Level</label>
                            <select
                                value={reportConfig.cashflow.detailedBreakdown ? 'detailed' : 'summary'}
                                onChange={(e) => handleParamChange('cashflow', 'detailedBreakdown', e.target.value === 'detailed')}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                            >
                                <option value="detailed" className="bg-[#0A0A0A] text-white">Detailed Logic (All Txns)</option>
                                <option value="summary" className="bg-[#0A0A0A] text-white">Executive Summary Only</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-medium">Include AI Projections</label>
                            <div className="flex items-center space-x-3 h-[46px] px-1">
                                <label className="flex items-center space-x-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${reportConfig.cashflow.includeProjections ? 'bg-primary border-primary' : 'border-white/20 group-hover:border-white/40'}`}>
                                        {reportConfig.cashflow.includeProjections && <BsCheckCircle className="text-black text-xs" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={reportConfig.cashflow.includeProjections}
                                        onChange={(e) => handleParamChange('cashflow', 'includeProjections', e.target.checked)}
                                        className="hidden"
                                    />
                                    <span className="text-sm text-gray-300 group-hover:text-white">Forecast Next Month</span>
                                </label>
                            </div>
                        </div>
                    </div>
                );
            case 'budget':
                return (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-medium">Variance Threshold (%)</label>
                            <input
                                type="number"
                                value={reportConfig.budget.varianceThreshold}
                                onChange={(e) => handleParamChange('budget', 'varianceThreshold', parseInt(e.target.value))}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                                min="0" max="100"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-medium">Department Filter</label>
                            <select
                                value={reportConfig.budget.filterType}
                                onChange={(e) => handleParamChange('budget', 'filterType', e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                            >
                                <option value="all" className="bg-[#0A0A0A]">Show All Departments</option>
                                <option value="over-budget" className="bg-[#0A0A0A]">Over Budget Only</option>
                                <option value="under-budget" className="bg-[#0A0A0A]">Under Budget Only</option>
                            </select>
                        </div>
                    </div>
                );
            case 'compliance':
                return (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-medium">Show Filed Items</label>
                            <select
                                value={reportConfig.compliance.showFiled ? 'show' : 'hide'}
                                onChange={(e) => handleParamChange('compliance', 'showFiled', e.target.value === 'show')}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                            >
                                <option value="show" className="bg-[#0A0A0A]">Show Complete History</option>
                                <option value="hide" className="bg-[#0A0A0A]">Hide Filed (Active Only)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-medium">Criticality</label>
                            <div className="flex items-center space-x-3 h-[46px] px-1">
                                <label className="flex items-center space-x-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${reportConfig.compliance.highlightOverdue ? 'bg-red-500 border-red-500' : 'border-white/20'}`}>
                                        {reportConfig.compliance.highlightOverdue && <BsCheckCircle className="text-white text-xs" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={reportConfig.compliance.highlightOverdue}
                                        onChange={(e) => handleParamChange('compliance', 'highlightOverdue', e.target.checked)}
                                        className="hidden"
                                    />
                                    <span className="text-sm text-gray-300">Highlight Overdue in Red</span>
                                </label>
                            </div>
                        </div>
                    </div>
                );
            case 'aging':
                return (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-medium">Aging Bucket Size</label>
                            <select
                                value={reportConfig.aging.bucketSize}
                                onChange={(e) => handleParamChange('aging', 'bucketSize', e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                            >
                                <option value="30" className="bg-[#0A0A0A]">30-Day Buckets (Std)</option>
                                <option value="15" className="bg-[#0A0A0A]">15-Day Buckets (Granular)</option>
                                <option value="45" className="bg-[#0A0A0A]">45-Day Buckets (Extended)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-medium">Min Amount Filter</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={reportConfig.aging.minAmount}
                                onChange={(e) => handleParamChange('aging', 'minAmount', parseInt(e.target.value) || 0)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                            />
                        </div>
                    </div>
                );
            case 'vendor':
                return (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-medium">Top N Vendors</label>
                            <select
                                value={reportConfig.vendor.topN}
                                onChange={(e) => handleParamChange('vendor', 'topN', parseInt(e.target.value))}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                            >
                                <option value="5" className="bg-[#0A0A0A]">Top 5 Vendors</option>
                                <option value="10" className="bg-[#0A0A0A]">Top 10 Vendors</option>
                                <option value="20" className="bg-[#0A0A0A]">Top 20 Vendors</option>
                                <option value="50" className="bg-[#0A0A0A]">Top 50 Vendors</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-medium">Sort Strategy</label>
                            <select
                                value={reportConfig.vendor.sortBy}
                                onChange={(e) => handleParamChange('vendor', 'sortBy', e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                            >
                                <option value="amount" className="bg-[#0A0A0A]">By Total Spend (Desc)</option>
                                <option value="count" className="bg-[#0A0A0A]">By Transaction Count</option>
                            </select>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-5xl h-[85vh] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <BsPieChart className="text-xl" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Report Workbench</h2>
                            <p className="text-[11px] text-gray-500 font-medium">Generate financial intelligence & legal documents</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10"
                    >
                        <BsX className="text-xl" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* LEFT SIDEBAR: Selection */}
                    <div className="w-1/3 border-r border-white/5 flex flex-col bg-black/20">
                        {/* Tab Switcher */}
                        <div className="flex p-2 gap-1 border-b border-white/5">
                            <button
                                onClick={() => { setActiveTab('analytical'); setSelectedType('cashflow'); }}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'analytical'
                                    ? 'bg-white/10 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }`}
                            >
                                Analytical Tests
                            </button>
                            <button
                                onClick={() => { setActiveTab('documents'); setSelectedType('invoice'); }}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'documents'
                                    ? 'bg-white/10 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }`}
                            >
                                Generators
                            </button>
                        </div>

                        {/* List of Reports */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-2 block">Available Reports</label>
                            {(activeTab === 'analytical' ? ANALYTICAL_REPORTS : DOCUMENT_TEMPLATES).map((type) => {
                                const Icon = type.icon;
                                const isSelected = selectedType === type.id;
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => setSelectedType(type.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isSelected
                                            ? "bg-primary/10 border-primary/50 text-white shadow-md shadow-primary/5"
                                            : "bg-transparent border-transparent hover:bg-white/5 text-gray-400 hover:text-gray-200"
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-black' : 'bg-white/5 text-gray-500'}`}>
                                            <Icon className="text-lg" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">{type.label}</div>
                                            <div className="text-[10px] opacity-60 line-clamp-1">{type.desc}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT MAIN PANEL: Configuration */}
                    <div className="w-2/3 flex flex-col overflow-y-auto bg-[#0A0A0A]">
                        <div className="p-8 max-w-2xl mx-auto w-full space-y-8">

                            {/* Selected Report Header */}
                            <div className="flex items-start justify-between pb-6 border-b border-white/5">
                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-2">{currentReport.label}</h1>
                                    <p className="text-sm text-gray-400 leading-relaxed">{currentReport.desc}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${currentReport.bg} ${currentReport.color}`}>
                                    <currentReport.icon className="text-2xl" />
                                </div>
                            </div>

                            {/* ANALYTICAL CONFIG FORM */}
                            {activeTab === 'analytical' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    {/* Section 1: Branding */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">1</div>
                                            <h3 className="text-sm font-bold text-white tracking-wide">BRANDING & IDENTITY</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 pl-8">
                                            <div className="space-y-2">
                                                <label className="text-xs text-gray-500 font-medium">Prepared For (Client Name)</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Acme Corp / HDFC Bank"
                                                    value={reportConfig.preparedFor}
                                                    onChange={(e) => setReportConfig(prev => ({ ...prev, preparedFor: e.target.value }))}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-primary/50 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-gray-500 font-medium">Brand Logo</label>
                                                <div className={`relative h-[46px] rounded-xl border border-dashed flex items-center justify-center cursor-pointer transition-all hover:bg-white/[0.02] ${reportConfig.logo ? "border-primary/50" : "border-white/10"}`}>
                                                    {reportConfig.logo ? (
                                                        <div className="flex items-center gap-2 px-4 w-full">
                                                            <img src={reportConfig.logo} alt="Logo" className="h-6 w-auto object-contain" />
                                                            <span className="text-xs text-green-400 ml-auto whitespace-nowrap">Loaded</span>
                                                            <button onClick={(e) => { e.stopPropagation(); setReportConfig(prev => ({ ...prev, logo: null })); }} className="p-1 hover:bg-white/10 rounded-full"><BsX /></button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <span className="text-[10px] text-gray-500 flex items-center gap-2"><BsUpload /> Upload PNG/JPG</span>
                                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Parameters */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">2</div>
                                            <h3 className="text-sm font-bold text-white tracking-wide">PARAMETERS</h3>
                                        </div>

                                        <div className="pl-8 grid grid-cols-1 gap-6">
                                            {/* Report-Specific Controls */}
                                            {renderSpecificParams()}

                                            <div className="space-y-2">
                                                <label className="text-xs text-gray-500 font-medium">Reporting Period</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {['this-month', 'last-month', 'this-quarter', 'ytd'].map((range) => (
                                                        <button
                                                            key={range}
                                                            onClick={() => setDateRange(range)}
                                                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${dateRange === range
                                                                ? 'bg-primary/20 border-primary text-white'
                                                                : 'bg-white/[0.02] border-white/5 text-gray-500 hover:bg-white/5'
                                                                }`}
                                                        >
                                                            {range.replace('-', ' ').toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs text-gray-500 font-medium">Executive Notes / Remarks</label>
                                                <textarea
                                                    placeholder="Add remarks, compliance notes, or document references here..."
                                                    value={reportConfig.notes}
                                                    onChange={(e) => setReportConfig(prev => ({ ...prev, notes: e.target.value }))}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-primary/50 transition-all min-h-[100px] resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* DOCUMENT PREVIEW MESSAGE */}
                            {activeTab === 'documents' && (
                                <div className="py-12 flex flex-col items-center text-center space-y-4 opacity-50">
                                    <div className="p-4 rounded-full bg-white/5">
                                        <BsArrowRight className="text-3xl text-gray-600" />
                                    </div>
                                    <div className="max-w-xs">
                                        <h3 className="text-lg font-bold text-gray-300">External Generator</h3>
                                        <p className="text-sm text-gray-500 mt-2">This tool opens in a robust external editor. Click the button below to launch the {currentReport.label} tool.</p>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-6 border-t border-white/5 bg-[#0A0A0A] flex justify-end shrink-0 z-10">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex items-center space-x-3 px-8 py-4 bg-primary text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-xl shadow-primary/20"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            isTemplate ? <BsArrowRight className="text-lg" /> : <BsDownload className="text-lg" />
                        )}
                        <span>
                            {loading
                                ? "Generating..."
                                : isTemplate
                                    ? "Launch Generator Tool"
                                    : "Download Customized Report"
                            }
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
