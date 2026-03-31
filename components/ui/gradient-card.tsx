import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/use-colors';

interface GradientCardProps {
  title?: string;
  subtitle?: string;
  gradient?: string[];
  onPress?: () => void;
  children?: React.ReactNode;
  style?: ViewStyle;
  compact?: boolean;
}

export function GradientCard({
  title,
  subtitle,
  gradient,
  onPress,
  children,
  style,
  compact = false,
}: GradientCardProps) {
  const colors = useColors();
  const defaultGradient = [colors.primary, '#7C3AED'];

  const content = (
    <LinearGradient
      colors={(gradient || defaultGradient) as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, compact && styles.compact, style]}
    >
      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {children}
    </LinearGradient>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  compact: {
    padding: 14,
    borderRadius: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 18,
  },
});
