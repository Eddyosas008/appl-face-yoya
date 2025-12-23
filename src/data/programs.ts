import { Program } from '../types';

// ============================================
// PROGRAMMES GUIDÉS - FACE YOGA APP
// ============================================

export const programs: Program[] = [
  // ============================================
  // PROGRAMME 1: DÉCOUVERTE - 7 JOURS
  // ============================================
  {
    id: 'prog-decouverte-7j',
    name: 'Découverte du Face Yoga',
    slug: 'decouverte-face-yoga',
    description: 'Votre première semaine de face yoga. Apprenez les bases et découvrez les bienfaits de cette pratique douce.',
    objective: 'Initier à la pratique du face yoga et créer une première routine simple et agréable.',
    targetAudience: 'Débutants complets ou curieux souhaitant découvrir le face yoga en douceur.',
    duration: 7,
    dailyDuration: 8,
    difficulty: 'debutant',
    zones: ['front', 'yeux', 'joues', 'bouche', 'cou'],
    benefits: [
      'Découverte des principales zones du visage',
      'Apprentissage des mouvements de base',
      'Première expérience de détente faciale',
      'Création d\'une micro-habitude quotidienne',
    ],
    prerequisites: [
      'Aucune expérience préalable nécessaire',
    ],
    isRecommended: true,
    isPremium: false,
    days: [
      {
        day: 1,
        title: 'Bienvenue dans le Face Yoga',
        description: 'Aujourd\'hui, nous commençons par la détente. Apprenez à relâcher les tensions du visage.',
        sessions: [
          {
            id: 'prog1-d1-s1',
            title: 'Première séance : Détente globale',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-yeux-002', order: 2 },
              { exerciseId: 'ex-cou-001', order: 3 },
            ],
            totalDuration: 8,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 2,
        title: 'Focus sur le Haut du Visage',
        description: 'Explorons le front et le contour des yeux avec des exercices doux.',
        sessions: [
          {
            id: 'prog1-d2-s1',
            title: 'Front & Yeux',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-front-002', order: 2 },
              { exerciseId: 'ex-yeux-001', order: 3 },
              { exerciseId: 'ex-yeux-002', order: 4 },
            ],
            totalDuration: 8,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 3,
        title: 'Joues et Sourire',
        description: 'Des exercices pour éveiller les joues et travailler le sourire.',
        sessions: [
          {
            id: 'prog1-d3-s1',
            title: 'Vitalité des joues',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-joues-001', order: 2 },
              { exerciseId: 'ex-joues-002', order: 3 },
              { exerciseId: 'ex-bouche-004', order: 4 },
            ],
            totalDuration: 8,
            warmupIncluded: true,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 4,
        title: 'Bouche et Expression',
        description: 'Travaillons la zone de la bouche avec des exercices variés.',
        sessions: [
          {
            id: 'prog1-d4-s1',
            title: 'Expression faciale',
            exercises: [
              { exerciseId: 'ex-cou-001', order: 1 },
              { exerciseId: 'ex-bouche-001', order: 2 },
              { exerciseId: 'ex-bouche-002', order: 3 },
              { exerciseId: 'ex-bouche-005', order: 4 },
            ],
            totalDuration: 8,
            warmupIncluded: true,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 5,
        title: 'Cou et Mâchoire',
        description: 'Libérons les tensions du cou et de la mâchoire, zones souvent oubliées.',
        sessions: [
          {
            id: 'prog1-d5-s1',
            title: 'Détente cou & mâchoire',
            exercises: [
              { exerciseId: 'ex-cou-001', order: 1 },
              { exerciseId: 'ex-cou-002', order: 2 },
              { exerciseId: 'ex-ovale-003', order: 3 },
              { exerciseId: 'ex-cou-005', order: 4 },
            ],
            totalDuration: 8,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 6,
        title: 'Combinaison Haut & Bas',
        description: 'Une séance qui combine le haut et le bas du visage.',
        sessions: [
          {
            id: 'prog1-d6-s1',
            title: 'Séance complète légère',
            exercises: [
              { exerciseId: 'ex-front-003', order: 1 },
              { exerciseId: 'ex-yeux-004', order: 2 },
              { exerciseId: 'ex-ovale-004', order: 3 },
              { exerciseId: 'ex-ovale-005', order: 4 },
            ],
            totalDuration: 8,
            warmupIncluded: false,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 7,
        title: 'Routine Complète',
        description: 'Félicitations ! Votre première routine complète de face yoga.',
        sessions: [
          {
            id: 'prog1-d7-s1',
            title: 'Routine globale de découverte',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-yeux-001', order: 2 },
              { exerciseId: 'ex-joues-001', order: 3 },
              { exerciseId: 'ex-bouche-001', order: 4 },
              { exerciseId: 'ex-cou-001', order: 5 },
            ],
            totalDuration: 10,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
    ],
  },

  // ============================================
  // PROGRAMME 2: ANTI-ÂGE DOUX - 28 JOURS
  // ============================================
  {
    id: 'prog-anti-age-28j',
    name: 'Anti-Âge Doux',
    slug: 'anti-age-doux',
    description: 'Un programme de 4 semaines pour tonifier naturellement le visage et prendre soin de votre peau de l\'intérieur.',
    objective: 'Tonifier les muscles du visage, améliorer la circulation et favoriser un teint lumineux de manière naturelle et progressive.',
    targetAudience: 'Personnes de 35+ ans souhaitant intégrer une routine préventive douce, ou toute personne cherchant à tonifier son visage.',
    duration: 28,
    dailyDuration: 12,
    difficulty: 'intermediaire',
    zones: ['front', 'yeux', 'joues', 'bouche', 'ovale', 'cou'],
    benefits: [
      'Tonification progressive des muscles faciaux',
      'Amélioration de la circulation sanguine',
      'Réduction des tensions accumulées',
      'Meilleure conscience de votre visage',
      'Routine bien-être établie',
    ],
    prerequisites: [
      'Avoir complété le programme Découverte ou avoir une base en face yoga',
    ],
    isRecommended: true,
    isPremium: false,
    days: [
      // SEMAINE 1 : FONDATIONS
      {
        day: 1,
        title: 'Semaine 1 - Jour 1 : Mise en route',
        description: 'Commençons par réveiller tout le visage en douceur.',
        sessions: [
          {
            id: 'prog2-d1-s1',
            title: 'Réveil facial',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-yeux-001', order: 2 },
              { exerciseId: 'ex-joues-001', order: 3 },
              { exerciseId: 'ex-cou-001', order: 4 },
            ],
            totalDuration: 12,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 2,
        title: 'Semaine 1 - Jour 2 : Focus Front',
        description: 'Travaillons le front pour détendre et tonifier.',
        sessions: [
          {
            id: 'prog2-d2-s1',
            title: 'Front tonique',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-front-002', order: 2 },
              { exerciseId: 'ex-front-004', order: 3 },
              { exerciseId: 'ex-front-005', order: 4 },
              { exerciseId: 'ex-front-003', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 3,
        title: 'Semaine 1 - Jour 3 : Focus Yeux',
        description: 'Le contour des yeux mérite une attention particulière.',
        sessions: [
          {
            id: 'prog2-d3-s1',
            title: 'Éclat du regard',
            exercises: [
              { exerciseId: 'ex-yeux-001', order: 1 },
              { exerciseId: 'ex-yeux-003', order: 2 },
              { exerciseId: 'ex-yeux-004', order: 3 },
              { exerciseId: 'ex-yeux-005', order: 4 },
              { exerciseId: 'ex-yeux-002', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 4,
        title: 'Semaine 1 - Jour 4 : Focus Joues',
        description: 'Des joues toniques pour un visage rayonnant.',
        sessions: [
          {
            id: 'prog2-d4-s1',
            title: 'Joues sculptées',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-joues-001', order: 2 },
              { exerciseId: 'ex-joues-002', order: 3 },
              { exerciseId: 'ex-joues-003', order: 4 },
              { exerciseId: 'ex-joues-004', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: true,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 5,
        title: 'Semaine 1 - Jour 5 : Focus Bouche',
        description: 'La zone de la bouche pour un sourire éclatant.',
        sessions: [
          {
            id: 'prog2-d5-s1',
            title: 'Bouche & sourire',
            exercises: [
              { exerciseId: 'ex-cou-001', order: 1 },
              { exerciseId: 'ex-bouche-001', order: 2 },
              { exerciseId: 'ex-bouche-002', order: 3 },
              { exerciseId: 'ex-bouche-003', order: 4 },
              { exerciseId: 'ex-bouche-004', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: true,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 6,
        title: 'Semaine 1 - Jour 6 : Focus Ovale & Cou',
        description: 'L\'ovale et le cou pour un profil harmonieux.',
        sessions: [
          {
            id: 'prog2-d6-s1',
            title: 'Ovale défini',
            exercises: [
              { exerciseId: 'ex-cou-001', order: 1 },
              { exerciseId: 'ex-ovale-001', order: 2 },
              { exerciseId: 'ex-ovale-002', order: 3 },
              { exerciseId: 'ex-ovale-004', order: 4 },
              { exerciseId: 'ex-cou-003', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: true,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 7,
        title: 'Semaine 1 - Jour 7 : Routine complète',
        description: 'Récapitulatif de la semaine avec tous les apprentissages.',
        sessions: [
          {
            id: 'prog2-d7-s1',
            title: 'Bilan semaine 1',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-yeux-004', order: 2 },
              { exerciseId: 'ex-joues-004', order: 3 },
              { exerciseId: 'ex-bouche-004', order: 4 },
              { exerciseId: 'ex-ovale-005', order: 5 },
              { exerciseId: 'ex-cou-005', order: 6 },
            ],
            totalDuration: 12,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      // SEMAINE 2 : INTENSIFICATION
      {
        day: 8,
        title: 'Semaine 2 - Jour 1 : Intensification haut visage',
        sessions: [
          {
            id: 'prog2-d8-s1',
            title: 'Haut du visage intensif',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-front-002', order: 2 },
              { exerciseId: 'ex-front-004', order: 3 },
              { exerciseId: 'ex-yeux-003', order: 4 },
              { exerciseId: 'ex-yeux-004', order: 5 },
              { exerciseId: 'ex-front-003', order: 6 },
            ],
            totalDuration: 12,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 9,
        title: 'Semaine 2 - Jour 2 : Intensification milieu visage',
        sessions: [
          {
            id: 'prog2-d9-s1',
            title: 'Milieu du visage intensif',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-joues-002', order: 2 },
              { exerciseId: 'ex-joues-003', order: 3 },
              { exerciseId: 'ex-joues-005', order: 4 },
              { exerciseId: 'ex-bouche-003', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: true,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 10,
        title: 'Semaine 2 - Jour 3 : Intensification bas visage',
        sessions: [
          {
            id: 'prog2-d10-s1',
            title: 'Bas du visage intensif',
            exercises: [
              { exerciseId: 'ex-cou-001', order: 1 },
              { exerciseId: 'ex-ovale-001', order: 2 },
              { exerciseId: 'ex-ovale-002', order: 3 },
              { exerciseId: 'ex-cou-003', order: 4 },
              { exerciseId: 'ex-ovale-005', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 11,
        title: 'Semaine 2 - Jour 4 : Circulation & éclat',
        sessions: [
          {
            id: 'prog2-d11-s1',
            title: 'Boost circulation',
            exercises: [
              { exerciseId: 'ex-front-004', order: 1 },
              { exerciseId: 'ex-yeux-004', order: 2 },
              { exerciseId: 'ex-joues-004', order: 3 },
              { exerciseId: 'ex-ovale-005', order: 4 },
              { exerciseId: 'ex-cou-004', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: false,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 12,
        title: 'Semaine 2 - Jour 5 : Tonification globale',
        sessions: [
          {
            id: 'prog2-d12-s1',
            title: 'Tonification complète',
            exercises: [
              { exerciseId: 'ex-front-002', order: 1 },
              { exerciseId: 'ex-yeux-003', order: 2 },
              { exerciseId: 'ex-joues-003', order: 3 },
              { exerciseId: 'ex-bouche-003', order: 4 },
              { exerciseId: 'ex-ovale-001', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: false,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 13,
        title: 'Semaine 2 - Jour 6 : Détente profonde',
        sessions: [
          {
            id: 'prog2-d13-s1',
            title: 'Relaxation faciale',
            exercises: [
              { exerciseId: 'ex-front-003', order: 1 },
              { exerciseId: 'ex-yeux-002', order: 2 },
              { exerciseId: 'ex-cou-001', order: 3 },
              { exerciseId: 'ex-ovale-003', order: 4 },
              { exerciseId: 'ex-cou-005', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 14,
        title: 'Semaine 2 - Jour 7 : Bilan mi-parcours',
        sessions: [
          {
            id: 'prog2-d14-s1',
            title: 'Routine complète mi-parcours',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-yeux-003', order: 2 },
              { exerciseId: 'ex-joues-003', order: 3 },
              { exerciseId: 'ex-bouche-002', order: 4 },
              { exerciseId: 'ex-ovale-001', order: 5 },
              { exerciseId: 'ex-cou-001', order: 6 },
            ],
            totalDuration: 12,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      // SEMAINE 3 : CONSOLIDATION
      {
        day: 15,
        title: 'Semaine 3 - Jour 1 : Consolidation haut',
        sessions: [
          {
            id: 'prog2-d15-s1',
            title: 'Haut du visage - consolidation',
            exercises: [
              { exerciseId: 'ex-front-002', order: 1 },
              { exerciseId: 'ex-front-005', order: 2 },
              { exerciseId: 'ex-yeux-003', order: 3 },
              { exerciseId: 'ex-yeux-005', order: 4 },
              { exerciseId: 'ex-front-003', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: false,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 16,
        title: 'Semaine 3 - Jour 2 : Consolidation milieu',
        sessions: [
          {
            id: 'prog2-d16-s1',
            title: 'Milieu du visage - consolidation',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-joues-003', order: 2 },
              { exerciseId: 'ex-joues-005', order: 3 },
              { exerciseId: 'ex-bouche-003', order: 4 },
              { exerciseId: 'ex-bouche-005', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: true,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 17,
        title: 'Semaine 3 - Jour 3 : Consolidation bas',
        sessions: [
          {
            id: 'prog2-d17-s1',
            title: 'Bas du visage - consolidation',
            exercises: [
              { exerciseId: 'ex-cou-001', order: 1 },
              { exerciseId: 'ex-ovale-002', order: 2 },
              { exerciseId: 'ex-ovale-004', order: 3 },
              { exerciseId: 'ex-cou-003', order: 4 },
              { exerciseId: 'ex-ovale-005', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 18,
        title: 'Semaine 3 - Jour 4 : Mix dynamique',
        sessions: [
          {
            id: 'prog2-d18-s1',
            title: 'Séance dynamique',
            exercises: [
              { exerciseId: 'ex-front-004', order: 1 },
              { exerciseId: 'ex-joues-001', order: 2 },
              { exerciseId: 'ex-joues-002', order: 3 },
              { exerciseId: 'ex-bouche-005', order: 4 },
              { exerciseId: 'ex-ovale-001', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: false,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 19,
        title: 'Semaine 3 - Jour 5 : Focus tensons',
        sessions: [
          {
            id: 'prog2-d19-s1',
            title: 'Libération des tensions',
            exercises: [
              { exerciseId: 'ex-front-003', order: 1 },
              { exerciseId: 'ex-front-005', order: 2 },
              { exerciseId: 'ex-cou-001', order: 3 },
              { exerciseId: 'ex-cou-002', order: 4 },
              { exerciseId: 'ex-cou-004', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 20,
        title: 'Semaine 3 - Jour 6 : Sculptage doux',
        sessions: [
          {
            id: 'prog2-d20-s1',
            title: 'Définition des contours',
            exercises: [
              { exerciseId: 'ex-joues-003', order: 1 },
              { exerciseId: 'ex-joues-004', order: 2 },
              { exerciseId: 'ex-joues-005', order: 3 },
              { exerciseId: 'ex-ovale-001', order: 4 },
              { exerciseId: 'ex-ovale-005', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: false,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 21,
        title: 'Semaine 3 - Jour 7 : Pause active',
        sessions: [
          {
            id: 'prog2-d21-s1',
            title: 'Routine légère de récupération',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-yeux-002', order: 2 },
              { exerciseId: 'ex-joues-004', order: 3 },
              { exerciseId: 'ex-cou-005', order: 4 },
            ],
            totalDuration: 10,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      // SEMAINE 4 : MAÎTRISE
      {
        day: 22,
        title: 'Semaine 4 - Jour 1 : Routine matinale',
        sessions: [
          {
            id: 'prog2-d22-s1',
            title: 'Réveil & vitalité',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-front-004', order: 2 },
              { exerciseId: 'ex-yeux-004', order: 3 },
              { exerciseId: 'ex-joues-001', order: 4 },
              { exerciseId: 'ex-bouche-004', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: true,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 23,
        title: 'Semaine 4 - Jour 2 : Routine du soir',
        sessions: [
          {
            id: 'prog2-d23-s1',
            title: 'Détente & récupération',
            exercises: [
              { exerciseId: 'ex-front-003', order: 1 },
              { exerciseId: 'ex-yeux-002', order: 2 },
              { exerciseId: 'ex-cou-001', order: 3 },
              { exerciseId: 'ex-ovale-003', order: 4 },
              { exerciseId: 'ex-cou-005', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 24,
        title: 'Semaine 4 - Jour 3 : Tonification express',
        sessions: [
          {
            id: 'prog2-d24-s1',
            title: 'Tonification rapide',
            exercises: [
              { exerciseId: 'ex-front-002', order: 1 },
              { exerciseId: 'ex-yeux-003', order: 2 },
              { exerciseId: 'ex-joues-003', order: 3 },
              { exerciseId: 'ex-ovale-001', order: 4 },
              { exerciseId: 'ex-ovale-002', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: false,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 25,
        title: 'Semaine 4 - Jour 4 : Circulation maximale',
        sessions: [
          {
            id: 'prog2-d25-s1',
            title: 'Boost circulatoire',
            exercises: [
              { exerciseId: 'ex-front-004', order: 1 },
              { exerciseId: 'ex-yeux-004', order: 2 },
              { exerciseId: 'ex-joues-004', order: 3 },
              { exerciseId: 'ex-ovale-005', order: 4 },
              { exerciseId: 'ex-cou-004', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: false,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 26,
        title: 'Semaine 4 - Jour 5 : Focus zones sensibles',
        sessions: [
          {
            id: 'prog2-d26-s1',
            title: 'Attention aux détails',
            exercises: [
              { exerciseId: 'ex-front-005', order: 1 },
              { exerciseId: 'ex-yeux-004', order: 2 },
              { exerciseId: 'ex-bouche-003', order: 3 },
              { exerciseId: 'ex-ovale-004', order: 4 },
              { exerciseId: 'ex-cou-003', order: 5 },
            ],
            totalDuration: 12,
            warmupIncluded: false,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 27,
        title: 'Semaine 4 - Jour 6 : Routine signature',
        sessions: [
          {
            id: 'prog2-d27-s1',
            title: 'Votre routine personnelle',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-yeux-003', order: 2 },
              { exerciseId: 'ex-joues-003', order: 3 },
              { exerciseId: 'ex-bouche-002', order: 4 },
              { exerciseId: 'ex-ovale-001', order: 5 },
              { exerciseId: 'ex-cou-001', order: 6 },
            ],
            totalDuration: 12,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 28,
        title: 'Semaine 4 - Jour 7 : Célébration !',
        description: 'Félicitations ! Vous avez complété 28 jours de face yoga. Votre routine est maintenant établie.',
        sessions: [
          {
            id: 'prog2-d28-s1',
            title: 'Routine finale de célébration',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-front-002', order: 2 },
              { exerciseId: 'ex-yeux-003', order: 3 },
              { exerciseId: 'ex-joues-003', order: 4 },
              { exerciseId: 'ex-bouche-004', order: 5 },
              { exerciseId: 'ex-ovale-001', order: 6 },
              { exerciseId: 'ex-cou-001', order: 7 },
            ],
            totalDuration: 15,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
    ],
  },

  // ============================================
  // PROGRAMME 3: DÉTENTE MÂCHOIRE & COU - 21 JOURS
  // ============================================
  {
    id: 'prog-detente-machoire-21j',
    name: 'Détente Mâchoire & Cou',
    slug: 'detente-machoire-cou',
    description: 'Programme spécialisé pour libérer les tensions de la mâchoire et du cou, souvent liées au stress.',
    objective: 'Réduire les tensions chroniques de la mâchoire et du cou, améliorer le confort quotidien et prévenir les inconforts liés au stress.',
    targetAudience: 'Personnes souffrant de tensions de la mâchoire (serrement, bruxisme diurne), douleurs cervicales légères, ou stress chronique.',
    duration: 21,
    dailyDuration: 10,
    difficulty: 'debutant',
    zones: ['cou', 'ovale', 'front'],
    benefits: [
      'Réduction des tensions de la mâchoire',
      'Soulagement des raideurs cervicales',
      'Meilleure gestion du stress',
      'Amélioration de la qualité du sommeil',
      'Conscience corporelle accrue',
    ],
    prerequisites: [
      'Consulter un professionnel de santé en cas de douleurs importantes',
      'Ne pas pratiquer en cas de troubles ATM non diagnostiqués',
    ],
    isRecommended: false,
    isPremium: false,
    days: [
      {
        day: 1,
        title: 'Jour 1 : Découverte de vos tensions',
        description: 'Prenons conscience des zones de tension et commençons à les libérer.',
        sessions: [
          {
            id: 'prog3-d1-s1',
            title: 'Prise de conscience',
            exercises: [
              { exerciseId: 'ex-cou-001', order: 1 },
              { exerciseId: 'ex-cou-002', order: 2 },
              { exerciseId: 'ex-cou-005', order: 3 },
            ],
            totalDuration: 10,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 2,
        title: 'Jour 2 : Mâchoire en douceur',
        sessions: [
          {
            id: 'prog3-d2-s1',
            title: 'Libération mâchoire',
            exercises: [
              { exerciseId: 'ex-cou-001', order: 1 },
              { exerciseId: 'ex-bouche-001', order: 2 },
              { exerciseId: 'ex-ovale-003', order: 3 },
              { exerciseId: 'ex-cou-005', order: 4 },
            ],
            totalDuration: 10,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 3,
        title: 'Jour 3 : Cou et épaules',
        sessions: [
          {
            id: 'prog3-d3-s1',
            title: 'Détente cervicale',
            exercises: [
              { exerciseId: 'ex-cou-002', order: 1 },
              { exerciseId: 'ex-ovale-003', order: 2 },
              { exerciseId: 'ex-cou-004', order: 3 },
              { exerciseId: 'ex-cou-005', order: 4 },
            ],
            totalDuration: 10,
            warmupIncluded: false,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 4,
        title: 'Jour 4 : Front et tempes',
        sessions: [
          {
            id: 'prog3-d4-s1',
            title: 'Haut du visage relaxé',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-front-003', order: 2 },
              { exerciseId: 'ex-front-005', order: 3 },
              { exerciseId: 'ex-cou-001', order: 4 },
            ],
            totalDuration: 10,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 5,
        title: 'Jour 5 : Routine complète douce',
        sessions: [
          {
            id: 'prog3-d5-s1',
            title: 'Détente globale',
            exercises: [
              { exerciseId: 'ex-front-003', order: 1 },
              { exerciseId: 'ex-cou-001', order: 2 },
              { exerciseId: 'ex-cou-002', order: 3 },
              { exerciseId: 'ex-cou-005', order: 4 },
            ],
            totalDuration: 10,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 6,
        title: 'Jour 6 : Focus masséters',
        sessions: [
          {
            id: 'prog3-d6-s1',
            title: 'Travail des masséters',
            exercises: [
              { exerciseId: 'ex-cou-001', order: 1 },
              { exerciseId: 'ex-bouche-001', order: 2 },
              { exerciseId: 'ex-bouche-005', order: 3 },
              { exerciseId: 'ex-ovale-003', order: 4 },
            ],
            totalDuration: 10,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 7,
        title: 'Jour 7 : Jour de récupération active',
        sessions: [
          {
            id: 'prog3-d7-s1',
            title: 'Routine légère',
            exercises: [
              { exerciseId: 'ex-yeux-002', order: 1 },
              { exerciseId: 'ex-cou-001', order: 2 },
              { exerciseId: 'ex-cou-005', order: 3 },
            ],
            totalDuration: 8,
            warmupIncluded: false,
            cooldownIncluded: true,
          },
        ],
      },
      // Semaine 2
      {
        day: 8,
        title: 'Jour 8 : Approfondissement mâchoire',
        sessions: [
          {
            id: 'prog3-d8-s1',
            title: 'Mâchoire - niveau 2',
            exercises: [
              { exerciseId: 'ex-cou-001', order: 1 },
              { exerciseId: 'ex-bouche-001', order: 2 },
              { exerciseId: 'ex-ovale-004', order: 3 },
              { exerciseId: 'ex-ovale-005', order: 4 },
            ],
            totalDuration: 10,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 9,
        title: 'Jour 9 : Mobilité cervicale',
        sessions: [
          {
            id: 'prog3-d9-s1',
            title: 'Mobilité du cou',
            exercises: [
              { exerciseId: 'ex-cou-002', order: 1 },
              { exerciseId: 'ex-cou-003', order: 2 },
              { exerciseId: 'ex-ovale-003', order: 3 },
              { exerciseId: 'ex-cou-004', order: 4 },
            ],
            totalDuration: 10,
            warmupIncluded: false,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 10,
        title: 'Jour 10 : Connexion tête-cou',
        sessions: [
          {
            id: 'prog3-d10-s1',
            title: 'Harmonie tête-cou',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-front-003', order: 2 },
              { exerciseId: 'ex-cou-001', order: 3 },
              { exerciseId: 'ex-cou-002', order: 4 },
            ],
            totalDuration: 10,
            warmupIncluded: true,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 11,
        title: 'Jour 11 : Détente profonde',
        sessions: [
          {
            id: 'prog3-d11-s1',
            title: 'Relaxation intense',
            exercises: [
              { exerciseId: 'ex-yeux-002', order: 1 },
              { exerciseId: 'ex-front-003', order: 2 },
              { exerciseId: 'ex-cou-001', order: 3 },
              { exerciseId: 'ex-cou-004', order: 4 },
              { exerciseId: 'ex-cou-005', order: 5 },
            ],
            totalDuration: 10,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 12,
        title: 'Jour 12 : Anti-stress facial',
        sessions: [
          {
            id: 'prog3-d12-s1',
            title: 'Libération du stress',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-front-005', order: 2 },
              { exerciseId: 'ex-cou-001', order: 3 },
              { exerciseId: 'ex-ovale-003', order: 4 },
            ],
            totalDuration: 10,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 13,
        title: 'Jour 13 : Drainage & détente',
        sessions: [
          {
            id: 'prog3-d13-s1',
            title: 'Drainage lymphatique doux',
            exercises: [
              { exerciseId: 'ex-yeux-004', order: 1 },
              { exerciseId: 'ex-ovale-005', order: 2 },
              { exerciseId: 'ex-cou-004', order: 3 },
              { exerciseId: 'ex-cou-005', order: 4 },
            ],
            totalDuration: 10,
            warmupIncluded: false,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 14,
        title: 'Jour 14 : Bilan mi-parcours',
        sessions: [
          {
            id: 'prog3-d14-s1',
            title: 'Routine de mi-parcours',
            exercises: [
              { exerciseId: 'ex-front-003', order: 1 },
              { exerciseId: 'ex-cou-001', order: 2 },
              { exerciseId: 'ex-cou-002', order: 3 },
              { exerciseId: 'ex-ovale-003', order: 4 },
              { exerciseId: 'ex-cou-005', order: 5 },
            ],
            totalDuration: 10,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      // Semaine 3
      {
        day: 15,
        title: 'Jour 15 : Routine matinale mâchoire',
        sessions: [
          {
            id: 'prog3-d15-s1',
            title: 'Réveil de la mâchoire',
            exercises: [
              { exerciseId: 'ex-cou-001', order: 1 },
              { exerciseId: 'ex-bouche-001', order: 2 },
              { exerciseId: 'ex-bouche-005', order: 3 },
              { exerciseId: 'ex-ovale-004', order: 4 },
            ],
            totalDuration: 10,
            warmupIncluded: true,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 16,
        title: 'Jour 16 : Routine du soir cou',
        sessions: [
          {
            id: 'prog3-d16-s1',
            title: 'Détente nocturne',
            exercises: [
              { exerciseId: 'ex-cou-002', order: 1 },
              { exerciseId: 'ex-ovale-003', order: 2 },
              { exerciseId: 'ex-cou-004', order: 3 },
              { exerciseId: 'ex-cou-005', order: 4 },
            ],
            totalDuration: 10,
            warmupIncluded: false,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 17,
        title: 'Jour 17 : Complète anti-tension',
        sessions: [
          {
            id: 'prog3-d17-s1',
            title: 'Programme anti-tension',
            exercises: [
              { exerciseId: 'ex-front-003', order: 1 },
              { exerciseId: 'ex-front-005', order: 2 },
              { exerciseId: 'ex-cou-001', order: 3 },
              { exerciseId: 'ex-cou-002', order: 4 },
              { exerciseId: 'ex-cou-005', order: 5 },
            ],
            totalDuration: 10,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 18,
        title: 'Jour 18 : Focus ovale & mâchoire',
        sessions: [
          {
            id: 'prog3-d18-s1',
            title: 'Ovale détendu',
            exercises: [
              { exerciseId: 'ex-cou-001', order: 1 },
              { exerciseId: 'ex-ovale-003', order: 2 },
              { exerciseId: 'ex-ovale-004', order: 3 },
              { exerciseId: 'ex-ovale-005', order: 4 },
            ],
            totalDuration: 10,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 19,
        title: 'Jour 19 : Mobilité complète',
        sessions: [
          {
            id: 'prog3-d19-s1',
            title: 'Mobilité tête et cou',
            exercises: [
              { exerciseId: 'ex-yeux-001', order: 1 },
              { exerciseId: 'ex-cou-002', order: 2 },
              { exerciseId: 'ex-cou-003', order: 3 },
              { exerciseId: 'ex-ovale-003', order: 4 },
            ],
            totalDuration: 10,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 20,
        title: 'Jour 20 : Votre routine quotidienne',
        sessions: [
          {
            id: 'prog3-d20-s1',
            title: 'Routine personnalisée',
            exercises: [
              { exerciseId: 'ex-front-003', order: 1 },
              { exerciseId: 'ex-cou-001', order: 2 },
              { exerciseId: 'ex-cou-002', order: 3 },
              { exerciseId: 'ex-ovale-003', order: 4 },
              { exerciseId: 'ex-cou-005', order: 5 },
            ],
            totalDuration: 10,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 21,
        title: 'Jour 21 : Célébration & maintien',
        description: 'Bravo ! Vous avez complété 21 jours. Votre mâchoire et votre cou vous remercient.',
        sessions: [
          {
            id: 'prog3-d21-s1',
            title: 'Routine finale complète',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1 },
              { exerciseId: 'ex-front-003', order: 2 },
              { exerciseId: 'ex-cou-001', order: 3 },
              { exerciseId: 'ex-cou-002', order: 4 },
              { exerciseId: 'ex-ovale-003', order: 5 },
              { exerciseId: 'ex-cou-005', order: 6 },
            ],
            totalDuration: 12,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
    ],
  },

  // ============================================
  // PROGRAMME 4: ROUTINE EXPRESS - 5 MIN/JOUR
  // ============================================
  {
    id: 'prog-routine-express',
    name: 'Routine Express',
    slug: 'routine-express',
    description: 'Pour les emplois du temps chargés : une routine efficace de 5 minutes par jour.',
    objective: 'Maintenir une pratique régulière malgré un emploi du temps chargé, avec des exercices ciblés et efficaces.',
    targetAudience: 'Personnes très occupées souhaitant intégrer le face yoga dans leur quotidien sans y consacrer beaucoup de temps.',
    duration: 14,
    dailyDuration: 5,
    difficulty: 'debutant',
    zones: ['front', 'yeux', 'joues', 'bouche', 'cou'],
    benefits: [
      'Routine rapide et efficace',
      'Facile à maintenir sur le long terme',
      'Résultats visibles malgré le peu de temps',
      'Parfait pour les pauses au travail',
    ],
    prerequisites: [],
    isRecommended: true,
    isPremium: false,
    days: [
      {
        day: 1,
        title: 'Jour 1 : Initiation express',
        sessions: [
          {
            id: 'prog4-d1-s1',
            title: 'Express - Détente globale',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1, customDuration: 45 },
              { exerciseId: 'ex-cou-001', order: 2, customDuration: 45 },
              { exerciseId: 'ex-yeux-002', order: 3, customDuration: 30 },
            ],
            totalDuration: 5,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 2,
        title: 'Jour 2 : Express haut du visage',
        sessions: [
          {
            id: 'prog4-d2-s1',
            title: 'Express - Front & Yeux',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1, customDuration: 40 },
              { exerciseId: 'ex-front-002', order: 2, customDuration: 40 },
              { exerciseId: 'ex-yeux-001', order: 3, customDuration: 40 },
            ],
            totalDuration: 5,
            warmupIncluded: true,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 3,
        title: 'Jour 3 : Express joues',
        sessions: [
          {
            id: 'prog4-d3-s1',
            title: 'Express - Joues toniques',
            exercises: [
              { exerciseId: 'ex-joues-001', order: 1, customDuration: 40 },
              { exerciseId: 'ex-joues-002', order: 2, customDuration: 40 },
              { exerciseId: 'ex-joues-004', order: 3, customDuration: 40 },
            ],
            totalDuration: 5,
            warmupIncluded: false,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 4,
        title: 'Jour 4 : Express bouche',
        sessions: [
          {
            id: 'prog4-d4-s1',
            title: 'Express - Sourire éclatant',
            exercises: [
              { exerciseId: 'ex-bouche-001', order: 1, customDuration: 40 },
              { exerciseId: 'ex-bouche-002', order: 2, customDuration: 40 },
              { exerciseId: 'ex-bouche-004', order: 3, customDuration: 40 },
            ],
            totalDuration: 5,
            warmupIncluded: false,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 5,
        title: 'Jour 5 : Express cou',
        sessions: [
          {
            id: 'prog4-d5-s1',
            title: 'Express - Cou & ovale',
            exercises: [
              { exerciseId: 'ex-cou-001', order: 1, customDuration: 45 },
              { exerciseId: 'ex-ovale-004', order: 2, customDuration: 40 },
              { exerciseId: 'ex-cou-005', order: 3, customDuration: 35 },
            ],
            totalDuration: 5,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 6,
        title: 'Jour 6 : Express complet',
        sessions: [
          {
            id: 'prog4-d6-s1',
            title: 'Express - Tour du visage',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1, customDuration: 30 },
              { exerciseId: 'ex-yeux-001', order: 2, customDuration: 30 },
              { exerciseId: 'ex-joues-001', order: 3, customDuration: 30 },
              { exerciseId: 'ex-cou-001', order: 4, customDuration: 30 },
            ],
            totalDuration: 5,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 7,
        title: 'Jour 7 : Express détente',
        sessions: [
          {
            id: 'prog4-d7-s1',
            title: 'Express - Relaxation',
            exercises: [
              { exerciseId: 'ex-front-003', order: 1, customDuration: 60 },
              { exerciseId: 'ex-yeux-002', order: 2, customDuration: 30 },
              { exerciseId: 'ex-cou-005', order: 3, customDuration: 30 },
            ],
            totalDuration: 5,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 8,
        title: 'Jour 8 : Express tonifiant',
        sessions: [
          {
            id: 'prog4-d8-s1',
            title: 'Express - Boost tonique',
            exercises: [
              { exerciseId: 'ex-front-002', order: 1, customDuration: 40 },
              { exerciseId: 'ex-joues-003', order: 2, customDuration: 40 },
              { exerciseId: 'ex-ovale-001', order: 3, customDuration: 40 },
            ],
            totalDuration: 5,
            warmupIncluded: false,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 9,
        title: 'Jour 9 : Express circulation',
        sessions: [
          {
            id: 'prog4-d9-s1',
            title: 'Express - Boost circulatoire',
            exercises: [
              { exerciseId: 'ex-front-004', order: 1, customDuration: 40 },
              { exerciseId: 'ex-joues-004', order: 2, customDuration: 40 },
              { exerciseId: 'ex-ovale-005', order: 3, customDuration: 40 },
            ],
            totalDuration: 5,
            warmupIncluded: false,
            cooldownIncluded: true,
          },
        ],
      },
      {
        day: 10,
        title: 'Jour 10 : Express anti-stress',
        sessions: [
          {
            id: 'prog4-d10-s1',
            title: 'Express - Détente anti-stress',
            exercises: [
              { exerciseId: 'ex-front-003', order: 1, customDuration: 45 },
              { exerciseId: 'ex-cou-001', order: 2, customDuration: 45 },
              { exerciseId: 'ex-cou-002', order: 3, customDuration: 30 },
            ],
            totalDuration: 5,
            warmupIncluded: true,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 11,
        title: 'Jour 11 : Express regard',
        sessions: [
          {
            id: 'prog4-d11-s1',
            title: 'Express - Focus regard',
            exercises: [
              { exerciseId: 'ex-yeux-001', order: 1, customDuration: 40 },
              { exerciseId: 'ex-yeux-003', order: 2, customDuration: 40 },
              { exerciseId: 'ex-yeux-004', order: 3, customDuration: 40 },
            ],
            totalDuration: 5,
            warmupIncluded: true,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 12,
        title: 'Jour 12 : Express sourire',
        sessions: [
          {
            id: 'prog4-d12-s1',
            title: 'Express - Sourire radieux',
            exercises: [
              { exerciseId: 'ex-bouche-004', order: 1, customDuration: 40 },
              { exerciseId: 'ex-joues-003', order: 2, customDuration: 40 },
              { exerciseId: 'ex-bouche-005', order: 3, customDuration: 40 },
            ],
            totalDuration: 5,
            warmupIncluded: false,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 13,
        title: 'Jour 13 : Express ovale',
        sessions: [
          {
            id: 'prog4-d13-s1',
            title: 'Express - Ovale défini',
            exercises: [
              { exerciseId: 'ex-ovale-001', order: 1, customDuration: 45 },
              { exerciseId: 'ex-ovale-002', order: 2, customDuration: 40 },
              { exerciseId: 'ex-ovale-004', order: 3, customDuration: 35 },
            ],
            totalDuration: 5,
            warmupIncluded: false,
            cooldownIncluded: false,
          },
        ],
      },
      {
        day: 14,
        title: 'Jour 14 : Express finale',
        description: 'Bravo ! Vous avez prouvé que 5 minutes suffisent pour prendre soin de vous.',
        sessions: [
          {
            id: 'prog4-d14-s1',
            title: 'Express - Routine complète finale',
            exercises: [
              { exerciseId: 'ex-front-001', order: 1, customDuration: 30 },
              { exerciseId: 'ex-yeux-001', order: 2, customDuration: 25 },
              { exerciseId: 'ex-joues-001', order: 3, customDuration: 25 },
              { exerciseId: 'ex-bouche-001', order: 4, customDuration: 20 },
              { exerciseId: 'ex-cou-001', order: 5, customDuration: 20 },
            ],
            totalDuration: 5,
            warmupIncluded: true,
            cooldownIncluded: true,
          },
        ],
      },
    ],
  },
];

// Fonctions utilitaires
export const getProgramById = (id: string): Program | undefined => {
  return programs.find(p => p.id === id);
};

export const getRecommendedPrograms = (): Program[] => {
  return programs.filter(p => p.isRecommended);
};

export const getProgramsByDifficulty = (difficulty: string): Program[] => {
  return programs.filter(p => p.difficulty === difficulty);
};

export const getProgramsByDuration = (maxDays: number): Program[] => {
  return programs.filter(p => p.duration <= maxDays);
};
