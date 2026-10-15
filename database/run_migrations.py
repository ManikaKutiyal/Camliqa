#!/usr/bin/env python3
"""
Smart migration runner — drops legacy conflicting tables, then runs all chunks.
"""
import json, subprocess, sys, os, time

import os

PAT = os.getenv("SUPABASE_PAT")
REF = "wscfirbwwdfpqxkbulsf"
URL = f"https://api.supabase.com/v1/projects/{REF}/database/query"
BASE = "/home/sama/Camliqa-Ecommerce"

def q(sql, label=""):
    payload = json.dumps({"query": sql})
    tmp = "/tmp/sb_payload.json"
    with open(tmp, "w") as f:
        f.write(payload)
    r = subprocess.run(
        ["curl","-s","--http1.1","-X","POST",URL,
         "-H",f"Authorization: Bearer {PAT}",
         "-H","Content-Type: application/json",
         "--data-binary",f"@{tmp}"],
        capture_output=True, text=True, timeout=120
    )
    os.unlink(tmp)
    out = r.stdout.strip()
    if not out:
        return None, f"empty response (exit {r.returncode})"
    try:
        data = json.loads(out)
    except Exception:
        return None, f"non-JSON: {out[:200]}"
    if isinstance(data, dict) and "message" in data:
        return None, data["message"]
    return data, None

def run_file(name, path):
    with open(path) as f:
        sql = f.read()
    data, err = q(sql, name)
    if err:
        # Tolerate "already exists" safely
        if any(x in err for x in ["already exists", "duplicate key"]):
            print(f"  ⚠️  {name}: already exists — skipping OK")
            return True
        print(f"  ❌ {name}:\n     {err[:500]}")
        return False
    print(f"  ✅ {name}: OK")
    return True

# ── Step 0: Drop legacy conflicting tables ──────────────────
print("\n▶ Step 0: Dropping legacy tables that conflict with new schema ...")
drop_sql = """
DROP TABLE IF EXISTS public.orders   CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
"""
data, err = q(drop_sql)
if err:
    print(f"  ⚠️  Drop warning (continuing): {err[:200]}")
else:
    print("  ✅ Legacy tables dropped.")

time.sleep(1)

# ── Steps 1-6: Run all migration chunks ─────────────────────
CHUNKS = [
    ("core_tables",       f"{BASE}/sql_chunk2_core_tables.sql"),
    ("commerce_tables",   f"{BASE}/sql_chunk3_commerce_tables.sql"),
    ("user_tables",       f"{BASE}/sql_chunk4_user_tables.sql"),
    ("marketing_support", f"{BASE}/sql_chunk5_marketing_support.sql"),
    ("rls_policies",      f"{BASE}/sql_chunk6_rls.sql"),
    ("functions_rpcs",    f"{BASE}/sql_chunk7_functions.sql"),
]

all_ok = True
for name, path in CHUNKS:
    print(f"\n▶ Running {name} ...")
    if not run_file(name, path):
        all_ok = False

# ── Step 7: Create storage buckets ──────────────────────────
print("\n▶ Creating storage buckets ...")
BUCKET_URL = f"https://api.supabase.com/v1/projects/{REF}/storage/buckets"

def create_bucket(name, public=True):
    payload = json.dumps({"id": name, "name": name, "public": public})
    r = subprocess.run(
        ["curl","-s","--http1.1","-X","POST", BUCKET_URL,
         "-H",f"Authorization: Bearer {PAT}",
         "-H","Content-Type: application/json",
         "-d", payload],
        capture_output=True, text=True, timeout=30
    )
    out = r.stdout.strip()
    try:
        data = json.loads(out)
    except Exception:
        print(f"  ❌ bucket/{name}: non-JSON: {out[:100]}")
        return
    if isinstance(data, dict) and "error" in data:
        if "already exists" in str(data):
            print(f"  ⚠️  bucket/{name}: already exists — OK")
        else:
            print(f"  ❌ bucket/{name}: {data}")
    else:
        print(f"  ✅ bucket/{name}: created")

for bucket in ["product-images", "category-images", "journal-images", "avatars"]:
    create_bucket(bucket, public=True)

print("\n" + ("✅ All done." if all_ok else "⚠️  Some steps failed — check above."))
sys.exit(0 if all_ok else 1)
