import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useAppState } from '@/lib/store';
import { PasswordCard } from '@/components/vault/PasswordCard';
import { PasswordRow } from '@/components/vault/PasswordRow';
import { KeyRound, Star, ShieldAlert, ShieldCheck, Clock, Plus, Tag as TagIcon } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { viewMode, searchQuery } = useAppState();

  const allEntries = useLiveQuery(() => db.entries.toArray()) || [];
  const tags = useLiveQuery(() => db.tags.orderBy('priority').toArray()) || [];
  const categories = useLiveQuery(() => db.categories.toArray()) || [];

  // Computed stats
  const totalEntries = allEntries.length;
  const favorites = allEntries.filter(e => e.isFavorite);
  const weakPasswords = allEntries.filter(e => e.strength !== undefined && e.strength <= 1);
  const strongPasswords = allEntries.filter(e => e.strength === 4);
  
  // Recent logic
  const recentlyAccessed = [...allEntries]
    .filter(e => e.lastUsed !== undefined)
    .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
    .slice(0, 5);

  // Filter for display based on search
  const filteredEntries = allEntries.filter(e => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      e.title.toLowerCase().includes(query) ||
      (e.username && e.username.toLowerCase().includes(query)) ||
      (e.email && e.email.toLowerCase().includes(query)) ||
      (e.url && e.url.toLowerCase().includes(query))
    );
  });

  const displayFavorites = favorites.filter(f => filteredEntries.some(e => e.id === f.id));
  const displayImportant = allEntries.filter(e => e.isImportant && filteredEntries.some(f => f.id === e.id));

  // Container variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-10">
      
      {/* Search active state */}
      {searchQuery ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Search Results <span className="text-muted-foreground text-sm font-normal">({filteredEntries.length})</span>
          </h2>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
              No entries found for "{searchQuery}"
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col rounded-xl overflow-hidden border"}>
              {filteredEntries.map(entry => 
                viewMode === 'grid' 
                  ? <PasswordCard key={entry.id} entry={entry} />
                  : <PasswordRow key={entry.id} entry={entry} />
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/vault">
              <motion.div whileHover={{ scale: 1.02 }} className="bg-card border p-4 rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                  <KeyRound className="w-5 h-5 text-primary" />
                  <span className="font-medium text-sm">Total Vault</span>
                </div>
                <div className="text-3xl font-bold">{totalEntries}</div>
              </motion.div>
            </Link>
            
            <Link href="/vault?filter=favorites">
              <motion.div whileHover={{ scale: 1.02 }} className="bg-card border p-4 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                  <Star className="w-5 h-5 text-amber-500" />
                  <span className="font-medium text-sm">Favorites</span>
                </div>
                <div className="text-3xl font-bold">{favorites.length}</div>
              </motion.div>
            </Link>

            <Link href="/vault?filter=weak">
              <motion.div whileHover={{ scale: 1.02 }} className="bg-card border p-4 rounded-xl cursor-pointer hover:border-destructive/50 transition-colors">
                <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                  <ShieldAlert className="w-5 h-5 text-destructive" />
                  <span className="font-medium text-sm">Weak Passwords</span>
                </div>
                <div className="text-3xl font-bold">{weakPasswords.length}</div>
              </motion.div>
            </Link>

            <Link href="/vault?filter=strong">
              <motion.div whileHover={{ scale: 1.02 }} className="bg-card border p-4 rounded-xl cursor-pointer hover:border-emerald-500/50 transition-colors">
                <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium text-sm">Strong Passwords</span>
                </div>
                <div className="text-3xl font-bold">{strongPasswords.length}</div>
              </motion.div>
            </Link>
          </div>

          {/* Recently Accessed */}
          {recentlyAccessed.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Recently Accessed
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recentlyAccessed.slice(0, viewMode === 'grid' ? 4 : 3).map(entry => (
                  <PasswordCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          )}

          {/* Favorites */}
          {displayFavorites.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500/20" /> Favorites
              </h2>
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col rounded-xl overflow-hidden border"}
              >
                {displayFavorites.map(entry => (
                  <motion.div key={entry.id} variants={itemVariants}>
                    {viewMode === 'grid' 
                      ? <PasswordCard entry={entry} />
                      : <PasswordRow entry={entry} />}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* Important */}
          {displayImportant.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" /> Important items
              </h2>
              <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col rounded-xl overflow-hidden border"}>
                {displayImportant.map(entry => 
                  viewMode === 'grid' 
                    ? <PasswordCard key={entry.id} entry={entry} />
                    : <PasswordRow key={entry.id} entry={entry} />
                )}
              </div>
            </div>
          )}

          {/* Categories Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {categories.slice(0, 10).map(cat => {
                const count = allEntries.filter(e => e.categoryId === cat.id).length;
                return (
                  <Link key={cat.id} href={`/vault?category=${cat.id}`}>
                    <div className="bg-card border p-3 rounded-lg flex items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors group">
                      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                        {cat.icon}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium text-sm truncate">{cat.name}</span>
                        <span className="text-xs text-muted-foreground">{count} items</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Tag Cloud */}
          {tags.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TagIcon className="w-5 h-5" /> Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => {
                  const count = allEntries.filter(e => e.tags.includes(tag.id)).length;
                  return (
                    <Link key={tag.id} href={`/vault?tag=${tag.id}`}>
                      <div className="px-3 py-1.5 rounded-full bg-card border hover:border-primary/50 transition-colors cursor-pointer flex items-center gap-1.5 text-sm">
                        <span className="opacity-70">{tag.icon}</span>
                        <span className="font-medium">{tag.name}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 rounded-full">{count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3">
        <Link href="/add">
          <button className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Plus className="w-6 h-6" />
          </button>
        </Link>
      </div>

    </div>
  );
}
