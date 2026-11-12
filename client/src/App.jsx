import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Sparkles, X, AlertCircle, ArrowRight, Leaf, ShoppingCart } from 'lucide-react';
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

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Related products state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState(null);
  const [relatedOpen, setRelatedOpen] = useState(false);

  const relatedRef = useRef(null);

  // ─── Debounced Search (300ms) ─────────────────────────────────────────────
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
        console.error('Search error:', err);
        setError(err.message || 'Something went wrong while searching.');
        setResults([]);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // ─── Related products on card click ──────────────────────────────────────
  const showRelatedProducts = async (product) => {
    setSelectedProduct(product);
    setRelatedLoading(true);
    setRelatedError(null);
    setRelatedProducts([]);
    setRelatedOpen(true);

    setTimeout(() => {
      relatedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);

    try {
      const res = await fetch(`/api/product/${product._id}/related`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch related products');

      setRelatedProducts(data.results || []);
    } catch (err) {
      console.error('Related error:', err);
      setRelatedError(err.message || 'Failed to load related products');
    } finally {
      setRelatedLoading(false);
    }
  };

  const handleProductClick = (product) => {
    // Toggle off if same product clicked again
    if (selectedProduct?._id === product._id) {
      setRelatedOpen(false);
      setSelectedProduct(null);
      return;
    }

    showRelatedProducts(product);
  };

  const handleAddToCart = (product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item._id === product._id);
      if (existingItem) {
        return currentCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
    showRelatedProducts(product);
  };

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      setCart((currentCart) => currentCart.filter((item) => item._id !== productId));
      return;
    }
    setCart((currentCart) =>
      currentCart.map((item) => item._id === productId ? { ...item, quantity } : item)
    );
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  const handleChipClick = (query) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setError(null);
    setHasSearched(false);
    setRelatedOpen(false);
    setSelectedProduct(null);
  };

  const closeRelated = () => {
    setRelatedOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-800 flex flex-col">
      {/* ─── Sticky Header ──────────────────────────────────────────────── */}
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

      {/* ─── Main ──────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">

        <section className="relative isolate -mx-4 sm:-mx-6 lg:-mx-8 mb-9 overflow-hidden bg-emerald-950 px-4 py-12 sm:px-8 sm:py-16">
          <div
            className="absolute inset-0 -z-10 bg-cover bg-center opacity-20"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=85')" }}
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-950 via-emerald-950/95 to-emerald-900/60" />
          <div className="mx-auto max-w-5xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-emerald-100">
              <Leaf className="h-3.5 w-3.5" />
              Fresh picks, smarter baskets
            </div>
            <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Your next grocery run, <span className="text-emerald-300">made simple.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/80 sm:text-base">
              Tell us what you’re craving. Find the right groceries and discover what goes well with them.
            </p>
            <div className="mt-7">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onClear={clearSearch}
                  loading={loading}
                />
            </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-emerald-100/70">Try:</span>
                {exampleQueries.map((query) => (
                  <button
                    key={query}
                    type="button"
                    onClick={() => handleChipClick(query)}
                    className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full border border-white/15 transition-colors duration-150"
                  >
                    {query}
                  </button>
                ))}
              </div>
          </div>
        </section>

        {/* Error state */}
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
                {loading
                  ? 'Searching...'
                  : hasSearched
                  ? `${results.length} results for "${searchQuery}"`
                  : ''}
              </h2>
              {results.length > 0 && (
                <span className="text-xs text-slate-400">
                  Add an item to see what goes well with it
                </span>
              )}
            </div>

            {/* Empty state */}
            {hasSearched && !loading && results.length === 0 && !error && (
              <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 max-w-sm mx-auto">
                <ShoppingBag className="w-9 h-9 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700">No similar products found</p>
                <p className="text-xs text-slate-400 mt-1">
                  Try a broader or different search term.
                </p>
              </div>
            )}

            {/* grid-cols-2 md:grid-cols-3 lg:grid-cols-4 */}
            {results.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onClick={handleProductClick}
                    onAddToCart={handleAddToCart}
                    isSelected={selectedProduct?._id === product._id}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ─── Related Products Panel (slide-down below grid) ──────────── */}
        <div
          ref={relatedRef}
          className="scroll-mt-20"
          style={{
            overflow: 'hidden',
            display: relatedOpen ? 'block' : 'none',
            maxHeight: relatedOpen ? '600px' : '0px',
            opacity: relatedOpen ? 1 : 0,
            transition: 'max-height 0.4s ease, opacity 0.3s ease',
          }}
        >
          <div className="mt-6 pt-5 border-t border-emerald-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Goes well with{' '}
                  <span className="text-emerald-700">
                    "{selectedProduct?.name}"
                  </span>
                </h3>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  — Cosine similarity via Atlas Vector Search
                </span>
              </div>
              <button
                type="button"
                onClick={closeRelated}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
                aria-label="Close related panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Loading */}
            {relatedLoading && (
              <div className="flex items-center gap-3 py-6 text-slate-500 text-sm">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                Calculating vector similarities...
              </div>
            )}

            {/* Error */}
            {relatedError && (
              <div className="text-sm text-rose-600 py-4">{relatedError}</div>
            )}

            {/* Horizontal scrollable row of compact cards */}
            {!relatedLoading && relatedProducts.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-3 snap-x scroll-smooth">
                {relatedProducts.map((item) => (
                  <div key={item._id} className="snap-start">
                    <ProductCard
                      product={item}
                      onClick={handleProductClick}
                      onAddToCart={handleAddToCart}
                      isSelected={selectedProduct?._id === item._id}
                      compact={true}
                    />
                  </div>
                ))}
              </div>
            )}

            {!relatedLoading && !relatedError && relatedProducts.length === 0 && (
              <p className="text-xs text-slate-400 italic py-4">
                No other related products found.
              </p>
            )}
          </div>
        </div>

        {/* Empty home hero (before any search) */}
        {!searchQuery.trim() && (
          <div className="mx-auto max-w-5xl">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">A better basket starts here</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">What are you craving today?</h2>
              </div>
              <span className="hidden text-sm text-slate-500 sm:block">Search by meal, mood, or ingredient</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Fresh & wholesome', query: 'Fresh fruits and vegetables', image: 'photo-1542838132-92c53300491e' },
                { label: 'Snack time', query: 'Salty evening snacks', image: 'photo-1599490659213-e2b9527bd087' },
                { label: 'Bakery favorites', query: 'Fresh baked bread', image: 'photo-1509440159596-0249088772ff' },
              ].map((collection) => (
                <button
                  key={collection.label}
                  type="button"
                  onClick={() => handleChipClick(collection.query)}
                  className="group relative h-40 overflow-hidden rounded-2xl bg-slate-200 text-left shadow-sm"
                >
                  <img
                    src={`https://images.unsplash.com/${collection.image}?auto=format&fit=crop&w=700&q=80`}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
                  <span className="absolute bottom-4 left-4 text-base font-semibold text-white">{collection.label}</span>
                  <ArrowRight className="absolute bottom-4 right-4 h-5 w-5 text-white transition group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
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
        onRemove={(productId) => setCart((currentCart) => currentCart.filter((item) => item._id !== productId))}
        onClear={() => setCart([])}
      />
    </div>
  );
}
