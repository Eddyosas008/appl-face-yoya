import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppThemeId = 'night' | 'forest' | 'ocean' | 'rose';

export type AppThemePalette = {
  id: AppThemeId;
  name: string;
  emoji: string;
  description: string;
  // Couleurs spécifiques au thème (remplacent les tokens primary/background/surface)
  accent: string;        // couleur d'accent principale
  accentLight: string;   // variante claire de l'accent
  heroGradient: string[]; // gradient du hero
  cardGlow: string;       // lueur des cartes
};

export const APP_THEMES: Record<AppThemeId, AppThemePalette> = {
  night: {
    id: 'night',
    name: 'Nuit Profonde',
    emoji: '🌙',
    description: 'Or doux sur fond de nuit étoilée',
    accent: '#C8A96E',
    accentLight: '#E8C98E',
    heroGradient: ['#0D0B1A', '#1A1535', '#0D0B1A'],
    cardGlow: 'rgba(200,169,110,0.15)',
  },
  forest: {
    id: 'forest',
    name: 'Forêt Zen',
    emoji: '🌿',
    description: 'Vert émeraude apaisant, connexion à la nature',
    accent: '#52B788',
    accentLight: '#74C69D',
    heroGradient: ['#0A1F14', '#1B4332', '#0A1F14'],
    cardGlow: 'rgba(82,183,136,0.15)',
  },
  ocean: {
    id: 'ocean',
    name: 'Océan Calme',
    emoji: '🌊',
    description: 'Bleu azur profond, sérénité marine',
    accent: '#4FC3F7',
    accentLight: '#81D4FA',
    heroGradient: ['#0A1628', '#0D2137', '#0A1628'],
    cardGlow: 'rgba(79,195,247,0.15)',
  },
  rose: {
    id: 'rose',
    name: 'Aurore Rose',
    emoji: '🌸',
    description: 'Rose doux et lavande, douceur féminine',
    accent: '#F48FB1',
    accentLight: '#F8BBD9',
    heroGradient: ['#1A0A1E', '#2D1B33', '#1A0A1E'],
    cardGlow: 'rgba(244,143,177,0.15)',
  },
};

const STORAGE_KEY = 'somniopax_app_theme';

export function useAppTheme() {
  const [themeId, setThemeId] = useState<AppThemeId>('night');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored && stored in APP_THEMES) {
        setThemeId(stored as AppThemeId);
      }
      setIsLoaded(true);
    });
  }, []);

  const setTheme = useCallback(async (id: AppThemeId) => {
    setThemeId(id);
    await AsyncStorage.setItem(STORAGE_KEY, id);
  }, []);

  return {
    themeId,
    theme: APP_THEMES[themeId],
    allThemes: Object.values(APP_THEMES),
    setTheme,
    isLoaded,
  };
}
