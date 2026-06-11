import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../context/ThemeContext";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Plus, Trash2, ChevronDown, Upload, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ImageRun } from "docx";
import { saveAs } from "file-saver";

export default function DeliveryChallanGenerator() {
  const { theme } = useTheme();
  const [challanData, setChallanData] = useState({
    challanNumber: "DC-001",
    date: new Date().toISOString().split('T')[0],
    vehicleNumber: "",
    senderName: "",
    senderGstin: "",
    senderCin: "",
    senderAddress: "",
    receiverName: "",
    receiverGstin: "",
    receiverAddress: "",
    items: [{ description: "", quantity: 1, unit: "pcs" }],
    notes: "",
    logo: null,
    letterhead: null,
    footer: null,
  });

  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setChallanData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setChallanData(prev => ({ ...prev, [type]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type) => {
    setChallanData(prev => ({ ...prev, [type]: null }));
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
    const newItems = [...challanData.items];
    newItems[index][name] = name === "quantity" ? parseFloat(value) || 0 : value;
    setChallanData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setChallanData(prev => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unit: "pcs" }]
    }));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const primaryColor = [0, 71, 171]; // Royal Blue
    const pageWidth = doc.internal.pageSize.width;
    let currentY = 0;

    // Add Letterhead or Default Header
    if (challanData.letterhead) {
      doc.addImage(challanData.letterhead, 'PNG', 0, 0, pageWidth, 40);
      currentY = 45;
    } else {
      // Header Bar
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("DELIVERY CHALLAN", pageWidth / 2, 25, { align: "center" });
      currentY = 50;
    }

    // Logo (if uploaded and no letterhead)
    if (challanData.logo && !challanData.letterhead) {
      doc.addImage(challanData.logo, 'PNG', 20, 10, 20, 20);
    }

    // Document Info
    doc.setTextColor(challanData.letterhead ? [33, 33, 33] : [255, 255, 255]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Challan #: ${challanData.challanNumber}`, pageWidth - 20, 20, { align: "right" });
    doc.text(`Date: ${challanData.date}`, pageWidth - 20, 27, { align: "right" });
    if (challanData.vehicleNumber) {
      doc.text(`Vehicle #: ${challanData.vehicleNumber}`, pageWidth - 20, 34, { align: "right" });
    }

    // Reset Text Color
    doc.setTextColor(33, 33, 33);

    // Section Headers
    currentY += 10;
    doc.setFillColor(240, 240, 240);
    doc.rect(20, currentY, 80, 8, 'F');
    doc.rect(110, currentY, 80, 8, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.text("FROM (CONSIGNOR)", 25, currentY + 6);
    doc.text("TO (CONSIGNEE)", 115, currentY + 6);

    // Details
    doc.setFont("helvetica", "normal");
    let senderY = currentY + 15;
    doc.text(challanData.senderName || "Sender Name", 20, senderY);
    senderY += 6;
    if (challanData.senderGstin) {
      doc.text(`GSTIN: ${challanData.senderGstin}`, 20, senderY);
      senderY += 6;
    }
    if (challanData.senderCin) {
      doc.text(`CIN: ${challanData.senderCin}`, 20, senderY);
      senderY += 6;
    }
    const senderAddrLines = doc.splitTextToSize(challanData.senderAddress || "Address", 80);
    doc.text(senderAddrLines, 20, senderY);
    senderY += (senderAddrLines.length * 6);

    let receiverY = currentY + 15;
    doc.text(challanData.receiverName || "Receiver Name", 110, receiverY);
    receiverY += 6;
    if (challanData.receiverGstin) {
      doc.text(`GSTIN: ${challanData.receiverGstin}`, 110, receiverY);
      receiverY += 6;
    }
    const receiverAddrLines = doc.splitTextToSize(challanData.receiverAddress || "Address", 80);
    doc.text(receiverAddrLines, 110, receiverY);
    receiverY += (receiverAddrLines.length * 6);

    const tableStartY = Math.max(senderY, receiverY) + 10;

    const tableData = challanData.items.map(item => [
      item.description,
      item.quantity.toString(),
      item.unit
    ]);

    autoTable(doc, {
      startY: tableStartY,
      head: [["Description of Goods", "Quantity", "Unit"]],
      body: tableData,
      theme: 'striped',
      headStyles: { fillStyle: 'F', fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 30;
    
    // Signatures
    doc.setDrawColor(200, 200, 200);
    doc.line(20, finalY, 70, finalY);
    doc.line(140, finalY, 190, finalY);
    
    doc.setFontSize(10);
    doc.text("Receiver's Signature", 45, finalY + 7, { align: "center" });
    doc.text("Authorized Signatory", 165, finalY + 7, { align: "center" });

    // Footer Image or Default Branding
    const pageHeight = doc.internal.pageSize.height;
    if (challanData.footer) {
      doc.addImage(challanData.footer, 'PNG', 0, pageHeight - 40, pageWidth, 40);
    } else {
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text("Professional Document Generated via Dabby", pageWidth / 2, pageHeight - 10, { align: "center" });
    }

    doc.save(`Delivery_Challan_${challanData.challanNumber}.pdf`);
  };

  const generateWord = () => {
    const children = [];

    // Letterhead or Default Header
    if (challanData.letterhead) {
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: base64ToUint8Array(challanData.letterhead),
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
                        ...(challanData.logo ? [
                          new ImageRun({
                            data: base64ToUint8Array(challanData.logo),
                            transformation: { width: 50, height: 50 },
                          }),
                          new TextRun({ text: "  ", size: 48 }),
                        ] : []),
                        new TextRun({ text: "DELIVERY CHALLAN", bold: true, size: 48, color: "FFFFFF" }),
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

    // Document Info
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: BorderStyle.NONE,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: `Challan #: ${challanData.challanNumber}`, bold: true, size: 20 })], alignment: AlignmentType.RIGHT }),
                  new Paragraph({ children: [new TextRun({ text: `Date: ${challanData.date}`, size: 18 })], alignment: AlignmentType.RIGHT }),
                  ...(challanData.vehicleNumber ? [new Paragraph({ children: [new TextRun({ text: `Vehicle #: ${challanData.vehicleNumber}`, size: 18 })], alignment: AlignmentType.RIGHT })] : []),
                ],
              }),
            ],
          }),
        ],
      })
    );

    children.push(new Paragraph({ text: "", spacing: { before: 400 } }));

    // From/To
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: "F2F2F2" },
                children: [new Paragraph({ children: [new TextRun({ text: "FROM (CONSIGNOR)", bold: true, size: 20 })] })],
                margins: { left: 100, top: 100, bottom: 100 },
              }),
              new TableCell({
                shading: { fill: "F2F2F2" },
                children: [new Paragraph({ children: [new TextRun({ text: "TO (CONSIGNEE)", bold: true, size: 20 })] })],
                margins: { left: 100, top: 100, bottom: 100 },
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: challanData.senderName || "Sender Name", bold: true })] }),
                  ...(challanData.senderGstin ? [new Paragraph({ text: `GSTIN: ${challanData.senderGstin}` })] : []),
                  ...(challanData.senderCin ? [new Paragraph({ text: `CIN: ${challanData.senderCin}` })] : []),
                  new Paragraph({ text: challanData.senderAddress || "Address" }),
                ],
                borders: BorderStyle.NONE,
                margins: { top: 200, bottom: 200, left: 100 },
              }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: challanData.receiverName || "Receiver Name", bold: true })] }),
                  ...(challanData.receiverGstin ? [new Paragraph({ text: `GSTIN: ${challanData.receiverGstin}` })] : []),
                  new Paragraph({ text: challanData.receiverAddress || "Address" }),
                ],
                borders: BorderStyle.NONE,
                margins: { top: 200, bottom: 200, left: 100 },
              }),
            ],
          }),
        ],
      })
    );

    children.push(new Paragraph({ text: "", spacing: { before: 400, after: 400 } }));

    // Items Table
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ shading: { fill: "0047AB" }, children: [new Paragraph({ children: [new TextRun({ text: "Description of Goods", bold: true, color: "FFFFFF" })] })] }),
              new TableCell({ shading: { fill: "0047AB" }, children: [new Paragraph({ children: [new TextRun({ text: "Quantity", bold: true, color: "FFFFFF" })] })], alignment: AlignmentType.CENTER }),
              new TableCell({ shading: { fill: "0047AB" }, children: [new Paragraph({ children: [new TextRun({ text: "Unit", bold: true, color: "FFFFFF" })] })], alignment: AlignmentType.CENTER }),
            ],
          }),
          ...challanData.items.map(item => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: item.description })], margins: { left: 100, top: 100, bottom: 100 } }),
              new TableCell({ children: [new Paragraph({ text: item.quantity.toString(), alignment: AlignmentType.CENTER })], margins: { top: 100, bottom: 100 } }),
              new TableCell({ children: [new Paragraph({ text: item.unit, alignment: AlignmentType.CENTER })], margins: { top: 100, bottom: 100 } }),
            ],
          })),
        ],
      })
    );

    children.push(new Paragraph({ text: "", spacing: { before: 800 } }));

    // Signatures
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: BorderStyle.NONE,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ text: "__________________________", alignment: AlignmentType.CENTER }),
                  new Paragraph({ text: "Receiver's Signature", alignment: AlignmentType.CENTER }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ text: "__________________________", alignment: AlignmentType.CENTER }),
                  new Paragraph({ text: "Authorized Signatory", alignment: AlignmentType.CENTER }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    // Footer Image or Default Branding
    if (challanData.footer) {
      children.push(new Paragraph({ text: "", spacing: { before: 1200 } }));
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: base64ToUint8Array(challanData.footer),
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
      saveAs(blob, `Delivery_Challan_${challanData.challanNumber}.docx`);
    });
  };

  return (
    <div className={`min-h-screen py-24 px-6 md:px-12 ${
      theme === "dark" ? "bg-black text-white" : "bg-gray-50 text-gray-900"
    }`}>
      <div className="max-w-4xl mx-auto">
        <Link to="/templates" className="flex items-center gap-2 text-[#81E6D9] mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Templates
        </Link>
        <div className={`rounded-3xl border p-8 md:p-12 ${theme === "dark" ? "bg-[#111] border-white/10" : "bg-white border-gray-200 shadow-xl"}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h1 className="text-3xl font-bold">Delivery Challan Generator</h1>
              <p className="text-sm opacity-60 mt-2">Generate GST-compliant transport documents for India</p>
            </div>
          <div className="mb-12">
            <h2 className="text-lg font-semibold border-b pb-2 mb-6">Branding (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium opacity-70">Company Logo</label>
                <div className={`relative h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                  challanData.logo ? "border-[#81E6D9] bg-[#81E6D9]/5" : "border-white/10 hover:border-white/30"
                }`}>
                  {challanData.logo ? (
                    <>
                      <img src={challanData.logo} alt="Logo" className="h-20 object-contain" />
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
                <div className={`relative h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                  challanData.letterhead ? "border-[#81E6D9] bg-[#81E6D9]/5" : "border-white/10 hover:border-white/30"
                }`}>
                  {challanData.letterhead ? (
                    <>
                      <img src={challanData.letterhead} alt="Letterhead" className="h-20 object-contain" />
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
                <div className={`relative h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                  challanData.footer ? "border-[#81E6D9] bg-[#81E6D9]/5" : "border-white/10 hover:border-white/30"
                }`}>
                  {challanData.footer ? (
                    <>
                      <img src={challanData.footer} alt="Footer" className="h-20 object-contain" />
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
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 bg-[#81E6D9] text-black px-6 py-3 rounded-full font-semibold hover:bg-[#71d6c9] transition-all transform hover:scale-105 shadow-lg"
              >
                <Download className="w-5 h-5" /> Download <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? "rotate-180" : ""}`} />
              </button>
              
              {showExportMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border z-10 overflow-hidden ${
                  theme === "dark" ? "bg-[#1a1a1a] border-white/10" : "bg-white border-gray-200"
                }`}>
                  <button
                    onClick={() => {
                      generatePDF();
                      setShowExportMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-50"
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
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-t ${
                      theme === "dark" ? "hover:bg-white/5 border-white/10" : "hover:bg-gray-50 border-gray-100"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">Challan Details</h2>
              <input type="text" name="challanNumber" placeholder="Challan Number" value={challanData.challanNumber} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
              <input type="date" name="date" value={challanData.date} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
              <input type="text" name="vehicleNumber" placeholder="Vehicle Number" value={challanData.vehicleNumber} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
            </div>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">Consignor (From)</h2>
              <div className="space-y-4">
                <input type="text" name="senderName" placeholder="Consignor Name" value={challanData.senderName} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
                <input type="text" name="senderGstin" placeholder="Consignor GSTIN" value={challanData.senderGstin} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
                <input type="text" name="senderCin" placeholder="Consignor CIN (Optional)" value={challanData.senderCin} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
                <textarea name="senderAddress" placeholder="Consignor Address" value={challanData.senderAddress} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">Consignee (To)</h2>
              <input type="text" name="receiverName" placeholder="Consignee Name" value={challanData.receiverName} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
              <input type="text" name="receiverGstin" placeholder="Consignee GSTIN" value={challanData.receiverGstin} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
              <textarea name="receiverAddress" placeholder="Consignee Address" value={challanData.receiverAddress} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-lg font-semibold border-b pb-4 mb-6">Goods Details</h2>
            <div className="space-y-4">
              {challanData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="col-span-full md:col-span-7">
                    <input type="text" name="description" placeholder="Description of Goods" value={item.description} onChange={(e) => handleItemChange(index, e)} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
                  </div>
                  <div className="col-span-full md:col-span-2">
                    <input type="number" name="quantity" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, e)} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
                  </div>
                  <div className="col-span-full md:col-span-2">
                    <input type="text" name="unit" placeholder="Unit" value={item.unit} onChange={(e) => handleItemChange(index, e)} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
                  </div>
                  <div className="col-span-full md:col-span-1 pb-3 text-center">
                    <button onClick={() => setChallanData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))} className="text-red-500 hover:text-red-400 transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
              <button onClick={addItem} className="text-[#81E6D9] font-semibold flex items-center gap-2 hover:underline transition-all"><Plus className="w-4 h-4" /> Add Good</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

