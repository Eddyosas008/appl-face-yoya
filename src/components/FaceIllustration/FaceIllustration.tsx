// ============================================
// ILLUSTRATION ANIMÉE DU VISAGE
// ============================================
// Rend un visage stylisé en SVG et anime les traits selon la MotionSpec
// de l'exercice (sourcils, yeux, joues, bouche, mâchoire, tête, points de
// contact des doigts). Une seule valeur Animated (0 → 1) pilote le geste ;
// une seconde, indépendante, gère le clignement des yeux.

import React, { useEffect, useId, useMemo, useRef } from 'react';
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
  TouchPoint,
  Track,
  getMotionForExercise,
  mouthPath,
} from './motions';
import {
  FaceDefs,
  FacePalette,
  FaceTone,
  Glow,
  Head,
  HighlightShapes,
  Nose,
  Shoulders,
  browPaths,
  gradientIds,
} from './faceParts';
import { svgSafeId, useFacePalette } from './useFacePalette';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedPath = Animated.createAnimatedComponent(Path);

type AnimatedNumber = Animated.AnimatedInterpolation<number> | Animated.Value | number;
type AnimatedNode = Animated.Value | Animated.AnimatedInterpolation<number>;

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
  /** Affiche les trajectoires des doigts (pointillés + flèche). */
  showGuides?: boolean;
  /** Force une carnation (sinon : réglage utilisateur). */
  tone?: FaceTone;
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

const toNode = (value: AnimatedNumber): AnimatedNode =>
  typeof value === 'number' ? new Animated.Value(value) : value;

const addNodes = (a: AnimatedNumber, b: AnimatedNumber): AnimatedNumber => {
  if (typeof a === 'number' && typeof b === 'number') return a + b;
  return Animated.add(toNode(a), toNode(b));
};

// ----- Trajectoires des doigts (guides statiques) -----
interface Guide {
  d: string;
  arrow?: string;
}

const pathLength = (pts: number[][]): number =>
  pts.reduce((acc, p, i) => (i === 0 ? 0 : acc + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1])), 0);

const arrowHead = (from: number[], to: number[], size = 4.5): string => {
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const bx = to[0] - Math.cos(angle) * size;
  const by = to[1] - Math.sin(angle) * size;
  const px = -Math.sin(angle) * size * 0.6;
  const py = Math.cos(angle) * size * 0.6;
  const f = (n: number) => n.toFixed(2);
  return `M ${f(to[0])} ${f(to[1])} L ${f(bx + px)} ${f(by + py)} L ${f(bx - px)} ${f(by - py)} Z`;
};

/** Déduit un guide (pointillé + flèche) à partir d'un point de contact mobile. */
export const guideForTouch = (tp: TouchPoint): Guide | null => {
  if (tp.x.input.length !== tp.y.input.length) return null;
  const pts = tp.x.output.map((x, i) => [x, tp.y.output[i]]);
  if (pts.length < 2 || pathLength(pts) < 6) return null;
  const closed = pts.length >= 8;
  const d = `M ${pts.map((p) => `${p[0]} ${p[1]}`).join(' L ')}${closed ? ' Z' : ''}`;
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  return { d, arrow: arrowHead(prev, last) };
};

export const FaceIllustration: React.FC<FaceIllustrationProps> = ({
  exerciseId,
  zone = 'global',
  size = 220,
  animated = true,
  paused = false,
  speed = 1,
  showCaption = false,
  showGuides = true,
  tone,
  palette: paletteOverride,
  style,
  testID,
}) => {
  const palette = useFacePalette(paletteOverride, tone);
  const uid = svgSafeId(useId());
  const ids = gradientIds(uid);
  const spec: MotionSpec = useMemo(
    () => getMotionForExercise(exerciseId, zone),
    [exerciseId, zone]
  );

  const t = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(0)).current;
  const height = (size * FACE_VB_HEIGHT) / FACE_VB_WIDTH;
  const scale = size / FACE_VB_WIDTH;

  // ----- Boucle principale (geste) -----
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
            { iterations: -1, resetBeforeIteration: true }
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

  // ----- Clignement des yeux (indépendant du geste) -----
  useEffect(() => {
    blink.stopAnimation();
    blink.setValue(0);
    if (!animated || paused) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(3400),
        Animated.timing(blink, { toValue: 1, duration: 90, easing: Easing.in(Easing.quad), useNativeDriver: false }),
        Animated.timing(blink, { toValue: 0, duration: 130, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animated, paused, blink]);

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

    // Respiration douce des épaules (aller-retour uniquement)
    const breath =
      animated && spec.loop === 'pingpong'
        ? t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.012] })
        : 1;

    // Sourcils (formes pleines interpolées pour le froncement)
    const browLeftD = spec.browInner
      ? t.interpolate({
          inputRange: spec.browInner.input,
          outputRange: spec.browInner.output.map((v) => browPaths(v).left),
          extrapolate: 'clamp',
        })
      : browPaths(0).left;
    const browRightD = spec.browInner
      ? t.interpolate({
          inputRange: spec.browInner.input,
          outputRange: spec.browInner.output.map((v) => browPaths(v).right),
          extrapolate: 'clamp',
        })
      : browPaths(0).right;

    // Yeux : ouverture = piste de l'exercice × clignement
    const blinkFactor = blink.interpolate({ inputRange: [0, 1], outputRange: [1, 0.06] });
    const eyeScale = Animated.multiply(toNode(num(spec.eyeOpen, 1)), blinkFactor);
    const eyeRy = eyeScale.interpolate({ inputRange: [0, 0.1, 1.5], outputRange: [0.6, 0.6, 9], extrapolate: 'clamp' });
    const irisR = eyeScale.interpolate({ inputRange: [0, 0.1, 1, 1.5], outputRange: [0, 0.6, 4.6, 4.6], extrapolate: 'clamp' });
    const pupilR = eyeScale.interpolate({ inputRange: [0, 0.1, 1, 1.5], outputRange: [0, 0.3, 2.4, 2.4], extrapolate: 'clamp' });
    const shineR = eyeScale.interpolate({ inputRange: [0, 0.1, 1, 1.5], outputRange: [0, 0.2, 1.1, 1.1], extrapolate: 'clamp' });
    const lidLeftD = eyeScale.interpolate({
      inputRange: [0, 0.1, 1, 1.5],
      outputRange: ['M 65 95 Q 76 96 87 95', 'M 65 95 Q 76 95.4 87 95', 'M 65 95 Q 76 88 87 95', 'M 65 95 Q 76 85 87 95'],
      extrapolate: 'clamp',
    });
    const lidRightD = eyeScale.interpolate({
      inputRange: [0, 0.1, 1, 1.5],
      outputRange: ['M 113 95 Q 124 96 135 95', 'M 113 95 Q 124 95.4 135 95', 'M 113 95 Q 124 88 135 95', 'M 113 95 Q 124 85 135 95'],
      extrapolate: 'clamp',
    });
    const pupilX = num(spec.pupilX, 0);
    const pupilY = num(spec.pupilY, 0);
    const converge = num(spec.pupilConverge, 0);
    const pupilLeftX = addNodes(addNodes(76, pupilX), converge);
    const pupilRightX = addNodes(
      addNodes(124, pupilX),
      typeof converge === 'number' ? -converge : Animated.multiply(converge, -1)
    );
    const pupilCy = addNodes(96, pupilY);
    const shineLeftX = addNodes(pupilLeftX, -1.4);
    const shineRightX = addNodes(pupilRightX, -1.4);
    const shineCy = addNodes(pupilCy, -1.4);

    // Joues (gonflement / creusement)
    const cheekL = spec.cheekLeft;
    const cheekR = spec.cheekRight;
    const puffR = (track?: Track) => num(track, 0, (p) => 13 + 9 * Math.max(p, 0));
    const puffOpacity = (track?: Track) => num(track, 0, (p) => 0.75 + 0.25 * Math.max(p, 0));
    const hollowOpacity = (track?: Track) => num(track, 0, (p) => 0.7 * Math.max(-p, 0));

    // Bouche : forme pleine + ligne des lèvres + reflet + intérieur
    const shapes = spec.mouth ? spec.mouth.shapes.map((s) => MOUTH_SHAPES[s]) : [MOUTH_SHAPES.neutral];
    const mouthInput = spec.mouth ? spec.mouth.input : [0, 1];
    const interpMouth = <T extends string | number>(fn: (shape: number[]) => T) =>
      spec.mouth
        ? t.interpolate({ inputRange: mouthInput, outputRange: shapes.map(fn) as never[], extrapolate: 'clamp' })
        : fn(shapes[0]);
    const mouthD = interpMouth((s) => mouthPath(s));
    const lipLineD = interpMouth((s) => `M ${s[0]} ${s[1]} Q ${s[2]} ${s[3]} ${s[4]} ${s[5]}`);
    const lipShineCy = interpMouth((s) => (s[1] + s[7]) / 2 + 0.8);
    const innerCy = interpMouth((s) => (s[3] + s[7]) / 2);
    const innerRx = interpMouth((s) => Math.max(3, (s[4] - s[0]) * 0.3));
    const mouthInnerOpacity = spec.jawOpen
      ? clampInterp(t, spec.jawOpen, (v) => Math.min(0.65, Math.max(0, (v - 2) / 12)))
      : 0;
    const teethOpacity = spec.jawOpen
      ? clampInterp(t, spec.jawOpen, (v) => Math.min(0.9, Math.max(0, (v - 3) / 10)))
      : 0;

    // Surlignage qui pulse doucement
    const highlightOpacity = animated
      ? t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.16, 0.34, 0.16] })
      : 0.26;

    // Points de contact + guides
    const touches = (spec.touch ?? []).map((tp) => {
      const r = tp.r ?? 5;
      const cx = clampInterp(t, tp.x);
      const cy = clampInterp(t, tp.y);
      return {
        cx,
        cy,
        r,
        shineX: addNodes(cx, -r * 0.3),
        shineY: addNodes(cy, -r * 0.3),
        guide: guideForTouch(tp),
      };
    });

    return {
      headRotate,
      headTilt,
      turn,
      browLift,
      jawOpen,
      breath,
      browLeftD,
      browRightD,
      eyeRy,
      irisR,
      pupilR,
      shineR,
      lidLeftD,
      lidRightD,
      pupilLeftX,
      pupilRightX,
      pupilCy,
      shineLeftX,
      shineRightX,
      shineCy,
      cheekLeftR: puffR(cheekL),
      cheekRightR: puffR(cheekR),
      cheekLeftOpacity: puffOpacity(cheekL),
      cheekRightOpacity: puffOpacity(cheekR),
      hollowLeftOpacity: hollowOpacity(cheekL),
      hollowRightOpacity: hollowOpacity(cheekR),
      mouthD,
      lipLineD,
      lipShineCy,
      innerCy,
      innerRx,
      mouthInnerOpacity,
      teethOpacity,
      highlightOpacity,
      touches,
    };
  }, [spec, t, blink, scale, animated]);

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
  const baseTransform = [
    { translateY: height / 2 },
    { scale: anim.breath },
    { translateY: -height / 2 },
  ];

  const layerStyle = { width: size, height };
  const viewBox = `0 0 ${FACE_VB_WIDTH} ${FACE_VB_HEIGHT}`;
  const blushFill = `url(#${ids.blush})`;

  return (
    <View style={[styles.wrapper, style]} testID={testID} accessible accessibilityRole="image" accessibilityLabel={`Illustration : ${spec.caption}`}>
      <View style={layerStyle}>
        {/* Couche 1 : halo, épaules, cou (respiration) */}
        <Animated.View style={[styles.layer, layerStyle, { transform: baseTransform }]}>
          <Svg width={size} height={height} viewBox={viewBox}>
            <FaceDefs palette={palette} uid={uid} />
            <Glow palette={palette} uid={uid} />
            <Shoulders palette={palette} uid={uid} />
          </Svg>
        </Animated.View>

        {/* Couche 2 : tête + joues */}
        <Animated.View style={[styles.layer, layerStyle, { transform: headTransform }]}>
          <Svg width={size} height={height} viewBox={viewBox}>
            <FaceDefs palette={palette} uid={uid} />
            <Head palette={palette} uid={uid} />
            <AnimatedEllipse cx={64} cy={136} rx={7} ry={13} fill={palette.skinShade} opacity={anim.hollowLeftOpacity} />
            <AnimatedEllipse cx={136} cy={136} rx={7} ry={13} fill={palette.skinShade} opacity={anim.hollowRightOpacity} />
            <AnimatedCircle cx={66} cy={128} r={anim.cheekLeftR} fill={blushFill} opacity={anim.cheekLeftOpacity} />
            <AnimatedCircle cx={134} cy={128} r={anim.cheekRightR} fill={blushFill} opacity={anim.cheekRightOpacity} />
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
            <AnimatedCircle cx={anim.pupilLeftX} cy={anim.pupilCy} r={anim.irisR} fill={palette.iris} />
            <AnimatedCircle cx={anim.pupilRightX} cy={anim.pupilCy} r={anim.irisR} fill={palette.iris} />
            <AnimatedCircle cx={anim.pupilLeftX} cy={anim.pupilCy} r={anim.pupilR} fill={palette.feature} />
            <AnimatedCircle cx={anim.pupilRightX} cy={anim.pupilCy} r={anim.pupilR} fill={palette.feature} />
            <AnimatedCircle cx={anim.shineLeftX} cy={anim.shineCy} r={anim.shineR} fill="#FFFFFF" />
            <AnimatedCircle cx={anim.shineRightX} cy={anim.shineCy} r={anim.shineR} fill="#FFFFFF" />
            {/* Paupières supérieures + cils */}
            <AnimatedPath d={anim.lidLeftD} stroke={palette.feature} strokeWidth={1.9} strokeLinecap="round" fill="none" opacity={0.75} />
            <AnimatedPath d={anim.lidRightD} stroke={palette.feature} strokeWidth={1.9} strokeLinecap="round" fill="none" opacity={0.75} />
            <Path d="M 65.5 94.5 L 61.5 91" stroke={palette.feature} strokeWidth={1.4} strokeLinecap="round" opacity={0.7} />
            <Path d="M 134.5 94.5 L 138.5 91" stroke={palette.feature} strokeWidth={1.4} strokeLinecap="round" opacity={0.7} />
            {/* Paupières inférieures très légères */}
            <Path d="M 68 100.5 Q 76 103.5 84 100.5" stroke={palette.feature} strokeWidth={1} strokeLinecap="round" fill="none" opacity={0.22} />
            <Path d="M 116 100.5 Q 124 103.5 132 100.5" stroke={palette.feature} strokeWidth={1} strokeLinecap="round" fill="none" opacity={0.22} />
            <Nose palette={palette} />
          </Svg>
        </Animated.View>

        {/* Couche 5 : sourcils */}
        <Animated.View style={[styles.layer, layerStyle, { transform: browTransform }]}>
          <Svg width={size} height={height} viewBox={viewBox}>
            <AnimatedPath d={anim.browLeftD} fill={palette.feature} />
            <AnimatedPath d={anim.browRightD} fill={palette.feature} />
          </Svg>
        </Animated.View>

        {/* Couche 6 : bouche */}
        <Animated.View style={[styles.layer, layerStyle, { transform: mouthTransform }]}>
          <Svg width={size} height={height} viewBox={viewBox}>
            <AnimatedPath d={anim.mouthD} fill={palette.lips} stroke={palette.lips} strokeWidth={1.2} strokeLinejoin="round" />
            <AnimatedEllipse cx={100} cy={anim.innerCy} rx={anim.innerRx} ry={5} fill={palette.feature} opacity={anim.mouthInnerOpacity} />
            <AnimatedEllipse cx={100} cy={addNodes(anim.innerCy, -3.2)} rx={5} ry={1.6} fill="#FFFFFF" opacity={anim.teethOpacity} />
            <AnimatedPath d={anim.lipLineD} stroke={palette.lipsDark} strokeWidth={1.3} strokeLinecap="round" fill="none" opacity={0.65} />
            <AnimatedEllipse cx={100} cy={anim.lipShineCy} rx={5} ry={1.3} fill="#FFFFFF" opacity={0.28} />
          </Svg>
        </Animated.View>

        {/* Couche 7 : guides + points de contact des doigts */}
        {anim.touches.length > 0 && (
          <View style={[styles.layer, layerStyle]} pointerEvents="none">
            <Svg width={size} height={height} viewBox={viewBox}>
              {showGuides &&
                anim.touches.map((tp, index) =>
                  tp.guide ? (
                    <React.Fragment key={`guide-${index}`}>
                      <Path
                        d={tp.guide.d}
                        stroke={palette.touch}
                        strokeWidth={1.4}
                        strokeDasharray="3 3"
                        strokeLinecap="round"
                        fill="none"
                        opacity={0.5}
                      />
                      {tp.guide.arrow && <Path d={tp.guide.arrow} fill={palette.touch} opacity={0.7} />}
                    </React.Fragment>
                  ) : null
                )}
              {anim.touches.map((tp, index) => (
                <React.Fragment key={index}>
                  <AnimatedCircle cx={tp.cx} cy={tp.cy} r={tp.r + 5} fill={palette.touch} opacity={0.18} />
                  <AnimatedCircle cx={tp.cx} cy={tp.cy} r={tp.r} fill={palette.touch} stroke="#FFFFFF" strokeWidth={1.6} />
                  <AnimatedCircle cx={tp.shineX} cy={tp.shineY} r={tp.r * 0.3} fill="#FFFFFF" opacity={0.75} />
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
