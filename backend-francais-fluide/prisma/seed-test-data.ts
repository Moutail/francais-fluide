// prisma/seed-test-data.ts
// Script pour insérer des données de test dans la base de données

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Insertion des données de test...');

  try {
    // Nettoyer les données existantes
    console.log('🧹 Nettoyage des données existantes...');
    await prisma.userAchievement.deleteMany();
    await prisma.exerciseSubmission.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.usageLog.deleteMany();
    await prisma.calendarEvent.deleteMany();
    await prisma.document.deleteMany();
    await prisma.userProgress.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.question.deleteMany();
    await prisma.exercise.deleteMany();
    await prisma.achievement.deleteMany();
    await prisma.dictation.deleteMany();
    await prisma.user.deleteMany();

    // Créer un utilisateur de test
    console.log('👤 Création de l\'utilisateur de test...');
    const hashedPassword = await bcrypt.hash('Test!1234', 12);
    
    const testUser = await prisma.user.create({
      data: {
        email: 'test@francais-fluide.com',
        name: 'Utilisateur Test',
        password: hashedPassword,
      }
    });

    console.log('✅ Utilisateur créé:', testUser.email);

    // Créer une progression pour l'utilisateur
    console.log('📊 Création de la progression...');
    const userProgress = await prisma.userProgress.create({
      data: {
        userId: testUser.id,
        wordsWritten: 1250,
        accuracy: 87.5,
        timeSpent: 180, // 3 heures
        exercisesCompleted: 15,
        currentStreak: 7,
        level: 3,
        xp: 450,
        lastActivity: new Date(),
      }
    });

    console.log('✅ Progression créée:', userProgress);

    // Créer un abonnement étudiant
    console.log('🎓 Création de l\'abonnement étudiant...');
    const subscription = await prisma.subscription.create({
      data: {
        userId: testUser.id,
        plan: 'etudiant',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
      }
    });

    console.log('✅ Abonnement créé:', subscription.plan);

    // Créer des exercices de test
    console.log('📝 Création des exercices...');
    const exercise1 = await prisma.exercise.create({
      data: {
        title: 'Accord des adjectifs',
        description: 'Exercice sur l\'accord des adjectifs qualificatifs',
        type: 'grammar',
        level: 2,
        difficulty: 'medium',
      }
    });

    const exercise2 = await prisma.exercise.create({
      data: {
        title: 'Vocabulaire de la famille',
        description: 'Apprendre le vocabulaire de la famille',
        type: 'vocabulary',
        level: 1,
        difficulty: 'easy',
      }
    });

    // Créer des questions pour les exercices
    console.log('❓ Création des questions...');
    await prisma.question.createMany({
      data: [
        {
          exerciseId: exercise1.id,
          question: 'Quel est l\'accord correct de l\'adjectif dans la phrase : "Les fleurs sont..."',
          options: JSON.stringify(['belles', 'beaux', 'beau', 'belle']),
          correctAnswer: 'belles',
          explanation: 'L\'adjectif "belles" s\'accorde avec le nom féminin pluriel "fleurs".',
          order: 1,
        },
        {
          exerciseId: exercise1.id,
          question: 'Dans "Les enfants sont...", quel est le bon accord ?',
          options: JSON.stringify(['content', 'contents', 'contente', 'contentes']),
          correctAnswer: 'contents',
          explanation: 'L\'adjectif "contents" s\'accorde avec le nom masculin pluriel "enfants".',
          order: 2,
        },
        {
          exerciseId: exercise2.id,
          question: 'Comment dit-on "grandmother" en français ?',
          options: JSON.stringify(['grand-père', 'grand-mère', 'oncle', 'tante']),
          correctAnswer: 'grand-mère',
          explanation: 'Grand-mère est le terme français pour "grandmother".',
          order: 1,
        },
      ]
    });

    // Créer des soumissions d'exercices
    console.log('📋 Création des soumissions...');
    await prisma.exerciseSubmission.create({
      data: {
        userId: testUser.id,
        exerciseId: exercise1.id,
        answers: JSON.stringify({
          'question1': 'belles',
          'question2': 'contents'
        }),
        score: 100,
        timeSpent: 120, // 2 minutes
      }
    });

    await prisma.exerciseSubmission.create({
      data: {
        userId: testUser.id,
        exerciseId: exercise2.id,
        answers: JSON.stringify({
          'question1': 'grand-mère'
        }),
        score: 100,
        timeSpent: 60, // 1 minute
      }
    });

    // Créer des succès
    console.log('🏆 Création des succès...');
    const achievements = await prisma.achievement.createMany({
      data: [
        {
          name: 'Premier exercice',
          description: 'Complétez votre premier exercice',
          type: 'exercises_completed',
          threshold: 1,
          icon: '🎯',
        },
        {
          name: 'Série de 7 jours',
          description: 'Pratiquez 7 jours consécutifs',
          type: 'streak',
          threshold: 7,
          icon: '🔥',
        },
        {
          name: '1000 mots écrits',
          description: 'Écrivez 1000 mots au total',
          type: 'words_written',
          threshold: 1000,
          icon: '📝',
        },
      ]
    });

    // Attribuer des succès à l'utilisateur
    const createdAchievements = await prisma.achievement.findMany();
    await prisma.userAchievement.createMany({
      data: createdAchievements.map(achievement => ({
        userId: testUser.id,
        achievementId: achievement.id,
      }))
    });

    // Créer des logs d'utilisation
    console.log('📊 Création des logs d\'utilisation...');
    await prisma.usageLog.createMany({
      data: [
        {
          userId: testUser.id,
          type: 'exercise',
          details: JSON.stringify({ exerciseId: exercise1.id, score: 100 }),
        },
        {
          userId: testUser.id,
          type: 'correction',
          details: JSON.stringify({ wordsCorrected: 5, accuracy: 87.5 }),
        },
        {
          userId: testUser.id,
          type: 'ai_chat',
          details: JSON.stringify({ messagesCount: 3, topic: 'grammaire' }),
        },
      ]
    });

    // Créer des événements de calendrier
    console.log('📅 Création des événements de calendrier...');
    await prisma.calendarEvent.createMany({
      data: [
        {
          userId: testUser.id,
          title: 'Exercice quotidien',
          type: 'exercise',
          date: new Date(),
          time: '09:00',
          description: 'Exercice de grammaire quotidien',
          points: 10,
          completed: true,
        },
        {
          userId: testUser.id,
          title: 'Révision vocabulaire',
          type: 'study',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
          time: '14:00',
          description: 'Révision du vocabulaire de la famille',
          points: 15,
          completed: false,
        },
      ]
    });

    // Créer des documents
    console.log('📄 Création des documents...');
    await prisma.document.create({
      data: {
        userId: testUser.id,
        title: 'Mon premier texte',
        content: 'Bonjour, je m\'appelle Marie et j\'apprends le français. C\'est une langue magnifique !',
        type: 'editor',
        metadata: JSON.stringify({ wordCount: 15, language: 'fr' }),
      }
    });

    // Créer des dictées
    console.log('🎧 Création des dictées...');
    await prisma.dictation.createMany({
      data: [
        {
          title: 'La famille Martin',
          description: 'Dictée sur la famille',
          difficulty: 'beginner',
          duration: 5,
          text: 'La famille Martin habite à Paris. Monsieur Martin est professeur. Madame Martin est médecin. Ils ont deux enfants.',
          category: 'famille',
          tags: JSON.stringify(['famille', 'profession', 'débutant']),
        },
        {
          title: 'Les saisons',
          description: 'Dictée sur les saisons',
          difficulty: 'intermediate',
          duration: 8,
          text: 'Le printemps est la saison du renouveau. Les arbres fleurissent et les oiseaux chantent. L\'été apporte la chaleur et les vacances.',
          category: 'nature',
          tags: JSON.stringify(['saisons', 'nature', 'intermédiaire']),
        },
      ]
    });

    console.log('🎉 Données de test insérées avec succès !');
    console.log('\n📋 Résumé des données créées :');
    console.log(`   👤 Utilisateur: ${testUser.email}`);
    console.log(`   📊 Progression: ${userProgress.wordsWritten} mots, niveau ${userProgress.level}`);
    console.log(`   🎓 Abonnement: ${subscription.plan} (${subscription.status})`);
    console.log(`   📝 Exercices: 2 exercices créés`);
    console.log(`   🏆 Succès: ${createdAchievements.length} succès disponibles`);
    console.log(`   📊 Logs: 3 logs d'utilisation`);
    console.log(`   📅 Événements: 2 événements de calendrier`);
    console.log(`   📄 Documents: 1 document`);
    console.log(`   🎧 Dictées: 2 dictées`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
