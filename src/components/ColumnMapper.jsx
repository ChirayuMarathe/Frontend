import React, { useState, useMemo } from 'react';
import { ArrowRight, CheckCircle, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const REQUIRED_FIELDS_BASE = [
  { id: 'transaction_date', label: 'Transaction Date', type: 'date', req: true },
  { id: 'category', label: 'Category', type: 'text', req: false },
  { id: 'counterparty', label: 'Vendor/Client', type: 'text', req: false },
  { id: 'account', label: 'Account', type: 'account_code', req: false }
];

export default function ColumnMapper({ detectedColumns, previewRows, onSaveMapping, isProcessing }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // State maps [TargetSchemaFieldId] -> [SourceCSVColumnName]
  const [mapping, setMapping] = useState(() => {
    const initial = {};
    
    // Expanded dictionary of standard bank statement alias names
    const ALIASES = {
      'transaction_date': ['date', 'txn date', 'posting date', 'value date', 'time'],
      'amount': ['amount', 'amt', 'value', 'transaction amount', 'total'],
      'category': ['category', 'type', 'group', 'classification'],
      'counterparty': ['description', 'particulars', 'narration', 'vendor', 'payee', 'merchant', 'details', 'name', 'supplier', 'client', 'customer'],
      'account': ['account', 'acct', 'source', 'bank', 'wallet']
    };

    REQUIRED_FIELDS_BASE.forEach(field => {
      // 1. Try exact alias matching first
      const aliasMatch = detectedColumns.find(col => 
        ALIASES[field.id]?.some(alias => col.name.toLowerCase().includes(alias))
      );
      
      if (aliasMatch) {
         initial[field.id] = aliasMatch.originalName;
      } else {
        // 2. Fallback to basic label matching or high-confidence type matching
        const fallbackMatch = detectedColumns.find(col => 
            col.name.toLowerCase().includes(field.label.toLowerCase().split('/')[0])
            || (col.type === field.type && col.confidence > 0.9)
        );
        if (fallbackMatch) initial[field.id] = fallbackMatch.originalName;
      }
    });

    // Handle Amount vs Debit/Credit
    const amountCol = detectedColumns.find(c => ALIASES['amount'].some(a => c.name.toLowerCase().includes(a)));
    const debitCol = detectedColumns.find(c => c.name.toLowerCase().includes('debit') || c.name.toLowerCase() === 'dr' || c.name.toLowerCase() === 'withdrawal');
    const creditCol = detectedColumns.find(c => c.name.toLowerCase().includes('credit') || c.name.toLowerCase() === 'cr' || c.name.toLowerCase() === 'deposit');

    if (amountCol && !debitCol && !creditCol) {
      initial['amount'] = amountCol.originalName;
    } else {
      if (debitCol) initial['debit'] = debitCol.originalName;
      if (creditCol) initial['credit'] = creditCol.originalName;
    }

    return initial;
  });

  const isSplitAmount = useMemo(() => {
    return !!mapping.debit || !!mapping.credit || (!mapping.amount && detectedColumns.some(c => c.name.toLowerCase().includes('debit') || c.name.toLowerCase().includes('credit')));
  }, [mapping.debit, mapping.credit, mapping.amount, detectedColumns]);

  const activeFields = useMemo(() => {
    const fields = [...REQUIRED_FIELDS_BASE];
    // Insert amount fields at index 1
    if (isSplitAmount) {
      fields.splice(1, 0, 
        { id: 'debit', label: 'Debit (Out)', type: 'numeric', req: false },
        { id: 'credit', label: 'Credit (In)', type: 'numeric', req: false }
      );
    } else {
      fields.splice(1, 0, { id: 'amount', label: 'Amount', type: 'numeric', req: true });
    }
    return fields;
  }, [isSplitAmount]);

  const isFormValid = REQUIRED_FIELDS_BASE.filter(f => f.req).every(f => !!mapping[f.id]) && 
                      (mapping.amount || mapping.debit || mapping.credit);

  const runValidationPreview = useMemo(() => {
    if (!isFormValid || previewRows.length === 0) return null;
    
    let valid = 0;
    let errors = [];

    // Validating against preview rows (first 100 max)
    previewRows.forEach((row, i) => {
      let isRowValid = true;
      const dateVal = row[mapping.transaction_date];
      
      let amountVal = null;
      if (isSplitAmount) {
         amountVal = row[mapping.debit] || row[mapping.credit];
      } else {
         amountVal = row[mapping.amount];
      }

      if (!dateVal) { isRowValid = false; errors.push(`Row ${i+1}: Missing date`); }
      else if (isNaN(Date.parse(dateVal))) { isRowValid = false; errors.push(`Row ${i+1}: Invalid date format`); }

      if (!amountVal) { isRowValid = false; errors.push(`Row ${i+1}: Missing amount`); }
      else {
        const cleanAmt = String(amountVal).replace(/[$€£¥₹%,\s]/g, "");
        if (isNaN(Number(cleanAmt))) { isRowValid = false; errors.push(`Row ${i+1}: Invalid numeric amount`); }
      }

      if (isRowValid) valid++;
    });

    const validPct = Math.round((valid / previewRows.length) * 100);
    return { validPct, errors: errors.slice(0, 5) }; // show top 5 errors max in preview
  }, [mapping, previewRows, isFormValid]);

  return (
    <div className={`w-full max-w-4xl mx-auto rounded-2xl border overflow-hidden ${isDark ? "bg-[#111111] border-white/10" : "bg-white border-gray-200"}`}>
      <div className={`p-6 border-b ${isDark ? "border-white/10 bg-white/[0.02]" : "border-gray-100 bg-gray-50"}`}>
        <h2 className={`text-xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Map Your Columns</h2>
        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Match your uploaded file's columns to Datalis canonical financial fields.
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-4 font-semibold text-sm px-4">
          <div className={isDark ? "text-gray-400" : "text-gray-500"}>Datalis System Field</div>
          <div className="w-8"></div>
          <div className={`flex items-center justify-between ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            <span>Uploaded Column</span>
            <button 
              onClick={() => setMapping(prev => {
                const next = {...prev};
                if (isSplitAmount) {
                  delete next.debit; delete next.credit;
                } else {
                  delete next.amount;
                }
                return next;
              })}
              className="text-xs font-medium text-teal-600 dark:text-[#81E6D9] hover:underline"
            >
              {isSplitAmount ? "Use Single Amount" : "Use Debit/Credit"}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {activeFields.map(field => {
            const mappedCol = detectedColumns.find(c => c.originalName === mapping[field.id]);
            return (
              <div key={field.id} className={`grid grid-cols-[1fr_auto_1fr] gap-4 items-center p-4 rounded-xl border ${isDark ? "bg-[#161616] border-white/5" : "bg-white border-gray-100 shadow-sm"}`}>
                
                {/* System Field Side */}
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${field.req ? "bg-red-400" : "bg-gray-300 dark:bg-gray-600"}`} />
                  <div>
                    <p className={`font-semibold text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                      {field.label} {field.req && <span className="text-red-400 ml-1">*</span>}
                    </p>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Type: {field.type}</p>
                  </div>
                </div>

                <div className={`flex items-center justify-center ${isDark ? "text-gray-600" : "text-gray-300"}`}>
                  <ArrowRight className="w-5 h-5" />
                </div>

                {/* Select Source Side */}
                <div>
                  <select
                    value={mapping[field.id] || ""}
                    onChange={(e) => handleSelect(field.id, e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm appearance-none outline-none transition-all ${
                      isDark 
                        ? "bg-[#1e1e1e] border-white/10 text-white focus:border-[#81E6D9]/50" 
                        : "bg-gray-50 border-gray-200 text-gray-900 focus:border-[#0D9488]/50"
                    }`}
                  >
                    <option value="">-- Select Column --</option>
                    {detectedColumns.map(col => (
                      <option key={col.originalName} value={col.originalName}>
                        {col.originalName} • ({col.type})
                      </option>
                    ))}
                  </select>
                  {mappedCol && mappedCol.type !== field.type && mappedCol.type !== 'text' && (
                    <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Type mismatch warning
                    </p>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Validation Preview Ribbon */}
      {runValidationPreview && (
        <div className={`px-6 py-4 border-t ${isDark ? "border-white/10 bg-[#1a1a1a]" : "border-gray-100 bg-gray-50"}`}>
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              runValidationPreview.validPct >= 95 
                ? "bg-emerald-500/10 text-emerald-500" 
                : "bg-amber-500/10 text-amber-500"
            }`}>
              {runValidationPreview.validPct >= 95 ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                Validation Preview
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                  runValidationPreview.validPct >= 95 
                    ? "bg-emerald-500/10 text-emerald-500" 
                    : "bg-amber-500/10 text-amber-500"
                }`}>
                  {runValidationPreview.validPct}% Valid
                </span>
              </h4>
              <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Based on preview sample size ({previewRows.length} rows)
              </p>
              
              {runValidationPreview.errors.length > 0 && (
                <div className="mt-3 space-y-1">
                  {runValidationPreview.errors.map((err, i) => (
                    <p key={i} className={`text-[11px] ${isDark ? "text-red-400/80" : "text-red-500/80"}`}>• {err}</p>
                  ))}
                  <p className={`text-[10px] mt-1 italic ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    Download full validation report after ingestion to resolve invalid rows.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className={`p-6 border-t flex items-center justify-between ${isDark ? "border-white/10" : "border-gray-200"}`}>
        <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          Transaction Date and at least one Amount field must be mapped.
        </p>
        <button
          onClick={() => onSaveMapping(mapping)}
          disabled={!isFormValid || isProcessing}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            (!isFormValid || isProcessing)
              ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-white/5 dark:text-white/30"
              : isDark
                ? "bg-[#81E6D9] text-black hover:bg-[#5fd3c7] shadow-[0_0_20px_rgba(129,230,217,0.15)]"
                : "bg-[#0D9488] text-white hover:bg-[#0f766e] shadow-md hover:shadow-lg"
          }`}
        >
          {isProcessing ? (
            "Ingesting Data..." 
          ) : (
            <>
              <FileSpreadsheet className="w-4 h-4" />
              Ingest & Normalize
            </>
          )}
        </button>
      </div>
    </div>
  );
}
