import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Card, ProgressCircle, BadgeComponent } from '../components';
import { useStore } from '../store/useStore';
import { FaceFeelRating } from '../types';

interface JournalScreenProps {
  navigation: any;
}

type ViewMode = 'overview' | 'calendar' | 'achievements';

export const JournalScreen: React.FC<JournalScreenProps> = ({ navigation }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [dailyNote, setDailyNote] = useState('');
  const [selectedFeeling, setSelectedFeeling] = useState<FaceFeelRating | null>(null);

  const { user, sessionHistory, dailyEntries, updateDailyEntry, getTodayEntry } = useStore();
  const { progress, settings } = user;

  // Get today's entry
  const todayEntry = getTodayEntry();

  // Initialize state from today's entry
  React.useEffect(() => {
    if (todayEntry) {
      setDailyNote(todayEntry.notes || '');
      setSelectedFeeling(todayEntry.morningFeel || null);
    }
  }, [todayEntry]);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    const thisMonth = sessionHistory.filter((s) => {
      const sessionDate = new Date(s.date);
      return (
        sessionDate.getMonth() === today.getMonth() &&
        sessionDate.getFullYear() === today.getFullYear()
      );
    });

    const thisWeek = sessionHistory.filter((s) => {
      const sessionDate = new Date(s.date);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return sessionDate >= weekAgo;
    });

    return {
      totalSessions: progress.totalSessions,
      totalMinutes: progress.totalMinutes,
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      thisMonthSessions: thisMonth.length,
      thisWeekSessions: thisWeek.length,
      averageSessionLength:
        progress.totalSessions > 0
          ? Math.round(progress.totalMinutes / progress.totalSessions)
          : 0,
    };
  }, [progress, sessionHistory]);

  // Generate calendar data
  const calendarData = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: { date: number | null; hasSession: boolean; isToday: boolean }[] = [];

    // Empty cells before first day
    for (let i = 0; i < startingDay; i++) {
      days.push({ date: null, hasSession: false, isToday: false });
    }

    // Days of month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasSession = sessionHistory.some((s) => s.date.startsWith(dateStr));
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();
      days.push({ date: day, hasSession, isToday });
    }

    return days;
  }, [selectedMonth, sessionHistory]);

  const changeMonth = (direction: number) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setSelectedMonth(newMonth);
  };

  const formatMonth = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const handleFeelingSelect = (feeling: FaceFeelRating) => {
    if (settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedFeeling(feeling);
    const today = new Date().toISOString().split('T')[0];
    updateDailyEntry({
      date: today,
      morningFeel: feeling,
    });
  };

  const handleSaveNotes = () => {
    if (settings.hapticEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const today = new Date().toISOString().split('T')[0];
    updateDailyEntry({
      date: today,
      notes: dailyNote,
    });
    setShowNotesModal(false);
  };

  const getTodayDateFormatted = (): string => {
    return new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const renderOverview = () => (
    <>
      {/* Main Stats */}
      <View style={styles.statsGrid}>
        <Card variant="elevated" padding="medium" style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="flame" size={24} color={colors.accent.gold} />
          </View>
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Jours consécutifs</Text>
        </Card>

        <Card variant="elevated" padding="medium" style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="trophy" size={24} color={colors.accent.green} />
          </View>
          <Text style={styles.statValue}>{stats.longestStreak}</Text>
          <Text style={styles.statLabel}>Record personnel</Text>
        </Card>
      </View>

      <View style={styles.statsGrid}>
        <Card variant="elevated" padding="medium" style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="time" size={24} color={colors.accent.teal} />
          </View>
          <Text style={styles.statValue}>{stats.totalMinutes}</Text>
          <Text style={styles.statLabel}>Minutes totales</Text>
        </Card>

        <Card variant="elevated" padding="medium" style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary[400]} />
          </View>
          <Text style={styles.statValue}>{stats.totalSessions}</Text>
          <Text style={styles.statLabel}>Séances</Text>
        </Card>
      </View>

      {/* Weekly Goal Progress */}
      <Card variant="default" padding="large" style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>Objectif hebdomadaire</Text>
          <Text style={styles.goalProgress}>
            {progress.weeklyProgress} / {progress.weeklyGoal}
          </Text>
        </View>
        <View style={styles.goalProgressBar}>
          <View
            style={[
              styles.goalProgressFill,
              {
                width: `${Math.min(
                  (progress.weeklyProgress / progress.weeklyGoal) * 100,
                  100
                )}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.goalDescription}>
          {progress.weeklyProgress >= progress.weeklyGoal
            ? 'Objectif atteint ! Bravo !'
            : `Plus que ${progress.weeklyGoal - progress.weeklyProgress} séance(s) pour cette semaine`}
        </Text>
      </Card>

      {/* Daily Notes CTA */}
      <TouchableOpacity onPress={() => setShowNotesModal(true)}>
        <Card
          variant="outlined"
          padding="large"
          style={styles.notesCard}
        >
          <View style={styles.notesContent}>
            <View style={styles.notesIcon}>
              <Ionicons name="book" size={24} color={colors.accent.gold} />
            </View>
            <View style={styles.notesTextContainer}>
              <Text style={styles.notesTitle}>Notes quotidiennes</Text>
              <Text style={styles.notesDescription}>
                {todayEntry?.notes
                  ? todayEntry.notes.substring(0, 40) + (todayEntry.notes.length > 40 ? '...' : '')
                  : 'Comment vous sentez-vous aujourd\'hui ?'}
              </Text>
            </View>
            <Ionicons
              name={todayEntry?.notes ? 'checkmark-circle' : 'chevron-forward'}
              size={20}
              color={todayEntry?.notes ? colors.accent.green : colors.text.tertiary}
            />
          </View>
        </Card>
      </TouchableOpacity>

      {/* How Face Feels */}
      <Text style={styles.sectionTitle}>Comment se sent votre visage ?</Text>
      <View style={styles.feelingsRow}>
        {([
          { id: 'tendu' as FaceFeelRating, label: 'Tendu', emoji: '😣' },
          { id: 'normal' as FaceFeelRating, label: 'Normal', emoji: '😐' },
          { id: 'detendu' as FaceFeelRating, label: 'Détendu', emoji: '😌' },
          { id: 'revitalise' as FaceFeelRating, label: 'Revitalisé', emoji: '✨' },
        ]).map((feeling) => (
          <TouchableOpacity
            key={feeling.id}
            style={[
              styles.feelingButton,
              selectedFeeling === feeling.id && styles.feelingButtonSelected,
            ]}
            onPress={() => handleFeelingSelect(feeling.id)}
          >
            <Text style={styles.feelingEmoji}>{feeling.emoji}</Text>
            <Text
              style={[
                styles.feelingLabel,
                selectedFeeling === feeling.id && styles.feelingLabelSelected,
              ]}
            >
              {feeling.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderCalendar = () => (
    <>
      {/* Month Navigation */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity
          style={styles.monthNavButton}
          onPress={() => changeMonth(-1)}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{formatMonth(selectedMonth)}</Text>
        <TouchableOpacity
          style={styles.monthNavButton}
          onPress={() => changeMonth(1)}
        >
          <Ionicons name="chevron-forward" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Week Days Header */}
      <View style={styles.weekDaysRow}>
        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
          <Text key={day} style={styles.weekDayLabel}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {calendarData.map((day, index) => (
          <View key={index} style={styles.calendarCell}>
            {day.date && (
              <View
                style={[
                  styles.calendarDay,
                  day.hasSession && styles.calendarDayWithSession,
                  day.isToday && styles.calendarDayToday,
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    day.hasSession && styles.calendarDayTextWithSession,
                    day.isToday && styles.calendarDayTextToday,
                  ]}
                >
                  {day.date}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.calendarLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent.green }]} />
          <Text style={styles.legendText}>Séance effectuée</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { borderWidth: 2, borderColor: colors.accent.green }]} />
          <Text style={styles.legendText}>Aujourd'hui</Text>
        </View>
      </View>

      {/* Monthly Summary */}
      <Card variant="default" padding="large" style={styles.monthlySummary}>
        <Text style={styles.summaryTitle}>
          Résumé de {formatMonth(selectedMonth)}
        </Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStatItem}>
            <Text style={styles.summaryStatValue}>{stats.thisMonthSessions}</Text>
            <Text style={styles.summaryStatLabel}>séances</Text>
          </View>
          <View style={styles.summaryStatItem}>
            <Text style={styles.summaryStatValue}>
              {calendarData.filter((d) => d.hasSession).length}
            </Text>
            <Text style={styles.summaryStatLabel}>jours actifs</Text>
          </View>
        </View>
      </Card>
    </>
  );

  const renderAchievements = () => (
    <>
      {/* Badges Earned */}
      <Text style={styles.sectionTitle}>
        Badges obtenus ({progress.badges.length})
      </Text>
      {progress.badges.length > 0 ? (
        <View style={styles.badgesGrid}>
          {progress.badges.map((badge) => (
            <View key={badge.id} style={styles.badgeItem}>
              <BadgeComponent badge={badge} size="medium" />
            </View>
          ))}
        </View>
      ) : (
        <Card variant="outlined" padding="large" style={styles.emptyBadgesCard}>
          <Ionicons name="ribbon-outline" size={48} color={colors.text.muted} />
          <Text style={styles.emptyBadgesText}>
            Commencez à pratiquer pour débloquer des badges !
          </Text>
        </Card>
      )}

      {/* Statistics */}
      <Text style={styles.sectionTitle}>Statistiques</Text>
      <Card variant="default" padding="large" style={styles.statisticsCard}>
        <View style={styles.statisticRow}>
          <Text style={styles.statisticLabel}>Exercices découverts</Text>
          <Text style={styles.statisticValue}>
            {progress.completedExercises.length}
          </Text>
        </View>
        <View style={styles.statisticRow}>
          <Text style={styles.statisticLabel}>Programmes terminés</Text>
          <Text style={styles.statisticValue}>
            {progress.completedPrograms.length}
          </Text>
        </View>
        <View style={styles.statisticRow}>
          <Text style={styles.statisticLabel}>Durée moyenne par séance</Text>
          <Text style={styles.statisticValue}>
            {stats.averageSessionLength} min
          </Text>
        </View>
        <View style={styles.statisticRow}>
          <Text style={styles.statisticLabel}>Séances cette semaine</Text>
          <Text style={styles.statisticValue}>{stats.thisWeekSessions}</Text>
        </View>
      </Card>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journal & Suivi</Text>
      </View>

      {/* View Mode Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { id: 'overview' as ViewMode, label: 'Aperçu', icon: 'stats-chart' },
          { id: 'calendar' as ViewMode, label: 'Calendrier', icon: 'calendar' },
          { id: 'achievements' as ViewMode, label: 'Badges', icon: 'ribbon' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, viewMode === tab.id && styles.tabActive]}
            onPress={() => setViewMode(tab.id)}
          >
            <Ionicons
              name={tab.icon as keyof typeof Ionicons.glyphMap}
              size={18}
              color={
                viewMode === tab.id
                  ? colors.accent.green
                  : colors.text.secondary
              }
            />
            <Text
              style={[
                styles.tabLabel,
                viewMode === tab.id && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === 'overview' && renderOverview()}
        {viewMode === 'calendar' && renderCalendar()}
        {viewMode === 'achievements' && renderAchievements()}
      </ScrollView>

      {/* Daily Notes Modal */}
      <Modal
        visible={showNotesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotesModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowNotesModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Notes du jour</Text>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveNotes}
              >
                <Text style={styles.modalSaveText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDate}>{getTodayDateFormatted()}</Text>

            <View style={styles.modalContent}>
              <Text style={styles.inputLabel}>Comment vous sentez-vous ?</Text>
              <TextInput
                style={styles.notesInput}
                multiline
                numberOfLines={6}
                placeholder="Partagez vos pensées, ressentis, ou observations sur votre pratique d'aujourd'hui..."
                placeholderTextColor={colors.text.muted}
                value={dailyNote}
                onChangeText={setDailyNote}
                textAlignVertical="top"
              />

              <View style={styles.modalTips}>
                <Ionicons name="bulb-outline" size={16} color={colors.accent.gold} />
                <Text style={styles.modalTipsText}>
                  Noter vos ressentis aide à suivre vos progrès et à rester motivé(e).
                </Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text.primary,
  },
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.accent.green,
  },
  tabLabel: {
    ...typography.label,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  tabLabelActive: {
    color: colors.accent.green,
  },
  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.h2,
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  // Goal Card
  goalCard: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  goalProgress: {
    ...typography.label,
    color: colors.accent.green,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: colors.background.elevated,
    borderRadius: 4,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: colors.accent.green,
    borderRadius: 4,
  },
  goalDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  // Notes Card
  notesCard: {
    marginBottom: spacing.xl,
  },
  notesContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent.gold + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notesTextContainer: {
    flex: 1,
  },
  notesTitle: {
    ...typography.label,
    color: colors.text.primary,
  },
  notesDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  // Section Title
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  // Feelings Row
  feelingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  feelingButton: {
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    minWidth: 72,
  },
  feelingEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  feelingLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  feelingButtonSelected: {
    backgroundColor: colors.accent.green + '20',
    borderWidth: 2,
    borderColor: colors.accent.green,
  },
  feelingLabelSelected: {
    color: colors.accent.green,
  },
  // Calendar
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  monthNavButton: {
    padding: spacing.sm,
  },
  monthTitle: {
    ...typography.h3,
    color: colors.text.primary,
    textTransform: 'capitalize',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekDayLabel: {
    flex: 1,
    ...typography.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  calendarCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: spacing.xs,
  },
  calendarDay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  calendarDayWithSession: {
    backgroundColor: colors.accent.green,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: colors.accent.green,
  },
  calendarDayText: {
    ...typography.body,
    color: colors.text.primary,
  },
  calendarDayTextWithSession: {
    color: colors.background.primary,
  },
  calendarDayTextToday: {
    color: colors.accent.green,
  },
  // Legend
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  legendText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  // Monthly Summary
  monthlySummary: {
    marginBottom: spacing.xl,
  },
  summaryTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textTransform: 'capitalize',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatValue: {
    ...typography.h2,
    color: colors.accent.green,
  },
  summaryStatLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  // Badges
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xl,
  },
  badgeItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyBadgesCard: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyBadgesText: {
    ...typography.body,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  // Statistics
  statisticsCard: {
    marginBottom: spacing.xl,
  },
  statisticRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  statisticLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  statisticValue: {
    ...typography.label,
    color: colors.text.primary,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.huge,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalCloseButton: {
    padding: spacing.sm,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  modalSaveButton: {
    padding: spacing.sm,
  },
  modalSaveText: {
    ...typography.label,
    color: colors.accent.green,
  },
  modalDate: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
    textTransform: 'capitalize',
  },
  modalContent: {
    paddingHorizontal: spacing.lg,
  },
  inputLabel: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  notesInput: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...typography.body,
    color: colors.text.primary,
    minHeight: 150,
    marginBottom: spacing.lg,
  },
  modalTips: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accent.gold + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  modalTipsText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

export default JournalScreen;
