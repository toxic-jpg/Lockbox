import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useVault } from '@/context/VaultContext';
import { StrengthMeter } from '@/components/StrengthMeter';
import { getStrengthHex, getStrengthLabel } from '@/utils/crypto';
import { TypewriterReveal } from '@/components/TypewriterReveal';

export default function EntryDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, deleteEntry, toggleFavorite, markUsed, copyToClipboard } = useVault();
  const [showPassword, setShowPassword] = useState(false);
  const topPad = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const entry = entries.find(e => e.id === id);
  if (!entry) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>Entry not found</Text>
      </View>
    );
  }

  const accentColor = entry.color || colors.primary;

  function handleDelete() {
    if (!entry) return;
    const currentEntry = entry;
    Alert.alert('Delete Entry', `Remove "${currentEntry.title}" from your vault? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await deleteEntry(currentEntry.id);
        router.back();
      }},
    ]);
  }

  function Field({ icon, label, value, secret }: { icon: string; label: string; value: string; secret?: boolean }) {
    const [revealed, setRevealed] = useState(!secret);
    return (
      <View style={[styles.field, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <View style={styles.fieldHeader}>
          <Ionicons name={icon as any} size={14} color={colors.mutedForeground} />
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
        </View>
        <View style={styles.fieldValueRow}>
          {secret ? (
            <TypewriterReveal value={value} revealed={revealed} color={colors.foreground} style={styles.fieldValue} />
          ) : (
            <Text style={[styles.fieldValue, { color: colors.foreground }]} selectable>{value}</Text>
          )}
          <View style={styles.fieldActions}>
            {secret && (
              <Pressable onPress={() => setRevealed(r => !r)}>
                <Ionicons name={revealed ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.mutedForeground} />
              </Pressable>
            )}
            <Pressable onPress={async () => { await copyToClipboard(value); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
              <Ionicons name="copy-outline" size={18} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header bar */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>{entry.title}</Text>
        <View style={styles.headerRight}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleFavorite(entry.id); }}>
            <Ionicons name={entry.isFavorite ? 'star' : 'star-outline'} size={22} color={entry.isFavorite ? '#f59e0b' : colors.mutedForeground} />
          </Pressable>
          <Pressable onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={colors.destructive} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 32 }]} showsVerticalScrollIndicator={false}>

        {/* Entry hero */}
        <View style={[styles.hero, { backgroundColor: accentColor + '18', borderColor: accentColor + '30' }]}>
          <View style={[styles.avatar, { backgroundColor: accentColor + '22' }]}>
            {entry.faviconUrl ? <Image source={{ uri: entry.faviconUrl }} style={styles.favicon} /> : <Text style={[styles.avatarText, { color: accentColor }]}>{entry.title.charAt(0).toUpperCase()}</Text>}
          </View>
          <View style={styles.heroInfo}>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>{entry.title}</Text>
            {entry.url && <Text style={[styles.heroUrl, { color: colors.mutedForeground }]} numberOfLines={1}>{entry.url}</Text>}
            <View style={styles.heroBadges}>
              <View style={[styles.strengthBadge, { backgroundColor: getStrengthHex(entry.strength) + '20' }]}>
                <View style={[styles.strengthDot, { backgroundColor: getStrengthHex(entry.strength) }]} />
                <Text style={[styles.strengthText, { color: getStrengthHex(entry.strength) }]}>{getStrengthLabel(entry.strength)}</Text>
              </View>
              {entry.twoFactorEnabled && (
                <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
                  <Text style={[styles.badgeText, { color: colors.primary }]}>2FA</Text>
                </View>
              )}
              {entry.folder && <View style={[styles.badge, { backgroundColor: colors.muted }]}><Text style={[styles.badgeText, { color: colors.mutedForeground }]}>{entry.folder}</Text></View>}
            </View>
          </View>
        </View>

        {/* Strength meter */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>PASSWORD STRENGTH</Text>
          <StrengthMeter score={entry.strength} />
        </View>

        {/* Fields */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>CREDENTIALS</Text>
          {entry.username && <Field icon="person-outline" label="Username" value={entry.username} />}
          {entry.email && <Field icon="mail-outline" label="Email" value={entry.email} />}
          <Field icon="key-outline" label="Password" value={entry.password} secret />
          {entry.url && <Field icon="globe-outline" label="URL" value={entry.url} />}
          {entry.notes && <Field icon="document-text-outline" label="Notes" value={entry.notes} />}
          {!!entry.tags?.length && <View style={styles.tagsRow}>{entry.tags.map(tag => <View key={tag} style={[styles.tag, { backgroundColor: colors.primary + '18' }]}><Text style={[styles.tagText, { color: colors.primary }]}>#{tag}</Text></View>)}</View>}
        </View>

        {/* Metadata */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>INFO</Text>
          <View style={styles.meta}>
            <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Created</Text>
            <Text style={[styles.metaValue, { color: colors.foreground }]}>{new Date(entry.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={styles.meta}>
            <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Last updated</Text>
            <Text style={[styles.metaValue, { color: colors.foreground }]}>{new Date(entry.updatedAt).toLocaleDateString()}</Text>
          </View>
          {entry.lastUsed && (
            <View style={styles.meta}>
              <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Last used</Text>
              <Text style={[styles.metaValue, { color: colors.foreground }]}>{new Date(entry.lastUsed).toLocaleDateString()}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Copy password FAB */}
      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={async () => {
          await copyToClipboard(entry.password);
          markUsed(entry.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
      >
        <Ionicons name="copy" size={20} color="#fff" />
        <Text style={styles.fabText}>Copy Password</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { textAlign: 'center', marginTop: 100, fontSize: 16, fontFamily: 'Inter_400Regular' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, gap: 8 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  headerRight: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  scroll: { padding: 16, gap: 12 },
  hero: { borderRadius: 16, borderWidth: 1, padding: 16, flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  favicon: { width: 34, height: 34, borderRadius: 8 },
  heroInfo: { flex: 1, gap: 4 },
  heroTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  heroUrl: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  heroBadges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 2 },
  strengthBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  strengthDot: { width: 7, height: 7, borderRadius: 4 },
  strengthText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  tagText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
  cardTitle: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 },
  field: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 4 },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  fieldLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fieldValue: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  fieldActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  metaLabel: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  metaValue: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  fab: { position: 'absolute', bottom: 24, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6 },
  fabText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
