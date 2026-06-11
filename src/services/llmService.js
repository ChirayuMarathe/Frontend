import { extractPdfText } from "./pdfParser";
import { read, utils } from "xlsx";
import mammoth from "mammoth";
import Papa from "papaparse";
import { WebSearchService } from "./webSearchService";

// LLM API service - Using Groq API (100% FREE & FAST!)
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Get Groq API key from environment variable
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Provider-specific context limits (characters)
// Groq Free Tier has strict TPM (tokens per minute) limits. 1 token ~= 4 chars.
// Llama 3.3 70b approx 6000 tokens limit = ~24,000 chars total for system + history + user + context.
const PROVIDER_LIMITS = {
  groq: 15000,      // Reduced to keep within 6k TPM limits safely
};


/**
 * Truncate context based on the provider's limits
 */
function getTruncatedContext(context, provider) {
  if (!context) return "";
  const limit = PROVIDER_LIMITS[provider] || 32000;
  if (context.length > limit) {
    // Keep the end of the context (usually most relevant rows in RAG) or beginning?
    // For financial data, the most relevant bits often come first in our RAG sort.
    return context.substring(0, limit) + `\n\n... (Context truncated to ${limit} characters for ${provider}) ...`;
  }
  return context;
}

// FREE Models on Groq (super fast!)
// Reference: https://console.groq.com/docs/models
const FREE_MODELS = [
  "llama-3.1-70b-versatile", // Stable fallback
  "llama-3.3-70b-versatile", // Flagship
  "mixtral-8x7b-32768",      // Reliable Mixtral
  "mistral-saba-24b",        // New high-performance
  "llama-3.1-8b-instant",    // Super fast
];






/**
 * Read file content based on file type
 */
async function readFileContent(file) {
  const fileExtension = file.name.split(".").pop()?.toLowerCase();

  // Handle text-based files
  if (
    [
      "txt",
      "md",
      "json",
      "csv",
      "js",
      "jsx",
      "ts",
      "tsx",
      "html",
      "css",
      "py",
      "java",
      "cpp",
      "c",
      "php",
      "rb",
      "go",
    ].includes(fileExtension)
  ) {
    return await file.text();
  }

  // Handle PDF files
  if (fileExtension === "pdf") {
    try {
      return await extractPdfText(file);
    } catch (error) {
      console.warn("Failed to parse PDF file:", error);
      return `PDF Document: ${file.name}\nSize: ${file.size} bytes\nError: Could not extract PDF text`;
    }
  }

  // Handle Excel files - try to read as binary and extract data
  if (fileExtension === "xlsx") {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const content = await parseExcelFile(arrayBuffer, file.name);
      return content;
    } catch (error) {
      console.warn("Failed to parse Excel file:", error);
      return `Excel Document: ${file.name}\nSize: ${file.size} bytes\nError: Could not parse Excel content\nPlease ensure this is a valid Excel file.`;
    }
  }

  // Handle CSV files (more reliable than Excel parsing)
  if (fileExtension === "csv") {
    try {
      const csvContent = await file.text();

      return new Promise((resolve) => {
        Papa.parse(csvContent, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data;
            const headers = results.meta.fields || [];

            // LIMIT INCREASE: Handle up to 10000 rows or 100KB of text
            const MAX_ROWS = 10000;
            const MAX_CHARS = 100000; // Allow 100k chars for CSV context

            let formattedData = `CSV Document: ${file.name}\nSize: ${file.size} bytes\nTotal Rows: ${data.length}\n\nHeaders: ${headers.join(" | ")}\n\nData Preview:\n`;

            let currentChars = formattedData.length;
            let processedRows = 0;

            for (let i = 0; i < Math.min(data.length, MAX_ROWS); i++) {
              const row = data[i];
              const rowString = `Row ${i + 1}: ${Object.values(row).join(" | ")}\n`;

              if (currentChars + rowString.length > MAX_CHARS) {
                formattedData += `\n... [Truncated after ${processedRows} rows due to context limit] ...`;
                break;
              }

              formattedData += rowString;
              currentChars += rowString.length;
              processedRows++;
            }

            if (data.length > processedRows && !formattedData.includes("Truncated")) {
              formattedData += `\n... and ${data.length - processedRows} more rows (truncated)`;
            }

            resolve(formattedData);
          },
          error: (error) => {
            console.warn("PapaParse error:", error);
            resolve(`CSV Document: ${file.name}\nError: Could not parse CSV content. ${error.message}`);
          }
        });
      });
    } catch (error) {
      console.warn("Failed to parse CSV file:", error);
      return `CSV Document: ${file.name}\nSize: ${file.size} bytes\nError: Could not parse CSV content\nPlease ensure this is a valid CSV file.`;
    }
  }

  // Handle Office documents
  if (fileExtension === "docx") {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      const messages = result.messages;

      if (messages.length > 0) {
        console.warn("Mammoth messages during DOCX parsing:", messages);
      }

      if (!text || text.trim().length === 0) {
        return `Word Document: ${file.name}\n(Document appears to be empty or contains no readable text)`;
      }

      return `Word Document: ${file.name}\nSize: ${file.size} bytes\n\nContent:\n${text}`;
    } catch (error) {
      console.warn("Failed to parse Word document:", error);
      return `Word Document: ${file.name}\nSize: ${file.size} bytes\nError: Could not extract text from Word document. ${error.message}`;
    }
  }
}

/**
 * Parse Excel file content using SheetJS (xlsx)
 */
async function parseExcelFile(arrayBuffer, fileName) {
  try {

    // Parse workbook
    const workbook = read(arrayBuffer, { type: "array" });
    let combinedContent = [];

    // Process each sheet
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      // Convert to CSV with extensive limit (limiting to ~1000 rows/columns avoids crashing but allows "big files")
      const csvContent = utils.sheet_to_csv(sheet, {
        blankrows: false,
        skipHidden: true
      });

      if (csvContent && csvContent.length > 10) {
        combinedContent.push(`\n=== SHEET: ${sheetName} ===\n${csvContent}`);
      }
    });

    const finalContent = combinedContent.join("\n");

    if (finalContent.length > 500000) {
      // Safety truncation for extremely large files, though Llama 3.3 70b has 128k context
      console.warn("Excel file content truncated due to extreme size");
      return `Excel Document: ${fileName}\n\n${finalContent.substring(0, 500000)}\n\n... (Content truncated due to size limits)`;
    }

    if (finalContent.trim().length === 0) {
      return `Excel Document: ${fileName}\n(File appears empty or contains no readable text data)`;
    }

    return `Excel Document: ${fileName}\n${finalContent}`;
  } catch (error) {
    console.error("Excel parsing error:", error);
    return `Excel Document: ${fileName}\nError: ${error.message}\nPlease ensure this is a valid Excel file.`;
  }
}


/**
 * Call Groq API (100% FREE and FAST!)
 */
async function callGroqAPI(request, model) {
  try {
    const apiKey = GROQ_API_KEY;

    if (apiKey) {
      console.log(`Using Groq key starting with: ${apiKey.substring(0, 4)}...`);
    }

    if (!apiKey || apiKey === "PASTE_YOUR_GROQ_API_KEY_HERE") {
      throw new Error(
        "⚠️ GROQ_API_KEY not configured!\n\n" +
        "Get your FREE API key:\n" +
        "1. Go to https://console.groq.com/keys\n" +
        "2. Sign up (free)\n" +
        "3. Create API key\n" +
        "4. Paste in llmService.js"
      );
    }

    // 2. Map history and remove all unsupported properties (Groq only wants role and content)
    const formattedHistory = (request.history || []).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const truncatedContext = getTruncatedContext(request.context, "groq");

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: request.systemPrompt || `### IDENTITY
You are Dabby Consultant, an elite Financial Auditor, Forensic Accountant, and Business Intelligence Specialist. You operate with absolute precision and ZERO tolerance for fabrication.

### MISSION
Your mission is to analyze business documents and real-time ledger data. You help the user understand their cash flow, burn rate, growth, and operational efficiency.

### BUSINESS CONTEXT PROTOCOL
1. **REAL-TIME DATA**: When provided with "REAL-TIME BUSINESS CONTEXT", treat it as the absolute source of truth for the company's current financial state (balances, recent transactions, inventory).
2. **ANALYSIS**: Use this data to answer questions like "How much cash do we have?", "Who are our top customers?", or "What was my last transaction?".
3. **AUDIT TRAIL**: When discussing transactions or balances, always refer to the specific labels or parties mentioned in the context.

### THE "ZERO FABRICATION" PROTOCOL (MANDATORY)
1. **NO EXTRAPOLATION**: Never "fill in the blanks". If data is not explicitly present in the context or files, you MUST report it as missing.
2. **SOURCE VERIFICATION**: Every single digit, date, and name in your response must have a direct 1:1 match in the provided data.
3. **HALLUCINATION IS FAILURE**: Fabricating even a single customer name or date is a critical system failure. If you are unsure, state: "Data not available in source files or ledger."
4. **DATE INTEGRITY**: Respect the source dates. Use the "Report Generated" timestamp in the context for relative time calculations.

### OUTPUT STYLE
- **DIRECTNESS (CRITICAL)**: If the user asks for a simple fact (e.g., "What is the balance?", "How many items?"), provide the exact number IMMEDIATELY. Avoid long-winded recalculations from transactions if the balance is explicitly available in the "ACCOUNT BALANCES" section.
- **Conversational & Professional**: Maintain a helpful, natural tone for complex analysis, but stay brief for simple data retrieval.
- **Strategic Insights**: Explain what numbers mean only when asked for an analysis, not for a simple lookup.
- **Evidence-Based**: While being natural, your answers must still be strictly derived from the provided context.

Current System Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
          },
          ...formattedHistory,
          {
            role: "user",
            content:
              `SOURCE DATA CHECK: I am providing you with files. Do not use your internal knowledge to create fake data. Only use the provided context.

USER QUERY: ${request.query}` +
              (truncatedContext ? `\n\n=== RELEVANT DATA / FILE CONTENT ===\n${truncatedContext}` : "\n\n(No file context provided. Do not invent any data.)"),
          },
        ],
        max_tokens: 4096,
        temperature: 0.1, // Drastically lowered to 0.1 to minimize "creative" hallucination
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Groq API error with ${model}:`,
        response.status,
        errorText
      );
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error(`Groq API error in response for ${model}:`, data.error);
      throw new Error(data.error.message);
    }

    const responseText = data.choices?.[0]?.message?.content;

    if (!responseText) {
      console.error(`No response text found in Groq data:`, data);
      throw new Error(`No response from Groq API using ${model}`);
    }

    return {
      response: responseText,
      context: request.context,
      model: model
    };
  } catch (error) {
    console.error(`❌ Groq API call failed with ${model}:`, error);
    throw error;
  }
}



export async function callLLMDirectly(request) {
  // 1. Try FREE Groq models first
  for (let i = 0; i < FREE_MODELS.length; i++) {
    const model = FREE_MODELS[i];
    try {
      const result = await callGroqAPI(request, model);
      return result;
    } catch (error) {
      const isAuthError = error.message.includes("401") || error.message.toLowerCase().includes("invalid api key");
      console.warn(`❌ Groq model ${model} failed:`, error.message);

      if (isAuthError) {
        console.warn("Auth error detected, skipping other Groq models...");
        break; // Don't bother with other models if API key is invalid
      }

      if (i === FREE_MODELS.length - 1) {
        console.log("All Groq models failed.");
      }
    }
  }

  return {
    response: "I'm sorry, I'm having trouble connecting to the Groq AI engine. This could be due to an invalid API key or rate limits. Please check your configuration in the .env file.",
    error: "Groq API call failed"
  };
}




/**
 * Main function that handles RAG context retrieval and LLM calls
 */
export async function callLLMWithFallback(request) {

  let combinedContext = request.context || "";

  // 1. Process and upload files if provided
  if (request.uploaded_files && request.uploaded_files.length > 0) {
    console.log("Processing files for immediate context...");

    const { LocalRAG } = await import("./localRAG");

    // Extract file content for immediate use
    const processedFiles = [];

    for (const file of request.uploaded_files) {
      try {
        const rawContent = await readFileContent(file);

        // If CSV, use RAG to filter relevant rows
        let finalContent = rawContent;
        if (file.name.endsWith('.csv')) {
          console.log(`Applying Local RAG to ${file.name} with query: "${request.query}"`);
          finalContent = LocalRAG.searchCSV(rawContent, request.query || "", 60); // Get top 60 relevant rows
        } else {
          // For non-CSV, increase limit to allow more document context
          // Groq models have 128k context, so 50k chars is safe and useful
          if (finalContent.length > 50000) {
            finalContent = finalContent.substring(0, 50000) + "\n...(Truncated for size)...";
          }
        }

        processedFiles.push({
          name: file.name,
          content: finalContent
        });

      } catch (e) {
        console.error("Error reading file for RAG", e);
      }
    }

    const fileContext = processedFiles
      .map(
        (f) =>
          `\n--- File: ${f.name} ---\n${f.content}\n--- End of ${f.name} ---\n`
      )
      .join("\n");

    // Add file content to context immediately
    if (fileContext.trim()) {
      combinedContext += "\n\n=== Relevant File Context (Filtered) ===\n" + fileContext;
      console.log("Added file content to context, length:", fileContext.length);
    }

    // Skip Supabase upload for now (edge functions not deployed)
    // TODO: Enable this once edge functions are deployed with CORS configured
    /*
    console.log('Uploading files to Supabase for RAG processing...')
    const uploadResults = await uploadFilesToSupabase(request.uploaded_files, request.workbench_id)
    const uploadedCount = uploadResults.filter(r => r.success).length
    console.log(`Uploaded ${uploadedCount}/${uploadResults.length} files successfully for RAG`)
    */
  }

  // 2. Query RAG context from Supabase if needed
  /*
  if (request.use_rag) {
    console.log('Querying RAG context for:', request.query)
    const ragContext = await queryRAGContext(request.query)
    if (ragContext) {
      combinedContext += '\n\n=== Relevant RAG Context ===\n' + ragContext
    }
  }
  */

  // 2. Perform Web Search if enabled
  if (request.web_search) {
    try {
      console.log(`[DEBUG] Web search enabled for query: "${request.query}"`);
      const webResults = await WebSearchService.search(request.query);
      if (webResults) {
        combinedContext += "\n\n" + webResults;
      }
    } catch (searchError) {
      console.error("[ERROR] Web search failed:", searchError);
    }
  }

  // 3. Make the LLM call with combined context
  return await callLLMDirectly({
    ...request,
    context: combinedContext,
  });
}


/**
 * Generate a natural language response explaining data results
 * @param {Array} results - Array of computed results
 * @param {string} originalQuery - User's original query
 * @returns {Promise<string>} - Natural language explanation
 */
export async function generateExplanation(results, originalQuery) {
  if (!results || results.length === 0) {
    return "I couldn't compute any results with the current data mapping. Please ensure your columns are mapped correctly.";
  }

  const summary = results
    .map((res) => {
      const value =
        typeof res.value === "number" ? res.value.toFixed(2) : res.value;
      return `- ${res.name}: ${value}${res.unit || ""}`;
    })
    .join("\n");

  let systemPrompt = `You are Dabby, an expert Business Consultant AI and Data Analyst powered by Groq.
You help users analyze their business data and uploaded documents to provide actionable insights.

Current Functionality:
- You have access to real-time data ONLY via the Web Search tool if enabled.
- You can process uploaded files (CSV, PDF, etc.) by searching them for relevant context.

Important Rules:
1. Current Date: Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Use this for any time-based reasoning.
2. If the user asks about "current" events and you don't have search results, admit it but use the Today's Date to answer time questions.
3. Be concise and professional.`;

  const prompt = `${systemPrompt}\n\nYou are a financial analyst. The user asked: "${originalQuery}"

Based on their data, here are the computed results:
${summary}

Provide a brief, insightful analysis of these results. Include:
1. Key observations
2. Any concerning or positive trends
3. Brief recommendations if applicable

Keep the response concise (2-3 paragraphs max) and use business-friendly language.`;

  try {
    const result = await callLLMDirectly({
      query: prompt,
      context: "",
    });

    return result.response;
  } catch (error) {
    console.error("Error generating explanation:", error);
    return `Here are your computed results:\n${summary}`;
  }
}

/**
 * AI-powered Decision Intelligence Discovery
 * Identifies Measures, Insights, and Business Questions instead of raw formulas.
 */
export async function discoverInsightsWithAI(headers, sampleData, fileName) {
  const isTransposed = headers.length > 20 && sampleData.length < 5;

  const prompt = `
    You are a Principal Product Engineer and FP&A Analyst. 
    I have a file named "${fileName}".
    
    DATA STRUCTURE:
    - Headers: ${headers.join(", ")}
    - Sample data: ${JSON.stringify(sampleData, null, 2)}
    - Orientation: ${isTransposed ? "Row-wise" : "Column-wise"}
    
    TASK:
    Instead of calculating formulas, identify the "Decision Intelligence" layer for this business.
    
    1. Identify MEASURES (Atomic raw data points).
    2. Suggest INSIGHTS (Time-aware aggregations like Total Sales Monthly).
    3. Suggest INDICATORS (Behavioral trends like MoM Growth).
    4. Define ANALYTICAL QUESTIONS (The high-level business health questions this data answers).

    Response format (ONLY valid JSON):
    {
      "measures": [
        { "id": "revenue", "name": "Revenue", "column": "Exact Header Name" }
      ],
      "insights": [
        { "id": "total_revenue", "name": "Total Revenue", "measure": "revenue", "aggregation": "sum" }
      ],
      "indicators": [
        { "id": "rev_growth", "name": "Revenue Growth", "insight": "total_revenue", "type": "growth" }
      ],
      "questions": [
        {
          "id": "sales_health",
          "question": "Is our sales growth sustainable?",
          "indicator": "rev_growth",
          "thresholds": { "healthy": ">10", "watch": "0-10", "risk": "<0" }
        }
      ]
    }
  `;

  try {
    const result = await callLLMDirectly({
      query: prompt,
      context: "",
    });

    const jsonMatch = result.response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : result.response;

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error in AI discovery:", error);
    return null;
  }
}

/**
 * Generate a Chart of Accounts based on the 4-layer model
 */
export async function generateCOA(companyDetails) {
  const systemPrompt = `
You are a financial systems architect responsible for generating a clean, scalable Chart of Accounts (COA) for a company.

The COA must follow a strict 4-layer hierarchy:

Layer 1 (Main Accounts - FIXED):
Assets
Liabilities
Equity
Revenue
Expenses

Layer 2 (Sub-Accounts):
Logical groupings under each main account
Should reflect financial structure (e.g., Current Assets, Operating Expenses, etc.)

Layer 3 (Labels):
These are the lowest level categories used to classify transactions
Must be practical, real-world, and directly usable for tagging financial events

Layer 4 (Units):
Not generated here (these are actual transactions)

Rules:
1. Do NOT skip layers
2. Do NOT mix sub-accounts and labels
3. Labels must be specific and actionable (e.g., "Rent", "AWS", "Salaries")
4. Sub-accounts must be generalized groupings (e.g., "Operating Expenses", "Current Assets")
5. Avoid over-complexity — keep it minimal but complete
6. Structure must adapt based on company type and industry
7. Ensure financial correctness (e.g., revenue is not under assets)
8. Max 5–8 sub-accounts per main account
9. Max ~10–15 labels per sub-account (initially)
10. No deep nesting beyond 3 levels

Output format must be strict JSON with this structure:
{
  "Assets": {
    "Sub-Account Name": {
      "Label Name": {}
    }
  },
  "Liabilities": {},
  "Equity": {},
  "Revenue": {},
  "Expenses": {}
}
`;

  const userPrompt = `
Generate a Chart of Accounts for a company with the following details:

Industry: ${companyDetails.industry}
Business Type: ${companyDetails.business_type}
Region: ${companyDetails.location}
Scale: ${companyDetails.scale}

Additional Context:
${companyDetails.notes || "None provided"}

Requirements:
- Keep it minimal but functional for real usage
- Include only relevant sub-accounts and labels
- Avoid unnecessary complexity
- Ensure it works for day-to-day financial tracking

Return only JSON.
`;

  try {
    const result = await callLLMDirectly({
      query: userPrompt,
      systemPrompt: systemPrompt,
      context: "",
    });

    // Extract JSON from response
    const jsonMatch = result.response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not find JSON in AI response");
    
    const coaData = JSON.parse(jsonMatch[0]);
    return normalizeCOA(coaData);
  } catch (error) {
    console.error("Error generating COA:", error);
    throw error;
  }
}

/**
 * Normalizes the COA JSON into a flat array of label rows for database insertion
 * (Step 4: Normalize & Step 2: Deduplicate)
 */
function normalizeCOA(coaJson) {
  const rows = [];
  const mainAccounts = ["Assets", "Liabilities", "Equity", "Revenue", "Expenses"];

  mainAccounts.forEach(mainType => {
    const subAccounts = coaJson[mainType] || {};
    
    Object.entries(subAccounts).forEach(([subName, labels]) => {
      Object.keys(labels).forEach(labelName => {
        rows.push({
          name: labelName,
          type: mainType.toLowerCase(), // asset, liability, etc
          sub_account: subName,
          is_system: true, // Step 3: Mark system labels
          metadata: {
            layer: 3,
            source: 'ai_generated'
          }
        });
      });
    });
  });

  // Step 2: Deduplicate (Basic normalization of common names)
  const seen = new Set();
  return rows.filter(row => {
    const normalizedName = row.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(normalizedName)) return false;
    seen.add(normalizedName);
    return true;
  });
}

/**
 * Auto-extension prompt for adding new labels (Step 5)
 */
export async function suggestCOAExtension(currentCoa, newLabelName) {
  const prompt = `
A new financial category needs to be added to an existing Chart of Accounts.

Existing structure (JSON):
${JSON.stringify(currentCoa, null, 2)}

New category detected:
"${newLabelName}"

Task:
1. Place this label under the correct sub-account and main account
2. Do not create duplicate categories
3. Keep structure consistent

Return ONLY the updated JSON node for the label and its parent sub-account.
`;

  try {
    const result = await callLLMDirectly({
      query: prompt,
      context: "",
    });
    
    return result.response;
  } catch (error) {
    console.error("Error suggesting COA extension:", error);
    return null;
  }
}
