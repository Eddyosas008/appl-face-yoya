// ============================================
// MODÈLE DE DONNÉES - FACE YOGA APP
// ============================================

// Types de zones du visage
export type FaceZone =
  | 'front'      // Front
  | 'yeux'       // Contour des yeux
  | 'joues'      // Joues
  | 'bouche'     // Bouche et lèvres
  | 'ovale'      // Ovale du visage
  | 'cou'        // Cou et mâchoire
  | 'global';    // Exercice complet

// Niveaux de difficulté
export type DifficultyLevel = 'debutant' | 'intermediaire' | 'avance';

// Statuts de progression
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

// Contre-indications
export type Contraindication =
  | 'atm'                    // Troubles de l'ATM
  | 'douleurs_cervicales'    // Douleurs cervicales
  | 'post_chirurgie'         // Post-chirurgie faciale
  | 'injections_recentes'    // Injections récentes (< 2 semaines)
  | 'paralysie_faciale'      // Paralysie faciale
  | 'hypertension'           // Hypertension non contrôlée
  | 'glaucome'               // Glaucome
  | 'problemes_dentaires';   // Problèmes dentaires aigus

// ============================================
// EXERCICE
// ============================================
export interface Exercise {
  id: string;
  name: string;
  slug: string;
  zone: FaceZone;
  duration: number;              // En secondes
  repetitions?: number;          // Nombre de répétitions (si applicable)
  difficulty: DifficultyLevel;
  description: string;           // Description courte
  benefits: string[];            // Bénéfices de l'exercice
  steps: ExerciseStep[];         // Étapes détaillées
  commonErrors: string[];        // Erreurs fréquentes
  corrections: string[];         // Corrections
  contraindications: Contraindication[];
  tips: string[];               // Conseils pratiques
  imageUrl?: string;
  videoUrl?: string;
  isWarmup?: boolean;           // Exercice d'échauffement
  isCooldown?: boolean;         // Exercice de retour au calme
}

export interface ExerciseStep {
  order: number;
  instruction: string;
  duration?: number;            // Durée de cette étape en secondes
  breathingCue?: 'inhale' | 'exhale' | 'hold'; // Indication de respiration
  imageUrl?: string;
}

// ============================================
// PROGRAMME
// ============================================
export interface Program {
  id: string;
  name: string;
  slug: string;
  description: string;
  objective: string;
  targetAudience: string;
  duration: number;              // Durée totale en jours
  dailyDuration: number;         // Durée quotidienne en minutes
  difficulty: DifficultyLevel;
  zones: FaceZone[];            // Zones ciblées
  days: ProgramDay[];
  benefits: string[];
  prerequisites?: string[];
  imageUrl?: string;
  isRecommended?: boolean;
  isPremium?: boolean;
}

export interface ProgramDay {
  day: number;
  title: string;
  description?: string;
  sessions: ProgramSession[];
  restDay?: boolean;
}

export interface ProgramSession {
  id: string;
  title: string;
  exercises: SessionExercise[];
  totalDuration: number;         // En minutes
  warmupIncluded: boolean;
  cooldownIncluded: boolean;
}

export interface SessionExercise {
  exerciseId: string;
  order: number;
  customDuration?: number;       // Durée personnalisée
  customRepetitions?: number;    // Répétitions personnalisées
}

// ============================================
// UTILISATEUR
// ============================================
export interface User {
  id: string;
  createdAt: string;
  profile: UserProfile;
  preferences: UserPreferences;
  healthInfo: UserHealthInfo;
  progress: UserProgress;
  settings: UserSettings;
}

export interface UserProfile {
  firstName?: string;
  age?: number;
  avatarUrl?: string;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string;
}

export interface UserPreferences {
  primaryGoals: UserGoal[];
  focusZones: FaceZone[];
  preferredDuration: 5 | 10 | 15 | 20;  // Minutes
  preferredTime: 'matin' | 'midi' | 'soir' | 'flexible';
  reminderEnabled: boolean;
  reminderTime?: string;         // Format HH:mm
  experienceLevel: 'nouveau' | 'quelques_essais' | 'regulier';
}

export type UserGoal =
  | 'reduire_tensions'           // Réduire les tensions (mâchoire, front)
  | 'definir_contours'           // Définir les contours
  | 'eclat_peau'                 // Améliorer l'éclat
  | 'detente_globale'            // Détente globale
  | 'anti_age_doux'              // Anti-âge doux
  | 'routine_quotidienne';       // Créer une routine

export interface UserHealthInfo {
  contraindications: Contraindication[];
  recentProcedures: boolean;
  procedureDetails?: string;
  notes?: string;
}

export interface UserProgress {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  totalMinutes: number;
  badges: Badge[];
  completedExercises: string[];  // IDs des exercices complétés au moins une fois
  completedPrograms: string[];   // IDs des programmes terminés
  currentProgramId?: string;
  currentProgramProgress?: ProgramProgress;
  weeklyGoal: number;            // Sessions par semaine
  weeklyProgress: number;        // Sessions cette semaine
}

export interface ProgramProgress {
  programId: string;
  startedAt: string;
  currentDay: number;
  completedDays: number[];
  lastSessionAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  earnedAt: string;
  category: 'streak' | 'completion' | 'exploration' | 'milestone';
}

export interface UserSettings {
  language: 'fr' | 'en';
  theme: 'dark' | 'light' | 'auto';
  soundEnabled: boolean;
  hapticEnabled: boolean;
  showAnimations: boolean;
  dataCollection: boolean;
}

// ============================================
// HISTORIQUE & SESSIONS
// ============================================
export interface SessionHistory {
  id: string;
  date: string;                  // ISO date
  programId?: string;
  programDay?: number;
  exercises: CompletedExercise[];
  totalDuration: number;         // Minutes
  mood?: MoodRating;
  faceFeel?: FaceFeelRating;
  notes?: string;
}

export interface CompletedExercise {
  exerciseId: string;
  completedAt: string;
  duration: number;              // Durée réelle en secondes
  skipped: boolean;
}

export type MoodRating = 1 | 2 | 3 | 4 | 5;

export type FaceFeelRating =
  | 'tendu'
  | 'normal'
  | 'detendu'
  | 'revitalise';

// ============================================
// JOURNAL QUOTIDIEN
// ============================================
export interface DailyEntry {
  date: string;                  // Format YYYY-MM-DD
  sessionCompleted: boolean;
  sessionId?: string;
  morningFeel?: FaceFeelRating;
  eveningFeel?: FaceFeelRating;
  tensionAreas?: FaceZone[];
  waterIntake?: number;          // Verres d'eau
  sleepQuality?: 1 | 2 | 3 | 4 | 5;
  stressLevel?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  photos?: DailyPhoto[];
}

export interface DailyPhoto {
  id: string;
  uri: string;
  takenAt: string;
  type: 'before' | 'after' | 'progress';
}

// ============================================
// NOTIFICATIONS
// ============================================
export interface NotificationConfig {
  id: string;
  type: 'reminder' | 'motivation' | 'streak' | 'milestone';
  title: string;
  body: string;
  scheduledTime?: string;
  enabled: boolean;
}

// ============================================
// ONBOARDING
// ============================================
export interface OnboardingStep {
  id: string;
  order: number;
  type: 'welcome' | 'goals' | 'zones' | 'health' | 'schedule' | 'summary';
  title: string;
  subtitle?: string;
  required: boolean;
}

export interface OnboardingAnswer {
  stepId: string;
  answer: unknown;
  answeredAt: string;
}

// ============================================
// NAVIGATION TYPES
// ============================================
export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  ExerciseDetail: { exerciseId: string };
  ProgramDetail: { programId: string };
  SessionPlayer: {
    programId?: string;
    day?: number;
    exerciseIds?: string[];
  };
  Settings: undefined;
  Safety: undefined;
  EditProfile: undefined;
};

export type MainTabParamList = {
  Today: undefined;
  Programs: undefined;
  Library: undefined;
  Journal: undefined;
  Profile: undefined;
};
