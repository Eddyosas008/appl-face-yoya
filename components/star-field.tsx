/**
 * StarField — Fond animé étoilé adaptatif (mode sombre/clair)
 * Mode sombre : étoiles blanches sur fond noir + blobs violets
 * Mode clair  : étoiles lavande sur fond ivoire + blobs lavande pastel
 *
 * Usage:
 *   import { StarField } from '@/components/star-field';
 *   <StarField />  // dans ScreenContainer, avant le contenu
 */

import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useThemeContext } from '@/lib/theme-provider';

const STAR_COUNT = 70;

const AURORA_BLOBS_DARK = [
  { leftPct: 10, topPct: 8,  width: 160, height: 90,  color: 'rgba(74,44,138,0.22)' },
  { leftPct: 55, topPct: 15, width: 130, height: 75,  color: 'rgba(40,20,100,0.18)' },
  { leftPct: 30, topPct: 2,  width: 170, height: 60,  color: 'rgba(100,60,180,0.14)' },
];

const AURORA_BLOBS_LIGHT = [
  { leftPct: 10, topPct: 8,  width: 160, height: 90,  color: 'rgba(180,140,255,0.18)' },
  { leftPct: 55, topPct: 15, width: 130, height: 75,  color: 'rgba(200,168,255,0.14)' },
  { leftPct: 30, topPct: 2,  width: 170, height: 60,  color: 'rgba(220,190,255,0.12)' },
];

export function StarField() {
  const { isDark } = useThemeContext();

  const starColor = isDark ? '#EDE8DC' : 'rgba(140,110,200,0.7)';
  const AURORA_BLOBS = isDark ? AURORA_BLOBS_DARK : AURORA_BLOBS_LIGHT;

  const stars = useRef(
    Array.from({ length: STAR_COUNT }, (_, i) => ({
      x: (i * 37 + 11) % 100,
      y: (i * 53 + 7) % 85,
      size: (i % 3 === 0 ? 1.8 : i % 5 === 0 ? 1.2 : 0.7),
      anim: new Animated.Value((i % 10) / 10 * 0.6 + 0.1),
      delay: i * 55,
    }))
  ).current;

  const blobAnims = useRef(
    AURORA_BLOBS_DARK.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Scintillement des étoiles
    stars.forEach((star) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(star.anim, {
            toValue: 0.85,
            duration: 1800 + (star.delay % 2400),
            delay: star.delay,
            useNativeDriver: true,
          }),
          Animated.timing(star.anim, {
            toValue: 0.08,
            duration: 1800 + (star.delay % 2400),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Flottement des blobs aurora
    blobAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 6000 + i * 1200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 6000 + i * 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Blobs aurora flottants */}
      {AURORA_BLOBS.map((blob, i) => (
        <Animated.View
          key={`blob-${i}`}
          style={{
            position: 'absolute',
            left: `${blob.leftPct}%` as any,
            top: `${blob.topPct}%` as any,
            width: blob.width,
            height: blob.height,
            borderRadius: blob.width / 2,
            backgroundColor: blob.color,
            opacity: blobAnims[i].interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 1],
            }),
            transform: [{
              translateY: blobAnims[i].interpolate({
                inputRange: [0, 1],
                outputRange: [0, 12],
              }),
            }],
          }}
        />
      ))}

      {/* Étoiles scintillantes */}
      {stars.map((star, i) => (
        <Animated.View
          key={`star-${i}`}
          style={{
            position: 'absolute',
            left: `${star.x}%` as any,
            top: `${star.y}%` as any,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: starColor,
            opacity: star.anim,
          }}
        />
      ))}
    </View>
  );
}
