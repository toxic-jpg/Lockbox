import React, { useState, useEffect } from 'react';
import { useAppState } from '@/lib/store';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, VaultEntry } from '@/lib/db';
import { PasswordCard } from '@/components/vault/PasswordCard';
import { PasswordRow } from '@/components/vault/PasswordRow';
import { Filter, Search, SortAsc, Clock, ShieldAlert, Tags, Star, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

type SortOption = 'alpha-asc' | 'alpha-desc' | 'created-desc' | 'created-asc' | 'used-desc' | 'strength-asc';

export default function Vault() {
  const { viewMode, searchQuery, setSearchQuery } = useAppState();
  const [location] = useLocation();
  const [sortBy, setSortBy] = useState<SortOption>('created-desc');
  
  // Parse URL search params for initial filters
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null); // 'favorites', 'weak', 'strong'

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setActiveCategory(params.get('category'));
    setActiveTag(params.get('tag'));
    setActiveFilter(params.get('filter'));
  }, [location]);

  const allEntries = useLiveQuery(() => db.entries.toArray()) || [];
  const categories = useLiveQuery(() => db.categories.toArray()) || [];
  const tags = useLiveQuery(() => db.tags.toArray()) || [];

  // Filter logic
  let processedEntries = allEntries.filter(e => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch = e.title.toLowerCase().includes(q) || 
                            (e.username && e.username.toLowerCase().includes(q)) ||
                            (e.url && e.url.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    // Sidebar filters
    if (activeCategory && e.categoryId !== activeCategory) return false;
    if (activeTag && !e.tags.includes(activeTag)) return false;
    
    if (activeFilter === 'favorites' && !e.isFavorite) return false;
    if (activeFilter === 'weak' && (e.strength === undefined || e.strength > 1)) return false;
    if (activeFilter === 'strong' && e.strength !== 4) return false;

    return true;
  });

  // Sort logic
  processedEntries.sort((a, b) => {
    switch (sortBy) {
      case 'alpha-asc': return a.title.localeCompare(b.title);
      case 'alpha-desc': return b.title.localeCompare(a.title);
      case 'created-desc': return b.createdAt - a.createdAt;
      case 'created-asc': return a.createdAt - b.createdAt;
      case 'used-desc': return (b.lastUsed || 0) - (a.lastUsed || 0);
      case 'strength-asc': return (a.strength || 0) - (b.strength || 0);
      default: return 0;
    }
  });

  const clearFilters = () => {
    setActiveCategory(null);
    setActiveTag(null);
    setActiveFilter(null);
    setSearchQuery('');
    // Remove query params from URL without reload
    window.history.replaceState({}, '', '/vault');
  };

  const getSortLabel = () => {
    switch(sortBy) {
      case 'alpha-asc': return 'A-Z';
      case 'alpha-desc': return 'Z-A';
      case 'created-desc': return 'Newest';
      case 'created-asc': return 'Oldest';
      case 'used-desc': return 'Recently Used';
      case 'strength-asc': return 'Weakest First';
      default: return 'Sort';
    }
  };

  return (
    <div className="flex h-full gap-6">
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col space-y-4">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-2 rounded-lg border border-border/50">
          
          <div className="flex items-center gap-2 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-background text-muted-foreground border-dashed">
                  <Filter className="w-4 h-4 mr-2" />
                  Category
                  {activeCategory && <span className="ml-2 bg-primary/20 text-primary px-1.5 rounded-sm text-xs">{categories.find(c => c.id === activeCategory)?.name}</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 max-h-80 overflow-y-auto">
                <DropdownMenuItem onClick={() => setActiveCategory(null)}>All Categories</DropdownMenuItem>
                <DropdownMenuSeparator />
                {categories.map(c => (
                  <DropdownMenuItem key={c.id} onClick={() => setActiveCategory(c.id)}>
                    <span className="w-5">{c.icon}</span> {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-background text-muted-foreground border-dashed">
                  <Tags className="w-4 h-4 mr-2" />
                  Tag
                  {activeTag && <span className="ml-2 bg-primary/20 text-primary px-1.5 rounded-sm text-xs">{tags.find(t => t.id === activeTag)?.name}</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 max-h-80 overflow-y-auto">
                <DropdownMenuItem onClick={() => setActiveTag(null)}>All Tags</DropdownMenuItem>
                <DropdownMenuSeparator />
                {tags.map(t => (
                  <DropdownMenuItem key={t.id} onClick={() => setActiveTag(t.id)}>
                    <span className="w-5">{t.icon}</span> {t.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-background text-muted-foreground border-dashed">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filter
                  {activeFilter && <span className="ml-2 bg-primary/20 text-primary px-1.5 rounded-sm text-xs capitalize">{activeFilter}</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setActiveFilter(null)}>None</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveFilter('favorites')}><Star className="w-4 h-4 mr-2 text-amber-500" /> Favorites</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveFilter('weak')}><ShieldAlert className="w-4 h-4 mr-2 text-destructive" /> Weak Passwords</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveFilter('strong')}><ShieldAlert className="w-4 h-4 mr-2 text-emerald-500" /> Strong Passwords</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {(activeCategory || activeTag || activeFilter || searchQuery) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground">
                Clear Filters
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap hidden md:inline">
              {processedEntries.length} items
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="ml-auto">
                  <SortAsc className="w-4 h-4 mr-2" />
                  {getSortLabel()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSortBy('alpha-asc')}>Alphabetical (A-Z)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('alpha-desc')}>Alphabetical (Z-A)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy('created-desc')}>Date Created (Newest)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('created-asc')}>Date Created (Oldest)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy('used-desc')}><Clock className="w-4 h-4 mr-2" /> Recently Used</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('strength-asc')}><ShieldAlert className="w-4 h-4 mr-2" /> Weakest First</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Entries Grid/List */}
        <div className="flex-1 overflow-y-auto pb-20">
          {processedEntries.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-xl mt-4">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p>No entries found matching your filters.</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4" : "flex flex-col rounded-xl overflow-hidden border mt-4"}>
              {processedEntries.map(entry => 
                viewMode === 'grid' 
                  ? <PasswordCard key={entry.id} entry={entry} />
                  : <PasswordRow key={entry.id} entry={entry} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
