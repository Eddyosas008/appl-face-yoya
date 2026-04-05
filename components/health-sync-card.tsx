/**
 * HealthSyncCard
 * Composant d'interface pour la synchronisation des données de sommeil
 * depuis Apple Health (iOS) ou Google Health Connect (Android).
 *
 * Affiche :
 * - Statut de connexion (connecté / non connecté)
 * - Dernière synchronisation
 * - Bouton de synchronisation manuelle
 * - Résultat de l'import (X nuits importées)
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import {
  fetchSleepData,
  getHealthSourceIcon,
  getHealthSourceName,
  getHealthSyncStatus,
  isHealthSyncSupported,
  requestHealthPermissions,
  saveHealthSyncStatus,
  type HealthSyncStatus,
} from "@/lib/health-sync";

interface HealthSyncCardProps {
  onSyncComplete?: (imported: number) => void;
}

export function HealthSyncCard({ onSyncComplete }: HealthSyncCardProps) {
  const colors = useColors();
  const [status, setStatus] = useState<HealthSyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);

  const importMutation = trpc.sleep.importFromHealth.useMutation();

  // Charger le statut initial
  useEffect(() => {
    getHealthSyncStatus().then(setStatus);
  }, []);

  const handleConnect = useCallback(async () => {
    if (!isHealthSyncSupported()) {
      Alert.alert(
        "Non disponible",
        "La synchronisation santé n'est pas disponible sur cette plateforme."
      );
      return;
    }

    setSyncing(true);
    try {
      const granted = await requestHealthPermissions();
      if (!granted) {
        Alert.alert(
          "Permission refusée",
          `Veuillez autoriser l'accès à ${getHealthSourceName()} dans les réglages de votre appareil.`
        );
        return;
      }

      // Récupérer les données de sommeil des 30 derniers jours
      const records = await fetchSleepData(30);

      if (records.length === 0) {
        Alert.alert(
          "Aucune donnée",
          `Aucune donnée de sommeil trouvée dans ${getHealthSourceName()} pour les 30 derniers jours.`
        );
        await saveHealthSyncStatus({
          connected: true,
          permissionGranted: true,
          lastSyncAt: new Date().toISOString(),
          recordsImported: 0,
        });
        const newStatus = await getHealthSyncStatus();
        setStatus(newStatus);
        return;
      }

      // Importer les données via tRPC
      const result = await importMutation.mutateAsync({
        records: records.map((r) => ({
          startDate: r.startDate.toISOString(),
          endDate: r.endDate.toISOString(),
          durationMinutes: r.durationMinutes,
          quality: r.quality,
          source: r.source,
          sourceId: r.sourceId,
        })),
      });

      setLastResult({ imported: result.imported, skipped: result.skipped });

      await saveHealthSyncStatus({
        connected: true,
        permissionGranted: true,
        lastSyncAt: new Date().toISOString(),
        recordsImported: (status?.recordsImported ?? 0) + result.imported,
      });

      const newStatus = await getHealthSyncStatus();
      setStatus(newStatus);

      if (result.imported > 0) {
        onSyncComplete?.(result.imported);
        Alert.alert(
          "Synchronisation réussie ✅",
          `${result.imported} nuit${result.imported > 1 ? "s" : ""} importée${result.imported > 1 ? "s" : ""} depuis ${getHealthSourceName()}.${result.skipped > 0 ? `\n${result.skipped} nuit${result.skipped > 1 ? "s" : ""} déjà enregistrée${result.skipped > 1 ? "s" : ""}.` : ""}`
        );
      } else {
        Alert.alert(
          "Déjà à jour",
          `Toutes les nuits de ${getHealthSourceName()} sont déjà enregistrées dans SomnioPax.`
        );
      }
    } catch (e: any) {
      console.error("[HealthSyncCard] Error:", e);
      Alert.alert(
        "Erreur de synchronisation",
        e?.message ?? "Une erreur est survenue lors de la synchronisation."
      );
    } finally {
      setSyncing(false);
    }
  }, [importMutation, onSyncComplete, status]);

  const handleSync = useCallback(async () => {
    if (!status?.connected) {
      handleConnect();
      return;
    }

    setSyncing(true);
    try {
      const records = await fetchSleepData(30);

      if (records.length === 0) {
        Alert.alert("Aucune donnée", "Aucune nouvelle donnée de sommeil trouvée.");
        return;
      }

      const result = await importMutation.mutateAsync({
        records: records.map((r) => ({
          startDate: r.startDate.toISOString(),
          endDate: r.endDate.toISOString(),
          durationMinutes: r.durationMinutes,
          quality: r.quality,
          source: r.source,
          sourceId: r.sourceId,
        })),
      });

      setLastResult({ imported: result.imported, skipped: result.skipped });

      await saveHealthSyncStatus({
        lastSyncAt: new Date().toISOString(),
        recordsImported: (status?.recordsImported ?? 0) + result.imported,
      });

      const newStatus = await getHealthSyncStatus();
      setStatus(newStatus);

      if (result.imported > 0) {
        onSyncComplete?.(result.imported);
      }

      Alert.alert(
        result.imported > 0 ? "Synchronisation réussie ✅" : "Déjà à jour",
        result.imported > 0
          ? `${result.imported} nuit${result.imported > 1 ? "s" : ""} importée${result.imported > 1 ? "s" : ""}.`
          : "Toutes les nuits sont déjà enregistrées."
      );
    } catch (e: any) {
      Alert.alert("Erreur", e?.message ?? "Erreur de synchronisation.");
    } finally {
      setSyncing(false);
    }
  }, [importMutation, onSyncComplete, status]);

  // Ne pas afficher sur web
  if (!isHealthSyncSupported()) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={{ fontSize: 28 }}>💻</Text>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Synchronisation santé
          </Text>
          <Text style={[styles.statusText, { color: colors.muted }]}>
            Disponible sur iOS et Android uniquement
          </Text>
        </View>
      </View>
    );
  }

  const sourceName = getHealthSourceName();
  const sourceIcon = getHealthSourceIcon();
  const isConnected = status?.connected ?? false;
  const lastSync = status?.lastSyncAt
    ? new Date(status.lastSyncAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>{sourceIcon}</Text>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {sourceName}
            </Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isConnected ? colors.success : colors.muted },
                ]}
              />
              <Text style={[styles.statusText, { color: colors.muted }]}>
                {isConnected ? "Connecté" : "Non connecté"}
              </Text>
            </View>
          </View>
        </View>

        {/* Bouton sync */}
        <Pressable
          onPress={handleSync}
          disabled={syncing}
          style={({ pressed }) => [
            styles.syncButton,
            {
              backgroundColor: isConnected ? colors.primary : colors.primary,
              opacity: pressed || syncing ? 0.7 : 1,
            },
          ]}
        >
          {syncing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.syncButtonText}>
              {isConnected ? "Sync" : "Connecter"}
            </Text>
          )}
        </Pressable>
      </View>

      {/* Infos */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {status?.recordsImported ?? 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>
            nuits importées
          </Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {lastSync ?? "—"}
          </Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>
            dernière sync
          </Text>
        </View>
      </View>

      {/* Résultat du dernier import */}
      {lastResult && lastResult.imported > 0 && (
        <View style={[styles.resultBanner, { backgroundColor: colors.success + "20" }]}>
          <Text style={[styles.resultText, { color: colors.success }]}>
            ✓ {lastResult.imported} nuit{lastResult.imported > 1 ? "s" : ""} importée{lastResult.imported > 1 ? "s" : ""}
          </Text>
        </View>
      )}

      {/* Note plateforme */}
      <Text style={[styles.note, { color: colors.muted }]}>
        {Platform.OS === "ios"
          ? "Les données sont lues depuis l'app Santé d'Apple. Aucune donnée n'est partagée avec des tiers."
          : "Les données sont lues depuis Google Health Connect. Aucune donnée n'est partagée avec des tiers."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
  },
  syncButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  syncButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    height: 1,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  statLabel: {
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  resultBanner: {
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  resultText: {
    fontSize: 13,
    fontWeight: "600",
  },
  note: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
});
