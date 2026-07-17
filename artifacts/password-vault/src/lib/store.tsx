import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
type ViewMode = 'grid' | 'list';

interface AppStateContextType {
  isUnlocked: boolean;
  setIsUnlocked: (val: boolean) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [theme, setThemeState] = useState<Theme>('dark');
  const [viewMode, setViewModeState] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('vault-theme') as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
    
    const savedViewMode = localStorage.getItem('vault-viewmode') as ViewMode | null;
    if (savedViewMode) {
      setViewModeState(savedViewMode);
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('vault-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  
  const setViewMode = (newMode: ViewMode) => {
    setViewModeState(newMode);
    localStorage.setItem('vault-viewmode', newMode);
  };

  return (
    <AppStateContext.Provider
      value={{
        isUnlocked,
        setIsUnlocked,
        theme,
        setTheme,
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within a AppStateProvider');
  }
  return context;
}
