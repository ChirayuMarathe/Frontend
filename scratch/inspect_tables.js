import { createClient } from '@supabase/supabase-js';

const url = "https://rdwrxipstlogfthhveim.supabase.co";
const key = "sb_publishable_lajEsk-4nacDOF3Fgg_VXw_wDlj12YT";
const service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkd3J4aXBzdGxvZ2Z0aGh2ZWltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MzM2MiwiZXhwIjoyMDg5MTM5MzYyfQ.i3ZhTBfC6DxGrsoNvL4kV2BmSJME3YABHbCH-2vIl_I";

const supabase = createClient(url, key);
const supabaseAdmin = createClient(url, service_key);

async function test() {
  console.log("Checking connection with Anon key...");
  try {
    const { data, error } = await supabase.from("workbenches").select("*").limit(1);
    if (error) {
      console.error("Anon Key Error:", error);
    } else {
      console.log("Anon Key Success:", data);
    }
  } catch (err) {
    console.error("Anon Key Catch:", err);
  }

  console.log("\nChecking connection with Service Role key...");
  try {
    const { data, error } = await supabaseAdmin.from("workbenches").select("*").limit(1);
    if (error) {
      console.error("Service Key Error:", error);
    } else {
      console.log("Service Key Success:", data);
    }
  } catch (err) {
    console.error("Service Key Catch:", err);
  }
}

test();
