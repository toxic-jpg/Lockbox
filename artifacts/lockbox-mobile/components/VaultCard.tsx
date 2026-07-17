import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useVault, VaultEntry } from '@/context/VaultContext';
import { getStrengthHex } from '@/utils/crypto';

interface Props {
  entry: VaultEntry;
  onPress?: () => void;
}

export function VaultCard({ entry, onPress }: Props) {
  const colors = useColors();
  const { toggleFavorite, deleteEntry, markUsed } = useVault();

  const accentColor = entry.color || colors.primary;
  const initial = entry.title.charAt(0).toUpperCase();

  async function handleCopy() {
    await Clipboard.setStringAsync(entry.password);
    markUsed(entry.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleDelete() {
    Alert.alert('Delete Entry', `Remove "${entry.title}" from your vault?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteEntry(entry.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } },
    ]);
  }

  function handleLongPress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(entry.title, undefined, [
      { text: 'Copy Password', onPress: handleCopy },
      entry.username ? { text: 'Copy Username', onPress: async () => { await Clipboard.setStringAsync(entry.username!); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } } : null,
      { text: 'Edit', onPress: () => router.push({ pathname: '/entry/[id]', params: { id: entry.id } }) },
      { text: 'Delete', style: 'destructive', onPress: handleDelete },
      { text: 'Cancel', style: 'cancel' },
    ].filter(Boolean) as any[]);
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 }]}
      onPress={() => { router.push({ pathname: '/entry/[id]', params: { id: entry.id } }); onPress?.(); }}
      onLongPress={handleLongPress}
    >
      {/* Left accent bar */}
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: accentColor + '22' }]}>
        <Text style={[styles.avatarText, { color: accentColor }]}>{initial}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>{entry.title}</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]} numberOfLines={1}>
          {entry.username || entry.email || '—'}
        </Text>
      </View>

      {/* Right actions */}
      <View style={styles.actions}>
        <View style={[styles.strength, { backgroundColor: getStrengthHex(entry.strength) }]} />
        {entry.twoFactorEnabled && (
          <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
        )}
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleFavorite(entry.id); }}>
          <Ionicons name={entry.isFavorite ? 'star' : 'star-outline'} size={18} color={entry.isFavorite ? '#f59e0b' : colors.mutedForeground} />
        </Pressable>
        <Pressable onPress={handleCopy} style={[styles.copyBtn, { backgroundColor: colors.primary + '18' }]}>
          <Ionicons name="copy-outline" size={16} color={colors.primary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, marginBottom: 10, overflow: 'hidden', paddingRight: 14, paddingVertical: 12 },
  accent: { width: 4, alignSelf: 'stretch', marginRight: 12 },
  avatar: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  content: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  sub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  strength: { width: 8, height: 8, borderRadius: 4 },
  copyBtn: { padding: 7, borderRadius: 8 },
});
