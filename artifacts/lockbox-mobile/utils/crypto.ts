export const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  similar: 'ilLo0O',
  ambiguous: "{}[]()/\\'\"`,;:.<>",
};

const WORDLIST = [
  'apple','bridge','cloud','dance','eagle','flame','grove','harbor','island',
  'jungle','knight','lemon','maple','noble','ocean','petal','quest','river',
  'stone','tiger','urban','violet','winter','xenon','yellow','zephyr','amber',
  'breeze','coral','delta','ember','frost','glass','honey','ivory','jade',
  'karma','lunar','mango','nexus','onyx','prism','quartz','radar','sigma',
  'topaz','ultra','venom','waltz','youth','zenith','adobe','blaze','cedar',
  'drift','elite','forge','grace','haze','ignite','joker','lance','magic',
  'north','orbit','proxy','quick','raven','swift','torch','unity','vapor',
  'wave','adobe','blaze','cedar','drift','elite','forge','grace','raven',
];

const MEMORABLE_WORDS = [
  'sunny', 'little', 'quiet', 'happy', 'brave', 'clever', 'bright', 'gentle',
  'silver', 'golden', 'cosmic', 'hidden', 'magic', 'velvet', 'wild', 'calm',
  'forest', 'river', 'meadow', 'rocket', 'planet', 'panda', 'otter', 'fox',
  'garden', 'candle', 'coffee', 'thunder', 'rainbow', 'summer', 'moon',
];

function getRandomInt(max: number): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  return Math.floor(Math.random() * max);
}

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
}

export function generatePassword(opts: PasswordOptions): string {
  let charset = '';
  if (opts.uppercase) charset += CHARSETS.uppercase;
  if (opts.lowercase) charset += CHARSETS.lowercase;
  if (opts.numbers) charset += CHARSETS.numbers;
  if (opts.symbols) charset += CHARSETS.symbols;
  if (!charset) charset = CHARSETS.lowercase + CHARSETS.numbers;
  if (opts.excludeSimilar) charset = charset.split('').filter(c => !CHARSETS.similar.includes(c)).join('');
  if (opts.excludeAmbiguous) charset = charset.split('').filter(c => !CHARSETS.ambiguous.includes(c)).join('');
  return Array.from({ length: opts.length }, () => charset[getRandomInt(charset.length)]).join('');
}

export function generatePassphrase(wordCount: number, separator: string, capitalize: boolean, memorable = false): string {
  const list = memorable ? MEMORABLE_WORDS : WORDLIST;
  return Array.from({ length: wordCount }, () => {
    const w = list[getRandomInt(list.length)];
    return capitalize ? w.charAt(0).toUpperCase() + w.slice(1) : w;
  }).join(separator);
}

export function generatePin(length: number): string {
  return Array.from({ length }, () => getRandomInt(10).toString()).join('');
}

export function generateApiKey(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function calculateStrength(password: string): number {
  if (!password || password.length < 4) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(4, Math.floor((score / 6) * 5));
}

export function getStrengthLabel(score: number): string {
  return ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][score] ?? 'Unknown';
}

export function getStrengthHex(score: number): string {
  return ['#EF4444', '#f97316', '#eab308', '#3b82f6', '#10b981'][score] ?? '#9ca3af';
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
