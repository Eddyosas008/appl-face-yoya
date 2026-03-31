import type { Meditation, AdaptiveJourney, SubscriptionPlan } from '@/shared/wellness-types';

// ─── Ambient Sound Sources ────────────────────────────────────────────────────
export const AMBIENT_SOUNDS = [
  { id: 'rain', label: 'Pluie douce', emoji: '🌧️', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_8cb749b7a8.mp3' },
  { id: 'forest', label: 'Forêt', emoji: '🌲', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_8cb749b7a8.mp3' },
  { id: 'ocean', label: 'Océan', emoji: '🌊', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bde808.mp3' },
  { id: 'fire', label: 'Feu de cheminée', emoji: '🔥', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3' },
  { id: 'wind', label: 'Vent léger', emoji: '💨', url: 'https://cdn.pixabay.com/download/audio/2021/10/25/audio_8cb749b7a8.mp3' },
  { id: 'birds', label: 'Chants d\'oiseaux', emoji: '🐦', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3' },
];

// ─── Guided Meditation Audio URLs (free, royalty-free) ────────────────────────
// Using free ambient/meditation tracks from public CDNs
const AUDIO_URLS: Record<string, string> = {
  sleep: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_8cb749b7a8.mp3',
  anxiety: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bde808.mp3',
  stress_relief: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3',
  focus: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  confidence: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_8cb749b7a8.mp3',
  self_compassion: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bde808.mp3',
  emotional_reset: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3',
};

// ─── Meditation Library ───────────────────────────────────────────────────────

export const MEDITATIONS: Meditation[] = [
  {
    id: 'm1',
    title: 'Souffle du soir',
    category: 'sleep',
    duration: 10,
    difficulty: 'beginner',
    description: 'Une méditation douce pour relâcher les tensions de la journée et préparer votre corps au sommeil.',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
    isPremium: false,
    audioUrl: AUDIO_URLS.sleep,
    tags: ['sommeil', 'relaxation', 'soir'],
  },
  {
    id: 'm2',
    title: 'Ancrage dans le présent',
    category: 'anxiety',
    duration: 8,
    difficulty: 'beginner',
    description: 'Revenez au moment présent grâce à cette pratique de pleine conscience pour calmer l\'anxiété.',
    coverImage: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&q=80',
    isPremium: false,
    audioUrl: AUDIO_URLS.anxiety,
    tags: ['anxiété', 'pleine conscience', 'ancrage'],
  },
  {
    id: 'm3',
    title: 'Lumière intérieure',
    category: 'confidence',
    duration: 12,
    difficulty: 'intermediate',
    description: 'Reconnectez-vous à votre force intérieure et cultivez une confiance profonde et durable.',
    coverImage: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&q=80',
    isPremium: false,
    audioUrl: AUDIO_URLS.confidence,
    tags: ['confiance', 'estime de soi', 'empowerment'],
  },
  {
    id: 'm4',
    title: 'Nuit étoilée',
    category: 'sleep',
    duration: 20,
    difficulty: 'beginner',
    description: 'Un voyage guidé sous les étoiles pour un endormissement profond et réparateur.',
    coverImage: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80',
    isPremium: true,
    tags: ['sommeil', 'visualisation', 'profond'],
  },
  {
    id: 'm5',
    title: 'Reset émotionnel',
    category: 'emotional_reset',
    duration: 15,
    difficulty: 'intermediate',
    description: 'Libérez les émotions bloquées et retrouvez votre équilibre intérieur en 15 minutes.',
    coverImage: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400&q=80',
    isPremium: true,
    tags: ['émotions', 'libération', 'équilibre'],
  },
  {
    id: 'm6',
    title: 'Clarté mentale',
    category: 'focus',
    duration: 10,
    difficulty: 'beginner',
    description: 'Affûtez votre concentration et préparez votre esprit pour une journée productive.',
    coverImage: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&q=80',
    isPremium: false,
    audioUrl: AUDIO_URLS.focus,
    tags: ['focus', 'concentration', 'matin'],
  },
  {
    id: 'm7',
    title: 'Douceur envers soi',
    category: 'self_compassion',
    duration: 12,
    difficulty: 'beginner',
    description: 'Apprenez à vous traiter avec la même bienveillance que vous offrez aux autres.',
    coverImage: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=400&q=80',
    isPremium: false,
    audioUrl: AUDIO_URLS.self_compassion,
    tags: ['auto-compassion', 'bienveillance', 'amour de soi'],
  },
  {
    id: 'm8',
    title: 'Dissolution du stress',
    category: 'stress_relief',
    duration: 15,
    difficulty: 'intermediate',
    description: 'Dissolvez le stress accumulé couche par couche grâce à une relaxation progressive profonde.',
    coverImage: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400&q=80',
    isPremium: true,
    tags: ['stress', 'relaxation', 'corps'],
  },
  {
    id: 'm9',
    title: 'Éveil en douceur',
    category: 'focus',
    duration: 5,
    difficulty: 'beginner',
    description: 'Commencez votre journée avec intention et sérénité grâce à cette courte méditation matinale.',
    coverImage: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&q=80',
    isPremium: false,
    audioUrl: AUDIO_URLS.focus,
    tags: ['matin', 'intention', 'énergie'],
  },
  {
    id: 'm10',
    title: 'Océan de paix',
    category: 'anxiety',
    duration: 18,
    difficulty: 'advanced',
    description: 'Une immersion profonde dans un état de paix absolue pour les pratiquantes avancées.',
    coverImage: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=80',
    isPremium: true,
    tags: ['paix', 'profond', 'avancé'],
  },
];

// ─── Adaptive Journeys ────────────────────────────────────────────────────────

export const ADAPTIVE_JOURNEYS: AdaptiveJourney[] = [
  {
    id: 'j1',
    title: 'Calme avant le sommeil',
    subtitle: 'Préparez votre corps et votre esprit',
    description: 'Un parcours complet pour relâcher les tensions de la journée et glisser doucement vers un sommeil réparateur.',
    duration: 20,
    mood: ['tired', 'anxious', 'overwhelmed'],
    coverGradient: ['#4A1A6E', '#1A0A2E'],
    isPremium: false,
    steps: [
      { id: 's1', type: 'intro', title: 'Bienvenue', description: 'Installez-vous confortablement. Ce soir, vous méritez de vous reposer.', duration: 1, content: 'Prenez un moment pour vous installer. Fermez les yeux et sentez le poids de votre corps se relâcher...' },
      { id: 's2', type: 'breathing', title: 'Respiration 4-7-8', description: 'Activez votre système nerveux parasympathique', duration: 4, content: 'Inspirez pendant 4 secondes, retenez 7 secondes, expirez pendant 8 secondes.' },
      { id: 's3', type: 'meditation', title: 'Souffle du soir', description: 'Méditation guidée de 10 minutes', duration: 10 },
      { id: 's4', type: 'reflection', title: 'Gratitude du soir', description: 'Trois choses pour lesquelles vous êtes reconnaissante', duration: 3, content: 'Pensez à trois moments de votre journée qui vous ont apporté de la joie, même les plus petits...' },
      { id: 's5', type: 'feedback', title: 'Comment vous sentez-vous ?', description: 'Partagez votre ressenti', duration: 2 },
    ],
  },
  {
    id: 'j2',
    title: 'Reset après une journée difficile',
    subtitle: 'Libérez la pression accumulée',
    description: 'Quand la journée a été trop lourde, ce parcours vous aide à déposer le poids et retrouver votre centre.',
    duration: 18,
    mood: ['overwhelmed', 'anxious', 'sad'],
    coverGradient: ['#C084FC', '#7C3AED'],
    isPremium: false,
    steps: [
      { id: 's1', type: 'intro', title: 'Vous avez survécu', description: 'La journée est terminée. Vous êtes en sécurité maintenant.', duration: 1, content: 'Quelle que soit la difficulté de votre journée, vous êtes là. Vous avez tenu. C\'est suffisant.' },
      { id: 's2', type: 'breathing', title: 'Respiration libératrice', description: 'Expirez tout ce qui ne vous appartient plus', duration: 3 },
      { id: 's3', type: 'meditation', title: 'Reset émotionnel', description: 'Libération des tensions émotionnelles', duration: 10 },
      { id: 's4', type: 'reflection', title: 'Ce que vous avez appris', description: 'Transformez l\'expérience en sagesse', duration: 2 },
      { id: 's5', type: 'feedback', title: 'Votre ressenti', description: 'Comment vous sentez-vous maintenant ?', duration: 2 },
    ],
  },
  {
    id: 'j3',
    title: 'Arrêter la rumination',
    subtitle: 'Sortir du cycle des pensées',
    description: 'Pour quand votre esprit tourne en boucle et refuse de s\'arrêter. Un parcours pour reprendre le contrôle.',
    duration: 15,
    mood: ['anxious', 'overwhelmed', 'neutral'],
    coverGradient: ['#F9A8D4', '#C084FC'],
    isPremium: true,
    steps: [
      { id: 's1', type: 'intro', title: 'Vos pensées ne sont pas vous', description: 'Vous pouvez observer sans être emportée', duration: 1 },
      { id: 's2', type: 'breathing', title: 'Ancrage corporel', description: 'Revenez dans votre corps', duration: 3 },
      { id: 's3', type: 'meditation', title: 'Ancrage dans le présent', description: 'Pleine conscience des pensées', duration: 8 },
      { id: 's4', type: 'reflection', title: 'Ce qui est réel maintenant', description: 'Distinguer pensées et réalité', duration: 2 },
      { id: 's5', type: 'feedback', title: 'Votre ressenti', description: 'Partagez votre expérience', duration: 1 },
    ],
  },
  {
    id: 'j4',
    title: 'Confiance avant un moment important',
    subtitle: 'Activez votre puissance intérieure',
    description: 'Avant une présentation, un entretien, ou tout moment qui compte. Réveillez votre confiance profonde.',
    duration: 12,
    mood: ['anxious', 'neutral', 'calm'],
    coverGradient: ['#FCD34D', '#F59E0B'],
    isPremium: true,
    steps: [
      { id: 's1', type: 'intro', title: 'Vous êtes prête', description: 'Tout ce dont vous avez besoin est déjà en vous', duration: 1 },
      { id: 's2', type: 'breathing', title: 'Respiration de puissance', description: 'Activez votre énergie', duration: 2 },
      { id: 's3', type: 'meditation', title: 'Lumière intérieure', description: 'Visualisation de confiance', duration: 7 },
      { id: 's4', type: 'reflection', title: 'Votre intention', description: 'Définissez comment vous voulez vous sentir', duration: 1 },
      { id: 's5', type: 'feedback', title: 'Prête ?', description: 'Vous avez tout ce qu\'il faut', duration: 1 },
    ],
  },
  {
    id: 'j5',
    title: 'Équilibre en 5 minutes',
    subtitle: 'Un micro-reset pour les journées chargées',
    description: 'Quand vous n\'avez que 5 minutes mais que vous en avez besoin. Un parcours ultra-efficace.',
    duration: 5,
    mood: ['overwhelmed', 'anxious', 'tired'],
    coverGradient: ['#86EFAC', '#22C55E'],
    isPremium: false,
    steps: [
      { id: 's1', type: 'breathing', title: 'Respiration carrée', description: '4-4-4-4', duration: 2 },
      { id: 's2', type: 'meditation', title: 'Pause consciente', description: 'Scan corporel rapide', duration: 2 },
      { id: 's3', type: 'feedback', title: 'Ressenti', description: 'Une phrase pour décrire votre état', duration: 1 },
    ],
  },
];

// ─── Subscription Plans ───────────────────────────────────────────────────────

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    features: [
      '5 méditations guidées',
      '2 parcours adaptatifs',
      'Check-in émotionnel quotidien',
      'Journal (30 jours)',
      'Suivi de progression basique',
    ],
  },
  {
    id: 'monthly',
    name: 'Premium Mensuel',
    price: 9.99,
    period: 'mois',
    isPopular: false,
    features: [
      'Bibliothèque complète (50+ méditations)',
      'Parcours adaptatifs illimités',
      'Insights émotionnels avancés',
      'Contenu sommeil premium',
      'Journal illimité',
      'Chat IA de soutien',
      'Sans publicité',
    ],
  },
  {
    id: 'yearly',
    name: 'Premium Annuel',
    price: 59.99,
    period: 'an',
    isPopular: true,
    features: [
      'Tout le plan mensuel inclus',
      'Économisez 50% vs mensuel',
      'Accès anticipé aux nouveautés',
      'Support prioritaire',
      'Export de données',
    ],
  },
];

// ─── Category Labels ──────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  stress_relief: 'Gestion du stress',
  sleep: 'Sommeil',
  anxiety: 'Apaisement anxiété',
  emotional_reset: 'Reset émotionnel',
  confidence: 'Confiance en soi',
  focus: 'Concentration',
  self_compassion: 'Auto-compassion',
};

export const MOOD_LABELS: Record<string, string> = {
  calm: 'Calme',
  anxious: 'Anxieuse',
  sad: 'Triste',
  happy: 'Heureuse',
  tired: 'Fatiguée',
  overwhelmed: 'Submergée',
  grateful: 'Reconnaissante',
  neutral: 'Neutre',
};

export const MOOD_EMOJIS: Record<string, string> = {
  calm: '😌',
  anxious: '😰',
  sad: '😢',
  happy: '😊',
  tired: '😴',
  overwhelmed: '😤',
  grateful: '🙏',
  neutral: '😐',
};
