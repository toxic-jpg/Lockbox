import React, { useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useVault } from '@/context/VaultContext';
import { VaultCard } from '@/components/VaultCard';

type Filter = 'all' | 'favorites' | 'weak' | 'strong' | '2fa';
type Sort = 'az' | 'za' | 'newest' | 'oldest' | 'recent';

export default function VaultScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries } = useVault();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('newest');

  const topPad = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const processed = useMemo(() => {
    let list = entries;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(e => e.title.toLowerCase().includes(q) || (e.username ?? '').toLowerCase().includes(q) || (e.email ?? '').toLowerCase().includes(q));
    }
    if (filter === 'favorites') list = list.filter(e => e.isFavorite);
    else if (filter === 'weak') list = list.filter(e => e.strength <= 1);
    else if (filter === 'strong') list = list.filter(e => e.strength >= 4);
    else if (filter === '2fa') list = list.filter(e => e.twoFactorEnabled);

    return [...list].sort((a, b) => {
      if (sort === 'az') return a.title.localeCompare(b.title);
      if (sort === 'za') return b.title.localeCompare(a.title);
      if (sort === 'oldest') return a.createdAt - b.createdAt;
      if (sort === 'recent') return (b.lastUsed ?? 0) - (a.lastUsed ?? 0);
      return b.createdAt - a.createdAt; // newest
    });
  }, [entries, query, filter, sort]);

  const filters: { key: Filter; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: 'grid' },
    { key: 'favorites', label: 'Favorites', icon: 'star' },
    { key: 'weak', label: 'Weak', icon: 'warning' },
    { key: 'strong', label: 'Strong', icon: 'shield-checkmark' },
    { key: '2fa', label: '2FA', icon: 'lock-closed' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Vault</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{processed.length} items</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.muted }]}>
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search passwords..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter chips */}
      <View style={[styles.filterScroll, { borderBottomColor: colors.border }]}>
        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={f => f.key}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}
          renderItem={({ item: f }) => (
            <Pressable
              style={[styles.chip, { backgroundColor: filter === f.key ? colors.primary : colors.muted, borderColor: filter === f.key ? colors.primary : colors.border }]}
              onPress={() => setFilter(f.key)}
            >
              <Ionicons name={f.icon as any} size={13} color={filter === f.key ? '#fff' : colors.mutedForeground} />
              <Text style={[styles.chipText, { color: filter === f.key ? '#fff' : colors.mutedForeground }]}>{f.label}</Text>
            </Pressable>
          )}
        />
      </View>

      {/* List */}
      <FlatList
        data={processed}
        keyExtractor={e => e.id}
        contentContainerStyle={[styles.list, { paddingBottom: botPad + 90 }]}
        scrollEnabled={processed.length > 0}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="key-outline" size={56} color={colors.mutedForeground} style={{ opacity: 0.3 }} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No entries found</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              {query ? 'Try a different search' : 'Tap + to add your first password'}
            </Text>
          </View>
        }
        renderItem={({ item }) => <VaultCard entry={item} />}
      />

      {/* FAB */}
      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/add')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  count: { fontSize: 13, fontFamily: 'Inter_400Regular', paddingBottom: 4 },
  searchRow: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  filterScroll: { borderBottomWidth: 1 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  list: { paddingHorizontal: 16, paddingTop: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: 8 },
  emptyTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  emptySub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 40 },
  fab: { position: 'absolute', right: 20, bottom: 100, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
});
