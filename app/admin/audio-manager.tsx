import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';

// Durée en secondes à partir d'un format "mm:ss" ou nombre
function parseDuration(input: string): number | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':');
    const m = parseInt(parts[0], 10);
    const s = parseInt(parts[1], 10);
    if (!isNaN(m) && !isNaN(s)) return m * 60 + s;
  }
  const n = parseInt(trimmed, 10);
  return isNaN(n) ? undefined : n;
}

export default function AudioManagerScreen() {
  const colors = useColors();
  const { isAuthenticated } = useAuth();

  // Charger toutes les méditations
  const { data: meditations = [], isLoading, refetch } = trpc.catalog.list.useQuery({ limit: 200 });
  const updateAudioUrl = trpc.catalog.updateAudioUrl.useMutation();

  // État local par slug : { audioUrl, duration, saving, saved }
  const [edits, setEdits] = useState<Record<string, { audioUrl: string; duration: string; saving: boolean; saved: boolean }>>({});

  function getEdit(slug: string, defaultUrl: string | null, defaultDuration: number) {
    if (edits[slug]) return edits[slug];
    return { audioUrl: defaultUrl ?? '', duration: defaultDuration > 0 ? String(defaultDuration) : '', saving: false, saved: false };
  }

  function setField(slug: string, field: 'audioUrl' | 'duration', value: string, defaultUrl: string | null, defaultDuration: number) {
    const current = getEdit(slug, defaultUrl, defaultDuration);
    setEdits(prev => ({ ...prev, [slug]: { ...current, [field]: value, saved: false } }));
  }

  async function handleSave(slug: string, defaultUrl: string | null, defaultDuration: number) {
    const edit = getEdit(slug, defaultUrl, defaultDuration);
    const audioUrl = edit.audioUrl.trim() || null;
    const audioDurationSeconds = parseDuration(edit.duration);

    // Valider l'URL si fournie
    if (audioUrl) {
      try { new URL(audioUrl); } catch {
        Alert.alert('URL invalide', 'Veuillez entrer une URL valide (ex: https://...)');
        return;
      }
    }

    setEdits(prev => ({ ...prev, [slug]: { ...edit, saving: true } }));
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await updateAudioUrl.mutateAsync({ slug, audioUrl, audioDurationSeconds });
      setEdits(prev => ({ ...prev, [slug]: { ...edit, audioUrl: audioUrl ?? '', saving: false, saved: true } }));
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      refetch();
    } catch (err: any) {
      setEdits(prev => ({ ...prev, [slug]: { ...edit, saving: false } }));
      Alert.alert('Erreur', err?.message ?? 'Impossible de sauvegarder');
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
          <Text style={{ fontSize: 40 }}>🔒</Text>
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
            Accès réservé aux administrateurs
          </Text>
          <Pressable
            style={({ pressed }) => [styles.btn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.btnText}>Retour</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Gestion Audio</Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>
            {meditations.length} méditation{meditations.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.muted }}>Chargement des méditations...</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Légende */}
          <View style={[styles.legend, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}20` }]}>
            <Text style={[styles.legendText, { color: colors.muted }]}>
              💡 Collez l'URL directe de votre fichier audio (MP3, M4A, AAC) hébergé sur un serveur ou un CDN. La durée peut être saisie en secondes ou au format <Text style={{ fontWeight: '700' }}>mm:ss</Text>.
            </Text>
          </View>

          {meditations.map((med) => {
            const edit = getEdit(med.slug, med.audioUrl, med.audioDurationSeconds);
            const hasAudio = !!(med.audioUrl && med.audioUrl.trim() !== '');
            const isDirty = edit.audioUrl !== (med.audioUrl ?? '') || edit.duration !== (med.audioDurationSeconds > 0 ? String(med.audioDurationSeconds) : '');

            return (
              <View
                key={med.slug}
                style={[styles.card, {
                  backgroundColor: colors.surface,
                  borderColor: edit.saved ? colors.success : hasAudio ? `${colors.primary}30` : colors.border,
                  borderWidth: edit.saved || hasAudio ? 1.5 : 1,
                }]}
              >
                {/* Titre méditation */}
                <View style={styles.cardHeader}>
                  <View style={[styles.statusDot, { backgroundColor: hasAudio ? colors.success : colors.border }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.medTitle, { color: colors.foreground }]} numberOfLines={1}>
                      {med.title}
                    </Text>
                    <Text style={[styles.medMeta, { color: colors.muted }]}>
                      {med.categorySlug} · {med.level}
                      {hasAudio ? ' · ✅ Audio assigné' : ' · ⏳ En attente'}
                    </Text>
                  </View>
                  {edit.saved && (
                    <Text style={{ fontSize: 18 }}>✅</Text>
                  )}
                </View>

                {/* Champ URL audio */}
                <Text style={[styles.label, { color: colors.muted }]}>URL Audio (MP3/M4A)</Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: colors.background,
                    borderColor: edit.audioUrl && !edit.audioUrl.startsWith('http') ? colors.error : colors.border,
                    color: colors.foreground,
                  }]}
                  value={edit.audioUrl}
                  onChangeText={(v) => setField(med.slug, 'audioUrl', v, med.audioUrl, med.audioDurationSeconds)}
                  placeholder="https://votre-cdn.com/audio/meditation.mp3"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  returnKeyType="next"
                />

                {/* Champ durée */}
                <Text style={[styles.label, { color: colors.muted }]}>Durée (ex: 420 ou 7:00)</Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.foreground,
                  }]}
                  value={edit.duration}
                  onChangeText={(v) => setField(med.slug, 'duration', v, med.audioUrl, med.audioDurationSeconds)}
                  placeholder="420 ou 7:00"
                  placeholderTextColor={colors.muted}
                  keyboardType="default"
                  returnKeyType="done"
                />

                {/* Bouton sauvegarder */}
                <Pressable
                  style={({ pressed }) => [
                    styles.saveBtn,
                    {
                      backgroundColor: edit.saved ? colors.success : isDirty ? colors.primary : `${colors.primary}40`,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                  onPress={() => handleSave(med.slug, med.audioUrl, med.audioDurationSeconds)}
                  disabled={edit.saving || (!isDirty && !edit.audioUrl)}
                >
                  {edit.saving ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.saveBtnText}>
                      {edit.saved ? '✅ Sauvegardé' : isDirty ? '💾 Enregistrer' : '💾 Enregistrer'}
                    </Text>
                  )}
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSub: { fontSize: 13, marginTop: 2 },
  legend: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 4,
  },
  legendText: { fontSize: 13, lineHeight: 20 },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 8,
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  medTitle: { fontSize: 15, fontWeight: '700' },
  medMeta: { fontSize: 12, marginTop: 2 },
  label: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  saveBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  btn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
