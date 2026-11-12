import React, { useState, useEffect } from 'react';
import { ShoppingBag, Sparkles, X, AlertCircle, ArrowRight, ShoppingCart } from 'lucide-react';
import SearchBar from './components/SearchBar';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';

const exampleQueries = [
  'Cold creamy dairy',
  'Salty evening snacks',
  'Citrus fizzy drinks',
  'Fresh baked bread',
  'Leafy green salad',
  'Sweet tropical fruit',
];

function readRecentlyViewed() {
  try {
    const stored = JSON.parse(window.localStorage.getItem('smartcart_recent') || '[]');
    return Array.isArray(stored) ? stored.slice(0, 4) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [recentlyViewed, setRecentlyViewed] = useState(readRecentlyViewed);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState(null);
  const [relatedOpen, setRelatedOpen] = useState(false);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(''), 2000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Trending products
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/trending');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load trending');
        if (!cancelled) setTrendingProducts(data.results || []);
      } catch (err) {
        if (!cancelled) setTrendingError(err.message);
      } finally {
        if (!cancelled) setTrendingLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Debounced Search (300ms)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
      setHasSearched(false);
      setRelatedOpen(false);
      setSelectedProduct(null);
      return;
    }
    setLoading(true);
    setError(null);
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.details || data.error || 'Search failed');
        setResults(data.results || []);
        setHasSearched(true);
      } catch (err) {
        setError(err.message || 'Something went wrong.');
        setResults([]);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const showRelated = async (product) => {
    setSelectedProduct(product);
    setRelatedLoading(true);
    setRelatedError(null);
    setRelatedProducts([]);
    setRelatedOpen(true);
    try {
      const res = await fetch(`/api/product/${product._id}/related`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch related');
      setRelatedProducts(data.results || []);
    } catch (err) {
      setRelatedError(err.message);
    } finally {
      setRelatedLoading(false);
    }
  };

  const handleProductClick = (product) => {
    setRecentlyViewed((cur) => {
      const next = [product, ...cur.filter((i) => i._id !== product._id)].slice(0, 4);
      try { window.localStorage.setItem('smartcart_recent', JSON.stringify(next)); } catch {}
      return next;
    });
    if (selectedProduct?._id === product._id) {
      setRelatedOpen(false);
      setSelectedProduct(null);
      return;
    }
    showRelated(product);
  };

  const handleAddToCart = (product) => {
    setCart((cur) => {
      const existing = cur.find((i) => i._id === product._id);
      if (existing) return cur.map((i) => i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...cur, { ...product, quantity: 1 }];
    });
    setToastMessage(`${product.name} added to cart`);
  };

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      setCart((cur) => cur.filter((i) => i._id !== productId));
      return;
    }
    setCart((cur) => cur.map((i) => i._id === productId ? { ...i, quantity } : i));
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    try { window.localStorage.removeItem('smartcart_recent'); } catch {}
  };

  const handleChipClick = (query) => setSearchQuery(query);
  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setError(null);
    setHasSearched(false);
    setRelatedOpen(false);
    setSelectedProduct(null);
  };

  const totalCartItems = cart.reduce((t, i) => t + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-800 flex flex-col">

      {/* ─── Header ───────────────────────────────────────────────────── */}
      <header className="border-b border-slate-100 bg-white/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Smart<span className="text-emerald-600">Cart</span>
              </span>
              <span className="hidden sm:inline text-sm text-slate-400">
                — Your smarter grocery run
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
            aria-label={`Open cart, ${totalCartItems} items`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            <span className="min-w-5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-center text-xs text-white">
              {totalCartItems}
            </span>
          </button>
        </div>
      </header>

      {/* ─── Main ─────────────────────────────────────────────────────── */}
      <main className="flex-1 pb-12">

        {/* Hero / Search section — full width, no side padding gap */}
        <section className="bg-white border-b border-emerald-100 shadow-sm mb-6 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-3 w-3" />
              Smart grocery discovery
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Find groceries by meaning, not keywords
            </h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500 sm:text-sm">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Powered by AI vector embeddings
            </p>
            <div className="mt-5">
              <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={clearSearch} loading={loading} />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-medium text-slate-500">Try:</span>
              {exampleQueries.map((query) => (
                <button
                  key={query}
                  type="button"
                  onClick={() => handleChipClick(query)}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 transition-colors duration-150 hover:bg-emerald-100"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Constrained content area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Error */}
          {error && (
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Search unavailable</p>
                <p className="mt-0.5 text-rose-600">{error}</p>
              </div>
            </div>
          )}

          {/* Search Results Grid */}
          {searchQuery.trim() && (
            <section>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-700">
                  {loading ? 'Searching...' : hasSearched ? `${results.length} results for "${searchQuery}"` : ''}
                </h2>
                {results.length > 0 && (
                  <span className="text-xs text-slate-400">Add an item to see what goes well with it</span>
                )}
              </div>

              {hasSearched && !loading && results.length === 0 && !error && (
                <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 max-w-sm mx-auto">
                  <ShoppingBag className="w-9 h-9 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">No similar products found</p>
                  <p className="text-xs text-slate-400 mt-1">Try a broader or different search term.</p>
                </div>
              )}

              {results.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.map((product, index) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onClick={handleProductClick}
                      onAddToCart={handleAddToCart}
                      isSelected={selectedProduct?._id === product._id}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Related Products Panel — smooth slide-down */}
          <div
            className="scroll-mt-20"
            aria-hidden={!relatedOpen}
            style={{
              overflow: 'hidden',
              maxHeight: relatedOpen ? '600px' : '0px',
              opacity: relatedOpen ? 1 : 0,
              visibility: relatedOpen ? 'visible' : 'hidden',
              pointerEvents: relatedOpen ? 'auto' : 'none',
              transition: `max-height 0.35s ease, opacity 0.25s ease, visibility 0s linear ${relatedOpen ? '0s' : '0.35s'}`,
            }}
          >
            <div className="mt-6 pt-5 border-t border-emerald-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-800">
                    Goes well with{' '}
                    <span className="text-emerald-700">"{selectedProduct?.name}"</span>
                  </h3>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    — Cosine similarity via Atlas Vector Search
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => { setRelatedOpen(false); setSelectedProduct(null); }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
                  aria-label="Close related panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {relatedLoading && (
                <div className="flex items-center gap-3 py-6 text-slate-500 text-sm">
                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  Calculating vector similarities...
                </div>
              )}
              {relatedError && <div className="text-sm text-rose-600 py-4">{relatedError}</div>}

              {!relatedLoading && relatedProducts.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-3 snap-x scroll-smooth">
                  {relatedProducts.map((item, index) => (
                    <div key={item._id} className="snap-start">
                      <ProductCard
                        product={item}
                        onClick={handleProductClick}
                        onAddToCart={handleAddToCart}
                        isSelected={selectedProduct?._id === item._id}
                        index={index}
                        relationshipLabel={
                          item.category === selectedProduct?.category ? '🔁 Same category' : '🛒 Pairs well'
                        }
                        compact={true}
                      />
                    </div>
                  ))}
                </div>
              )}

              {!relatedLoading && !relatedError && relatedProducts.length === 0 && (
                <p className="text-xs text-slate-400 italic py-4">No other related products found.</p>
              )}
            </div>
          </div>

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <section className="mb-5">
              <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-sm font-bold text-slate-800">Recently Viewed</h2>
                <button type="button" onClick={clearRecentlyViewed} className="text-xs font-medium text-slate-500 transition hover:text-rose-600">
                  Clear
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {recentlyViewed.map((product, index) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onClick={handleProductClick}
                    onAddToCart={handleAddToCart}
                    isSelected={selectedProduct?._id === product._id}
                    index={index}
                    compact
                  />
                ))}
              </div>
            </section>
          )}

          {/* Home: Category banners */}
          {!searchQuery.trim() && (
            <div className="mb-6">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">A better basket starts here</p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">What are you craving today?</h2>
                </div>
                <span className="hidden text-xs text-slate-400 sm:block">Search by meal, mood, or ingredient</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Fresh & wholesome', query: 'Fresh fruits and vegetables', image: 'photo-1542838132-92c53300491e' },
                  { label: 'Snack time', query: 'Salty evening snacks', image: 'photo-1599490659213-e2b9527bd087' },
                  { label: 'Bakery favorites', query: 'Fresh baked bread', image: 'photo-1509440159596-0249088772ff' },
                ].map((collection) => (
                  <button
                    key={collection.label}
                    type="button"
                    onClick={() => handleChipClick(collection.query)}
                    className="group relative h-32 overflow-hidden rounded-xl bg-slate-200 text-left shadow-sm"
                  >
                    <img
                      src={`https://images.unsplash.com/${collection.image}?auto=format&fit=crop&w=700&q=80`}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                    <span className="absolute bottom-3 left-3 text-sm font-semibold text-white">{collection.label}</span>
                    <ArrowRight className="absolute bottom-3 right-3 h-4 w-4 text-white transition group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Home: Trending */}
          {!searchQuery.trim() && (
            <section className="mb-4">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Trending Now</h2>
                <span aria-hidden="true">🔥</span>
              </div>
              {trendingLoading && <p className="py-4 text-sm text-slate-500">Loading trending products...</p>}
              {trendingError && <p role="alert" className="py-3 text-sm text-rose-600">Trending products unavailable: {trendingError}</p>}
              {!trendingLoading && !trendingError && trendingProducts.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-3">
                  {trendingProducts.map((product, index) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onClick={handleProductClick}
                      onAddToCart={handleAddToCart}
                      isSelected={selectedProduct?._id === product._id}
                      index={index}
                      compact
                    />
                  ))}
                </div>
              )}
            </section>
          )}

        </div>{/* end constrained content */}
      </main>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 mt-12 py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} SmartCart — AI-powered vector grocery recommendations.</p>
          <div className="flex items-center gap-4">
            <span>React + Vite + Tailwind</span>
            <span>Express + Mongoose</span>
            <span>MongoDB Atlas Vector Search</span>
          </div>
        </div>
      </footer>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={(productId) => setCart((cur) => cur.filter((i) => i._id !== productId))}
        onClear={() => setCart([])}
        onAddRecommendation={handleAddToCart}
      />

      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-lg"
        >
          ✓ {toastMessage}
        </div>
      )}
    </div>
  );
}
