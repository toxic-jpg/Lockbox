import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutGrid, 
  KeyRound, 
  Settings, 
  Tags, 
  LogOut,
  Plus,
  ShieldCheck,
  Search,
  FolderOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppState } from '@/lib/store';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { setIsUnlocked } = useAppState();

  const categories = useLiveQuery(() => db.categories.toArray()) || [];
  const tags = useLiveQuery(() => db.tags.orderBy('priority').toArray()) || [];

  const mainLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutGrid },
    { href: '/vault', label: 'All Items', icon: KeyRound },
    { href: '/generator', label: 'Generator', icon: ShieldCheck },
  ];

  return (
    <div className={cn("flex flex-col h-full bg-sidebar border-r border-sidebar-border w-64 text-sidebar-foreground", className)}>
      <div className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
          <KeyRound className="w-4 h-4 text-primary" />
        </div>
        <span className="font-bold text-lg tracking-tight">LockBox</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div className="space-y-1">
          {mainLinks.map((link) => {
            const isActive = location === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}>
                  <Icon className="w-4 h-4" />
                  {link.label}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider flex items-center justify-between">
            Categories
          </div>
          {categories.slice(0, 5).map(cat => (
            <Link key={cat.id} href={`/vault?category=${cat.id}`}>
              <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground group">
                <span className="w-4 text-center">{cat.icon}</span>
                <span className="flex-1 truncate">{cat.name}</span>
              </div>
            </Link>
          ))}
          {categories.length > 5 && (
            <Link href="/vault">
              <div className="px-3 py-2 text-xs font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground cursor-pointer">
                View all categories...
              </div>
            </Link>
          )}
        </div>

        <div className="space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider flex items-center justify-between">
            Tags
            <Link href="/tags">
              <Settings className="w-3 h-3 cursor-pointer hover:text-sidebar-foreground transition-colors" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-1 px-3">
            {tags.slice(0, 10).map(tag => (
              <Link key={tag.id} href={`/vault?tag=${tag.id}`}>
                <div className="px-2 py-1 rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-foreground/70 hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer flex items-center gap-1 border border-transparent hover:border-primary/20">
                  <span className="opacity-70 text-[10px]">{tag.icon}</span>
                  {tag.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-sidebar-border space-y-1">
        <Link href="/add">
          <div className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer shadow-sm mb-4">
            <Plus className="w-4 h-4" />
            New Item
          </div>
        </Link>

        <Link href="/settings">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground">
            <Settings className="w-4 h-4" />
            Settings
          </div>
        </Link>
        <button 
          onClick={() => setIsUnlocked(false)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive text-left"
        >
          <LogOut className="w-4 h-4" />
          Lock Vault
        </button>
      </div>
    </div>
  );
}
