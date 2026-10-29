// ============================================
// ILLUSTRATION ANIMÉE DU VISAGE
// ============================================
// Rend un visage stylisé en SVG et anime les traits selon la MotionSpec
// de l'exercice (sourcils, yeux, joues, bouche, mâchoire, tête, points de
// contact des doigts). Une seule valeur Animated (0 → 1) pilote tout.

import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { colors, spacing, typography } from '../../theme';
import { FaceZone } from '../../types';
import {
  FACE_VB_HEIGHT,
  FACE_VB_WIDTH,
  HEAD_PIVOT_Y,
  MOUTH_SHAPES,
  MotionSpec,
  Track,
  getMotionForExercise,
  mouthPath,
} from './motions';
import {
  DEFAULT_FACE_PALETTE,
  FacePalette,
  Glow,
  Head,
  HighlightShapes,
  Nose,
  Shoulders,
} from './faceParts';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedPath = Animated.createAnimatedComponent(Path);

type AnimatedNumber = Animated.AnimatedInterpolation<number> | Animated.Value | number;

export interface FaceIllustrationProps {
  /** Identifiant d'exercice (ex: 'ex-front-001'). Sans id, la zone sert de repli. */
  exerciseId?: string;
  zone?: FaceZone;
  /** Largeur en px (la hauteur suit le ratio 200 x 240). */
  size?: number;
  /** Joue l'animation en boucle. Si false, affiche une pose statique. */
  animated?: boolean;
  /** Met l'animation en pause sans réinitialiser la pose. */
  paused?: boolean;
  /** Facteur de vitesse (1 = normal). */
  speed?: number;
  /** Affiche la consigne courte sous le visage. */
  showCaption?: boolean;
  palette?: Partial<FacePalette>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const clampInterp = (
  t: Animated.Value,
  track: Track,
  map: (v: number) => number = (v) => v
): Animated.AnimatedInterpolation<number> =>
  t.interpolate({
    inputRange: track.input,
    outputRange: track.output.map(map),
    extrapolate: 'clamp',
  });

const toNode = (value: AnimatedNumber): Animated.Value | Animated.AnimatedInterpolation<number> =>
  typeof value === 'number' ? new Animated.Value(value) : value;

const addNodes = (a: AnimatedNumber, b: AnimatedNumber): AnimatedNumber => {
  if (typeof a === 'number' && typeof b === 'number') return a + b;
  return Animated.add(toNode(a), toNode(b));
};

export const FaceIllustration: React.FC<FaceIllustrationProps> = ({
  exerciseId,
  zone = 'global',
  size = 220,
  animated = true,
  paused = false,
  speed = 1,
  showCaption = false,
  palette: paletteOverride,
  style,
  testID,
}) => {
  const palette = useMemo(
    () => ({ ...DEFAULT_FACE_PALETTE, ...paletteOverride }),
    [paletteOverride]
  );
  const spec: MotionSpec = useMemo(
    () => getMotionForExercise(exerciseId, zone),
    [exerciseId, zone]
  );

  const t = useRef(new Animated.Value(0)).current;
  const height = (size * FACE_VB_HEIGHT) / FACE_VB_WIDTH;
  const scale = size / FACE_VB_WIDTH;

  // ----- Boucle d'animation -----
  useEffect(() => {
    t.stopAnimation();
    if (!animated) {
      t.setValue(spec.loop === 'cycle' ? 0.25 : 0.7);
      return;
    }
    if (paused) return;

    const duration = Math.max(300, spec.duration / Math.max(0.1, speed));
    const loop =
      spec.loop === 'cycle'
        ? Animated.loop(
            Animated.timing(t, {
              toValue: 1,
              duration,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
            { resetBeforeIteration: true }
          )
        : Animated.loop(
            Animated.sequence([
              Animated.timing(t, {
                toValue: 1,
                duration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: false,
              }),
              Animated.delay(duration * 0.25),
              Animated.timing(t, {
                toValue: 0,
                duration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: false,
              }),
              Animated.delay(duration * 0.15),
            ])
          );
    loop.start();
    return () => loop.stop();
  }, [spec, animated, paused, speed, t]);

  // ----- Valeurs dérivées -----
  const anim = useMemo(() => {
    const num = (track: Track | undefined, fallback: number, map?: (v: number) => number): AnimatedNumber =>
      track ? clampInterp(t, track, map) : map ? map(fallback) : fallback;

    // Transformations de couches (converties en px)
    const px = (v: number) => v * scale;
    const headRotate = spec.headRotate
      ? t.interpolate({
          inputRange: spec.headRotate.input,
          outputRange: spec.headRotate.output.map((d) => `${d}deg`),
          extrapolate: 'clamp',
        })
      : '0deg';
    const headTilt = num(spec.headTilt, 0, px);
    const turn = num(spec.turn, 0, px);
    const browLift = num(spec.browLift, 0, px);
    const jawOpen = num(spec.jawOpen, 0, px);

    // Sourcils (chemins interpolés pour le froncement)
    const browLeftD = spec.browInner
      ? t.interpolate({
          inputRange: spec.browInner.input,
          outputRange: spec.browInner.output.map((v) => `M 60 80 Q 74 72 90 ${78 + v}`),
          extrapolate: 'clamp',
        })
      : 'M 60 80 Q 74 72 90 78';
    const browRightD = spec.browInner
      ? t.interpolate({
          inputRange: spec.browInner.input,
          outputRange: spec.browInner.output.map((v) => `M 110 ${78 + v} Q 126 72 140 80`),
          extrapolate: 'clamp',
        })
      : 'M 110 78 Q 126 72 140 80';

    // Yeux
    const eyeRy = num(spec.eyeOpen, 1, (v) => Math.max(0.6, 6 * v));
    const pupilR = num(spec.eyeOpen, 1, (v) => Math.min(3.6, Math.max(0.3, 6 * v - 0.4)));
    const pupilX = num(spec.pupilX, 0);
    const pupilY = num(spec.pupilY, 0);
    const converge = num(spec.pupilConverge, 0);
    const pupilLeftX = addNodes(addNodes(76, pupilX), converge);
    const pupilRightX = addNodes(addNodes(124, pupilX), typeof converge === 'number' ? -converge : Animated.multiply(converge, -1));
    const pupilCy = addNodes(96, pupilY);

    // Joues (gonflement / creusement)
    const cheekL = spec.cheekLeft;
    const cheekR = spec.cheekRight;
    const puffR = (track?: Track) => num(track, 0, (p) => 11 + 9 * Math.max(p, 0));
    const puffOpacity = (track?: Track) => num(track, 0, (p) => 0.3 + 0.35 * Math.max(p, 0));
    const hollowOpacity = (track?: Track) => num(track, 0, (p) => 0.75 * Math.max(-p, 0));

    // Bouche
    const mouthD = spec.mouth
      ? t.interpolate({
          inputRange: spec.mouth.input,
          outputRange: spec.mouth.shapes.map((s) => mouthPath(MOUTH_SHAPES[s])),
          extrapolate: 'clamp',
        })
      : mouthPath(MOUTH_SHAPES.neutral);
    const mouthInnerOpacity = spec.jawOpen
      ? clampInterp(t, spec.jawOpen, (v) => Math.min(0.6, Math.max(0, (v - 2) / 12)))
      : 0;

    // Surlignage qui pulse doucement
    const highlightOpacity = animated
      ? t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.16, 0.34, 0.16] })
      : 0.26;

    // Points de contact
    const touches = (spec.touch ?? []).map((tp) => ({
      cx: clampInterp(t, tp.x),
      cy: clampInterp(t, tp.y),
      r: tp.r ?? 5,
    }));

    return {
      headRotate,
      headTilt,
      turn,
      browLift,
      jawOpen,
      browLeftD,
      browRightD,
      eyeRy,
      pupilR,
      pupilLeftX,
      pupilRightX,
      pupilCy,
      cheekLeftR: puffR(cheekL),
      cheekRightR: puffR(cheekR),
      cheekLeftOpacity: puffOpacity(cheekL),
      cheekRightOpacity: puffOpacity(cheekR),
      hollowLeftOpacity: hollowOpacity(cheekL),
      hollowRightOpacity: hollowOpacity(cheekR),
      mouthD,
      mouthInnerOpacity,
      highlightOpacity,
      touches,
    };
  }, [spec, t, scale, animated]);

  // Pivot de rotation : base du cou (le centre de la vue est à FACE_VB_HEIGHT / 2)
  const pivot = (HEAD_PIVOT_Y - FACE_VB_HEIGHT / 2) * scale;
  const headTransform = [
    { translateY: pivot },
    { rotate: anim.headRotate },
    { translateY: -pivot },
    { translateY: anim.headTilt },
  ];
  const featuresTransform = [...headTransform, { translateX: anim.turn }];
  const browTransform = [...featuresTransform, { translateY: anim.browLift }];
  const mouthTransform = [...featuresTransform, { translateY: anim.jawOpen }];

  const layerStyle = { width: size, height };
  const viewBox = `0 0 ${FACE_VB_WIDTH} ${FACE_VB_HEIGHT}`;

  return (
    <View style={[styles.wrapper, style]} testID={testID} accessible accessibilityRole="image" accessibilityLabel={`Illustration : ${spec.caption}`}>
      <View style={layerStyle}>
        {/* Couche 1 : halo, épaules, cou */}
        <Svg width={size} height={height} viewBox={viewBox} style={styles.layer}>
          <Glow palette={palette} />
          <Shoulders palette={palette} />
        </Svg>

        {/* Couche 2 : tête + joues */}
        <Animated.View style={[styles.layer, layerStyle, { transform: headTransform }]}>
          <Svg width={size} height={height} viewBox={viewBox}>
            <Head palette={palette} />
            <AnimatedEllipse cx={64} cy={134} rx={7} ry={12} fill={palette.skinShade} opacity={anim.hollowLeftOpacity} />
            <AnimatedEllipse cx={136} cy={134} rx={7} ry={12} fill={palette.skinShade} opacity={anim.hollowRightOpacity} />
            <AnimatedCircle cx={66} cy={128} r={anim.cheekLeftR} fill={palette.blush} opacity={anim.cheekLeftOpacity} />
            <AnimatedCircle cx={134} cy={128} r={anim.cheekRightR} fill={palette.blush} opacity={anim.cheekRightOpacity} />
          </Svg>
        </Animated.View>

        {/* Couche 3 : zones surlignées (pulsation) */}
        <Animated.View
          style={[styles.layer, layerStyle, { transform: headTransform, opacity: anim.highlightOpacity }]}
          pointerEvents="none"
        >
          <Svg width={size} height={height} viewBox={viewBox}>
            <HighlightShapes zones={spec.highlight} color={palette.highlight} />
          </Svg>
        </Animated.View>

        {/* Couche 4 : yeux + nez */}
        <Animated.View style={[styles.layer, layerStyle, { transform: featuresTransform }]}>
          <Svg width={size} height={height} viewBox={viewBox}>
            <AnimatedEllipse cx={76} cy={96} rx={11} ry={anim.eyeRy} fill="#FFFFFF" />
            <AnimatedEllipse cx={124} cy={96} rx={11} ry={anim.eyeRy} fill="#FFFFFF" />
            <AnimatedCircle cx={anim.pupilLeftX} cy={anim.pupilCy} r={anim.pupilR} fill={palette.feature} />
            <AnimatedCircle cx={anim.pupilRightX} cy={anim.pupilCy} r={anim.pupilR} fill={palette.feature} />
            {/* Ligne de paupière supérieure */}
            <AnimatedPath
              d="M 65 95 Q 76 88 87 95"
              stroke={palette.feature}
              strokeWidth={1.6}
              strokeLinecap="round"
              fill="none"
              opacity={0.6}
            />
            <AnimatedPath
              d="M 113 95 Q 124 88 135 95"
              stroke={palette.feature}
              strokeWidth={1.6}
              strokeLinecap="round"
              fill="none"
              opacity={0.6}
            />
            <Nose palette={palette} />
          </Svg>
        </Animated.View>

        {/* Couche 5 : sourcils */}
        <Animated.View style={[styles.layer, layerStyle, { transform: browTransform }]}>
          <Svg width={size} height={height} viewBox={viewBox}>
            <AnimatedPath d={anim.browLeftD} stroke={palette.feature} strokeWidth={3.2} strokeLinecap="round" fill="none" />
            <AnimatedPath d={anim.browRightD} stroke={palette.feature} strokeWidth={3.2} strokeLinecap="round" fill="none" />
          </Svg>
        </Animated.View>

        {/* Couche 6 : bouche */}
        <Animated.View style={[styles.layer, layerStyle, { transform: mouthTransform }]}>
          <Svg width={size} height={height} viewBox={viewBox}>
            <AnimatedPath d={anim.mouthD} fill={palette.lips} stroke={palette.lips} strokeWidth={1.2} strokeLinejoin="round" />
            <AnimatedEllipse cx={100} cy={156} rx={6} ry={4} fill={palette.feature} opacity={anim.mouthInnerOpacity} />
          </Svg>
        </Animated.View>

        {/* Couche 7 : points de contact des doigts */}
        {anim.touches.length > 0 && (
          <View style={[styles.layer, layerStyle]} pointerEvents="none">
            <Svg width={size} height={height} viewBox={viewBox}>
              {anim.touches.map((tp, index) => (
                <React.Fragment key={index}>
                  <AnimatedCircle cx={tp.cx} cy={tp.cy} r={tp.r + 4} fill={palette.touch} opacity={0.25} />
                  <AnimatedCircle cx={tp.cx} cy={tp.cy} r={tp.r} fill={palette.touch} stroke="#FFFFFF" strokeWidth={1.5} />
                </React.Fragment>
              ))}
            </Svg>
          </View>
        )}
      </View>

      {showCaption && (
        <Text style={styles.caption} numberOfLines={2}>
          {spec.caption}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  caption: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});

export default FaceIllustration;
