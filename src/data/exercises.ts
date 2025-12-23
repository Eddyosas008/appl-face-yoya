import { Exercise } from '../types';

// ============================================
// EXERCICES DE FACE YOGA - 30 EXERCICES
// ============================================
// Classés par zones : Front, Yeux, Joues, Bouche, Ovale, Cou/Mâchoire

export const exercises: Exercise[] = [
  // ============================================
  // ZONE: FRONT (5 exercices)
  // ============================================
  {
    id: 'ex-front-001',
    name: 'Lissage du Front',
    slug: 'lissage-front',
    zone: 'front',
    duration: 60,
    repetitions: 10,
    difficulty: 'debutant',
    description: 'Exercice doux pour détendre les muscles du front et réduire les tensions accumulées.',
    benefits: [
      'Détente des muscles frontaux',
      'Réduction des tensions liées au stress',
      'Amélioration de la circulation locale',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Placez vos deux mains à plat sur votre front, doigts vers le haut.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Appuyez légèrement et faites glisser vos mains vers les tempes.',
        duration: 5,
        breathingCue: 'exhale',
      },
      {
        order: 3,
        instruction: 'Répétez ce mouvement lent et régulier 10 fois.',
        duration: 50,
        breathingCue: 'inhale',
      },
    ],
    commonErrors: [
      'Appuyer trop fort sur le front',
      'Mouvements trop rapides',
      'Froncer les sourcils pendant l\'exercice',
    ],
    corrections: [
      'Utilisez une pression douce et constante',
      'Ralentissez et synchronisez avec votre respiration',
      'Gardez le visage détendu, sourcils relâchés',
    ],
    contraindications: [],
    tips: [
      'Idéal le matin pour commencer la journée détendu(e)',
      'Peut être fait avec une huile légère pour plus de confort',
    ],
    isWarmup: true,
  },
  {
    id: 'ex-front-002',
    name: 'Élévation des Sourcils',
    slug: 'elevation-sourcils',
    zone: 'front',
    duration: 45,
    repetitions: 8,
    difficulty: 'debutant',
    description: 'Tonifie les muscles au-dessus des sourcils et aide à ouvrir le regard.',
    benefits: [
      'Tonification du muscle frontal',
      'Ouverture du regard',
      'Prise de conscience musculaire',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Placez vos index au-dessus de vos sourcils, parallèles à ceux-ci.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Essayez de lever les sourcils tout en créant une légère résistance avec vos doigts.',
        duration: 5,
        breathingCue: 'inhale',
      },
      {
        order: 3,
        instruction: 'Maintenez 3 secondes, puis relâchez.',
        duration: 3,
        breathingCue: 'exhale',
      },
      {
        order: 4,
        instruction: 'Répétez 8 fois avec un mouvement fluide.',
        duration: 32,
      },
    ],
    commonErrors: [
      'Plisser les yeux pendant l\'exercice',
      'Créer trop de résistance',
      'Retenir sa respiration',
    ],
    corrections: [
      'Gardez les yeux détendus et ouverts',
      'La résistance doit être légère',
      'Respirez naturellement tout au long de l\'exercice',
    ],
    contraindications: [],
    tips: [
      'Commencez sans résistance pour apprendre le mouvement',
    ],
  },
  {
    id: 'ex-front-003',
    name: 'Massage des Tempes',
    slug: 'massage-tempes',
    zone: 'front',
    duration: 90,
    difficulty: 'debutant',
    description: 'Massage circulaire des tempes pour libérer les tensions et favoriser la détente.',
    benefits: [
      'Soulagement des maux de tête légers',
      'Détente profonde',
      'Amélioration de la circulation',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Placez vos doigts sur vos tempes, de chaque côté de la tête.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Effectuez de petits cercles lents dans le sens des aiguilles d\'une montre.',
        duration: 40,
        breathingCue: 'exhale',
      },
      {
        order: 3,
        instruction: 'Inversez le sens des cercles.',
        duration: 40,
        breathingCue: 'inhale',
      },
      {
        order: 4,
        instruction: 'Terminez par une pression douce et maintenez 5 secondes.',
        duration: 5,
        breathingCue: 'exhale',
      },
    ],
    commonErrors: [
      'Mouvements trop brusques',
      'Pression trop forte',
    ],
    corrections: [
      'Gardez des mouvements lents et réguliers',
      'Adaptez la pression à votre confort',
    ],
    contraindications: ['hypertension'],
    tips: [
      'Parfait pour une pause détente en journée',
      'Peut être combiné avec une respiration profonde',
    ],
    isCooldown: true,
  },
  {
    id: 'ex-front-004',
    name: 'Pincement du Front',
    slug: 'pincement-front',
    zone: 'front',
    duration: 60,
    difficulty: 'intermediaire',
    description: 'Technique de pincement léger pour stimuler la circulation du front.',
    benefits: [
      'Stimulation de la microcirculation',
      'Effet revitalisant',
      'Détente musculaire',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Avec le pouce et l\'index, pincez délicatement la peau du front au centre.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Déplacez-vous progressivement vers les tempes en petits pincements.',
        duration: 25,
        breathingCue: 'exhale',
      },
      {
        order: 3,
        instruction: 'Revenez au centre et répétez 3 fois.',
        duration: 30,
      },
    ],
    commonErrors: [
      'Pincer trop fort',
      'Tirer sur la peau',
    ],
    corrections: [
      'Le pincement doit être léger et indolore',
      'Soulevez légèrement sans étirer',
    ],
    contraindications: ['injections_recentes'],
    tips: [
      'Idéal pour réveiller le visage le matin',
    ],
  },
  {
    id: 'ex-front-005',
    name: 'Détente Inter-sourcilière',
    slug: 'detente-inter-sourciliere',
    zone: 'front',
    duration: 45,
    repetitions: 6,
    difficulty: 'debutant',
    description: 'Cible la zone entre les sourcils, souvent contractée par le stress.',
    benefits: [
      'Réduction des tensions de la glabelle',
      'Détente du regard',
      'Effet apaisant',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Placez votre index et majeur entre vos sourcils.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Effectuez de petits mouvements circulaires doux.',
        duration: 20,
        breathingCue: 'exhale',
      },
      {
        order: 3,
        instruction: 'Lissez vers le haut jusqu\'à la racine des cheveux.',
        duration: 20,
        breathingCue: 'inhale',
      },
    ],
    commonErrors: [
      'Froncer les sourcils pendant l\'exercice',
    ],
    corrections: [
      'Consciemment, relâchez cette zone pendant le massage',
    ],
    contraindications: [],
    tips: [
      'Excellent après une longue session d\'écran',
    ],
  },

  // ============================================
  // ZONE: YEUX (5 exercices)
  // ============================================
  {
    id: 'ex-yeux-001',
    name: 'Cercles Oculaires',
    slug: 'cercles-oculaires',
    zone: 'yeux',
    duration: 60,
    repetitions: 5,
    difficulty: 'debutant',
    description: 'Mouvements circulaires des yeux pour détendre les muscles oculaires.',
    benefits: [
      'Détente des muscles oculaires',
      'Réduction de la fatigue visuelle',
      'Amélioration de la mobilité oculaire',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Asseyez-vous confortablement, tête droite et immobile.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Regardez vers le haut, puis faites un cercle complet avec les yeux dans le sens horaire.',
        duration: 25,
        breathingCue: 'inhale',
      },
      {
        order: 3,
        instruction: 'Répétez 5 fois, puis changez de sens.',
        duration: 25,
        breathingCue: 'exhale',
      },
      {
        order: 4,
        instruction: 'Fermez les yeux et détendez-vous quelques secondes.',
        duration: 5,
      },
    ],
    commonErrors: [
      'Bouger la tête en même temps que les yeux',
      'Mouvements trop rapides',
    ],
    corrections: [
      'Gardez la tête parfaitement immobile',
      'Effectuez des cercles lents et complets',
    ],
    contraindications: ['glaucome'],
    tips: [
      'Idéal toutes les 2 heures lors du travail sur écran',
    ],
    isWarmup: true,
  },
  {
    id: 'ex-yeux-002',
    name: 'Pression Paupières',
    slug: 'pression-paupieres',
    zone: 'yeux',
    duration: 30,
    repetitions: 3,
    difficulty: 'debutant',
    description: 'Légère pression sur les paupières fermées pour détendre le contour des yeux.',
    benefits: [
      'Détente profonde du contour des yeux',
      'Réduction des tensions',
      'Moment de calme',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Fermez doucement les yeux.',
        duration: 3,
      },
      {
        order: 2,
        instruction: 'Placez délicatement la paume de vos mains sur vos yeux fermés.',
        duration: 5,
      },
      {
        order: 3,
        instruction: 'Appliquez une très légère pression et maintenez.',
        duration: 15,
        breathingCue: 'exhale',
      },
      {
        order: 4,
        instruction: 'Relâchez lentement et ouvrez les yeux.',
        duration: 7,
      },
    ],
    commonErrors: [
      'Appuyer sur le globe oculaire',
      'Créer trop de pression',
    ],
    corrections: [
      'La pression doit être sur les os autour de l\'œil, pas sur l\'œil',
      'Gardez une pression très légère et agréable',
    ],
    contraindications: ['glaucome', 'post_chirurgie'],
    tips: [
      'Technique parfaite pour un moment de pause rapide',
    ],
    isCooldown: true,
  },
  {
    id: 'ex-yeux-003',
    name: 'Lift des Paupières',
    slug: 'lift-paupieres',
    zone: 'yeux',
    duration: 45,
    repetitions: 10,
    difficulty: 'intermediaire',
    description: 'Renforce les muscles des paupières supérieures pour un regard plus ouvert.',
    benefits: [
      'Tonification des paupières',
      'Ouverture du regard',
      'Conscience musculaire accrue',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Placez vos index sous les sourcils, dans le creux de l\'os.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Soulevez légèrement vers le haut tout en essayant de fermer les yeux.',
        duration: 5,
        breathingCue: 'inhale',
      },
      {
        order: 3,
        instruction: 'Maintenez la résistance 3 secondes.',
        duration: 3,
        breathingCue: 'hold',
      },
      {
        order: 4,
        instruction: 'Relâchez et répétez 10 fois.',
        duration: 32,
      },
    ],
    commonErrors: [
      'Soulever trop haut',
      'Plisser le front',
    ],
    corrections: [
      'Le mouvement doit être subtil',
      'Gardez le front détendu',
    ],
    contraindications: ['post_chirurgie', 'injections_recentes'],
    tips: [
      'Commencez avec peu de résistance',
    ],
  },
  {
    id: 'ex-yeux-004',
    name: 'Drainage Contour des Yeux',
    slug: 'drainage-contour-yeux',
    zone: 'yeux',
    duration: 90,
    difficulty: 'debutant',
    description: 'Mouvements de drainage lymphatique doux autour des yeux.',
    benefits: [
      'Réduction des poches',
      'Stimulation de la circulation lymphatique',
      'Effet décongestionnant',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Placez vos annulaires au coin interne de vos yeux.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Glissez délicatement sous l\'œil vers l\'extérieur.',
        duration: 20,
        breathingCue: 'exhale',
      },
      {
        order: 3,
        instruction: 'Remontez au-dessus de l\'œil vers le coin interne.',
        duration: 20,
        breathingCue: 'inhale',
      },
      {
        order: 4,
        instruction: 'Répétez ce circuit 5 fois de chaque côté.',
        duration: 45,
      },
    ],
    commonErrors: [
      'Appuyer trop fort',
      'Tirer sur la peau délicate',
    ],
    corrections: [
      'Utilisez une pression minimale',
      'Le doigt doit glisser sans étirer la peau',
    ],
    contraindications: ['post_chirurgie'],
    tips: [
      'Idéal le matin avec une crème contour des yeux',
      'Peut être fait avec des mains fraîches pour un effet décongestionnant',
    ],
  },
  {
    id: 'ex-yeux-005',
    name: 'Yoga des Yeux - Focus',
    slug: 'yoga-yeux-focus',
    zone: 'yeux',
    duration: 60,
    difficulty: 'debutant',
    description: 'Exercice de focus pour détendre et renforcer les muscles oculaires.',
    benefits: [
      'Amélioration de la capacité de focus',
      'Réduction de la fatigue oculaire',
      'Détente des muscles ciliaires',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Tendez votre bras devant vous, pouce levé.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Fixez votre pouce pendant 5 secondes.',
        duration: 5,
        breathingCue: 'inhale',
      },
      {
        order: 3,
        instruction: 'Regardez un objet au loin pendant 5 secondes.',
        duration: 5,
        breathingCue: 'exhale',
      },
      {
        order: 4,
        instruction: 'Alternez entre proche et loin 10 fois.',
        duration: 45,
      },
    ],
    commonErrors: [
      'Mouvements trop rapides',
      'Ne pas vraiment focaliser',
    ],
    corrections: [
      'Prenez le temps de vraiment focaliser sur chaque point',
      'Changez de focus lentement',
    ],
    contraindications: ['glaucome'],
    tips: [
      'Excellent exercice pour les travailleurs sur écran',
    ],
  },

  // ============================================
  // ZONE: JOUES (5 exercices)
  // ============================================
  {
    id: 'ex-joues-001',
    name: 'Gonflement des Joues',
    slug: 'gonflement-joues',
    zone: 'joues',
    duration: 45,
    repetitions: 8,
    difficulty: 'debutant',
    description: 'Gonflez les joues pour tonifier et stimuler la circulation.',
    benefits: [
      'Tonification des joues',
      'Stimulation de la circulation',
      'Renforcement musculaire',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Inspirez profondément par le nez.',
        duration: 3,
        breathingCue: 'inhale',
      },
      {
        order: 2,
        instruction: 'Gonflez vos deux joues avec l\'air, bouche fermée.',
        duration: 3,
      },
      {
        order: 3,
        instruction: 'Maintenez 5 secondes.',
        duration: 5,
        breathingCue: 'hold',
      },
      {
        order: 4,
        instruction: 'Relâchez doucement l\'air par la bouche.',
        duration: 3,
        breathingCue: 'exhale',
      },
      {
        order: 5,
        instruction: 'Répétez 8 fois.',
        duration: 31,
      },
    ],
    commonErrors: [
      'Gonfler trop fort créant une tension',
      'Relâcher l\'air trop vite',
    ],
    corrections: [
      'Gonflez modérément, sans inconfort',
      'Expirez lentement et contrôlé',
    ],
    contraindications: ['problemes_dentaires'],
    tips: [
      'Peut être fait discrètement n\'importe où',
    ],
  },
  {
    id: 'ex-joues-002',
    name: 'Transfert d\'Air',
    slug: 'transfert-air',
    zone: 'joues',
    duration: 60,
    repetitions: 10,
    difficulty: 'debutant',
    description: 'Déplacez l\'air d\'une joue à l\'autre pour travailler les muscles.',
    benefits: [
      'Travail bilatéral des joues',
      'Amélioration de la mobilité faciale',
      'Tonification symétrique',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Gonflez votre joue droite avec de l\'air.',
        duration: 3,
      },
      {
        order: 2,
        instruction: 'Transférez l\'air vers la joue gauche.',
        duration: 3,
      },
      {
        order: 3,
        instruction: 'Continuez d\'alterner pendant 10 répétitions de chaque côté.',
        duration: 54,
      },
    ],
    commonErrors: [
      'Mouvements trop rapides',
      'Perdre de l\'air',
    ],
    corrections: [
      'Gardez un rythme lent et contrôlé',
      'Gardez les lèvres bien fermées',
    ],
    contraindications: ['atm', 'problemes_dentaires'],
    tips: [
      'Amusant et efficace !',
    ],
  },
  {
    id: 'ex-joues-003',
    name: 'Sourire Résisté',
    slug: 'sourire-resiste',
    zone: 'joues',
    duration: 45,
    repetitions: 10,
    difficulty: 'intermediaire',
    description: 'Souriez contre une résistance pour tonifier les muscles des joues.',
    benefits: [
      'Renforcement des muscles zygomatiques',
      'Définition des pommettes',
      'Tonification générale',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Placez vos index sur les coins de votre bouche.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Souriez largement tout en créant une légère résistance avec vos doigts.',
        duration: 5,
        breathingCue: 'inhale',
      },
      {
        order: 3,
        instruction: 'Maintenez le sourire 3 secondes.',
        duration: 3,
        breathingCue: 'hold',
      },
      {
        order: 4,
        instruction: 'Relâchez et répétez 10 fois.',
        duration: 32,
        breathingCue: 'exhale',
      },
    ],
    commonErrors: [
      'Résistance trop forte',
      'Sourire non symétrique',
    ],
    corrections: [
      'La résistance doit être légère',
      'Essayez de sourire de manière équilibrée',
    ],
    contraindications: ['paralysie_faciale'],
    tips: [
      'Regardez-vous dans un miroir pour vérifier la symétrie',
    ],
  },
  {
    id: 'ex-joues-004',
    name: 'Massage Pommettes',
    slug: 'massage-pommettes',
    zone: 'joues',
    duration: 60,
    difficulty: 'debutant',
    description: 'Massage circulaire des pommettes pour stimuler et détendre.',
    benefits: [
      'Stimulation de la circulation',
      'Détente musculaire',
      'Effet bonne mine',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Placez vos doigts sur vos pommettes.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Effectuez de petits cercles vers l\'extérieur et le haut.',
        duration: 25,
        breathingCue: 'exhale',
      },
      {
        order: 3,
        instruction: 'Continuez jusqu\'aux tempes.',
        duration: 25,
        breathingCue: 'inhale',
      },
      {
        order: 4,
        instruction: 'Terminez par une légère pression sur les tempes.',
        duration: 5,
      },
    ],
    commonErrors: [
      'Appuyer trop fort',
      'Négliger la direction des mouvements',
    ],
    corrections: [
      'Gardez une pression douce mais ferme',
      'Toujours aller vers le haut et l\'extérieur',
    ],
    contraindications: ['injections_recentes'],
    tips: [
      'Peut être fait avec une huile ou un sérum',
    ],
  },
  {
    id: 'ex-joues-005',
    name: 'Aspiration des Joues',
    slug: 'aspiration-joues',
    zone: 'joues',
    duration: 45,
    repetitions: 8,
    difficulty: 'debutant',
    description: 'Creusez les joues pour travailler les muscles en profondeur.',
    benefits: [
      'Travail musculaire en profondeur',
      'Définition des contours',
      'Conscience musculaire',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Aspirez vos joues vers l\'intérieur, comme si vous faisiez "une tête de poisson".',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Maintenez cette position 5 secondes.',
        duration: 5,
        breathingCue: 'hold',
      },
      {
        order: 3,
        instruction: 'Relâchez et détendez.',
        duration: 3,
        breathingCue: 'exhale',
      },
      {
        order: 4,
        instruction: 'Répétez 8 fois.',
        duration: 32,
      },
    ],
    commonErrors: [
      'Contracter trop fort',
      'Bloquer la respiration',
    ],
    corrections: [
      'L\'aspiration doit être modérée',
      'Respirez par le nez pendant l\'exercice',
    ],
    contraindications: ['atm'],
    tips: [
      'Un exercice classique et efficace',
    ],
  },

  // ============================================
  // ZONE: BOUCHE (5 exercices)
  // ============================================
  {
    id: 'ex-bouche-001',
    name: 'Le Grand O',
    slug: 'grand-o',
    zone: 'bouche',
    duration: 45,
    repetitions: 10,
    difficulty: 'debutant',
    description: 'Formez un grand O avec la bouche pour étirer et tonifier.',
    benefits: [
      'Étirement des muscles péri-buccaux',
      'Tonification de l\'ovale',
      'Réduction des tensions de la mâchoire',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Ouvrez grand la bouche en formant un O parfait.',
        duration: 3,
        breathingCue: 'inhale',
      },
      {
        order: 2,
        instruction: 'Maintenez 3 secondes en gardant les lèvres détendues.',
        duration: 3,
        breathingCue: 'hold',
      },
      {
        order: 3,
        instruction: 'Refermez doucement.',
        duration: 2,
        breathingCue: 'exhale',
      },
      {
        order: 4,
        instruction: 'Répétez 10 fois.',
        duration: 37,
      },
    ],
    commonErrors: [
      'Forcer l\'ouverture au-delà du confort',
      'Contracter le reste du visage',
    ],
    corrections: [
      'Ouvrez à votre amplitude confortable',
      'Gardez le front et les yeux détendus',
    ],
    contraindications: ['atm'],
    tips: [
      'Excellent pour commencer une routine bouche/mâchoire',
    ],
    isWarmup: true,
  },
  {
    id: 'ex-bouche-002',
    name: 'Bec de Canard',
    slug: 'bec-canard',
    zone: 'bouche',
    duration: 45,
    repetitions: 10,
    difficulty: 'debutant',
    description: 'Projetez les lèvres en avant pour tonifier le contour de la bouche.',
    benefits: [
      'Tonification du muscle orbiculaire',
      'Définition du contour des lèvres',
      'Réduction des ridules péri-buccales',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Projetez vos lèvres vers l\'avant, comme pour faire un bisou exagéré.',
        duration: 3,
      },
      {
        order: 2,
        instruction: 'Maintenez 3 secondes.',
        duration: 3,
        breathingCue: 'hold',
      },
      {
        order: 3,
        instruction: 'Relâchez et souriez légèrement.',
        duration: 2,
      },
      {
        order: 4,
        instruction: 'Répétez 10 fois.',
        duration: 37,
      },
    ],
    commonErrors: [
      'Contracter les joues',
      'Ne pas aller assez loin',
    ],
    corrections: [
      'Isolez le mouvement aux lèvres uniquement',
      'Exagérez légèrement le mouvement',
    ],
    contraindications: ['injections_recentes'],
    tips: [
      'Un classique du face yoga !',
    ],
  },
  {
    id: 'ex-bouche-003',
    name: 'Étirement Lèvre Supérieure',
    slug: 'etirement-levre-superieure',
    zone: 'bouche',
    duration: 60,
    repetitions: 8,
    difficulty: 'intermediaire',
    description: 'Étire et tonifie la zone au-dessus de la lèvre supérieure.',
    benefits: [
      'Prévention des ridules verticales',
      'Tonification du philtrum',
      'Amélioration de la définition des lèvres',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Placez vos index de chaque côté du nez, sur le sillon nasogénien.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Essayez de relever votre lèvre supérieure vers le nez.',
        duration: 5,
        breathingCue: 'inhale',
      },
      {
        order: 3,
        instruction: 'Créez une légère résistance avec vos doigts.',
        duration: 5,
        breathingCue: 'hold',
      },
      {
        order: 4,
        instruction: 'Maintenez 5 secondes puis relâchez.',
        duration: 5,
        breathingCue: 'exhale',
      },
      {
        order: 5,
        instruction: 'Répétez 8 fois.',
        duration: 40,
      },
    ],
    commonErrors: [
      'Froncer le nez excessivement',
      'Oublier la résistance',
    ],
    corrections: [
      'Le mouvement doit être subtil',
      'La résistance aide à travailler le muscle',
    ],
    contraindications: ['injections_recentes', 'post_chirurgie'],
    tips: [
      'Commencez sans résistance pour comprendre le mouvement',
    ],
  },
  {
    id: 'ex-bouche-004',
    name: 'Sourire Large',
    slug: 'sourire-large',
    zone: 'bouche',
    duration: 45,
    repetitions: 10,
    difficulty: 'debutant',
    description: 'Un large sourire tenu pour tonifier les commissures.',
    benefits: [
      'Tonification des muscles du sourire',
      'Élévation des commissures',
      'Effet bonne humeur !',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Souriez le plus largement possible, dents visibles.',
        duration: 3,
        breathingCue: 'inhale',
      },
      {
        order: 2,
        instruction: 'Maintenez ce sourire 3 secondes.',
        duration: 3,
        breathingCue: 'hold',
      },
      {
        order: 3,
        instruction: 'Relâchez progressivement.',
        duration: 2,
        breathingCue: 'exhale',
      },
      {
        order: 4,
        instruction: 'Répétez 10 fois.',
        duration: 37,
      },
    ],
    commonErrors: [
      'Forcer au point d\'inconfort',
      'Sourire asymétrique',
    ],
    corrections: [
      'Le sourire doit rester agréable',
      'Utilisez un miroir pour vérifier la symétrie',
    ],
    contraindications: ['paralysie_faciale'],
    tips: [
      'Les recherches montrent que sourire peut améliorer l\'humeur !',
    ],
  },
  {
    id: 'ex-bouche-005',
    name: 'Articulation Voyelles',
    slug: 'articulation-voyelles',
    zone: 'bouche',
    duration: 60,
    repetitions: 3,
    difficulty: 'debutant',
    description: 'Articulez exagérément les voyelles pour travailler tous les muscles de la bouche.',
    benefits: [
      'Travail complet de la zone buccale',
      'Amélioration de l\'articulation',
      'Tonification globale',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Prononcez un grand "A" en ouvrant bien la bouche.',
        duration: 3,
      },
      {
        order: 2,
        instruction: 'Enchaînez avec un "E" en étirant les lèvres.',
        duration: 3,
      },
      {
        order: 3,
        instruction: 'Puis un "I" avec un sourire étiré.',
        duration: 3,
      },
      {
        order: 4,
        instruction: 'Un "O" rond.',
        duration: 3,
      },
      {
        order: 5,
        instruction: 'Terminez par un "U" avec les lèvres projetées.',
        duration: 3,
      },
      {
        order: 6,
        instruction: 'Répétez la séquence 3 fois lentement.',
        duration: 45,
      },
    ],
    commonErrors: [
      'Aller trop vite',
      'Articulation insuffisante',
    ],
    corrections: [
      'Prenez votre temps sur chaque voyelle',
      'Exagérez chaque position',
    ],
    contraindications: ['atm'],
    tips: [
      'Peut être fait en silence ou à voix haute',
    ],
  },

  // ============================================
  // ZONE: OVALE (5 exercices)
  // ============================================
  {
    id: 'ex-ovale-001',
    name: 'Lift de l\'Ovale',
    slug: 'lift-ovale',
    zone: 'ovale',
    duration: 60,
    repetitions: 10,
    difficulty: 'intermediaire',
    description: 'Exercice pour tonifier et redéfinir l\'ovale du visage.',
    benefits: [
      'Tonification de l\'ovale',
      'Définition de la ligne de la mâchoire',
      'Renforcement musculaire global',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Inclinez légèrement la tête vers l\'arrière (confortablement).',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Projetez la mâchoire inférieure vers l\'avant.',
        duration: 5,
        breathingCue: 'inhale',
      },
      {
        order: 3,
        instruction: 'Maintenez 5 secondes en sentant l\'étirement sous le menton.',
        duration: 5,
        breathingCue: 'hold',
      },
      {
        order: 4,
        instruction: 'Relâchez et revenez en position neutre.',
        duration: 5,
        breathingCue: 'exhale',
      },
      {
        order: 5,
        instruction: 'Répétez 10 fois.',
        duration: 40,
      },
    ],
    commonErrors: [
      'Trop incliner la tête',
      'Créer une tension dans le cou',
    ],
    corrections: [
      'L\'inclinaison doit être légère',
      'Le mouvement doit rester confortable',
    ],
    contraindications: ['douleurs_cervicales', 'atm'],
    tips: [
      'Excellent exercice pour la définition de la mâchoire',
    ],
  },
  {
    id: 'ex-ovale-002',
    name: 'Résistance Menton',
    slug: 'resistance-menton',
    zone: 'ovale',
    duration: 45,
    repetitions: 8,
    difficulty: 'intermediaire',
    description: 'Travaillez les muscles sous le menton avec résistance.',
    benefits: [
      'Tonification du dessous du menton',
      'Réduction du double menton',
      'Renforcement musculaire',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Placez votre poing fermé sous votre menton.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Poussez votre menton vers le bas contre votre poing.',
        duration: 5,
        breathingCue: 'inhale',
      },
      {
        order: 3,
        instruction: 'Votre poing crée une résistance. Maintenez 5 secondes.',
        duration: 5,
        breathingCue: 'hold',
      },
      {
        order: 4,
        instruction: 'Relâchez et répétez 8 fois.',
        duration: 30,
        breathingCue: 'exhale',
      },
    ],
    commonErrors: [
      'Pousser trop fort',
      'Créer une tension au niveau du cou',
    ],
    corrections: [
      'La résistance doit être modérée',
      'Gardez le cou détendu',
    ],
    contraindications: ['douleurs_cervicales', 'atm'],
    tips: [
      'Commencez avec une résistance légère',
    ],
  },
  {
    id: 'ex-ovale-003',
    name: 'Étirement du Cou Latéral',
    slug: 'etirement-cou-lateral',
    zone: 'ovale',
    duration: 90,
    difficulty: 'debutant',
    description: 'Étire les muscles latéraux du cou et de la mâchoire.',
    benefits: [
      'Étirement des muscles du cou',
      'Détente de la mâchoire',
      'Amélioration de la posture',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Asseyez-vous droit, épaules détendues.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Inclinez doucement l\'oreille droite vers l\'épaule droite.',
        duration: 20,
        breathingCue: 'exhale',
      },
      {
        order: 3,
        instruction: 'Maintenez 20 secondes, respirez profondément.',
        duration: 20,
      },
      {
        order: 4,
        instruction: 'Revenez au centre, puis répétez de l\'autre côté.',
        duration: 45,
        breathingCue: 'inhale',
      },
    ],
    commonErrors: [
      'Lever l\'épaule vers l\'oreille',
      'Forcer l\'étirement',
    ],
    corrections: [
      'Gardez les épaules basses et détendues',
      'L\'étirement doit être doux et agréable',
    ],
    contraindications: ['douleurs_cervicales'],
    tips: [
      'Peut être fait plusieurs fois par jour, surtout après le travail sur écran',
    ],
    isCooldown: true,
  },
  {
    id: 'ex-ovale-004',
    name: 'Langue au Palais',
    slug: 'langue-palais',
    zone: 'ovale',
    duration: 45,
    repetitions: 10,
    difficulty: 'debutant',
    description: 'Exercice discret pour tonifier le dessous du menton.',
    benefits: [
      'Tonification des muscles sous-mentonniers',
      'Exercice très discret',
      'Peut être fait partout',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Fermez la bouche, dents légèrement écartées.',
        duration: 3,
      },
      {
        order: 2,
        instruction: 'Appuyez fermement votre langue contre le palais.',
        duration: 3,
        breathingCue: 'inhale',
      },
      {
        order: 3,
        instruction: 'Maintenez 3 secondes en sentant les muscles sous le menton travailler.',
        duration: 3,
        breathingCue: 'hold',
      },
      {
        order: 4,
        instruction: 'Relâchez et répétez 10 fois.',
        duration: 36,
        breathingCue: 'exhale',
      },
    ],
    commonErrors: [
      'Contracter la mâchoire',
      'Retenir sa respiration',
    ],
    corrections: [
      'Seule la langue doit être active',
      'Respirez normalement',
    ],
    contraindications: [],
    tips: [
      'Parfait pour une routine discrète au bureau',
    ],
  },
  {
    id: 'ex-ovale-005',
    name: 'Massage Ligne de Mâchoire',
    slug: 'massage-ligne-machoire',
    zone: 'ovale',
    duration: 90,
    difficulty: 'debutant',
    description: 'Massage drainant le long de la ligne de la mâchoire.',
    benefits: [
      'Définition de la ligne de mâchoire',
      'Drainage lymphatique',
      'Détente de la mâchoire',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Placez vos pouces sous le menton, au centre.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Faites glisser le long de la mâchoire vers les oreilles.',
        duration: 20,
        breathingCue: 'exhale',
      },
      {
        order: 3,
        instruction: 'Appliquez une pression ferme mais confortable.',
        duration: 20,
      },
      {
        order: 4,
        instruction: 'Terminez derrière les oreilles et descendez le long du cou.',
        duration: 20,
        breathingCue: 'inhale',
      },
      {
        order: 5,
        instruction: 'Répétez 5 fois.',
        duration: 25,
      },
    ],
    commonErrors: [
      'Pression trop légère ou trop forte',
      'Oublier le drainage vers le cou',
    ],
    corrections: [
      'Trouvez votre pression idéale',
      'Toujours terminer vers le bas pour drainer',
    ],
    contraindications: ['injections_recentes'],
    tips: [
      'Idéal avec une huile ou après une crème',
    ],
  },

  // ============================================
  // ZONE: COU & MÂCHOIRE (5 exercices)
  // ============================================
  {
    id: 'ex-cou-001',
    name: 'Détente Mâchoire',
    slug: 'detente-machoire',
    zone: 'cou',
    duration: 60,
    difficulty: 'debutant',
    description: 'Relâchement profond des tensions de la mâchoire.',
    benefits: [
      'Réduction du bruxisme diurne',
      'Détente de l\'ATM',
      'Soulagement des tensions',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Placez vos mains de chaque côté de votre mâchoire.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Ouvrez légèrement la bouche et laissez la mâchoire se détendre.',
        duration: 10,
        breathingCue: 'exhale',
      },
      {
        order: 3,
        instruction: 'Effectuez de légers mouvements circulaires avec vos doigts sur les masséters.',
        duration: 30,
      },
      {
        order: 4,
        instruction: 'Relâchez complètement la mâchoire, lèvres entrouvertes.',
        duration: 15,
        breathingCue: 'exhale',
      },
    ],
    commonErrors: [
      'Serrer la mâchoire pendant l\'exercice',
      'Mouvements trop vigoureux',
    ],
    corrections: [
      'Consciemment, relâchez la mâchoire',
      'Les mouvements doivent être doux et apaisants',
    ],
    contraindications: ['atm'],
    tips: [
      'Excellent exercice à faire plusieurs fois par jour',
      'Particulièrement utile en période de stress',
    ],
    isWarmup: true,
    isCooldown: true,
  },
  {
    id: 'ex-cou-002',
    name: 'Rotation du Cou',
    slug: 'rotation-cou',
    zone: 'cou',
    duration: 90,
    difficulty: 'debutant',
    description: 'Rotations douces du cou pour libérer les tensions.',
    benefits: [
      'Détente des muscles du cou',
      'Amélioration de la mobilité cervicale',
      'Réduction des raideurs',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Asseyez-vous droit, épaules détendues.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Tournez lentement la tête vers la droite.',
        duration: 10,
        breathingCue: 'inhale',
      },
      {
        order: 3,
        instruction: 'Maintenez quelques secondes.',
        duration: 5,
        breathingCue: 'hold',
      },
      {
        order: 4,
        instruction: 'Revenez au centre.',
        duration: 5,
        breathingCue: 'exhale',
      },
      {
        order: 5,
        instruction: 'Tournez vers la gauche.',
        duration: 10,
        breathingCue: 'inhale',
      },
      {
        order: 6,
        instruction: 'Répétez 5 fois de chaque côté.',
        duration: 55,
      },
    ],
    commonErrors: [
      'Mouvements trop rapides',
      'Forcer l\'amplitude',
    ],
    corrections: [
      'Les mouvements doivent être lents et contrôlés',
      'Respectez votre amplitude naturelle',
    ],
    contraindications: ['douleurs_cervicales'],
    tips: [
      'À faire en douceur, jamais de mouvements brusques',
    ],
  },
  {
    id: 'ex-cou-003',
    name: 'Étirement Platysma',
    slug: 'etirement-platysma',
    zone: 'cou',
    duration: 60,
    repetitions: 6,
    difficulty: 'intermediaire',
    description: 'Étire et tonifie le muscle platysma du cou.',
    benefits: [
      'Tonification du cou',
      'Prévention du relâchement',
      'Définition du cou et du menton',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Tirez les coins de la bouche vers le bas et l\'extérieur.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Vous devriez sentir les tendons du cou se tendre.',
        duration: 5,
        breathingCue: 'inhale',
      },
      {
        order: 3,
        instruction: 'Maintenez 5 secondes.',
        duration: 5,
        breathingCue: 'hold',
      },
      {
        order: 4,
        instruction: 'Relâchez et détendez.',
        duration: 5,
        breathingCue: 'exhale',
      },
      {
        order: 5,
        instruction: 'Répétez 6 fois.',
        duration: 40,
      },
    ],
    commonErrors: [
      'Contracter trop fort',
      'Créer des tensions dans les épaules',
    ],
    corrections: [
      'Le mouvement doit être modéré',
      'Gardez les épaules détendues',
    ],
    contraindications: ['douleurs_cervicales'],
    tips: [
      'Exercice ciblé pour le cou',
    ],
  },
  {
    id: 'ex-cou-004',
    name: 'Massage Trapèzes',
    slug: 'massage-trapezes',
    zone: 'cou',
    duration: 120,
    difficulty: 'debutant',
    description: 'Auto-massage des trapèzes pour libérer les tensions du haut du dos et du cou.',
    benefits: [
      'Soulagement des tensions des épaules',
      'Détente profonde',
      'Amélioration de la posture',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Placez votre main droite sur votre épaule gauche.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Pétrissez doucement le muscle entre vos doigts.',
        duration: 50,
        breathingCue: 'exhale',
      },
      {
        order: 3,
        instruction: 'Changez de côté.',
        duration: 5,
      },
      {
        order: 4,
        instruction: 'Répétez de l\'autre côté.',
        duration: 55,
        breathingCue: 'inhale',
      },
      {
        order: 5,
        instruction: 'Terminez par des mouvements de lissage vers le bas.',
        duration: 5,
      },
    ],
    commonErrors: [
      'Masser trop fort',
      'Oublier de respirer',
    ],
    corrections: [
      'Adaptez la pression à votre confort',
      'Respirez profondément pendant le massage',
    ],
    contraindications: [],
    tips: [
      'Parfait après une journée de travail',
    ],
    isCooldown: true,
  },
  {
    id: 'ex-cou-005',
    name: 'Flexion Avant du Cou',
    slug: 'flexion-avant-cou',
    zone: 'cou',
    duration: 60,
    difficulty: 'debutant',
    description: 'Étirement doux de la nuque et du haut du dos.',
    benefits: [
      'Étirement de la nuque',
      'Détente des tensions cervicales',
      'Relâchement du haut du dos',
    ],
    steps: [
      {
        order: 1,
        instruction: 'Asseyez-vous droit, mains sur les genoux.',
        duration: 5,
      },
      {
        order: 2,
        instruction: 'Laissez tomber doucement le menton vers la poitrine.',
        duration: 10,
        breathingCue: 'exhale',
      },
      {
        order: 3,
        instruction: 'Sentez l\'étirement à l\'arrière du cou.',
        duration: 20,
      },
      {
        order: 4,
        instruction: 'Vous pouvez placer vos mains à l\'arrière de la tête pour un étirement plus profond (sans forcer).',
        duration: 15,
      },
      {
        order: 5,
        instruction: 'Remontez lentement, vertèbre par vertèbre.',
        duration: 10,
        breathingCue: 'inhale',
      },
    ],
    commonErrors: [
      'Forcer l\'étirement',
      'Remonter trop vite',
    ],
    corrections: [
      'Le poids de la tête suffit pour l\'étirement',
      'Prenez votre temps pour remonter',
    ],
    contraindications: ['douleurs_cervicales', 'hypertension'],
    tips: [
      'Très relaxant en fin de journée',
    ],
    isCooldown: true,
  },
];

// Fonctions utilitaires pour filtrer les exercices
export const getExercisesByZone = (zone: string): Exercise[] => {
  return exercises.filter(ex => ex.zone === zone);
};

export const getExerciseById = (id: string): Exercise | undefined => {
  return exercises.find(ex => ex.id === id);
};

export const getWarmupExercises = (): Exercise[] => {
  return exercises.filter(ex => ex.isWarmup);
};

export const getCooldownExercises = (): Exercise[] => {
  return exercises.filter(ex => ex.isCooldown);
};

export const getExercisesByDifficulty = (difficulty: string): Exercise[] => {
  return exercises.filter(ex => ex.difficulty === difficulty);
};

export const getSafeExercises = (contraindications: string[]): Exercise[] => {
  return exercises.filter(ex =>
    !ex.contraindications.some(c => contraindications.includes(c))
  );
};
