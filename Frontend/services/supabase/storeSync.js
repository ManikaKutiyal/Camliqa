import { createClient } from '@/lib/supabase/client';

export async function getOrCreateCart(userId) {
  const supabase = createClient();
  
  // 1. Check if user has a cart
  let { data: cart, error: cartError } = await supabase
    .from('shopping_carts')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (cartError || !cart) {
    // 2. Create if not exists
    const { data: newCart, error: newCartError } = await supabase
      .from('shopping_carts')
      .insert({ user_id: userId })
      .select('id')
      .single();
    
    if (newCartError) throw newCartError;
    cart = newCart;
  }

  return cart.id;
}

export async function getOrCreateWishlist(userId) {
  const supabase = createClient();
  
  let { data: wishlist, error: wishlistError } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (wishlistError || !wishlist) {
    const { data: newWishlist, error: newWishlistError } = await supabase
      .from('wishlists')
      .insert({ user_id: userId })
      .select('id')
      .single();
    
    if (newWishlistError) throw newWishlistError;
    wishlist = newWishlist;
  }

  return wishlist.id;
}

export async function fetchBackendCart(userId) {
  const supabase = createClient();
  const cartId = await getOrCreateCart(userId);

  const { data: items, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      product_id,
      products (
        id, name, title, price, image_url, image, category
      )
    `)
    .eq('cart_id', cartId);

  if (error) throw error;

  // Map to frontend store format
  return items.map(item => {
    const p = item.products;
    return {
      id: p.id,
      cartId: p.id, // Using product.id as cartId for now
      name: p.title || p.name,
      price: p.price,
      image: p.image_url || p.image,
      category: p.category,
      quantity: item.quantity,
      dbItemId: item.id
    };
  });
}

export async function syncCartToBackend(userId, localItems) {
  const supabase = createClient();
  const cartId = await getOrCreateCart(userId);

  // For simplicity: Upsert each local item.
  // In a robust system, you'd merge quantities. Here we'll just add/update them.
  for (const item of localItems) {
    // Check if product exists in cart
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', item.id)
      .single();

    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: Math.max(existing.quantity, item.quantity) })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id: item.id,
          quantity: item.quantity
        });
    }
  }

  // Return the newly merged backend cart
  return await fetchBackendCart(userId);
}

export async function updateBackendCartItem(userId, productId, quantity) {
  const supabase = createClient();
  const cartId = await getOrCreateCart(userId);

  if (quantity > 0) {
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id: productId,
          quantity
        });
    }
  } else {
    // Remove if quantity 0
    await removeBackendCartItem(userId, productId);
  }
}

export async function removeBackendCartItem(userId, productId) {
  const supabase = createClient();
  const cartId = await getOrCreateCart(userId);

  await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId)
    .eq('product_id', productId);
}

// ================= WISHLIST =================

export async function fetchBackendWishlist(userId) {
  const supabase = createClient();
  const wishlistId = await getOrCreateWishlist(userId);

  const { data: items, error } = await supabase
    .from('wishlist_items')
    .select(`
      product_id,
      products (
        id, name, title, price, image_url, image, category
      )
    `)
    .eq('wishlist_id', wishlistId);

  if (error) throw error;

  return items.map(item => {
    const p = item.products;
    return {
      id: p.id,
      name: p.title || p.name,
      price: p.price,
      image: p.image_url || p.image,
      category: p.category
    };
  });
}

export async function syncWishlistToBackend(userId, localWishlist) {
  const supabase = createClient();
  const wishlistId = await getOrCreateWishlist(userId);

  for (const item of localWishlist) {
    const { error } = await supabase
      .from('wishlist_items')
      .insert({
        wishlist_id: wishlistId,
        product_id: item.id
      });
    // Ignore duplicate key errors silently during merge
  }

  return await fetchBackendWishlist(userId);
}

export async function toggleBackendWishlist(userId, product, isAdding) {
  const supabase = createClient();
  const wishlistId = await getOrCreateWishlist(userId);

  if (isAdding) {
    await supabase
      .from('wishlist_items')
      .insert({ wishlist_id: wishlistId, product_id: product.id });
  } else {
    await supabase
      .from('wishlist_items')
      .delete()
      .eq('wishlist_id', wishlistId)
      .eq('product_id', product.id);
  }
}
