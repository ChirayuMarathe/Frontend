import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../context/ThemeContext";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Download, Plus, Trash2, Globe } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ImageRun } from "docx";
import { saveAs } from "file-saver";
import { ChevronDown, Upload, X } from "lucide-react";

const REGIONS = {
  INDIA: {
    label: "India",
    taxLabel: "GST",
    currency: "INR",
    symbol: "Rs. ",
    fields: ["gstin", "cin"],
    defaultTax: 18
  },
  US: {
    label: "United States",
    taxLabel: "Sales Tax",
    currency: "USD",
    symbol: "$",
    fields: ["ein"],
    defaultTax: 0
  },
  EU: {
    label: "European Union",
    taxLabel: "VAT",
    currency: "EUR",
    symbol: "€",
    fields: ["vatNumber"],
    defaultTax: 20
  },
  MIDDLE_EAST: {
    label: "Middle East",
    taxLabel: "VAT",
    currency: "AED",
    symbol: "د.إ",
    fields: ["trn"],
    defaultTax: 5
  }
};

export default function InvoiceGenerator() {
  const { theme } = useTheme();
  const location = useLocation();
  const [region, setRegion] = useState("INDIA");
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Checking for passed state from Workbench
  const workbenchData = location.state || {};

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "INV-001",
    date: workbenchData.defaultDate || new Date().toISOString().split('T')[0],
    dueDate: "",
    senderName: workbenchData.workbenchName || "", // Pre-fill from Workbench Name
    senderEmail: "",
    senderAddress: "",
    senderGstin: "",
    senderCin: "",
    senderEin: "",
    senderVat: "",
    senderTrn: "",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    clientGstin: "",
    clientVat: "",
    items: [{ description: "", quantity: 1, price: 0 }],
    notes: "",
    taxRate: REGIONS.INDIA.defaultTax,
    logo: null,
    letterhead: null,
    footer: null,
  });

  // Update tax rate when region changes
  useEffect(() => {
    setInvoiceData(prev => ({
      ...prev,
      taxRate: REGIONS[region].defaultTax
    }));
  }, [region]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoiceData(prev => ({ ...prev, [type]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type) => {
    setInvoiceData(prev => ({ ...prev, [type]: null }));
  };

  const base64ToUint8Array = (base64) => {
    const binaryString = window.atob(base64.split(',')[1]);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...invoiceData.items];
    newItems[index][name] = name === "description" ? value : parseFloat(value) || 0;
    setInvoiceData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index) => {
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData(prev => ({ ...prev, items: newItems }));
  };

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (invoiceData.taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const total = calculateTotal();
    const currentRegion = REGIONS[region];
    const symbol = currentRegion.symbol;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Professional Colors
    const primaryColor = [0, 71, 171]; // Deep Blue
    const textColor = [33, 33, 33];
    const lightGrey = [128, 128, 128];

    let currentY = 10;

    // Letterhead
    if (invoiceData.letterhead) {
      doc.addImage(invoiceData.letterhead, 'PNG', 0, 0, pageWidth, 40);
      currentY = 45;
    } else {
      // Default Header Bar
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 40, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", pageWidth / 2, 25, { align: "center" });
      currentY = 50;
    }

    // Logo (if exists and no letterhead, or maybe always?)
    if (invoiceData.logo && !invoiceData.letterhead) {
      doc.addImage(invoiceData.logo, 'PNG', 20, 10, 30, 20);
    }

    // Invoice Info (Top Right)
    doc.setTextColor(invoiceData.letterhead ? 0 : 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const infoY = invoiceData.letterhead ? 45 : 15;
    const infoX = pageWidth - 20;

    doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, infoX, infoY, { align: "right" });
    doc.text(`Date: ${invoiceData.date}`, infoX, infoY + 7, { align: "right" });
    if (invoiceData.dueDate) doc.text(`Due Date: ${invoiceData.dueDate}`, infoX, infoY + 14, { align: "right" });

    // Reset Text Color for Body
    doc.setTextColor(...textColor);
    if (invoiceData.letterhead) currentY = 65;

    // Layout Columns
    // Left Column: From
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("FROM", 20, currentY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    currentY += 7;
    doc.text(invoiceData.senderName || "Your Business", 20, currentY);
    currentY += 5;
    doc.setTextColor(...lightGrey);
    doc.text(invoiceData.senderEmail || "your@email.com", 20, currentY);
    currentY += 5;
    doc.text(invoiceData.senderAddress || "Your Address", 20, currentY, { maxWidth: 80 });

    // Sender IDs
    currentY += 10;
    doc.setTextColor(...textColor);
    if (region === "INDIA") {
      if (invoiceData.senderGstin) { doc.text(`GSTIN: ${invoiceData.senderGstin}`, 20, currentY); currentY += 5; }
      if (invoiceData.senderCin) { doc.text(`CIN: ${invoiceData.senderCin}`, 20, currentY); currentY += 5; }
    } else if (region === "US" && invoiceData.senderEin) {
      doc.text(`EIN: ${invoiceData.senderEin}`, 20, currentY); currentY += 5;
    } else if (region === "EU" && invoiceData.senderVat) {
      doc.text(`VAT: ${invoiceData.senderVat}`, 20, currentY); currentY += 5;
    }

    // Right Column: Bill To
    let rightY = invoiceData.letterhead ? 65 : 55;
    if (!invoiceData.letterhead && currentY < 55) currentY = 55; // Ensure alignment if header bar is used

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("BILL TO", 120, rightY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    rightY += 7;
    doc.text(invoiceData.clientName || "Client Name", 120, rightY);
    rightY += 5;
    doc.setTextColor(...lightGrey);
    doc.text(invoiceData.clientEmail || "client@email.com", 120, rightY);
    rightY += 5;
    doc.text(invoiceData.clientAddress || "Client Address", 120, rightY, { maxWidth: 80 });

    if (region === "INDIA" && invoiceData.clientGstin) {
      rightY += 10;
      doc.setTextColor(...textColor);
      doc.text(`GSTIN: ${invoiceData.clientGstin}`, 120, rightY);
    }

    const startTableY = Math.max(currentY, rightY) + 15;

    const tableData = invoiceData.items.map(item => [
      item.description,
      item.quantity.toString(),
      `${symbol}${item.price.toLocaleString(region === 'INDIA' ? 'en-IN' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${symbol}${(item.quantity * item.price).toLocaleString(region === 'INDIA' ? 'en-IN' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
      startY: startTableY,
      head: [["Description", "Quantity", "Price", "Total"]],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: textColor
      },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });

    let finalY = doc.lastAutoTable.finalY + 15;

    // Summary Section
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Subtotal
    doc.text("Subtotal:", 140, finalY);
    doc.text(`${symbol}${subtotal.toLocaleString(region === 'INDIA' ? 'en-IN' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, finalY, { align: "right" });

    // Tax
    finalY += 7;
    doc.text(`${currentRegion.taxLabel} (${invoiceData.taxRate}%):`, 140, finalY);
    doc.text(`${symbol}${tax.toLocaleString(region === 'INDIA' ? 'en-IN' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, finalY, { align: "right" });

    // Total
    finalY += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setFillColor(...primaryColor);
    // Box for the total amount
    doc.rect(130, finalY - 7, 70, 11, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text("Grand Total:", 135, finalY);
    // Aligning the amount with the column total above
    doc.text(`${symbol}${total.toLocaleString(region === 'INDIA' ? 'en-IN' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, finalY, { align: "right" });

    // Notes
    if (invoiceData.notes) {
      finalY += 20;
      doc.setTextColor(...textColor);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Notes:", 20, finalY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(invoiceData.notes, 20, finalY + 7, { maxWidth: 170 });
    }

    // Add Branding / Footer
    if (invoiceData.footer) {
      doc.addImage(invoiceData.footer, 'PNG', 0, pageHeight - 30, pageWidth, 30);
    } else {
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text("Professional Document Generated via Dabby", pageWidth / 2, pageHeight - 10, { align: "center" });
    }

    doc.save(`Invoice_${invoiceData.invoiceNumber}.pdf`);
  };

  const generateWord = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const total = calculateTotal();
    const currentRegion = REGIONS[region];
    const symbol = currentRegion.symbol;

    const children = [];

    // Letterhead
    if (invoiceData.letterhead) {
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: base64ToUint8Array(invoiceData.letterhead),
              transformation: { width: 600, height: 100 },
            }),
          ],
          alignment: AlignmentType.CENTER,
        })
      );
    } else {
      // Default Header Bar
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: BorderStyle.NONE,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  shading: { fill: "0047AB" },
                  margins: { top: 400, bottom: 400, left: 400, right: 400 },
                  children: [
                    new Paragraph({
                      children: [
                        ...(invoiceData.logo ? [
                          new ImageRun({
                            data: base64ToUint8Array(invoiceData.logo),
                            transformation: { width: 50, height: 50 },
                          }),
                          new TextRun({ text: "  ", size: 48 }),
                        ] : []),
                        new TextRun({ text: "INVOICE", bold: true, size: 48, color: "FFFFFF" }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
    }

    children.push(new Paragraph({ text: "", spacing: { before: 400 } }));

    // Top Info (Invoice # and Date)
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: BorderStyle.NONE,
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [] }), // Empty left
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: `Invoice #: ${invoiceData.invoiceNumber}`, bold: true, size: 20 }),
                    ],
                    alignment: AlignmentType.RIGHT,
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: `Date: ${invoiceData.date}`, size: 18 }),
                    ],
                    alignment: AlignmentType.RIGHT,
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: `Region: ${currentRegion.label}`, size: 18 }),
                    ],
                    alignment: AlignmentType.RIGHT,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    children.push(new Paragraph({ text: "", spacing: { before: 600 } }));

    // From / Bill To Section
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: BorderStyle.NONE,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ children: [new TextRun({ text: "FROM", bold: true, size: 22, color: "0047AB" })] }),
                  new Paragraph({ children: [new TextRun({ text: invoiceData.senderName || "Your Business", bold: true, size: 20 })] }),
                  new Paragraph({ children: [new TextRun({ text: invoiceData.senderEmail || "your@email.com", color: "808080", size: 18 })] }),
                  new Paragraph({ children: [new TextRun({ text: invoiceData.senderAddress || "Your Address", size: 18 })] }),
                  ...(region === "INDIA" ? [
                    new Paragraph({ children: [new TextRun({ text: `GSTIN: ${invoiceData.senderGstin}`, size: 18 })] }),
                    new Paragraph({ children: [new TextRun({ text: `CIN: ${invoiceData.senderCin}`, size: 18 })] }),
                  ] : []),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ children: [new TextRun({ text: "BILL TO", bold: true, size: 22, color: "0047AB" })] }),
                  new Paragraph({ children: [new TextRun({ text: invoiceData.clientName || "Client Name", bold: true, size: 20 })] }),
                  new Paragraph({ children: [new TextRun({ text: invoiceData.clientEmail || "client@email.com", color: "808080", size: 18 })] }),
                  new Paragraph({ children: [new TextRun({ text: invoiceData.clientAddress || "Client Address", size: 18 })] }),
                  ...(region === "INDIA" && invoiceData.clientGstin ? [
                    new Paragraph({ children: [new TextRun({ text: `GSTIN: ${invoiceData.clientGstin}`, size: 18 })] }),
                  ] : []),
                ],
              }),
            ],
          }),
        ],
      })
    );

    children.push(new Paragraph({ text: "", spacing: { before: 600 } }));

    // Items Table
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ shading: { fill: "0047AB" }, children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true, color: "FFFFFF" })] })] }),
              new TableCell({ shading: { fill: "0047AB" }, children: [new Paragraph({ children: [new TextRun({ text: "Quantity", bold: true, color: "FFFFFF" })] }),], alignment: AlignmentType.CENTER }),
              new TableCell({ shading: { fill: "0047AB" }, children: [new Paragraph({ children: [new TextRun({ text: `Price (${symbol.trim()})`, bold: true, color: "FFFFFF" })] }),], alignment: AlignmentType.RIGHT }),
              new TableCell({ shading: { fill: "0047AB" }, children: [new Paragraph({ children: [new TextRun({ text: `Total (${symbol.trim()})`, bold: true, color: "FFFFFF" })] }),], alignment: AlignmentType.RIGHT }),
            ],
          }),
          ...invoiceData.items.map(item => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(item.description)] }),
              new TableCell({ children: [new Paragraph(item.quantity.toString())], alignment: AlignmentType.CENTER }),
              new TableCell({ children: [new Paragraph(`${symbol}${item.price.toLocaleString(region === 'INDIA' ? 'en-IN' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)], alignment: AlignmentType.RIGHT }),
              new TableCell({ children: [new Paragraph(`${symbol}${(item.quantity * item.price).toLocaleString(region === 'INDIA' ? 'en-IN' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)], alignment: AlignmentType.RIGHT }),
            ],
          })),
        ],
      })
    );

    children.push(new Paragraph({ text: "", spacing: { before: 600 } }));

    // Totals
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Subtotal: ${symbol}${subtotal.toLocaleString(region === 'INDIA' ? 'en-IN' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, size: 20 }),
        ],
        alignment: AlignmentType.RIGHT,
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${currentRegion.taxLabel} (${invoiceData.taxRate}%): ${symbol}${tax.toLocaleString(region === 'INDIA' ? 'en-IN' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, size: 20 }),
        ],
        alignment: AlignmentType.RIGHT,
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Total Amount: ${symbol}${total.toLocaleString(region === 'INDIA' ? 'en-IN' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, bold: true, size: 24, color: "0047AB" }),
        ],
        alignment: AlignmentType.RIGHT,
      })
    );

    children.push(new Paragraph({ text: "", spacing: { before: 1200 } }));

    // Footer
    if (invoiceData.footer) {
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: base64ToUint8Array(invoiceData.footer),
              transformation: { width: 600, height: 80 },
            }),
          ],
          alignment: AlignmentType.CENTER,
        })
      );
    } else {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Professional Document Generated via Dabby", color: "808080", size: 18, italic: true }),
          ],
          alignment: AlignmentType.CENTER,
        })
      );
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: children,
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `Invoice_${invoiceData.invoiceNumber}.docx`);
    });
  };

  return (
    <div className={`min-h-screen py-24 px-6 md:px-12 ${theme === "dark" ? "bg-black text-white" : "bg-gray-50 text-gray-900"
      }`}>
      <div className="max-w-4xl mx-auto">
        {workbenchData.fromWorkbench ? (
          <Link to={`/dashboard/workbench/${workbenchData.workbenchId}`} className="flex items-center gap-2 text-[#81E6D9] mb-8 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Workbench: {workbenchData.workbenchName}
          </Link>
        ) : (
          <Link to="/templates" className="flex items-center gap-2 text-[#81E6D9] mb-8 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Templates
          </Link>
        )}

        <div className={`rounded-3xl border p-8 md:p-12 ${theme === "dark" ? "bg-[#111] border-white/10" : "bg-white border-gray-200 shadow-xl"
          }`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Invoice Generator</h1>
              <div className="flex items-center gap-2 text-sm opacity-70">
                <Globe className="w-4 h-4" />
                <span>Selected Region: {REGIONS[region].label}</span>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 bg-[#81E6D9] text-black px-6 py-3 rounded-full font-semibold hover:bg-[#71d6c9] transition-all"
              >
                <Download className="w-5 h-5" /> Download <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? "rotate-180" : ""}`} />
              </button>

              {showExportMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border z-10 overflow-hidden ${theme === "dark" ? "bg-[#1A1A1A] border-white/10" : "bg-white border-gray-200"
                  }`}>
                  <button
                    onClick={() => {
                      generatePDF();
                      setShowExportMenu(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-[#81E6D9]/10 transition-colors ${theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                  >
                    Download as PDF
                  </button>
                  <button
                    onClick={() => {
                      generateWord();
                      setShowExportMenu(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-[#81E6D9]/10 transition-colors ${theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                  >
                    Download as Word
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Region Selection */}
          <div className="mb-12">
            <h2 className="text-lg font-semibold border-b pb-2 mb-4">Select Region</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(REGIONS).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setRegion(key)}
                  className={`p-4 rounded-2xl border transition-all text-sm font-medium ${region === key
                    ? "border-[#81E6D9] bg-[#81E6D9]/10 text-[#81E6D9]"
                    : theme === "dark"
                      ? "border-white/10 bg-white/5 hover:border-white/30"
                      : "border-gray-200 bg-gray-50 hover:border-gray-400"
                    }`}
                >
                  {value.label}
                </button>
              ))}
            </div>
          </div>

          {/* Branding Section */}
          <div className="mb-12">
            <h2 className="text-lg font-semibold border-b pb-2 mb-6">Branding (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium opacity-70">Company Logo</label>
                <div className={`relative h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${invoiceData.logo ? "border-[#81E6D9] bg-[#81E6D9]/5" : "border-white/10 hover:border-white/30"
                  }`}>
                  {invoiceData.logo ? (
                    <>
                      <img src={invoiceData.logo} alt="Logo" className="h-20 object-contain" />
                      <button onClick={() => removeImage('logo')} className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mb-2 opacity-50" />
                      <span className="text-xs opacity-50">Upload Logo</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </>
                  )}
                </div>
              </div>

              {/* Letterhead Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium opacity-70">Letterhead (Top)</label>
                <div className={`relative h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${invoiceData.letterhead ? "border-[#81E6D9] bg-[#81E6D9]/5" : "border-white/10 hover:border-white/30"
                  }`}>
                  {invoiceData.letterhead ? (
                    <>
                      <img src={invoiceData.letterhead} alt="Letterhead" className="h-20 object-contain" />
                      <button onClick={() => removeImage('letterhead')} className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mb-2 opacity-50" />
                      <span className="text-xs opacity-50">Upload Letterhead</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'letterhead')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </>
                  )}
                </div>
              </div>

              {/* Footer Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium opacity-70">Footer Image (Bottom)</label>
                <div className={`relative h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${invoiceData.footer ? "border-[#81E6D9] bg-[#81E6D9]/5" : "border-white/10 hover:border-white/30"
                  }`}>
                  {invoiceData.footer ? (
                    <>
                      <img src={invoiceData.footer} alt="Footer" className="h-20 object-contain" />
                      <button onClick={() => removeImage('footer')} className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mb-2 opacity-50" />
                      <span className="text-xs opacity-50">Upload Footer</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'footer')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">Invoice Details</h2>
              <div>
                <label className="block text-sm font-medium mb-1 opacity-70">Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"
                    }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 opacity-70">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={invoiceData.date}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 opacity-70">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={invoiceData.dueDate}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"
                      }`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">Tax & Currency</h2>
              <div>
                <label className="block text-sm font-medium mb-1 opacity-70">{REGIONS[region].taxLabel} Rate (%)</label>
                <input
                  type="number"
                  name="taxRate"
                  value={invoiceData.taxRate}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"
                    }`}
                />
              </div>
              <div className="p-4 rounded-xl bg-[#81E6D9]/5 border border-[#81E6D9]/20">
                <p className="text-xs opacity-70">Currency for this region: <span className="font-bold text-[#81E6D9]">{REGIONS[region].currency} ({REGIONS[region].symbol})</span></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">From</h2>
              <input
                type="text"
                name="senderName"
                placeholder="Your Business Name"
                value={invoiceData.senderName}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"
                  }`}
              />

              {/* Regional Fields for Sender */}
              {region === "INDIA" && (
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="senderGstin"
                    placeholder="GST Number"
                    value={invoiceData.senderGstin}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`}
                  />
                  <input
                    type="text"
                    name="senderCin"
                    placeholder="CIN"
                    value={invoiceData.senderCin}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`}
                  />
                </div>
              )}
              {region === "US" && (
                <input
                  type="text"
                  name="senderEin"
                  placeholder="EIN Number"
                  value={invoiceData.senderEin}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`}
                />
              )}
              {region === "EU" && (
                <input
                  type="text"
                  name="senderVat"
                  placeholder="VAT Number"
                  value={invoiceData.senderVat}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`}
                />
              )}
              {region === "MIDDLE_EAST" && (
                <input
                  type="text"
                  name="senderTrn"
                  placeholder="TRN Number"
                  value={invoiceData.senderTrn}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`}
                />
              )}

              <input
                type="email"
                name="senderEmail"
                placeholder="Email Address"
                value={invoiceData.senderEmail}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"
                  }`}
              />
              <textarea
                name="senderAddress"
                placeholder="Address"
                value={invoiceData.senderAddress}
                onChange={handleInputChange}
                rows="3"
                className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"
                  }`}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">Bill To</h2>
              <input
                type="text"
                name="clientName"
                placeholder="Client's Name / Business"
                value={invoiceData.clientName}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"
                  }`}
              />

              {/* Regional Fields for Client */}
              {region === "INDIA" && (
                <input
                  type="text"
                  name="clientGstin"
                  placeholder="Client GST Number"
                  value={invoiceData.clientGstin}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`}
                />
              )}
              {region === "EU" && (
                <input
                  type="text"
                  name="clientVat"
                  placeholder="Client VAT Number"
                  value={invoiceData.clientVat}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`}
                />
              )}

              <input
                type="email"
                name="clientEmail"
                placeholder="Client's Email"
                value={invoiceData.clientEmail}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"
                  }`}
              />
              <textarea
                name="clientAddress"
                placeholder="Client's Address"
                value={invoiceData.clientAddress}
                onChange={handleInputChange}
                rows="3"
                className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"
                  }`}
              />
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-lg font-semibold border-b pb-4 mb-6">Items</h2>
            <div className="space-y-4">
              {invoiceData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-6">
                    <label className="block text-xs font-medium mb-1 opacity-70">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, e)}
                      placeholder="Item description"
                      className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"
                        }`}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1 opacity-70">Qty</label>
                    <input
                      type="number"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, e)}
                      className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"
                        }`}
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-medium mb-1 opacity-70">Price ({REGIONS[region].symbol})</label>
                    <input
                      type="number"
                      name="price"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, e)}
                      className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"
                        }`}
                    />
                  </div>
                  <div className="col-span-1 pb-3">
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={addItem}
                className="flex items-center gap-2 text-[#81E6D9] font-semibold hover:underline mt-4"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-8 pt-8 border-t">
            <div className="flex-grow">
              <label className="block text-sm font-medium mb-2 opacity-70">Notes / Terms</label>
              <textarea
                name="notes"
                placeholder="Additional notes or payment terms..."
                value={invoiceData.notes}
                onChange={handleInputChange}
                rows="4"
                className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"
                  }`}
              />
            </div>
            <div className="w-full md:w-64 space-y-3">
              <div className="flex justify-between">
                <span className="opacity-70">Subtotal</span>
                <span>{REGIONS[region].symbol}{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">{REGIONS[region].taxLabel} ({invoiceData.taxRate}%)</span>
                <span>{REGIONS[region].symbol}{calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-3 border-t border-white/10">
                <span>Total</span>
                <span className="text-[#81E6D9]">{REGIONS[region].symbol}{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

