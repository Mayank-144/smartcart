import React, { useEffect, useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { formatPrice, ProductImage } from './ProductCard';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemove,
  onClear,
  onAddRecommendation,
}) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + Math.round(item.price * 83) * item.quantity,
    0
  );
  const cartItemIds = cart.map((item) => item._id).join(',');
  const recommendationSourceKey = cart.slice(-3).map((item) => item._id).join(',');
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState(null);

  useEffect(() => {
    if (!isOpen || !recommendationSourceKey) {
      setRecommendations([]);
      setRecommendationsLoading(false);
      setRecommendationsError(null);
      return undefined;
    }

    let cancelled = false;
    const recommendationSourceIds = recommendationSourceKey.split(',');
    const cartIds = new Set(cartItemIds.split(','));

    const loadRecommendations = async () => {
      setRecommendations([]);
      setRecommendationsError(null);
      setRecommendationsLoading(true);

      try {
        const batches = await Promise.all(
          recommendationSourceIds.map(async (productId) => {
            const response = await fetch(`/api/product/${productId}/related`);
            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || 'Failed to load cart recommendations');
            }

            return Array.isArray(data.results) ? data.results : [];
          })
        );

        const uniqueRecommendations = new Map();
        for (const product of batches.flat()) {
          if (cartIds.has(product._id)) continue;

          const current = uniqueRecommendations.get(product._id);
          if (!current || (product.score || 0) > (current.score || 0)) {
            uniqueRecommendations.set(product._id, product);
          }
        }

        const rankedRecommendations = [...uniqueRecommendations.values()]
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 6);

        if (!cancelled) setRecommendations(rankedRecommendations);
      } catch (error) {
        if (!cancelled) {
          console.error('Cart recommendation error:', error);
          setRecommendationsError(error.message || 'Failed to load cart recommendations');
        }
      } finally {
        if (!cancelled) setRecommendationsLoading(false);
      }
    };

    loadRecommendations();
    return () => {
      cancelled = true;
    };
  }, [isOpen, cartItemIds, recommendationSourceKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="cart-backdrop-enter absolute inset-0 bg-slate-900/40"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="cart-panel-enter w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Your Cart <span className="text-sm font-normal text-slate-400">({totalItems} items)</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">Your cart is empty</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-xs text-center">
                  Search groceries with AI and add items to your basket!
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl"
                >
                  <ProductImage
                    product={item}
                    className="h-14 w-14 shrink-0 rounded-lg bg-slate-100 object-cover"
                    fallbackClassName="h-14 w-14 shrink-0 rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 truncate">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400 capitalize">{item.category}</span>
                      <span className="text-xs font-medium text-slate-700">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center border border-slate-200 bg-white rounded-lg">
                      <button
                        onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 transition"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-xs font-semibold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 transition"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemove(item._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {cart.length > 0 && (
              <section className="border-t border-slate-100 pt-5">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Recommended for your cart</h3>
                    <p className="text-xs text-slate-400">Picked to go well with your items</p>
                  </div>
                </div>

                {recommendationsLoading && (
                  <div className="flex items-center gap-2 py-4 text-xs text-slate-500">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                    Finding products you might like...
                  </div>
                )}

                {recommendationsError && (
                  <p role="alert" className="py-2 text-xs text-rose-600">
                    Recommendations unavailable: {recommendationsError}
                  </p>
                )}

                {!recommendationsLoading && !recommendationsError && recommendations.length > 0 && (
                  <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
                    {recommendations.map((product) => {
                      const cartItem = cart.find((i) => i._id === product._id);
                      return (
                        <article
                          key={product._id}
                          className="w-40 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm"
                        >
                          <ProductImage
                            product={product}
                            className="h-24 w-full object-cover"
                            fallbackClassName="h-24 w-full"
                          />
                          <div className="p-2.5">
                            <h4 className="truncate text-xs font-semibold text-slate-800" title={product.name}>
                              {product.name}
                            </h4>
                            <p className="mt-0.5 text-xs font-bold text-emerald-700">
                              {formatPrice(product.price)}
                            </p>
                            <div className="mt-2">
                              {cartItem ? (
                                /* Quantity controls — shown when item already in cart */
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                                    <button
                                      type="button"
                                      onClick={() => onUpdateQuantity(cartItem._id, cartItem.quantity - 1)}
                                      className="flex h-7 w-7 items-center justify-center text-slate-500 hover:text-emerald-700 transition"
                                      aria-label="Decrease quantity"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="min-w-[1.25rem] text-center text-xs font-bold text-slate-800">
                                      {cartItem.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => onUpdateQuantity(cartItem._id, cartItem.quantity + 1)}
                                      className="flex h-7 w-7 items-center justify-center text-slate-500 hover:text-emerald-700 transition"
                                      aria-label="Increase quantity"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => onRemove(cartItem._id)}
                                    className="p-1 text-slate-300 hover:text-rose-500 transition"
                                    aria-label="Remove item"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                /* Add button — shown when item not in cart */
                                <button
                                  type="button"
                                  onClick={() => onAddRecommendation(product)}
                                  className="flex w-full items-center justify-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                                  aria-label={`Add ${product.name} to cart`}
                                >
                                  <Plus className="h-3 w-3" />
                                  Add to cart
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                {!recommendationsLoading && !recommendationsError && recommendations.length === 0 && (
                  <p className="py-2 text-xs text-slate-400">
                    No additional recommendations for these items.
                  </p>
                )}
              </section>
            )}
          </div>

          {/* Footer Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-white space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  alert(`Thank you for trying SmartCart! Order placed for ₹${totalPrice} 🎉`);
                  onClear();
                  onClose();
                }}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md shadow-emerald-100 flex items-center justify-center gap-2 transition"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
