'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { adminCreateProduct, uploadProductImage, getProductImagePublicUrl } from '@/services/supabase/products';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (productData) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      
      let mainImageUrl = '';
      let galleryUrls = [];

      if (productData.mediaItems && productData.mediaItems.length > 0) {
        for (let i = 0; i < productData.mediaItems.length; i++) {
          const item = productData.mediaItems[i];
          let finalUrl = item.url;
          
          if (item.file) {
            const ext = item.file.name.split('.').pop();
            const filePath = `products/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            const { error: uploadError } = await uploadProductImage(supabase, filePath, item.file);
            if (uploadError) throw uploadError;
            
            finalUrl = getProductImagePublicUrl(supabase, filePath).data.publicUrl;
          }

          if (item.isCover) {
            mainImageUrl = finalUrl;
          } else {
            galleryUrls.push({ url: finalUrl, sort_order: galleryUrls.length });
          }
        }
      }

      const isFeatured = (productData.tags || []).some(
        (t) => t === 'Featured' || t === '*Featured'
      );

      const payload = {
        title: productData.name,
        name: productData.name, 
        price: parseFloat(productData.price),
        rating: parseFloat(productData.rating) || 0,
        category: productData.category,
        sub_category: productData.sub_category,
        description: productData.description,
        image_url: mainImageUrl || productData.image,
        image: mainImageUrl || productData.image, 
        stock: productData.stock,
        skin_type: productData.skin_type,
        concern: productData.concern,
        tags: productData.tags,
        featured: isFeatured,
        suitable_for: productData.suitable_for,
        key_benefits: productData.key_benefits,
        how_to_use: productData.how_to_use,
        gallery: galleryUrls.length > 0 ? galleryUrls : productData.gallery,
        ingredients: productData.ingredients,
        variants: productData.variants || [],
      };

      const { error } = await adminCreateProduct(supabase, payload);
      if (error) throw error;
      
      router.push('/admin/products');
    } catch (error) {
      console.error('Failed to create product', error);
      alert('Failed to create product: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-primary mb-2">Add New Product</h1>
        <p className="text-sm text-primary/60 tracking-wider">Fill in the details to expand your catalog.</p>
      </div>

      <ProductForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
