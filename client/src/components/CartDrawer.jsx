import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { getProductImageUrl } from './ProductCard';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemove,
  onClear,
}) {
  if (!isOpen) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
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
                  {getProductImageUrl(item.category) ? (
                    <img
                      src={getProductImageUrl(item.category)}
                      alt=""
                      className="h-14 w-14 rounded-lg object-cover bg-slate-100"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-emerald-50 flex items-center justify-center text-2xl">
                      🛒
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 truncate">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400 capitalize">{item.category}</span>
                      <span className="text-xs font-medium text-slate-700">
                        ${item.price.toFixed(2)}
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
          </div>

          {/* Footer Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-white space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  alert(`Thank you for trying SmartCart! Order placed for $${totalPrice.toFixed(2)} 🎉`);
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
