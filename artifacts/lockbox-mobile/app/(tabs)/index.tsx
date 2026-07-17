import React, { useMemo } from 'react';
import { FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useVault, DEFAULT_CATEGORIES } from '@/context/VaultContext';
import { VaultCard } from '@/components/VaultCard';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries, lock } = useVault();

  const topPad = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const stats = useMemo(() => ({
    total: entries.length,
    favorites: entries.filter(e => e.isFavorite).length,
    weak: entries.filter(e => e.strength <= 1).length,
    strong: entries.filter(e => e.strength >= 4).length,
  }), [entries]);

  const recent = useMemo(() =>
    [...entries].sort((a, b) => (b.lastUsed ?? b.updatedAt) - (a.lastUsed ?? a.updatedAt)).slice(0, 6)
  , [entries]);

  const favorites = useMemo(() => entries.filter(e => e.isFavorite).slice(0, 6), [entries]);

  const categoryStats = useMemo(() =>
    DEFAULT_CATEGORIES.map(cat => ({
      ...cat,
      count: entries.filter(e => e.categoryId === cat.id).length,
    })).filter(c => c.count > 0)
  , [entries]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Welcome back</Text>
          <Text style={[styles.brandName, { color: colors.foreground }]}>LockBox</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={[styles.iconBtn, { backgroundColor: colors.muted }]} onPress={() => router.push('/add')}>
            <Ionicons name="add" size={22} color={colors.primary} />
          </Pressable>
          <Pressable style={[styles.iconBtn, { backgroundColor: colors.muted }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); lock(); }}>
            <Ionicons name="lock-closed" size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 90 }]} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total', value: stats.total, icon: 'key', color: colors.primary },
            { label: 'Favorites', value: stats.favorites, icon: 'star', color: '#f59e0b' },
            { label: 'Weak', value: stats.weak, icon: 'warning', color: '#EF4444' },
            { label: 'Strong', value: stats.strong, icon: 'shield-checkmark', color: '#10b981' },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name={s.icon as any} size={20} color={s.color} />
              <Text style={[styles.statNum, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent */}
        {recent.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent</Text>
              <Pressable onPress={() => router.push('/vault')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </Pressable>
            </View>
            <FlatList
              data={recent}
              keyExtractor={e => e.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.recentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push({ pathname: '/entry/[id]', params: { id: item.id } })}
                >
                  <View style={[styles.recentAvatar, { backgroundColor: (item.color || colors.primary) + '22' }]}>
                    <Text style={[styles.recentInitial, { color: item.color || colors.primary }]}>
                      {item.title.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.recentTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[styles.recentSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {item.username || item.email || '—'}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Favorites</Text>
            </View>
            {favorites.map(entry => <VaultCard key={entry.id} entry={entry} />)}
          </View>
        )}

        {/* Categories */}
        {categoryStats.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Categories</Text>
            <View style={styles.catGrid}>
              {categoryStats.map(cat => (
                <Pressable
                  key={cat.id}
                  style={[styles.catCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push('/vault')}
                >
                  <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                  <Text style={[styles.catName, { color: colors.foreground }]}>{cat.name}</Text>
                  <Text style={[styles.catCount, { color: colors.mutedForeground }]}>{cat.count}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', borderBottomWidth: 1 },
  greeting: { fontSize: 12, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  brandName: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 16, paddingTop: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.5 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  seeAll: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  recentCard: { width: 120, borderRadius: 14, borderWidth: 1, padding: 12, alignItems: 'center', gap: 6 },
  recentAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  recentInitial: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  recentTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  recentSub: { fontSize: 10, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: { width: '47%', borderRadius: 14, borderWidth: 1, padding: 14, gap: 6 },
  catName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  catCount: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});
