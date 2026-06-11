/**
 * Data Ingestion Service
 *
 * Handles CSV file upload, parsing, and column mapping workflows.
 * Supports streaming parsing for large CSV files.
 */

import Papa from "papaparse";
import * as XLSX from "xlsx";
import { supabase } from "../lib/supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Upload and ingest a CSV file (Step 6)
 * Uses Storage-first approach to bypass Edge Function payload limits
 *
 * @param {File} file - The CSV file to upload
 * @param {Object} mapping - Column map to apply during ingestion
 * @param {string} workbenchId - Optional context ID for dashboard metrics
 * @returns {Promise<{success: boolean, dataset?: object, error?: string}>}
 */
export async function uploadCSVFile(file, mapping = {}, workbenchId = null) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) throw new Error("You must be logged in to upload files");

    const userId = session.user.id;
    const fileExt = file.name.slice((Math.max(0, file.name.lastIndexOf(".")) || Infinity)).toLowerCase() || ".csv";
    const secureFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}${fileExt}`;
    const storagePath = `${userId}/${secureFileName}`;

    // 1. Upload raw file to Supabase Storage Bucket ('raw_imports')
    const { error: uploadError } = await supabase.storage
      .from('raw_imports')
      .upload(storagePath, file, { cacheControl: '3600', upsert: false });
    if (uploadError) throw uploadError;

    // 2. Trigger asynchronous background ingestion worker
    const response = await fetch(`${SUPABASE_URL}/functions/v1/financial-ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        storagePath: storagePath,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type || "text/csv",
        mapping: mapping,
        workbenchId: workbenchId,
        timestamp: new Date().toISOString()
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || "Failed to trigger ingestion worker");
    }

    return {
      success: true,
      dataset: result.dataset,
      message: "Processing started successfully"
    };
  } catch (error) {
    console.error("CSV upload error:", error);
    return {
      success: false,
      error: error.message || "Failed to upload CSV file",
    };
  }
}

/**
 * Parse CSV file locally (without uploading)
 * Useful for preview and column detection
 *
 * @param {File} file - The CSV file to parse
 * @param {Object} options - Parsing options
 * @param {boolean} options.previewOnly - If true, only parse first 100 rows (default: true)
 * @param {function} options.onProgress - Progress callback (rowsProcessed, totalEstimate)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function parseCSVLocally(file, options = {}) {
  const { previewOnly = true, onProgress = null } = options;
  const fileExt = file.name.slice((Math.max(0, file.name.lastIndexOf(".")) || Infinity)).toLowerCase();

  try {
    // Route to correct parser based on file type
    if (fileExt === '.xlsx' || fileExt === '.xls') {
      return await parseExcelLocally(file, options);
    }

    // For preview mode or small files, use simple parsing
    if (previewOnly || file.size < 5 * 1024 * 1024) {
      // 5MB threshold
      return await parseCSVSimple(file, previewOnly ? 100 : null, onProgress);
    }

    // For large files in full mode, use streaming parser
    return await parseCSVStreaming(file, onProgress);
  } catch (error) {
    console.error("CSV parse error:", error);
    return {
      success: false,
      error: error.message || "Failed to parse CSV file",
    };
  }
}

/**
 * Simple CSV parsing for small files or preview mode
 */
async function parseCSVSimple(file, maxRows = null, onProgress = null) {
  const content = await file.text();
  const lines = content.split(/\r?\n/).filter((line) => line.trim());

  if (lines.length === 0) {
    throw new Error("CSV file is empty");
  }

  // Parse headers
  const headers = parseCSVLine(lines[0]);
  const totalLines = lines.length - 1;

  // Parse data rows
  const limit = maxRows ? Math.min(maxRows + 1, lines.length) : lines.length;
  const dataLines = lines.slice(1, limit);
  const rows = [];

  dataLines.forEach((line, index) => {
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = idx < values.length ? values[idx] : ""; // Handle missing columns
    });
    rows.push(row);

    // Report progress every 1000 rows
    if (onProgress && index % 1000 === 0) {
      onProgress(index, totalLines);
    }
  });

  if (onProgress) {
    onProgress(rows.length, totalLines);
  }

  // Detect column types using samples from different positions
  const columns = headers.map((header) => {
    const sanitizedName = sanitizeColumnName(header);
    // Sample from start, middle, and end for better type detection
    const sampleIndices = [
      0,
      5,
      10,
      Math.floor(rows.length / 2),
      rows.length - 1,
    ].filter((i) => i >= 0 && i < rows.length);
    const samples = sampleIndices.map((i) => rows[i]?.[header]).filter(Boolean);
    const typeDetection = detectColumnType(samples, header);

    return {
      name: sanitizedName,
      originalName: header,
      type: typeDetection.type,
      confidence: typeDetection.confidence,
      sampleValues: samples.slice(0, 3),
      suggestedField: null,
    };
  });

  return {
    success: true,
    data: {
      columns,
      rows,
      rowCount: totalLines,
      parsedRowCount: rows.length,
      filename: file.name,
      isPartial: maxRows !== null && totalLines > maxRows,
    },
  };
}

/**
 * Excel Parsing for preview and detection using SheetJS
 */
async function parseExcelLocally(file, options) {
  const { previewOnly = true } = options;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        
        if (jsonRows.length === 0) {
          throw new Error("Excel file is empty");
        }

        // Headers are first row
        const headers = jsonRows[0].map(h => String(h).trim());
        const dataLines = jsonRows.slice(1);
        const totalLines = dataLines.length;

        const limit = previewOnly ? Math.min(100, totalLines) : totalLines;
        const processLines = dataLines.slice(0, limit);

        const rows = processLines.map(line => {
          const row = {};
          headers.forEach((header, idx) => {
            row[header] = idx < line.length ? line[idx] : "";
          });
          return row;
        });

        // Detect column types
        const columns = headers.map((header) => {
          const sanitizedName = sanitizeColumnName(header);
          const sampleIndices = [
            0,
            5,
            10,
            Math.floor(rows.length / 2),
            rows.length - 1,
          ].filter((i) => i >= 0 && i < rows.length);
          const samples = sampleIndices.map((i) => rows[i]?.[header]).filter(Boolean);
          const typeDetection = detectColumnType(samples, header);

          return {
            name: sanitizedName,
            originalName: header,
            type: typeDetection.type,
            confidence: typeDetection.confidence,
            sampleValues: samples.slice(0, 3),
            suggestedField: null,
          };
        });

        resolve({
          success: true,
          data: {
            columns,
            rows,
            rowCount: totalLines,
            parsedRowCount: rows.length,
            filename: file.name,
            isPartial: previewOnly && totalLines > 100,
          },
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Streaming CSV parsing for large files using Papa Parse
 * Processes file in chunks to avoid memory issues
 */
export function parseCSVStreaming(file, onProgress = null) {
  return new Promise((resolve, reject) => {
    const rows = [];
    let headers = [];
    let rowCount = 0;
    const estimatedRows = Math.floor(file.size / 100); // Rough estimate

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // We handle type conversion ourselves
      chunk: (results, parser) => {
        if (headers.length === 0 && results.meta.fields) {
          headers = results.meta.fields;
        }

        rows.push(...results.data);
        rowCount += results.data.length;

        if (onProgress) {
          onProgress(rowCount, estimatedRows);
        }

        // Memory safety: if we've parsed too many rows, abort and warn
        if (rows.length > 500000) {
          parser.abort();
          console.warn(
            "CSV parsing aborted: file too large for client-side processing"
          );
        }
      },
      complete: () => {
        // Generate column info
        const columns = headers.map((header) => {
          const sanitizedName = sanitizeColumnName(header);
          // Sample from different positions for type detection
          const sampleIndices = [
            0,
            10,
            50,
            Math.floor(rows.length / 2),
            rows.length - 1,
          ].filter((i) => i >= 0 && i < rows.length);
          const samples = sampleIndices
            .map((i) => rows[i]?.[header])
            .filter(Boolean);
          const typeDetection = detectColumnType(samples, header);

          return {
            name: sanitizedName,
            originalName: header,
            type: typeDetection.type,
            confidence: typeDetection.confidence,
            sampleValues: samples.slice(0, 3),
            suggestedField: null,
          };
        });

        if (onProgress) {
          onProgress(rowCount, rowCount);
        }

        resolve({
          success: true,
          data: {
            columns,
            rows,
            rowCount: rowCount,
            parsedRowCount: rows.length,
            filename: file.name,
            isPartial: rows.length >= 500000,
          },
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

/**
 * Sanitize column name for SQL
 */
function sanitizeColumnName(name) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .replace(/^\d/, "col_$&") || "column"
  );
}

/**
 * Detect column type from sample values
 * Types to detect: currency, numeric, date, text, percentage, account_code, transaction_id
 * Returns object with { type, confidence }
 */
function detectColumnType(samples, columnName = "") {
  if (samples.length === 0) return { type: "text", confidence: 1.0 };

  const nameUpper = columnName.toUpperCase();
  const validSamples = samples.filter((s) => s != null && s !== "");

  if (validSamples.length === 0) return { type: "text", confidence: 1.0 };

  // 1. Transaction ID Detect
  if (nameUpper.includes("ID") || nameUpper.includes("REF")) {
    const isTransId = validSamples.every((s) => /^[A-Za-z0-9_-]{5,}$/.test(String(s).trim()));
    if (isTransId) return { type: "transaction_id", confidence: 0.95 };
  }

  // 2. Account Code Detect
  if (nameUpper.includes("ACCOUNT") || nameUpper.includes("CODE")) {
    const isAccount = validSamples.every((s) => /^\d{3,6}$/.test(String(s).trim()));
    if (isAccount) return { type: "account_code", confidence: 0.9 };
  }

  // 3. Currency Detect
  const currencyPattern = /^[₹$€£¥]\s*[\d,]+\.?\d*|^-?[\d,]+\.?\d*\s*[₹$€£¥]$/; // matches ₹100, 100 ₹, $100
  const isCurrency = validSamples.every((s) => currencyPattern.test(String(s).trim()));
  if (isCurrency || nameUpper.includes("AMOUNT") || nameUpper.includes("PRICE") || nameUpper.includes("COST")) {
    // If it has currency symbols, high confidence. If it just has numeric values but column name implies currency, medium confidence.
    const numericPattern = /^-?[\d,]+\.?\d*$/;
    const isNumeric = validSamples.every((s) => {
      const cleaned = String(s).replace(/[$€£¥₹,\s]/g, "");
      return numericPattern.test(cleaned);
    });
    if (isCurrency) return { type: "currency", confidence: 0.95 };
    if (isNumeric) return { type: "currency", confidence: 0.85 };
  }

  // 4. Percentage Detect
  const percentPattern = /^-?[\d,]+\.?\d*\s*%$/;
  const isPercent = validSamples.every((s) => percentPattern.test(String(s).trim()));
  if (isPercent || nameUpper.includes("PERCENT") || nameUpper.includes("RATE")) {
    const numericPattern = /^-?[\d,]+\.?\d*$/;
    const isNumeric = validSamples.every((s) => {
      const cleaned = String(s).replace(/[%,\s]/g, "");
      return numericPattern.test(cleaned);
    });
    if (isPercent) return { type: "percentage", confidence: 0.95 };
    if (isNumeric) return { type: "percentage", confidence: 0.8 };
  }

  // 5. Numeric Detect
  const numericPattern = /^-?[\d,]+\.?\d*$/;
  const isNumeric = validSamples.every((s) => {
    const cleaned = String(s).replace(/[$€£¥₹%,\s]/g, ""); // strip common noise
    return numericPattern.test(cleaned);
  });
  if (isNumeric) return { type: "numeric", confidence: 0.9 };

  // 6. Date Detect
  // Regex supports ISO, MM/DD/YYYY, DD-MM-YYYY, DD MMM YYYY
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2}))?$/, // ISO 8601
    /^\d{1,2}\/\d{1,2}\/\d{2,4}$/, // 12/31/2024
    /^\d{1,2}-\d{1,2}-\d{2,4}$/, // 31-12-2024
    /^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/, // 01 Mar 2026
  ];
  const isDate = validSamples.every((s) => {
    const str = String(s).trim();
    return datePatterns.some((pattern) => pattern.test(str)) || !isNaN(Date.parse(str));
  });
  
  if (isDate || nameUpper.includes("DATE")) {
    if (isDate) return { type: "date", confidence: 0.9 };
    return { type: "date", confidence: 0.7 }; // name matched but parsed weirdly
  }

  // 7. Text Fallback
  return { type: "text", confidence: 1.0 };
}

/**
 * Get all datasets for current user
 */
export async function getUserDatasets() {
  try {
    let query = supabase
      .from("user_datasets")
      .select("*")
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      datasets: data || [],
    };
  } catch (error) {
    console.error("Error fetching datasets:", error);
    return {
      success: false,
      datasets: [],
      error: error.message,
    };
  }
}

/**
 * Get a specific dataset by ID
 */
export async function getDataset(datasetId) {
  try {
    const { data, error } = await supabase
      .from("user_datasets")
      .select("*")
      .eq("id", datasetId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Dataset not found");

    return {
      success: true,
      dataset: data,
    };
  } catch (error) {
    console.error("Error fetching dataset:", error);
    return {
      success: false,
      dataset: null,
      error: error.message,
    };
  }
}

/**
 * Save column mapping for a dataset
 */
export async function saveColumnMapping(
  datasetId,
  mapping,
  mappingName = null
) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("You must be logged in");
    }

    // Check if mapping already exists for this dataset
    // Use maybeSingle() because it's perfectly normal for it not to exist yet
    const { data: existing, error: checkError } = await supabase
      .from("column_mappings")
      .select("id")
      .eq("dataset_id", datasetId)
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      // Update existing mapping
      const { data, error } = await supabase
        .from("column_mappings")
        .update({
          mapping: mapping,
          mapping_name: mappingName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .maybeSingle();

      if (error) throw error;

      return { success: true, mapping: data };
    } else {
      // Create new mapping
      const { data, error } = await supabase
        .from("column_mappings")
        .insert({
          dataset_id: datasetId,
          user_id: user.id,
          mapping: mapping,
          mapping_name: mappingName,
          is_default: true,
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      return { success: true, mapping: data };
    }
  } catch (error) {
    console.error("Error saving mapping:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get column mapping for a dataset
 */
export async function getColumnMapping(datasetId) {
  try {
    const { data, error } = await supabase
      .from("column_mappings")
      .select("*")
      .eq("dataset_id", datasetId)
      .eq("is_default", true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return {
      success: true,
      mapping: data || null,
    };
  } catch (error) {
    console.error("Error fetching mapping:", error);
    return {
      success: false,
      mapping: null,
      error: error.message,
    };
  }
}

/**
 * Delete a dataset and its associated data
 */
export async function deleteDataset(datasetId) {
  try {
    const { error } = await supabase
      .from("user_datasets")
      .delete()
      .eq("id", datasetId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error deleting dataset:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export default {
  uploadCSVFile,
  parseCSVLocally,
  getUserDatasets,
  getDataset,
  saveColumnMapping,
  getColumnMapping,
  deleteDataset,
};
