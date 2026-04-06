import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Appearance,
  Platform,
  StyleSheet,
  View,
  useColorScheme as useSystemColorScheme,
} from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

const THEME_STORAGE_KEY = "somniopax_color_scheme";
/** Durée du fondu de transition en millisecondes */
const FADE_DURATION = 300;

type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  /** @deprecated use setThemeMode instead */
  setColorScheme: (scheme: ColorScheme) => void;
  /** Bascule entre mode clair et sombre */
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = (useSystemColorScheme() ?? "dark") as ColorScheme;
  const [themeMode, setThemeModeState] = useState<ThemeMode>("dark");
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("dark");

  // Valeur animée pour le fondu de l'overlay de transition
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Couleur de fond de l'overlay (correspond au fond du thème cible)
  const [overlayColor, setOverlayColor] = useState<string>("#0D0B1A");

  // Charger la préférence persistée au démarrage
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeModeState(stored);
        const resolved: ColorScheme = stored === "system" ? systemScheme : stored;
        setColorSchemeState(resolved);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quand le mode système change et que l'utilisateur est en mode "system"
  useEffect(() => {
    if (themeMode === "system") {
      setColorSchemeState(systemScheme);
    }
  }, [systemScheme, themeMode]);

  const applyScheme = useCallback((scheme: ColorScheme) => {
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(scheme);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      const palette = SchemeColors[scheme];
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
    }
  }, []);

  /**
   * Lance l'animation de fondu :
   * 1. L'overlay devient visible (opacité 0 → 1) en FADE_DURATION/2
   * 2. Le thème est appliqué pendant que l'overlay masque le flash
   * 3. L'overlay disparaît (opacité 1 → 0) en FADE_DURATION/2
   */
  const animateThemeChange = useCallback(
    (newScheme: ColorScheme, applyFn: () => void) => {
      // Couleur de fond du thème cible pour l'overlay
      const bgColor = newScheme === "dark" ? "#0D0B1A" : "#FAF7F2";
      setOverlayColor(bgColor);

      // Sur le web, pas d'animation native — appliquer directement
      if (Platform.OS === "web") {
        applyFn();
        return;
      }

      // Phase 1 : fade in de l'overlay
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: FADE_DURATION / 2,
        useNativeDriver: true,
      }).start(() => {
        // Appliquer le thème pendant que l'overlay est opaque
        applyFn();
        // Phase 2 : fade out de l'overlay
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: FADE_DURATION / 2,
          useNativeDriver: true,
        }).start();
      });
    },
    [fadeAnim],
  );

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      const resolved: ColorScheme = mode === "system" ? systemScheme : mode;

      animateThemeChange(resolved, () => {
        setThemeModeState(mode);
        setColorSchemeState(resolved);
        applyScheme(resolved);
        AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      });
    },
    [animateThemeChange, applyScheme, systemScheme],
  );

  // Compat: setColorScheme force un mode fixe
  const setColorScheme = useCallback(
    (scheme: ColorScheme) => {
      setThemeMode(scheme);
    },
    [setThemeMode],
  );

  useEffect(() => {
    applyScheme(colorScheme);
  }, [applyScheme, colorScheme]);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": SchemeColors[colorScheme].primary,
        "color-background": SchemeColors[colorScheme].background,
        "color-surface": SchemeColors[colorScheme].surface,
        "color-foreground": SchemeColors[colorScheme].foreground,
        "color-muted": SchemeColors[colorScheme].muted,
        "color-border": SchemeColors[colorScheme].border,
        "color-success": SchemeColors[colorScheme].success,
        "color-warning": SchemeColors[colorScheme].warning,
        "color-error": SchemeColors[colorScheme].error,
      }),
    [colorScheme],
  );

  const toggleTheme = useCallback(() => {
    setThemeMode(colorScheme === "dark" ? "light" : "dark");
  }, [colorScheme, setThemeMode]);

  const value = useMemo(
    () => ({
      colorScheme,
      themeMode,
      isDark: colorScheme === "dark",
      setThemeMode,
      setColorScheme,
      toggleTheme,
    }),
    [colorScheme, themeMode, setThemeMode, setColorScheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[styles.container, themeVariables]}>
        {children}
        {/* Overlay de transition — visible brièvement lors du changement de thème */}
        <Animated.View
          style={[
            styles.overlay,
            { backgroundColor: overlayColor, opacity: fadeAnim, pointerEvents: 'none' },
          ]}
        />
      </View>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
});

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
