import json, subprocess, sys, os

PAT = os.getenv("SUPABASE_PAT")
REF = "wscfirbwwdfpqxkbulsf"
URL = f"https://api.supabase.com/v1/projects/{REF}/database/query"

if not PAT:
    print("Missing SUPABASE_PAT")
    sys.exit(1)

sql = """
-- 1. Create a policy for public read access to product-images
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Public Access for product-images'
    ) THEN
        CREATE POLICY "Public Access for product-images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'product-images');
    END IF;
END
$$;

-- 2. Create a policy for public read access to category-images
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Public Access for category-images'
    ) THEN
        CREATE POLICY "Public Access for category-images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'category-images');
    END IF;
END
$$;

-- 3. Create a policy for admins to insert/update/delete any object
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Admin CRUD for storage objects'
    ) THEN
        CREATE POLICY "Admin CRUD for storage objects"
        ON storage.objects FOR ALL
        TO authenticated
        USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
    END IF;
END
$$;

-- Make sure RLS is actually enabled on storage.objects (just in case)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
"""

payload = json.dumps({"query": sql})
tmp = "/tmp/sb_payload_fix.json"
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
print("Output:", out)
