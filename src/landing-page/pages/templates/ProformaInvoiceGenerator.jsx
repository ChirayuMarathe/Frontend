import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../context/ThemeContext";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Plus, Trash2, Globe, ChevronDown, Upload, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ImageRun } from "docx";
import { saveAs } from "file-saver";

export default function ProformaInvoiceGenerator() {
  const { theme } = useTheme();
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "PI-001",
    date: new Date().toISOString().split('T')[0],
    senderName: "",
    senderGstin: "",
    senderCin: "",
    senderAddress: "",
    clientName: "",
    clientGstin: "",
    clientAddress: "",
    items: [{ description: "", quantity: 1, price: 0 }],
    notes: "",
    taxRate: 18,
    logo: null,
    letterhead: null,
    footer: null,
  });

  const [showExportMenu, setShowExportMenu] = useState(false);

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

  const calculateSubtotal = () => invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const calculateTax = () => calculateSubtotal() * (invoiceData.taxRate / 100);

  const generatePDF = () => {
    const doc = new jsPDF();
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const total = subtotal + tax;
    const symbol = "Rs. ";

    // Professional Colors
    const primaryColor = [0, 71, 171]; // Deep Blue
    const textColor = [33, 33, 33];
    const lightGrey = [128, 128, 128];
    const pageWidth = doc.internal.pageSize.width;
    let currentY = 0;

    // Add Letterhead or Default Header
    if (invoiceData.letterhead) {
      doc.addImage(invoiceData.letterhead, 'PNG', 0, 0, pageWidth, 40);
      currentY = 45;
    } else {
      // Header Bar
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 40, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("PROFORMA INVOICE", pageWidth / 2, 25, { align: "center" });
      currentY = 50;
    }

    // Logo (if uploaded and no letterhead)
    if (invoiceData.logo && !invoiceData.letterhead) {
      doc.addImage(invoiceData.logo, 'PNG', 20, 10, 20, 20);
    }

    // Info (Top Right)
    if (invoiceData.letterhead) {
      doc.setTextColor(...textColor);
    } else {
      doc.setTextColor(255, 255, 255);
    }
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Proforma #: ${invoiceData.invoiceNumber}`, pageWidth - 20, 20, { align: "right" });
    doc.text(`Date: ${invoiceData.date}`, pageWidth - 20, 27, { align: "right" });

    // Reset Text Color
    doc.setTextColor(...textColor);

    // Layout Columns
    currentY += 10;
    const startY = currentY;

    // Left Column: Exporter
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("EXPORTER", 20, currentY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    currentY += 7;
    doc.text(invoiceData.senderName || "Exporter Name", 20, currentY);
    currentY += 5;
    if (invoiceData.senderGstin) {
      doc.text(`GSTIN: ${invoiceData.senderGstin}`, 20, currentY);
      currentY += 5;
    }
    doc.setTextColor(...lightGrey);
    doc.text(invoiceData.senderAddress || "Address", 20, currentY, { maxWidth: 80 });

    // Right Column: Importer
    let rightY = startY;
    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("IMPORTER / BILL TO", 120, rightY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    rightY += 7;
    doc.text(invoiceData.clientName || "Importer Name", 120, rightY);
    rightY += 5;
    if (invoiceData.clientGstin) {
      doc.text(`GSTIN: ${invoiceData.clientGstin}`, 120, rightY);
      rightY += 5;
    }
    doc.setTextColor(...lightGrey);
    doc.text(invoiceData.clientAddress || "Address", 120, rightY, { maxWidth: 80 });

    const startTableY = Math.max(currentY, rightY) + 15;

    const tableData = invoiceData.items.map(item => [
      item.description,
      item.quantity.toString(),
      `${symbol}${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${symbol}${(item.quantity * item.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
      startY: startTableY,
      head: [["Description", "Qty", "Unit Price", "Amount"]],
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

    doc.text("Subtotal:", 140, finalY);
    doc.text(`${symbol}${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, finalY, { align: "right" });

    finalY += 7;
    doc.text(`GST (${invoiceData.taxRate}%):`, 140, finalY);
    doc.text(`${symbol}${tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, finalY, { align: "right" });

    // Total
    finalY += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setFillColor(...primaryColor);
    // Box for the total amount
    doc.rect(130, finalY - 7, 70, 11, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text("Total Estimate:", 135, finalY);
    // Aligning the amount with the column total above
    doc.text(`${symbol}${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, finalY, { align: "right" });

    // Add Branding / Footer Image
    const pageHeightVal = doc.internal.pageSize.height;
    const pageWidthVal = doc.internal.pageSize.width;

    if (invoiceData.footer) {
      doc.addImage(invoiceData.footer, 'PNG', 0, pageHeightVal - 40, pageWidthVal, 40);
    } else {
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text("Professional Document Generated via Dabby", pageWidthVal / 2, pageHeightVal - 10, { align: "center" });
    }

    doc.save(`Proforma_Invoice_${invoiceData.invoiceNumber}.pdf`);
  };

  const generateWord = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const total = subtotal + tax;
    const symbol = "Rs. ";

    const children = [];

    // Letterhead or Default Header
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
                        new TextRun({ text: "PROFORMA INVOICE", bold: true, size: 48, color: "FFFFFF" }),
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

    // Top Info
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: BorderStyle.NONE,
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [] }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: `Proforma #: ${invoiceData.invoiceNumber}`, bold: true, size: 20 })],
                    alignment: AlignmentType.RIGHT,
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: `Date: ${invoiceData.date}`, size: 18 })],
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

    // Exporter / Importer Section
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
                  new Paragraph({ children: [new TextRun({ text: "EXPORTER", bold: true, size: 22, color: "0047AB" })] }),
                  new Paragraph({ children: [new TextRun({ text: invoiceData.senderName || "Exporter Name", bold: true, size: 20 })] }),
                  new Paragraph({ children: [new TextRun({ text: `GSTIN: ${invoiceData.senderGstin}`, size: 18 })] }),
                  new Paragraph({ children: [new TextRun({ text: invoiceData.senderAddress || "Address", color: "808080", size: 18 })] }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ children: [new TextRun({ text: "IMPORTER / BILL TO", bold: true, size: 22, color: "0047AB" })] }),
                  new Paragraph({ children: [new TextRun({ text: invoiceData.clientName || "Importer Name", bold: true, size: 20 })] }),
                  new Paragraph({ children: [new TextRun({ text: `GSTIN: ${invoiceData.clientGstin}`, size: 18 })] }),
                  new Paragraph({ children: [new TextRun({ text: invoiceData.clientAddress || "Address", color: "808080", size: 18 })] }),
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
              new TableCell({ shading: { fill: "0047AB" }, children: [new Paragraph({ children: [new TextRun({ text: "Qty", bold: true, color: "FFFFFF" })] })], alignment: AlignmentType.CENTER }),
              new TableCell({ shading: { fill: "0047AB" }, children: [new Paragraph({ children: [new TextRun({ text: "Unit Price (Rs.)", bold: true, color: "FFFFFF" })] })], alignment: AlignmentType.RIGHT }),
              new TableCell({ shading: { fill: "0047AB" }, children: [new Paragraph({ children: [new TextRun({ text: "Amount (Rs.)", bold: true, color: "FFFFFF" })] })], alignment: AlignmentType.RIGHT }),
            ],
          }),
          ...invoiceData.items.map(item => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(item.description)] }),
              new TableCell({ children: [new Paragraph(item.quantity.toString())], alignment: AlignmentType.CENTER }),
              new TableCell({ children: [new Paragraph(`${symbol}${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)], alignment: AlignmentType.RIGHT }),
              new TableCell({ children: [new Paragraph(`${symbol}${(item.quantity * item.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)], alignment: AlignmentType.RIGHT }),
            ],
          })),
        ],
      })
    );

    children.push(new Paragraph({ text: "", spacing: { before: 600 } }));

    // Totals
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Subtotal: ${symbol}${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, size: 20 })],
        alignment: AlignmentType.RIGHT,
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `GST (${invoiceData.taxRate}%): ${symbol}${tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, size: 20 })],
        alignment: AlignmentType.RIGHT,
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Total Estimate: ${symbol}${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, bold: true, size: 24, color: "0047AB" })],
        alignment: AlignmentType.RIGHT,
      })
    );

    // Footer Image or Default Branding
    if (invoiceData.footer) {
      children.push(new Paragraph({ text: "", spacing: { before: 1200 } }));
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: base64ToUint8Array(invoiceData.footer),
              transformation: { width: 600, height: 100 },
            }),
          ],
          alignment: AlignmentType.CENTER,
        })
      );
    } else {
      children.push(new Paragraph({ text: "", spacing: { before: 1200 } }));
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "Professional Document Generated via Dabby", color: "808080", size: 18, italic: true })],
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
      saveAs(blob, `Proforma_Invoice_${invoiceData.invoiceNumber}.docx`);
    });
  };

  return (
    <div className={`min-h-screen py-24 px-6 md:px-12 ${theme === "dark" ? "bg-black text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-4xl mx-auto">
        <Link to="/templates" className="flex items-center gap-2 text-[#81E6D9] mb-8 hover:underline"><ArrowLeft className="w-4 h-4" /> Back to Templates</Link>
        <div className={`rounded-3xl border p-8 md:p-12 ${theme === "dark" ? "bg-[#111] border-white/10" : "bg-white border-gray-200 shadow-xl"}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h1 className="text-3xl font-bold">Proforma Invoice Generator</h1>
              <p className="text-sm opacity-60 mt-2">Generate GST-compliant proforma invoices for India</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 bg-[#81E6D9] text-black px-6 py-3 rounded-full font-semibold hover:bg-[#71d6c9] transition-all transform hover:scale-105 shadow-lg"
              >
                <Download className="w-5 h-5" /> Download <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? "rotate-180" : ""}`} />
              </button>

              {showExportMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border z-10 overflow-hidden ${theme === "dark" ? "bg-[#1a1a1a] border-white/10" : "bg-white border-gray-200"
                  }`}>
                  <button
                    onClick={() => {
                      generatePDF();
                      setShowExportMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-50"
                      }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <span className="text-red-500 font-bold text-xs">PDF</span>
                    </div>
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      generateWord();
                      setShowExportMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-t ${theme === "dark" ? "hover:bg-white/5 border-white/10" : "hover:bg-gray-50 border-gray-100"
                      }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <span className="text-blue-500 font-bold text-xs">DOC</span>
                    </div>
                    <span>Download Word</span>
                  </button>
                </div>
              )}
            </div>
          </div>

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
              <input type="text" name="invoiceNumber" placeholder="Proforma Number" value={invoiceData.invoiceNumber} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
              <input type="date" name="date" value={invoiceData.date} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
            </div>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">GST (%)</h2>
              <input type="number" name="taxRate" value={invoiceData.taxRate} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">Exporter</h2>
              <input type="text" name="senderName" placeholder="Business Name" value={invoiceData.senderName} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
              <input type="text" name="senderGstin" placeholder="Your GSTIN" value={invoiceData.senderGstin} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
              <input type="text" name="senderCin" placeholder="Your CIN (Optional)" value={invoiceData.senderCin} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
              <textarea name="senderAddress" placeholder="Address" value={invoiceData.senderAddress} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
            </div>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">Importer</h2>
              <input type="text" name="clientName" placeholder="Client Name" value={invoiceData.clientName} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
              <input type="text" name="clientGstin" placeholder="Client GSTIN" value={invoiceData.clientGstin} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
              <textarea name="clientAddress" placeholder="Address" value={invoiceData.clientAddress} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
            </div>
          </div>
          <div className="mb-12">
            <h2 className="text-lg font-semibold border-b pb-4 mb-6">Items (INR)</h2>
            <div className="space-y-4">
              {invoiceData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="col-span-full md:col-span-6"><input type="text" name="description" placeholder="Description" value={item.description} onChange={(e) => handleItemChange(index, e)} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} /></div>
                  <div className="col-span-full md:col-span-2"><input type="number" name="quantity" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, e)} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} /></div>
                  <div className="col-span-full md:col-span-3"><input type="number" name="price" placeholder="Price (₹)" value={item.price} onChange={(e) => handleItemChange(index, e)} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} /></div>
                  <div className="col-span-full md:col-span-1 pb-3 text-center"><button onClick={() => setInvoiceData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))} className="text-red-500 hover:text-red-400 transition-colors"><Trash2 className="w-5 h-5" /></button></div>
                </div>
              ))}
              <button onClick={addItem} className="text-[#81E6D9] font-semibold flex items-center gap-2 hover:underline transition-all"><Plus className="w-4 h-4" /> Add Item</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

