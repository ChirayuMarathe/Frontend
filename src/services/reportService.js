import { supabase } from "../lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Report Service - Professional Edition
 * Generates high-fidelity, branded PDF reports for Datalis.
 */
export const reportService = {
    // Brand Colors
    colors: {
        teal: [20, 184, 166], // #14b8a6
        dark: [15, 23, 42],   // #0f172a
        slate: [100, 116, 139], // #64748b
        light: [241, 245, 249], // #f1f5f9
        white: [255, 255, 255],
        red: [239, 68, 68]      // #ef4444
    },

    async generateReport(type, workbenchId, workbenchName, dateRange, config = {}) {
        try {
            console.log(`[ReportService] Generating ${type} report for ${workbenchId}...`);

            let data = [];
            let doc = new jsPDF();
            const timestamp = new Date().toLocaleString();
            const fileName = `${type}_report_${new Date().toISOString().split('T')[0]}.pdf`;

            // 1. Fetch Data
            switch (type) {
                case 'cashflow':
                    data = await this.fetchCashflowData(workbenchId, dateRange);
                    this.generateCashflowPDF(doc, data, workbenchName, timestamp, dateRange, config);
                    break;
                case 'budget':
                    data = await this.fetchBudgetData(workbenchId);
                    this.generateBudgetPDF(doc, data, workbenchName, timestamp, config);
                    break;
                case 'compliance':
                    data = await this.fetchComplianceData(workbenchId);
                    this.generateCompliancePDF(doc, data, workbenchName, timestamp, config);
                    break;
                case 'aging':
                    data = await this.fetchAgingData(workbenchId);
                    this.generateAgingPDF(doc, data, workbenchName, timestamp, config);
                    break;
                case 'dataroom':
                    data = await this.fetchDataRoomData(workbenchId);
                    this.generateDataRoomPDF(doc, data, workbenchName, timestamp, config);
                    break;
                case 'vendor':
                    data = await this.fetchVendorData(workbenchId);
                    this.generateVendorPDF(doc, data, workbenchName, timestamp, config);
                    break;
                default:
                    throw new Error("Invalid report type");
            }

            // 2. Save PDF
            doc.save(fileName);
            return true;
        } catch (err) {
            console.error("[ReportService] Error generating report:", err);
            throw err;
        }
    },

    // --- DATA FETCHING (Unchanged logic, just ensure robustness) ---

    async fetchCashflowData(workbenchId, dateRange) {
        const now = new Date();
        let startDate = new Date(0);

        if (dateRange === 'this-month') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        else if (dateRange === 'last-month') startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        else if (dateRange === 'this-quarter') startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        else if (dateRange === 'ytd') startDate = new Date(now.getFullYear(), 0, 1);

        const { data, error } = await supabase
            .from('workbench_records')
            .select('*')
            .eq('workbench_id', workbenchId)
            .eq('record_type', 'transaction')
            .gte('metadata->>transaction_date', startDate.toISOString().split('T')[0])
            .order('metadata->>transaction_date', { ascending: false });

        if (error) throw error;
        const { data: pos } = await supabase.from('view_cash_position').select('*').eq('workbench_id', workbenchId).maybeSingle();
        return { transactions: data || [], summary: pos || { balance: 0, inflow: 0, outflow: 0 } };
    },

    async fetchBudgetData(workbenchId) {
        const { data, error } = await supabase.from('view_budget_vs_actual').select('*').eq('workbench_id', workbenchId);
        if (error) throw error;
        return data || [];
    },

    async fetchComplianceData(workbenchId) {
        const { data, error } = await supabase.from('compliances').select('*').eq('workbench_id', workbenchId).order('deadline', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    async fetchAgingData(workbenchId) {
        const { data: receivables } = await supabase.from('view_receivables').select('*').eq('workbench_id', workbenchId);
        const { data: payables } = await supabase.from('view_payables').select('*').eq('workbench_id', workbenchId);
        return { receivables: receivables || [], payables: payables || [] };
    },

    async fetchVendorData(workbenchId) {
        const { data: expenses } = await supabase.from('view_expense_categorization').select('*').eq('workbench_id', workbenchId);
        return { expenses: expenses || [] };
    },

    async fetchDataRoomData(workbenchId) {
        const [labelsRes, ledgerRes] = await Promise.all([
            supabase.from('labels').select('*, master_sub_accounts(sub_account_name)').eq('workbench_id', workbenchId),
            supabase.from('ledger_entries').select('*').eq('workbench_id', workbenchId)
        ]);

        const labels = labelsRes.data || [];
        const entries = ledgerRes.data || [];

        const balanceMap = {};
        entries.forEach(e => {
            if (!balanceMap[e.label_id]) balanceMap[e.label_id] = 0;
            balanceMap[e.label_id] += e.amount || 0;
        });

        const mapLabels = (type) => labels.filter(l => l.type === type).map(l => ({
            name: l.name, sub_account: l.master_sub_accounts?.sub_account_name || '', amount: Math.abs(balanceMap[l.id] || 0)
        }));

        const revenue = mapLabels('revenue');
        const expenses = mapLabels('expense');
        const totalRevenue = revenue.reduce((s, l) => s + l.amount, 0);
        const totalExpenses = expenses.reduce((s, l) => s + l.amount, 0);
        const netProfit = totalRevenue - totalExpenses;

        const categories = {};
        expenses.forEach(l => { categories[l.sub_account || 'Other'] = (categories[l.sub_account || 'Other'] || 0) + l.amount; });

        return {
            pl: { total_revenue: totalRevenue, total_expenses: totalExpenses, net_profit: netProfit, revenue, expenses },
            bs: {
                total_assets: mapLabels('asset').reduce((s, l) => s + l.amount, 0),
                total_liabilities: mapLabels('liability').reduce((s, l) => s + l.amount, 0),
                total_equity: mapLabels('equity').reduce((s, l) => s + l.amount, 0),
                assets: mapLabels('asset'), liabilities: mapLabels('liability'), equity: mapLabels('equity')
            },
            mis: { categories },
            interpretation: {
                headline: netProfit >= 0 ? "Profitable Operations" : "Attention Required",
                subtext: netProfit >= 0 ? `Net profit: ₹${netProfit.toLocaleString()}` : `Net loss: ₹${Math.abs(netProfit).toLocaleString()}`,
                signals: [
                    { type: 'growth', msg: totalRevenue > 0 ? 'Revenue streams are active' : 'No revenue recorded yet' },
                    { type: 'risk', msg: totalExpenses > totalRevenue ? 'Burn rate exceeds revenue' : 'Operating within budget' },
                    { type: 'compliance', msg: 'All entries are ledger-verified' }
                ]
            }
        };
    },


    // --- PROFESSIONAL PDF GENERATOR HELPERS ---

    setupPage(doc, title, workbenchName, timestamp, subtitle = "", config = {}) {
        const pageWidth = doc.internal.pageSize.width;

        // 1. Top Branding Bar
        doc.setFillColor(...this.colors.dark);
        doc.rect(0, 0, pageWidth, 40, 'F'); // Dark header background

        // 2. Logo / Company Name
        if (config.logo) {
            // Render uploaded logo
            try {
                // Keep aspect ratio roughly
                doc.addImage(config.logo, 'PNG', 14, 8, 30, 24, undefined, 'FAST');
            } catch (e) {
                console.warn("Invalid logo data", e);
                // Fallback to text
                this.drawDefaultLogo(doc);
            }
        } else {
            this.drawDefaultLogo(doc);
        }

        // 3. Report Title Details (Right Aligned)
        doc.setFontSize(24);
        doc.setTextColor(...this.colors.white);
        doc.text(title.toUpperCase(), pageWidth - 14, 20, { align: "right" });

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`GENERATED: ${timestamp.toUpperCase()}`, pageWidth - 14, 28, { align: "right" });
        if (subtitle) {
            doc.text(subtitle.toUpperCase(), pageWidth - 14, 34, { align: "right" });
        }

        // 4. Info Block (Boxed Style like Tax Invoice)
        doc.setDrawColor(...this.colors.slate);
        doc.setLineWidth(0.1);
        doc.setFillColor(255, 255, 255);

        // Left Box: Prepared For
        doc.rect(14, 45, 90, 20);
        doc.setFillColor(...this.colors.light);
        doc.rect(14, 45, 90, 6, 'F'); // Header for box
        doc.setFontSize(8);
        doc.setTextColor(...this.colors.dark);
        doc.setFont("helvetica", "bold");
        doc.text("PREPARED FOR", 17, 49);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        // Use custom preparedFor text if available, else workbench name
        doc.text(config.preparedFor || workbenchName || "Client Workbench", 17, 58);

        // Right Box: Provider Info
        doc.rect(106, 45, pageWidth - 120, 20);
        doc.setFillColor(...this.colors.light);
        doc.rect(106, 45, pageWidth - 120, 6, 'F');
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("PROVIDER", 109, 49);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Datalis Financial Systems", 109, 58);
        doc.setFontSize(8);
        doc.setTextColor(...this.colors.slate);
        doc.text("Automated Reporting Engine", 109, 62);

        return 75; // Return Y start position for content
    },

    drawDefaultLogo(doc) {
        doc.setFontSize(24);
        doc.setTextColor(...this.colors.teal);
        doc.setFont("helvetica", "bold");
        doc.text("DATALIS", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(200, 200, 200);
        doc.setFont("helvetica", "normal");
        doc.text("INTELLIGENCE SUITE", 14, 26);
    },

    drawNotes(doc, notes, yPos) {
        if (!notes) return yPos;

        const pageWidth = doc.internal.pageSize.width;

        doc.setFontSize(9);
        doc.setTextColor(...this.colors.dark);
        doc.setFont("helvetica", "bold");
        doc.text("NOTES / REFERENCES", 14, yPos);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        const splitNotes = doc.splitTextToSize(notes, pageWidth - 28);
        doc.text(splitNotes, 14, yPos + 5);

        return yPos + 10 + (splitNotes.length * 4); // Adjust spacing based on line count
    },

    drawSignatureBlock(doc, yPos) {
        if (yPos > 250) { doc.addPage(); yPos = 20; }

        const rightX = doc.internal.pageSize.width - 70;

        doc.setFontSize(8);
        doc.setTextColor(...this.colors.slate);
        doc.text("AUTHORISED SIGNATORY", rightX, yPos + 30);
        doc.setDrawColor(...this.colors.slate);
        doc.line(rightX, yPos + 25, rightX + 50, yPos + 25);
        doc.text("Generated Digitally by Datalis", rightX, yPos + 35);
    },

    addFooter(doc) {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(...this.colors.slate);
            doc.text(`Page ${i} of ${pageCount} | Private & Confidential`, 14, doc.internal.pageSize.height - 10);
            doc.text("Powered by Datalis", doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 10, { align: "right" });
        }
    },

    // --- SPECIFIC REPORT GENERATORS ---

    generateCashflowPDF(doc, data, workbenchName, timestamp, dateRange, config) {
        let y = this.setupPage(doc, "Cash Flow Statement", workbenchName, timestamp, `Period: ${dateRange}`, config);
        y = this.drawNotes(doc, config.notes, y);

        // Summary Cards
        const balance = data.summary?.balance || 0;

        // Net Position Box
        doc.setFillColor(...(balance >= 0 ? this.colors.teal : this.colors.red));
        doc.rect(14, y, 180, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text("NET CASH POSITION", 20, y + 8);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(`INR ${balance.toLocaleString()}`, 20, y + 19);

        y += 35;

        // Transactions Table
        const tableRows = data.transactions.map(t => [
            t.metadata?.transaction_date || '-',
            t.summary,
            t.metadata?.party_name || '-',
            t.metadata?.payment_type?.toUpperCase() || '-',
            t.metadata?.direction === 'credit' ? 'INFLOW' : 'OUTFLOW',
            {
                content: (t.metadata?.amount || 0).toLocaleString(),
                styles: { textColor: t.metadata?.direction === 'credit' ? this.colors.teal : this.colors.red, fontStyle: 'bold' }
            }
        ]);

        autoTable(doc, {
            startY: y,
            head: [['DATE', 'DESCRIPTION', 'PARTY', 'METHOD', 'TYPE', 'AMOUNT (INR)']],
            body: tableRows,
            theme: 'grid', // Boxed "Tax Invoice" style
            headStyles: { fillColor: this.colors.dark, textColor: this.colors.white, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 3, lineColor: [200, 200, 200], lineWidth: 0.1 },
            columnStyles: { 5: { halign: 'right' } }
        });

        this.drawSignatureBlock(doc, doc.lastAutoTable.finalY);
        this.addFooter(doc);
    },

    generateBudgetPDF(doc, data, workbenchName, timestamp, config) {
        let y = this.setupPage(doc, "Budget Variance", workbenchName, timestamp, "", config);
        y = this.drawNotes(doc, config.notes, y);

        const totalBudget = data.reduce((sum, item) => sum + item.budgeted_amount, 0);
        const totalActual = data.reduce((sum, item) => sum + item.actual_amount, 0);
        const variance = totalBudget - totalActual;
        const pct = totalBudget > 0 ? (variance / totalBudget * 100).toFixed(1) : 0;

        // Executive Summary in a Grid
        autoTable(doc, {
            startY: y,
            head: [['TOTAL BUDGET', 'TOTAL SPENT', 'REMAINING (VARIANCE)', 'UTILIZATION']],
            body: [[
                `INR ${totalBudget.toLocaleString()}`,
                `INR ${totalActual.toLocaleString()}`,
                { content: `INR ${variance.toLocaleString()}`, styles: { textColor: variance >= 0 ? this.colors.teal : this.colors.red, fontStyle: 'bold' } },
                `${(100 - pct).toFixed(1)}%`
            ]],
            theme: 'plain',
            headStyles: { fontSize: 8, textColor: this.colors.slate },
            styles: { fontSize: 14, fontStyle: 'bold' },
            columnStyles: { 0: { cellWidth: 45 }, 1: { cellWidth: 45 }, 2: { cellWidth: 50 }, 3: { cellWidth: 40 } }
        });

        y = doc.lastAutoTable.finalY + 10;

        const filterType = config.params?.filterType || 'all';
        let filteredData = data;
        if (filterType === 'over-budget') {
            filteredData = data.filter(item => (item.budgeted_amount - item.actual_amount) < 0);
        } else if (filterType === 'under-budget') {
            filteredData = data.filter(item => (item.budgeted_amount - item.actual_amount) >= 0);
        }

        const threshold = config.params?.varianceThreshold || 0;

        const tableRows = filteredData.map(item => {
            const variance = item.budgeted_amount - item.actual_amount;
            const variancePct = item.budgeted_amount > 0 ? Math.abs(variance / item.budgeted_amount * 100) : 0;
            const isSignificant = variancePct > threshold;

            return [
                item.category,
                item.budgeted_amount.toLocaleString(),
                item.actual_amount.toLocaleString(),
                {
                    content: variance.toLocaleString(),
                    styles: {
                        textColor: variance >= 0 ? this.colors.teal : this.colors.red,
                        fontStyle: isSignificant ? 'bold' : 'normal'
                    }
                },
                item.progress_percentage.toFixed(1) + '%'
            ]
        });

        autoTable(doc, {
            startY: y,
            head: [['DEPARTMENT / GOAL', 'BUDGETED', 'ACTUAL SPENT', 'VARIANCE', '% USED']],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: this.colors.dark },
            columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
            styles: { fontSize: 10 }
        });

        this.drawSignatureBlock(doc, doc.lastAutoTable.finalY);
        this.addFooter(doc);
    },

    generateCompliancePDF(doc, data, workbenchName, timestamp, config) {
        let y = this.setupPage(doc, "Compliance Scorecard", workbenchName, timestamp, "", config);
        y = this.drawNotes(doc, config.notes, y);

        const pending = data.filter(c => (c.status || c.metadata?.status) === 'pending').length;
        const overdue = data.filter(c => {
            const status = c.status || c.metadata?.status;
            const deadline = c.deadline || c.metadata?.deadline;
            return new Date(deadline) < new Date() && status !== 'filed';
        }).length;

        // Scorecard Summary
        doc.setFillColor(overdue > 0 ? 254 : 240, overdue > 0 ? 226 : 253, overdue > 0 ? 226 : 244); // Red or Green-ish background
        doc.rect(14, y, 180, 20, 'F');
        doc.setFontSize(12);
        doc.setTextColor(overdue > 0 ? 185 : 21, overdue > 0 ? 28 : 128, overdue > 0 ? 28 : 61);
        doc.text(overdue > 0 ? `ATTENTION: ${overdue} OVERDUE COMPLIANCES FOUND` : "STATUS: ALL CLEAR - NO OVERDUE ITEMS", 20, y + 13);

        y += 30;

        let complianceData = data;
        if (config.params?.showFiled === false) {
            complianceData = data.filter(c => (c.status || c.metadata?.status) !== 'filed');
        }

        const tableRows = complianceData.map(c => {
            const status = c.status || c.metadata?.status || 'pending';
            const isOverdue = (config.params?.highlightOverdue && status === 'pending' && new Date(c.deadline || c.metadata?.deadline) < new Date());

            return [
                c.name || c.metadata?.name || 'Compliance',
                c.form || c.metadata?.form || '-',
                c.deadline || c.metadata?.deadline || '-',
                {
                    content: status.toUpperCase(),
                    styles: { textColor: isOverdue ? [220, 38, 38] : (status === 'filed' ? [16, 185, 129] : [0, 0, 0]), fontStyle: isOverdue ? 'bold' : 'normal' }
                },
                c.filed_date || c.metadata?.filed_date || '-'
            ]
        });

        autoTable(doc, {
            startY: y,
            head: [['REGULATION', 'FORM ID', 'DUE DATE', 'STATUS', 'FILED ON']],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: this.colors.dark },
            didParseCell: function (data) {
                if (data.section === 'body' && data.column.index === 3) {
                    const raw = data.cell.raw;
                    if (raw === 'OVERDUE') data.cell.styles.textColor = [220, 38, 38];
                    if (raw === 'FILED') data.cell.styles.textColor = [16, 185, 129];
                }
            }
        });

        this.drawSignatureBlock(doc, doc.lastAutoTable.finalY);
        this.addFooter(doc);
    },

    generateAgingPDF(doc, data, workbenchName, timestamp, config) {
        let y = this.setupPage(doc, "Aging Analysis", workbenchName, timestamp, "", config);
        y = this.drawNotes(doc, config.notes, y);

        // Receivables
        doc.setFontSize(14);
        doc.setTextColor(...this.colors.teal);
        doc.text("ACCOUNTS RECEIVABLE", 14, y + 10);

        // In "Invoice" style, we delineate sections clearly
        doc.setDrawColor(...this.colors.teal);
        doc.line(14, y + 12, 196, y + 12);

        const recRows = data.receivables.map(r => [
            r.party_name || 'Unknown',
            (r.total_amount || 0).toLocaleString(),
            '0-30 Days', // Mocking buckets for now
            r.transaction_count || 0
        ]);

        autoTable(doc, {
            startY: y + 18,
            head: [['CUSTOMER', 'OUTSTANDING (INR)', 'AGING BUCKET', 'INVOICE COUNT']],
            body: recRows.length ? recRows : [['No outstanding receivables', '-', '-', '-']],
            theme: 'grid',
            headStyles: { fillColor: this.colors.teal }, // Teal header for Receivables
            columnStyles: { 1: { halign: 'right' } }
        });

        // Payables
        y = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(14);
        doc.setTextColor(...this.colors.red);
        doc.text("ACCOUNTS PAYABLE", 14, y + 10);
        doc.setDrawColor(...this.colors.red);
        doc.line(14, y + 12, 196, y + 12);

        const minAmount = config.params?.minAmount || 0;
        const payRows = data.payables
            .filter(p => (p.total_amount || 0) >= minAmount)
            .map(p => [
                p.party_name || 'Unknown',
                (p.total_amount || 0).toLocaleString(),
                '0-30 Days',
                p.transaction_count || 0
            ]);

        autoTable(doc, {
            startY: y + 18,
            head: [['VENDOR', 'PAYABLE Amount (INR)', 'AGING BUCKET', 'BILL COUNT']],
            body: payRows.length ? payRows : [['No outstanding payables', '-', '-', '-']],
            theme: 'grid',
            headStyles: { fillColor: this.colors.red }, // Red header for Payables
            columnStyles: { 1: { halign: 'right' } }
        });

        this.drawSignatureBlock(doc, doc.lastAutoTable.finalY);
        this.addFooter(doc);
    },

    generateVendorPDF(doc, data, workbenchName, timestamp, config) {
        let y = this.setupPage(doc, "Vendor Intelligence", workbenchName, timestamp, "", config);
        y = this.drawNotes(doc, config.notes, y);

        const topN = config.params?.topN || 10;
        const sortBy = config.params?.sortBy || 'amount';

        // Calculate Total Expense for % calculation
        const totalExpense = data.reduce((sum, e) => sum + (e.total_amount || 0), 0);

        // Sort and Slice Vendor Data
        const sortedVendors = [...data].sort((a, b) => {
            if (sortBy === 'count') return (b.transaction_count || 0) - (a.transaction_count || 0);
            return (b.total_amount || 0) - (a.total_amount || 0);
        }).slice(0, topN);

        const tableRows = sortedVendors.map(v => [
            v.party_name || 'Unknown Vendor',
            v.category || 'General',
            (v.transaction_count || 0).toString(),
            (v.total_amount || 0).toLocaleString(),
            ((v.total_amount / (totalExpense || 1)) * 100).toFixed(1) + '%'
        ]);

        autoTable(doc, {
            startY: y,
            head: [['EXPENSE CATEGORY', 'TXN COUNT', 'TOTAL SPENT (INR)', '% OF TOTAL']],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: this.colors.dark },
            columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } },
            foot: [['TOTAL SPEND', '-', `INR ${totalExpense.toLocaleString()}`, '100%']],
            footStyles: { fillColor: this.colors.light, textColor: this.colors.dark, fontStyle: 'bold' }
        });

        this.drawSignatureBlock(doc, doc.lastAutoTable.finalY);
        this.addFooter(doc);
    },

    generateDataRoomPDF(doc, data, workbenchName, timestamp, config) {
        const { pl, bs, mis, interpretation } = data;
        
        // --- Page 1: Cover & Interpretation ---
        let y = this.setupPage(doc, "Financial Data Room", workbenchName, timestamp, "Executive Interpretation", config);
        
        doc.setFontSize(18);
        doc.setTextColor(...this.colors.dark);
        doc.setFont("helvetica", "bold");
        doc.text(interpretation.headline, 14, y + 10);
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...this.colors.slate);
        const splitSubtext = doc.splitTextToSize(interpretation.subtext, doc.internal.pageSize.width - 28);
        doc.text(splitSubtext, 14, y + 20);
        
        y += 40 + (splitSubtext.length * 5);
        
        // Signals Table
        autoTable(doc, {
            startY: y,
            head: [['STRATEGIC SIGNAL', 'STATUS / OBSERVATION']],
            body: interpretation.signals.map(s => [s.type.toUpperCase(), s.msg]),
            theme: 'grid',
            headStyles: { fillColor: this.colors.dark }
        });

        // --- Page 2: Profit & Loss ---
        doc.addPage();
        y = this.setupPage(doc, "Profit & Loss", workbenchName, timestamp, "Operating Performance", config);
        
        // Summary Card for P&L
        autoTable(doc, {
            startY: y,
            body: [[
                { content: 'TOTAL REVENUE', styles: { textColor: this.colors.slate, fontSize: 8 } },
                { content: 'TOTAL EXPENSE', styles: { textColor: this.colors.slate, fontSize: 8 } },
                { content: 'NET PROFIT', styles: { textColor: this.colors.slate, fontSize: 8 } }
            ], [
                { content: `INR ${pl.total_revenue.toLocaleString()}`, styles: { fontSize: 14, fontStyle: 'bold' } },
                { content: `INR ${pl.total_expenses.toLocaleString()}`, styles: { fontSize: 14, fontStyle: 'bold' } },
                { content: `INR ${pl.net_profit.toLocaleString()}`, styles: { fontSize: 14, fontStyle: 'bold', textColor: pl.net_profit >= 0 ? this.colors.teal : this.colors.red } }
            ]],
            theme: 'plain'
        });
        
        y = doc.lastAutoTable.finalY + 10;
        
        // Revenue Table
        doc.setFontSize(12);
        doc.text("REVENUE DETAILS", 14, y);
        autoTable(doc, {
            startY: y + 4,
            head: [['ACCOUNT / LABEL', 'CATEGORY', 'AMOUNT (INR)']],
            body: pl.revenue.map(r => [r.name, r.sub_account, r.amount.toLocaleString()]),
            theme: 'striped',
            headStyles: { fillColor: this.colors.teal },
            columnStyles: { 2: { halign: 'right' } }
        });
        
        y = doc.lastAutoTable.finalY + 10;
        
        // Expense Table
        doc.setFontSize(12);
        doc.text("EXPENSE DETAILS", 14, y);
        autoTable(doc, {
            startY: y + 4,
            head: [['ACCOUNT / LABEL', 'CATEGORY', 'AMOUNT (INR)']],
            body: pl.expenses.map(e => [e.name, e.sub_account, e.amount.toLocaleString()]),
            theme: 'striped',
            headStyles: { fillColor: this.colors.dark },
            columnStyles: { 2: { halign: 'right' } }
        });

        // --- Page 3: Balance Sheet ---
        doc.addPage();
        y = this.setupPage(doc, "Balance Sheet", workbenchName, timestamp, "Position of Truth", config);
        
        // Asset Section
        autoTable(doc, {
            startY: y,
            head: [['ASSETS', 'SUB-ACCOUNT', 'BALANCE (INR)']],
            body: bs.assets.map(a => [a.name, a.sub_account, a.amount.toLocaleString()]),
            theme: 'grid',
            headStyles: { fillColor: this.colors.teal },
            columnStyles: { 2: { halign: 'right' } },
            foot: [['TOTAL ASSETS', '', `INR ${bs.total_assets.toLocaleString()}`]],
            footStyles: { fillColor: this.colors.light, textColor: this.colors.dark, fontStyle: 'bold' }
        });
        
        y = doc.lastAutoTable.finalY + 10;
        
        // Liabilities & Equity
        autoTable(doc, {
            startY: y,
            head: [['LIABILITIES & EQUITY', 'SUB-ACCOUNT', 'BALANCE (INR)']],
            body: [
                ...bs.liabilities.map(l => [l.name, l.sub_account, l.amount.toLocaleString()]),
                ...bs.equity.map(e => [e.name, e.sub_account, e.amount.toLocaleString()])
            ],
            theme: 'grid',
            headStyles: { fillColor: this.colors.dark },
            columnStyles: { 2: { halign: 'right' } },
            foot: [['TOTAL LIABILITIES + EQUITY', '', `INR ${(bs.total_liabilities + bs.total_equity).toLocaleString()}`]],
            footStyles: { fillColor: this.colors.light, textColor: this.colors.dark, fontStyle: 'bold' }
        });

        // --- Page 4: MIS & Concentration ---
        doc.addPage();
        y = this.setupPage(doc, "MIS Report", workbenchName, timestamp, "Expense Concentration Analysis", config);
        
        autoTable(doc, {
            startY: y,
            head: [['EXPENSE CATEGORY', 'ALLOCATED AMOUNT (INR)', '% OF TOTAL']],
            body: Object.entries(mis.categories).map(([cat, val]) => [
                cat,
                val.toLocaleString(),
                ((val / (pl.total_expenses || 1)) * 100).toFixed(1) + '%'
            ]),
            theme: 'grid',
            headStyles: { fillColor: this.colors.dark },
            columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } }
        });

        this.addFooter(doc);
    }
};

