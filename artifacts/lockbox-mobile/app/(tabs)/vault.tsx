import React, { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useVault } from '@/context/VaultContext';
import { VaultCard } from '@/components/VaultCard';
import { fuzzyMatches } from '@/utils/search';
import { AppIcon } from '@/components/AppIcon';

type Filter = 'all' | 'favorites' | 'weak' | 'strong' | '2fa';
type Sort = 'az' | 'za' | 'newest' | 'oldest' | 'recent';

export default function VaultScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries } = useVault();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('newest');
  const [manageMode, setManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkTags, setBulkTags] = useState('');
  const [bulkFolder, setBulkFolder] = useState('');
  const { bulkUpdateEntries } = useVault();

  const topPad = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const processed = useMemo(() => {
    let list = entries;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(e => fuzzyMatches(q, [
        e.title, e.username ?? '', e.email ?? '', e.url ?? '', e.folder ?? '', ...(e.tags ?? []),
      ]));
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

  function toggleSelected(id: string) {
    setSelectedIds(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function closeManageMode() {
    setManageMode(false);
    setSelectedIds(new Set());
  }

  async function applyBulkEdit() {
    // Empty tag field means "don't change tags", not "clear them" — pass undefined
    // so the spread in bulkUpdateEntries is a no-op instead of overwriting with [].
    const tagList = bulkTags.split(',').map(tag => tag.trim()).filter(Boolean);
    await bulkUpdateEntries(Array.from(selectedIds), {
      tags: tagList.length > 0 ? tagList : undefined,
      folder: bulkFolder.trim() || undefined,
    });
    setBulkOpen(false);
    closeManageMode();
    setBulkTags('');
    setBulkFolder('');
  }

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
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Vault</Text>
          <Text style={[styles.count, { color: colors.mutedForeground }]}>{manageMode ? `${selectedIds.size} selected` : `${processed.length} items`}</Text>
        </View>
        <Pressable style={({ pressed }) => [styles.manageBtn, { backgroundColor: manageMode ? colors.primary : colors.muted, opacity: pressed ? 0.82 : 1 }]} onPress={() => { void Haptics.selectionAsync(); manageMode ? closeManageMode() : setManageMode(true); }}>
          <AppIcon name={manageMode ? 'close' : 'checkmark-circle-outline'} size={17} color={manageMode ? '#fff' : colors.primary} />
          <Text style={[styles.manageText, { color: manageMode ? '#fff' : colors.primary }]}>{manageMode ? 'Done' : 'Manage'}</Text>
        </Pressable>
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
              onPress={() => { void Haptics.selectionAsync(); setFilter(f.key); }}
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
         renderItem={({ item }) => (
           <VaultCard
             entry={item}
             selectable={manageMode}
             selected={selectedIds.has(item.id)}
             onPress={manageMode ? () => toggleSelected(item.id) : undefined}
           />
         )}
      />

      {/* FAB */}
       {!manageMode && <Pressable style={({ pressed }) => [styles.fab, { backgroundColor: colors.primary, transform: [{ scale: pressed ? 0.92 : 1 }] }]} onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/add'); }}>
        <AppIcon name="add" size={28} color="#fff" />
      </Pressable>}
      {manageMode && selectedIds.size > 0 && <View style={[styles.batchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.batchCount, { color: colors.foreground }]}>{selectedIds.size} selected</Text>
         <Pressable style={({ pressed }) => [styles.batchBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.84 : 1 }]} onPress={() => { void Haptics.selectionAsync(); setBulkOpen(true); }}>
          <AppIcon name="create-outline" size={17} color="#fff" />
          <Text style={styles.batchBtnText}>Edit tags & folder</Text>
        </Pressable>
      </View>}
      <Modal visible={bulkOpen} transparent animationType="slide" onRequestClose={() => setBulkOpen(false)}>
        <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Batch edit</Text>
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>Apply to {selectedIds.size} selected entries</Text>
            <TextInput style={[styles.modalInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]} placeholder="Tags, separated by commas" placeholderTextColor={colors.mutedForeground} value={bulkTags} onChangeText={setBulkTags} autoCapitalize="none" />
            <TextInput style={[styles.modalInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]} placeholder="Folder name" placeholderTextColor={colors.mutedForeground} value={bulkFolder} onChangeText={setBulkFolder} />
            <Text style={[styles.modalHint, { color: colors.mutedForeground }]}>Leaving a field blank clears it for selected entries.</Text>
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalCancel, { backgroundColor: colors.muted }]} onPress={() => setBulkOpen(false)}><Text style={[styles.modalCancelText, { color: colors.foreground }]}>Cancel</Text></Pressable>
              <Pressable style={[styles.modalApply, { backgroundColor: colors.primary }]} onPress={applyBulkEdit}><Text style={styles.modalApplyText}>Apply changes</Text></Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  count: { fontSize: 13, fontFamily: 'Inter_400Regular', paddingBottom: 4 },
  manageBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 10 },
  manageText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
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
  batchBar: { position: 'absolute', left: 16, right: 16, bottom: 90, borderWidth: 1, borderRadius: 14, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  batchCount: { flex: 1, fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  batchBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  batchBtnText: { color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  modalCard: { borderWidth: 1, borderBottomWidth: 0, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, gap: 12 },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  modalSub: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  modalInput: { borderWidth: 1, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, fontFamily: 'Inter_400Regular' },
  modalHint: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalCancel: { flex: 1, paddingVertical: 13, borderRadius: 11, alignItems: 'center' },
  modalCancelText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  modalApply: { flex: 1, paddingVertical: 13, borderRadius: 11, alignItems: 'center' },
  modalApplyText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
