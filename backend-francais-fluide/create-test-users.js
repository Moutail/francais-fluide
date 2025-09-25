#!/usr/bin/env node

// Script pour créer des utilisateurs de test avec différents rôles
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log('👥 Création d\'utilisateurs de test avec différents rôles\n');

  const hashedPassword = await bcrypt.hash('Test!1234', 12);

  const testUsers = [
    {
      name: 'Admin Principal',
      email: 'admin@francaisfluide.com',
      role: 'super_admin',
      subscription: 'premium',
      description: 'Super administrateur principal'
    },
    {
      name: 'Administrateur Test',
      email: 'admin.test@francaisfluide.com',
      role: 'admin',
      subscription: 'premium',
      description: 'Administrateur pour tests'
    },
    {
      name: 'Professeur Martin',
      email: 'prof.martin@ecole.fr',
      role: 'teacher',
      subscription: 'etablissement',
      description: 'Professeur de français'
    },
    {
      name: 'Testeur Beta',
      email: 'testeur@francaisfluide.com',
      role: 'tester',
      subscription: 'premium',
      description: 'Testeur pour nouvelles fonctionnalités'
    },
    {
      name: 'Étudiant Premium',
      email: 'etudiant.premium@universite.fr',
      role: 'user',
      subscription: 'etudiant',
      description: 'Étudiant avec abonnement'
    },
    {
      name: 'Utilisateur Démo',
      email: 'demo.user@example.com',
      role: 'user',
      subscription: 'demo',
      description: 'Utilisateur en mode démo'
    },
    {
      name: 'Entreprise Test',
      email: 'contact@entreprise.com',
      role: 'user',
      subscription: 'etablissement',
      description: 'Compte entreprise de test'
    }
  ];

  console.log('📋 Utilisateurs à créer:');
  testUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.subscription}`);
  });

  console.log('\n🚀 Création en cours...\n');

  for (const userData of testUsers) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`⚠️  ${userData.name} existe déjà, passage au suivant`);
        continue;
      }

      // Créer l'utilisateur avec transaction
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
            isActive: true
          }
        });

        // Créer la progression avec des données réalistes selon le rôle
        const progressData = {
          super_admin: { level: 10, xp: 2000, exercisesCompleted: 100, wordsWritten: 5000 },
          admin: { level: 8, xp: 1500, exercisesCompleted: 75, wordsWritten: 3500 },
          teacher: { level: 12, xp: 3000, exercisesCompleted: 150, wordsWritten: 8000 },
          tester: { level: 6, xp: 1000, exercisesCompleted: 50, wordsWritten: 2500 },
          user: { level: 3, xp: 300, exercisesCompleted: 15, wordsWritten: 800 }
        };

        const progress = progressData[userData.role] || progressData.user;

        await tx.userProgress.create({
          data: {
            userId: user.id,
            level: progress.level,
            xp: progress.xp,
            exercisesCompleted: progress.exercisesCompleted,
            wordsWritten: progress.wordsWritten,
            accuracy: 75 + Math.random() * 20, // Entre 75% et 95%
            timeSpent: 30 + Math.random() * 120, // Entre 30 et 150 minutes
            currentStreak: Math.floor(Math.random() * 15) + 1, // Entre 1 et 15 jours
            lastActivity: new Date()
          }
        });

        // Créer l'abonnement
        const endDate = new Date();
        if (userData.subscription === 'demo') {
          endDate.setMonth(endDate.getMonth() + 1); // 1 mois
        } else {
          endDate.setFullYear(endDate.getFullYear() + 1); // 1 an
        }

        await tx.subscription.create({
          data: {
            userId: user.id,
            plan: userData.subscription,
            status: 'active',
            startDate: new Date(),
            endDate
          }
        });

        return user;
      });

      console.log(`✅ ${userData.name} créé avec succès`);
      console.log(`   📧 Email: ${userData.email}`);
      console.log(`   🔑 Rôle: ${userData.role}`);
      console.log(`   👑 Abonnement: ${userData.subscription}`);
      console.log(`   📝 Description: ${userData.description}\n`);

    } catch (error) {
      console.error(`❌ Erreur création ${userData.name}:`, error.message);
    }
  }

  console.log('🎉 Création des utilisateurs de test terminée !');
  console.log('\n📋 Résumé des comptes créés:');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│ COMPTE                    │ EMAIL                     │ RÔLE        │ PLAN         │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ Admin Principal           │ admin@francaisfluide.com  │ super_admin │ premium      │');
  console.log('│ Administrateur Test       │ admin.test@...            │ admin       │ premium      │');
  console.log('│ Professeur Martin         │ prof.martin@ecole.fr      │ teacher     │ etablissement│');
  console.log('│ Testeur Beta              │ testeur@francaisfluide... │ tester      │ premium      │');
  console.log('│ Étudiant Premium          │ etudiant.premium@...      │ user        │ etudiant     │');
  console.log('│ Utilisateur Démo          │ demo.user@example.com     │ user        │ demo         │');
  console.log('│ Entreprise Test           │ contact@entreprise.com    │ user        │ etablissement│');
  console.log('└─────────────────────────────────────────────────────────┘');
  console.log('\n🔑 Mot de passe pour tous les comptes: Test!1234');
  console.log('\n🌐 Connexions:');
  console.log('   • Interface utilisateur: http://localhost:3000/auth/login');
  console.log('   • Interface admin: http://localhost:3000/admin');
  console.log('\n💡 Conseils:');
  console.log('   • Utilisez admin@francaisfluide.com pour l\'administration complète');
  console.log('   • Testez les différents rôles avec les autres comptes');
  console.log('   • Modifiez les mots de passe après les premiers tests');
}

async function main() {
  try {
    await createTestUsers();
  } catch (error) {
    console.error('❌ Erreur générale:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
