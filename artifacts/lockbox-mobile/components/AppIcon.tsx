import React from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAppearance } from '@/context/AppearanceContext';

const FEATHER_NAMES: Record<string, string> = {
  'search': 'search',
  'add': 'plus',
  'close': 'x',
  'close-circle': 'x-circle',
  'copy-outline': 'copy',
  'copy': 'copy',
  'star': 'star',
  'star-outline': 'star',
  'trash': 'trash-2',
  'trash-outline': 'trash-2',
  'lock-closed': 'lock',
  'lock-open': 'unlock',
  'key': 'key',
  'key-outline': 'key',
  'eye-outline': 'eye',
  'eye-off-outline': 'eye-off',
  'chevron-forward': 'chevron-right',
  'chevron-back': 'chevron-left',
  'settings': 'settings',
  'refresh': 'refresh-cw',
  'add-circle': 'plus-circle',
  'shield-checkmark': 'shield',
  'warning': 'alert-triangle',
  'flash': 'zap',
  'home': 'home',
  'person-outline': 'user',
  'mail-outline': 'mail',
  'globe-outline': 'globe',
  'document-text-outline': 'file-text',
  'backspace-outline': 'delete',
  'checkmark': 'check',
  'checkmark-circle': 'check-circle',
  'checkmark-circle-outline': 'check-circle',
  'create-outline': 'edit-3',
  'ellipse-outline': 'circle',
};

interface Props {
  name: string;
  size?: number;
  color: string;
}

export function AppIcon({ name, size = 20, color }: Props) {
  const { iconPack } = useAppearance();
  if (iconPack === 'feather') {
    return <Feather name={(FEATHER_NAMES[name] ?? 'circle') as any} size={size} color={color} />;
  }
  return <Ionicons name={name as any} size={size} color={color} />;
}