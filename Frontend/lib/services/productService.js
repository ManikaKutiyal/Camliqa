import { createClient } from "@/lib/supabase/client";

/**
 * Service to handle all Product-related database operations.
 * Fully aligned with the user-provided schema.
 */
export const productService = {
  /**
   * Fetches all active products from Supabase.
   */
  async getAllProducts() {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    // Transform DB fields to UI fields
    return data.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category || 'Uncategorized',
      price: Number(product.price),
      rating: 4.8, // Default rating
      reviews: 124, // Default reviews count
      image: product.image || '/placeholder-product.png',
      description: product.description,
      stock: product.stock || 'in-stock', // Schema uses TEXT for stock
      skinType: product.skin_types || ['All'],
      concerns: [], // We can add this to the schema later if needed
      ingredients: product.ingredients
    }));
  },

  async createProduct(formData) {
    const supabase = createClient();
    
    const newProduct = {
      id: Date.now().toString(),
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      description: formData.description,
      image: formData.image,
      stock: formData.stock || 'in-stock', // Matches 'TEXT' type in schema
      skin_types: formData.skinTypes || [],
      ingredients: formData.description // Mapping description to ingredients for now if not provided
    };

    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select();

    if (error) throw error;
    return data[0];
  },

  async updateProduct(id, formData) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('products')
      .update({
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description,
        image: formData.image,
        stock: formData.stock || 'in-stock',
        skin_types: formData.skinTypes || []
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  async deleteProduct(id) {
    const supabase = createClient();
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
