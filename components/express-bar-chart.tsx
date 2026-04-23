/**
 * ExpressBarChart
 * ───────────────
 * Graphique en barres dorées affichant les séances express des 7 derniers jours.
 * Les barres s'animent à l'entrée (grow from bottom).
 * Inclut un résumé textuel et un état vide illustré.
 */
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '@/lib/theme-provider';
import type { DayEntry } from '@/hooks/use-express-session-history';

const GOLD      = '#C8A96E';
const GOLD_DIM  = 'rgba(200,169,110,0.25)';
const GOLD_DARK = '#8B6028';
const BAR_MAX_H = 80; // hauteur max en px

interface ExpressBarChartProps {
  data: DayEntry[];
  totalWeek: number;
}

/** Barre individuelle avec animation grow */
function AnimatedBar({
  entry,
  maxCount,
  delay,
  isDark,
}: {
  entry: DayEntry;
  maxCount: number;
  delay: number;
  isDark: boolean;
}) {
  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const targetH = maxCount > 0 ? Math.max(4, (entry.count / maxCount) * BAR_MAX_H) : 4;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: targetH,
        duration: 500,
        delay,
        useNativeDriver: false, // height ne supporte pas nativeDriver
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [targetH, delay]);

  const isActive = entry.count > 0;
  const bgColor  = isDark ? 'rgba(200,169,110,0.12)' : 'rgba(200,169,110,0.10)';

  return (
    <Animated.View style={[styles.barItem, { opacity: opacityAnim }]}>
      {/* Valeur au-dessus */}
      <Text style={[styles.barValue, { color: isActive ? GOLD : 'transparent' }]}>
        {entry.count > 0 ? entry.count : ''}
      </Text>
      {/* Fond de la barre */}
      <View style={[styles.barBg, { backgroundColor: bgColor }]}>
        {isActive ? (
          <Animated.View style={{ height: heightAnim, width: '100%', borderRadius: 6, overflow: 'hidden' }}>
            <LinearGradient
              colors={[GOLD, GOLD_DARK]}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        ) : (
          <View style={[styles.barEmpty, { backgroundColor: GOLD_DIM }]} />
        )}
      </View>
      {/* Label jour */}
      <Text
        style={[
          styles.barLabel,
          { color: entry.isToday ? GOLD : (isDark ? 'rgba(240,235,224,0.5)' : 'rgba(60,40,20,0.5)') },
          entry.isToday && styles.barLabelToday,
        ]}
      >
        {entry.label}
      </Text>
      {/* Point indicateur "aujourd'hui" */}
      {entry.isToday && <View style={styles.todayDot} />}
    </Animated.View>
  );
}

export function ExpressBarChart({ data, totalWeek }: ExpressBarChartProps) {
  const { isDark } = useThemeContext();
  const maxCount = Math.max(1, ...data.map(d => d.count));

  // Résumé textuel
  const activeDays = data.filter(d => d.count > 0).length;
  const summaryText = totalWeek === 0
    ? 'Aucune séance express cette semaine — lancez-en une !'
    : `${totalWeek} séance${totalWeek > 1 ? 's' : ''} en ${activeDays} jour${activeDays > 1 ? 's' : ''} cette semaine`;

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>⚡</Text>
        <Text style={[styles.emptyText, { color: isDark ? 'rgba(240,235,224,0.5)' : 'rgba(60,40,20,0.5)' }]}>
          Complétez votre première séance express pour voir votre historique ici.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Résumé */}
      <Text style={[styles.summary, { color: isDark ? 'rgba(200,169,110,0.85)' : '#8B6914' }]}>
        {summaryText}
      </Text>
      {/* Graphique */}
      <View style={styles.chartRow}>
        {data.map((entry, i) => (
          <AnimatedBar
            key={entry.date}
            entry={entry}
            maxCount={maxCount}
            delay={i * 60}
            isDark={isDark}
          />
        ))}
      </View>
      {/* Légende max */}
      {totalWeek > 0 && (
        <Text style={[styles.legend, { color: isDark ? 'rgba(240,235,224,0.35)' : 'rgba(60,40,20,0.35)' }]}>
          Maximum : {maxCount} séance{maxCount > 1 ? 's' : ''} en un jour
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX_H + 40, // barre + label + valeur
    paddingTop: 20,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '700',
    height: 14,
    lineHeight: 14,
  },
  barBg: {
    width: '65%',
    height: BAR_MAX_H,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barEmpty: {
    height: 4,
    width: '100%',
    borderRadius: 3,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
  },
  barLabelToday: {
    fontWeight: '800',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GOLD,
    marginTop: -2,
  },
  legend: {
    fontSize: 10,
    marginTop: 6,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 32,
    opacity: 0.4,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
