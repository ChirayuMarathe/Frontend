import os
from supabase import create_client

url = "https://rdwrxipstlogfthhveim.supabase.co"
key = "sb_publishable_lajEsk-4nacDOF3Fgg_VXw_wDlj12YT"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkd3J4aXBzdGxvZ2Z0aGh2ZWltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MzM2MiwiZXhwIjoyMDg5MTM5MzYyfQ.i3ZhTBfC6DxGrsoNvL4kV2BmSJME3YABHbCH-2vIl_I"

print("Initializing Supabase Client...")
supabase = create_client(url, key)
supabase_admin = create_client(url, service_key)

print("Checking connection and tables using Anon key...")
try:
    res = supabase.table("workbenches").select("*").limit(1).execute()
    print("Anon Key Result:", res.data)
except Exception as e:
    print("Anon Key Error:", str(e))

print("\nChecking connection and tables using Service Role key...")
try:
    res = supabase_admin.table("workbenches").select("*").limit(1).execute()
    print("Service Key Result:", res.data)
except Exception as e:
    print("Service Key Error:", str(e))
