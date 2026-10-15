import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStorefrontProducts } from "@/services/supabase/products";
import { fuzzySearch } from "@/utils/fuzzySearch";

// We cache the products array to avoid hitting the DB on every keystroke.
// Note: In production with high data turnover, you might want to expire this cache or use an external search engine.
// Since we are running in a long-lived Next.js process, this in-memory cache works well for small-to-medium datasets.
let productCache = null;
let lastCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

async function getProducts() {
  const now = Date.now();
  if (productCache && (now - lastCacheTime < CACHE_TTL)) {
    return productCache;
  }

  const supabase = await createClient();
  const { data: products, error } = await getStorefrontProducts(supabase);

  if (error) {
    console.error("Search API Error fetching products:", error);
    return productCache || []; // Fallback to stale cache if available
  }

  productCache = products;
  lastCacheTime = now;
  return productCache;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const products = await getProducts();
    const results = fuzzySearch(query, products, 6);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Internal Server Error", results: [] }, { status: 500 });
  }
}
