import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Button, Card } from '../components';
import { useStore } from '../store/useStore';
import { FaceZone, UserGoal, Contraindication } from '../types';

interface EditProfileScreenProps {
  navigation: any;
}

const zoneOptions: { id: FaceZone; label: string; icon: string }[] = [
  { id: 'front', label: 'Front', icon: 'ellipse-outline' },
  { id: 'yeux', label: 'Yeux', icon: 'eye-outline' },
  { id: 'joues', label: 'Joues', icon: 'happy-outline' },
  { id: 'bouche', label: 'Bouche', icon: 'chatbubble-ellipses-outline' },
  { id: 'ovale', label: 'Ovale du visage', icon: 'person-outline' },
  { id: 'cou', label: 'Cou', icon: 'body-outline' },
];

const goalOptions: { id: UserGoal; label: string; description: string }[] = [
  {
    id: 'reduire_tensions',
    label: 'Réduire les tensions',
    description: 'Détendre les tensions (mâchoire, front)',
  },
  {
    id: 'definir_contours',
    label: 'Définir les contours',
    description: 'Sculpter et raffermir l\'ovale du visage',
  },
  {
    id: 'eclat_peau',
    label: 'Éclat de la peau',
    description: 'Améliorer la circulation et la luminosité',
  },
  {
    id: 'detente_globale',
    label: 'Détente globale',
    description: 'Relaxation complète du visage',
  },
  {
    id: 'anti_age_doux',
    label: 'Anti-âge doux',
    description: 'Prévenir et réduire les signes de l\'âge',
  },
  {
    id: 'routine_quotidienne',
    label: 'Routine quotidienne',
    description: 'Créer une habitude de soin régulière',
  },
];

const contraindicationOptions: { id: Contraindication; label: string }[] = [
  { id: 'atm', label: 'Troubles de l\'ATM (mâchoire)' },
  { id: 'douleurs_cervicales', label: 'Douleurs cervicales' },
  { id: 'post_chirurgie', label: 'Chirurgie récente du visage' },
  { id: 'injections_recentes', label: 'Injections récentes (Botox, fillers)' },
  { id: 'paralysie_faciale', label: 'Paralysie faciale' },
  { id: 'hypertension', label: 'Hypertension non contrôlée' },
  { id: 'glaucome', label: 'Glaucome' },
  { id: 'problemes_dentaires', label: 'Problèmes dentaires aigus' },
];

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  navigation,
}) => {
  const {
    user,
    updateProfile,
    updatePreferences,
    updateHealthInfo,
  } = useStore();

  const [firstName, setFirstName] = useState(user.profile.firstName || '');
  const [age, setAge] = useState(user.profile.age?.toString() || '');
  const [selectedZones, setSelectedZones] = useState<FaceZone[]>(
    user.preferences.focusZones
  );
  const [selectedGoals, setSelectedGoals] = useState<UserGoal[]>(
    user.preferences.primaryGoals
  );
  const [selectedContraindications, setSelectedContraindications] = useState<
    Contraindication[]
  >(user.healthInfo.contraindications);

  const handleToggleZone = (zone: FaceZone) => {
    if (user.settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  };

  const handleToggleGoal = (goal: UserGoal) => {
    if (user.settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleToggleContraindication = (contraindication: Contraindication) => {
    if (user.settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedContraindications((prev) =>
      prev.includes(contraindication)
        ? prev.filter((c) => c !== contraindication)
        : [...prev, contraindication]
    );
  };

  const handleSave = () => {
    if (user.settings.hapticEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Update profile
    updateProfile({
      firstName: firstName.trim() || undefined,
      age: age ? parseInt(age) : undefined,
    });

    // Update preferences
    updatePreferences({
      focusZones: selectedZones,
      primaryGoals: selectedGoals,
    });

    // Update health info
    updateHealthInfo({
      contraindications: selectedContraindications,
    });

    Alert.alert('Profil mis à jour', 'Vos modifications ont été enregistrées.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le profil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Info */}
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        <Card variant="default" padding="large" style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Prénom (optionnel)</Text>
            <TextInput
              style={styles.textInput}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Votre prénom"
              placeholderTextColor={colors.text.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Âge (optionnel)</Text>
            <TextInput
              style={styles.textInput}
              value={age}
              onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
              placeholder="Votre âge"
              placeholderTextColor={colors.text.muted}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>
        </Card>

        {/* Focus Zones */}
        <Text style={styles.sectionTitle}>Zones ciblées</Text>
        <Text style={styles.sectionDescription}>
          Sélectionnez les zones sur lesquelles vous souhaitez vous concentrer
        </Text>
        <View style={styles.optionsGrid}>
          {zoneOptions.map((zone) => (
            <TouchableOpacity
              key={zone.id}
              style={[
                styles.optionCard,
                selectedZones.includes(zone.id) && styles.optionCardSelected,
              ]}
              onPress={() => handleToggleZone(zone.id)}
            >
              <Ionicons
                name={zone.icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={
                  selectedZones.includes(zone.id)
                    ? colors.accent.green
                    : colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.optionLabel,
                  selectedZones.includes(zone.id) && styles.optionLabelSelected,
                ]}
              >
                {zone.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Goals */}
        <Text style={styles.sectionTitle}>Objectifs</Text>
        <Text style={styles.sectionDescription}>
          Quels sont vos objectifs principaux ?
        </Text>
        <View style={styles.goalsList}>
          {goalOptions.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalItem,
                selectedGoals.includes(goal.id) && styles.goalItemSelected,
              ]}
              onPress={() => handleToggleGoal(goal.id)}
            >
              <View style={styles.goalContent}>
                <Text
                  style={[
                    styles.goalLabel,
                    selectedGoals.includes(goal.id) && styles.goalLabelSelected,
                  ]}
                >
                  {goal.label}
                </Text>
                <Text style={styles.goalDescription}>{goal.description}</Text>
              </View>
              <Ionicons
                name={
                  selectedGoals.includes(goal.id)
                    ? 'checkmark-circle'
                    : 'ellipse-outline'
                }
                size={24}
                color={
                  selectedGoals.includes(goal.id)
                    ? colors.accent.green
                    : colors.text.muted
                }
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Contraindications */}
        <Text style={styles.sectionTitle}>Contre-indications</Text>
        <Text style={styles.sectionDescription}>
          Avez-vous l'une de ces conditions ? Nous adapterons les exercices.
        </Text>
        <Card variant="outlined" padding="none" style={styles.contraindicationsCard}>
          {contraindicationOptions.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.contraindicationItem,
                index < contraindicationOptions.length - 1 &&
                  styles.contraindicationItemBorder,
              ]}
              onPress={() => handleToggleContraindication(item.id)}
            >
              <Text
                style={[
                  styles.contraindicationLabel,
                  selectedContraindications.includes(item.id) &&
                    styles.contraindicationLabelSelected,
                ]}
              >
                {item.label}
              </Text>
              <Ionicons
                name={
                  selectedContraindications.includes(item.id)
                    ? 'checkbox'
                    : 'square-outline'
                }
                size={24}
                color={
                  selectedContraindications.includes(item.id)
                    ? colors.accent.coral
                    : colors.text.muted
                }
              />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors.text.muted}
          />
          <Text style={styles.infoNoteText}>
            Ces informations nous aident à personnaliser votre expérience et à vous
            proposer des exercices adaptés à vos besoins.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Enregistrer les modifications"
          onPress={handleSave}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  // Section
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  // Card
  card: {
    marginBottom: spacing.md,
  },
  // Input
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.label,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text.primary,
  },
  // Options Grid
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  optionCard: {
    width: '31%',
    marginHorizontal: '1%',
    marginBottom: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: colors.accent.green + '15',
    borderColor: colors.accent.green,
  },
  optionLabel: {
    ...typography.labelSmall,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: colors.accent.green,
  },
  // Goals
  goalsList: {
    marginBottom: spacing.lg,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalItemSelected: {
    backgroundColor: colors.accent.green + '10',
    borderColor: colors.accent.green,
  },
  goalContent: {
    flex: 1,
  },
  goalLabel: {
    ...typography.label,
    color: colors.text.primary,
  },
  goalLabelSelected: {
    color: colors.accent.green,
  },
  goalDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  // Contraindications
  contraindicationsCard: {
    marginBottom: spacing.lg,
  },
  contraindicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  contraindicationItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  contraindicationLabel: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
    marginRight: spacing.md,
  },
  contraindicationLabelSelected: {
    color: colors.accent.coral,
  },
  // Info Note
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  infoNoteText: {
    ...typography.caption,
    color: colors.text.muted,
    marginLeft: spacing.sm,
    flex: 1,
  },
  // Footer
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.dark,
  },
});

export default EditProfileScreen;
