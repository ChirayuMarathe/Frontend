import { supabase, supabaseAdmin } from "../lib/supabase";

/**
 * Backend Service (Frontend-Only Edition)
 * 
 * All operations go through Supabase client directly.
 * No backend server required.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const backendService = {
  /**
   * Creates a manual record (transaction, compliance, budget, or party)
   */
  async createRecord(workbenchId, recordType, summary, metadata) {
    const { data, error } = await supabase
      .from('workbench_records')
      .insert({
        workbench_id: workbenchId,
        record_type: recordType,
        summary,
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating record:', error);
      throw error;
    }
    return data;
  },

  /**
   * Pushes a financial adjustment
   */
  async pushAdjustment(workbenchId, originalRecordId, adjustmentType, reason, metadata) {
    const { data, error } = await supabase
      .from('workbench_records')
      .insert({
        workbench_id: workbenchId,
        record_type: 'adjustment',
        summary: reason,
        metadata: {
          ...metadata,
          original_record_id: originalRecordId,
          adjustment_type: adjustmentType
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error pushing adjustment:', error);
      throw error;
    }
    return data;
  },

  /**
   * Uploads and initiates document processing
   */
  async uploadDocument(workbenchId, file, documentType, transactionId = null) {
    // 1. Upload to storage first
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${workbenchId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("Doc_vault_Raw")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Register document in database
    try {
      const docPayload = {
        workbench_id: workbenchId,
        transaction_id: transactionId,
        filename: file.name,
        file_path: filePath,
        file_size: file.size || 0,
        mime_type: file.type || 'application/octet-stream',
        document_type: documentType,
        status: 'processed'
      };

      console.log('[DEBUG] Attempting to register document:', docPayload);

      const { data, error } = await supabase
        .from('workbench_documents')
        .insert(docPayload)
        .select()
        .single();

      if (error) {
        console.error('CRITICAL: Failed to register document in workbench_documents:', error);
        throw new Error(`Database registration failed: ${error.message}`);
      }

      console.log('Document successfully registered in workbench_documents:', data);

      return data;
    } catch (err) {
      console.warn('Post-upload processing failed:', err);
      // We don't throw here as the file is already uploaded
      return { file_path: filePath };
    }
  },

  /**
   * Creates a new workbench and assigns the current user as founder
   */
  async createWorkbench(name, booksStartDate, description = null, extraData = {}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // 1. Create the workbench using admin client to bypass RLS
    const { data: workbench, error: wbError } = await supabaseAdmin
      .from('workbenches')
      .insert({
        name,
        books_start_date: booksStartDate,
        owner_user_id: user.id,
        ...extraData
      })
      .select()
      .single();

    if (wbError) throw new Error(wbError.message || 'Failed to create workbench');

    // 2. Add the creator as a founder member using admin client to bypass RLS
    const { error: memberError } = await supabaseAdmin
      .from('workbench_members')
      .insert({
        workbench_id: workbench.id,
        user_id: user.id,
        role: 'founder'
      });

    if (memberError) {
      console.error('Failed to add founder member:', memberError);
    }

    return workbench;
  },

  /**
   * Saves a chat message and updates the session
   * Falls back to direct insert if edge function is unavailable
   */
  async saveChatMessage(sessionId, role, content, metadata, workbenchId = null) {
    try {
      const { data, error } = await supabase.functions.invoke('save-chat-message', {
        body: {
          session_id: sessionId,
          role,
          content,
          metadata,
          workbench_id: workbenchId
        }
      });

      if (error) {
        console.warn('Edge Function Error (save-chat-message), falling back to direct insert:', error.message || error);
        return await this._saveChatMessageDirect(sessionId, role, content, metadata);
      }

      if (data && data.error) {
        console.warn('Edge Function returned error, falling back:', data.error);
        return await this._saveChatMessageDirect(sessionId, role, content, metadata);
      }

      return data;
    } catch (err) {
      console.warn('Failed to call save-chat-message, falling back to direct insert:', err.message);
      return await this._saveChatMessageDirect(sessionId, role, content, metadata);
    }
  },

  /**
   * AI-powered transaction categorization via Groq directly
   */
  async aiCategorize(description, labels) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a financial categorization assistant. Given a transaction description and a list of available labels, return the best matching label name. Respond with ONLY the label name, nothing else.'
            },
            {
              role: 'user',
              content: `Transaction: "${description}"\n\nAvailable labels: ${labels.map(l => l.name || l).join(', ')}\n\nWhich label best fits this transaction? Reply with ONLY the label name.`
            }
          ],
          max_tokens: 50,
          temperature: 0.1
        })
      });

      if (!response.ok) throw new Error('AI categorization failed');
      const data = await response.json();
      const suggestedLabel = data.choices?.[0]?.message?.content?.trim();
      return { suggested_label: suggestedLabel };
    } catch (err) {
      console.error('AI categorization failed:', err);
      return { suggested_label: null };
    }
  },

  /**
   * Direct insert fallback for saving chat messages
   */
  async _saveChatMessageDirect(sessionId, role, content, metadata) {
    console.log(`[DEBUG] Falling back to direct chat_messages insert for session ${sessionId}...`);
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role,
        content: (content || '').substring(0, 50000),
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('[ERROR] Direct chat message insert failed:', error);
      throw error;
    }
    return data;
  },

  /**
   * Creates a new chat session
   * Falls back to direct insert if edge function is unavailable
   */
  async createChatSession(title, workbenchId = null) {
    try {
      const { data, error } = await supabase.functions.invoke('create-chat-session', {
        body: {
          title,
          workbench_id: workbenchId
        }
      });

      if (error) {
        console.warn('Edge Function Error (create-chat-session), falling back to direct insert:', error.message || error);
        return await this._createChatSessionDirect(title, workbenchId);
      }

      // Edge function may return error in body
      if (data && data.error) {
        console.warn('Edge Function returned error, falling back:', data.error);
        return await this._createChatSessionDirect(title, workbenchId);
      }

      return data;
    } catch (err) {
      console.warn('Failed to call create-chat-session edge function, falling back to direct insert:', err.message);
      return await this._createChatSessionDirect(title, workbenchId);
    }
  },

  /**
   * Direct insert fallback for chat session creation
   * Used when edge function is unavailable or returns errors
   */
  async _createChatSessionDirect(title, workbenchId = null) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    console.log(`[DEBUG] Falling back to direct chat_sessions insert for user ${user.id}...`);
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: user.id,
        workbench_id: workbenchId || null,
        title: (title || 'Untitled Chat').substring(0, 200),
      })
      .select()
      .single();

    if (error) {
      console.error('[ERROR] Direct chat session insert failed:', error);
      throw error;
    }

    return data;
  },

  /**
   * Lists all transactions for a workbench
   */
  async listTransactions(workbenchId) {
    const { data, error } = await supabase
      .from('workbench_records')
      .select('*')
      .eq('workbench_id', workbenchId)
      .eq('record_type', 'transaction')
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch transactions');
    return data || [];
  },

  /**
   * Links an existing document to an existing transaction
   */
  async linkDocumentToTransaction(docId, transactionId) {
    const { data, error } = await supabase
      .from('workbench_documents')
      .update({ transaction_id: transactionId })
      .eq('id', docId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Confirms a record and creates ledger entries
   */
  async confirmRecord(recordId) {
    try {
      const { data, error } = await supabase.functions.invoke('confirm-record', {
        body: { record_id: recordId }
      });

      if (error) {
        console.error('Edge Function Error (confirm-record):', error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error('Failed to call confirm-record:', err);
      throw err;
    }
  },

  /**
   * Runs the reconciliation engine for a workbench
   */
  async runReconciliation(workbenchId) {
    try {
      const { data, error } = await supabase.functions.invoke('run-reconciliation', {
        body: { workbench_id: workbenchId }
      });

      if (error) {
        console.error('Edge Function Error (run-reconciliation):', error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error('Failed to call run-reconciliation:', err);
      throw err;
    }
  },

  /**
   * Fetches the health status and intelligence metrics for a workbench
   */
  async getWorkbenchIntelligence(workbenchId) {
    try {
      const { data, error } = await supabase.functions.invoke('get-intelligence', {
        body: { workbench_id: workbenchId }
      });

      if (error) {
        console.error('Edge Function Error (get-intelligence):', error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error('Failed to call get-intelligence:', err);
      throw err;
    }
  },

  async createSubscriptionLink(planId, customer = {}) {
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          plan_id: planId,
          total_count: 12,
          customer_notify: 1,
          customer
        }
      });
      if (error) {
        console.error('Edge Function Error (create-subscription):', error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error('Failed to call create-subscription:', err);
      throw err;
    }
  },

  // --- Inventory System ---

  async createInventoryItem(itemData) {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(itemData)
      .select()
      .single();

    if (error) throw new Error(error.message || 'Failed to create item');
    return data;
  },

  async recordStockPurchase(purchaseData) {
    const { data, error } = await supabase
      .from('inventory_movements')
      .insert({
        ...purchaseData,
        movement_type: 'purchase'
      })
      .select()
      .single();

    if (error) throw new Error(error.message || 'Failed to record purchase');
    return data;
  },

  async recordStockSale(saleData) {
    const { data, error } = await supabase
      .from('inventory_movements')
      .insert({
        ...saleData,
        movement_type: 'sale'
      })
      .select()
      .single();

    if (error) throw new Error(error.message || 'Failed to record sale');
    return data;
  },

  // --- AR System ---

  async listInvoices(workbenchId) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('workbench_id', workbenchId)
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch invoices');
    return data || [];
  },

  async createInvoice(invoiceData) {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (error) throw new Error(error.message || 'Failed to create invoice');
    return data;
  },

  async scanInvoice(docId) {
    // Get the document to read its content
    const { data: doc, error: docError } = await supabase
      .from('workbench_documents')
      .select('*')
      .eq('id', docId)
      .single();

    if (docError) throw new Error('Failed to fetch document for scanning');

    // Use Groq to extract invoice data
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an invoice data extractor. Given document metadata, extract invoice details. Return ONLY valid JSON with fields: vendor_name, invoice_number, invoice_date, due_date, total_amount, line_items (array of {description, quantity, unit_price, amount}).'
            },
            {
              role: 'user',
              content: `Extract invoice data from this document: ${JSON.stringify(doc)}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.1
        })
      });

      if (!response.ok) throw new Error('AI scanning failed');
      const result = await response.json();
      const content = result.choices?.[0]?.message?.content;
      const jsonMatch = content?.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (err) {
      console.error('Invoice scan failed:', err);
      return {};
    }
  },

  async recordPayment(invoiceId, paymentData) {
    const { data, error } = await supabase
      .from('invoice_payments')
      .insert({
        invoice_id: invoiceId,
        ...paymentData
      })
      .select()
      .single();

    if (error) throw new Error('Failed to record payment');
    return data;
  },

  async getARMetrics(workbenchId) {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('workbench_id', workbenchId);

    if (error) throw new Error('Failed to fetch AR metrics');

    const totalReceivable = (invoices || []).reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const overdueCount = (invoices || []).filter(inv => 
      inv.status !== 'paid' && new Date(inv.due_date) < new Date()
    ).length;

    return {
      total_receivable: totalReceivable,
      overdue_count: overdueCount,
      invoice_count: (invoices || []).length
    };
  },

  // --- AP System ---

  async listBills(workbenchId) {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('workbench_id', workbenchId)
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch bills');
    return data || [];
  },

  async createBill(billData) {
    const { data, error } = await supabase
      .from('bills')
      .insert(billData)
      .select()
      .single();

    if (error) throw new Error(error.message || 'Failed to record bill');
    return data;
  },

  async recordBillPayment(billId, paymentData) {
    const { data, error } = await supabase
      .from('bill_payments')
      .insert({
        bill_id: billId,
        ...paymentData
      })
      .select()
      .single();

    if (error) throw new Error('Failed to record payment');
    return data;
  },

  async getAPMetrics(workbenchId) {
    const { data: bills, error } = await supabase
      .from('bills')
      .select('*')
      .eq('workbench_id', workbenchId);

    if (error) throw new Error('Failed to fetch AP metrics');

    const totalPayable = (bills || []).reduce((sum, bill) => sum + (bill.total_amount || 0), 0);
    const overdueCount = (bills || []).filter(bill =>
      bill.status !== 'paid' && new Date(bill.due_date) < new Date()
    ).length;

    return {
      total_payable: totalPayable,
      overdue_count: overdueCount,
      bill_count: (bills || []).length
    };
  },

  async scanInvoiceDoc(workbenchId, file) {
    const doc = await this.uploadDocument(workbenchId, file, 'AP_Bill');
    if (!doc.id) throw new Error("Document upload failed to return ID");
    const extracted = await this.scanInvoice(doc.id);
    return { ...extracted, doc_id: doc.id };
  },

  async getDocumentUrl(filePath) {
    const { data, error } = await supabase.storage
      .from("Doc_vault_Raw")
      .createSignedUrl(filePath, 3600);
    if (error) throw error;
    return data.signedUrl;
  },

  async downloadDocument(filePath, filename) {
    const { data, error } = await supabase.storage
      .from("Doc_vault_Raw")
      .download(filePath);
    if (error) throw error;
    
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  async deleteDocument(docId, filePath) {
    const { error: storageError } = await supabase.storage
      .from("Doc_vault_Raw")
      .remove([filePath]);
    if (storageError) console.warn("Storage deletion warning:", storageError);

    const { error: dbError } = await supabase
      .from('workbench_documents')
      .delete()
      .eq('id', docId);
    if (dbError) throw dbError;
    return true;
  },

  // --- Task Management ---

  async listTasks(workbenchId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('workbench_id', workbenchId)
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch tasks');
    return data || [];
  },

  async createTask(taskData) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) throw new Error('Failed to create task');
    return data;
  },

  async updateTask(taskId, updateData) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw new Error('Failed to update task');
    return data;
  },

  async deleteTask(taskId) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw new Error('Failed to delete task');
    return { success: true };
  },

  async listWorkbenchMembers(workbenchId) {
    const { data, error } = await supabase
      .from('workbench_members')
      .select('*, profiles(*)')
      .eq('workbench_id', workbenchId);

    if (error) throw new Error('Failed to fetch members');
    return data || [];
  },

  async listWorkbenchEntities(workbenchId) {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('workbench_id', workbenchId);

    if (error) throw new Error('Failed to fetch entities');
    return data || [];
  },

  // --- Budgets ---

  async getBudgetPerformance(workbenchId) {
    const { data, error } = await supabase
      .from('view_budget_vs_actual')
      .select('*')
      .eq('workbench_id', workbenchId);

    if (error) throw new Error('Failed to fetch budget performance');
    return data || [];
  },

  async getBudgetTransactions(workbenchId, category) {
    const { data, error } = await supabase
      .from('workbench_records')
      .select('*')
      .eq('workbench_id', workbenchId)
      .eq('record_type', 'transaction')
      .ilike('metadata->>category', category)
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch clubbed transactions');
    return data || [];
  }
};
