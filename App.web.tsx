import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, borderRadius, spacing, typography } from './src/theme';

type Tab = 'today' | 'programs' | 'exercises' | 'journal';
type Feeling = 'Tendu' | 'Neutre' | 'Détendu' | 'En forme';

const sessionSteps = [
  ['Détente de la mâchoire', 'Relâchez la mâchoire et expirez lentement. Ne forcez aucun mouvement.', '1 min'],
  ['Lissage du front', 'Posez les paumes à plat sur le front puis glissez doucement vers les tempes.', '2 min'],
  ['Retour au calme', 'Fermez les yeux et prenez trois respirations lentes, les épaules relâchées.', '2 min'],
];

const programs = [
  ['Détente du visage', '7 jours · 5 min / jour', 'Pour relâcher les tensions du front, des tempes et de la mâchoire.', colors.accent.teal],
  ['Rituel éclat', '14 jours · 10 min / jour', 'Un parcours progressif pour réveiller le visage avec douceur.', colors.accent.gold],
  ['Contour en douceur', '21 jours · 10 min / jour', 'Pour installer une routine régulière, sans intensité excessive.', colors.accent.green],
];

const exercises = [
  ['La mâchoire légère', 'Mâchoire · 90 s'],
  ['Le regard reposé', 'Yeux · 2 min'],
  ['Les joues éveillées', 'Joues · 2 min'],
  ['Le front serein', 'Front · 90 s'],
];

export default function WebApp() {
  const [tab, setTab] = useState<Tab>('today');
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [inSession, setInSession] = useState(false);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [filter, setFilter] = useState('Toutes');

  const focus = useMemo(() => {
    if (feeling === 'Tendu') return 'La routine privilégie des gestes lents, avec une attention particulière au relâchement.';
    if (feeling === 'Détendu' || feeling === 'En forme') return 'Gardez ce rythme confortable et restez attentif(ve) à vos sensations.';
    return 'Une routine courte, progressive et respectueuse de votre rythme vous attend.';
  }, [feeling]);

  const begin = () => {
    setTab('today');
    setInSession(true);
    setCompleted(false);
    setStep(0);
  };

  const next = () => {
    if (step === sessionSteps.length - 1) {
      setInSession(false);
      setCompleted(true);
    } else {
      setStep((current) => current + 1);
    }
  };

  const renderToday = () => (
    <>
      <View style={styles.hero}>
        <Text style={styles.kicker}>VOTRE ESPACE DE PRATIQUE</Text>
        <Text style={styles.title}>Bonjour, prenez ce moment pour vous.</Text>
        <Text style={styles.subtitle}>Quelques minutes suffisent pour ralentir, respirer et prendre soin de votre visage.</Text>
      </View>

      {completed && (
        <View style={styles.success}>
          <Text style={styles.successTitle}>Séance terminée</Text>
          <Text style={styles.successCopy}>Bravo pour ce temps pris pour vous. Votre régularité compte davantage que la performance.</Text>
        </View>
      )}

      {inSession ? (
        <View style={styles.player}>
          <View style={styles.playerHeader}>
            <TouchableOpacity onPress={() => setInSession(false)} accessibilityRole="button"><Text style={styles.subtleAction}>Quitter</Text></TouchableOpacity>
            <Text style={styles.stepCount}>ÉTAPE {step + 1} / {sessionSteps.length}</Text>
          </View>
          <View style={styles.progressRow}>
            {sessionSteps.map((_, index) => <View key={index} style={[styles.progressPart, index <= step && styles.progressPartOn]} />)}
          </View>
          <View style={styles.breatheCircle}><Text style={styles.breatheLeaf}>●</Text></View>
          <Text style={styles.duration}>{sessionSteps[step][2]}</Text>
          <Text style={styles.playerTitle}>{sessionSteps[step][0]}</Text>
          <Text style={styles.instruction}>{sessionSteps[step][1]}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity disabled={step === 0} onPress={() => setStep((current) => Math.max(0, current - 1))} style={[styles.secondaryButton, step === 0 && styles.disabled]} accessibilityRole="button"><Text style={styles.secondaryButtonText}>Précédent</Text></TouchableOpacity>
            <TouchableOpacity onPress={next} style={styles.primaryButton} accessibilityRole="button"><Text style={styles.primaryButtonText}>{step === 2 ? 'Terminer' : 'Suivant'}</Text></TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.session}>
          <View style={styles.sessionHeader}>
            <View style={styles.sessionHeaderText}><Text style={styles.kicker}>SÉANCE DU JOUR</Text><Text style={styles.sessionTitle}>Détente essentielle</Text><Text style={styles.sessionMeta}>3 exercices · 5 minutes · Niveau doux</Text></View>
            <View style={styles.timeBadge}><Text style={styles.timeBadgeText}>5 min</Text></View>
          </View>
          <View style={styles.chips}>{sessionSteps.map(([name]) => <View style={styles.chip} key={name}><Text style={styles.chipText}>{name}</Text></View>)}</View>
          <TouchableOpacity onPress={begin} style={styles.primaryButton} accessibilityRole="button"><Text style={styles.primaryButtonText}>Commencer la séance</Text></TouchableOpacity>
        </View>
      )}

      <View style={styles.metrics}>
        <View style={styles.metric}><Text style={[styles.metricMark, { color: colors.accent.gold }]}>●</Text><Text style={styles.metricValue}>3</Text><Text style={styles.metricLabel}>jours de suite</Text></View>
        <View style={styles.metric}><Text style={[styles.metricMark, { color: colors.accent.teal }]}>●</Text><Text style={styles.metricValue}>2/5</Text><Text style={styles.metricLabel}>cette semaine</Text></View>
        <View style={styles.metric}><Text style={[styles.metricMark, { color: colors.accent.green }]}>●</Text><Text style={styles.metricValue}>18</Text><Text style={styles.metricLabel}>minutes au total</Text></View>
      </View>

      <Text style={styles.sectionTitle}>Comment vous sentez-vous ?</Text>
      <Text style={styles.sectionSub}>Votre réponse est conservée localement pour adapter votre rituel.</Text>
      <View style={styles.feelings} accessibilityRole="radiogroup">
        {(['Tendu', 'Neutre', 'Détendu', 'En forme'] as Feeling[]).map((item) => (
          <TouchableOpacity key={item} onPress={() => setFeeling(item)} style={[styles.feeling, feeling === item && styles.feelingOn]} accessibilityRole="radio" accessibilityState={{ selected: feeling === item }}><Text style={[styles.feelingText, feeling === item && styles.feelingTextOn]}>{item}</Text></TouchableOpacity>
        ))}
      </View>
      <View style={styles.focus}><Text style={styles.focusKicker}>RITUEL PERSONNALISÉ</Text><Text style={styles.focusText}>{focus}</Text></View>
      <View style={styles.tip}><Text style={styles.tipTitle}>Astuce du jour</Text><Text style={styles.tipCopy}>Avant de commencer, relâchez les épaules. Les mouvements lents sont plus utiles que les mouvements forcés.</Text></View>
    </>
  );

  const renderPrograms = () => (
    <>
      <View style={styles.hero}><Text style={styles.title}>Des programmes simples, à votre rythme.</Text><Text style={styles.subtitle}>Vous pouvez interrompre ou adapter chaque parcours quand vous le souhaitez.</Text></View>
      {programs.map(([name, meta, copy, color]) => (
        <View style={styles.program} key={name}><View style={[styles.programBar, { backgroundColor: color as string }]} /><View style={styles.programBody}><Text style={styles.programTitle}>{name}</Text><Text style={[styles.programMeta, { color: color as string }]}>{meta}</Text><Text style={styles.programCopy}>{copy}</Text><TouchableOpacity onPress={begin} accessibilityRole="button"><Text style={[styles.programAction, { color: color as string }]}>Démarrer ce programme</Text></TouchableOpacity></View></View>
      ))}
    </>
  );

  const renderExercises = () => {
    const zones = ['Toutes', 'Mâchoire', 'Yeux', 'Joues', 'Front'];
    const list = filter === 'Toutes' ? exercises : exercises.filter(([, meta]) => meta.startsWith(filter));
    return <>
      <View style={styles.hero}><Text style={styles.title}>Explorer les exercices</Text><Text style={styles.subtitle}>Choisissez une zone et composez une pratique courte, confortable et adaptée à vos sensations.</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{zones.map((zone) => <TouchableOpacity key={zone} onPress={() => setFilter(zone)} style={[styles.filter, filter === zone && styles.filterOn]} accessibilityRole="button"><Text style={[styles.filterText, filter === zone && styles.filterTextOn]}>{zone}</Text></TouchableOpacity>)}</ScrollView>
      {list.map(([name, meta]) => <TouchableOpacity key={name} onPress={begin} style={styles.exercise} accessibilityRole="button"><View style={styles.exerciseDot} /><View style={styles.exerciseCopy}><Text style={styles.exerciseTitle}>{name}</Text><Text style={styles.exerciseMeta}>{meta}</Text></View><Text style={styles.chevron}>›</Text></TouchableOpacity>)}
    </>;
  };

  const renderJournal = () => (
    <>
      <View style={styles.hero}><Text style={styles.title}>Votre progression, sans pression.</Text><Text style={styles.subtitle}>Observez votre régularité et vos sensations : il ne s’agit pas d’un objectif de performance.</Text></View>
      <View style={styles.journalSummary}><View style={styles.journalMetric}><Text style={styles.journalNumber}>2</Text><Text style={styles.journalLabel}>séances cette semaine</Text></View><View style={styles.journalDivider} /><View style={styles.journalMetric}><Text style={styles.journalNumber}>5 min</Text><Text style={styles.journalLabel}>dernière séance</Text></View></View>
      <View style={styles.week}><Text style={styles.weekTitle}>Cette semaine</Text><View style={styles.days}>{['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => <View style={styles.day} key={`${day}-${index}`}><View style={[styles.dayDot, index < 2 && styles.dayDone, index === 2 && styles.dayToday]} /><Text style={styles.dayLabel}>{day}</Text></View>)}</View><Text style={styles.weekCopy}>Deux séances effectuées. Votre rythme est déjà une réussite.</Text></View>
      <View style={styles.safety}><Text style={styles.safetyTitle}>Pratique en sécurité</Text><Text style={styles.safetyCopy}>Le face yoga est une pratique complémentaire et ne remplace pas un avis médical. Arrêtez-vous si un mouvement est inconfortable ou douloureux.</Text></View>
    </>
  );

  return <View style={styles.root}>
    <View style={styles.topbar}><View style={styles.brand}><View style={styles.brandDot} /><Text style={styles.brandText}>Face Yoga</Text></View><Text style={styles.web}>APERÇU WEB</Text></View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.panel}>{tab === 'today' && renderToday()}{tab === 'programs' && renderPrograms()}{tab === 'exercises' && renderExercises()}{tab === 'journal' && renderJournal()}<View style={styles.disclaimer}><Text style={styles.disclaimerText}>Le face yoga est une pratique complémentaire qui s’inscrit dans une hygiène de vie globale et ne remplace pas un avis médical.</Text></View></View></ScrollView>
    <View style={styles.tabs}>{([['today', "Aujourd’hui"], ['programs', 'Programmes'], ['exercises', 'Exercices'], ['journal', 'Journal']] as Array<[Tab, string]>).map(([id, label]) => <TouchableOpacity key={id} onPress={() => setTab(id)} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: tab === id }}><View style={[styles.tabDot, tab === id && styles.tabDotOn]} /><Text style={[styles.tabText, tab === id && styles.tabTextOn]}>{label}</Text></TouchableOpacity>)}</View>
    <StatusBar style="light" />
  </View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.primary },
  topbar: { minHeight: 68, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, borderBottomWidth: 1, borderColor: colors.border.dark, backgroundColor: colors.background.secondary },
  brand: { flexDirection: 'row', alignItems: 'center' }, brandDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accent.green, marginRight: spacing.sm }, brandText: { ...typography.h4, color: colors.text.primary }, web: { ...typography.caption, color: colors.accent.teal, letterSpacing: 1 },
  content: { flexGrow: 1, alignItems: 'center', padding: spacing.lg, paddingBottom: 100 }, panel: { width: '100%', maxWidth: 820 },
  hero: { paddingTop: spacing.md, marginBottom: spacing.xl }, kicker: { ...typography.caption, color: colors.accent.teal, letterSpacing: 1, marginBottom: spacing.xs }, title: { ...typography.h1, color: colors.text.primary, maxWidth: 560 }, subtitle: { ...typography.body, color: colors.text.secondary, marginTop: spacing.sm, maxWidth: 620 },
  success: { padding: spacing.md, backgroundColor: colors.accent.green + '14', borderWidth: 1, borderColor: colors.accent.green + '55', borderRadius: borderRadius.md, marginBottom: spacing.lg }, successTitle: { ...typography.label, color: colors.accent.green }, successCopy: { ...typography.bodySmall, color: colors.text.secondary, marginTop: 2 },
  session: { padding: spacing.xl, borderRadius: borderRadius.xl, backgroundColor: colors.background.tertiary, borderWidth: 1, borderColor: colors.border.medium, marginBottom: spacing.lg }, sessionHeader: { flexDirection: 'row', justifyContent: 'space-between' }, sessionHeaderText: { flex: 1, paddingRight: spacing.md }, sessionTitle: { ...typography.h2, color: colors.text.primary, marginTop: spacing.xs }, sessionMeta: { ...typography.bodySmall, color: colors.text.secondary, marginTop: spacing.xs }, timeBadge: { alignSelf: 'flex-start', paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.accent.green + '18' }, timeBadgeText: { ...typography.labelSmall, color: colors.accent.green },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.lg, marginBottom: spacing.lg }, chip: { borderRadius: borderRadius.full, paddingVertical: 6, paddingHorizontal: spacing.sm, backgroundColor: colors.background.elevated, marginRight: spacing.sm, marginBottom: spacing.sm }, chipText: { ...typography.caption, color: colors.text.secondary }, primaryButton: { minHeight: 46, borderRadius: borderRadius.md, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.accent.green, paddingHorizontal: spacing.lg }, primaryButtonText: { ...typography.button, color: colors.background.primary },
  player: { padding: spacing.xl, alignItems: 'center', borderRadius: borderRadius.xl, backgroundColor: colors.background.tertiary, borderWidth: 1, borderColor: colors.accent.green + '55', marginBottom: spacing.lg }, playerHeader: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between' }, subtleAction: { ...typography.labelSmall, color: colors.text.secondary }, stepCount: { ...typography.caption, color: colors.text.tertiary, letterSpacing: 1 }, progressRow: { flexDirection: 'row', alignSelf: 'stretch', marginVertical: spacing.xl }, progressPart: { flex: 1, height: 4, backgroundColor: colors.background.elevated, marginHorizontal: 2, borderRadius: 2 }, progressPartOn: { backgroundColor: colors.accent.green }, breatheCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: colors.accent.green + '16', borderWidth: 1, borderColor: colors.accent.green + '55', justifyContent: 'center', alignItems: 'center' }, breatheLeaf: { fontSize: 34, color: colors.accent.green }, duration: { ...typography.label, color: colors.accent.teal, marginTop: spacing.lg }, playerTitle: { ...typography.h2, color: colors.text.primary, marginTop: spacing.xs, textAlign: 'center' }, instruction: { ...typography.bodyLarge, color: colors.text.secondary, textAlign: 'center', maxWidth: 560, marginTop: spacing.md, marginBottom: spacing.xl }, actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch' }, secondaryButton: { minHeight: 46, justifyContent: 'center', alignItems: 'center', borderRadius: borderRadius.md, paddingHorizontal: spacing.lg, backgroundColor: colors.background.elevated }, secondaryButtonText: { ...typography.buttonSmall, color: colors.text.primary }, disabled: { opacity: 0.4 },
  metrics: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xl }, metric: { flex: 1, minHeight: 104, justifyContent: 'center', marginHorizontal: 3, padding: spacing.md, borderRadius: borderRadius.lg, backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border.dark }, metricMark: { fontSize: 16 }, metricValue: { ...typography.h3, color: colors.text.primary, marginTop: spacing.xs }, metricLabel: { ...typography.caption, color: colors.text.secondary },
  sectionTitle: { ...typography.h4, color: colors.text.primary }, sectionSub: { ...typography.caption, color: colors.text.tertiary, marginTop: 2, marginBottom: spacing.md }, feelings: { flexDirection: 'row', justifyContent: 'space-between' }, feeling: { flex: 1, minHeight: 64, marginHorizontal: 3, borderRadius: borderRadius.md, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border.dark }, feelingOn: { backgroundColor: colors.accent.coral + '16', borderColor: colors.accent.coral }, feelingText: { ...typography.caption, color: colors.text.secondary }, feelingTextOn: { color: colors.text.primary, fontWeight: '600' }, focus: { padding: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.accent.teal + '10', borderWidth: 1, borderColor: colors.accent.teal + '30', marginTop: spacing.md, marginBottom: spacing.lg }, focusKicker: { ...typography.caption, color: colors.accent.teal, letterSpacing: 1 }, focusText: { ...typography.bodySmall, color: colors.text.secondary, marginTop: 4 }, tip: { padding: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.accent.gold + '0E', borderWidth: 1, borderColor: colors.accent.gold + '35', marginBottom: spacing.xl }, tipTitle: { ...typography.label, color: colors.text.primary }, tipCopy: { ...typography.bodySmall, color: colors.text.secondary, marginTop: 2 },
  program: { flexDirection: 'row', overflow: 'hidden', borderRadius: borderRadius.lg, backgroundColor: colors.background.tertiary, borderWidth: 1, borderColor: colors.border.dark, marginBottom: spacing.md }, programBar: { width: 5 }, programBody: { flex: 1, padding: spacing.lg }, programTitle: { ...typography.h4, color: colors.text.primary }, programMeta: { ...typography.caption, marginTop: 2 }, programCopy: { ...typography.bodySmall, color: colors.text.secondary, marginTop: spacing.sm }, programAction: { ...typography.labelSmall, marginTop: spacing.md },
  filters: { paddingBottom: spacing.lg }, filter: { borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border.dark, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.background.secondary, marginRight: spacing.sm }, filterOn: { borderColor: colors.accent.green, backgroundColor: colors.accent.green + '16' }, filterText: { ...typography.labelSmall, color: colors.text.secondary }, filterTextOn: { color: colors.accent.green }, exercise: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border.dark, marginBottom: spacing.sm }, exerciseDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent.green, marginRight: spacing.md }, exerciseCopy: { flex: 1 }, exerciseTitle: { ...typography.label, color: colors.text.primary }, exerciseMeta: { ...typography.caption, color: colors.text.secondary, marginTop: 2 }, chevron: { ...typography.h3, color: colors.text.tertiary },
  journalSummary: { flexDirection: 'row', padding: spacing.lg, borderRadius: borderRadius.lg, backgroundColor: colors.background.tertiary, borderWidth: 1, borderColor: colors.border.dark, marginBottom: spacing.lg }, journalMetric: { flex: 1, alignItems: 'center' }, journalNumber: { ...typography.h2, color: colors.text.primary }, journalLabel: { ...typography.caption, color: colors.text.secondary, textAlign: 'center', marginTop: 2 }, journalDivider: { width: 1, backgroundColor: colors.border.light, marginHorizontal: spacing.sm }, week: { padding: spacing.lg, borderRadius: borderRadius.lg, backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border.dark, marginBottom: spacing.lg }, weekTitle: { ...typography.h4, color: colors.text.primary }, days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg }, day: { alignItems: 'center', flex: 1 }, dayDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.background.elevated, marginBottom: 4 }, dayDone: { backgroundColor: colors.accent.green }, dayToday: { backgroundColor: colors.background.secondary, borderWidth: 2, borderColor: colors.accent.teal }, dayLabel: { ...typography.caption, color: colors.text.tertiary }, weekCopy: { ...typography.bodySmall, color: colors.text.secondary, marginTop: spacing.lg }, safety: { padding: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.accent.gold + '0E', borderWidth: 1, borderColor: colors.accent.gold + '35', marginBottom: spacing.xl }, safetyTitle: { ...typography.label, color: colors.text.primary }, safetyCopy: { ...typography.bodySmall, color: colors.text.secondary, marginTop: 2 },
  disclaimer: { padding: spacing.sm, marginBottom: spacing.lg }, disclaimerText: { ...typography.caption, color: colors.text.muted, textAlign: 'center' },
  tabs: { minHeight: 70, flexDirection: 'row', backgroundColor: colors.background.secondary, borderTopWidth: 1, borderColor: colors.border.dark, paddingTop: 6, paddingBottom: 8 }, tab: { flex: 1, alignItems: 'center', justifyContent: 'center' }, tabDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.text.tertiary, marginBottom: 3 }, tabDotOn: { backgroundColor: colors.accent.green }, tabText: { ...typography.caption, color: colors.text.tertiary }, tabTextOn: { color: colors.accent.green, fontWeight: '600' },
});
