import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

const options = {
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  translations: zxcvbnEnPackage.translations,
};
const zxcvbnInstance = new ZxcvbnFactory(options);

export const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:\'",./<>?',
  similar: '0Ol1I',
  ambiguous: '{}[]()/\\\'"`~,;:.<>',
};

export interface GenerateOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar?: boolean;
  excludeAmbiguous?: boolean;
}

function getRandomInt(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

export function generatePassword(options: GenerateOptions): string {
  let charset = '';
  const requiredChars: string[] = [];

  let { uppercase, lowercase, numbers, symbols, excludeSimilar, excludeAmbiguous } = options;
  if (!uppercase && !lowercase && !numbers && !symbols) {
    lowercase = true;
    numbers = true;
  }

  const getFilteredCharset = (chars: string) => {
    let filtered = chars;
    if (excludeSimilar) {
      filtered = filtered.split('').filter(c => !CHARSETS.similar.includes(c)).join('');
    }
    if (excludeAmbiguous) {
      filtered = filtered.split('').filter(c => !CHARSETS.ambiguous.includes(c)).join('');
    }
    return filtered;
  };

  const addCharset = (chars: string, isRequired: boolean) => {
    const filtered = getFilteredCharset(chars);
    if (filtered.length > 0) {
      charset += filtered;
      if (isRequired) {
        requiredChars.push(filtered[getRandomInt(filtered.length)]);
      }
    }
  };

  if (uppercase) addCharset(CHARSETS.uppercase, true);
  if (lowercase) addCharset(CHARSETS.lowercase, true);
  if (numbers) addCharset(CHARSETS.numbers, true);
  if (symbols) addCharset(CHARSETS.symbols, true);

  if (charset.length === 0) return '';

  let password = [...requiredChars];
  
  while (password.length < options.length) {
    password.push(charset[getRandomInt(charset.length)]);
  }

  // Fisher-Yates shuffle
  for (let i = password.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}

export function getStrength(password: string) {
  if (!password) return { score: 0, crackTime: '0 seconds', feedback: { warning: '', suggestions: [] } };
  const result = zxcvbnInstance.check(password);
  return {
    score: result.score, // 0-4
    crackTime: result.crackTimesDisplay.offlineSlowHashing1e4PerSecond,
    feedback: result.feedback,
  };
}

export function calculateEntropy(password: string, charsetSize: number): number {
  if (!password) return 0;
  return Math.round(password.length * Math.log2(charsetSize));
}

// Just a small placeholder wordlist for passphrase gen
export const WORDS = [
  'apple', 'banana', 'orange', 'grape', 'lemon', 'melon', 'berry', 'peach', 
  'cherry', 'plum', 'kiwi', 'mango', 'ocean', 'river', 'mountain', 'forest',
  'desert', 'valley', 'canyon', 'island', 'planet', 'star', 'galaxy', 'comet',
  'rocket', 'spaceship', 'robot', 'computer', 'laptop', 'tablet', 'phone',
  'watch', 'clock', 'time', 'space', 'light', 'dark', 'sun', 'moon', 'sky',
  'cloud', 'rain', 'snow', 'wind', 'storm', 'thunder', 'lightning', 'fire',
  'water', 'earth', 'air', 'metal', 'wood', 'stone', 'rock', 'sand', 'glass',
  'crystal', 'diamond', 'gold', 'silver', 'copper', 'iron', 'steel', 'brass',
  'happy', 'sad', 'angry', 'calm', 'brave', 'scared', 'smart', 'silly',
  'fast', 'slow', 'quick', 'lazy', 'strong', 'weak', 'heavy', 'light',
  'big', 'small', 'tall', 'short', 'wide', 'narrow', 'deep', 'shallow',
  'hot', 'cold', 'warm', 'cool', 'sweet', 'sour', 'bitter', 'salty',
  'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'black', 'white',
  'tiger', 'lion', 'bear', 'wolf', 'fox', 'deer', 'rabbit', 'mouse',
  'eagle', 'hawk', 'owl', 'dove', 'crow', 'swan', 'duck', 'goose'
];

export function generatePassphrase(wordCount: number, separator: string = '-', capitalize: boolean = false): string {
  const words = [];
  for (let i = 0; i < wordCount; i++) {
    let word = WORDS[getRandomInt(WORDS.length)];
    if (capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    words.push(word);
  }
  return words.join(separator);
}

export function generatePin(length: number): string {
  let pin = '';
  for (let i = 0; i < length; i++) {
    pin += getRandomInt(10).toString();
  }
  return pin;
}

export function generateApiKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}
