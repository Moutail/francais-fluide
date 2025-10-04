// Script pour créer tous les comptes de test
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// Vérifier que DATABASE_URL est définie
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL non définie dans le fichier .env');
  console.error('📝 Assurez-vous que backend-francais-fluide/.env existe et contient:');
  console.error('   DATABASE_URL="postgresql://..."');
  process.exit(1);
}

console.log('✅ DATABASE_URL chargée:', process.env.DATABASE_URL.substring(0, 30) + '...');

const prisma = new PrismaClient();

// Définition des comptes de test
const testAccounts = [
  // === TESTEURS (2 comptes) ===
  {
    name: 'Testeur 1',
    email: 'testeur1@francais-fluide.com',
    password: 'Test123!',
    role: 'tester',
    plan: 'premium',
    status: 'active'
  },
  {
    name: 'Testeur 2',
    email: 'testeur2@francais-fluide.com',
    password: 'Test123!',
    role: 'tester',
    plan: 'premium',
    status: 'active'
  },

  // === ÉTUDIANTS (2 comptes) ===
  {
    name: 'Étudiant Marie',
    email: 'etudiant1@francais-fluide.com',
    password: 'Etudiant123!',
    role: 'user',
    plan: 'etudiant',
    status: 'active'
  },
  {
    name: 'Étudiant Jean',
    email: 'etudiant2@francais-fluide.com',
    password: 'Etudiant123!',
    role: 'user',
    plan: 'etudiant',
    status: 'active'
  },

  // === PREMIUM (2 comptes) ===
  {
    name: 'Premium Sophie',
    email: 'premium1@francais-fluide.com',
    password: 'Premium123!',
    role: 'user',
    plan: 'premium',
    status: 'active'
  },
  {
    name: 'Premium Pierre',
    email: 'premium2@francais-fluide.com',
    password: 'Premium123!',
    role: 'user',
    plan: 'premium',
    status: 'active'
  },

  // === ÉTABLISSEMENT (2 comptes) ===
  {
    name: 'École Secondaire Montreal',
    email: 'etablissement1@francais-fluide.com',
    password: 'Etablissement123!',
    role: 'user',
    plan: 'etablissement',
    status: 'active'
  },
  {
    name: 'Université Laval',
    email: 'etablissement2@francais-fluide.com',
    password: 'Etablissement123!',
    role: 'user',
    plan: 'etablissement',
    status: 'active'
  },

  // === PROFESSEURS (2 comptes) ===
  {
    name: 'Professeur Dubois',
    email: 'professeur1@francais-fluide.com',
    password: 'Prof123!',
    role: 'teacher',
    plan: 'etablissement',
    status: 'active'
  },
  {
    name: 'Professeur Martin',
    email: 'professeur2@francais-fluide.com',
    password: 'Prof123!',
    role: 'teacher',
    plan: 'etablissement',
    status: 'active'
  },
];

async function createTestAccounts() {
  console.log('🎓 Création des comptes de test pour Français Fluide\n');
  console.log('═══════════════════════════════════════════════════\n');

  let created = 0;
  let skipped = 0;

  for (const account of testAccounts) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existing = await prisma.user.findUnique({
        where: { email: account.email }
      });

      if (existing) {
        console.log(`⚠️  Ignoré: ${account.email} (existe déjà)`);
        skipped++;
        continue;
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(account.password, 10);

      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          name: account.name,
          email: account.email,
          password: hashedPassword,
          role: account.role,
          isActive: true
        }
      });

      // Créer la progression
      await prisma.userProgress.create({
        data: {
          userId: user.id,
          level: account.role === 'teacher' ? 10 : Math.floor(Math.random() * 5) + 1,
          xp: account.role === 'teacher' ? 5000 : Math.floor(Math.random() * 1000),
          wordsWritten: Math.floor(Math.random() * 5000),
          accuracy: Math.floor(Math.random() * 20) + 80, // 80-100%
          timeSpent: Math.floor(Math.random() * 500),
          exercisesCompleted: Math.floor(Math.random() * 50),
          currentStreak: Math.floor(Math.random() * 10)
        }
      });

      // Créer l'abonnement
      const startDate = new Date();
      const endDate = new Date();
      
      // Durée selon le plan
      const duration = account.plan === 'etablissement' ? 365 : 30; // 1 an pour établissement, 1 mois pour les autres
      endDate.setDate(endDate.getDate() + duration);

      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: account.plan,
          status: account.status,
          startDate: startDate,
          endDate: endDate
        }
      });

      console.log(`✅ Créé: ${account.name}`);
      console.log(`   📧 Email: ${account.email}`);
      console.log(`   🔑 Mot de passe: ${account.password}`);
      console.log(`   👤 Rôle: ${account.role}`);
      console.log(`   💳 Plan: ${account.plan}`);
      console.log(`   📅 Expire le: ${endDate.toLocaleDateString('fr-FR')}`);
      console.log('');

      created++;

    } catch (error) {
      console.error(`❌ Erreur pour ${account.email}:`, error.message);
    }
  }

  console.log('\n═══════════════════════════════════════════════════\n');
  console.log(`✅ ${created} comptes créés`);
  console.log(`⚠️  ${skipped} comptes ignorés (déjà existants)\n`);

  // Résumé par type
  console.log('📊 RÉSUMÉ DES COMPTES:\n');
  console.log('🔧 TESTEURS (2):');
  console.log('   - testeur1@francais-fluide.com / Test123!');
  console.log('   - testeur2@francais-fluide.com / Test123!');
  console.log('   Plan: Premium | Rôle: tester\n');

  console.log('🎓 ÉTUDIANTS (2):');
  console.log('   - etudiant1@francais-fluide.com / Etudiant123!');
  console.log('   - etudiant2@francais-fluide.com / Etudiant123!');
  console.log('   Plan: Étudiant | Rôle: user\n');

  console.log('⭐ PREMIUM (2):');
  console.log('   - premium1@francais-fluide.com / Premium123!');
  console.log('   - premium2@francais-fluide.com / Premium123!');
  console.log('   Plan: Premium | Rôle: user\n');

  console.log('🏢 ÉTABLISSEMENT (2):');
  console.log('   - etablissement1@francais-fluide.com / Etablissement123!');
  console.log('   - etablissement2@francais-fluide.com / Etablissement123!');
  console.log('   Plan: Établissement | Rôle: user\n');

  console.log('👨‍🏫 PROFESSEURS (2):');
  console.log('   - professeur1@francais-fluide.com / Prof123!');
  console.log('   - professeur2@francais-fluide.com / Prof123!');
  console.log('   Plan: Établissement | Rôle: teacher\n');

  console.log('📝 ADMIN (déjà créé):');
  console.log('   - admin@francais-fluide.com / Admin123!');
  console.log('   Rôle: super_admin\n');

  console.log('═══════════════════════════════════════════════════\n');
  console.log('💡 CONSEIL: Changez ces mots de passe en production!\n');
}

createTestAccounts()
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

