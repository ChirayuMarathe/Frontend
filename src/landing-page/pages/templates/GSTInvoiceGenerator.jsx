import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../context/ThemeContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Upload, X, Plus, Trash2, Globe, ArrowLeft, Download, CheckCircle, Building, ArrowRight, Package } from "lucide-react";
import { backendService } from "../../../services/backendService";
import { supabase } from "../../../lib/supabase";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ImageRun } from "docx";
import { saveAs } from "file-saver";

export default function GSTInvoiceGenerator() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [wbContext, setWbContext] = useState({ parties: [], labels: [], inventory: [], workbenches: [] });
  const [activeWorkbenchId, setActiveWorkbenchId] = useState(location.state?.workbenchId || null);
  
  // Detect Workbench Context
  const fromWorkbench = location.state?.fromWorkbench || !!user;
  const initialData = location.state?.initialData;
  const sourceDoc = location.state?.sourceDoc;

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "GST-001",
    date: new Date().toISOString().split('T')[0],
    senderName: "",
    senderGstin: "",
    senderCin: "",
    senderAddress: "",
    clientName: "",
    clientGstin: "",
    clientCin: "",
    clientAddress: "",
    party_id: "",
    revenue_label_id: "",
    ar_label_id: "",
    items: [{ item_id: null, description: "", quantity: 1, price: 0, hsn: "" }],
    notes: "",
    taxRate: 18,
    cgst: 9,
    sgst: 9,
    logo: null,
    letterhead: null,
    footer: null,
  });

  // Fetch Workbenches if logged in but no workbenchId
  useEffect(() => {
    if (user && !activeWorkbenchId) {
      const fetchWorkbenches = async () => {
        const { data } = await supabase.from('workbenches').select('*');
        if (data && data.length > 0) {
          setWbContext(prev => ({ ...prev, workbenches: data }));
          setActiveWorkbenchId(data[0].id); // Default to first workbench
        }
      };
      fetchWorkbenches();
    }
  }, [user, activeWorkbenchId]);

  // Fetch Workbench Context (Parties, Labels, Inventory, Entities)
  useEffect(() => {
    if (activeWorkbenchId) {
      const fetchContext = async () => {
        try {
          // 1. Fetch Items first to get IDs for stock ledger
          const { data: itemsData } = await supabase
            .from('items')
            .select('*')
            .eq('workbench_id', activeWorkbenchId)
            .eq('is_deleted', false);
            
          const itemIds = itemsData?.map(i => i.id) || [];

          // 2. Fetch everything else in parallel
          const [partyData, labelData, wbData, stockData, entityData] = await Promise.all([
            supabase.from('parties').select('*').eq('workbench_id', activeWorkbenchId),
            supabase.from('labels').select('*').eq('workbench_id', activeWorkbenchId),
            supabase.from('workbenches').select('*').eq('id', activeWorkbenchId).single(),
            itemIds.length > 0 
              ? supabase.from('stock_ledger').select('item_id, quantity_change').in('item_id', itemIds)
              : Promise.resolve({ data: [] }),
            backendService.listWorkbenchEntities(activeWorkbenchId)
          ]);

          const items = itemsData || [];
          const ledger = stockData.data || [];

          // Map stock levels
          const itemsWithStock = items.map(item => ({
            ...item,
            current_stock: ledger
              .filter(l => l.item_id === item.id)
              .reduce((acc, l) => acc + (parseFloat(l.quantity_change) || 0), 0)
          }));

          setWbContext(prev => ({
            ...prev,
            parties: partyData.data || [],
            labels: labelData.data || [],
            inventory: itemsWithStock,
            entities: entityData || []
          }));

          // Pre-fill Supplier from Workbench
          if (wbData.data) {
            const wb = wbData.data;
            setInvoiceData(prev => ({
              ...prev,
              senderName: wb.legal_name || wb.name || prev.senderName,
              senderGstin: wb.gstin || prev.senderGstin,
              senderCin: wb.cin || prev.senderCin,
              senderAddress: wb.metadata?.address || prev.senderAddress,
              logo: wb.metadata?.logo_url || prev.logo
            }));
          }
        } catch (err) {
          console.error("Failed to fetch workbench context:", err);
        }
      };
      fetchContext();
    }
  }, [activeWorkbenchId]);

  // Pre-fill from AI or Scanned Doc
  useEffect(() => {
    if (initialData) {
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: initialData.invoiceNumber || initialData.invoice_no || prev.invoiceNumber,
        date: initialData.dateIssued || initialData.date || prev.date,
        items: initialData.items?.map(item => ({
          description: item.description || '',
          quantity: item.quantity || 1,
          price: item.price || item.rate || 0,
          hsn: item.hsn_code || item.hsn || ''
        })) || prev.items
      }));

      if (initialData.clientName || initialData.client_name) {
        setInvoiceData(prev => ({ ...prev, clientName: initialData.clientName || initialData.client_name }));
      }
    }
  }, [initialData]);

  // Handle Party Selection (Sync with workbench parties)
  const handlePartySelect = (partyId) => {
    const party = wbContext.parties.find(p => p.id === partyId);
    if (party) {
      // Find a default vessel for this party to pre-fill AR Label
      const partyVessels = (wbContext.entities || []).filter(e => e.party_id === party.id);
      const defaultVessel = partyVessels[0];

      setInvoiceData(prev => ({
        ...prev,
        party_id: party.id,
        clientName: party.name,
        clientAddress: party.address || prev.clientAddress,
        clientGstin: party.metadata?.gstin || prev.clientGstin,
        ar_label_id: defaultVessel?.label_id || prev.ar_label_id
      }));
    }
  };

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
    
    if (name === "inventory_select") {
      const selectedItem = wbContext.inventory.find(i => i.id === value);
      if (selectedItem) {
        newItems[index].item_id = selectedItem.id;
        newItems[index].description = selectedItem.name;
        newItems[index].hsn = selectedItem.hsn_code || selectedItem.hsn || "";
        newItems[index].price = selectedItem.sale_price || selectedItem.price || 0;
      }
    } else {
      newItems[index][name] = (name === "description" || name === "hsn") ? value : parseFloat(value) || 0;
    }
    
    setInvoiceData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { item_id: null, description: "", quantity: 1, price: 0, hsn: "" }]
    }));
  };

  const [showExportMenu, setShowExportMenu] = useState(false);

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return {
      cgst: subtotal * (invoiceData.cgst / 100),
      sgst: subtotal * (invoiceData.sgst / 100),
      totalTax: subtotal * ((invoiceData.cgst + invoiceData.sgst) / 100)
    };
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const subtotal = calculateSubtotal();
    const taxes = calculateTax();
    const total = subtotal + taxes.totalTax;
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
      doc.text("GST INVOICE", pageWidth / 2, 25, { align: "center" });
      currentY = 50;
    }

    // Logo (if uploaded and no letterhead)
    if (invoiceData.logo && !invoiceData.letterhead) {
      doc.addImage(invoiceData.logo, 'PNG', 20, 10, 20, 20);
    }

    // Invoice Info (Top Right)
    if (invoiceData.letterhead) {
      doc.setTextColor(...textColor);
    } else {
      doc.setTextColor(255, 255, 255);
    }
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, pageWidth - 20, 20, { align: "right" });
    doc.text(`Date: ${invoiceData.date}`, pageWidth - 20, 27, { align: "right" });

    // Reset Text Color
    doc.setTextColor(...textColor);

    // Layout Columns
    currentY += 10;
    const startY = currentY;

    // Left Column: Supplier
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("SUPPLIER DETAILS", 20, currentY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    currentY += 7;
    doc.text(invoiceData.senderName || "Business Name", 20, currentY);
    currentY += 5;
    if (invoiceData.senderGstin) {
      doc.text(`GSTIN: ${invoiceData.senderGstin}`, 20, currentY);
      currentY += 5;
    }
    if (invoiceData.senderCin) {
      doc.text(`CIN: ${invoiceData.senderCin}`, 20, currentY);
      currentY += 5;
    }
    doc.setTextColor(...lightGrey);
    doc.text(invoiceData.senderAddress || "Address", 20, currentY, { maxWidth: 80 });

    // Right Column: Recipient
    let rightY = startY;
    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("RECIPIENT DETAILS", 120, rightY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    rightY += 7;
    doc.text(invoiceData.clientName || "Client Name", 120, rightY);
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
      item.hsn || "-",
      item.quantity.toString(),
      `${symbol}${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${symbol}${(item.quantity * item.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
      startY: startTableY,
      head: [["Description", "HSN/SAC", "Qty", "Rate", "Total"]],
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
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      }
    });

    let finalY = doc.lastAutoTable.finalY + 15;

    // Summary Section
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Taxable Value
    doc.text("Taxable Value:", 140, finalY);
    doc.text(`${symbol}${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, finalY, { align: "right" });

    // CGST
    finalY += 7;
    doc.text(`CGST (${invoiceData.cgst}%):`, 140, finalY);
    doc.text(`${symbol}${taxes.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, finalY, { align: "right" });

    // SGST
    finalY += 7;
    doc.text(`SGST (${invoiceData.sgst}%):`, 140, finalY);
    doc.text(`${symbol}${taxes.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, finalY, { align: "right" });

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

    doc.save(`GST_Invoice_${invoiceData.invoiceNumber}.pdf`);
  };

  const generateWord = () => {
    const subtotal = calculateSubtotal();
    const taxes = calculateTax();
    const total = subtotal + taxes.totalTax;
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
                        new TextRun({ text: "GST INVOICE", bold: true, size: 48, color: "FFFFFF" }),
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
                    children: [new TextRun({ text: `Invoice #: ${invoiceData.invoiceNumber}`, bold: true, size: 20 })],
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

    // Supplier / Recipient Section
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
                  new Paragraph({ children: [new TextRun({ text: "SUPPLIER DETAILS", bold: true, size: 22, color: "0047AB" })] }),
                  new Paragraph({ children: [new TextRun({ text: invoiceData.senderName || "Business Name", bold: true, size: 20 })] }),
                  new Paragraph({ children: [new TextRun({ text: `GSTIN: ${invoiceData.senderGstin}`, size: 18 })] }),
                  new Paragraph({ children: [new TextRun({ text: invoiceData.senderAddress || "Address", color: "808080", size: 18 })] }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ children: [new TextRun({ text: "RECIPIENT DETAILS", bold: true, size: 22, color: "0047AB" })] }),
                  new Paragraph({ children: [new TextRun({ text: invoiceData.clientName || "Client Name", bold: true, size: 20 })] }),
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
              new TableCell({ shading: { fill: "0047AB" }, children: [new Paragraph({ children: [new TextRun({ text: "HSN/SAC", bold: true, color: "FFFFFF" })] })], alignment: AlignmentType.CENTER }),
              new TableCell({ shading: { fill: "0047AB" }, children: [new Paragraph({ children: [new TextRun({ text: "Qty", bold: true, color: "FFFFFF" })] })], alignment: AlignmentType.CENTER }),
              new TableCell({ shading: { fill: "0047AB" }, children: [new Paragraph({ children: [new TextRun({ text: "Rate (Rs.)", bold: true, color: "FFFFFF" })] })], alignment: AlignmentType.RIGHT }),
              new TableCell({ shading: { fill: "0047AB" }, children: [new Paragraph({ children: [new TextRun({ text: "Total (Rs.)", bold: true, color: "FFFFFF" })] })], alignment: AlignmentType.RIGHT }),
            ],
          }),
          ...invoiceData.items.map(item => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(item.description)] }),
              new TableCell({ children: [new Paragraph(item.hsn || "-")], alignment: AlignmentType.CENTER }),
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
        children: [new TextRun({ text: `Taxable Value: ${symbol}${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, size: 20 })],
        alignment: AlignmentType.RIGHT,
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `CGST (${invoiceData.cgst}%): ${symbol}${taxes.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, size: 20 })],
        alignment: AlignmentType.RIGHT,
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `SGST (${invoiceData.sgst}%): ${symbol}${taxes.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, size: 20 })],
        alignment: AlignmentType.RIGHT,
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Grand Total: ${symbol}${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, bold: true, size: 24, color: "0047AB" })],
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
      saveAs(blob, `GST_Invoice_${invoiceData.invoiceNumber}.docx`);
    });
  };

  const handleFinalizeAR = async () => {
    if (!invoiceData.party_id || !invoiceData.ar_label_id || !invoiceData.revenue_label_id) {
      toast.error("Please select a registered client and ledger buckets (AR/Revenue)");
      return;
    }

    try {
      setLoading(true);
      const totalAmount = calculateTotal();
      const subtotal = calculateSubtotal();
      const taxes = calculateTax();

      const payload = {
        workbench_id: activeWorkbenchId,
        party_id: invoiceData.party_id,
        invoice_number: invoiceData.invoiceNumber,
        amount: totalAmount,
        issue_date: invoiceData.date,
        due_date: invoiceData.date, // Default to same day if not specified
        description: invoiceData.notes || `Invoice ${invoiceData.invoiceNumber}`,
        items_json: invoiceData.items,
        revenue_label_id: invoiceData.revenue_label_id,
        ar_label_id: invoiceData.ar_label_id,
        doc_id: sourceDoc?.id,
        metadata: {
          cgst: taxes.cgst,
          sgst: taxes.sgst,
          tax_rate: invoiceData.taxRate,
          subtotal: subtotal
        }
      };

      await backendService.createInvoice(payload);
      toast.success("Invoice successfully recorded in AR Ledger");
      navigate(-1); // Go back to workbench
    } catch (err) {
      console.error("Error creating invoice:", err);
      toast.error(err.message || "Failed to record invoice");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax().totalTax;
  };

  return (
    <div className={`min-h-screen py-24 px-6 md:px-12 ${theme === "dark" ? "bg-black text-white" : "bg-gray-50 text-gray-900"
      }`}>
      <div className="max-w-4xl mx-auto">
        <Link to="/templates" className="flex items-center gap-2 text-[#81E6D9] mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Templates
        </Link>

        <div className={`rounded-3xl border p-8 md:p-12 ${theme === "dark" ? "bg-[#111] border-white/10" : "bg-white border-gray-200 shadow-xl"
          }`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div>
                <h1 className="text-3xl font-bold">GST Invoice Generator</h1>
                <p className="text-sm opacity-60 mt-2">Generate GST-compliant tax invoices for India</p>
                {wbContext.workbenches.length > 1 && (
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Workbench:</span>
                    <select 
                      value={activeWorkbenchId} 
                      onChange={(e) => setActiveWorkbenchId(e.target.value)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${theme === "dark" ? "bg-white/5 border-white/10 text-teal-400" : "bg-gray-50 border-gray-200"}`}
                    >
                      {wbContext.workbenches.map(wb => <option key={wb.id} value={wb.id}>{wb.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4">
                {activeWorkbenchId && (
                  <button
                    onClick={handleFinalizeAR}
                    disabled={loading}
                    className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all shadow-xl border border-white/20"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    <span>{loading ? "Recording..." : "Finalize & Record AR"}</span>
                  </button>
                )}
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
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">Supplier (You)</h2>
              <input type="text" name="senderName" placeholder="Business Name" value={invoiceData.senderName} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
              <input type="text" name="senderGstin" placeholder="Your GSTIN" value={invoiceData.senderGstin} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
              <input type="text" name="senderCin" placeholder="Your CIN (Optional)" value={invoiceData.senderCin} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
              <textarea name="senderAddress" placeholder="Address" value={invoiceData.senderAddress} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
            </div>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">Recipient (Client)</h2>
              {fromWorkbench ? (
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Select Registered Client</label>
                  <select 
                    value={invoiceData.party_id}
                    onChange={(e) => handlePartySelect(e.target.value)}
                    className={`w-full p-3 rounded-xl border font-bold ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`}
                  >
                    <option value="" className={theme === "dark" ? "bg-[#111] text-white" : "bg-white text-black"}>Choose a party...</option>
                    {wbContext.parties.map(p => (
                      <option 
                        key={p.id} 
                        value={p.id} 
                        className={theme === "dark" ? "bg-[#111] text-white" : "bg-white text-black"}
                      >
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <input type="text" name="clientName" placeholder="Client Name" value={invoiceData.clientName} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
              )}
              <input type="text" name="clientGstin" placeholder="Client GSTIN" value={invoiceData.clientGstin} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
              <input type="text" name="clientCin" placeholder="Client CIN (Optional)" value={invoiceData.clientCin} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
              <textarea name="clientAddress" placeholder="Address" value={invoiceData.clientAddress} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
            </div>
          </div>

          {fromWorkbench && (
            <div className="mb-12 bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
              <h2 className="text-lg font-semibold border-b border-white/10 pb-2 flex items-center gap-2">
                <Building className="w-5 h-5 text-teal-400" /> Ledger Bucket Connection
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">AR Asset Bucket</label>
                  <select 
                    required
                    value={invoiceData.ar_label_id}
                    name="ar_label_id"
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-xl border font-bold ${theme === "dark" ? "bg-white/10 border-white/20 text-white" : "bg-gray-50 border-gray-200"}`}
                  >
                    <option value="" className={theme === "dark" ? "bg-[#111] text-white" : "bg-white text-black"}>Select Customer Vessel...</option>
                    {(wbContext.entities || [])
                      .filter(e => e.party_id === invoiceData.party_id)
                      .map(e => (
                        <option 
                          key={e.id} 
                          value={e.label_id}
                          className={theme === "dark" ? "bg-[#111] text-white" : "bg-white text-black"}
                        >
                          {e.name} (Shadow Vessel)
                        </option>
                      ))}
                    {/* Fallback for manual selection if needed */}
                    <option disabled className="text-gray-500">--- Other Assets ---</option>
                    {wbContext.labels.filter(l => l.type === 'asset' && !l.is_shadow).map(l => (
                      <option 
                        key={l.id} 
                        value={l.id}
                        className={theme === "dark" ? "bg-[#111] text-white" : "bg-white text-black"}
                      >
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Revenue Income Bucket</label>
                  <select 
                    required
                    value={invoiceData.revenue_label_id}
                    name="revenue_label_id"
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-xl border font-bold ${theme === "dark" ? "bg-white/10 border-white/20 text-white" : "bg-gray-50 border-gray-200"}`}
                  >
                    <option value="" className={theme === "dark" ? "bg-[#111] text-white" : "bg-white text-black"}>Select Revenue...</option>
                    {wbContext.labels.filter(l => l.type === 'revenue' || l.type === 'income').map(l => (
                      <option 
                        key={l.id} 
                        value={l.id}
                        className={theme === "dark" ? "bg-[#111] text-white" : "bg-white text-black"}
                      >
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="mb-12">
            <h2 className="text-lg font-semibold border-b pb-4 mb-6">GST Rates</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 opacity-70">CGST (%)</label>
                <input type="number" name="cgst" value={invoiceData.cgst} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 opacity-70">SGST (%)</label>
                <input type="number" name="sgst" value={invoiceData.sgst} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-lg font-semibold border-b pb-4 mb-6">Items (INR)</h2>
            <div className="space-y-4">
              {invoiceData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="col-span-full md:col-span-4">
                    <label className="block text-xs font-medium mb-1 opacity-70">Description / Service</label>
                    {activeWorkbenchId ? (
                      <div className="flex flex-col gap-2">
                        <select
                          name="inventory_select"
                          onChange={(e) => handleItemChange(index, e)}
                          className={`w-full p-3 rounded-xl border font-bold text-xs ${theme === "dark" ? "bg-white/5 border-white/10 text-teal-400" : "bg-gray-50 border-gray-200"}`}
                        >
                          <option value="" className={theme === "dark" ? "bg-[#111] text-white" : "bg-white text-black"}>
                            {wbContext.inventory.length > 0 ? "-- Select from Inventory --" : "-- No items in inventory --"}
                          </option>
                          {wbContext.inventory.map(inv => (
                            <option key={inv.id} value={inv.id} className={theme === "dark" ? "bg-[#111] text-white" : "bg-white text-black"}>
                              {inv.name} (Stock: {inv.current_stock || 0})
                            </option>
                          ))}
                        </select>
                        <input 
                          type="text" 
                          name="description" 
                          placeholder="Or type manual description..."
                          value={item.description} 
                          onChange={(e) => handleItemChange(index, e)} 
                          className={`w-full p-2 rounded-lg border text-sm ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} 
                        />
                      </div>
                    ) : (
                      <input type="text" name="description" value={item.description} onChange={(e) => handleItemChange(index, e)} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
                    )}
                  </div>
                  <div className="col-span-full md:col-span-2">
                    <label className="block text-xs font-medium mb-1 opacity-70">HSN/SAC</label>
                    <input type="text" name="hsn" value={item.hsn} onChange={(e) => handleItemChange(index, e)} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
                  </div>
                  <div className="col-span-full md:col-span-2">
                    <label className="block text-xs font-medium mb-1 opacity-70">Qty</label>
                    <input type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
                  </div>
                  <div className="col-span-full md:col-span-3">
                    <label className="block text-xs font-medium mb-1 opacity-70">Rate (₹)</label>
                    <input type="number" name="price" value={item.price} onChange={(e) => handleItemChange(index, e)} className={`w-full p-3 rounded-xl border ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
                  </div>
                  <div className="col-span-full md:col-span-1 pb-3 text-center">
                    <button onClick={() => setInvoiceData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))} className="text-red-500 hover:text-red-400 transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
              <button onClick={addItem} className="text-[#81E6D9] font-semibold hover:underline flex items-center gap-2 transition-all"><Plus className="w-4 h-4" /> Add Item</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

