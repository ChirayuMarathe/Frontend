# Dabby - AI Financial Consultant & Collaborative Workbench

Dabby is a state-of-the-art AI-powered financial consultant and collaborative workspace. It transforms raw financial documents (receipts, invoices, bills) into structured ledger entries, tracks budgets vs. actuals, manages inventory/receivables/payables, and provides real-time chat intelligence.

This repository contains the **Frontend-Only Edition** of the project, configured to interact directly with Supabase, Groq, and Tavily without requiring a local Python backend server for core operations.

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js**: `22.x` is recommended (specified in `package.json` engines).
- **npm**: Installed automatically with Node.js.

### 🛠️ Installation & Setup

1. **Install Dependencies**
   Run the following command in the project root directory:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root of the project:
   ```bash
   touch .env
   ```
   Add the following variables to your `.env` file:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
   
   # For Local Dev RLS Bypass (Admin Key)
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Recaptcha
   VITE_APP_RECAPTCHA_SITE_KEY=your-recaptcha-site-key

   # LLM & Search Services
   VITE_GROQ_API_KEY=your-groq-api-key
   VITE_TAVILY_API_KEY=your-tavily-api-key
   ```
   
   *Note: `.env` is ignored by git automatically, keeping credentials safe.*

---

## 💻 Running the Application

### Development Mode
Start the local development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
By default, the application will run at **[http://localhost:5175](http://localhost:5175)**.

### Production Build
To build the application for deployment:
```bash
npm run build
```
This generates the optimized, production-ready static bundle inside the `dist/` directory.

### Preview Build Locally
To preview your local production build:
```bash
npm run preview
```

### Linting
To check for code formatting and standard react/javascript lint errors:
```bash
npm run lint
```

---

## 🛠️ Architecture & Local Development

- **Supabase PKCE Auth**: Uses code-based OAuth callbacks (routed dynamically through `/oauth/callback`).
- **RLS Bypass (Dev Mode)**: Workbench creation uses the `supabaseAdmin` client (powered by the Service Role key) to insert initial workspace and membership records, bypassing any strict database row-level policies. Other CRUD actions check membership logs to authenticate transactions.
