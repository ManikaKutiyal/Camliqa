/**
 * fuzzySearch.js
 * ─────────────────────────────────────────────────────────────
 * Typo-tolerant, zero-dependency fuzzy search for the storefront.
 *
 * Ranking priority (highest → lowest):
 *  1. Exact match
 *  2. Exact substring / starts-with
 *  3. Token-level prefix match
 *  4. Levenshtein distance within tolerance
 *  5. Bigram similarity (catches swapped / missing letters)
 * ─────────────────────────────────────────────────────────────
 */

// ─── Levenshtein Distance ──────────────────────────────────────
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  // Use two rolling rows to keep memory O(n)
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        curr[j] = prev[j - 1];
      } else {
        curr[j] = 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
      }
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// ─── Bigram Similarity (Sørensen–Dice) ────────────────────────
function getBigrams(str) {
  const set = new Set();
  for (let i = 0; i < str.length - 1; i++) {
    set.add(str.slice(i, i + 2));
  }
  return set;
}

function bigramSimilarity(a, b) {
  const ba = getBigrams(a);
  const bb = getBigrams(b);
  if (ba.size === 0 || bb.size === 0) return 0;
  let intersection = 0;
  for (const bg of ba) {
    if (bb.has(bg)) intersection++;
  }
  return (2 * intersection) / (ba.size + bb.size);
}

// ─── Single-field Scorer ──────────────────────────────────────
/**
 * Score how well `query` matches `candidate`.
 * Returns a float 0–1 (0 = no match, discard).
 */
function scoreField(query, candidate) {
  const q = query.toLowerCase().trim();
  const c = candidate.toLowerCase();
  if (!q || !c) return 0;

  // 1. Exact
  if (c === q) return 1.0;

  // 2. Exact substring (e.g. "soap" inside "liquid soap")
  if (c.includes(q)) return 0.92;

  // 3. Starts-with
  if (c.startsWith(q)) return 0.89;

  // 4. Token-level matching — any word in the candidate starts with the query
  //    or any query token matches a candidate word
  const qTokens = q.split(/\s+/);
  const cTokens = c.split(/\s+/);
  let tokenHits = 0;
  for (const qt of qTokens) {
    for (const ct of cTokens) {
      if (ct === qt) { tokenHits += 2; break; }
      if (ct.startsWith(qt) || ct.includes(qt)) { tokenHits += 1; break; }
    }
  }
  if (tokenHits > 0) {
    return 0.72 + Math.min(tokenHits / (qTokens.length * 2), 1) * 0.12;
  }

  // 5. Levenshtein — compare query against each candidate token, and also
  //    against a leading slice of the full candidate of same length
  const maxErrors = Math.min(3, Math.max(1, Math.floor(q.length / 4)));

  let bestLev = Infinity;
  for (const ct of cTokens) {
    bestLev = Math.min(bestLev, levenshtein(q, ct));
  }
  // also try matching against a window of the full candidate
  if (c.length >= q.length) {
    bestLev = Math.min(bestLev, levenshtein(q, c.slice(0, q.length)));
  }

  if (bestLev <= maxErrors) {
    // Scale: 1 error → ~0.68, 2 errors → ~0.62, 3 errors → ~0.56
    return 0.70 - (bestLev / (maxErrors + 1)) * 0.14;
  }

  // 6. Bigram fallback — good for phonetic / transposition errors
  //    Run against each candidate token and the full candidate
  let bestBigram = bigramSimilarity(q, c);
  for (const ct of cTokens) {
    bestBigram = Math.max(bestBigram, bigramSimilarity(q, ct));
  }
  if (bestBigram >= 0.4) {
    return bestBigram * 0.58; // caps around 0.58
  }

  return 0; // discard
}

// ─── Public API ────────────────────────────────────────────────
/**
 * Fuzzy-search a product corpus against a user query.
 *
 * @param {string} query  — raw user input
 * @param {Array<{
 *   id: string,
 *   title: string,
 *   slug: string,
 *   category?: string,
 *   brand?: string,
 *   image_url?: string,
 *   price?: number,
 *   discount_price?: number,
 * }>} products  — the full product corpus
 * @param {number} [limit=6]  — max results to return
 * @returns {Array}  — ranked results (best first), each augmented with `_score`
 */
export function fuzzySearch(query, products, limit = 6) {
  if (!query || query.trim().length < 2 || !Array.isArray(products)) return [];

  const results = [];

  for (const product of products) {
    const titleScore    = scoreField(query, product.title    ?? '') * 1.0;   // highest weight
    const categoryScore = scoreField(query, product.category ?? '') * 0.55;
    const brandScore    = scoreField(query, product.brand    ?? '') * 0.45;

    // Combined score = best single-field score (prevent multi-field inflation)
    const combined = Math.max(titleScore, categoryScore, brandScore);

    if (combined > 0) {
      results.push({ ...product, _score: combined });
    }
  }

  return results
    .sort((a, b) => b._score - a._score)
    .slice(0, limit);
}
