import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useVault, VaultEntry } from '@/context/VaultContext';
import { getStrengthHex } from '@/utils/crypto';
import { AppIcon } from '@/components/AppIcon';

interface Props {
  entry: VaultEntry;
  onPress?: () => void;
  selectable?: boolean;
  selected?: boolean;
}

export function VaultCard({ entry, onPress, selectable = false, selected = false }: Props) {
  const colors = useColors();
  const { toggleFavorite, deleteEntry, markUsed, copyToClipboard } = useVault();
  const appear = useRef(new Animated.Value(0)).current;
  const accentColor = entry.color || colors.primary;
  const initial = entry.title.charAt(0).toUpperCase();

  useEffect(() => {
    Animated.spring(appear, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 5 }).start();
  }, [appear]);

  async function handleCopy() {
    await copyToClipboard(entry.password);
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
      entry.username ? { text: 'Copy Username', onPress: async () => { await copyToClipboard(entry.username!); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } } : null,
      { text: 'Edit', onPress: () => router.push({ pathname: '/entry/[id]', params: { id: entry.id } }) },
      { text: 'Delete', style: 'destructive', onPress: handleDelete },
      { text: 'Cancel', style: 'cancel' },
    ].filter(Boolean) as any[]);
  }

  return (
    <Animated.View style={{ opacity: appear, transform: [{ translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: colors.card, borderColor: selected ? colors.primary : colors.border, borderWidth: selected ? 2 : 1, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => { if (onPress) onPress(); else router.push({ pathname: '/entry/[id]', params: { id: entry.id } }); }}
        onLongPress={handleLongPress}
      >
        <View style={[styles.accent, { backgroundColor: accentColor }]} />
        <View style={[styles.avatar, { backgroundColor: accentColor + '22' }]}>
          {entry.faviconUrl ? <Image source={{ uri: entry.faviconUrl }} style={styles.favicon} /> : <Text style={[styles.avatarText, { color: accentColor }]}>{initial}</Text>}
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>{entry.title}</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]} numberOfLines={1}>
            {entry.username || entry.email || entry.folder || '—'}
          </Text>
          {!!entry.tags?.length && <Text style={[styles.tags, { color: colors.primary }]} numberOfLines={1}>{entry.tags.map(tag => `#${tag}`).join(' ')}</Text>}
        </View>
        <View style={styles.actions}>
          <View style={[styles.strength, { backgroundColor: getStrengthHex(entry.strength) }]} />
          {entry.twoFactorEnabled && <AppIcon name="shield-checkmark" size={14} color={colors.primary} />}
          {selectable && <AppIcon name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={selected ? colors.primary : colors.mutedForeground} />}
          {!selectable && <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleFavorite(entry.id); }}>
            <AppIcon name={entry.isFavorite ? 'star' : 'star-outline'} size={18} color={entry.isFavorite ? '#f59e0b' : colors.mutedForeground} />
          </Pressable>}
          {!selectable && <Pressable onPress={handleCopy} style={[styles.copyBtn, { backgroundColor: colors.primary + '18' }]}>
            <AppIcon name="copy-outline" size={16} color={colors.primary} />
          </Pressable>}
        </View>
        {selected && <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}><AppIcon name="checkmark" size={12} color="#fff" /></View>}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, marginBottom: 10, overflow: 'hidden', paddingRight: 14, paddingVertical: 12, position: 'relative' },
  accent: { width: 4, alignSelf: 'stretch', marginRight: 12 },
  avatar: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  favicon: { width: 28, height: 28, borderRadius: 6 },
  avatarText: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  content: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  sub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  tags: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  strength: { width: 8, height: 8, borderRadius: 4 },
  copyBtn: { padding: 7, borderRadius: 8 },
  selectedBadge: { position: 'absolute', top: 7, right: 7, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
});
