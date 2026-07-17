import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useVault } from '@/context/VaultContext';

const PIN_LENGTH = 6;

export default function LockScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { hasPin, setupPin, unlock } = useVault();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm' | 'unlock'>(hasPin ? 'unlock' : 'create');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const isSetup = step === 'create' || step === 'confirm';
  const currentPin = step === 'confirm' ? confirmPin : pin;
  const setCurrentPin = step === 'confirm' ? setConfirmPin : setPin;

  async function handleDigit(d: string) {
    if (currentPin.length >= PIN_LENGTH) return;
    const next = currentPin + d;
    setCurrentPin(next);
    setError('');
    if (next.length === PIN_LENGTH) {
      await handleComplete(next);
    }
  }

  async function handleComplete(code: string) {
    if (step === 'create') {
      setStep('confirm');
    } else if (step === 'confirm') {
      if (code === pin) {
        await setupPin(pin);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError('PINs do not match. Try again.');
        setPin('');
        setConfirmPin('');
        setStep('create');
      }
    } else {
      const ok = await unlock(code);
      if (ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError('Wrong PIN. Try again.');
        setPin('');
      }
    }
  }

  function handleBackspace() {
    setCurrentPin(prev => prev.slice(0, -1));
    setError('');
  }

  const topPad = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const title = step === 'create' ? 'Create PIN' : step === 'confirm' ? 'Confirm PIN' : 'Enter PIN';
  const subtitle = step === 'create' ? 'Choose a 6-digit PIN to secure your vault'
    : step === 'confirm' ? 'Enter the same PIN again'
    : 'Enter your PIN to unlock';

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad + 20, paddingBottom: botPad + 20 }]}>
      {/* Logo */}
      <View style={styles.logo}>
        <View style={[styles.logoIcon, { backgroundColor: colors.primary + '22' }]}>
          <Ionicons name="shield-checkmark" size={40} color={colors.primary} />
        </View>
        <Text style={[styles.logoText, { color: colors.foreground }]}>LockBox</Text>
        <Text style={[styles.logoSub, { color: colors.mutedForeground }]}>Password Vault</Text>
      </View>

      {/* PIN label */}
      <View style={styles.pinSection}>
        <Text style={[styles.pinTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.pinSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>

        {/* PIN dots */}
        <View style={styles.dots}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { borderColor: colors.border },
                i < currentPin.length && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
            />
          ))}
        </View>

        {error ? (
          <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
        ) : null}
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {[['1','2','3'],['4','5','6'],['7','8','9'],['','0','⌫']].map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((key, ki) => {
              if (!key) return <View key={ki} style={styles.keyEmpty} />;
              const isBack = key === '⌫';
              return (
                <Pressable
                  key={ki}
                  style={({ pressed }) => [
                    styles.key,
                    { backgroundColor: pressed ? colors.muted : colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (isBack) handleBackspace();
                    else handleDigit(key);
                  }}
                >
                  {isBack
                    ? <Ionicons name="backspace-outline" size={24} color={colors.foreground} />
                    : <Text style={[styles.keyText, { color: colors.foreground }]}>{key}</Text>
                  }
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32 },
  logo: { alignItems: 'center', gap: 8 },
  logoIcon: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 28, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  logoSub: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  pinSection: { alignItems: 'center', gap: 12, width: '100%' },
  pinTitle: { fontSize: 22, fontFamily: 'Inter_600SemiBold' },
  pinSubtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 16, marginTop: 8 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  error: { fontSize: 13, fontFamily: 'Inter_500Medium', marginTop: 4 },
  keypad: { width: '100%', gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  key: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  keyEmpty: { width: 80, height: 80 },
  keyText: { fontSize: 26, fontFamily: 'Inter_500Medium' },
});
