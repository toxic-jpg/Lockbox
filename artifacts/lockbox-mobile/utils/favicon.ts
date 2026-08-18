export function faviconForUrl(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(normalized);
    if (!url.hostname) return undefined;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url.hostname)}&sz=128`;
  } catch {
    return undefined;
  }
}