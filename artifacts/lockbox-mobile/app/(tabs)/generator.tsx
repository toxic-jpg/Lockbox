import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useVault } from '@/context/VaultContext';
import { StrengthMeter } from '@/components/StrengthMeter';
import {
  calculateStrength,
  generateApiKey,
  generatePassphrase,
  generatePassword,
  generatePin,
  PasswordOptions,
} from '@/utils/crypto';

type Mode = 'password' | 'passphrase' | 'pin' | 'apikey';

const MODES: { key: Mode; label: string; icon: string }[] = [
  { key: 'password', label: 'Password', icon: 'lock-closed' },
  { key: 'passphrase', label: 'Passphrase', icon: 'chatbubble-ellipses' },
  { key: 'pin', label: 'PIN', icon: 'keypad' },
  { key: 'apikey', label: 'API Key', icon: 'code-slash' },
];

export default function GeneratorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { copyToClipboard } = useVault();
  const topPad = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const [mode, setMode] = useState<Mode>('password');
  const [generated, setGenerated] = useState('');
  const [strength, setStrength] = useState(0);
  const [copied, setCopied] = useState(false);

  // Password opts
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);

  // Passphrase opts
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState('-');
  const [capitalize, setCapitalize] = useState(true);
  const [memorableWords, setMemorableWords] = useState(true);

  // PIN opts
  const [pinLength, setPinLength] = useState(6);

  const generate = useCallback(() => {
    let result = '';
    if (mode === 'password') {
      const opts: PasswordOptions = { length, uppercase, lowercase, numbers, symbols, excludeSimilar, excludeAmbiguous: false };
      result = generatePassword(opts);
      setStrength(calculateStrength(result));
    } else if (mode === 'passphrase') {
      result = generatePassphrase(wordCount, separator, capitalize, memorableWords);
      setStrength(calculateStrength(result));
    } else if (mode === 'pin') {
      result = generatePin(pinLength);
      setStrength(1);
    } else {
      result = generateApiKey();
      setStrength(4);
    }
    setGenerated(result);
    setCopied(false);
  }, [mode, length, uppercase, lowercase, numbers, symbols, excludeSimilar, wordCount, separator, capitalize, memorableWords, pinLength]);

  useEffect(() => { generate(); }, [mode]);

  async function handleCopy() {
    if (!generated) return;
    await copyToClipboard(generated);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSave() {
    router.push({ pathname: '/add', params: { prefill: generated } });
  }

  function Stepper({ value, min, max, onInc, onDec }: { value: number; min: number; max: number; onInc: () => void; onDec: () => void }) {
    return (
      <View style={styles.stepper}>
        <Pressable style={[styles.stepBtn, { backgroundColor: colors.muted }]} onPress={onDec} disabled={value <= min}>
          <Ionicons name="remove" size={18} color={value <= min ? colors.mutedForeground : colors.foreground} />
        </Pressable>
        <Text style={[styles.stepVal, { color: colors.foreground }]}>{value}</Text>
        <Pressable style={[styles.stepBtn, { backgroundColor: colors.muted }]} onPress={onInc} disabled={value >= max}>
          <Ionicons name="add" size={18} color={value >= max ? colors.mutedForeground : colors.foreground} />
        </Pressable>
      </View>
    );
  }

  function ToggleRow({ label, sub, value, onToggle }: { label: string; sub?: string; value: boolean; onToggle: (v: boolean) => void }) {
    return (
      <View style={styles.toggleRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.toggleLabel, { color: colors.foreground }]}>{label}</Text>
          {sub && <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>{sub}</Text>}
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.muted, true: colors.primary + '60' }}
          thumbColor={value ? colors.primary : colors.mutedForeground}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Generator</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 90 }]} showsVerticalScrollIndicator={false}>

        {/* Generated display */}
        <View style={[styles.display, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.generated, { color: colors.foreground }]} selectable numberOfLines={4} adjustsFontSizeToFit>
            {generated}
          </Text>
          {mode !== 'pin' && mode !== 'apikey' && (
            <View style={styles.strengthWrap}>
              <StrengthMeter score={strength} />
            </View>
          )}
          <View style={styles.displayActions}>
            <Pressable style={[styles.displayBtn, { backgroundColor: colors.muted }]} onPress={generate}>
              <Ionicons name="refresh" size={20} color={colors.foreground} />
            </Pressable>
            <Pressable style={[styles.displayBtn, { flex: 1, backgroundColor: copied ? '#10b981' : colors.primary }]} onPress={handleCopy}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color="#fff" />
              <Text style={styles.displayBtnText}>{copied ? 'Copied!' : 'Copy'}</Text>
            </Pressable>
            <Pressable style={[styles.displayBtn, { backgroundColor: colors.muted }]} onPress={handleSave}>
              <Ionicons name="save-outline" size={20} color={colors.foreground} />
            </Pressable>
          </View>
        </View>

        {/* Mode tabs */}
        <View style={[styles.modeTabs, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {MODES.map(m => (
            <Pressable
              key={m.key}
              style={[styles.modeTab, mode === m.key && { backgroundColor: colors.primary }]}
              onPress={() => setMode(m.key)}
            >
              <Ionicons name={m.icon as any} size={15} color={mode === m.key ? '#fff' : colors.mutedForeground} />
              <Text style={[styles.modeTabText, { color: mode === m.key ? '#fff' : colors.mutedForeground }]}>{m.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Options */}
        <View style={[styles.options, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {mode === 'password' && (
            <>
              <View style={styles.optionRow}>
                <Text style={[styles.optLabel, { color: colors.foreground }]}>Length</Text>
                <Stepper value={length} min={8} max={64} onInc={() => setLength(l => Math.min(64, l + 1))} onDec={() => setLength(l => Math.max(8, l - 1))} />
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <ToggleRow label="Uppercase (A-Z)" value={uppercase} onToggle={setUppercase} />
              <ToggleRow label="Lowercase (a-z)" value={lowercase} onToggle={setLowercase} />
              <ToggleRow label="Numbers (0-9)" value={numbers} onToggle={setNumbers} />
              <ToggleRow label="Symbols (!@#$)" value={symbols} onToggle={setSymbols} />
              <ToggleRow label="Exclude Similar" sub="i, l, 1, L, o, 0, O" value={excludeSimilar} onToggle={setExcludeSimilar} />
            </>
          )}
          {mode === 'passphrase' && (
            <>
              <View style={styles.optionRow}>
                <Text style={[styles.optLabel, { color: colors.foreground }]}>Words</Text>
                <Stepper value={wordCount} min={3} max={12} onInc={() => setWordCount(w => Math.min(12, w + 1))} onDec={() => setWordCount(w => Math.max(3, w - 1))} />
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.optionRow}>
                <Text style={[styles.optLabel, { color: colors.foreground }]}>Separator</Text>
                <View style={styles.sepRow}>
                  {['-', '_', '.', ' ', ''].map(s => (
                    <Pressable key={`sep-${s}`} style={[styles.sepBtn, { backgroundColor: separator === s ? colors.primary : colors.muted }]} onPress={() => setSeparator(s)}>
                      <Text style={[styles.sepText, { color: separator === s ? '#fff' : colors.foreground }]}>{s === '' ? 'Ø' : s === ' ' ? '⎵' : s}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <ToggleRow label="Capitalize Words" value={capitalize} onToggle={setCapitalize} />
              <ToggleRow label="Memorable words" sub="Use friendly, easy-to-recall words" value={memorableWords} onToggle={setMemorableWords} />
            </>
          )}
          {mode === 'pin' && (
            <View style={styles.optionRow}>
              <Text style={[styles.optLabel, { color: colors.foreground }]}>Length</Text>
              <Stepper value={pinLength} min={4} max={12} onInc={() => setPinLength(l => Math.min(12, l + 1))} onDec={() => setPinLength(l => Math.max(4, l - 1))} />
            </View>
          )}
          {mode === 'apikey' && (
            <View style={styles.apiInfo}>
              <Ionicons name="code-slash" size={32} color={colors.primary} style={{ opacity: 0.6 }} />
              <Text style={[styles.apiInfoText, { color: colors.mutedForeground }]}>
                Generates a 64-character cryptographically secure hex API key.
              </Text>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Pressable style={[styles.regenBtn, { backgroundColor: colors.primary }]} onPress={generate}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.regenText}>Regenerate</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  scroll: { padding: 16, gap: 14 },
  display: { borderRadius: 16, borderWidth: 1, padding: 20, gap: 14 },
  generated: { fontSize: 22, fontFamily: 'Inter_500Medium', letterSpacing: 1, lineHeight: 32, textAlign: 'center' },
  strengthWrap: { marginTop: -4 },
  displayActions: { flexDirection: 'row', gap: 10 },
  displayBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12 },
  displayBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  modeTabs: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, overflow: 'hidden', padding: 4, gap: 4 },
  modeTab: { flex: 1, flexDirection: 'column', alignItems: 'center', paddingVertical: 8, borderRadius: 10, gap: 3 },
  modeTabText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  options: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 4 },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  optLabel: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  divider: { height: 1, marginVertical: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepVal: { fontSize: 18, fontFamily: 'Inter_600SemiBold', minWidth: 32, textAlign: 'center' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  toggleLabel: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  toggleSub: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  sepRow: { flexDirection: 'row', gap: 8 },
  sepBtn: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sepText: { fontSize: 16, fontFamily: 'Inter_500Medium' },
  apiInfo: { alignItems: 'center', gap: 10, paddingVertical: 16 },
  apiInfoText: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  regenBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, marginTop: 4 },
  regenText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});
