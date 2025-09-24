import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Création des utilisateurs de test avec différents abonnements...');

  const hashedPassword = await bcrypt.hash('Test!1234', 12);

  // Créer des utilisateurs avec différents plans d'abonnement
  const testUsers = [
    {
      name: 'Utilisateur Démo',
      email: 'demo@test.com',
      password: hashedPassword,
      plan: 'demo',
      status: 'active'
    },
    {
      name: 'Étudiant Premium',
      email: 'etudiant@test.com',
      password: hashedPassword,
      plan: 'etudiant',
      status: 'active'
    },
    {
      name: 'Professionnel',
      email: 'premium@test.com',
      password: hashedPassword,
      plan: 'premium',
      status: 'active'
    },
    {
      name: 'Établissement',
      email: 'etablissement@test.com',
      password: hashedPassword,
      plan: 'etablissement',
      status: 'active'
    }
  ];

  for (const userData of testUsers) {
    // Créer l'utilisateur
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        password: userData.password
      }
    });

    console.log(`✅ Utilisateur créé: ${userData.name}`);

    // Créer l'abonnement
    const subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        plan: userData.plan,
        status: userData.status,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
      }
    });

    console.log(`✅ Abonnement créé: ${userData.plan}`);

    // Créer la progression avec des données différentes selon le plan
    const progressData = {
      demo: { level: 1, xp: 50, exercisesCompleted: 2, wordsWritten: 100 },
      etudiant: { level: 3, xp: 250, exercisesCompleted: 8, wordsWritten: 500 },
      premium: { level: 5, xp: 750, exercisesCompleted: 20, wordsWritten: 1200 },
      etablissement: { level: 7, xp: 1500, exercisesCompleted: 50, wordsWritten: 3000 }
    };

    const progress = await prisma.userProgress.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        level: progressData[userData.plan as keyof typeof progressData].level,
        xp: progressData[userData.plan as keyof typeof progressData].xp,
        exercisesCompleted: progressData[userData.plan as keyof typeof progressData].exercisesCompleted,
        wordsWritten: progressData[userData.plan as keyof typeof progressData].wordsWritten,
        accuracy: 75 + Math.random() * 20, // Entre 75% et 95%
        timeSpent: 30 + Math.random() * 120, // Entre 30 et 150 minutes
        currentStreak: Math.floor(Math.random() * 15) + 1, // Entre 1 et 15 jours
        lastActivity: new Date()
      }
    });

    console.log(`✅ Progression créée: Niveau ${progress.level}`);

    // Créer quelques soumissions d'exercices pour les utilisateurs avancés
    if (userData.plan !== 'demo') {
      const exercises = await prisma.exercise.findMany({ take: 3 });
      
      for (let i = 0; i < Math.min(exercises.length, 2); i++) {
        const exercise = exercises[i];
        const score = 70 + Math.random() * 30; // Entre 70% et 100%
        
        await prisma.exerciseSubmission.create({
          data: {
            userId: user.id,
            exerciseId: exercise.id,
            answers: JSON.stringify({ 'q1': 'test', 'q2': 'test' }),
            score: Math.round(score),
            timeSpent: 60 + Math.random() * 120 // Entre 1 et 3 minutes
          }
        });
      }
      
      console.log(`✅ Soumissions d'exercices créées pour ${userData.name}`);
    }
  }

  // Créer quelques achievements pour les utilisateurs avancés
  const achievements = await prisma.achievement.findMany();
  
  for (const user of testUsers) {
    if (user.plan !== 'demo') {
      const userRecord = await prisma.user.findUnique({ where: { email: user.email } });
      if (userRecord) {
        // Débloquer quelques achievements
        const achievementsToUnlock = achievements.slice(0, Math.floor(Math.random() * 3) + 1);
        
        for (const achievement of achievementsToUnlock) {
          await prisma.userAchievement.upsert({
            where: {
              userId_achievementId: {
                userId: userRecord.id,
                achievementId: achievement.id
              }
            },
            update: {},
            create: {
              userId: userRecord.id,
              achievementId: achievement.id,
              earnedAt: new Date()
            }
          });
        }
        
        console.log(`✅ Achievements débloqués pour ${user.name}`);
      }
    }
  }

  console.log('\n🎉 Utilisateurs de test créés avec succès !');
  console.log('\n📊 Résumé des comptes créés:');
  console.log('👤 demo@test.com - Plan Démo (limité)');
  console.log('🎓 etudiant@test.com - Plan Étudiant (intermédiaire)');
  console.log('⭐ premium@test.com - Plan Premium (avancé)');
  console.log('🏢 etablissement@test.com - Plan Établissement (complet)');
  console.log('\n🔑 Mot de passe pour tous: Test!1234');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la création des utilisateurs de test:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
