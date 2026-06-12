import { createClient } from '@supabase/supabase-js';

// Hybrid Client Mode:
// - Real workbenches are saved/read from Supabase.
// - Dummy/mock workbenches (with 'mock-' prefix) are saved/read from localStorage.
const USE_DUMMY_MODE = false; 

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

// --- DUMMY & HYBRID ROUTING STORAGE ---
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
  
  // Seed initial dummy data if empty
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
        currency: 'INR',
        is_dummy: true
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
  }
  localStorage.setItem(COLLECTIONS[name], JSON.stringify(initial));
  return initial;
};

const saveCollection = (name, data) => {
  localStorage.setItem(COLLECTIONS[name], JSON.stringify(data));
};

const isMockId = (id) => typeof id === 'string' && id.startsWith('mock-');

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

const originalFrom = realSupabase.from.bind(realSupabase);

const buildHybridClient = (baseClient) => {
  return new Proxy(baseClient, {
    get(target, prop) {
      if (prop === 'from') {
        return (table) => {
          const collName = COLLECTIONS[table] ? table : null;
          
          return {
            select: (fields = '*') => {
              let eqCol = null;
              let eqVal = null;
              let inCol = null;
              let inVals = [];
              
              const executeQuery = () => {
                const localList = getCollection(table);
                
                // Route to localStorage if filtering by mock ID
                if ((eqCol === 'workbench_id' && isMockId(eqVal)) || 
                    (eqCol === 'id' && isMockId(eqVal) && table === 'workbenches')) {
                  const filtered = localList.filter(item => item[eqCol] === eqVal);
                  return makeMockBuilder(filtered);
                }
                
                if (inCol === 'id' && table === 'workbenches' && inVals.some(isMockId)) {
                  return {
                    then: async (resolve) => {
                      const dbIds = inVals.filter(id => !isMockId(id));
                      let dbData = [];
                      if (dbIds.length > 0) {
                        try {
                          const res = await originalFrom(table).select(fields).in(inCol, dbIds);
                          dbData = res.data || [];
                        } catch (e) {}
                      }
                      const mockData = localList.filter(item => inVals.includes(item.id));
                      resolve({ data: [...dbData, ...mockData], error: null });
                    }
                  };
                }
                
                // Special case: Fetching all workbenches or memberships
                if (!eqCol && !inCol) {
                  if (table === 'workbenches') {
                    return {
                      then: async (resolve) => {
                        let dbData = [];
                        try {
                          const res = await originalFrom(table).select(fields).order('created_at', { ascending: false });
                          dbData = res.data || [];
                        } catch (e) {}
                        resolve({ data: [...dbData, ...localList], error: null });
                      }
                    };
                  }
                  if (table === 'workbench_members') {
                    return {
                      then: async (resolve) => {
                        let dbData = [];
                        try {
                          const res = await originalFrom(table).select(fields);
                          dbData = res.data || [];
                        } catch (e) {}
                        resolve({ data: [...dbData, ...localList], error: null });
                      }
                    };
                  }
                }
                
                // Fallback to real Supabase query
                let query = originalFrom(table).select(fields);
                if (eqCol) query = query.eq(eqCol, eqVal);
                if (inCol) query = query.in(inCol, inVals);
                return query;
              };
              
              return {
                eq: (col, val) => {
                  eqCol = col;
                  eqVal = val;
                  return {
                    single: () => {
                      const res = executeQuery();
                      if (res.single) return res.single();
                      return {
                        then: async (resolve) => {
                          const r = await res;
                          resolve({ data: Array.isArray(r.data) ? r.data[0] : r.data, error: r.error });
                        }
                      };
                    },
                    then: (resolve) => executeQuery().then(resolve)
                  };
                },
                in: (col, vals) => {
                  inCol = col;
                  inVals = vals;
                  return {
                    then: (resolve) => executeQuery().then(resolve)
                  };
                },
                order: () => executeQuery(),
                limit: () => executeQuery(),
                then: (resolve) => executeQuery().then(resolve)
              };
            },
            
            insert: (data) => {
              if (!collName) return makeMockBuilder([data]);
              const list = getCollection(collName);
              const rows = Array.isArray(data) ? data : [data];
              
              const hasMock = rows.some(r => isMockId(r.workbench_id) || isMockId(r.id) || r.is_dummy);
              
              if (hasMock || (table === 'workbenches' && rows.some(r => r.name.toLowerCase().includes('dummy') || r.is_dummy))) {
                const newRows = rows.map(r => ({
                  id: r.id || `mock-${crypto.randomUUID()}`,
                  created_at: new Date().toISOString(),
                  ...r
                }));
                list.push(...newRows);
                saveCollection(collName, list);
                
                if (table === 'workbenches') {
                  const members = getCollection('workbench_members');
                  const labels = getCollection('labels');
                  newRows.forEach(wb => {
                    members.push({
                      id: `mock-${crypto.randomUUID()}`,
                      workbench_id: wb.id,
                      user_id: wb.owner_user_id || 'mock-user-id',
                      role: 'founder',
                      created_at: new Date().toISOString()
                    });

                    // Seed default labels for this new mock workbench
                    const defaultLabels = [
                      { id: `mock-label-${crypto.randomUUID()}`, workbench_id: wb.id, name: 'Cash & Cash Equivalents', type: 'asset', sub_account: 'Cash & Cash Equivalents' },
                      { id: `mock-label-${crypto.randomUUID()}`, workbench_id: wb.id, name: 'Bank Accounts', type: 'asset', sub_account: 'Bank Accounts' },
                      { id: `mock-label-${crypto.randomUUID()}`, workbench_id: wb.id, name: 'Accounts Receivable (AR)', type: 'asset', sub_account: 'Accounts Receivable (AR)' },
                      { id: `mock-label-${crypto.randomUUID()}`, workbench_id: wb.id, name: 'Accounts Payable (AP)', type: 'liability', sub_account: 'Accounts Payable (AP)' },
                      { id: `mock-label-${crypto.randomUUID()}`, workbench_id: wb.id, name: 'Operating Revenue', type: 'income', sub_account: 'Operating Revenue' },
                      { id: `mock-label-${crypto.randomUUID()}`, workbench_id: wb.id, name: 'Salaries & Wages', type: 'expense', sub_account: 'Salaries & Wages' },
                      { id: `mock-label-${crypto.randomUUID()}`, workbench_id: wb.id, name: 'Rent', type: 'expense', sub_account: 'Rent' },
                      { id: `mock-label-${crypto.randomUUID()}`, workbench_id: wb.id, name: 'Software & Subscriptions', type: 'expense', sub_account: 'Software & Subscriptions' },
                    ];
                    labels.push(...defaultLabels);
                  });
                  saveCollection('workbench_members', members);
                  saveCollection('labels', labels);
                }
                return makeMockBuilder(newRows);
              }
              
              return originalFrom(table).insert(data);
            },
            
            upsert: (data) => {
              if (!collName) return makeMockBuilder([data]);
              const list = getCollection(collName);
              const rows = Array.isArray(data) ? data : [data];
              const hasMock = rows.some(r => isMockId(r.workbench_id) || isMockId(r.id) || r.is_dummy);
              
              if (hasMock) {
                rows.forEach(r => {
                  const idx = list.findIndex(item => item.id === r.id);
                  if (idx >= 0) {
                    list[idx] = { ...list[idx], ...r };
                  } else {
                    list.push({ id: `mock-${crypto.randomUUID()}`, ...r });
                  }
                });
                saveCollection(collName, list);
                return makeMockBuilder(rows);
              }
              
              return originalFrom(table).upsert(data);
            },
            
            update: (data) => {
              return {
                eq: (col, val) => {
                  if (isMockId(val) || (col === 'workbench_id' && isMockId(val))) {
                    const list = getCollection(collName);
                    list.forEach(item => {
                      if (item[col] === val) {
                        Object.assign(item, data);
                      }
                    });
                    saveCollection(collName, list);
                    return makeMockBuilder([data]);
                  }
                  return originalFrom(table).update(data).eq(col, val);
                }
              };
            },
            
            delete: () => {
              return {
                eq: (col, val) => {
                  if (isMockId(val) || (col === 'workbench_id' && isMockId(val))) {
                    const list = getCollection(collName);
                    const filtered = list.filter(item => item[col] !== val);
                    saveCollection(collName, filtered);
                    return makeMockBuilder([]);
                  }
                  return originalFrom(table).delete().eq(col, val);
                }
              };
            }
          };
        };
      }
      return Reflect.get(target, prop);
    }
  });
};

const supabase = buildHybridClient(realSupabase);
const supabaseAdmin = buildHybridClient(realSupabaseAdmin);

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
