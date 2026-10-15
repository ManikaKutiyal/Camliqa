SET role postgres;

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
