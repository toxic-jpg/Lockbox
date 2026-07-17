import React, { useState, useEffect } from 'react';
import { VaultEntry } from '@/lib/db';
import { colorVariants, copyToClipboard } from '@/lib/utils';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Copy, Star, MoreVertical, KeyRound, ExternalLink, Edit } from 'lucide-react';
import { Link } from 'wouter';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PasswordCardProps {
  entry: VaultEntry;
}

export function PasswordCard({ entry }: PasswordCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const tags = useLiveQuery(() => 
    db.tags.where('id').anyOf(entry.tags).toArray()
  , [entry.tags]) || [];

  const colorClass = colorVariants[entry.color || 'default'] || colorVariants.default;
  // Get just the border color for the accent strip
  const borderColor = colorClass.split(' ').find(c => c.startsWith('border-'))?.replace('border-', 'bg-') || 'bg-primary';

  const handleCopyPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (entry.password) {
      copyToClipboard(entry.password, () => toast.success('Password copied to clipboard'));
      // Update audit log
      db.auditLog.add({
        id: crypto.randomUUID(),
        entryId: entry.id,
        action: 'copy',
        timestamp: Date.now()
      });
      db.entries.update(entry.id, { lastUsed: Date.now() });
    } else {
      toast.error('No password to copy');
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
    <div 
      className="group relative bg-card border border-card-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full hover:border-primary/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute top-0 left-0 w-full h-1 ${borderColor} opacity-70`} />
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden border border-border/50 flex-shrink-0">
            {entry.icon && entry.icon.startsWith('http') ? (
              <img src={entry.icon} alt="" className="w-6 h-6 object-contain" onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<span class="text-xl font-bold">${entry.title.charAt(0)}</span>`;
              }} />
            ) : entry.icon ? (
              <span className="text-2xl">{entry.icon}</span>
            ) : (
              <span className="text-xl font-bold text-muted-foreground">{entry.title.charAt(0)}</span>
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <Link href={`/entry/${entry.id}`} className="font-semibold text-base truncate hover:text-primary transition-colors cursor-pointer">
              {entry.title}
            </Link>
            {entry.username ? (
              <span className="text-xs text-muted-foreground truncate">{entry.username}</span>
            ) : entry.email ? (
              <span className="text-xs text-muted-foreground truncate">{entry.email}</span>
            ) : (
              <span className="text-xs text-muted-foreground truncate italic">No username</span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleCopyPassword}>
              <Copy className="w-4 h-4 mr-2" /> Copy Password
            </DropdownMenuItem>
            {entry.username && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(entry.username!, () => toast.success('Username copied'));
              }}>
                <Copy className="w-4 h-4 mr-2" /> Copy Username
              </DropdownMenuItem>
            )}
            {entry.url && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                window.open(entry.url, '_blank');
              }}>
                <ExternalLink className="w-4 h-4 mr-2" /> Open URL
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
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

      <div className="flex-1 flex flex-col justify-center py-2">
        <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground/80">
          <KeyRound className="w-3 h-3" />
          <span>••••••••••••</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
        <div className="flex items-center gap-1 overflow-hidden">
          {tags.slice(0, 2).map(tag => (
            <span key={tag.id} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground truncate max-w-[80px]">
              {tag.icon} {tag.name}
            </span>
          ))}
          {tags.length > 2 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              +{tags.length - 2}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStrengthColor(entry.strength)}`} title="Password Strength" />
            <button 
              onClick={handleToggleFavorite}
              className={`transition-colors ${entry.isFavorite ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500'}`}
            >
              <Star className={`w-4 h-4 ${entry.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleCopyPassword}
              className="p-1.5 bg-primary/10 text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              title="Copy Password"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
