import { Badge } from '../types';

// ============================================
// BADGES & GAMIFICATION DOUCE
// ============================================
// Système de récompenses non culpabilisant
// Focus sur la progression personnelle, pas la performance

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: 'streak' | 'completion' | 'exploration' | 'milestone';
  requirement: BadgeRequirement;
  motivationalMessage: string;
}

export interface BadgeRequirement {
  type: 'streak' | 'sessions' | 'minutes' | 'exercises' | 'programs' | 'zones';
  value: number;
  additionalCondition?: string;
}

export const badgeDefinitions: BadgeDefinition[] = [
  // ============================================
  // BADGES STREAK (Non culpabilisants)
  // ============================================
  {
    id: 'badge-streak-3',
    name: 'Premier Élan',
    description: '3 jours de pratique',
    iconName: 'leaf',
    category: 'streak',
    requirement: { type: 'streak', value: 3 },
    motivationalMessage: 'Trois jours, c\'est le début d\'une belle habitude. Continuez à votre rythme !',
  },
  {
    id: 'badge-streak-7',
    name: 'Semaine Complète',
    description: '7 jours consécutifs',
    iconName: 'calendar',
    category: 'streak',
    requirement: { type: 'streak', value: 7 },
    motivationalMessage: 'Une semaine de pratique ! Votre visage vous remercie pour cette attention.',
  },
  {
    id: 'badge-streak-14',
    name: 'Deux Semaines',
    description: '14 jours consécutifs',
    iconName: 'star',
    category: 'streak',
    requirement: { type: 'streak', value: 14 },
    motivationalMessage: 'Deux semaines ! Votre routine commence à s\'ancrer naturellement.',
  },
  {
    id: 'badge-streak-21',
    name: 'Habitude Créée',
    description: '21 jours consécutifs',
    iconName: 'award',
    category: 'streak',
    requirement: { type: 'streak', value: 21 },
    motivationalMessage: 'On dit que 21 jours suffisent pour créer une habitude. La vôtre est bien installée !',
  },
  {
    id: 'badge-streak-30',
    name: 'Un Mois',
    description: '30 jours consécutifs',
    iconName: 'trophy',
    category: 'streak',
    requirement: { type: 'streak', value: 30 },
    motivationalMessage: 'Un mois complet ! Vous avez fait du face yoga une partie de votre quotidien.',
  },

  // ============================================
  // BADGES SESSIONS
  // ============================================
  {
    id: 'badge-sessions-1',
    name: 'Bienvenue',
    description: 'Première séance complétée',
    iconName: 'play',
    category: 'completion',
    requirement: { type: 'sessions', value: 1 },
    motivationalMessage: 'Bienvenue dans votre voyage face yoga ! Chaque séance compte.',
  },
  {
    id: 'badge-sessions-10',
    name: 'Pratiquant Régulier',
    description: '10 séances complétées',
    iconName: 'heart',
    category: 'completion',
    requirement: { type: 'sessions', value: 10 },
    motivationalMessage: '10 séances ! Vous prenez vraiment soin de vous.',
  },
  {
    id: 'badge-sessions-25',
    name: 'Fidèle',
    description: '25 séances complétées',
    iconName: 'smile',
    category: 'completion',
    requirement: { type: 'sessions', value: 25 },
    motivationalMessage: '25 séances de bien-être facial. Votre engagement est inspirant !',
  },
  {
    id: 'badge-sessions-50',
    name: 'Dédié',
    description: '50 séances complétées',
    iconName: 'sun',
    category: 'completion',
    requirement: { type: 'sessions', value: 50 },
    motivationalMessage: '50 séances ! Le face yoga fait maintenant partie de qui vous êtes.',
  },
  {
    id: 'badge-sessions-100',
    name: 'Centurion',
    description: '100 séances complétées',
    iconName: 'crown',
    category: 'completion',
    requirement: { type: 'sessions', value: 100 },
    motivationalMessage: '100 séances ! Un engagement remarquable envers votre bien-être.',
  },

  // ============================================
  // BADGES EXPLORATION
  // ============================================
  {
    id: 'badge-zones-all',
    name: 'Explorateur',
    description: 'Toutes les zones explorées',
    iconName: 'compass',
    category: 'exploration',
    requirement: { type: 'zones', value: 6 },
    motivationalMessage: 'Vous avez exploré toutes les zones du visage. Une vraie découverte !',
  },
  {
    id: 'badge-exercises-10',
    name: 'Curieux',
    description: '10 exercices différents essayés',
    iconName: 'search',
    category: 'exploration',
    requirement: { type: 'exercises', value: 10 },
    motivationalMessage: 'Votre curiosité vous honore ! Continuez à découvrir de nouveaux exercices.',
  },
  {
    id: 'badge-exercises-20',
    name: 'Aventurier',
    description: '20 exercices différents essayés',
    iconName: 'map',
    category: 'exploration',
    requirement: { type: 'exercises', value: 20 },
    motivationalMessage: 'Un véritable aventurier du face yoga ! Vous connaissez maintenant beaucoup d\'exercices.',
  },

  // ============================================
  // BADGES PROGRAMMES
  // ============================================
  {
    id: 'badge-program-first',
    name: 'Premier Programme',
    description: 'Un programme terminé',
    iconName: 'flag',
    category: 'milestone',
    requirement: { type: 'programs', value: 1 },
    motivationalMessage: 'Félicitations ! Terminer un programme complet est un bel accomplissement.',
  },
  {
    id: 'badge-program-three',
    name: 'Assidu',
    description: '3 programmes terminés',
    iconName: 'target',
    category: 'milestone',
    requirement: { type: 'programs', value: 3 },
    motivationalMessage: 'Trois programmes terminés ! Vous êtes vraiment engagé(e) dans votre pratique.',
  },

  // ============================================
  // BADGES TEMPS
  // ============================================
  {
    id: 'badge-minutes-60',
    name: 'Première Heure',
    description: '60 minutes de pratique totale',
    iconName: 'clock',
    category: 'milestone',
    requirement: { type: 'minutes', value: 60 },
    motivationalMessage: 'Une heure de face yoga ! Chaque minute compte pour votre bien-être.',
  },
  {
    id: 'badge-minutes-300',
    name: 'Cinq Heures',
    description: '5 heures de pratique totale',
    iconName: 'hourglass',
    category: 'milestone',
    requirement: { type: 'minutes', value: 300 },
    motivationalMessage: 'Cinq heures de pratique cumulée ! Un investissement précieux en vous.',
  },
  {
    id: 'badge-minutes-600',
    name: 'Dix Heures',
    description: '10 heures de pratique totale',
    iconName: 'zap',
    category: 'milestone',
    requirement: { type: 'minutes', value: 600 },
    motivationalMessage: 'Dix heures de face yoga ! Votre dévouement est admirable.',
  },

  // ============================================
  // BADGES SPÉCIAUX
  // ============================================
  {
    id: 'badge-morning-person',
    name: 'Lève-Tôt',
    description: '5 séances avant 8h',
    iconName: 'sunrise',
    category: 'milestone',
    requirement: { type: 'sessions', value: 5, additionalCondition: 'morning' },
    motivationalMessage: 'Les matins sont à vous ! Une belle façon de commencer la journée.',
  },
  {
    id: 'badge-zen-master',
    name: 'Maître Zen',
    description: '10 séances de détente mâchoire/cou',
    iconName: 'feather',
    category: 'milestone',
    requirement: { type: 'sessions', value: 10, additionalCondition: 'relaxation' },
    motivationalMessage: 'Un vrai maître de la détente ! Vos tensions n\'ont qu\'à bien se tenir.',
  },
];

// ============================================
// MESSAGES DE MOTIVATION
// ============================================
export const motivationalMessages = {
  // Messages de démarrage de séance
  sessionStart: [
    'Prenez un moment pour vous. Vous le méritez.',
    'Quelques minutes de bien-être commencent maintenant.',
    'Votre visage vous remercie déjà !',
    'C\'est le moment de prendre soin de vous.',
    'Respirez, détendez-vous, c\'est votre moment.',
  ],

  // Messages de fin de séance
  sessionComplete: [
    'Bravo ! Vous avez pris soin de vous aujourd\'hui.',
    'Séance terminée. Comment vous sentez-vous ?',
    'Excellent ! Chaque séance compte.',
    'Vous êtes formidable. À demain !',
    'Belle séance ! Votre visage rayonne.',
  ],

  // Messages de streak (non culpabilisants)
  streakContinue: [
    'Jour {count} ! Vous êtes sur une belle lancée.',
    '{count} jours consécutifs, bravo pour votre régularité !',
    'Encore un jour de pratique. Vous pouvez être fier(e) !',
  ],

  // Messages de reprise (après une pause)
  streakRestart: [
    'Content de vous revoir ! Reprenons ensemble.',
    'Chaque jour est une nouvelle chance de commencer.',
    'Pas de culpabilité ici. Bienvenue à nouveau !',
    'Vous êtes de retour, c\'est ce qui compte.',
  ],

  // Messages de relance douce (notification)
  gentleReminder: [
    'Votre routine de 5 minutes vous attend.',
    'Un petit moment pour votre visage aujourd\'hui ?',
    'Prêt(e) pour quelques minutes de détente ?',
    'Votre bien-être facial en quelques minutes.',
  ],

  // Félicitations sobres
  achievements: [
    'Nouveau badge débloqué ! {badgeName}',
    'Félicitations pour votre progression !',
    'Un nouveau palier atteint. Continuez ainsi !',
  ],
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
export const getRandomMessage = (category: keyof typeof motivationalMessages): string => {
  const messages = motivationalMessages[category];
  return messages[Math.floor(Math.random() * messages.length)];
};

export const checkBadgeEarned = (
  badge: BadgeDefinition,
  userStats: {
    currentStreak: number;
    totalSessions: number;
    totalMinutes: number;
    completedExercises: string[];
    completedPrograms: string[];
    zonesExplored: string[];
  }
): boolean => {
  const { requirement } = badge;

  switch (requirement.type) {
    case 'streak':
      return userStats.currentStreak >= requirement.value;
    case 'sessions':
      return userStats.totalSessions >= requirement.value;
    case 'minutes':
      return userStats.totalMinutes >= requirement.value;
    case 'exercises':
      return userStats.completedExercises.length >= requirement.value;
    case 'programs':
      return userStats.completedPrograms.length >= requirement.value;
    case 'zones':
      return userStats.zonesExplored.length >= requirement.value;
    default:
      return false;
  }
};

export const getNextBadgeToEarn = (
  earnedBadgeIds: string[],
  userStats: {
    currentStreak: number;
    totalSessions: number;
    totalMinutes: number;
    completedExercises: string[];
    completedPrograms: string[];
    zonesExplored: string[];
  }
): BadgeDefinition | null => {
  const unearnedBadges = badgeDefinitions.filter(b => !earnedBadgeIds.includes(b.id));

  // Trouver le badge le plus proche d'être atteint
  let closestBadge: BadgeDefinition | null = null;
  let closestProgress = 0;

  for (const badge of unearnedBadges) {
    const progress = getBadgeProgress(badge, userStats);
    if (progress > closestProgress && progress < 1) {
      closestProgress = progress;
      closestBadge = badge;
    }
  }

  return closestBadge;
};

export const getBadgeProgress = (
  badge: BadgeDefinition,
  userStats: {
    currentStreak: number;
    totalSessions: number;
    totalMinutes: number;
    completedExercises: string[];
    completedPrograms: string[];
    zonesExplored: string[];
  }
): number => {
  const { requirement } = badge;

  let current = 0;
  switch (requirement.type) {
    case 'streak':
      current = userStats.currentStreak;
      break;
    case 'sessions':
      current = userStats.totalSessions;
      break;
    case 'minutes':
      current = userStats.totalMinutes;
      break;
    case 'exercises':
      current = userStats.completedExercises.length;
      break;
    case 'programs':
      current = userStats.completedPrograms.length;
      break;
    case 'zones':
      current = userStats.zonesExplored.length;
      break;
  }

  return Math.min(current / requirement.value, 1);
};
