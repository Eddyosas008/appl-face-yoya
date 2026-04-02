import * as db from '../server/db';

// ============================================================
// NOUVELLES CATÉGORIES (12 nouvelles, en plus des 8 existantes)
// ============================================================
const NEW_CATEGORIES = [
  {
    slug: 'anxiety',
    name: 'Anxiété & Peurs',
    description: 'Apprivoisez l\'anxiété et dissolvez les peurs avec des techniques validées par la recherche.',
    emoji: '🌊',
    color: '#3B82F6',
    sortOrder: 9,
    isActive: true,
  },
  {
    slug: 'confidence',
    name: 'Confiance en soi',
    description: 'Renforcez votre estime personnelle et votre assurance intérieure.',
    emoji: '🦁',
    color: '#F59E0B',
    sortOrder: 10,
    isActive: true,
  },
  {
    slug: 'pain',
    name: 'Gestion de la douleur',
    description: 'Techniques de pleine conscience pour réduire la perception de la douleur chronique.',
    emoji: '💙',
    color: '#6366F1',
    sortOrder: 11,
    isActive: true,
  },
  {
    slug: 'creativity',
    name: 'Créativité & Inspiration',
    description: 'Libérez votre potentiel créatif et stimulez l\'inspiration.',
    emoji: '🎨',
    color: '#EC4899',
    sortOrder: 12,
    isActive: true,
  },
  {
    slug: 'relationships',
    name: 'Relations & Connexion',
    description: 'Cultivez des relations plus profondes et une communication bienveillante.',
    emoji: '💞',
    color: '#EF4444',
    sortOrder: 13,
    isActive: true,
  },
  {
    slug: 'work-stress',
    name: 'Stress au travail',
    description: 'Décompressez après une journée difficile et retrouvez l\'équilibre professionnel.',
    emoji: '💼',
    color: '#8B5CF6',
    sortOrder: 14,
    isActive: true,
  },
  {
    slug: 'grief',
    name: 'Deuil & Perte',
    description: 'Accompagnement doux pour traverser les périodes de deuil et de perte.',
    emoji: '🕊️',
    color: '#64748B',
    sortOrder: 15,
    isActive: true,
  },
  {
    slug: 'energy',
    name: 'Énergie & Vitalité',
    description: 'Rechargez vos batteries et retrouvez une énergie naturelle et durable.',
    emoji: '⚡',
    color: '#EAB308',
    sortOrder: 16,
    isActive: true,
  },
  {
    slug: 'forgiveness',
    name: 'Pardon & Lâcher-prise',
    description: 'Libérez-vous des rancœurs et retrouvez la paix intérieure par le pardon.',
    emoji: '🌸',
    color: '#F472B6',
    sortOrder: 17,
    isActive: true,
  },
  {
    slug: 'intuition',
    name: 'Intuition & Sagesse',
    description: 'Connectez-vous à votre sagesse intérieure et développez votre intuition.',
    emoji: '🔮',
    color: '#7C3AED',
    sortOrder: 18,
    isActive: true,
  },
  {
    slug: 'nature',
    name: 'Nature & Connexion',
    description: 'Voyages méditatifs dans la nature pour ressourcer corps et esprit.',
    emoji: '🌲',
    color: '#16A34A',
    sortOrder: 19,
    isActive: true,
  },
  {
    slug: 'children',
    name: 'Méditations pour enfants',
    description: 'Méditations adaptées aux enfants pour calmer, dormir et développer la pleine conscience.',
    emoji: '🌈',
    color: '#06B6D4',
    sortOrder: 20,
    isActive: true,
  },
];

// ============================================================
// NOUVELLES MÉDITATIONS (40+)
// ============================================================
const NEW_MEDITATIONS = [

  // ── ANXIÉTÉ & PEURS ──────────────────────────────────────
  {
    slug: 'vague-de-calme',
    title: 'La vague de calme',
    subtitle: 'Dissoudre l\'anxiété par la respiration',
    description: 'Imaginez une vague de calme qui traverse votre corps et emporte avec elle toute tension et anxiété. Cette méditation utilise la respiration rythmique et la visualisation pour activer le système nerveux parasympathique.',
    categorySlug: 'anxiety',
    level: 'beginner' as const,
    duration: 10,
    instructor: 'Sophie Martin',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    coverColor: '#3B82F6',
    tags: JSON.stringify(['anxiété', 'respiration', 'calme', 'débutant']),
    scriptText: `Installez-vous confortablement et fermez doucement les yeux.

Commencez par prendre trois grandes respirations profondes. Inspirez lentement par le nez... et expirez par la bouche en laissant partir toute tension.

Maintenant, imaginez que vous êtes au bord de l'océan. Le ciel est d'un bleu profond, l'air est frais et pur. Vous entendez le doux bruit des vagues.

Chaque fois que vous inspirez, imaginez une vague de calme bleu qui entre dans votre corps par le sommet de votre tête. Cette vague descend doucement... dans votre front... vos yeux... vos joues... votre mâchoire qui se relâche.

La vague continue... dans votre gorge... vos épaules qui s'abaissent... votre poitrine qui s'ouvre... votre ventre qui se détend.

Chaque fois que vous expirez, la vague repart vers l'océan, emportant avec elle toute anxiété, toute tension, toute peur.

Inspirez... la vague de calme entre... Expirez... elle repart avec vos soucis.

Continuez ce mouvement naturel pendant quelques minutes. Vous n'avez rien à faire, nulle part où aller. Juste être ici, avec cette vague de calme.

Si des pensées anxieuses surgissent, accueillez-les comme des nuages dans le ciel. Elles passent. Elles ne sont pas vous. Laissez-les traverser sans vous y accrocher.

Revenez toujours à la vague. Inspirez le calme... expirez l'anxiété.

Prenez encore trois respirations profondes. Sentez votre corps plus léger, plus apaisé.

Quand vous êtes prêt, ouvrez doucement les yeux. Portez cette vague de calme avec vous dans votre journée.`,
  },
  {
    slug: 'espace-securisant',
    title: 'Mon espace sécurisant',
    subtitle: 'Créer un refuge intérieur contre la peur',
    description: 'Construisez mentalement un espace de sécurité absolue où vous pouvez vous réfugier en cas d\'anxiété intense. Une technique de visualisation puissante utilisée en thérapie EMDR.',
    categorySlug: 'anxiety',
    level: 'intermediate' as const,
    duration: 15,
    instructor: 'Dr. Claire Dubois',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: false,
    sortOrder: 2,
    coverColor: '#3B82F6',
    tags: JSON.stringify(['anxiété', 'visualisation', 'sécurité', 'EMDR']),
    scriptText: `Fermez les yeux et prenez trois respirations profondes.

Je vais vous guider pour créer votre espace sécurisant personnel. Un endroit qui n'existe que pour vous, où vous êtes en sécurité absolue.

Imaginez un lieu... Il peut être réel ou imaginaire. Une plage déserte, une forêt enchantée, une chambre douillette, une montagne paisible, ou tout autre endroit où vous vous sentez complètement en sécurité.

Prenez le temps de construire cet espace dans votre esprit. Que voyez-vous autour de vous ? Quelles couleurs, quelles formes, quelle lumière ?

Que entendez-vous dans cet espace ? Peut-être le silence, ou des sons apaisants de la nature, ou une musique douce.

Que ressentez-vous sur votre peau ? La chaleur du soleil, une brise légère, la douceur d'un tissu confortable.

Quelle est l'odeur de cet endroit ? Peut-être des fleurs, la mer, la terre après la pluie, ou un parfum qui vous est cher.

Maintenant, explorez cet espace. Marchez-y, touchez les éléments qui vous entourent. Sentez à quel point vous êtes en sécurité ici.

Personne ne peut entrer dans cet espace sans votre permission. Vous êtes le gardien de ce lieu. Ici, l'anxiété ne peut pas vous atteindre.

Asseyez-vous ou allongez-vous dans cet espace. Sentez le sol solide sous vous. Respirez l'air pur de cet endroit.

Mémorisez cette sensation de sécurité absolue. Vous pourrez revenir ici à tout moment, en fermant simplement les yeux et en respirant profondément.

Cet espace vous appartient. Il sera toujours là pour vous.

Prenez encore quelques respirations dans cet espace sécurisant... puis revenez doucement à la pièce où vous vous trouvez.`,
  },
  {
    slug: 'ancrage-5-sens',
    title: 'Ancrage par les 5 sens',
    subtitle: 'Technique 5-4-3-2-1 pour l\'anxiété',
    description: 'La technique d\'ancrage 5-4-3-2-1 est l\'une des méthodes les plus efficaces pour stopper une crise d\'anxiété en ramenant l\'attention dans le moment présent.',
    categorySlug: 'anxiety',
    level: 'beginner' as const,
    duration: 8,
    instructor: 'Sophie Martin',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: false,
    sortOrder: 3,
    coverColor: '#3B82F6',
    tags: JSON.stringify(['anxiété', 'ancrage', 'urgence', 'présent']),
    scriptText: `Cette méditation peut être pratiquée les yeux ouverts ou fermés, assis ou debout.

Respirez profondément. Nous allons utiliser vos 5 sens pour vous ancrer dans le moment présent.

CINQ choses que vous pouvez voir. Regardez autour de vous et nommez mentalement 5 choses : peut-être une fenêtre, une plante, vos mains, un livre, la lumière. Prenez le temps d'observer vraiment chaque chose.

QUATRE choses que vous pouvez toucher. Sentez le tissu de vos vêtements contre votre peau. La texture de la surface sur laquelle vous êtes assis. La température de l'air sur vos bras. Le sol sous vos pieds.

TROIS choses que vous pouvez entendre. Écoutez attentivement... peut-être votre propre respiration, un bruit extérieur, le silence lui-même. Nommez ces sons.

DEUX choses que vous pouvez sentir. Quelle odeur perçoit votre nez ? Peut-être l'air de la pièce, votre propre parfum, ou rien de particulier. Soyez curieux.

UNE chose que vous pouvez goûter. Quelle saveur reste dans votre bouche ? Peut-être rien, ou le goût d'une boisson récente.

Vous êtes ici. Maintenant. Dans ce moment précis.

L'anxiété parle du futur. Le présent est sûr.

Respirez. Vous êtes ancré.`,
  },

  // ── CONFIANCE EN SOI ─────────────────────────────────────
  {
    slug: 'guerrier-interieur',
    title: 'Le guerrier intérieur',
    subtitle: 'Éveiller la force et la confiance en soi',
    description: 'Connectez-vous à votre force intérieure et réveillez le guerrier bienveillant qui sommeille en vous. Une méditation puissante pour les moments de doute.',
    categorySlug: 'confidence',
    level: 'intermediate' as const,
    duration: 12,
    instructor: 'Marc Lefort',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    coverColor: '#F59E0B',
    tags: JSON.stringify(['confiance', 'force', 'estime', 'pouvoir personnel']),
    scriptText: `Asseyez-vous droit, les pieds à plat sur le sol. Sentez la connexion avec la terre.

Fermez les yeux et respirez profondément. Avec chaque inspiration, imaginez que vous respirez de la force. Avec chaque expiration, vous relâchez le doute.

Portez votre attention au centre de votre poitrine. Il y a là une flamme. Peut-être petite, peut-être vacillante, mais elle brûle. C'est votre feu intérieur, votre essence, votre force.

Avec chaque respiration, cette flamme grandit. Elle devient plus brillante, plus chaude, plus stable.

Maintenant, rappelez-vous un moment dans votre vie où vous avez été fort. Un moment où vous avez surmonté quelque chose de difficile. Un moment où vous avez été courageux, même si vous aviez peur.

Revivez ce moment. Sentez dans votre corps ce que vous ressentiez alors. Cette force était réelle. Elle est toujours en vous.

Répétez intérieurement : Je suis capable. Je suis fort. Je mérite d'être ici.

Imaginez maintenant une version de vous-même rayonnante de confiance. Vous vous tenez droit, le regard clair, le cœur ouvert. Cette version de vous existe. Elle vous attend.

Chaque jour, vous faites un pas vers cette version de vous-même.

Respirez cette confiance dans chaque cellule de votre corps. Laissez-la s'installer dans vos épaules, votre dos, votre regard.

Vous avez tout ce qu'il vous faut. La force est en vous.

Ouvrez doucement les yeux et portez cette flamme avec vous.`,
  },
  {
    slug: 'miroir-de-bienveillance',
    title: 'Le miroir de bienveillance',
    subtitle: 'Transformer le regard sur soi-même',
    description: 'Une méditation douce pour apprendre à se regarder avec les yeux de la bienveillance plutôt que du jugement. Idéale pour reconstruire l\'estime de soi.',
    categorySlug: 'confidence',
    level: 'beginner' as const,
    duration: 10,
    instructor: 'Dr. Claire Dubois',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: false,
    sortOrder: 2,
    coverColor: '#F59E0B',
    tags: JSON.stringify(['confiance', 'bienveillance', 'estime de soi', 'douceur']),
    scriptText: `Installez-vous confortablement et fermez les yeux.

Respirez doucement. Posez une main sur votre cœur. Sentez sa chaleur, son rythme régulier.

Je vais vous demander d'imaginer un miroir devant vous. Mais ce n'est pas un miroir ordinaire. C'est un miroir de bienveillance absolue.

Dans ce miroir, vous vous voyez tel que vous êtes vraiment, au-delà des critiques, au-delà des jugements, au-delà des comparaisons.

Regardez votre reflet avec curiosité et douceur. Qu'est-ce que vous voyez ?

Remarquez vos forces. Peut-être votre gentillesse. Votre intelligence. Votre créativité. Votre résilience. Votre sens de l'humour. Votre capacité à aimer.

Maintenant, pensez à quelqu'un que vous aimez profondément. Un ami, un enfant, un être cher. Comment vous parleriez-vous si vous étiez cet ami pour vous-même ?

Avec cette même douceur, dites-vous intérieurement : Tu fais de ton mieux. Tu es suffisant. Tu mérites d'être aimé.

Si une voix critique surgit, reconnaissez-la doucement : "Je t'entends, mais ce n'est pas toute la vérité."

Respirez dans cette bienveillance. Laissez-la s'installer dans votre corps comme une chaleur douce.

Vous n'avez pas besoin d'être parfait pour mériter d'être aimé. Vous l'êtes déjà.

Prenez trois respirations profondes dans cette vérité. Puis ouvrez doucement les yeux.`,
  },

  // ── GESTION DE LA DOULEUR ────────────────────────────────
  {
    slug: 'ocean-de-douceur',
    title: 'L\'océan de douceur',
    subtitle: 'Pleine conscience pour la douleur chronique',
    description: 'Cette méditation utilise des techniques de pleine conscience validées cliniquement pour modifier la relation à la douleur chronique, sans la nier mais en changeant sa perception.',
    categorySlug: 'pain',
    level: 'intermediate' as const,
    duration: 20,
    instructor: 'Dr. Claire Dubois',
    language: 'fr',
    isPremium: true,
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    coverColor: '#6366F1',
    tags: JSON.stringify(['douleur', 'chronique', 'MBSR', 'pleine conscience']),
    scriptText: `Trouvez une position aussi confortable que possible. Vous n'avez pas besoin d'être sans douleur pour commencer cette méditation.

Fermez les yeux. Respirez naturellement.

La douleur est là. Nous n'allons pas l'ignorer. Nous allons simplement changer notre relation avec elle.

Imaginez que vous êtes au fond de l'océan. L'eau est calme, bleue, apaisante. Vous flottez sans effort. La pression de l'eau enveloppe votre corps avec douceur.

Maintenant, portez votre attention vers la zone douloureuse. Sans jugement, sans résistance. Juste observer.

Quelle est la texture de cette douleur ? Est-elle aiguë ou sourde ? Pulsante ou constante ? Est-elle grande ou petite ? A-t-elle une couleur ?

Vous n'avez pas à aimer cette douleur. Mais pouvez-vous simplement l'observer, comme vous observeriez un nuage dans le ciel ?

Maintenant, imaginez que l'eau de l'océan est une lumière bleue apaisante. Cette lumière enveloppe doucement la zone douloureuse. Elle ne supprime pas la douleur, mais elle l'adoucit, comme une main bienveillante posée sur une blessure.

Respirez dans cette lumière bleue. Avec chaque inspiration, elle pénètre plus profondément. Avec chaque expiration, elle emporte un peu de la tension autour de la douleur.

La douleur n'est pas vous. C'est une sensation dans votre corps. Vous êtes plus grand que cette sensation.

Continuez à respirer, à observer, à laisser la lumière bleue faire son travail.

Prenez le temps qu'il vous faut. Puis revenez doucement.`,
  },
  {
    slug: 'detente-progressive',
    title: 'Détente musculaire progressive',
    subtitle: 'Relâcher les tensions physiques profondément',
    description: 'La relaxation musculaire progressive de Jacobson est une technique cliniquement prouvée pour réduire la tension musculaire, la douleur et le stress. Cette version guidée vous emmène dans un voyage de détente totale.',
    categorySlug: 'pain',
    level: 'beginner' as const,
    duration: 18,
    instructor: 'Sophie Martin',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: false,
    sortOrder: 2,
    coverColor: '#6366F1',
    tags: JSON.stringify(['douleur', 'tension', 'relaxation', 'Jacobson']),
    scriptText: `Allongez-vous sur le dos dans une position confortable. Fermez les yeux.

Nous allons parcourir votre corps de la tête aux pieds, en contractant puis en relâchant chaque groupe musculaire. Cela permet au corps d'apprendre la différence entre tension et détente.

Commençons par le visage. Contractez tous les muscles de votre visage : plissez les yeux, serrez les mâchoires, froncez le front. Tenez 5 secondes... et relâchez complètement. Sentez la différence.

Les épaules. Remontez-les vers vos oreilles, aussi haut que possible. Tenez... et laissez tomber. Sentez le poids de vos épaules qui s'enfonce dans le sol.

Les bras. Serrez les poings, contractez les avant-bras et les biceps. Tenez... et relâchez. Vos bras sont lourds, détendus.

La poitrine et le dos. Inspirez profondément, gonflez la poitrine, contractez les muscles du dos. Tenez... et expirez complètement. Votre dos s'enfonce dans le sol.

Le ventre. Contractez les abdominaux, rentrez le nombril. Tenez... et relâchez. Votre ventre est mou, détendu.

Les fessiers et les cuisses. Contractez-les fortement. Tenez... et relâchez.

Les mollets. Pointez les pieds vers vous, contractez. Tenez... et relâchez.

Les pieds. Recroquevillez les orteils. Tenez... et relâchez.

Maintenant, votre corps entier est détendu. Scannez-le mentalement de la tête aux pieds. S'il reste des zones de tension, respirez-y doucement.

Restez dans cet état de détente aussi longtemps que vous le souhaitez.`,
  },

  // ── CRÉATIVITÉ & INSPIRATION ─────────────────────────────
  {
    slug: 'source-creative',
    title: 'La source créative',
    subtitle: 'Débloquer l\'inspiration et la créativité',
    description: 'Plongez dans les profondeurs de votre imagination pour libérer votre potentiel créatif. Cette méditation utilise la visualisation pour accéder à des états de conscience propices à la créativité.',
    categorySlug: 'creativity',
    level: 'intermediate' as const,
    duration: 15,
    instructor: 'Marc Lefort',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    coverColor: '#EC4899',
    tags: JSON.stringify(['créativité', 'inspiration', 'imagination', 'artiste']),
    scriptText: `Installez-vous confortablement. Prenez quelques respirations profondes.

Imaginez que vous descendez un escalier en spirale. Chaque marche vous emmène plus profondément dans votre esprit créatif. Dix... neuf... huit... vous descendez de plus en plus profond... sept... six... cinq... quatre... trois... deux... un.

Vous arrivez devant une porte. Cette porte est unique, elle reflète votre personnalité. De quelle couleur est-elle ? Quelle est sa forme ?

Ouvrez cette porte. Derrière elle se trouve votre espace créatif intérieur.

Qu'est-ce que vous voyez ? Laissez votre imagination libre. Il n'y a pas de bonne ou mauvaise réponse.

Dans cet espace, il y a une source. Une source lumineuse d'où jaillit l'inspiration pure. Elle peut être un puits de lumière, une fontaine, un feu, une rivière... Quelle forme prend-elle pour vous ?

Approchez-vous de cette source. Sentez son énergie créatrice. Elle est inépuisable. Elle est toujours là pour vous.

Plongez vos mains dans cette source. Laissez l'énergie créatrice monter dans vos bras, votre poitrine, votre esprit.

Maintenant, pensez à votre projet créatif actuel. Ou si vous n'en avez pas, pensez à quelque chose que vous aimeriez créer. Posez cette intention dans la source.

Observez ce qui émerge. Des images, des couleurs, des sons, des idées. Ne les jugez pas. Laissez-les simplement apparaître.

Ces idées sont vôtres. Elles viennent de votre source intérieure unique.

Avant de remonter, remerciez cette source. Elle sera toujours là pour vous.

Remontez l'escalier en spirale. Un... deux... trois... et revenez dans la pièce, portant vos idées avec vous.`,
  },
  {
    slug: 'ecriture-automatique-guidee',
    title: 'Écriture automatique guidée',
    subtitle: 'Libérer l\'expression créative intérieure',
    description: 'Une méditation unique qui combine pleine conscience et écriture automatique pour libérer votre expression créative la plus profonde et authentique.',
    categorySlug: 'creativity',
    level: 'advanced' as const,
    duration: 20,
    instructor: 'Dr. Claire Dubois',
    language: 'fr',
    isPremium: true,
    isActive: true,
    isFeatured: false,
    sortOrder: 2,
    coverColor: '#EC4899',
    tags: JSON.stringify(['créativité', 'écriture', 'expression', 'avancé']),
    scriptText: `Avant de commencer, préparez un carnet et un stylo à portée de main.

Fermez les yeux. Respirez profondément trois fois.

Nous allons plonger dans votre inconscient créatif. L'écriture automatique est une technique utilisée par les surréalistes et les thérapeutes pour accéder à des couches profondes de la créativité.

Imaginez que votre esprit conscient s'efface doucement. Les filtres, les jugements, les censures disparaissent. Ce qui reste, c'est votre voix la plus authentique.

Posez-vous cette question intérieure : "Qu'est-ce qui cherche à s'exprimer à travers moi en ce moment ?"

Laissez la réponse émerger. Ne cherchez pas. Attendez. Observez.

Des mots, des images, des émotions peuvent surgir. Accueillez-les sans jugement.

Maintenant, ouvrez les yeux et écrivez pendant 5 minutes sans vous arrêter. N'éditez pas. N'effacez pas. Laissez couler ce qui vient, même si cela semble incohérent.

[Pause de 5 minutes pour l'écriture]

Refermez les yeux. Respirez.

Relisez ce que vous avez écrit avec les yeux de la bienveillance. Il y a là quelque chose de vrai, quelque chose d'unique, quelque chose qui vous appartient.

C'est votre voix créatrice. Elle a toujours été là.`,
  },

  // ── RELATIONS & CONNEXION ────────────────────────────────
  {
    slug: 'metta-amour-universel',
    title: 'Metta : l\'amour universel',
    subtitle: 'Méditation bouddhiste de l\'amour bienveillant',
    description: 'La méditation Metta (amour bienveillant) est une pratique bouddhiste millénaire qui cultive la compassion envers soi-même et les autres. Des études montrent qu\'elle réduit les conflits et améliore les relations.',
    categorySlug: 'relationships',
    level: 'beginner' as const,
    duration: 15,
    instructor: 'Sophie Martin',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    coverColor: '#EF4444',
    tags: JSON.stringify(['relations', 'compassion', 'amour', 'bouddhisme', 'Metta']),
    scriptText: `Asseyez-vous confortablement, les yeux fermés. Respirez naturellement.

La méditation Metta commence toujours par soi-même, car on ne peut donner ce qu'on n'a pas.

Portez votre attention sur votre cœur. Imaginez une lumière chaude et dorée qui rayonne depuis votre centre.

Répétez ces phrases pour vous-même, en les ressentant vraiment :
"Que je sois heureux."
"Que je sois en bonne santé."
"Que je sois en sécurité."
"Que je vive dans la paix."

Laissez ces mots résonner. Vous méritez ces souhaits autant que n'importe qui.

Maintenant, pensez à quelqu'un que vous aimez profondément. Visualisez son visage souriant. Envoyez-lui cette même lumière dorée depuis votre cœur.

"Que tu sois heureux."
"Que tu sois en bonne santé."
"Que tu sois en sécurité."
"Que tu vives dans la paix."

Élargissez maintenant ce cercle à vos amis, votre famille, vos collègues.

Puis à des personnes neutres, des inconnus que vous croisez dans la rue.

Puis, si vous vous en sentez capable, à quelqu'un avec qui vous avez des difficultés. Pas pour excuser, mais pour libérer votre propre cœur.

Enfin, envoyez cet amour à tous les êtres vivants, partout dans le monde.

"Que tous les êtres soient heureux."
"Que tous les êtres soient en paix."

Respirez dans cet amour universel. Vous en faites partie.`,
  },
  {
    slug: 'communication-consciente',
    title: 'Communication consciente',
    subtitle: 'Écouter et parler avec le cœur',
    description: 'Préparez-vous à une conversation difficile ou améliorez votre communication quotidienne avec cette méditation qui développe l\'écoute profonde et l\'expression authentique.',
    categorySlug: 'relationships',
    level: 'intermediate' as const,
    duration: 12,
    instructor: 'Dr. Claire Dubois',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: false,
    sortOrder: 2,
    coverColor: '#EF4444',
    tags: JSON.stringify(['relations', 'communication', 'écoute', 'CNV']),
    scriptText: `Fermez les yeux. Respirez profondément.

Cette méditation vous prépare à communiquer depuis votre cœur plutôt que depuis votre ego.

Pensez à une relation importante dans votre vie. Ou à une conversation à venir.

Commencez par vous centrer. Respirez dans votre cœur. Sentez-le s'ouvrir.

Maintenant, imaginez la personne avec qui vous souhaitez mieux communiquer. Visualisez-la devant vous.

Regardez-la vraiment. Au-delà de vos jugements, de vos attentes, de vos blessures. Voyez en elle un être humain qui, comme vous, cherche à être compris, aimé, respecté.

Posez-vous cette question : "Qu'est-ce que cette personne essaie vraiment de me dire, au-delà des mots ?"

Écoutez avec votre cœur. Pas pour répondre, pas pour défendre, juste pour comprendre.

Maintenant, pensez à ce que vous voulez lui dire. Pas ce que vous pensez devoir dire, mais ce que vous ressentez vraiment.

Quelle est votre besoin profond dans cette relation ? Peut-être d'être entendu, respecté, aimé, reconnu ?

Imaginez exprimer ce besoin avec douceur et clarté : "Quand... je ressens... parce que j'ai besoin de..."

La communication consciente commence par la conscience de soi.

Respirez. Votre cœur sait comment parler et écouter. Faites-lui confiance.`,
  },

  // ── STRESS AU TRAVAIL ────────────────────────────────────
  {
    slug: 'decompression-bureau',
    title: 'Décompression après le travail',
    subtitle: 'Transition entre le professionnel et le personnel',
    description: 'Cette méditation de 10 minutes crée une frontière mentale entre votre vie professionnelle et personnelle, vous aidant à "déconnecter" vraiment après le travail.',
    categorySlug: 'work-stress',
    level: 'beginner' as const,
    duration: 10,
    instructor: 'Marc Lefort',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    coverColor: '#8B5CF6',
    tags: JSON.stringify(['travail', 'décompression', 'frontière', 'soir']),
    scriptText: `Installez-vous confortablement. Vous venez de terminer votre journée de travail.

Fermez les yeux. Prenez trois grandes respirations. Avec chaque expiration, laissez partir la tension de la journée.

Imaginez que vous portez un sac à dos rempli des préoccupations de votre journée. Les emails non répondus, les réunions, les décisions, les collègues, les deadlines.

Maintenant, posez ce sac à dos. Sentez le soulagement dans vos épaules quand vous le déposez.

Vous n'avez pas à tout résoudre ce soir. Les problèmes du travail peuvent attendre demain matin. Ils seront encore là, mais vous, vous avez besoin de vous ressourcer.

Imaginez une porte. D'un côté, votre espace professionnel. De l'autre, votre espace personnel, votre foyer intérieur.

Franchissez cette porte. Fermez-la derrière vous. Vous êtes maintenant dans votre espace personnel.

Ici, vous n'êtes pas votre titre professionnel. Vous n'êtes pas vos responsabilités. Vous êtes simplement vous.

Respirez dans cet espace. Qu'est-ce qui vous nourrit vraiment ? Votre famille, vos amis, vos passions, votre corps, votre créativité ?

Donnez-vous la permission de vous consacrer à ces choses ce soir.

Prenez trois respirations profondes. Sentez la transition s'opérer.

Vous êtes chez vous. Le travail peut attendre.`,
  },
  {
    slug: 'pause-midi-ressourcante',
    title: 'Pause midi ressourçante',
    subtitle: 'Recharger les batteries en 7 minutes',
    description: 'Une méditation courte et efficace pour la pause déjeuner. Rechargez vos batteries mentales et émotionnelles pour aborder l\'après-midi avec clarté et énergie.',
    categorySlug: 'work-stress',
    level: 'beginner' as const,
    duration: 7,
    instructor: 'Sophie Martin',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: false,
    sortOrder: 2,
    coverColor: '#8B5CF6',
    tags: JSON.stringify(['travail', 'pause', 'midi', 'recharge', 'court']),
    scriptText: `Vous avez 7 minutes. C'est suffisant pour vous ressourcer vraiment.

Fermez les yeux ou baissez le regard. Respirez profondément.

Laissez partir la matinée. Elle est terminée. Vous avez fait ce que vous pouviez.

Scannez rapidement votre corps. Où est la tension ? Épaules, nuque, mâchoire ? Respirez dans ces zones et laissez-les se relâcher.

Maintenant, pensez à quelque chose de simple qui vous rend heureux. Un souvenir agréable, une personne que vous aimez, un endroit beau, un plaisir simple.

Laissez ce sentiment de bonheur simple s'installer dans votre corps. Il est réel. Il est disponible maintenant.

Respirez dans ce bonheur. Laissez-le recharger vos batteries.

Pour l'après-midi, choisissez une intention. Pas une liste de tâches, mais une qualité que vous voulez apporter : clarté, patience, créativité, présence.

Respirez cette intention.

Vous êtes prêt pour l'après-midi. Ouvrez les yeux.`,
  },
  {
    slug: 'burnout-prevention',
    title: 'Prévention du burnout',
    subtitle: 'Reconnaître et respecter ses limites',
    description: 'Une méditation de pleine conscience pour reconnaître les signes précoces d\'épuisement professionnel et cultiver une relation plus saine avec le travail.',
    categorySlug: 'work-stress',
    level: 'intermediate' as const,
    duration: 20,
    instructor: 'Dr. Claire Dubois',
    language: 'fr',
    isPremium: true,
    isActive: true,
    isFeatured: false,
    sortOrder: 3,
    coverColor: '#8B5CF6',
    tags: JSON.stringify(['travail', 'burnout', 'limites', 'prévention']),
    scriptText: `Trouvez un endroit calme. Fermez les yeux. Respirez profondément.

Cette méditation demande une honnêteté avec vous-même. Soyez doux dans cette exploration.

Commençons par un scan de votre niveau d'énergie. Sur une échelle de 1 à 10, où êtes-vous en ce moment ? Pas ce que vous devriez être, mais où vous êtes vraiment.

Maintenant, pensez à votre travail. Quand vous y pensez, qu'est-ce que vous ressentez dans votre corps ? De l'enthousiasme ? De la fatigue ? De l'anxiété ? De la résignation ?

Accueillez ces sensations sans jugement. Elles sont des informations précieuses.

Posez-vous ces questions honnêtement :
Est-ce que je me sens souvent épuisé, même après une bonne nuit de sommeil ?
Est-ce que je me sens de plus en plus cynique ou détaché de mon travail ?
Est-ce que j'ai du mal à me concentrer ou à prendre des décisions ?
Est-ce que je néglige ma santé, mes relations, mes loisirs à cause du travail ?

Si vous avez répondu oui à plusieurs de ces questions, votre corps vous envoie un message important.

Respirez profondément. Vous n'êtes pas faible. Vous êtes humain.

Imaginez votre énergie comme une batterie. Elle a besoin d'être rechargée régulièrement. Quelles sont vos sources de recharge ? Sommeil, nature, connexion, créativité, mouvement ?

Engagez-vous envers vous-même à protéger au moins une source de recharge cette semaine.

Vous méritez de prendre soin de vous. Votre valeur ne se mesure pas à votre productivité.

Respirez dans cette vérité.`,
  },

  // ── DEUIL & PERTE ────────────────────────────────────────
  {
    slug: 'tenir-et-lacher',
    title: 'Tenir et lâcher',
    subtitle: 'Accompagnement doux pour le deuil',
    description: 'Une méditation douce et respectueuse pour ceux qui traversent une période de deuil ou de perte. Elle honore la douleur tout en ouvrant doucement vers la guérison.',
    categorySlug: 'grief',
    level: 'beginner' as const,
    duration: 20,
    instructor: 'Dr. Claire Dubois',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    coverColor: '#64748B',
    tags: JSON.stringify(['deuil', 'perte', 'guérison', 'compassion']),
    scriptText: `Trouvez une position confortable. Vous n'avez pas besoin d'être fort ici.

Fermez les yeux. Respirez doucement.

Je veux commencer par vous dire : votre douleur est réelle. Elle est valide. Le deuil est l'expression de l'amour qui n'a plus d'endroit où aller.

Posez une main sur votre cœur. Sentez sa chaleur.

Permettez-vous de ressentir ce que vous ressentez. Pas besoin de le contrôler, de le gérer, d'être courageux. Juste être avec ce qui est.

Si des larmes viennent, laissez-les. Les larmes sont une forme de prière.

Pensez à ce que vous avez perdu. Ou à qui vous avez perdu. Permettez-vous de les tenir dans votre cœur un moment.

Qu'est-ce que vous aimez en eux ? Qu'est-ce qu'ils vous ont apporté ? Quel vide ont-ils laissé ?

Honorez cette perte. Elle mérite d'être honorée.

Maintenant, imaginez que la personne ou la chose que vous avez perdue vous dit : "Je veux que tu sois heureux. Je veux que tu continues à vivre pleinement."

Pouvez-vous recevoir ce message ?

Le deuil n'est pas une trahison de l'amour. Guérir n'est pas oublier. Vous pouvez porter leur mémoire dans votre cœur tout en continuant à vivre.

Respirez doucement. Tenez ce qui doit être tenu. Lâchez ce qui peut être lâché.

Vous n'avez pas à tout faire aujourd'hui. Le deuil prend le temps qu'il prend.

Soyez doux avec vous-même.`,
  },

  // ── ÉNERGIE & VITALITÉ ───────────────────────────────────
  {
    slug: 'reveil-energetique',
    title: 'Réveil énergétique',
    subtitle: 'Activer l\'énergie vitale du matin',
    description: 'Démarrez votre journée avec une énergie naturelle et durable. Cette méditation combine respiration activante, visualisation et affirmations pour vous propulser dans votre journée.',
    categorySlug: 'energy',
    level: 'beginner' as const,
    duration: 8,
    instructor: 'Marc Lefort',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    coverColor: '#EAB308',
    tags: JSON.stringify(['énergie', 'matin', 'vitalité', 'activation']),
    scriptText: `Asseyez-vous droit sur le bord de votre lit ou sur une chaise. Sentez vos pieds sur le sol.

Ouvrez les yeux à mi-chemin ou gardez-les fermés. Respirez profondément.

Nous allons activer votre énergie vitale.

Commencez par la respiration du feu : inspirez normalement, puis expirez rapidement et fortement par le nez, comme si vous souffliez une bougie. Répétez 10 fois rapidement.

Sentez l'énergie qui monte dans votre corps.

Maintenant, imaginez le soleil qui se lève à l'horizon. Ses premiers rayons dorés touchent votre peau. Chaque rayon est de l'énergie pure.

Inspirez ces rayons de soleil. Sentez-les descendre dans vos poumons, se répandre dans votre sang, atteindre chaque cellule de votre corps.

Vos cellules s'éveillent. Votre corps se réchauffe. Votre esprit s'éclaircit.

Répétez intérieurement : Je suis plein d'énergie. Mon corps est fort et vital. Je suis prêt pour cette journée.

Bougez légèrement vos doigts, vos orteils. Faites tourner vos épaules. Sentez votre corps vivant et prêt.

Aujourd'hui, vous avez tout ce qu'il vous faut pour accomplir ce qui compte vraiment.

Ouvrez les yeux. Bonne journée !`,
  },
  {
    slug: 'recharge-rapide',
    title: 'Recharge rapide',
    subtitle: 'Récupérer de l\'énergie en 5 minutes',
    description: 'Quand vous avez besoin d\'un coup de boost rapide, cette méditation de 5 minutes utilise des techniques de respiration et de visualisation pour restaurer votre énergie instantanément.',
    categorySlug: 'energy',
    level: 'beginner' as const,
    duration: 5,
    instructor: 'Sophie Martin',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: false,
    sortOrder: 2,
    coverColor: '#EAB308',
    tags: JSON.stringify(['énergie', 'court', 'recharge', 'boost']),
    scriptText: `5 minutes. C'est tout ce qu'il faut.

Fermez les yeux. Respirez profondément trois fois.

Imaginez une source d'énergie lumineuse juste au-dessus de votre tête. Elle peut être dorée, blanche, ou de n'importe quelle couleur qui vous semble énergisante.

Avec chaque inspiration, cette lumière descend dans votre corps. Elle remplit votre tête d'abord, chassant la fatigue mentale. Puis votre poitrine, redonnant de la légèreté à votre cœur. Puis votre ventre, restaurant votre énergie vitale.

Sentez votre corps se remplir de cette lumière.

Maintenant, pensez à quelque chose qui vous donne de l'énergie. Une activité que vous aimez, une personne qui vous inspire, un objectif qui vous enthousiasme.

Laissez cet enthousiasme circuler dans votre corps.

Vous êtes rechargé. Prêt.

Ouvrez les yeux.`,
  },

  // ── PARDON & LÂCHER-PRISE ────────────────────────────────
  {
    slug: 'ho-oponopono',
    title: 'Ho\'oponopono : la guérison par le pardon',
    subtitle: 'Pratique hawaïenne de réconciliation',
    description: 'Ho\'oponopono est une pratique hawaïenne ancienne de réconciliation et de pardon. Cette méditation utilise quatre phrases simples mais profondes pour libérer les rancœurs et retrouver la paix.',
    categorySlug: 'forgiveness',
    level: 'beginner' as const,
    duration: 15,
    instructor: 'Sophie Martin',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    coverColor: '#F472B6',
    tags: JSON.stringify(['pardon', 'lâcher-prise', 'Ho\'oponopono', 'réconciliation']),
    scriptText: `Installez-vous confortablement. Fermez les yeux. Respirez doucement.

Ho'oponopono est une pratique hawaïenne qui utilise quatre phrases pour nettoyer les blessures émotionnelles et restaurer l'harmonie.

Ces quatre phrases sont : Je suis désolé. Pardonne-moi. Merci. Je t'aime.

Elles ne s'adressent pas nécessairement à une personne spécifique, mais à la partie de vous-même qui porte la blessure.

Pensez à quelque chose ou quelqu'un qui vous cause de la douleur. Cela peut être une personne, une situation, une partie de vous-même.

Respirez profondément. Et répétez intérieurement :

"Je suis désolé." Pour la souffrance que cette situation a créée. Pour les moments où vous n'avez pas su mieux faire.

"Pardonne-moi." Demandez le pardon, non pas par culpabilité, mais pour libérer le nœud dans votre cœur.

"Merci." Merci pour les leçons. Merci pour la croissance. Merci pour ce que cette expérience vous a appris sur vous-même.

"Je t'aime." Envoyez de l'amour à cette personne, à cette situation, à vous-même. Pas parce que c'est facile, mais parce que l'amour est plus léger que la rancœur.

Répétez ces quatre phrases plusieurs fois, en les ressentant vraiment.

Je suis désolé. Pardonne-moi. Merci. Je t'aime.

Sentez quelque chose se détendre dans votre poitrine. Le pardon n'est pas pour l'autre. Il est pour vous.

Respirez dans cette liberté.`,
  },
  {
    slug: 'lettre-de-pardon',
    title: 'La lettre de pardon',
    subtitle: 'Libérer les rancœurs par l\'écriture intérieure',
    description: 'Une méditation guidée qui vous accompagne dans l\'écriture intérieure d\'une lettre de pardon, pour libérer les émotions bloquées sans nécessairement envoyer la lettre.',
    categorySlug: 'forgiveness',
    level: 'intermediate' as const,
    duration: 25,
    instructor: 'Dr. Claire Dubois',
    language: 'fr',
    isPremium: true,
    isActive: true,
    isFeatured: false,
    sortOrder: 2,
    coverColor: '#F472B6',
    tags: JSON.stringify(['pardon', 'écriture', 'libération', 'thérapie']),
    scriptText: `Préparez un carnet si vous le souhaitez, mais ce n'est pas obligatoire. Cette lettre peut rester dans votre cœur.

Fermez les yeux. Respirez profondément.

Pensez à quelqu'un envers qui vous portez de la rancœur, de la colère, ou de la douleur. Cela peut être une personne qui vous a blessé, ou vous-même.

Nous allons écrire une lettre. Pas pour l'envoyer nécessairement, mais pour vous libérer.

Commencez par reconnaître la blessure : "Tu m'as blessé quand..." Laissez les mots venir. Ne les censurez pas. La colère est valide. La douleur est réelle.

Maintenant, explorez l'impact : "Cela m'a affecté en..." Comment cette blessure a-t-elle changé votre vie, vos relations, votre façon de vous voir ?

Puis, cherchez à comprendre, sans excuser : "Je me demande si tu as agi ainsi parce que..." Peut-être que cette personne portait ses propres blessures. Comprendre n'est pas pardonner, mais c'est un premier pas.

Enfin, si vous vous en sentez capable, écrivez : "Je choisis de te pardonner, non pour toi, mais pour me libérer moi-même."

Le pardon est un acte de courage. Il ne signifie pas que ce qui s'est passé était acceptable. Il signifie que vous choisissez de ne plus laisser cette blessure gouverner votre vie.

Respirez profondément. Sentez le poids qui se lève.

Vous méritez d'être libre.`,
  },

  // ── INTUITION & SAGESSE ──────────────────────────────────
  {
    slug: 'voix-interieure',
    title: 'La voix intérieure',
    subtitle: 'Écouter sa sagesse profonde',
    description: 'Apprenez à distinguer la voix de votre intuition de celle de vos peurs et de votre ego. Une méditation pour développer votre sagesse intérieure et prendre des décisions alignées.',
    categorySlug: 'intuition',
    level: 'intermediate' as const,
    duration: 18,
    instructor: 'Marc Lefort',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    coverColor: '#7C3AED',
    tags: JSON.stringify(['intuition', 'sagesse', 'décision', 'intérieur']),
    scriptText: `Installez-vous dans un endroit calme. Fermez les yeux. Respirez profondément.

Nous avons tous en nous une voix de sagesse. Elle parle doucement, sans urgence, sans peur. Elle est différente de la voix de l'ego qui crie, qui juge, qui a peur.

Pour accéder à cette voix, nous devons d'abord faire silence.

Respirez profondément. Avec chaque expiration, laissez partir les pensées parasites. Les "je dois", les "et si", les "mais".

Imaginez que vous descendez dans les profondeurs d'un lac calme. En surface, l'eau est agitée par le vent. Mais en profondeur, tout est calme, clair, immobile.

Descendez jusqu'au fond de ce lac. Ici, il n'y a que le silence et la clarté.

Posez-vous une question. Peut-être une décision que vous devez prendre, une direction à choisir, une vérité que vous cherchez.

Posez cette question dans le silence. Puis attendez. Ne cherchez pas la réponse. Laissez-la venir.

L'intuition ne crie pas. Elle murmure. Elle peut venir comme une image, un sentiment dans le corps, une certitude calme.

Si rien ne vient, c'est normal. Parfois l'intuition parle plus tard, dans un rêve, sous la douche, en marchant.

Mais notez ce que vous ressentez maintenant. Une légèreté ou une lourdeur ? Une ouverture ou une fermeture ?

Votre corps sait souvent avant votre esprit.

Revenez doucement à la surface. Portez avec vous ce que vous avez trouvé.`,
  },

  // ── NATURE & CONNEXION ───────────────────────────────────
  {
    slug: 'foret-de-guerison',
    title: 'La forêt de guérison',
    subtitle: 'Bain de forêt guidé (Shinrin-yoku)',
    description: 'Le Shinrin-yoku (bain de forêt) est une pratique japonaise dont les bienfaits sont scientifiquement prouvés : réduction du cortisol, amélioration de l\'immunité, diminution de l\'anxiété. Vivez-le en méditation.',
    categorySlug: 'nature',
    level: 'beginner' as const,
    duration: 20,
    instructor: 'Sophie Martin',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    coverColor: '#16A34A',
    tags: JSON.stringify(['nature', 'forêt', 'Shinrin-yoku', 'guérison']),
    scriptText: `Fermez les yeux. Respirez profondément.

Je vais vous emmener dans une forêt ancienne. Une forêt de guérison.

Imaginez que vous entrez dans cette forêt. Les arbres sont immenses, leurs troncs couverts de mousse. La lumière filtre à travers les feuilles en rayons dorés.

L'air est frais, chargé d'oxygène et de phytoncides, ces molécules libérées par les arbres qui renforcent notre système immunitaire.

Respirez profondément cet air de forêt. Sentez-le descendre dans vos poumons, se répandre dans votre sang.

Sous vos pieds, le sol est recouvert de feuilles mortes et de mousse. Chaque pas est amorti, silencieux.

Écoutez les sons de la forêt. Le vent dans les feuilles... les oiseaux qui chantent au loin... peut-être le murmure d'un ruisseau.

Posez votre main sur l'écorce d'un arbre. Sentez sa texture rugueuse, sa solidité. Cet arbre a peut-être des centaines d'années. Il a traversé des tempêtes et des sécheresses. Il est toujours là, enraciné, fort.

Imaginez que vous pouvez absorber un peu de cette force et de cette stabilité.

Continuez à marcher lentement dans la forêt. Il n'y a nulle part où aller. Juste être ici.

Trouvez un endroit pour vous asseoir. Peut-être au pied d'un grand arbre, ou sur un rocher près d'un ruisseau.

Restez simplement là. Laissez la forêt vous envelopper de sa présence apaisante.

Les arbres ne jugent pas. Ils accueillent tout le monde.

Respirez la forêt. Laissez-la vous guérir.

Quand vous êtes prêt, remerciez la forêt et revenez doucement.`,
  },
  {
    slug: 'plage-au-clair-de-lune',
    title: 'Plage au clair de lune',
    subtitle: 'Voyage nocturne au bord de l\'eau',
    description: 'Une méditation nocturne apaisante pour se préparer au sommeil. Laissez le son des vagues et la lumière de la lune vous bercer vers un repos profond.',
    categorySlug: 'nature',
    level: 'beginner' as const,
    duration: 15,
    instructor: 'Sophie Martin',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: false,
    sortOrder: 2,
    coverColor: '#16A34A',
    tags: JSON.stringify(['nature', 'plage', 'lune', 'sommeil', 'nuit']),
    scriptText: `Allongez-vous confortablement. Fermez les yeux.

Il est nuit. La lune est pleine et brillante dans le ciel étoilé.

Vous vous trouvez sur une plage déserte. Le sable est doux et encore chaud de la journée. Vous vous allongez dessus.

Au-dessus de vous, le ciel est d'un noir profond, parsemé d'étoiles innombrables. La lune projette une lumière argentée sur l'océan.

Écoutez les vagues. Elles arrivent doucement, se brisent sur le sable avec un doux soupir, puis se retirent. Chaque vague est comme une respiration de l'océan.

Synchronisez votre respiration avec les vagues. Inspirez quand la vague arrive... expirez quand elle se retire.

Sentez le sable sous votre dos. Il vous soutient complètement. Vous n'avez pas besoin de tenir quoi que ce soit. Laissez-vous aller.

La lumière de la lune descend sur vous comme une couverture argentée. Elle est douce, fraîche, apaisante.

Regardez les étoiles. Chacune est un soleil lointain. Vous êtes une petite partie de cet univers immense. Vos soucis, dans cette perspective, sont minuscules.

Respirez. Vague après vague.

Votre corps devient lourd, détendu. Vos pensées ralentissent comme les vagues qui s'apaisent.

Vous êtes en sécurité. Vous êtes soutenu. Vous pouvez vous reposer.

Laissez le son des vagues vous bercer vers le sommeil.`,
  },

  // ── MÉDITATIONS POUR ENFANTS ─────────────────────────────
  {
    slug: 'nuage-magique',
    title: 'Le nuage magique',
    subtitle: 'Méditation pour enfants 4-8 ans',
    description: 'Une méditation douce et imaginative pour aider les enfants à se calmer, gérer leurs émotions et s\'endormir paisiblement. Adaptée aux enfants de 4 à 8 ans.',
    categorySlug: 'children',
    level: 'beginner' as const,
    duration: 10,
    instructor: 'Sophie Martin',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    coverColor: '#06B6D4',
    tags: JSON.stringify(['enfants', 'sommeil', 'calme', 'imagination']),
    scriptText: `[À lire à voix haute à l'enfant, doucement]

Installe-toi confortablement, mon petit. Ferme les yeux.

Respire profondément... et souffle doucement. Encore une fois... et souffle.

Imagine qu'il y a un nuage magique juste au-dessus de toi. Il est doux comme du coton, blanc comme la neige, et il brille d'une lumière dorée.

Ce nuage magique peut emporter toutes tes inquiétudes, toutes tes peurs, tout ce qui te tracasse.

Si tu as quelque chose qui te préoccupe, mets-le sur le nuage. Il va s'en occuper pour toi.

Le nuage s'élève doucement dans le ciel... plus haut... plus haut... jusqu'à disparaître parmi les étoiles.

Maintenant, tu te sens plus léger, n'est-ce pas ?

Imagine que tu flottes sur un nuage tout doux. Il te porte doucement. Tu es en sécurité.

Les étoiles brillent autour de toi. Elles te font des petits clins d'œil.

Ta tête est lourde... tes bras sont lourds... tes jambes sont lourdes...

Tu flottes... tu flottes... tu t'endors...

Bonne nuit, mon petit.`,
  },
  {
    slug: 'respiration-des-animaux',
    title: 'La respiration des animaux',
    subtitle: 'Exercices de respiration amusants pour enfants',
    description: 'Des exercices de respiration ludiques inspirés des animaux pour aider les enfants à gérer leurs émotions et à se calmer. Parfait pour les moments de colère ou d\'anxiété.',
    categorySlug: 'children',
    level: 'beginner' as const,
    duration: 8,
    instructor: 'Marc Lefort',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: false,
    sortOrder: 2,
    coverColor: '#06B6D4',
    tags: JSON.stringify(['enfants', 'respiration', 'émotions', 'amusant']),
    scriptText: `[À pratiquer avec l'enfant, en faisant les gestes ensemble]

Bonjour ! Aujourd'hui, on va apprendre à respirer comme différents animaux. C'est amusant et ça aide à se sentir mieux quand on est énervé ou triste.

Prêt ? Allons-y !

LA RESPIRATION DU LION 🦁
Inspire profondément par le nez... et expire en faisant "HAAAA" avec la bouche grande ouverte et la langue sortie ! Comme un lion qui rugit. Encore une fois ! C'est pour quand tu es très en colère.

LA RESPIRATION DU SERPENT 🐍
Inspire doucement par le nez... et expire lentement en faisant "ssssss" comme un serpent. Très lentement. C'est pour se calmer.

LA RESPIRATION DE L'OURS 🐻
Inspire en gonflant ton ventre comme un gros ours... tiens... et expire en dégonflant ton ventre. Ton ventre monte et descend comme un ballon.

LA RESPIRATION DU PAPILLON 🦋
Étire tes bras comme des ailes de papillon. Inspire en levant les bras... et expire en les abaissant. Doucement, comme un papillon qui vole.

LA RESPIRATION DE L'ÉTOILE DE MER ⭐
Écarte les doigts d'une main. Avec l'index de l'autre main, remonte le long de chaque doigt en inspirant, et redescends en expirant. Fais-le pour les 5 doigts.

Bravo ! Tu connais maintenant 5 façons de respirer. Quand tu te sens pas bien, choisis celle que tu préfères !`,
  },

  // ── MÉDITATIONS SUPPLÉMENTAIRES (catégories existantes) ──

  // Stress & Anxiété (existant, nouvelles méditations)
  {
    slug: 'tapping-eft',
    title: 'Tapping EFT anti-stress',
    subtitle: 'Libérer le stress par les points d\'acupression',
    description: 'L\'EFT (Emotional Freedom Techniques) combine la stimulation de points d\'acupression avec des affirmations positives pour libérer rapidement le stress et les émotions bloquées.',
    categorySlug: 'stress',
    level: 'beginner' as const,
    duration: 12,
    instructor: 'Dr. Claire Dubois',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: false,
    sortOrder: 10,
    coverColor: '#1E3A5F',
    tags: JSON.stringify(['stress', 'EFT', 'tapping', 'acupression']),
    scriptText: `Asseyez-vous confortablement. Nous allons pratiquer le tapping EFT.

Commencez par évaluer votre niveau de stress sur 10. Notez ce chiffre mentalement.

Le tapping EFT consiste à tapoter doucement des points spécifiques du corps en répétant des phrases.

POINT DE KARATÉ (côté de la main) : Tapotez ce point et répétez 3 fois : "Même si je me sens stressé, je m'accepte profondément et complètement."

SOMMET DE LA TÊTE : Tapotez et dites : "Ce stress..."

SOURCIL (début du sourcil) : "Cette tension..."

COIN DE L'ŒIL : "Cette anxiété..."

SOUS L'ŒIL : "Je la ressens dans mon corps..."

SOUS LE NEZ : "Elle est là..."

MENTON : "Mais je suis en sécurité..."

CLAVICULE : "Je peux la relâcher..."

SOUS LE BRAS : "Je choisis de me calmer..."

SOMMET DE LA TÊTE : "Je suis en paix."

Respirez profondément. Réévaluez votre stress sur 10. Il devrait avoir diminué.

Répétez le cycle si nécessaire.`,
  },

  // Sommeil (existant, nouvelles méditations)
  {
    slug: 'yoga-nidra-profond',
    title: 'Yoga Nidra profond',
    subtitle: 'Le sommeil yogique pour une récupération totale',
    description: 'Le Yoga Nidra est une technique de relaxation profonde qui permet d\'atteindre un état entre veille et sommeil. 30 minutes de Yoga Nidra équivalent à 2-3 heures de sommeil ordinaire.',
    categorySlug: 'sleep',
    level: 'intermediate' as const,
    duration: 30,
    instructor: 'Marc Lefort',
    language: 'fr',
    isPremium: true,
    isActive: true,
    isFeatured: true,
    sortOrder: 10,
    coverColor: '#1E1B4B',
    tags: JSON.stringify(['sommeil', 'yoga nidra', 'récupération', 'profond']),
    scriptText: `Allongez-vous sur le dos dans la position du cadavre (Savasana). Fermez les yeux.

Nous allons pratiquer le Yoga Nidra, le sommeil yogique. Restez éveillé, mais laissez votre corps dormir.

Prenez conscience de votre corps entier. Sentez le sol sous vous.

Formulez votre sankalpa (intention) : une résolution courte et positive. Répétez-la trois fois intérieurement avec conviction.

ROTATION DE LA CONSCIENCE :
Portez votre attention sur : le pouce droit... l'index droit... le majeur... l'annulaire... l'auriculaire... la paume... le dos de la main... le poignet... l'avant-bras... le coude... le bras... l'épaule droite...

[Continuez avec le bras gauche, puis les jambes, le torse, le visage]

PAIRES D'OPPOSÉS :
Ressentez de la lourdeur dans votre corps... maintenant de la légèreté...
Ressentez de la chaleur... maintenant de la fraîcheur...
Ressentez de la douleur... maintenant du plaisir...
Ressentez de la tristesse... maintenant de la joie...

VISUALISATIONS :
Imaginez rapidement ces images : un ciel étoilé... une rose rouge... une montagne enneigée... un coucher de soleil... un visage souriant... une flamme de bougie... un lac calme...

RETOUR :
Répétez votre sankalpa trois fois.
Prenez conscience de votre corps... de votre respiration... de la pièce...
Bougez doucement vos doigts et vos orteils.
Ouvrez les yeux quand vous êtes prêt.`,
  },

  // Concentration (existant, nouvelles méditations)
  {
    slug: 'flow-state',
    title: 'Entrer dans le flow',
    subtitle: 'Atteindre l\'état de concentration optimale',
    description: 'Le "flow" est cet état de concentration totale où le temps s\'arrête et où vous êtes à votre meilleur. Cette méditation vous prépare à entrer dans cet état pour votre travail ou votre créativité.',
    categorySlug: 'focus',
    level: 'intermediate' as const,
    duration: 10,
    instructor: 'Marc Lefort',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 10,
    coverColor: '#0F4C75',
    tags: JSON.stringify(['concentration', 'flow', 'performance', 'travail']),
    scriptText: `Asseyez-vous droit devant votre espace de travail. Fermez les yeux.

Vous êtes sur le point de faire quelque chose d'important. Nous allons préparer votre esprit à entrer dans le flow.

Respirez profondément trois fois. Avec chaque expiration, laissez partir les distractions.

Clarifiez votre intention : Qu'est-ce que vous allez faire dans les prochaines heures ? Soyez précis. "Je vais écrire le chapitre 3 de mon rapport." "Je vais coder la fonctionnalité de connexion."

Maintenant, imaginez que vous êtes déjà dans le flow. Vous travaillez avec aisance et concentration. Le temps passe sans que vous le remarquiez. Vous êtes complètement absorbé par votre tâche.

Sentez dans votre corps cet état de concentration. Vos épaules sont détendues mais votre esprit est alerte. Votre respiration est régulière. Vos mains sont prêtes.

Répétez intérieurement : Je suis concentré. Je suis capable. Je suis dans le flow.

Maintenant, définissez votre premier micro-objectif. Pas toute la tâche, juste la première étape. Quelque chose de faisable en 25 minutes.

Ouvrez les yeux. Commencez. Le flow vous attend.`,
  },

  // Amour de soi (existant, nouvelles méditations)
  {
    slug: 'lettre-a-soi-meme',
    title: 'Lettre à soi-même',
    subtitle: 'S\'écrire avec compassion et bienveillance',
    description: 'Une méditation d\'écriture thérapeutique pour cultiver la compassion envers soi-même. Vous vous écrirez une lettre comme si vous étiez votre meilleur ami.',
    categorySlug: 'self-love',
    level: 'intermediate' as const,
    duration: 20,
    instructor: 'Dr. Claire Dubois',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: false,
    sortOrder: 10,
    coverColor: '#7C3AED',
    tags: JSON.stringify(['amour de soi', 'écriture', 'compassion', 'thérapie']),
    scriptText: `Préparez un carnet et un stylo. Installez-vous confortablement.

Fermez les yeux. Respirez profondément.

Pensez à quelque chose qui vous pèse en ce moment. Une difficulté, une erreur, une honte, une peur. Quelque chose que vous vous reprochez ou qui vous fait souffrir.

Maintenant, imaginez que votre meilleur ami vous parle de ce même problème. Il vous dit exactement ce que vous vous dites à vous-même.

Que lui répondriez-vous ? Avec quelle douceur, quelle compréhension, quelle bienveillance lui parleriez-vous ?

Vous méritez exactement la même bienveillance.

Ouvrez les yeux. Prenez votre carnet.

Écrivez une lettre qui commence par "Cher(e) [votre prénom],"

Dans cette lettre, parlez-vous comme vous parleriez à un ami cher qui traverse la même difficulté. Reconnaissez sa douleur. Rappelez-lui ses forces. Offrez-lui de la compassion.

Écrivez pendant 10 minutes sans vous arrêter.

[Pause pour l'écriture]

Relisez votre lettre. Recevez ces mots. Ils sont vrais. Vous les méritez.

Respirez. Posez la main sur votre cœur.

Vous êtes digne d'amour et de bienveillance, exactement tel que vous êtes.`,
  },

  // Gratitude (existant, nouvelles méditations)
  {
    slug: 'gratitude-profonde',
    title: 'Gratitude profonde',
    subtitle: 'Transformer sa vision du monde par la gratitude',
    description: 'Au-delà de la simple liste de gratitude, cette méditation approfondie vous invite à ressentir la gratitude dans votre corps et à transformer fondamentalement votre rapport à la vie.',
    categorySlug: 'gratitude',
    level: 'intermediate' as const,
    duration: 15,
    instructor: 'Sophie Martin',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 10,
    coverColor: '#D97706',
    tags: JSON.stringify(['gratitude', 'bonheur', 'perspective', 'joie']),
    scriptText: `Installez-vous confortablement. Fermez les yeux. Respirez doucement.

La gratitude n'est pas une liste de choses. C'est un état d'être. Une façon de voir le monde.

Commençons par quelque chose de simple. Votre respiration. En ce moment, votre corps respire automatiquement, sans effort conscient de votre part. Vos poumons se dilatent, l'oxygène entre dans votre sang, vos cellules vivent.

Pouvez-vous ressentir de la gratitude pour ce miracle silencieux ?

Maintenant, votre cœur. Il bat environ 100 000 fois par jour, depuis votre naissance, sans jamais s'arrêter pour se reposer.

Sentez la gratitude pour ce cœur fidèle.

Pensez à quelqu'un qui vous a aidé dans votre vie. Peut-être un parent, un ami, un professeur, un inconnu. Quelqu'un qui a fait une différence.

Visualisez son visage. Sentez dans votre cœur la chaleur de cette gratitude. Laissez-la s'élargir.

Maintenant, pensez à une difficulté que vous avez traversée et qui vous a rendu plus fort. Pouvez-vous trouver de la gratitude même pour cette épreuve ?

La gratitude profonde ne nie pas la douleur. Elle la transcende.

Respirez dans cette gratitude. Laissez-la remplir chaque cellule de votre corps.

Quand vous ouvrez les yeux, le monde sera le même. Mais vous le verrez différemment.`,
  },

  // Scan corporel (existant, nouvelles méditations)
  {
    slug: 'scan-douleur-chronique',
    title: 'Scan corporel pour la douleur',
    subtitle: 'Pleine conscience du corps souffrant',
    description: 'Un scan corporel spécialement adapté pour les personnes souffrant de douleurs chroniques. Cette pratique MBSR aide à développer une relation différente avec la douleur.',
    categorySlug: 'body-scan',
    level: 'intermediate' as const,
    duration: 35,
    instructor: 'Dr. Claire Dubois',
    language: 'fr',
    isPremium: true,
    isActive: true,
    isFeatured: false,
    sortOrder: 10,
    coverColor: '#1E3A5F',
    tags: JSON.stringify(['scan corporel', 'douleur', 'MBSR', 'chronique']),
    scriptText: `Allongez-vous dans une position aussi confortable que possible. Fermez les yeux.

Cette pratique est différente des autres. Nous n'allons pas chercher à relaxer la douleur ou à la faire disparaître. Nous allons simplement l'observer avec curiosité et bienveillance.

Commencez par prendre conscience de votre respiration. Laissez-la être naturelle.

Portez maintenant votre attention sur vos pieds. Quelles sensations y trouvez-vous ? Chaleur, froid, contact avec le sol, picotements, ou peut-être rien de particulier.

Remontez lentement vers les chevilles, les mollets, les genoux, les cuisses. Observez chaque zone avec curiosité. Pas de jugement. Juste observer.

Arrivez au bassin et au bas du dos. Si vous y trouvez de la douleur, approchez-vous d'elle avec douceur. Comme vous approcheriez d'un animal blessé. Avec précaution et bienveillance.

Observez la douleur : Est-elle constante ou variable ? Pulsante ou sourde ? A-t-elle des bords ou est-elle diffuse ? A-t-elle une couleur, une texture ?

Vous n'avez pas à l'aimer. Mais pouvez-vous simplement être avec elle, sans résistance ?

La résistance à la douleur crée souvent plus de souffrance que la douleur elle-même.

Continuez à remonter : le ventre, la poitrine, les épaules, les bras, les mains, le cou, le visage.

Terminez par une conscience de votre corps entier. Avec toutes ses sensations, agréables et désagréables.

Vous êtes plus que votre douleur. Vous êtes la conscience qui observe.

Respirez. Revenez doucement.`,
  },

  // Respiration (existant, nouvelles méditations)
  {
    slug: 'wim-hof-doux',
    title: 'Respiration Wim Hof adaptée',
    subtitle: 'Technique de respiration pour l\'énergie et la vitalité',
    description: 'Une version douce et sécurisée de la technique de respiration Wim Hof, adaptée pour les débutants. Booste l\'énergie, renforce le système immunitaire et améliore la concentration.',
    categorySlug: 'breathing',
    level: 'intermediate' as const,
    duration: 15,
    instructor: 'Marc Lefort',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 10,
    coverColor: '#0891B2',
    tags: JSON.stringify(['respiration', 'Wim Hof', 'énergie', 'immunité']),
    scriptText: `IMPORTANT : Ne pratiquez pas cette technique en conduisant, dans l'eau, ou si vous êtes enceinte ou épileptique. Pratiquez assis ou allongé.

Allongez-vous ou asseyez-vous confortablement. Fermez les yeux.

ROUND 1 :
Prenez 30 respirations profondes et rapides. Inspirez profondément par le nez ou la bouche, remplissez complètement vos poumons, puis expirez sans forcer. Chaque respiration dure environ 2 secondes.

[30 respirations]

Après la 30ème expiration, retenez votre souffle. Restez confortable. Quand vous ressentez le besoin de respirer, inspirez profondément et retenez encore 15 secondes.

Expirez. Reposez-vous 30 secondes.

ROUND 2 :
Répétez les 30 respirations. Vous pouvez aller un peu plus loin cette fois dans la rétention.

[30 respirations + rétention]

ROUND 3 :
Dernier round. Allez à votre rythme naturel.

[30 respirations + rétention]

Après le troisième round, restez allongé quelques minutes. Observez les sensations dans votre corps. Picotements, légèreté, clarté mentale.

Respirez normalement. Revenez doucement.

Note : Il est normal de ressentir des picotements, des étourdissements légers ou une légèreté. Si vous vous sentez mal, respirez normalement immédiatement.`,
  },

  // Matin (existant, nouvelles méditations)
  {
    slug: 'soleil-levant',
    title: 'Salutation au soleil levant',
    subtitle: 'Rituel matinal de gratitude et d\'intention',
    description: 'Un rituel matinal complet qui combine méditation, gratitude et intention pour démarrer chaque journée avec clarté, énergie et sens. Idéal pour établir une routine matinale puissante.',
    categorySlug: 'morning',
    level: 'beginner' as const,
    duration: 12,
    instructor: 'Sophie Martin',
    language: 'fr',
    isPremium: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 10,
    coverColor: '#D97706',
    tags: JSON.stringify(['matin', 'rituel', 'gratitude', 'intention']),
    scriptText: `Asseyez-vous face à une fenêtre si possible. Fermez les yeux.

Bienvenue dans ce nouveau jour. Il n'a jamais existé avant. Il n'existera plus jamais. Il est unique.

Commencez par prendre conscience de votre corps. Vous êtes vivant. Votre cœur bat. Vos poumons respirent. C'est un miracle ordinaire.

Respirez profondément trois fois. Avec chaque inspiration, accueillez ce nouveau jour. Avec chaque expiration, laissez partir la nuit.

GRATITUDE :
Pensez à trois choses pour lesquelles vous êtes reconnaissant ce matin. Pas des grandes choses nécessairement. Peut-être votre lit chaud, une personne que vous aimez, votre santé, un projet qui vous enthousiasme.

Ressentez vraiment cette gratitude. Laissez-la réchauffer votre cœur.

INTENTION :
Comment voulez-vous être aujourd'hui ? Pas ce que vous voulez faire, mais qui vous voulez être. Patient ? Créatif ? Courageux ? Présent ? Généreux ?

Choisissez une qualité. Respirez-la.

VISUALISATION :
Imaginez votre journée idéale. Pas parfaite, mais alignée avec vos valeurs. Voyez-vous traverser les défis avec grâce. Voyez-vous connecté à ce qui compte vraiment.

AFFIRMATION :
Répétez intérieurement : "Je suis prêt pour cette journée. J'ai tout ce qu'il me faut. Je choisis d'être [votre intention]."

Ouvrez les yeux. Le soleil se lève. Votre journée commence.`,
  },
];

async function main() {
  console.log('🌱 Seeding nouvelles catégories de méditation...');

  // Insérer les nouvelles catégories
  let catCount = 0;
  for (const cat of NEW_CATEGORIES) {
    try {
      await db.upsertMeditationCategory(cat as any);
      console.log(`  ✅ Catégorie: ${cat.emoji} ${cat.name}`);
      catCount++;
    } catch (e: any) {
      console.error(`  ❌ Erreur catégorie ${cat.name}: ${e.message}`);
    }
  }

  console.log(`\n🎵 Seeding ${NEW_MEDITATIONS.length} nouvelles méditations...`);

  // Insérer les nouvelles méditations
  let medCount = 0;
  for (const med of NEW_MEDITATIONS) {
    try {
      await db.upsertMeditation(med as any);
      console.log(`  ✅ ${med.title} (${med.categorySlug}, ${med.duration}min)`);
      medCount++;
    } catch (e: any) {
      console.error(`  ❌ Erreur méditation ${med.title}: ${e.message}`);
    }
  }

  console.log(`\n✨ Seed terminé !`);
  console.log(`   ${catCount} catégories insérées`);
  console.log(`   ${medCount} méditations insérées`);
}

main().catch(console.error);
