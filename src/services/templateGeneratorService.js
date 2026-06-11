/**
 * templateGeneratorService.js
 *
 * Calls Groq to generate context-aware, structured JSON data for financial templates.
 * Layout and schema belong to the frontend; only DATA comes from the AI.
 */

const MODEL = "llama-3.3-70b-versatile";
const FALLBACK_MODEL = "llama-3.1-8b-instant";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// ─── Schema Prompts ─────────────────────────────────────────────────────────
// Each template has its own tight JSON schema.
// The AI generates realistic values; the frontend handles calculations + layout.

const SYSTEM_PROMPT = `You are a financial template data generator. Given a user request, generate realistic and contextually appropriate financial data. Always respond with ONLY valid JSON — no markdown fences, no explanations. Numbers must be plain numbers (no currency symbols).`;

const SCHEMA_PROMPTS = {
  quotation_template: (prompt) => `
Generate structured data for a business quotation based on: "${prompt}"

Return ONLY this JSON (no other text):
{
  "client_name": "string",
  "project": "string",
  "prepared_date": "DD MMM YYYY",
  "validity_days": number,
  "items": [
    {
      "description": "string",
      "qty": number,
      "unit": "string (e.g. pcs, sqft, hrs, months, units)",
      "unit_price": number,
      "tax_percent": 18
    }
  ]
}

Rules:
- items must directly relate to the user's request context (e.g. roofing → roofing materials, website → web services)
- Include 3-5 realistic items
- unit_price in INR (no symbols)`,

  invoice_template: (prompt) => `
Generate structured data for a business invoice based on: "${prompt}"

Return ONLY this JSON (no other text):
{
  "client_name": "string",
  "invoice_no": "INV-XXXX",
  "invoice_date": "DD MMM YYYY",
  "due_date": "DD MMM YYYY",
  "items": [
    {
      "description": "string",
      "qty": number,
      "unit": "string",
      "unit_price": number,
      "tax_percent": 18
    }
  ]
}

Rules:
- items must reflect the user's request domain
- Include 3-4 realistic line items
- unit_price in INR (no symbols)`,

  receivables_tracker: (prompt) => `
Generate structured data for an accounts receivable tracker based on: "${prompt}"

Return ONLY this JSON (no other text):
{
  "company": "string (the user's company name, inferred from context or generic)",
  "summary": {
    "total_receivable": number,
    "overdue_amount": number,
    "pending_count": number
  },
  "invoices": [
    {
      "id": "INV-XXXX",
      "customer": "string",
      "amount": number,
      "issue_date": "DD MMM",
      "due_date": "DD MMM",
      "status": "Paid|Pending|Overdue",
      "notes": "string"
    }
  ]
}

Rules:
- Generate 5 invoices with a mix of Paid, Pending, Overdue
- Amounts in INR numbers (no symbols)
- Reflect the business context from the prompt`,

  payables_tracker: (prompt) => `
Generate structured data for an accounts payable tracker based on: "${prompt}"

Return ONLY this JSON (no other text):
{
  "summary": {
    "total_payable": number,
    "overdue_bills": number,
    "due_this_week": number
  },
  "vendors": [
    {
      "vendor": "string",
      "invoice_no": "string",
      "amount": number,
      "issue_date": "DD MMM",
      "due_date": "DD MMM",
      "status": "Paid|Pending|Overdue",
      "method": "NEFT|Cheque|Credit Card|Auto-debit|UPI"
    }
  ]
}

Rules:
- Generate 5 vendor entries with mixed statuses
- Vendors should reflect the business domain from the prompt`,

  expense_tracker: (prompt) => `
Generate structured data for a business expense tracker based on: "${prompt}"

Return ONLY this JSON (no other text):
{
  "month": "string (e.g. March 2026)",
  "total_budget": number,
  "summary": {
    "total_spent": number,
    "remaining": number,
    "category_count": number
  },
  "expenses": [
    {
      "date": "DD MMM",
      "category": "string",
      "description": "string",
      "amount": number,
      "paid_by": "Credit Card|Cash|Bank Transfer|Reimbursement|UPI",
      "receipt": "Uploaded|Pending|✓"
    }
  ]
}

Rules:
- Generate 5-6 expense entries relevant to the business domain
- Categories should match the context (e.g. construction → Materials, Equipment Rental)`,

  cashflow_tracker: (prompt) => `
Generate structured data for a cashflow planner based on: "${prompt}"

Return ONLY this JSON (no other text):
{
  "company": "string",
  "summary": {
    "cash_on_hand": number,
    "monthly_burn": number,
    "runway_months": number
  },
  "months": [
    {
      "label": "Month Year",
      "inflows": number,
      "outflows": number,
      "is_forecast": false
    },
    {
      "label": "Month Year (Fcst.)",
      "inflows": number,
      "outflows": number,
      "is_forecast": true
    }
  ]
}

Rules:
- Generate 3 historical + 2 forecast months
- Numbers in INR (no symbols)
- Amounts should be realistic for the business type in prompt`,

  profit_loss: (prompt) => `
Generate structured data for a Profit & Loss statement based on: "${prompt}"

Return ONLY this JSON (no other text):
{
  "company": "string",
  "summary": {
    "fy_revenue": number,
    "net_profit": number,
    "profit_margin_pct": number
  },
  "quarters": [
    {
      "name": "Q1",
      "revenue": number,
      "cost_of_goods": number,
      "salaries": number,
      "marketing": number,
      "general_admin": number
    }
  ]
}

Rules:
- Generate all 4 quarters Q1-Q4
- Numbers in lakhs (e.g. 1800000 for ₹18L) 
- Business context from prompt should influence the revenue scale`,

  budget_planner: (prompt) => `
Generate structured data for a budget planner based on: "${prompt}"

Return ONLY this JSON (no other text):
{
  "year": "2026",
  "summary": {
    "total_budget": number,
    "total_spent": number,
    "used_pct": number
  },
  "departments": [
    {
      "name": "string",
      "budget": number,
      "spent": number
    }
  ]
}

Rules:
- Generate 4-5 departments relevant to the business type in the prompt
- Numbers in INR (no symbols)`,

  sales_tracker: (prompt) => `
Generate structured data for a sales tracker based on: "${prompt}"

Return ONLY this JSON (no other text):
{
  "period": "string (e.g. March 2026)",
  "summary": {
    "total_pipeline": number,
    "closed_revenue": number,
    "avg_conversion_pct": number
  },
  "team": [
    {
      "name": "string",
      "leads": number,
      "deals_closed": number,
      "revenue": number
    }
  ]
}

Rules:
- Generate 4-5 sales reps with Indian names
- Revenue numbers in INR (no symbols)
- Business context from prompt should influence the sales figures`,

  inventory_tracker: (prompt) => `
Generate structured data for an inventory tracker based on: "${prompt}"

Return ONLY this JSON (no other text):
{
  "summary": {
    "total_skus": number,
    "low_stock_items": number,
    "inventory_value": number
  },
  "items": [
    {
      "sku": "SKU-XXX",
      "name": "string",
      "in_stock": number,
      "reorder_point": number,
      "unit_cost": number
    }
  ]
}

Rules:
- Generate 5 inventory items relevant to the business domain from the prompt
- SKU format: SKU-001, SKU-002, etc.`,

  financial_model: (prompt) => `
Generate structured data for a financial model/projection based on: "${prompt}"

Return ONLY this JSON (no other text):
{
  "company": "string",
  "summary": {
    "npv": number,
    "irr": number,
    "payback_period": number
  },
  "years": [
    {
      "year": "YYYY",
      "revenue": number,
      "expenses": number,
      "ebitda": number
    }
  ]
}

Rules:
- Generate 3-5 years of projection
- Numbers in INR (no symbols)
- Reflect the business context from the prompt`,

  custom_template: (prompt) => `
Generate structured financial tracking data based on: "${prompt}"

Return ONLY this JSON (no other text):
{
  "title": "string (descriptive name for this tracker)",
  "rows": [
    {
      "category": "string",
      "description": "string",
      "amount": number,
      "date": "MMM YYYY",
      "status": "Confirmed|Pending|Paid|Due|Active",
      "notes": "string"
    }
  ]
}

Rules:
- Generate 5 rows that make sense for the request
- Be creative in creating a useful financial tracker for the described need`,
};

// ─── JSON Extraction ─────────────────────────────────────────────────────────

function extractJSON(text) {
  // 1. Try direct parse
  try { return JSON.parse(text.trim()); } catch (_) { }
  // 2. Strip markdown fences
  const fenceStripped = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  try { return JSON.parse(fenceStripped); } catch (_) { }
  // 3. Extract first {...}
  const match = fenceStripped.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch (_) { } }
  throw new Error("Could not extract valid JSON from AI response");
}

// ─── Groq API Call ───────────────────────────────────────────────────────────

async function callGroq(systemPrompt, userPrompt, model = MODEL) {
  if (!GROQ_API_KEY || GROQ_API_KEY === "PASTE_YOUR_GROQ_API_KEY_HERE") {
    throw new Error("LLM_CONFIG_ERROR: GROQ_API_KEY not configured in .env");
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 4096,
      temperature: 0.1
    })
  });

  if (!res.ok) {
    let errorText = "";
    try {
      const txt = await res.text();
      errorText = txt;
    } catch {}

    // Friendly error mapping
    if (res.status === 429 || /Free limit reached/i.test(errorText)) {
      throw new Error("LIMIT_REACHED: You have hit the free limit. Continue generating with Starter plans.");
    }
    if (res.status === 401 || /invalid api key/i.test(errorText)) {
      throw new Error("LLM_CONFIG_ERROR: Invalid or missing Groq API key.");
    }

    throw new Error(`Error ${res.status}: Failed to generate template`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from Groq API");
  return content;
}

// ─── Main Export ─────────────────────────────────────────────────────────────

/**
 * Generate structured JSON data from Groq for a given template type.
 * Retries once with a smaller fallback model if parsing fails.
 *
 * @param {string} userPrompt  - The raw user prompt
 * @param {string} templateKey - One of the 11 supported template keys
 * @returns {Promise<object>}  - Parsed JSON data object
 */
export async function generateTemplateData(userPrompt, templateKey) {
  const schemaFn = SCHEMA_PROMPTS[templateKey] ?? SCHEMA_PROMPTS.custom_template;
  const userMsg = schemaFn(userPrompt);

  // Attempt 1
  try {
    const raw = await callGroq(SYSTEM_PROMPT, userMsg, MODEL);
    return extractJSON(raw);
  } catch (err) {
    console.warn(`[templateGen] Attempt 1 failed (${MODEL}):`, err.message);
  }

  // Retry with fallback model
  try {
    const raw = await callGroq(SYSTEM_PROMPT, userMsg, FALLBACK_MODEL);
    return extractJSON(raw);
  } catch (err) {
    console.error(`[templateGen] Retry failed (${FALLBACK_MODEL}):`, err.message);
    // Show friendly auth message if applicable
    if (/^LIMIT_REACHED:/.test(err.message)) {
      throw new Error("You have hit the free limit. Continue generating with Starter plans.");
    }
    if (/^AUTH_REQUIRED:/.test(err.message)) {
      throw new Error("Please log in or sign up to generate spreadsheets."); // kept for backward compatibility
    }
    if (/^LLM_CONFIG_ERROR:/.test(err.message)) {
      throw new Error("Template engine is temporarily unavailable. Please try again shortly.");
    }
    throw new Error("Template generation failed. Please try again.");
  }
}
