import { createClient } from '@supabase/supabase-js';

// Set this to true to run the app in dummy/mocked mode (bypasses RLS database issues)
const USE_DUMMY_MODE = true;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Real Supabase Clients
const realSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

const realSupabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : realSupabase;

// --- DUMMY MODE IMPLEMENTATION ---
const COLLECTIONS = {
  workbenches: 'dabby_local_workbenches',
  workbench_members: 'dabby_local_workbench_members',
  labels: 'dabby_local_labels',
  workbench_records: 'dabby_local_records',
  parties: 'dabby_local_parties',
  tasks: 'dabby_local_tasks',
  invoices: 'dabby_local_invoices',
  bills: 'dabby_local_bills',
  ledger_entries: 'dabby_local_ledger_entries',
};

const getCollection = (name) => {
  const val = localStorage.getItem(COLLECTIONS[name]);
  if (val) return JSON.parse(val);
  
  // Seed initial dummy data if storage is empty
  let initial = [];
  if (name === 'workbenches') {
    initial = [
      {
        id: 'mock-wb-1',
        name: 'Acme Corp (Mock)',
        books_start_date: '2026-04-01',
        owner_user_id: 'mock-user-id',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        industry: 'services',
        business_type: 'pvt_ltd',
        location: 'India',
        currency: 'INR'
      }
    ];
  } else if (name === 'workbench_members') {
    initial = [
      {
        id: 'mock-member-1',
        workbench_id: 'mock-wb-1',
        user_id: 'mock-user-id',
        role: 'founder',
        created_at: new Date().toISOString()
      }
    ];
  } else if (name === 'labels') {
    initial = [
      { id: 'l1', workbench_id: 'mock-wb-1', name: 'Cash & Cash Equivalents', type: 'asset' },
      { id: 'l2', workbench_id: 'mock-wb-1', name: 'Bank Accounts', type: 'asset' },
      { id: 'l3', workbench_id: 'mock-wb-1', name: 'Accounts Receivable (AR)', type: 'asset' },
      { id: 'l4', workbench_id: 'mock-wb-1', name: 'Accounts Payable (AP)', type: 'liability' },
      { id: 'l5', workbench_id: 'mock-wb-1', name: 'Operating Revenue', type: 'income' },
      { id: 'l6', workbench_id: 'mock-wb-1', name: 'Salaries & Wages', type: 'expense' },
      { id: 'l7', workbench_id: 'mock-wb-1', name: 'Rent', type: 'expense' },
      { id: 'l8', workbench_id: 'mock-wb-1', name: 'Software & Subscriptions', type: 'expense' },
    ];
  } else if (name === 'workbench_records') {
    initial = [
      {
        id: 'r1',
        workbench_id: 'mock-wb-1',
        record_type: 'transaction',
        summary: 'SaaS Subscription Payment',
        created_at: new Date().toISOString(),
        metadata: { amount: 120, category: 'Software & Subscriptions', transaction_date: '2026-06-01', labels: ['l8'] }
      },
      {
        id: 'r2',
        workbench_id: 'mock-wb-1',
        record_type: 'transaction',
        summary: 'Client Consulting Retainer',
        created_at: new Date().toISOString(),
        metadata: { amount: 5000, category: 'Operating Revenue', transaction_date: '2026-06-05', labels: ['l5'] }
      },
      {
        id: 'r3',
        workbench_id: 'mock-wb-1',
        record_type: 'transaction',
        summary: 'Office Rent Payment',
        created_at: new Date().toISOString(),
        metadata: { amount: 1500, category: 'Rent', transaction_date: '2026-06-10', labels: ['l7'] }
      }
    ];
  } else if (name === 'parties') {
    initial = [
      { id: 'p1', workbench_id: 'mock-wb-1', name: 'Self', category: 'self' },
      { id: 'p2', workbench_id: 'mock-wb-1', name: 'Acme Client', category: 'customer' },
      { id: 'p3', workbench_id: 'mock-wb-1', name: 'AWS Cloud', category: 'vendor' },
    ];
  }
  
  localStorage.setItem(COLLECTIONS[name], JSON.stringify(initial));
  return initial;
};

const saveCollection = (name, data) => {
  localStorage.setItem(COLLECTIONS[name], JSON.stringify(data));
};

const makeMockBuilder = (data = []) => {
  const builder = {
    then: (resolve) => resolve({ data, error: null }),
    catch: (reject) => {},
  };
  return new Proxy(builder, {
    get(target, prop) {
      if (prop === 'then') return target.then;
      if (prop === 'single') return () => makeMockBuilder(Array.isArray(data) ? data[0] : data);
      return () => makeMockBuilder(data);
    }
  });
};

const supabaseMock = {
  auth: {
    getUser: async () => ({
      data: {
        user: {
          id: 'mock-user-id',
          email: 'founder@dabby.ai',
        }
      },
      error: null
    }),
    onAuthStateChange: (callback) => {
      // Small timeout to simulate auth event trigger
      setTimeout(() => {
        callback('SIGNED_IN', {
          id: 'mock-user-id',
          email: 'founder@dabby.ai',
        });
      }, 50);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signOut: async () => {},
  },
  
  storage: {
    from: () => ({
      upload: async (path, file) => ({ data: { path }, error: null }),
      remove: async (paths) => ({ data: {}, error: null }),
      createSignedUrl: async (path, expires) => ({ data: { signedUrl: 'https://via.placeholder.com/150' }, error: null }),
      download: async (path) => ({ data: new Blob(), error: null }),
    })
  },
  
  functions: {
    invoke: async (name, options) => {
      console.log(`[MOCK] Edge Function: ${name}`, options);
      if (name === 'create-chat-session') {
        return { data: { id: crypto.randomUUID(), title: options.body?.title || 'Chat Session' }, error: null };
      }
      return { data: {}, error: null };
    }
  },

  from: (table) => {
    const collName = COLLECTIONS[table] ? table : null;
    
    return {
      select: (fields = '*') => {
        if (!collName) return makeMockBuilder([]);
        const list = getCollection(collName);
        return {
          eq: (col, val) => {
            const filtered = list.filter(item => item[col] === val);
            return makeMockBuilder(filtered);
          },
          in: (col, vals) => {
            const filtered = list.filter(item => vals.includes(item[col]));
            return makeMockBuilder(filtered);
          },
          order: () => makeMockBuilder(list),
          limit: () => makeMockBuilder(list),
          single: () => makeMockBuilder(list[0] || null),
          then: (resolve) => resolve({ data: list, error: null })
        };
      },
      
      insert: (data) => {
        if (!collName) return makeMockBuilder([data]);
        const list = getCollection(collName);
        const rows = Array.isArray(data) ? data : [data];
        const newRows = rows.map(r => ({
          id: r.id || crypto.randomUUID(),
          created_at: new Date().toISOString(),
          ...r
        }));
        list.push(...newRows);
        saveCollection(collName, list);
        
        // Auto-assign workbench membership locally
        if (table === 'workbenches') {
          const members = getCollection('workbench_members');
          newRows.forEach(wb => {
            members.push({
              id: crypto.randomUUID(),
              workbench_id: wb.id,
              user_id: 'mock-user-id',
              role: 'founder',
              created_at: new Date().toISOString()
            });
          });
          saveCollection('workbench_members', members);
        }
        
        return makeMockBuilder(newRows);
      },
      
      upsert: (data) => {
        if (!collName) return makeMockBuilder([data]);
        const list = getCollection(collName);
        const rows = Array.isArray(data) ? data : [data];
        rows.forEach(r => {
          const idx = list.findIndex(item => item.id === r.id);
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...r };
          } else {
            list.push({ id: crypto.randomUUID(), ...r });
          }
        });
        saveCollection(collName, list);
        return makeMockBuilder(rows);
      },
      
      update: (data) => {
        return {
          eq: (col, val) => {
            if (collName) {
              const list = getCollection(collName);
              list.forEach(item => {
                if (item[col] === val) {
                  Object.assign(item, data);
                }
              });
              saveCollection(collName, list);
            }
            return makeMockBuilder([data]);
          }
        };
      },
      
      delete: () => {
        return {
          eq: (col, val) => {
            if (collName) {
              const list = getCollection(collName);
              const filtered = list.filter(item => item[col] !== val);
              saveCollection(collName, filtered);
            }
            return makeMockBuilder([]);
          }
        };
      }
    };
  }
};

// Export active clients depending on toggle
const supabase = USE_DUMMY_MODE ? supabaseMock : realSupabase;
const supabaseAdmin = USE_DUMMY_MODE ? supabaseMock : realSupabaseAdmin;

export { supabase, supabaseAdmin };

// AUTH HELPERS
export const signOut = async () => {
  await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};
