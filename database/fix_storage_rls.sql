-- Enable Row Level Security (just in case it's not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Access for product-images
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

-- 2. Public Read Access for category-images
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

-- 3. Admin Full Access to all Storage Objects (for uploads/deletes)
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
