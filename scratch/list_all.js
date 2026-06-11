import { createClient } from '@supabase/supabase-js';

const url = "https://rdwrxipstlogfthhveim.supabase.co";
const service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkd3J4aXBzdGxvZ2Z0aGh2ZWltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MzM2MiwiZXhwIjoyMDg5MTM5MzYyfQ.i3ZhTBfC6DxGrsoNvL4kV2BmSJME3YABHbCH-2vIl_I";

const supabaseAdmin = createClient(url, service_key);

async function listAll() {
  const { data, error } = await supabaseAdmin.from("workbenches").select("id, name, owner_user_id");
  console.log("All workbenches:", data);
}

listAll();
