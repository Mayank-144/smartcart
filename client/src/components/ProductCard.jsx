import React, { useEffect, useState } from 'react';
import { Plus, ShoppingCart, ArrowLeftRight } from 'lucide-react';

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

export function formatPrice(price) {
  return `₹${typeof price === 'number' ? Math.round(price * 83) : price}`;
}

export function ProductImage({
  product,
  alt = '',
  className,
  fallbackClassName,
  emojiClassName,
}) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = typeof product.image === 'string' ? product.image.trim() : '';
  const category = product.category?.toLowerCase();
  const fallbackBg = categoryFallbackBgs[category] || 'bg-slate-100';
  const emoji = categoryEmojis[category] || '🛒';

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  if (imageError || !imageUrl) {
    return (
      <div
        title={imageError ? 'Product photo unavailable.' : undefined}
        className={`flex items-center justify-center ${fallbackBg} ${fallbackClassName || className || ''}`}
      >
        <span className={emojiClassName || 'text-3xl'} role="img" aria-label={product.category}>
          {emoji}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full ${fallbackClassName || ''}`}>
      <img
        src={imageUrl}
        alt={alt}
        onError={() => setImageError(true)}
        loading="lazy"
        className={className}
      />
    </div>
  );
}

export default function ProductCard({
  product,
  onClick,
  onAddToCart,
  onFindSubstitute,
  isSelected,
  index = -1,
  relationshipLabel,
  compact = false,
}) {
  const { name, category, price, description, score } = product;

  const catKey = category?.toLowerCase();
  const categoryClass = categoryBadgeStyles[catKey] || 'bg-slate-100 text-slate-700 border-slate-200';

  const formattedScore =
    typeof score === 'number' && !isNaN(score)
      ? `${Math.min(100, Math.max(0, Math.round(score * 100)))}% match`
      : null;

  const isPopular = index >= 0 && index % 5 === 0;

  return (
    <div
      onClick={() => onClick && onClick(product)}
      className={`group relative flex flex-col justify-between rounded-2xl border border-slate-100 shadow-sm bg-white overflow-hidden transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'ring-2 ring-emerald-500 shadow-md'
          : 'hover:-translate-y-1 hover:shadow-lg'
      } ${compact ? 'w-48 min-w-[12rem] flex-shrink-0' : 'w-full'}`}
    >
      <div className={`relative w-full ${compact ? 'h-32' : 'h-44'} bg-slate-100 overflow-hidden`}>
        <span
          className={`absolute top-2 left-2 z-10 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border shadow-xs capitalize ${categoryClass}`}
        >
          {category || 'Grocery'}
        </span>

        {isPopular && (
          <span className="absolute bottom-2 left-2 z-10 rounded-full border border-amber-200 bg-white/95 px-2 py-0.5 text-xs font-semibold text-amber-700 shadow-sm">
            ⭐ Popular
          </span>
        )}

        {formattedScore && (
          <span className="absolute top-2 right-2 z-10 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-white/95 text-emerald-700 border border-emerald-100 shadow-sm">
            {formattedScore}
          </span>
        )}

        <ProductImage
          product={product}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          fallbackClassName="h-full w-full"
          emojiClassName={compact ? 'text-4xl' : 'text-5xl'}
        />
      </div>

      <div className="p-3.5 flex flex-col flex-1">
        <div>
          {relationshipLabel && (
            <span className="mb-1 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              {relationshipLabel}
            </span>
          )}
          <h3 className="font-semibold text-sm text-slate-800 group-hover:text-emerald-700 transition-colors duration-150 line-clamp-1">
            {name}
          </h3>

          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-8">
            {description}
          </p>
        </div>

        <div className="mt-auto pt-3">
          <div className="mb-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-base font-bold text-emerald-700">
              {formatPrice(price)}
            </span>
            {onFindSubstitute && !compact && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onFindSubstitute(product);
                }}
                title="Out of stock? Find AI substitute"
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <ArrowLeftRight className="h-3 w-3" />
                Swap
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAddToCart?.(product);
            }}
            className="inline-flex w-full items-center justify-center gap-1 rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
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
