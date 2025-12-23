import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Card } from '../components';

interface SafetyScreenProps {
  navigation: any;
}

const contraindicationsData = [
  {
    id: 'atm',
    title: 'Troubles de l\'ATM',
    description:
      'Dysfonctionnement de l\'articulation temporo-mandibulaire. Évitez les exercices impliquant une ouverture large de la bouche ou une pression sur la mâchoire.',
    icon: 'medical',
    severity: 'high',
  },
  {
    id: 'cervicales',
    title: 'Douleurs cervicales',
    description:
      'Douleurs ou tensions au niveau du cou. Évitez les exercices de rotation ou d\'extension du cou. Consultez un professionnel si les douleurs persistent.',
    icon: 'body',
    severity: 'high',
  },
  {
    id: 'chirurgie',
    title: 'Post-chirurgie faciale',
    description:
      'Intervention chirurgicale récente sur le visage. Attendez l\'avis de votre chirurgien avant de reprendre toute pratique de face yoga.',
    icon: 'bandage',
    severity: 'high',
  },
  {
    id: 'injections',
    title: 'Injections esthétiques récentes',
    description:
      'Botox, acide hyaluronique ou autres injections datant de moins de 2 semaines. Attendez la stabilisation complète avant de pratiquer.',
    icon: 'water',
    severity: 'medium',
  },
  {
    id: 'paralysie',
    title: 'Paralysie faciale',
    description:
      'Paralysie de Bell ou autre atteinte des nerfs faciaux. La pratique peut être bénéfique mais doit être supervisée par un professionnel de santé.',
    icon: 'alert-circle',
    severity: 'high',
  },
  {
    id: 'glaucome',
    title: 'Glaucome',
    description:
      'Pression intraoculaire élevée. Évitez les exercices qui augmentent la pression (têtes en bas, contractions oculaires intenses).',
    icon: 'eye',
    severity: 'medium',
  },
  {
    id: 'hypertension',
    title: 'Hypertension non contrôlée',
    description:
      'Tension artérielle élevée non maîtrisée. Évitez les exercices de rétention de souffle et les positions tête en bas.',
    icon: 'heart',
    severity: 'medium',
  },
];

const safetyTips = [
  {
    title: 'Écoutez votre corps',
    description:
      'Ne forcez jamais. Si un exercice provoque une douleur ou un inconfort, arrêtez immédiatement.',
    icon: 'ear',
  },
  {
    title: 'Hydratez-vous',
    description:
      'Buvez suffisamment d\'eau avant et après votre séance pour favoriser la circulation.',
    icon: 'water',
  },
  {
    title: 'Mains propres',
    description:
      'Lavez-vous toujours les mains avant de toucher votre visage pour éviter les irritations.',
    icon: 'hand-left',
  },
  {
    title: 'Progressez doucement',
    description:
      'Commencez par des exercices simples et augmentez progressivement l\'intensité.',
    icon: 'trending-up',
  },
  {
    title: 'Soyez régulier',
    description:
      'La constance est plus importante que l\'intensité. Quelques minutes chaque jour valent mieux qu\'une longue séance occasionnelle.',
    icon: 'calendar',
  },
  {
    title: 'Consultez si besoin',
    description:
      'En cas de doute, demandez l\'avis d\'un professionnel de santé avant de commencer.',
    icon: 'person',
  },
];

export const SafetyScreen: React.FC<SafetyScreenProps> = ({ navigation }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return colors.accent.coral;
      case 'medium':
        return colors.accent.gold;
      default:
        return colors.accent.teal;
    }
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
        <Text style={styles.headerTitle}>Sécurité & Précautions</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Important Notice */}
        <Card variant="outlined" padding="large" style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Ionicons
              name="information-circle"
              size={24}
              color={colors.accent.teal}
            />
            <Text style={styles.noticeTitle}>Avis important</Text>
          </View>
          <Text style={styles.noticeText}>
            Le face yoga est une pratique complémentaire de bien-être qui ne remplace en aucun cas un avis médical. Il s'inscrit dans une hygiène de vie globale et ne peut prétendre à des résultats médicaux ou esthétiques garantis.
          </Text>
          <Text style={styles.noticeText}>
            En cas de doute sur votre aptitude à pratiquer, consultez toujours un professionnel de santé.
          </Text>
        </Card>

        {/* Contraindications Section */}
        <Text style={styles.sectionTitle}>Zones & Contre-indications</Text>
        <Text style={styles.sectionDescription}>
          Certaines conditions nécessitent une attention particulière ou une exclusion temporaire de certains exercices.
        </Text>

        {contraindicationsData.map((item) => (
          <Card
            key={item.id}
            variant="default"
            padding="medium"
            style={styles.contraindicationCard}
          >
            <View style={styles.contraindicationHeader}>
              <View
                style={[
                  styles.contraindicationIcon,
                  { backgroundColor: getSeverityColor(item.severity) + '20' },
                ]}
              >
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={getSeverityColor(item.severity)}
                />
              </View>
              <View style={styles.contraindicationTitleContainer}>
                <Text style={styles.contraindicationTitle}>{item.title}</Text>
                <View
                  style={[
                    styles.severityBadge,
                    { backgroundColor: getSeverityColor(item.severity) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.severityText,
                      { color: getSeverityColor(item.severity) },
                    ]}
                  >
                    {item.severity === 'high' ? 'Important' : 'Modéré'}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.contraindicationDescription}>
              {item.description}
            </Text>
          </Card>
        ))}

        {/* Safety Tips Section */}
        <Text style={styles.sectionTitle}>Conseils de pratique</Text>
        <Text style={styles.sectionDescription}>
          Pour une pratique sûre et efficace, gardez ces recommandations à l'esprit.
        </Text>

        <View style={styles.tipsGrid}>
          {safetyTips.map((tip, index) => (
            <Card
              key={index}
              variant="default"
              padding="medium"
              style={styles.tipCard}
            >
              <View style={styles.tipIconContainer}>
                <Ionicons
                  name={tip.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={colors.accent.green}
                />
              </View>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDescription}>{tip.description}</Text>
            </Card>
          ))}
        </View>

        {/* When to Stop */}
        <Card variant="outlined" padding="large" style={styles.stopCard}>
          <View style={styles.stopHeader}>
            <Ionicons name="hand-left" size={24} color={colors.accent.coral} />
            <Text style={styles.stopTitle}>Quand s'arrêter</Text>
          </View>
          <Text style={styles.stopText}>
            Arrêtez immédiatement votre séance si vous ressentez :
          </Text>
          <View style={styles.stopList}>
            {[
              'Douleur vive ou inhabituelle',
              'Vertiges ou maux de tête',
              'Engourdissement du visage',
              'Vision trouble',
              'Difficulté à respirer',
              'Tout autre symptôme inquiétant',
            ].map((symptom, index) => (
              <View key={index} style={styles.stopListItem}>
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color={colors.accent.coral}
                />
                <Text style={styles.stopListText}>{symptom}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.stopFooter}>
            En cas de symptômes persistants, consultez un médecin.
          </Text>
        </Card>

        {/* Hygiene Tips */}
        <Text style={styles.sectionTitle}>Hygiène de vie</Text>
        <Card variant="default" padding="large" style={styles.hygieneCard}>
          <Text style={styles.hygieneText}>
            Le face yoga s'inscrit dans une approche globale du bien-être. Pour des résultats optimaux, pensez également à :
          </Text>
          <View style={styles.hygieneList}>
            {[
              'Dormir suffisamment (7-8h par nuit)',
              'Boire 1,5 à 2L d\'eau par jour',
              'Adopter une alimentation équilibrée',
              'Gérer votre stress au quotidien',
              'Protéger votre peau du soleil',
              'Éviter le tabac et l\'alcool en excès',
            ].map((tip, index) => (
              <View key={index} style={styles.hygieneListItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={colors.accent.green}
                />
                <Text style={styles.hygieneListText}>{tip}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Final Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Ionicons
            name="shield-checkmark"
            size={20}
            color={colors.accent.teal}
          />
          <Text style={styles.disclaimerText}>
            Cette application a été conçue avec le souci de votre sécurité. Les exercices proposés sont adaptés en fonction de vos contre-indications déclarées lors de l'onboarding.
          </Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  // Notice Card
  noticeCard: {
    backgroundColor: colors.accent.teal + '05',
    borderColor: colors.accent.teal + '30',
    marginBottom: spacing.xl,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  noticeTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  noticeText: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  // Section
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  // Contraindication Card
  contraindicationCard: {
    marginBottom: spacing.md,
  },
  contraindicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contraindicationIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  contraindicationTitleContainer: {
    flex: 1,
  },
  contraindicationTitle: {
    ...typography.label,
    color: colors.text.primary,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  severityText: {
    ...typography.caption,
    fontWeight: '500',
  },
  contraindicationDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  // Tips Grid
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.xl,
  },
  tipCard: {
    width: '48%',
    margin: '1%',
    marginBottom: spacing.md,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent.green + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipTitle: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  tipDescription: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  // Stop Card
  stopCard: {
    backgroundColor: colors.accent.coral + '05',
    borderColor: colors.accent.coral + '30',
    marginBottom: spacing.xl,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stopTitle: {
    ...typography.h4,
    color: colors.accent.coral,
    marginLeft: spacing.sm,
  },
  stopText: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  stopList: {
    marginBottom: spacing.md,
  },
  stopListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stopListText: {
    ...typography.body,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  stopFooter: {
    ...typography.bodySmall,
    color: colors.accent.coral,
    fontStyle: 'italic',
  },
  // Hygiene Card
  hygieneCard: {
    marginBottom: spacing.xl,
  },
  hygieneText: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  hygieneList: {},
  hygieneListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  hygieneListText: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  // Disclaimer
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accent.teal + '10',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  disclaimerText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

export default SafetyScreen;
