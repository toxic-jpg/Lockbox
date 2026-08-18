import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type IconPack = 'ionicons' | 'feather';

export const ACCENT_COLORS = [
  '#8069F5',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#F43F5E',
  '#3B82F6',
  '#D946EF',
  '#F97316',
] as const;

const APPEARANCE_KEY = 'lb_appearance';

interface AppearanceState {
  accentColor: string;
  iconPack: IconPack;
}

interface AppearanceContextValue extends AppearanceState {
  updateAppearance: (updates: Partial<AppearanceState>) => Promise<void>;
}

const DEFAULT_APPEARANCE: AppearanceState = {
  accentColor: ACCENT_COLORS[0],
  iconPack: 'ionicons',
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearance] = useState<AppearanceState>(DEFAULT_APPEARANCE);

  useEffect(() => {
    AsyncStorage.getItem(APPEARANCE_KEY)
      .then(raw => {
        if (raw) setAppearance({ ...DEFAULT_APPEARANCE, ...JSON.parse(raw) });
      })
      .catch(() => undefined);
  }, []);

  async function updateAppearance(updates: Partial<AppearanceState>) {
    const next = { ...appearance, ...updates };
    setAppearance(next);
    await AsyncStorage.setItem(APPEARANCE_KEY, JSON.stringify(next));
  }

  return (
    <AppearanceContext.Provider value={{ ...appearance, updateAppearance }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) throw new Error('useAppearance must be inside AppearanceProvider');
  return context;
}