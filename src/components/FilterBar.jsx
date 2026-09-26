import React from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';
import { CATEGORIES, SORT_OPTIONS, POPULAR_SEARCH_TAGS } from '../data/presets';

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  totalResults,
}) {
  return (
    <div className="space-y-4 mb-6">
      {/* Top Search & Controls Row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search extensions by name, keyword, or identifier (e.g., ms-python.python)..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-base sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & View Mode Controls */}
        <div className="flex items-center gap-2.5">
          {totalResults > 0 && (
            <span className="text-[11px] text-slate-500 font-mono hidden xl:inline">
              {totalResults.toLocaleString()} results
            </span>
          )}

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(Number(e.target.value))}
              aria-label="Sort extensions"
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              {SORT_OPTIONS.map((opt) => (
                <option
                  key={opt.id}
                  value={opt.id}
                  className="bg-slate-900 text-slate-200"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Search Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium pr-1 whitespace-nowrap">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Quick picks:
        </span>
        {POPULAR_SEARCH_TAGS.map((tag) => (
          <button
            key={tag.label}
            onClick={() => setSearchQuery(tag.query)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium whitespace-nowrap transition-all ${
              searchQuery === tag.query
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 border-b border-slate-800/60 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/80'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
