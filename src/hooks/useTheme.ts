import { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { colors, lightColors, ThemeMode } from '../theme';

export interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  themeColors: typeof colors;
  setThemeMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'dark',
  isDark: true,
  themeColors: colors,
  setThemeMode: () => {},
});

/**
 * Hook to access the current theme colors and mode.
 * Returns themeColors which can be used in place of `colors` for dynamic theming.
 */
export const useTheme = (): ThemeContextType => {
  return useContext(ThemeContext);
};

/**
 * Resolves the effective dark/light mode based on user preference and system scheme.
 */
export const resolveIsDark = (mode: ThemeMode, systemScheme: 'light' | 'dark' | null | undefined): boolean => {
  if (mode === 'auto') {
    return systemScheme !== 'light';
  }
  return mode === 'dark';
};

/**
 * Returns the correct color set based on dark/light mode.
 */
export const getThemeColors = (isDark: boolean): typeof colors => {
  return isDark ? colors : lightColors;
};

export default useTheme;
