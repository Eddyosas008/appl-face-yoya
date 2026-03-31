import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useUser } from '@/lib/user-context';
import { ADAPTIVE_JOURNEYS } from '@/lib/mock-data';
import { PremiumBadge } from '@/components/ui/premium-badge';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { AdaptiveJourney } from '@/shared/wellness-types';

function JourneyCard({ journey, isPremiumUser }: { journey: AdaptiveJourney; isPremiumUser: boolean }) {
  const colors = useColors();
  const isLocked = journey.isPremium && !isPremiumUser;

  return (
    <Pressable
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, marginBottom: 14 }]}
      onPress={() => router.push(`/journey/${journey.id}` as never)}
    >
      <LinearGradient
        colors={journey.coverGradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {isLocked && (
          <View style={styles.lockOverlay}>
            <IconSymbol name="lock.fill" size={18} color="rgba(255,255,255,0.8)" />
          </View>
        )}
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle}>{journey.title}</Text>
          {journey.isPremium && <PremiumBadge small />}
        </View>
        <Text style={styles.cardSubtitle}>{journey.subtitle}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>{journey.description}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{journey.duration} min</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{journey.steps.length} étapes</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function JourneysScreen() {
  const colors = useColors();
  const { profile } = useUser();

  return (
    <ScreenContainer>
      <FlatList
        data={ADAPTIVE_JOURNEYS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <JourneyCard journey={item} isPremiumUser={profile?.isPremium || false} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>Parcours adaptatifs</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Des parcours personnalisés selon votre état émotionnel du moment.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  header: { paddingTop: 16, marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  card: { borderRadius: 20, padding: 20, overflow: 'hidden' },
  lockOverlay: { position: 'absolute', top: 16, right: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '800', flex: 1, marginRight: 8 },
  cardSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 8 },
  cardDescription: { color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 18, marginBottom: 14 },
  cardMeta: { flexDirection: 'row', gap: 8 },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
});
