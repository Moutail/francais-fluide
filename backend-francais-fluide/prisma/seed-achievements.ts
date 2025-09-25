import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAchievements() {
  console.log('🏆 Création des succès de base...');

  const achievements = [
    // Succès basés sur les mots écrits
    {
      name: 'Premier pas',
      description: 'Écrivez vos 100 premiers mots',
      type: 'words_written',
      threshold: 100,
      icon: '✍️'
    },
    {
      name: 'Écrivain en herbe',
      description: 'Écrivez 500 mots',
      type: 'words_written',
      threshold: 500,
      icon: '📝'
    },
    {
      name: 'Maître des mots',
      description: 'Écrivez 1000 mots',
      type: 'words_written',
      threshold: 1000,
      icon: '📚'
    },
    {
      name: 'Écrivain prolifique',
      description: 'Écrivez 5000 mots',
      type: 'words_written',
      threshold: 5000,
      icon: '🖋️'
    },

    // Succès basés sur les exercices
    {
      name: 'Premier exercice',
      description: 'Complétez votre premier exercice',
      type: 'exercises_completed',
      threshold: 1,
      icon: '🎯'
    },
    {
      name: 'Étudiant assidu',
      description: 'Complétez 10 exercices',
      type: 'exercises_completed',
      threshold: 10,
      icon: '📖'
    },
    {
      name: 'Expert en exercices',
      description: 'Complétez 25 exercices',
      type: 'exercises_completed',
      threshold: 25,
      icon: '🏅'
    },
    {
      name: 'Maître des exercices',
      description: 'Complétez 50 exercices',
      type: 'exercises_completed',
      threshold: 50,
      icon: '👑'
    },
    {
      name: 'Champion des exercices',
      description: 'Complétez 100 exercices',
      type: 'exercises_completed',
      threshold: 100,
      icon: '🏆'
    },

    // Succès basés sur la série
    {
      name: 'Régularité',
      description: 'Maintenez une série de 3 jours',
      type: 'streak',
      threshold: 3,
      icon: '🔥'
    },
    {
      name: 'Persévérance',
      description: 'Maintenez une série de 7 jours',
      type: 'streak',
      threshold: 7,
      icon: '⚡'
    },
    {
      name: 'Détermination',
      description: 'Maintenez une série de 15 jours',
      type: 'streak',
      threshold: 15,
      icon: '💪'
    },
    {
      name: 'Discipline de fer',
      description: 'Maintenez une série de 30 jours',
      type: 'streak',
      threshold: 30,
      icon: '🗿'
    },

    // Succès basés sur le niveau
    {
      name: 'Débutant confirmé',
      description: 'Atteignez le niveau 2',
      type: 'level',
      threshold: 2,
      icon: '🌱'
    },
    {
      name: 'Intermédiaire',
      description: 'Atteignez le niveau 5',
      type: 'level',
      threshold: 5,
      icon: '🌿'
    },
    {
      name: 'Avancé',
      description: 'Atteignez le niveau 10',
      type: 'level',
      threshold: 10,
      icon: '🌳'
    },
    {
      name: 'Expert',
      description: 'Atteignez le niveau 20',
      type: 'level',
      threshold: 20,
      icon: '🏔️'
    },

    // Succès basés sur la précision
    {
      name: 'Précision correcte',
      description: 'Atteignez 70% de précision moyenne',
      type: 'accuracy',
      threshold: 70,
      icon: '🎯'
    },
    {
      name: 'Bonne précision',
      description: 'Atteignez 80% de précision moyenne',
      type: 'accuracy',
      threshold: 80,
      icon: '🔍'
    },
    {
      name: 'Excellente précision',
      description: 'Atteignez 90% de précision moyenne',
      type: 'accuracy',
      threshold: 90,
      icon: '✨'
    },
    {
      name: 'Perfectionniste',
      description: 'Atteignez 95% de précision moyenne',
      type: 'accuracy',
      threshold: 95,
      icon: '💎'
    }
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: {
        // Utiliser une combinaison unique pour éviter les doublons
        name: achievement.name
      },
      update: {},
      create: achievement
    });
    console.log(`✅ Succès créé: ${achievement.name}`);
  }

  console.log(`\n🎉 ${achievements.length} succès créés avec succès !`);
}

async function main() {
  try {
    await seedAchievements();
  } catch (error) {
    console.error('❌ Erreur lors de la création des succès:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
