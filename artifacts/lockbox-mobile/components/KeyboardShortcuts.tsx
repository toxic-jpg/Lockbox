import { useEffect } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { useVault } from '@/context/VaultContext';

export const SHORTCUTS = [
  { keys: '⌘/Ctrl + N', action: 'New entry' },
  { keys: '⌘/Ctrl + G', action: 'Open generator' },
  { keys: '⌘/Ctrl + F', action: 'Open vault search' },
  { keys: '⌘/Ctrl + L', action: 'Lock vault' },
  { keys: 'Escape', action: 'Go back / close modal' },
];

export function KeyboardShortcuts() {
  const { lock } = useVault();

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    function onKeyDown(event: KeyboardEvent) {
      const modifier = event.metaKey || event.ctrlKey;
      if (modifier && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        router.push('/add');
      } else if (modifier && event.key.toLowerCase() === 'g') {
        event.preventDefault();
        router.push('/generator');
      } else if (modifier && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        router.push('/vault');
      } else if (modifier && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        lock();
      } else if (event.key === 'Escape') {
        router.back();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lock]);

  return null;
}