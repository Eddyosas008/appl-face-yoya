import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function PremiumBadge({ small = false }: { small?: boolean }) {
  return (
    <View style={[styles.badge, small && styles.small]}>
      <Text style={[styles.text, small && styles.smallText]}>✦ Premium</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  text: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
  },
  smallText: {
    fontSize: 10,
  },
});
