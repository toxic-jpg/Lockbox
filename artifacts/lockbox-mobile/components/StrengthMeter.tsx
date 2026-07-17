import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { getStrengthHex, getStrengthLabel } from '@/utils/crypto';

interface Props {
  score: number;
  showLabel?: boolean;
}

export function StrengthMeter({ score, showLabel = true }: Props) {
  const colors = useColors();
  const color = getStrengthHex(score);
  const label = getStrengthLabel(score);

  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {[0, 1, 2, 3, 4].map(i => (
          <View
            key={i}
            style={[styles.bar, { backgroundColor: i <= score ? color : colors.muted }]}
          />
        ))}
      </View>
      {showLabel && (
        <Text style={[styles.label, { color }]}>{label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  bars: { flexDirection: 'row', gap: 4 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  label: { fontSize: 12, fontFamily: 'Inter_600SemiBold', textAlign: 'right' },
});
