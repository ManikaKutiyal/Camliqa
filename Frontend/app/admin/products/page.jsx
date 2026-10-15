"use client";

import { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Package,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  adminGetProducts, 
  adminCreateProduct, 
  adminUpdateProduct, 
  adminDeleteProduct 
} from '@/services/supabase/products';
import { createClient } from '@/lib/supabase/client';

import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await adminGetProducts(supabase);
      if (error) throw error;
      
      // Map DB to UI
      const mappedData = (data || []).map(p => ({
        ...p,
        name: p.title || p.name,
        image: p.image_url || p.image,
        stock: p.stock === 'out-of-stock' ? 'out-of-stock' : 'in-stock'
      }));
      setProducts(mappedData);
    } catch (error) {
      console.error('Failed to fetch products', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const supabase = createClient();
        await adminDeleteProduct(supabase, id);
        fetchProducts();
      } catch (error) {
        console.error('Failed to delete product', error);
        alert('Failed to delete product: ' + error.message);
      }
    }
  };

  const filteredProducts = (products || []).filter(p => 
    p?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    p?.category?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-primary/30">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-secondary/10 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
          />
        </div>
        <button
          onClick={() => {
            router.push('/admin/products/new');
          }}
          className="inline-flex items-center justify-center gap-2 bg-primary text-white rounded-xl px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-secondary/10 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-secondary/20 bg-secondary/10">
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">Product</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">Category</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">Price</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">Stock</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary/10">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-10 w-48 bg-secondary/10 rounded-lg"></div></td>
                  <td className="px-6 py-4"><div className="h-6 w-24 bg-secondary/10 rounded-lg"></div></td>
                  <td className="px-6 py-4"><div className="h-6 w-16 bg-secondary/10 rounded-lg"></div></td>
                  <td className="px-6 py-4"><div className="h-6 w-20 bg-secondary/10 rounded-lg"></div></td>
                  <td className="px-6 py-4"><div className="h-8 w-8 ml-auto bg-secondary/10 rounded-lg"></div></td>
                </tr>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-secondary/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-secondary/10 bg-secondary/5">
                        <img src={product.image} alt="" className="h-full w-full object-contain p-1" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-primary">{product.name}</p>
                        <p className="text-[10px] text-primary/40 uppercase tracking-widest">{product.size || 'Standard Size'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-primary/60">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-primary">₹{product.price}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      product.stock === 'in-stock' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {product.stock === 'in-stock' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {product.stock === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          router.push(`/admin/products/${product.id}`);
                        }}
                        className="p-2 text-primary/60 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-primary/60 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-primary/40">
                    <Package size={48} strokeWidth={1} />
                    <p className="text-sm font-medium">No products found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
