import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(timestamp));
}

export function formatDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(timestamp));
}

export const colorVariants: Record<string, string> = {
  indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  violet: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  sky: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  fuchsia: 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20',
  lime: 'bg-lime-500/10 text-lime-500 border-lime-500/20',
  orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  default: 'bg-primary/10 text-primary border-primary/20',
  muted: 'bg-muted text-muted-foreground border-border',
};

export const bgVariants: Record<string, string> = {
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  sky: 'bg-sky-500',
  fuchsia: 'bg-fuchsia-500',
  lime: 'bg-lime-500',
  orange: 'bg-orange-500',
  default: 'bg-primary',
  muted: 'bg-muted-foreground',
};

export function copyToClipboard(text: string, cb?: () => void) {
  navigator.clipboard.writeText(text).then(() => {
    if (cb) cb();
  }).catch(console.error);
}

export function getFaviconUrl(url: string) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch (e) {
    return null;
  }
}
