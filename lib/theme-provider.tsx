import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

const THEME_STORAGE_KEY = "somniopax_color_scheme";

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

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeState(mode);
      const resolved: ColorScheme = mode === "system" ? systemScheme : mode;
      setColorSchemeState(resolved);
      applyScheme(resolved);
      AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    },
    [applyScheme, systemScheme],
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
    setThemeMode(colorScheme === 'dark' ? 'light' : 'dark');
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
      <View style={[{ flex: 1 }, themeVariables]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
