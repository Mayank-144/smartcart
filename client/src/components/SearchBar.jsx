import React, { useEffect, useRef, useState } from 'react';
import { Search, Loader2, X, Clock3 } from 'lucide-react';

const HISTORY_KEY = 'smartcart_history';

function readSearchHistory() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(stored)
      ? [...new Set(stored.filter((item) => typeof item === 'string' && item.trim()))].slice(0, 5)
      : [];
  } catch (error) {
    console.error('Unable to read search history:', error);
    return [];
  }
}

function saveSearchHistory(history) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Unable to save search history:', error);
  }
}

export default function SearchBar({ value, onChange, onClear, loading }) {
  const [history, setHistory] = useState(readSearchHistory);
  const [historyOpen, setHistoryOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const query = value.trim();
    if (!query) return undefined;

    const timeout = setTimeout(() => {
      setHistory((current) => {
        const next = [query, ...current.filter((item) => item !== query)].slice(0, 5);
        saveSearchHistory(next);
        return next;
      });
    }, 800);

    return () => clearTimeout(timeout);
  }, [value]);

  const removeSearch = (query) => {
    setHistory((current) => {
      const next = current.filter((item) => item !== query);
      saveSearchHistory(next);
      return next;
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      <div className="relative flex items-center">
        {/* Search icon */}
        <div className="absolute left-4 pointer-events-none">
          <Search className="w-5 h-5 text-emerald-600" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setHistoryOpen(true)}
          onBlur={() => setTimeout(() => setHistoryOpen(false), 120)}
          placeholder="Search for milk, chips, bread..."
          className="w-full rounded-full border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-base text-slate-800 shadow-sm placeholder-slate-400 transition duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

      {historyOpen && !value.trim() && history.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-left shadow-xl">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Recent searches
          </p>
          {history.map((query) => (
            <div key={query} className="flex items-center rounded-xl hover:bg-emerald-50">
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(query);
                  setHistoryOpen(false);
                  inputRef.current?.focus();
                }}
                className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-sm text-slate-700"
              >
                <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate">{query}</span>
              </button>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => removeSearch(query)}
                aria-label={`Remove ${query} from search history`}
                className="mr-2 rounded-full p-1.5 text-slate-400 transition hover:bg-white hover:text-rose-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
