import React, { useState } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';

const categoryEmojis = {
  dairy: '🥛',
  snacks: '🍿',
  beverages: '🥤',
  bakery: '🍞',
  fruits: '🍎',
  vegetables: '🥦',
};

const categoryBadgeStyles = {
  dairy: 'bg-blue-50/95 text-blue-700 border-blue-200',
  snacks: 'bg-orange-50/95 text-orange-700 border-orange-200',
  beverages: 'bg-green-50/95 text-green-700 border-green-200',
  bakery: 'bg-yellow-50/95 text-yellow-800 border-yellow-200',
  fruits: 'bg-red-50/95 text-red-700 border-red-200',
  vegetables: 'bg-emerald-50/95 text-emerald-700 border-emerald-200',
};

const categoryFallbackBgs = {
  dairy: 'bg-blue-50',
  snacks: 'bg-orange-50',
  beverages: 'bg-green-50',
  bakery: 'bg-amber-50',
  fruits: 'bg-rose-50',
  vegetables: 'bg-emerald-50',
};

const categoryImages = {
  dairy: 'photo-1550583724-b2692b85b150',
  snacks: 'photo-1599490659213-e2b9527bd087',
  beverages: 'photo-1544145945-f90425340c7e',
  bakery: 'photo-1509440159596-0249088772ff',
  fruits: 'photo-1610832958506-aa56368176cf',
  vegetables: 'photo-1540420773420-3366772f4999',
};

export function getProductImageUrl(category) {
  const imageId = categoryImages[category?.toLowerCase()];
  return imageId
    ? `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=640&q=80`
    : null;
}

export default function ProductCard({
  product,
  onClick,
  onAddToCart,
  isSelected,
  compact = false,
}) {
  const { name, category, price, description, score } = product;
  const [imageError, setImageError] = useState(false);

  const catKey = category?.toLowerCase();
  const categoryClass = categoryBadgeStyles[catKey] || 'bg-slate-100 text-slate-700 border-slate-200';
  const fallbackBg = categoryFallbackBgs[catKey] || 'bg-slate-100';
  const emoji = categoryEmojis[catKey] || '🛒';

  const formattedScore =
    typeof score === 'number' && !isNaN(score)
      ? `${Math.min(100, Math.max(0, Math.round(score * 100)))}% match`
      : null;

  const imageUrl = getProductImageUrl(category);

  return (
    <div
      onClick={() => onClick && onClick(product)}
      className={`group relative flex flex-col justify-between rounded-2xl border border-slate-100 shadow-sm bg-white overflow-hidden transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'ring-2 ring-emerald-500 shadow-md'
          : 'hover:-translate-y-1 hover:shadow-lg'
      } ${compact ? 'w-48 min-w-[12rem] flex-shrink-0' : 'w-full'}`}
    >
      <div className={`relative w-full ${compact ? 'h-32' : 'h-[180px]'} bg-slate-100 overflow-hidden`}>
        <span
          className={`absolute top-2 left-2 z-10 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border shadow-xs capitalize ${categoryClass}`}
        >
          {category || 'Grocery'}
        </span>

        {formattedScore && (
          <span className="absolute top-2 right-2 z-10 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-white/95 text-emerald-700 border border-emerald-100 shadow-sm">
            {formattedScore}
          </span>
        )}

        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={name}
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${fallbackBg}`}
          >
            <span className={compact ? 'text-4xl' : 'text-5xl'} role="img" aria-label={category}>
              {emoji}
            </span>
          </div>
        )}
      </div>

      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-semibold text-base text-slate-800 group-hover:text-emerald-700 transition-colors duration-150 line-clamp-1">
            {name}
          </h3>

          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-8">
            {description}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-base font-bold text-slate-900">
            ${typeof price === 'number' ? price.toFixed(2) : price}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAddToCart?.(product);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            aria-label={`Add ${name} to cart`}
          >
            {compact ? <Plus className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
            {compact ? 'Add' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
