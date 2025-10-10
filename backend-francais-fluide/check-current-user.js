// Script pour vérifier l'utilisateur actuellement connecté
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const readline = require('readline');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-super-securise-changez-moi-en-production';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function checkUser() {
  console.log('\n🔍 VÉRIFICATION UTILISATEUR CONNECTÉ\n');
  console.log('═══════════════════════════════════════════════════\n');

  rl.question('Collez votre token JWT (depuis localStorage): ', async (token) => {
    try {
      if (!token || token.trim() === '') {
        console.log('\n❌ Token vide. Vérifiez dans la console du navigateur:');
        console.log('   localStorage.getItem("token")\n');
        process.exit(1);
      }

      // Décoder le token
      console.log('\n📋 Décodage du token...');
      const decoded = jwt.verify(token.trim(), JWT_SECRET);
      console.log('✅ Token valide');
      console.log('   User ID:', decoded.userId);
      console.log('   Email:', decoded.email);
      console.log('   Rôle:', decoded.role);

      // Récupérer l'utilisateur complet
      console.log('\n📊 Récupération des données utilisateur...');
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          subscription: true,
          progress: true
        }
      });

      if (!user) {
        console.log('❌ Utilisateur non trouvé dans la base de données!');
        process.exit(1);
      }

      console.log('\n✅ UTILISATEUR TROUVÉ\n');
      console.log('═══════════════════════════════════════════════════');
      console.log('📧 Email:', user.email);
      console.log('👤 Nom:', user.name);
      console.log('🎭 Rôle:', user.role);
      console.log('✅ Actif:', user.isActive ? 'Oui' : 'Non');
      console.log('📅 Créé le:', user.createdAt.toLocaleDateString('fr-FR'));

      console.log('\n💳 ABONNEMENT');
      console.log('═══════════════════════════════════════════════════');
      if (user.subscription) {
        console.log('📦 Plan:', user.subscription.plan);
        console.log('📊 Statut:', user.subscription.status);
        console.log('📅 Début:', user.subscription.startDate.toLocaleDateString('fr-FR'));
        console.log('📅 Fin:', user.subscription.endDate.toLocaleDateString('fr-FR'));
        
        const now = new Date();
        const isExpired = user.subscription.endDate < now;
        console.log('⏰ Expiré:', isExpired ? '❌ OUI' : '✅ NON');

        // Vérifier les quotas pour les dictées
        console.log('\n📚 ACCÈS AUX DICTÉES');
        console.log('═══════════════════════════════════════════════════');
        const quotas = {
          'demo': { dictations: 0 },
          'etudiant': { dictations: 10 },
          'premium': { dictations: -1 },
          'etablissement': { dictations: -1 }
        };

        const userQuota = quotas[user.subscription.plan];
        if (userQuota) {
          if (userQuota.dictations === 0) {
            console.log('🚫 Accès: BLOQUÉ (plan gratuit)');
          } else if (userQuota.dictations === -1) {
            console.log('✅ Accès: ILLIMITÉ');
          } else {
            console.log('✅ Accès: LIMITÉ à', userQuota.dictations, 'dictées/jour');
          }
        } else {
          console.log('⚠️ Plan inconnu:', user.subscription.plan);
        }
      } else {
        console.log('❌ AUCUN ABONNEMENT TROUVÉ!');
        console.log('⚠️ Cela explique pourquoi vous n\'avez pas accès aux dictées.');
        console.log('\n💡 Solution: Créer un abonnement pour cet utilisateur');
      }

      console.log('\n📊 PROGRESSION');
      console.log('═══════════════════════════════════════════════════');
      if (user.progress) {
        console.log('🎯 Niveau:', user.progress.level);
        console.log('⭐ XP:', user.progress.xp);
        console.log('📝 Mots écrits:', user.progress.wordsWritten);
        console.log('🎯 Précision:', user.progress.accuracy + '%');
        console.log('✅ Exercices complétés:', user.progress.exercisesCompleted);
        console.log('🔥 Série actuelle:', user.progress.currentStreak, 'jours');
      } else {
        console.log('⚠️ Aucune progression trouvée');
      }

      console.log('\n═══════════════════════════════════════════════════\n');

      // Si pas d'abonnement, proposer de le créer
      if (!user.subscription) {
        console.log('💡 VOULEZ-VOUS CRÉER UN ABONNEMENT ÉTABLISSEMENT?');
        rl.question('Taper "oui" pour créer: ', async (answer) => {
          if (answer.toLowerCase() === 'oui') {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 365); // 1 an

            await prisma.subscription.create({
              data: {
                userId: user.id,
                plan: 'etablissement',
                status: 'active',
                startDate: new Date(),
                endDate: endDate
              }
            });

            console.log('\n✅ Abonnement Établissement créé avec succès!');
            console.log('📅 Valide jusqu\'au:', endDate.toLocaleDateString('fr-FR'));
            console.log('\n🔄 Rechargez la page /dictation dans votre navigateur\n');
          }
          
          await prisma.$disconnect();
          process.exit(0);
        });
      } else {
        await prisma.$disconnect();
        process.exit(0);
      }

    } catch (error) {
      console.error('\n❌ ERREUR:', error.message);
      
      if (error.name === 'JsonWebTokenError') {
        console.log('\n⚠️ Token invalide. Assurez-vous de copier le token complet.');
      } else if (error.name === 'TokenExpiredError') {
        console.log('\n⚠️ Token expiré. Reconnectez-vous et récupérez un nouveau token.');
      }
      
      await prisma.$disconnect();
      process.exit(1);
    }
  });
}

console.log('╔═══════════════════════════════════════════════════╗');
console.log('║   VÉRIFICATION UTILISATEUR & ABONNEMENT           ║');
console.log('╚═══════════════════════════════════════════════════╝');
console.log('\n📝 Pour récupérer votre token:');
console.log('   1. Ouvrez la console du navigateur (F12)');
console.log('   2. Tapez: localStorage.getItem("token")');
console.log('   3. Copiez le token (sans les guillemets)');
console.log('   4. Collez-le ci-dessous\n');

checkUser();
