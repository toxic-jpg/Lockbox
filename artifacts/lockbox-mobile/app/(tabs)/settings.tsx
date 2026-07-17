import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useVault } from '@/context/VaultContext';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries, settings, updateSettings, clearAllData, lock } = useVault();
  const topPad = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const clipboardOptions = [0, 15, 30, 60, 120];
  const autoLockOptions = [0, 1, 5, 15, 30];

  function formatSeconds(s: number) {
    if (s === 0) return 'Never';
    if (s < 60) return `${s}s`;
    return `${s / 60}m`;
  }
  function formatMinutes(m: number) {
    if (m === 0) return 'Never';
    return `${m} min`;
  }

  function handleClearData() {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all passwords and your PIN. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear Everything', style: 'destructive', onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await clearAllData();
        }},
      ]
    );
  }

  function SectionHeader({ title }: { title: string }) {
    return <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>{title}</Text>;
  }

  function SettingRow({ icon, iconColor, label, value, onPress, destructive }: {
    icon: string; iconColor: string; label: string; value?: string; onPress?: () => void; destructive?: boolean;
  }) {
    return (
      <Pressable
        style={({ pressed }) => [styles.row, { backgroundColor: pressed ? colors.muted : colors.card, borderColor: colors.border }]}
        onPress={onPress}
      >
        <View style={[styles.rowIcon, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={icon as any} size={18} color={iconColor} />
        </View>
        <Text style={[styles.rowLabel, { color: destructive ? colors.destructive : colors.foreground }]}>{label}</Text>
        <View style={styles.rowRight}>
          {value ? <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text> : null}
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        </View>
      </Pressable>
    );
  }

  function SegmentedRow({ label, options, format, value, onChange }: {
    label: string; options: number[]; format: (v: number) => string; value: number; onChange: (v: number) => void;
  }) {
    return (
      <View style={[styles.segmentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.segmentLabel, { color: colors.foreground }]}>{label}</Text>
        <View style={styles.segments}>
          {options.map(opt => (
            <Pressable
              key={opt}
              style={[styles.segment, { backgroundColor: value === opt ? colors.primary : colors.muted }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onChange(opt); }}
            >
              <Text style={[styles.segmentText, { color: value === opt ? '#fff' : colors.mutedForeground }]}>{format(opt)}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 90 }]} showsVerticalScrollIndicator={false}>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="shield-checkmark" size={36} color={colors.primary} />
          <View>
            <Text style={[styles.statsNum, { color: colors.foreground }]}>{entries.length}</Text>
            <Text style={[styles.statsSub, { color: colors.mutedForeground }]}>Passwords stored</Text>
          </View>
        </View>

        <SectionHeader title="SECURITY" />
        <SegmentedRow
          label="Auto-lock"
          options={autoLockOptions}
          format={formatMinutes}
          value={settings.autoLockTimeout}
          onChange={v => updateSettings({ autoLockTimeout: v })}
        />
        <SegmentedRow
          label="Clear clipboard after"
          options={clipboardOptions}
          format={formatSeconds}
          value={settings.clipboardTimeout}
          onChange={v => updateSettings({ clipboardTimeout: v })}
        />

        <SectionHeader title="VAULT" />
        <View style={[styles.group, { borderColor: colors.border }]}>
          <SettingRow
            icon="lock-closed"
            iconColor={colors.primary}
            label="Lock Vault"
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); lock(); }}
          />
        </View>

        <SectionHeader title="DANGER ZONE" />
        <View style={[styles.group, { borderColor: colors.border }]}>
          <SettingRow
            icon="trash"
            iconColor={colors.destructive}
            label="Clear All Data"
            onPress={handleClearData}
            destructive
          />
        </View>

        <SectionHeader title="ABOUT" />
        <View style={[styles.group, { borderColor: colors.border }]}>
          <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.rowIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>LockBox</Text>
            <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>v1.0.0</Text>
          </View>
        </View>
        <Text style={[styles.footnote, { color: colors.mutedForeground }]}>
          All data is stored locally on your device. Nothing is sent to any server.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  scroll: { padding: 16, gap: 8 },
  statsCard: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
  statsNum: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  statsSub: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  sectionHeader: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 12, marginBottom: 4, marginLeft: 4 },
  group: { borderRadius: 14, overflow: 'hidden', borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  rowIcon: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowValue: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  segmentCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  segmentLabel: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  segments: { flexDirection: 'row', gap: 6 },
  segment: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  segmentText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  footnote: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 18, marginTop: 8 },
});
