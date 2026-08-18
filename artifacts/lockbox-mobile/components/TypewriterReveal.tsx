import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';

interface Props {
  value: string;
  revealed: boolean;
  color: string;
  style?: TextStyle | TextStyle[];
}

export function TypewriterReveal({ value, revealed, color, style }: Props) {
  const [visibleCount, setVisibleCount] = useState(revealed ? value.length : 0);

  useEffect(() => {
    if (!revealed) {
      setVisibleCount(0);
      return;
    }
    setVisibleCount(0);
    const timer = setInterval(() => {
      setVisibleCount(current => {
        if (current >= value.length) {
          clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, 26);
    return () => clearInterval(timer);
  }, [revealed, value]);

  return (
    <Text style={[style, { color }]} numberOfLines={revealed ? undefined : 1} selectable={revealed}>
      {revealed ? value.slice(0, visibleCount) : '••••••••••••'}
    </Text>
  );
}