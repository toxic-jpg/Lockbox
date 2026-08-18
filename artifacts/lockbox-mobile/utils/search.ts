function levenshtein(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = a[i - 1] === b[j - 1]
        ? previous[j - 1]
        : Math.min(previous[j - 1] + 1, previous[j] + 1, current[j - 1] + 1);
    }
    for (let j = 0; j <= b.length; j++) previous[j] = current[j];
  }
  return previous[b.length];
}

function isSubsequence(query: string, target: string): boolean {
  let cursor = 0;
  for (const char of target) {
    if (char === query[cursor]) cursor++;
    if (cursor === query.length) return true;
  }
  return query.length === 0;
}

export function fuzzyScore(query: string, target: string): number {
  const q = query.trim().toLowerCase();
  const t = target.trim().toLowerCase();
  if (!q) return 1;
  if (!t) return 0;
  if (t.includes(q)) return 1;
  if (isSubsequence(q, t)) return 0.78;

  const words = t.split(/[\s:/_.@-]+/).filter(Boolean);
  const best = words.reduce((score, word) => {
    const distance = levenshtein(q, word);
    return Math.max(score, 1 - distance / Math.max(q.length, word.length));
  }, 0);
  return best;
}

export function fuzzyMatches(query: string, fields: string[]): boolean {
  const q = query.trim();
  if (!q) return true;
  return fields.some(field => fuzzyScore(q, field) >= 0.52);
}