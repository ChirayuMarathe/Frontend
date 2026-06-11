import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/build/pdf.mjs";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorker;

const DEFAULT_OPTIONS = {
  maxPages: 15,
  maxCharacters: 20000,
};

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return "unknown";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
}

export async function extractPdfText(file, options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const arrayBuffer = await file.arrayBuffer();
  
  let pdf;
  try {
    pdf = await getDocument({ data: arrayBuffer }).promise;
  } catch (error) {
    if (error.name === 'PasswordException') {
      return `PDF Document: ${file.name}\nError: This PDF is password protected and cannot be read.`;
    }
    throw error;
  }

  const pageLimit = Math.min(pdf.numPages, config.maxPages);
  let extractedText = [];
  let totalChars = 0;
  let hasAnyText = false;

  for (let pageNum = 1; pageNum <= pageLimit; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    
    if (content.items.length === 0) {
      extractedText.push(`--- Page ${pageNum} ---\n[Image-based or Empty Page]`);
      continue;
    }

    // Sort items by vertical position (top to bottom) then horizontal (left to right)
    const items = content.items.map(item => ({
      str: item.str || "",
      x: item.transform[4],
      y: item.transform[5],
      height: item.height
    }));

    // Group items by line (similar y coordinate)
    const lines = {};
    items.forEach(item => {
      // Round y to nearest integer to group items on the same line
      const y = Math.round(item.y);
      if (!lines[y]) lines[y] = [];
      lines[y].push(item);
    });

    // Sort lines by y (descending for PDF coordinate system)
    const sortedY = Object.keys(lines).sort((a, b) => b - a);
    
    let pageText = sortedY.map(y => {
      // Sort items within line by x (left to right)
      return lines[y]
        .sort((a, b) => a.x - b.x)
        .map(item => item.str)
        .join(" ");
    }).join("\n");

    pageText = pageText.trim();
    if (!pageText) {
      extractedText.push(`--- Page ${pageNum} ---\n[No readable text found]`);
      continue;
    }

    hasAnyText = true;
    const remainingChars = config.maxCharacters - totalChars;
    if (remainingChars <= 0) break;

    if (pageText.length > remainingChars) {
      pageText = pageText.slice(0, remainingChars) + "…";
    }

    extractedText.push(`--- Page ${pageNum} ---\n${pageText}`);
    totalChars += pageText.length;
  }

  const previewNotice =
    pdf.numPages > pageLimit
      ? `\n\n… ${pdf.numPages - pageLimit} additional page${
          pdf.numPages - pageLimit === 1 ? "" : "s"
        } not included in this preview.`
      : "";

  let resultPrefix = `PDF Document: ${file.name}\nPages: ${pdf.numPages}\nSize: ${formatFileSize(file.size)}\n`;
  
  if (!hasAnyText) {
    resultPrefix += `⚠️ WARNING: This PDF appears to be a scanned image or contains no extractable text layer. Please provide a text-based PDF or CSV for better results.\n\n`;
  } else {
    resultPrefix += `(Preview limited to ${config.maxPages} pages / ${config.maxCharacters} characters)\n\n`;
  }

  return `${resultPrefix}${extractedText.join("\n\n")}${previewNotice}`;
}
