import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { APP_THEMES, type AppThemeId } from '@/hooks/use-app-theme';
import { useThemeContext } from '@/lib/theme-provider';

interface ThemeSelectorProps {
  currentThemeId: AppThemeId;
  onSelect: (id: AppThemeId) => void;
}

export function ThemeSelector({ currentThemeId, onSelect }: ThemeSelectorProps) {
  const { isDark } = useThemeContext();

  const CARD_BG = isDark ? 'rgba(30,24,50,0.95)' : 'rgba(255,252,245,0.97)';
  const TEXT_MAIN = isDark ? '#EDE8DC' : '#1C1410';
  const TEXT_SOFT = isDark ? 'rgba(237,232,220,0.6)' : 'rgba(28,20,16,0.55)';
  const BORDER = isDark ? 'rgba(200,169,110,0.14)' : 'rgba(139,105,20,0.12)';

  return (
    <View style={[styles.container, { backgroundColor: CARD_BG, borderColor: BORDER }]}>
      <Text style={[styles.title, { color: TEXT_MAIN }]}>🎨 Thème visuel</Text>
      <Text style={[styles.subtitle, { color: TEXT_SOFT }]}>Personnalisez l'ambiance de l'application</Text>

      <View style={styles.grid}>
        {Object.values(APP_THEMES).map((theme) => {
          const isSelected = theme.id === currentThemeId;
          return (
            <Pressable
              key={theme.id}
              style={({ pressed }) => [
                styles.themeCard,
                { borderColor: isSelected ? theme.accent : 'transparent', opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() => onSelect(theme.id)}
            >
              <LinearGradient
                colors={theme.heroGradient as [string, string, ...string[]]}
                style={styles.themeGradient}
              >
                {/* Aperçu de l'accent */}
                <View style={[styles.accentDot, { backgroundColor: theme.accent }]} />
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: theme.accent }]}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
              </LinearGradient>
              <View style={[styles.themeInfo, { backgroundColor: isDark ? 'rgba(22,19,43,0.95)' : 'rgba(250,247,242,0.95)' }]}>
                <Text style={styles.themeEmoji}>{theme.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.themeName, { color: TEXT_MAIN }]}>{theme.name}</Text>
                  <Text style={[styles.themeDesc, { color: TEXT_SOFT }]} numberOfLines={1}>{theme.description}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: -6 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeCard: {
    width: '47%',
    borderRadius: 14,
    borderWidth: 2,
    overflow: 'hidden',
  },
  themeGradient: {
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  accentDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    opacity: 0.9,
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: '#1C1410', fontSize: 11, fontWeight: '800' },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  themeEmoji: { fontSize: 18 },
  themeName: { fontSize: 12, fontWeight: '700' },
  themeDesc: { fontSize: 10, lineHeight: 14 },
});
