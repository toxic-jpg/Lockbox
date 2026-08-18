import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useColors } from '@/hooks/useColors';
import { useVault, DEFAULT_CATEGORIES } from '@/context/VaultContext';
import { StrengthMeter } from '@/components/StrengthMeter';
import { calculateStrength, generatePassword } from '@/utils/crypto';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#0ea5e9', '#f97316', '#d946ef'];

export default function AddScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addEntry, entries } = useVault();
  const params = useLocalSearchParams<{ prefill?: string }>();
  const topPad = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(params.prefill ?? '');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [folder, setFolder] = useState('');
  const [categoryId, setCategoryId] = useState('other');
  const [color, setColor] = useState(COLORS[0]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params.prefill) setPassword(params.prefill);
  }, [params.prefill]);

  const strength = calculateStrength(password);

  function generateNewPassword() {
    const p = generatePassword({ length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true, excludeSimilar: false, excludeAmbiguous: false });
    setPassword(p);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function persistEntry() {
    setSaving(true);
    try {
      await addEntry({ title: title.trim(), username: username || undefined, email: email || undefined, password, url: url || undefined, notes: notes || undefined, categoryId, folder: folder.trim() || undefined, tags: tagsText.split(',').map(tag => tag.trim()).filter(Boolean), color, isFavorite, isImportant: false, twoFactorEnabled: twoFactor, strength });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title for this entry.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Required', 'Please enter or generate a password.');
      return;
    }
    const normalizedUrl = url.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase();
    const normalizedTitle = title.trim().toLowerCase();
    const normalizedIdentity = (username || email).trim().toLowerCase();
    const duplicate = entries.find(entry => (
      (normalizedUrl && entry.url?.replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase() === normalizedUrl) ||
      (normalizedIdentity && [entry.username, entry.email].filter(Boolean).some(value => value!.trim().toLowerCase() === normalizedIdentity)) ||
      (entry.title.trim().toLowerCase() === normalizedTitle && entry.password === password)
    ));
    if (duplicate) {
      Alert.alert(
        'Possible duplicate',
        `"${duplicate.title}" already looks like this entry. Save it anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save Anyway', onPress: persistEntry },
        ],
      );
      return;
    }
    await persistEntry();
  }

  function FieldLabel({ text }: { text: string }) {
    return <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{text}</Text>;
  }

  function InputField({ placeholder, value, onChangeText, secure, extra }: { placeholder: string; value: string; onChangeText: (t: string) => void; secure?: boolean; extra?: React.ReactNode }) {
    return (
      <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !showPass}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {extra}
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>New Entry</Text>
        <Pressable
          style={[styles.saveBtn, { backgroundColor: saving ? colors.muted : colors.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={[styles.saveBtnText, { color: saving ? colors.mutedForeground : '#fff' }]}>Save</Text>
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 32 }]}
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
      >
        {/* Color picker */}
        <View style={styles.colorRow}>
          <View style={[styles.colorPreview, { backgroundColor: color + '22' }]}>
            <Text style={[styles.colorPreviewText, { color }]}>{title.charAt(0).toUpperCase() || '?'}</Text>
          </View>
          <View style={styles.colorPills}>
            {COLORS.map(c => (
              <Pressable
                key={c}
                style={[styles.colorPill, { backgroundColor: c }, color === c && styles.colorPillActive]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <FieldLabel text="TITLE *" />
          <InputField placeholder="e.g. GitHub, Netflix..." value={title} onChangeText={setTitle} />

          <FieldLabel text="USERNAME" />
          <InputField placeholder="username or handle" value={username} onChangeText={setUsername} />

          <FieldLabel text="EMAIL" />
          <InputField placeholder="email@example.com" value={email} onChangeText={setEmail} />

          <FieldLabel text="PASSWORD *" />
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Enter or generate a password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable onPress={() => setShowPass(v => !v)} style={styles.inputAction}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.mutedForeground} />
            </Pressable>
            <Pressable onPress={generateNewPassword} style={[styles.inputAction, { backgroundColor: colors.primary + '18', borderRadius: 8, padding: 6 }]}>
              <Ionicons name="refresh" size={18} color={colors.primary} />
            </Pressable>
          </View>
          {password.length > 0 && <StrengthMeter score={strength} />}

          <FieldLabel text="WEBSITE URL" />
          <InputField placeholder="https://example.com" value={url} onChangeText={setUrl} />

          <FieldLabel text="FOLDER" />
          <InputField placeholder="e.g. Personal, Work..." value={folder} onChangeText={setFolder} />

          <FieldLabel text="TAGS" />
          <InputField placeholder="Separate tags with commas" value={tagsText} onChangeText={setTagsText} />

          <FieldLabel text="NOTES" />
          <View style={[styles.inputWrap, styles.textArea, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Optional notes..."
              placeholderTextColor={colors.mutedForeground}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Category */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <FieldLabel text="CATEGORY" />
          <View style={styles.catGrid}>
            {DEFAULT_CATEGORIES.map(cat => (
              <Pressable
                key={cat.id}
                style={[styles.catBtn, { backgroundColor: categoryId === cat.id ? cat.color + '20' : colors.muted, borderColor: categoryId === cat.id ? cat.color : colors.border, borderWidth: 1 }]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Ionicons name={cat.icon as any} size={16} color={categoryId === cat.id ? cat.color : colors.mutedForeground} />
                <Text style={[styles.catText, { color: categoryId === cat.id ? cat.color : colors.mutedForeground }]}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Toggles */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.toggleRow}>
            <Ionicons name="star" size={18} color="#f59e0b" />
            <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Favorite</Text>
            <Switch value={isFavorite} onValueChange={setIsFavorite} trackColor={{ false: colors.muted, true: '#f59e0b60' }} thumbColor={isFavorite ? '#f59e0b' : colors.mutedForeground} />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.toggleRow}>
            <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
            <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Two-Factor Auth</Text>
            <Switch value={twoFactor} onValueChange={setTwoFactor} trackColor={{ false: colors.muted, true: colors.primary + '60' }} thumbColor={twoFactor ? colors.primary : colors.mutedForeground} />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, gap: 8 },
  closeBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  scroll: { padding: 16, gap: 12 },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 4 },
  colorPreview: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  colorPreviewText: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  colorPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, flex: 1 },
  colorPill: { width: 28, height: 28, borderRadius: 14 },
  colorPillActive: { borderWidth: 3, borderColor: '#fff', transform: [{ scale: 1.15 }] },
  section: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 8 },
  fieldLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 4 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 8, gap: 8 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  inputAction: { padding: 2 },
  textArea: { alignItems: 'flex-start', paddingVertical: 10 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  catText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggleLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium' },
  divider: { height: 1, marginVertical: 4 },
});
