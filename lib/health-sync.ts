/**
 * health-sync.ts
 * Service de synchronisation des données de sommeil depuis Apple Health (HealthKit)
 * et Google Health Connect (Android).
 *
 * Fonctionnement :
 * - iOS  : utilise react-native-health (HealthKit)
 * - Android : utilise react-native-health-connect (Health Connect)
 * - Web  : non supporté (retourne des données vides)
 */

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HealthSleepRecord {
  startDate: Date;
  endDate: Date;
  durationMinutes: number;
  /** 1-5 estimé depuis les phases de sommeil si disponible */
  quality?: number;
  source: "apple_health" | "google_fit";
  /** Identifiant unique de la source pour déduplication */
  sourceId?: string;
}

export interface HealthSyncStatus {
  connected: boolean;
  platform: "ios" | "android" | "web";
  lastSyncAt: string | null;
  recordsImported: number;
  permissionGranted: boolean;
}

const STORAGE_KEY_SYNC_STATUS = "health_sync_status";
const STORAGE_KEY_LAST_SYNC = "health_last_sync_at";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function estimateQualityFromDuration(minutes: number): number {
  if (minutes >= 450) return 5; // ≥ 7h30
  if (minutes >= 390) return 4; // ≥ 6h30
  if (minutes >= 330) return 3; // ≥ 5h30
  if (minutes >= 240) return 2; // ≥ 4h
  return 1;
}

// ─── iOS — Apple HealthKit ────────────────────────────────────────────────────

async function requestAppleHealthPermissions(): Promise<boolean> {
  try {
    // Import dynamique pour éviter les erreurs sur Android/Web
    const AppleHealthKit = await import("react-native-health").then(
      (m) => m.default
    );

    const permissions = {
      permissions: {
        read: [
          (AppleHealthKit as any).Constants.Permissions.SleepAnalysis,
        ],
        write: [],
      },
    };

    return new Promise((resolve) => {
      (AppleHealthKit as any).initHealthKit(permissions, (err: any) => {
        if (err) {
          console.warn("[HealthSync iOS] Permission error:", err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } catch (e) {
    console.warn("[HealthSync iOS] Not available:", e);
    return false;
  }
}

async function fetchAppleHealthSleep(
  startDate: Date,
  endDate: Date
): Promise<HealthSleepRecord[]> {
  try {
    const AppleHealthKit = await import("react-native-health").then(
      (m) => m.default
    );

    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    return new Promise((resolve) => {
      (AppleHealthKit as any).getSleepSamples(
        options,
        (err: any, results: any[]) => {
          if (err || !results) {
            console.warn("[HealthSync iOS] getSleepSamples error:", err);
            resolve([]);
            return;
          }

          // Regrouper les segments de sommeil par nuit
          const nightMap = new Map<string, HealthSleepRecord>();

          for (const sample of results) {
            // Ignorer les phases "InBed" si on a "Asleep"
            if (sample.value === "INBED") continue;

            const start = new Date(sample.startDate);
            const end = new Date(sample.endDate);
            const durationMs = end.getTime() - start.getTime();
            const durationMin = Math.round(durationMs / 60000);

            if (durationMin < 30) continue; // Ignorer les micro-siestes

            // Clé = date du coucher (YYYY-MM-DD)
            const sleepDate = new Date(start);
            if (sleepDate.getHours() < 12) {
              // Coucher avant midi = nuit précédente
              sleepDate.setDate(sleepDate.getDate() - 1);
            }
            const key = sleepDate.toISOString().split("T")[0];

            const existing = nightMap.get(key);
            if (existing) {
              // Additionner les durées pour la même nuit
              existing.durationMinutes += durationMin;
              if (end > existing.endDate) existing.endDate = end;
              if (start < existing.startDate) existing.startDate = start;
            } else {
              nightMap.set(key, {
                startDate: start,
                endDate: end,
                durationMinutes: durationMin,
                source: "apple_health",
                sourceId: `apple_${key}`,
              });
            }
          }

          // Calculer la qualité estimée
          const records = Array.from(nightMap.values()).map((r) => ({
            ...r,
            quality: estimateQualityFromDuration(r.durationMinutes),
          }));

          resolve(records);
        }
      );
    });
  } catch (e) {
    console.warn("[HealthSync iOS] fetchSleep error:", e);
    return [];
  }
}

// ─── Android — Google Health Connect ─────────────────────────────────────────

async function requestHealthConnectPermissions(): Promise<boolean> {
  try {
    const {
      initialize,
      requestPermission,
      SdkAvailabilityStatus,
      getSdkStatus,
    } = await import("react-native-health-connect");

    const status = await getSdkStatus();
    if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
      console.warn("[HealthSync Android] Health Connect not available:", status);
      return false;
    }

    await initialize();

    const granted = await requestPermission([
      { accessType: "read", recordType: "SleepSession" },
    ]);

    return granted.some(
      (p: any) => p.recordType === "SleepSession" && p.accessType === "read"
    );
  } catch (e) {
    console.warn("[HealthSync Android] Permission error:", e);
    return false;
  }
}

async function fetchHealthConnectSleep(
  startDate: Date,
  endDate: Date
): Promise<HealthSleepRecord[]> {
  try {
    const { readRecords } = await import("react-native-health-connect");

    const result = await readRecords("SleepSession", {
      timeRangeFilter: {
        operator: "between",
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    const records: HealthSleepRecord[] = [];

    for (const session of result.records) {
      const start = new Date((session as any).startTime);
      const end = new Date((session as any).endTime);
      const durationMs = end.getTime() - start.getTime();
      const durationMin = Math.round(durationMs / 60000);

      if (durationMin < 30) continue;

      // Calculer la durée de sommeil réel (hors "Awake") si les stages sont disponibles
      let sleepMinutes = durationMin;
      const stages = (session as any).stages ?? [];
      if (stages.length > 0) {
        const awakeMs = stages
          .filter((s: any) => s.stage === 1) // 1 = Awake
          .reduce((sum: number, s: any) => {
            const sStart = new Date(s.startTime).getTime();
            const sEnd = new Date(s.endTime).getTime();
            return sum + (sEnd - sStart);
          }, 0);
        sleepMinutes = Math.round((durationMs - awakeMs) / 60000);
      }

      const sleepDate = new Date(start);
      if (sleepDate.getHours() < 12) {
        sleepDate.setDate(sleepDate.getDate() - 1);
      }
      const key = sleepDate.toISOString().split("T")[0];

      records.push({
        startDate: start,
        endDate: end,
        durationMinutes: sleepMinutes,
        quality: estimateQualityFromDuration(sleepMinutes),
        source: "google_fit",
        sourceId: `android_${key}_${(session as any).metadata?.id ?? ""}`,
      });
    }

    return records;
  } catch (e) {
    console.warn("[HealthSync Android] fetchSleep error:", e);
    return [];
  }
}

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * Demande les permissions nécessaires selon la plateforme.
 * Retourne true si les permissions sont accordées.
 */
export async function requestHealthPermissions(): Promise<boolean> {
  if (Platform.OS === "ios") {
    return requestAppleHealthPermissions();
  } else if (Platform.OS === "android") {
    return requestHealthConnectPermissions();
  }
  return false;
}

/**
 * Récupère les données de sommeil des 30 derniers jours.
 */
export async function fetchSleepData(
  daysBack = 30
): Promise<HealthSleepRecord[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  if (Platform.OS === "ios") {
    return fetchAppleHealthSleep(startDate, endDate);
  } else if (Platform.OS === "android") {
    return fetchHealthConnectSleep(startDate, endDate);
  }
  return [];
}

/**
 * Lit le statut de synchronisation depuis AsyncStorage.
 */
export async function getHealthSyncStatus(): Promise<HealthSyncStatus> {
  const [statusStr, lastSync] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEY_SYNC_STATUS),
    AsyncStorage.getItem(STORAGE_KEY_LAST_SYNC),
  ]);

  const saved = statusStr ? JSON.parse(statusStr) : null;

  return {
    connected: saved?.connected ?? false,
    platform: Platform.OS as "ios" | "android" | "web",
    lastSyncAt: lastSync ?? null,
    recordsImported: saved?.recordsImported ?? 0,
    permissionGranted: saved?.permissionGranted ?? false,
  };
}

/**
 * Sauvegarde le statut de synchronisation dans AsyncStorage.
 */
export async function saveHealthSyncStatus(
  status: Partial<HealthSyncStatus>
): Promise<void> {
  const current = await getHealthSyncStatus();
  const updated = { ...current, ...status };
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEY_SYNC_STATUS, JSON.stringify(updated)),
    status.lastSyncAt
      ? AsyncStorage.setItem(STORAGE_KEY_LAST_SYNC, status.lastSyncAt)
      : Promise.resolve(),
  ]);
}

/**
 * Retourne le nom de la source selon la plateforme.
 */
export function getHealthSourceName(): string {
  if (Platform.OS === "ios") return "Apple Santé";
  if (Platform.OS === "android") return "Google Health Connect";
  return "Santé";
}

/**
 * Retourne l'icône de la source selon la plateforme.
 */
export function getHealthSourceIcon(): string {
  if (Platform.OS === "ios") return "🍎";
  if (Platform.OS === "android") return "🏃";
  return "❤️";
}

/**
 * Vérifie si la plateforme supporte la synchronisation santé.
 */
export function isHealthSyncSupported(): boolean {
  return Platform.OS === "ios" || Platform.OS === "android";
}
