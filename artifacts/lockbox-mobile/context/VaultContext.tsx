import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { calculateStrength, generateId } from '@/utils/crypto';
import { faviconForUrl } from '@/utils/favicon';

export interface VaultEntry {
  id: string;
  title: string;
  username?: string;
  email?: string;
  password: string;
  notes?: string;
  url?: string;
  categoryId: string;
  folder?: string;
  tags: string[];
  faviconUrl?: string;
  color: string;
  isFavorite: boolean;
  isImportant: boolean;
  twoFactorEnabled: boolean;
  strength: number;
  createdAt: number;
  updatedAt: number;
  lastUsed?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'social', name: 'Social', icon: 'people', color: '#3b82f6' },
  { id: 'work', name: 'Work', icon: 'briefcase', color: '#8b5cf6' },
  { id: 'banking', name: 'Banking', icon: 'card', color: '#10b981' },
  { id: 'entertainment', name: 'Entertainment', icon: 'play-circle', color: '#f59e0b' },
  { id: 'shopping', name: 'Shopping', icon: 'bag', color: '#f43f5e' },
  { id: 'gaming', name: 'Gaming', icon: 'game-controller', color: '#6366f1' },
  { id: 'other', name: 'Other', icon: 'grid', color: '#6b7280' },
];

export interface AppSettings {
  clipboardTimeout: number;
  autoLockTimeout: number;
}

const DEFAULT_SETTINGS: AppSettings = { clipboardTimeout: 30, autoLockTimeout: 5 };

const SEED_ENTRIES: Omit<VaultEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { title: 'GitHub', username: 'dev@example.com', email: 'dev@example.com', password: 'Gh!tHub#Secure2024', url: 'https://github.com', categoryId: 'work', tags: [], color: '#6366f1', isFavorite: true, isImportant: false, twoFactorEnabled: true, strength: 4 },
  { title: 'Gmail', username: 'me@gmail.com', email: 'me@gmail.com', password: 'G00gl3P@ssw0rd!', url: 'https://gmail.com', categoryId: 'work', tags: [], color: '#f43f5e', isFavorite: true, isImportant: true, twoFactorEnabled: false, strength: 3 },
  { title: 'Netflix', username: 'movies@example.com', email: 'movies@example.com', password: 'netflix123', url: 'https://netflix.com', categoryId: 'entertainment', tags: [], color: '#f59e0b', isFavorite: false, isImportant: false, twoFactorEnabled: false, strength: 1 },
  { title: 'Discord', username: 'gamer#1234', password: 'D!sc0rd$ecure99', url: 'https://discord.com', categoryId: 'gaming', tags: [], color: '#8b5cf6', isFavorite: false, isImportant: false, twoFactorEnabled: true, strength: 3 },
];

const KEYS = { ENTRIES: 'lb_entries', PIN: 'lb_pin', SETTINGS: 'lb_settings' };
const PIN_SALT = '_lockbox_2024';

interface VaultCtx {
  entries: VaultEntry[];
  categories: Category[];
  isUnlocked: boolean;
  hasPin: boolean;
  isLoading: boolean;
  settings: AppSettings;
  setupPin: (pin: string) => Promise<void>;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  addEntry: (e: Omit<VaultEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<VaultEntry>;
  updateEntry: (id: string, updates: Partial<VaultEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  markUsed: (id: string) => void;
  updateSettings: (u: Partial<AppSettings>) => Promise<void>;
  clearAllData: () => Promise<void>;
  bulkUpdateEntries: (ids: string[], updates: { tags?: string[]; folder?: string }) => Promise<void>;
  copyToClipboard: (value: string) => Promise<void>;
}

const VaultContext = createContext<VaultCtx | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    (async () => {
      try {
        const pin = await AsyncStorage.getItem(KEYS.PIN);
        setHasPin(!!pin);
        const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
        if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
        const eRaw = await AsyncStorage.getItem(KEYS.ENTRIES);
        if (eRaw) {
          const existing = JSON.parse(eRaw) as VaultEntry[];
          setEntries(existing.map(entry => ({
            ...entry,
            tags: entry.tags ?? [],
            faviconUrl: entry.faviconUrl ?? faviconForUrl(entry.url),
          })));
        } else {
          const now = Date.now();
          const seeded = SEED_ENTRIES.map((e, i) => ({ ...e, id: generateId(), createdAt: now - i * 86400000, updatedAt: now - i * 86400000 }));
          setEntries(seeded);
          await AsyncStorage.setItem(KEYS.ENTRIES, JSON.stringify(seeded));
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const save = useCallback(async (next: VaultEntry[]) => {
    setEntries(next);
    await AsyncStorage.setItem(KEYS.ENTRIES, JSON.stringify(next));
  }, []);

  const setupPin = useCallback(async (pin: string) => {
    const h = btoa(pin + PIN_SALT);
    await AsyncStorage.setItem(KEYS.PIN, h);
    setHasPin(true);
    setIsUnlocked(true);
  }, []);

  const unlock = useCallback(async (pin: string): Promise<boolean> => {
    const stored = await AsyncStorage.getItem(KEYS.PIN);
    const h = btoa(pin + PIN_SALT);
    if (stored === h) { setIsUnlocked(true); return true; }
    return false;
  }, []);

  const lock = useCallback(() => setIsUnlocked(false), []);

  const addEntry = useCallback(async (e: Omit<VaultEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<VaultEntry> => {
    const now = Date.now();
    const entry: VaultEntry = {
      ...e,
      tags: e.tags ?? [],
      faviconUrl: e.faviconUrl ?? faviconForUrl(e.url),
      id: generateId(),
      strength: calculateStrength(e.password),
      createdAt: now,
      updatedAt: now,
    };
    await save([entry, ...entries]);
    return entry;
  }, [entries, save]);

  const updateEntry = useCallback(async (id: string, updates: Partial<VaultEntry>) => {
    const next = entries.map(e => {
      if (e.id !== id) return e;
      const updated = { ...e, ...updates, updatedAt: Date.now() };
      if (updates.password) updated.strength = calculateStrength(updates.password);
      return updated;
    });
    await save(next);
  }, [entries, save]);

  const deleteEntry = useCallback(async (id: string) => {
    await save(entries.filter(e => e.id !== id));
  }, [entries, save]);

  const toggleFavorite = useCallback(async (id: string) => {
    const e = entries.find(x => x.id === id);
    if (e) await updateEntry(id, { isFavorite: !e.isFavorite });
  }, [entries, updateEntry]);

  const markUsed = useCallback((id: string) => {
    updateEntry(id, { lastUsed: Date.now() });
  }, [updateEntry]);

  const bulkUpdateEntries = useCallback(async (ids: string[], updates: { tags?: string[]; folder?: string }) => {
    const selected = new Set(ids);
    const next = entries.map(entry => selected.has(entry.id)
      ? { ...entry, ...updates, updatedAt: Date.now() }
      : entry);
    await save(next);
  }, [entries, save]);

  const copyToClipboard = useCallback(async (value: string) => {
    await Clipboard.setStringAsync(value);
    if (settings.clipboardTimeout > 0) {
      setTimeout(() => {
        Clipboard.setStringAsync('').catch(() => undefined);
      }, settings.clipboardTimeout * 1000);
    }
  }, [settings.clipboardTimeout]);

  const updateSettings = useCallback(async (u: Partial<AppSettings>) => {
    const next = { ...settings, ...u };
    setSettings(next);
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(next));
  }, [settings]);

  const clearAllData = useCallback(async () => {
    await AsyncStorage.multiRemove([KEYS.ENTRIES, KEYS.PIN, KEYS.SETTINGS]);
    setEntries([]);
    setHasPin(false);
    setIsUnlocked(false);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <VaultContext.Provider value={{ entries, categories: DEFAULT_CATEGORIES, isUnlocked, hasPin, isLoading, settings, setupPin, unlock, lock, addEntry, updateEntry, deleteEntry, toggleFavorite, markUsed, updateSettings, clearAllData, bulkUpdateEntries, copyToClipboard }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error('useVault must be inside VaultProvider');
  return ctx;
}
