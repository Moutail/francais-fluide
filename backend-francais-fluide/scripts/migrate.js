// scripts/migrate.js
// Script de migration pour séparer le frontend et le backend

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function migrate() {
  console.log('🚀 Début de la migration...');

  try {
    // 1. Générer le client Prisma
    console.log('📦 Génération du client Prisma...');
    await prisma.$executeRaw`SELECT 1`; // Test de connexion
    console.log('✅ Connexion à la base de données réussie');

    // 2. Appliquer les migrations
    console.log('🗄️ Application des migrations...');
    // Les migrations seront appliquées via npm run db:migrate

    // 3. Créer les données de base
    console.log('🌱 Création des données de base...');
    await createAchievements();
    await createExercises();
    console.log('✅ Données de base créées');

    // 4. Créer les dossiers nécessaires
    console.log('📁 Création des dossiers...');
    const folders = ['logs', 'uploads', 'temp'];
    for (const folder of folders) {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
        console.log(`✅ Dossier ${folder} créé`);
      }
    }

    console.log('🎉 Migration terminée avec succès !');
    console.log('');
    console.log('📋 Prochaines étapes :');
    console.log('1. Configurer les variables d\'environnement dans .env');
    console.log('2. Démarrer le serveur : npm run dev');
    console.log('3. Tester l\'API : http://localhost:3001/health');
    console.log('4. Configurer le frontend pour utiliser cette API');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function createAchievements() {
  const achievements = [
    {
      name: 'Premier Pas',
      description: 'Compléter votre premier exercice',
      type: 'exercises_completed',
      threshold: 1,
      icon: '🎯'
    },
    {
      name: 'Mots Magiques',
      description: 'Écrire 100 mots',
      type: 'words_written',
      threshold: 100,
      icon: '📝'
    },
    {
      name: 'Série de Fer',
      description: 'Maintenir une série de 7 jours',
      type: 'streak',
      threshold: 7,
      icon: '🔥'
    },
    {
      name: 'Maître des Mots',
      description: 'Atteindre le niveau 10',
      type: 'level',
      threshold: 10,
      icon: '👑'
    },
    {
      name: 'Perfectionniste',
      description: 'Atteindre 95% de précision',
      type: 'accuracy',
      threshold: 95,
      icon: '⭐'
    }
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement
    });
  }
}

async function createExercises() {
  const exercises = [
    {
      id: 'grammar-basics-1',
      title: 'Accord des Adjectifs',
      description: 'Choisissez la bonne forme de l\'adjectif',
      type: 'grammar',
      level: 1,
      difficulty: 'easy',
      questions: [
        {
          question: 'La voiture ___ est garée devant la maison.',
          options: ['rouge', 'rouges', 'rouge', 'rouges'],
          correctAnswer: 'rouge',
          explanation: 'L\'adjectif "rouge" s\'accorde avec le nom féminin "voiture".',
          order: 1
        },
        {
          question: 'Les fleurs ___ sentent bon.',
          options: ['jaune', 'jaunes', 'jaune', 'jaunes'],
          correctAnswer: 'jaunes',
          explanation: 'L\'adjectif "jaunes" s\'accorde avec le nom pluriel "fleurs".',
          order: 2
        }
      ]
    },
    {
      id: 'conjugation-present-1',
      title: 'Conjugaison Présent - Être',
      description: 'Conjuguez le verbe "être" au présent',
      type: 'conjugation',
      level: 1,
      difficulty: 'easy',
      questions: [
        {
          question: 'Je ___ étudiant.',
          options: ['suis', 'es', 'est', 'sommes'],
          correctAnswer: 'suis',
          explanation: 'Je suis, tu es, il/elle est, nous sommes, vous êtes, ils/elles sont.',
          order: 1
        },
        {
          question: 'Nous ___ en vacances.',
          options: ['suis', 'es', 'est', 'sommes'],
          correctAnswer: 'sommes',
          explanation: 'Nous sommes, vous êtes, ils/elles sont.',
          order: 2
        }
      ]
    }
  ];

  for (const exercise of exercises) {
    const { questions, ...exerciseData } = exercise;
    
    await prisma.exercise.upsert({
      where: { id: exercise.id },
      update: exerciseData,
      create: exerciseData
    });

    // Créer les questions
    for (const question of questions) {
      await prisma.question.upsert({
        where: {
          exerciseId_order: {
            exerciseId: exercise.id,
            order: question.order
          }
        },
        update: question,
        create: {
          ...question,
          exerciseId: exercise.id,
          options: JSON.stringify(question.options)
        }
      });
    }
  }
}

// Exécuter la migration
if (require.main === module) {
  migrate();
}

module.exports = { migrate };
