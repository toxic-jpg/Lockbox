import React from 'react';
import { VaultEntry } from '@/lib/db';
import { colorVariants, copyToClipboard } from '@/lib/utils';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Copy, Star, ExternalLink, MoreHorizontal, Edit } from 'lucide-react';
import { Link } from 'wouter';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PasswordRowProps {
  entry: VaultEntry;
}

export function PasswordRow({ entry }: PasswordRowProps) {
  const tags = useLiveQuery(() => 
    db.tags.where('id').anyOf(entry.tags).toArray()
  , [entry.tags]) || [];

  const handleCopyPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (entry.password) {
      copyToClipboard(entry.password, () => toast.success('Password copied'));
      db.auditLog.add({
        id: crypto.randomUUID(),
        entryId: entry.id,
        action: 'copy',
        timestamp: Date.now()
      });
      db.entries.update(entry.id, { lastUsed: Date.now() });
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await db.entries.update(entry.id, { isFavorite: !entry.isFavorite });
    toast.success(entry.isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const getStrengthColor = (score: number | undefined) => {
    if (score === undefined) return 'bg-muted';
    if (score <= 1) return 'bg-destructive';
    if (score === 2) return 'bg-orange-500';
    if (score === 3) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="group flex items-center gap-4 py-3 px-4 bg-card hover:bg-muted/30 border-b border-border/50 last:border-0 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
        {entry.icon && entry.icon.startsWith('http') ? (
          <img src={entry.icon} alt="" className="w-5 h-5 object-contain" onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            e.currentTarget.parentElement!.innerHTML = `<span class="text-sm font-bold">${entry.title.charAt(0)}</span>`;
          }} />
        ) : entry.icon ? (
          <span>{entry.icon}</span>
        ) : (
          <span className="text-sm font-bold">{entry.title.charAt(0)}</span>
        )}
      </div>

      <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
        <div className="col-span-4 lg:col-span-3 flex flex-col truncate">
          <Link href={`/entry/${entry.id}`} className="font-medium truncate hover:text-primary transition-colors cursor-pointer">
            {entry.title}
          </Link>
          {entry.url && (
            <a href={entry.url} target="_blank" rel="noreferrer" className="text-[10px] text-muted-foreground hover:underline truncate" onClick={e => e.stopPropagation()}>
              {entry.url.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          )}
        </div>

        <div className="col-span-4 lg:col-span-3 text-sm text-muted-foreground truncate">
          {entry.username || entry.email || <span className="italic opacity-50">No username</span>}
        </div>

        <div className="col-span-2 hidden lg:flex items-center gap-1 font-mono text-muted-foreground text-xs">
          ••••••••••••
        </div>

        <div className="col-span-4 lg:col-span-3 flex items-center gap-1.5 overflow-hidden">
          {tags.slice(0, 2).map(tag => (
            <span key={tag.id} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
              {tag.name}
            </span>
          ))}
          {tags.length > 2 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              +{tags.length - 2}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className={`w-2 h-2 rounded-full ${getStrengthColor(entry.strength)}`} title="Strength" />
        <button 
          onClick={handleToggleFavorite}
          className={`transition-colors ${entry.isFavorite ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500 opacity-0 group-hover:opacity-100'}`}
        >
          <Star className={`w-4 h-4 ${entry.isFavorite ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={handleCopyPassword}
          className="p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-md transition-colors opacity-0 group-hover:opacity-100"
          title="Copy Password"
        >
          <Copy className="w-4 h-4" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/entry/${entry.id}`}>
                <div className="flex items-center cursor-pointer w-full">
                  <Edit className="w-4 h-4 mr-2" /> Edit Details
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
