import React from 'react';
import { Search, Loader2, X } from 'lucide-react';

export default function SearchBar({ value, onChange, onClear, loading }) {
  return (
    <div className="w-full max-w-2xl mx-auto relative">
      <div className="relative flex items-center">
        {/* Search icon */}
        <div className="absolute left-4 pointer-events-none">
          <Search className="w-5 h-5 text-emerald-600" />
        </div>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search for milk, chips, bread..."
          className="w-full pl-12 pr-12 py-3.5 text-base bg-white border border-white/70 rounded-full shadow-lg shadow-emerald-950/10 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
          autoFocus
        />

        {/* Spinner or Clear Button */}
        <div className="absolute right-4 flex items-center">
          {loading ? (
            <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
          ) : value ? (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear search"
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
