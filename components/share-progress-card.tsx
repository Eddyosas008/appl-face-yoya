import React, { useState, useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, ActivityIndicator,
  Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useThemeContext } from '@/lib/theme-provider';

interface ShareProgressCardProps {
  firstName?: string;
  streak: number;
  totalSessions: number;
  totalMinutes: number;
  weeklyExpressSessions?: number;
}

const GOLD = '#C8A96E';

export function ShareProgressCard({
  firstName,
  streak,
  totalSessions,
  totalMinutes,
  weeklyExpressSessions = 0,
}: ShareProgressCardProps) {
  const { isDark } = useThemeContext();
  const [sharing, setSharing] = useState(false);

  const CARD_BG = isDark ? 'rgba(22,19,43,0.98)' : 'rgba(255,252,245,0.98)';
  const TEXT_MAIN = isDark ? '#EDE8DC' : '#1C1410';
  const TEXT_SOFT = isDark ? 'rgba(237,232,220,0.6)' : 'rgba(28,20,16,0.55)';
  const BORDER = isDark ? 'rgba(200,169,110,0.20)' : 'rgba(139,105,20,0.15)';

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const durationLabel = hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}min` : ''}` : `${totalMinutes} min`;

  async function handleShare() {
    if (Platform.OS === 'web') {
      Alert.alert('Partage', 'Le partage de fichiers n\'est pas disponible sur le web. Utilisez l\'application mobile.');
      return;
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Partage indisponible', 'Le partage n\'est pas disponible sur cet appareil.');
      return;
    }

    setSharing(true);
    try {
      // Générer un fichier texte récapitulatif de la progression
      const name = firstName ? firstName : 'Utilisateur SomnioPax';
      const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      const shareText = `✨ Ma progression SomnioPax — ${date}

👤 ${name}

📊 Statistiques :
🔥 Série actuelle : ${streak} jour${streak > 1 ? 's' : ''} consécutif${streak > 1 ? 's' : ''}
🧘 Sessions totales : ${totalSessions} méditation${totalSessions > 1 ? 's' : ''}
⏱ Temps de pratique : ${durationLabel}
⚡ Séances express cette semaine : ${weeklyExpressSessions}

🌙 Je prends soin de mon bien-être avec SomnioPax.
Rejoignez-moi sur l'application !`;

      const fileUri = FileSystem.documentDirectory + 'somniopax_progression.txt';
      await FileSystem.writeAsStringAsync(fileUri, shareText, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Partager ma progression SomnioPax',
      });
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de partager votre progression. Réessayez.');
    } finally {
      setSharing(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: CARD_BG, borderColor: BORDER }]}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? ['rgba(200,169,110,0.12)', 'rgba(200,169,110,0.04)'] : ['rgba(200,169,110,0.10)', 'rgba(200,169,110,0.02)']}
        style={styles.header}
      >
        <Text style={styles.headerEmoji}>🏆</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: TEXT_MAIN }]}>Ma progression</Text>
          <Text style={[styles.headerSub, { color: TEXT_SOFT }]}>Partagez votre parcours bien-être</Text>
        </View>
      </LinearGradient>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatItem emoji="🔥" value={`${streak}j`} label="Série" color="#F97316" />
        <StatItem emoji="🧘" value={`${totalSessions}`} label="Sessions" color={GOLD} />
        <StatItem emoji="⏱" value={durationLabel} label="Pratique" color="#52B788" />
        <StatItem emoji="⚡" value={`${weeklyExpressSessions}`} label="Express" color="#4FC3F7" />
      </View>

      {/* Share button */}
      <Pressable
        style={({ pressed }) => [styles.shareBtn, { opacity: pressed ? 0.85 : 1 }]}
        onPress={handleShare}
        disabled={sharing}
      >
        <LinearGradient
          colors={[GOLD, '#A8854A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shareBtnGradient}
        >
          {sharing ? (
            <ActivityIndicator size="small" color="#1C1410" />
          ) : (
            <Text style={styles.shareBtnText}>📤 Partager ma progression</Text>
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function StatItem({ emoji, value, label, color }: { emoji: string; value: string; label: string; color: string }) {
  const { isDark } = useThemeContext();
  const TEXT_MAIN = isDark ? '#EDE8DC' : '#1C1410';
  const TEXT_SOFT = isDark ? 'rgba(237,232,220,0.55)' : 'rgba(28,20,16,0.50)';

  return (
    <View style={[styles.statItem, { backgroundColor: `${color}12`, borderColor: `${color}20` }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: TEXT_SOFT }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    gap: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  headerEmoji: { fontSize: 28 },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 2 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statEmoji: { fontSize: 20 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '500' },
  shareBtn: { margin: 12, marginTop: 4, borderRadius: 14, overflow: 'hidden' },
  shareBtnGradient: {
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: { color: '#1C1410', fontSize: 14, fontWeight: '700' },
});
