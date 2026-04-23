/**
 * useExpressSessionHistory
 * ─────────────────────────
 * Lit les données de séances express depuis AsyncStorage et retourne :
 * - `dailyCounts` : tableau de 7 entrées { date, label, count } (J-6 → aujourd'hui)
 * - `totalWeek`   : total des séances sur les 7 derniers jours
 * - `loading`     : état de chargement initial
 * - `refresh`     : fonction pour recharger manuellement
 *
 * Schéma AsyncStorage :
 *   clé  "@somnioPax:expressSessionsDay"  → { "2026-04-23": 2, "2026-04-22": 1, … }
 *   clé  "@somnioPax:expressSessionsWeek" → { "2026-W17": 3, … }  (maintenu pour le badge FAB)
 */
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const EXPRESS_SESSIONS_DAY_KEY  = '@somnioPax:expressSessionsDay';
export const EXPRESS_SESSIONS_WEEK_KEY = '@somnioPax:expressSessionsWeek';

export interface DayEntry {
  /** ISO date string YYYY-MM-DD */
  date: string;
  /** Label court affiché sous la barre (ex. "Lun", "Mar"…) */
  label: string;
  /** Nombre de séances complétées ce jour */
  count: number;
  /** Vrai si c'est aujourd'hui */
  isToday: boolean;
}

const DAY_LABELS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

/** Retourne les 7 derniers jours (du plus ancien au plus récent) */
function getLast7Days(): { date: string; label: string; isToday: boolean }[] {
  const result = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    result.push({
      date: iso,
      label: i === 0 ? 'Auj.' : DAY_LABELS_FR[d.getDay()],
      isToday: i === 0,
    });
  }
  return result;
}

export function useExpressSessionHistory() {
  const [dailyCounts, setDailyCounts] = useState<DayEntry[]>([]);
  const [totalWeek, setTotalWeek]     = useState(0);
  const [loading, setLoading]         = useState(true);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(EXPRESS_SESSIONS_DAY_KEY);
      const data: Record<string, number> = raw ? JSON.parse(raw) : {};
      const days = getLast7Days();
      const entries: DayEntry[] = days.map(d => ({
        ...d,
        count: data[d.date] ?? 0,
      }));
      const total = entries.reduce((sum, e) => sum + e.count, 0);
      setDailyCounts(entries);
      setTotalWeek(total);
    } catch (_) {
      // Fallback silencieux
      setDailyCounts(getLast7Days().map(d => ({ ...d, count: 0 })));
      setTotalWeek(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { dailyCounts, totalWeek, loading, refresh: load };
}

/**
 * Incrémente le compteur du jour courant dans AsyncStorage.
 * À appeler depuis ExpressSessionSheet quand une séance est complétée.
 */
export async function incrementDailyExpressCount(): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const raw = await AsyncStorage.getItem(EXPRESS_SESSIONS_DAY_KEY);
    const data: Record<string, number> = raw ? JSON.parse(raw) : {};
    data[today] = (data[today] ?? 0) + 1;
    // Nettoyer les entrées > 30 jours pour éviter la croissance infinie
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    for (const key of Object.keys(data)) {
      if (key < cutoffStr) delete data[key];
    }
    await AsyncStorage.setItem(EXPRESS_SESSIONS_DAY_KEY, JSON.stringify(data));
  } catch (_) {}
}
