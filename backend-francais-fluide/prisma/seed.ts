import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Créer des utilisateurs de test
  const hashedPassword = await bcrypt.hash('Test!1234', 12);

  const user1 = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Utilisateur Test',
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      role: 'admin',
      password: hashedPassword,
      name: 'Administrateur',
    },
    create: {
      email: 'admin@example.com',
      name: 'Administrateur',
      password: hashedPassword,
      role: 'admin',
    },
  });

  const premiumSeedUsers = [
    {
      email: 'premium@example.com',
      name: 'Compte Premium',
      plan: 'premium',
      status: 'active',
    },
    {
      email: 'etablissement@example.com',
      name: 'Compte Établissement',
      plan: 'etablissement',
      status: 'active',
    },
  ];

  const createdPremiumUsers = [] as Array<{ id: string; email: string; plan: string }>;

  for (const u of premiumSeedUsers) {
    const createdUser = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        password: hashedPassword,
      },
      create: {
        email: u.email,
        name: u.name,
        password: hashedPassword,
      },
    });

    createdPremiumUsers.push({ id: createdUser.id, email: createdUser.email, plan: u.plan });
  }

  console.log('✅ Utilisateurs créés');

  // Créer des abonnements (nécessaires pour les fonctionnalités IA avancées)
  const startDate = new Date();
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.subscription.upsert({
    where: { userId: user1.id },
    update: {
      plan: 'demo',
      status: 'active',
      startDate,
      endDate,
    },
    create: {
      userId: user1.id,
      plan: 'demo',
      status: 'active',
      startDate,
      endDate,
    },
  });

  await prisma.subscription.upsert({
    where: { userId: user2.id },
    update: {
      plan: 'demo',
      status: 'active',
      startDate,
      endDate,
    },
    create: {
      userId: user2.id,
      plan: 'demo',
      status: 'active',
      startDate,
      endDate,
    },
  });

  for (const u of createdPremiumUsers) {
    await prisma.subscription.upsert({
      where: { userId: u.id },
      update: {
        plan: u.plan,
        status: 'active',
        startDate,
        endDate,
      },
      create: {
        userId: u.id,
        plan: u.plan,
        status: 'active',
        startDate,
        endDate,
      },
    });
  }

  console.log('✅ Abonnements créés');

  // Créer des progressions
  await prisma.userProgress.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      wordsWritten: 150,
      accuracy: 78,
      timeSpent: 120,
      exercisesCompleted: 2,
      currentStreak: 5,
      level: 3,
      xp: 250,
    },
  });

  await prisma.userProgress.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      wordsWritten: 500,
      accuracy: 92,
      timeSpent: 300,
      exercisesCompleted: 8,
      currentStreak: 12,
      level: 5,
      xp: 750,
    },
  });

  console.log('✅ Progressions créées');

  // Créer des achievements
  const achievements = [
    {
      name: 'Premier Pas',
      description: 'Complétez votre premier exercice',
      type: 'exercises_completed',
      threshold: 1,
      icon: '🎯'
    },
    {
      name: 'Écrivain',
      description: 'Écrivez 100 mots',
      type: 'words_written',
      threshold: 100,
      icon: '✍️'
    },
    {
      name: 'Maître de la Précision',
      description: 'Atteignez 90% de précision',
      type: 'accuracy',
      threshold: 90,
      icon: '🎯'
    },
    {
      name: 'Série de 7 jours',
      description: 'Connectez-vous 7 jours consécutifs',
      type: 'streak',
      threshold: 7,
      icon: '🔥'
    },
    {
      name: 'Niveau Expert',
      description: 'Atteignez le niveau 10',
      type: 'level',
      threshold: 10,
      icon: '⭐'
    }
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { id: achievement.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        id: achievement.name.toLowerCase().replace(/\s+/g, '-'),
        name: achievement.name,
        description: achievement.description,
        type: achievement.type,
        threshold: achievement.threshold,
        icon: achievement.icon,
      },
    });
  }

  console.log('✅ Achievements créés');

  // Créer des exercices
  const exercises = [
    {
      title: 'Accord des participes passés',
      description: 'Maîtrisez l\'accord des participes passés avec les auxiliaires être et avoir.',
      type: 'grammar',
      difficulty: 'medium',
      level: 2,
      questions: [
        {
          question: 'Les enfants sont _____ chez leurs grands-parents.',
          options: ['allés', 'allé', 'allée', 'allées'],
          correctAnswer: 'allés',
          explanation: 'Avec l\'auxiliaire "être", le participe passé s\'accorde avec le sujet "les enfants" (masculin pluriel).',
        },
        {
          question: 'Elle a _____ une lettre à sa mère.',
          options: ['écrite', 'écrit', 'écrits', 'écrites'],
          correctAnswer: 'écrit',
          explanation: 'Avec l\'auxiliaire "avoir", le participe passé ne s\'accorde pas avec le sujet mais avec le COD si celui-ci est placé avant.',
        },
        {
          question: 'Les fleurs que j\'ai _____ hier sont magnifiques.',
          options: ['cueillies', 'cueilli', 'cueillie', 'cueillis'],
          correctAnswer: 'cueillies',
          explanation: 'Le COD "que" (qui représente "les fleurs", féminin pluriel) est placé avant le verbe, donc accord obligatoire.',
        }
      ]
    },
    {
      title: 'Vocabulaire avancé',
      description: 'Enrichissez votre vocabulaire avec des mots de niveau avancé.',
      type: 'vocabulary',
      difficulty: 'hard',
      level: 4,
      questions: [
        {
          question: 'Quel est le synonyme de "mélancolique" ?',
          options: ['joyeux', 'triste', 'énergique', 'calme'],
          correctAnswer: 'triste',
          explanation: 'Mélancolique signifie triste, nostalgique.',
        },
        {
          question: 'Que signifie "éphémère" ?',
          options: ['permanent', 'temporaire', 'éternel', 'durable'],
          correctAnswer: 'temporaire',
          explanation: 'Éphémère signifie qui ne dure qu\'un temps très court.',
        }
      ]
    },
    {
      title: 'Subjonctif présent',
      description: 'Conjuguez correctement les verbes au subjonctif présent.',
      type: 'conjugation',
      difficulty: 'hard',
      level: 5,
      questions: [
        {
          question: 'Il faut que je _____ à l\'heure.',
          options: ['arrive', 'arrives', 'arrivons', 'arrivent'],
          correctAnswer: 'arrive',
          explanation: 'Au subjonctif présent, "arriver" se conjugue : que j\'arrive, que tu arrives, qu\'il arrive, etc.',
        }
      ]
    }
  ];

  // Ajouter 2 exercices par défaut supplémentaires (total ≥ 5)
  exercises.push(
    {
      title: 'Compréhension – Texte court',
      description: 'Questions de compréhension sur un court paragraphe.',
      type: 'comprehension',
      difficulty: 'easy',
      level: 1,
      questions: [
        {
          question: 'Quel est le thème principal du texte ?',
          options: ['La météo', 'Les transports', 'La cuisine', 'La musique'],
          correctAnswer: 'La météo',
          explanation: 'Le paragraphe parle des changements de temps dans la journée.'
        },
         {
          question: 'À quel moment de la journée fait-il le plus chaud ?',
          options: ['Le matin', 'Le midi', 'Le soir', 'La nuit'],
          correctAnswer: 'Le midi',
          explanation: 'Le texte indique que la température monte à midi.'
        }
      ]
    },
    {
      title: 'Orthographe – Homophones fréquents',
      description: 'Choisissez la bonne orthographe entre des homophones courants.',
      type: 'spelling',
      difficulty: 'medium',
      level: 2,
      questions: [
        {
          question: 'Il va __ l\'école tous les jours.',
          options: ['à', 'a'],
          correctAnswer: 'à',
          explanation: '"à" est une préposition, "a" est le verbe avoir.'
        },
        {
          question: 'Elle __ fini ses devoirs.',
          options: ['a', 'à'],
          correctAnswer: 'a',
          explanation: 'Ici, il s\'agit du verbe avoir, 3e personne du singulier.'
        }
      ]
    }
  );

  for (const exerciseData of exercises) {
    const exercise = await prisma.exercise.create({
      data: {
        title: exerciseData.title,
        description: exerciseData.description,
        type: exerciseData.type,
        difficulty: exerciseData.difficulty,
        level: exerciseData.level,
        questions: {
          create: exerciseData.questions.map((q, index) => ({
            question: q.question,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            order: index
          }))
        }
      }
    });

    console.log(`✅ Exercice créé: ${exercise.title}`);
  }

  // Créer des dictées
  const dictations = [
    {
      title: 'La vie quotidienne',
      description: 'Une dictée sur les activités de la vie quotidienne',
      difficulty: 'beginner',
      duration: 5,
      text: 'Chaque matin, je me lève à sept heures. Je prends ma douche et je m\'habille. Ensuite, je prends mon petit-déjeuner avec ma famille. Nous mangeons du pain, du beurre et de la confiture. Après le petit-déjeuner, je vais à l\'école en bus.',
      category: 'quotidien',
      tags: ['quotidien', 'famille', 'école']
    },
    {
      title: 'Les saisons',
      description: 'Découvrez les quatre saisons en français',
      difficulty: 'intermediate',
      duration: 8,
      text: 'Le printemps est une saison magnifique. Les arbres fleurissent et les oiseaux chantent. L\'été apporte la chaleur et les longues journées ensoleillées. L\'automne colore les feuilles en rouge et en orange. L\'hiver recouvre tout de neige blanche.',
      category: 'nature',
      tags: ['saisons', 'nature', 'couleurs']
    }
  ];

  for (const dictationData of dictations) {
    await prisma.dictation.create({
      data: {
        title: dictationData.title,
        description: dictationData.description,
        difficulty: dictationData.difficulty,
        duration: dictationData.duration,
        text: dictationData.text,
        category: dictationData.category,
        tags: JSON.stringify(dictationData.tags)
      }
    });

    console.log(`✅ Dictée créée: ${dictationData.title}`);
  }

  console.log('🎉 Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });