/**
 * Écran Admin — Gestionnaire des Sons Ambiants
 *
 * Accessible depuis : /admin/ambient-manager
 * Permet de visualiser et modifier les URLs audio, catégories et métadonnées
 * de chaque son ambiant disponible dans l'application.
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useThemeContext } from '@/lib/theme-provider';
import { trpc } from '@/lib/trpc';

// Styles statiques pour les sous-composants
const styles = {} as ReturnType<typeof makeStyles>;

const CATEGORIES = [
  { id: 'nature',     label: 'Nature' },
  { id: 'meditation', label: 'Méditation' },
  { id: 'cosmos',     label: 'Cosmos' },
  { id: 'water',      label: 'Eau' },
  { id: 'fire',       label: 'Feu' },
];

type AmbientSound = {
  id: number;
  slug: string;
  name: string;
  emoji: string;
  category: string;
  audioUrl?: string | null;
  durationSeconds?: number | null;
  isPremium: boolean;
  isActive: boolean;
  description?: string | null;
};

// ─── Composant SoundRow ───────────────────────────────────────────────────────

function SoundRow({
  sound,
  onSaved,
}: {
  sound: AmbientSound;
  onSaved: () => void;
}) {
  const { isDark } = useThemeContext();
  const styles = useMemo(() => makeStyles(isDark), [isDark]);
  const [audioUrl, setAudioUrl] = useState(sound.audioUrl ?? '');
  const [duration, setDuration] = useState(sound.durationSeconds ? String(sound.durationSeconds) : '');
  const [category, setCategory] = useState(sound.category);
  const [description, setDescription] = useState(sound.description ?? '');
  const [isPremium, setIsPremium] = useState(sound.isPremium);
  const [isActive, setIsActive] = useState(sound.isActive);
  const [editing, setEditing] = useState(false);

  const upsertMutation = trpc.ambient.upsert.useMutation({
    onSuccess: () => {
      setEditing(false);
      onSaved();
    },
    onError: (err) => {
      Alert.alert('Erreur', err.message);
    },
  });

  const hasAudio = !!sound.audioUrl;
  const isDirty =
    audioUrl !== (sound.audioUrl ?? '') ||
    duration !== (sound.durationSeconds ? String(sound.durationSeconds) : '') ||
    category !== sound.category ||
    description !== (sound.description ?? '') ||
    isPremium !== sound.isPremium ||
    isActive !== sound.isActive;

  const handleSave = () => {
    upsertMutation.mutate({
      slug: sound.slug,
      name: sound.name,
      emoji: sound.emoji,
      category,
      audioUrl: audioUrl.trim() || null,
      durationSeconds: duration ? parseInt(duration, 10) : 0,
      isPremium,
      isActive,
      description: description.trim() || null,
      sortOrder: 0,
    });
  };

  const GOLD = isDark ? '#C8A96E' : '#8B6914';
  const TEXT1 = isDark ? '#F0EBE0' : '#1C1410';
  const TEXT2 = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(60,40,20,0.65)';
  const CARD = isDark ? '#201C38' : '#F8F5EF';
  const BORD = isDark ? 'rgba(200,169,110,0.30)' : 'rgba(139,105,20,0.20)';

  return (
    <View style={[styles.soundRow, { backgroundColor: CARD, borderColor: BORD }]}>
      {/* En-tête */}
      <TouchableOpacity
        style={styles.soundRowHeader}
        onPress={() => setEditing(!editing)}
        activeOpacity={0.75}
      >
        <Text style={styles.soundEmoji}>{sound.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.soundName, { color: TEXT1 }]}>{sound.name}</Text>
          <Text style={[styles.soundSlug, { color: TEXT2 }]}>
            {sound.slug} · {sound.category}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          {hasAudio ? (
            <View style={[styles.badge, { backgroundColor: '#14532D20', borderColor: '#16A34A40' }]}>
              <Text style={[styles.badgeText, { color: '#4ADE80' }]}>✓ URL</Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: '#7C2D1220', borderColor: '#EA580C40' }]}>
              <Text style={[styles.badgeText, { color: '#F97316' }]}>⚠ Manquant</Text>
            </View>
          )}
          {!isActive && (
            <View style={[styles.badge, { backgroundColor: 'rgba(100,100,100,0.15)', borderColor: 'rgba(150,150,150,0.3)' }]}>
              <Text style={[styles.badgeText, { color: TEXT2 }]}>Inactif</Text>
            </View>
          )}
        </View>
        <Text style={[styles.chevron, { color: GOLD }]}>{editing ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Formulaire d'édition */}
      {editing && (
        <View style={[styles.editForm, { borderTopColor: BORD }]}>
          {/* URL Audio */}
          <Text style={[styles.fieldLabel, { color: TEXT2 }]}>URL Audio (MP3/M4A)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2A2540' : '#FFFFFF', borderColor: BORD, color: TEXT1 }]}
            value={audioUrl}
            onChangeText={setAudioUrl}
            placeholder="https://exemple.com/son.mp3"
            placeholderTextColor={TEXT2}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />

          {/* Durée */}
          <Text style={[styles.fieldLabel, { color: TEXT2 }]}>Durée (secondes)</Text>
          <TextInput
            style={[styles.input, styles.inputSmall, { backgroundColor: isDark ? '#2A2540' : '#FFFFFF', borderColor: BORD, color: TEXT1 }]}
            value={duration}
            onChangeText={setDuration}
            placeholder="ex. 180 (= 3 min)"
            placeholderTextColor={TEXT2}
            keyboardType="numeric"
            returnKeyType="done"
          />

          {/* Catégorie */}
          <Text style={[styles.fieldLabel, { color: TEXT2 }]}>Catégorie</Text>
          <View style={styles.catRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: category === cat.id ? GOLD : (isDark ? '#2A2540' : '#FFFFFF'),
                    borderColor: category === cat.id ? GOLD : BORD,
                  },
                ]}
                onPress={() => setCategory(cat.id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.catChipText, { color: category === cat.id ? (isDark ? '#0D0B1A' : '#FFFFFF') : TEXT2 }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <Text style={[styles.fieldLabel, { color: TEXT2 }]}>Description (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.inputMulti, { backgroundColor: isDark ? '#2A2540' : '#FFFFFF', borderColor: BORD, color: TEXT1 }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Courte description du son..."
            placeholderTextColor={TEXT2}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />

          {/* Toggles */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, { backgroundColor: isPremium ? `${GOLD}25` : (isDark ? '#2A2540' : '#FFFFFF'), borderColor: isPremium ? GOLD : BORD }]}
              onPress={() => setIsPremium(!isPremium)}
              activeOpacity={0.75}
            >
              <Text style={[styles.toggleText, { color: isPremium ? GOLD : TEXT2 }]}>
                {isPremium ? '✦ Premium' : '○ Gratuit'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, { backgroundColor: isActive ? '#14532D20' : (isDark ? '#2A2540' : '#FFFFFF'), borderColor: isActive ? '#16A34A40' : BORD }]}
              onPress={() => setIsActive(!isActive)}
              activeOpacity={0.75}
            >
              <Text style={[styles.toggleText, { color: isActive ? '#4ADE80' : TEXT2 }]}>
                {isActive ? '✓ Actif' : '✗ Inactif'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Boutons action */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: BORD }]}
              onPress={() => {
                setAudioUrl(sound.audioUrl ?? '');
                setDuration(sound.durationSeconds ? String(sound.durationSeconds) : '');
                setCategory(sound.category);
                setDescription(sound.description ?? '');
                setIsPremium(sound.isPremium);
                setIsActive(sound.isActive);
                setEditing(false);
              }}
              activeOpacity={0.75}
            >
              <Text style={[styles.cancelBtnText, { color: TEXT2 }]}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: isDirty ? GOLD : `${GOLD}40`, opacity: upsertMutation.isPending ? 0.7 : 1 }]}
              onPress={handleSave}
              disabled={!isDirty || upsertMutation.isPending}
              activeOpacity={0.8}
            >
              {upsertMutation.isPending ? (
                <ActivityIndicator size="small" color={isDark ? '#0D0B1A' : '#FFFFFF'} />
              ) : (
                <Text style={[styles.saveBtnText, { color: isDark ? '#0D0B1A' : '#FFFFFF' }]}>
                  Enregistrer
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function AmbientManagerScreen() {
  const router = useRouter();
  const { isDark } = useThemeContext();
  const styles = useMemo(() => makeStyles(isDark), [isDark]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filterCategory, setFilterCategory] = useState('all');

  const { data: sounds = [], isLoading, refetch } = trpc.ambient.list.useQuery(
    { category: filterCategory === 'all' ? undefined : filterCategory },
  );

  const GOLD = isDark ? '#C8A96E' : '#8B6914';
  const TEXT1 = isDark ? '#F0EBE0' : '#1C1410';
  const TEXT2 = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(60,40,20,0.65)';
  const BORD = isDark ? 'rgba(200,169,110,0.30)' : 'rgba(139,105,20,0.20)';
  const CARD = isDark ? '#201C38' : '#F8F5EF';

  const configuredCount = sounds.filter((s: any) => !!s.audioUrl).length;

  return (
    <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={[styles.backBtn, { color: GOLD }]}>← Retour</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.title, { color: TEXT1 }]}>Sons Ambiants</Text>
              <Text style={[styles.subtitle, { color: TEXT2 }]}>Gestionnaire Admin</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={[styles.statsCard, { backgroundColor: CARD, borderColor: BORD }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: TEXT1 }]}>{sounds.length}</Text>
              <Text style={[styles.statLabel, { color: TEXT2 }]}>Sons total</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: BORD }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#4ADE80' }]}>{configuredCount}</Text>
              <Text style={[styles.statLabel, { color: TEXT2 }]}>Configurés</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: BORD }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#F97316' }]}>{sounds.length - configuredCount}</Text>
              <Text style={[styles.statLabel, { color: TEXT2 }]}>Sans URL</Text>
            </View>
          </View>

          {/* Guide */}
          <View style={[styles.guideCard, { backgroundColor: `${GOLD}10`, borderColor: `${GOLD}25` }]}>
            <Text style={[styles.guideTitle, { color: GOLD }]}>📋 Comment ajouter un son</Text>
            <Text style={[styles.guideText, { color: TEXT2 }]}>
              1. Cliquez sur un son pour l'éditer{'\n'}
              2. Collez l'URL directe du fichier MP3/M4A{'\n'}
              3. Indiquez la durée en secondes{'\n'}
              4. Enregistrez — le son sera disponible immédiatement
            </Text>
          </View>

          {/* Filtre catégories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catFilterRow}>
            {[{ id: 'all', label: 'Tous' }, ...CATEGORIES].map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catFilterChip,
                  {
                    backgroundColor: filterCategory === cat.id ? GOLD : (isDark ? '#201C38' : '#FFFFFF'),
                    borderColor: filterCategory === cat.id ? GOLD : BORD,
                  },
                ]}
                onPress={() => setFilterCategory(cat.id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.catFilterText, { color: filterCategory === cat.id ? (isDark ? '#0D0B1A' : '#FFFFFF') : TEXT2 }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Liste des sons */}
          {isLoading ? (
            <ActivityIndicator color={GOLD} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.soundList}>
              {sounds.map((sound: any) => (
                <SoundRow
                  key={sound.slug}
                  sound={sound}
                  onSaved={() => { setRefreshKey((k) => k + 1); refetch(); }}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(isDark: boolean) {
  const GOLD = isDark ? '#C8A96E' : '#8B6914';
  const TEXT1 = isDark ? '#F0EBE0' : '#1C1410';
  const TEXT2 = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(60,40,20,0.65)';
  const BORD = isDark ? 'rgba(200,169,110,0.30)' : 'rgba(139,105,20,0.20)';
  const CARD = isDark ? '#201C38' : '#F8F5EF';

  return StyleSheet.create({
    scroll: { paddingHorizontal: 18, paddingBottom: 120 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, marginBottom: 20 },
    backBtn: { fontSize: 14, fontWeight: '600' },
    title: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 20 },
    subtitle: { fontSize: 12, marginTop: 2 },

    statsCard: {
      flexDirection: 'row', borderRadius: 16, padding: 16, marginBottom: 14,
      borderWidth: 1, alignItems: 'center',
    },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: '800', lineHeight: 28 },
    statLabel: { fontSize: 10, letterSpacing: 0.5, marginTop: 2 },
    statDivider: { width: 1, height: 32 },

    guideCard: { borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1 },
    guideTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
    guideText: { fontSize: 12, lineHeight: 20 },

    catFilterRow: { gap: 8, paddingBottom: 16, paddingRight: 4 },
    catFilterChip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1 },
    catFilterText: { fontSize: 12, fontWeight: '600' },

    soundList: { gap: 10 },
    soundRow: {
      borderRadius: 14, borderWidth: 1, overflow: 'hidden',
      shadowColor: isDark ? '#000' : '#5C3D0A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.20 : 0.08,
      shadowRadius: isDark ? 6 : 5,
      elevation: isDark ? 3 : 2,
    },
    soundRowHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
    soundEmoji: { fontSize: 24, width: 32, textAlign: 'center' },
    soundName: { fontSize: 14, fontWeight: '600', lineHeight: 18 },
    soundSlug: { fontSize: 11, marginTop: 1 },
    badge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1 },
    badgeText: { fontSize: 10, fontWeight: '600' },
    chevron: { fontSize: 12, fontWeight: '700', marginLeft: 4 },

    editForm: { padding: 14, borderTopWidth: 1, gap: 0 },
    fieldLabel: { fontSize: 11, fontWeight: '600', marginBottom: 6, marginTop: 10, letterSpacing: 0.3 },
    input: {
      borderRadius: 10, padding: 12, fontSize: 13,
      borderWidth: 1, marginBottom: 2,
    },
    inputSmall: { paddingVertical: 10 },
    inputMulti: { minHeight: 60, paddingTop: 10, textAlignVertical: 'top' },

    catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 2 },
    catChip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
    catChipText: { fontSize: 12, fontWeight: '600' },

    toggleRow: { flexDirection: 'row', gap: 10, marginTop: 10, marginBottom: 2 },
    toggleBtn: { flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: 'center', borderWidth: 1 },
    toggleText: { fontSize: 12, fontWeight: '700' },

    actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
    cancelBtn: { flex: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center', borderWidth: 1 },
    cancelBtnText: { fontSize: 13, fontWeight: '600' },
    saveBtn: { flex: 2, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
    saveBtnText: { fontSize: 13, fontWeight: '800' },
  });
}
