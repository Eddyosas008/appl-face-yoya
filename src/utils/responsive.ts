import { Dimensions, PixelRatio, Platform, ScaledSize } from 'react-native';

// ============================================
// RESPONSIVE UTILITIES
// ============================================
// Provides screen-adaptive sizing for all mobile formats

const BASE_WIDTH = 375; // iPhone SE / standard base
const BASE_HEIGHT = 812; // iPhone X / standard base

let screenDimensions = Dimensions.get('window');

// Update dimensions on change (rotation, resize)
Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
  screenDimensions = window;
});

/**
 * Get current screen width
 */
export const getScreenWidth = (): number => screenDimensions.width;

/**
 * Get current screen height
 */
export const getScreenHeight = (): number => screenDimensions.height;

/**
 * Scale a value based on screen width relative to base design width.
 * Use for horizontal dimensions (padding, margin, width, fontSize).
 */
export const wp = (size: number): number => {
  const scale = screenDimensions.width / BASE_WIDTH;
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

/**
 * Scale a value based on screen height relative to base design height.
 * Use for vertical dimensions (height, vertical padding/margin).
 */
export const hp = (size: number): number => {
  const scale = screenDimensions.height / BASE_HEIGHT;
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

/**
 * Moderate scale - less aggressive than wp.
 * Use for font sizes to avoid extreme scaling.
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  const scale = screenDimensions.width / BASE_WIDTH;
  return Math.round(
    PixelRatio.roundToNearestPixel(size + (scale - 1) * size * factor)
  );
};

/**
 * Get width as percentage of screen
 */
export const widthPercent = (percent: number): number => {
  return Math.round((screenDimensions.width * percent) / 100);
};

/**
 * Get height as percentage of screen
 */
export const heightPercent = (percent: number): number => {
  return Math.round((screenDimensions.height * percent) / 100);
};

/**
 * Screen size breakpoints
 */
export type ScreenSize = 'small' | 'medium' | 'large' | 'xlarge';

export const getScreenSize = (): ScreenSize => {
  const width = screenDimensions.width;
  if (width < 360) return 'small';
  if (width < 414) return 'medium';
  if (width < 768) return 'large';
  return 'xlarge';
};

/**
 * Returns true if screen is considered a small device
 */
export const isSmallDevice = (): boolean => screenDimensions.width < 360;

/**
 * Returns true if screen is considered a tablet
 */
export const isTablet = (): boolean => screenDimensions.width >= 768;

/**
 * Adaptive value based on screen size
 */
export const adaptive = <T>(values: {
  small?: T;
  medium?: T;
  large?: T;
  xlarge?: T;
  default: T;
}): T => {
  const size = getScreenSize();
  return values[size] ?? values.default;
};

/**
 * Platform-aware bottom padding (for devices with/without home indicator)
 */
export const getBottomInset = (): number => {
  if (Platform.OS === 'ios') {
    return screenDimensions.height >= 812 ? 34 : 0;
  }
  return 0;
};

/**
 * Safe area inset approximation for status bar
 */
export const getTopInset = (): number => {
  if (Platform.OS === 'ios') {
    return screenDimensions.height >= 812 ? 44 : 20;
  }
  return 0;
};
