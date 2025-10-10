const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProfesseur() {
  const email = 'professeur1@francais-fluide.com';
  
  console.log('\n🔍 VÉRIFICATION COMPTE PROFESSEUR\n');
  console.log('Email:', email);
  console.log('');
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true, progress: true }
    });

    if (!user) {
      console.log('❌ COMPTE NON TROUVÉ!');
      console.log('\n💡 Le compte n\'existe pas dans la base de données.');
      console.log('   Exécutez: node create-test-accounts.js\n');
      return;
    }

    console.log('✅ COMPTE TROUVÉ\n');
    console.log('Nom:', user.name);
    console.log('Email:', user.email);
    console.log('Rôle:', user.role);
    console.log('Actif:', user.isActive ? 'Oui' : 'Non');
    console.log('');

    if (user.subscription) {
      console.log('📦 ABONNEMENT');
      console.log('Plan:', user.subscription.plan);
      console.log('Statut:', user.subscription.status);
      console.log('Début:', user.subscription.startDate.toLocaleDateString('fr-FR'));
      console.log('Fin:', user.subscription.endDate.toLocaleDateString('fr-FR'));
      
      const isExpired = user.subscription.endDate < new Date();
      console.log('Expiré:', isExpired ? 'OUI ❌' : 'NON ✅');
      console.log('');

      // Vérifier l'accès aux dictées
      const quotas = {
        'demo': 0,
        'etudiant': 10,
        'premium': -1,
        'etablissement': -1
      };

      const dictationQuota = quotas[user.subscription.plan];
      console.log('📚 ACCÈS AUX DICTÉES');
      if (dictationQuota === 0) {
        console.log('Statut: 🚫 BLOQUÉ (plan gratuit)');
      } else if (dictationQuota === -1) {
        console.log('Statut: ✅ ILLIMITÉ');
      } else {
        console.log('Statut: ✅ LIMITÉ à', dictationQuota, 'dictées/jour');
      }
      console.log('');

      // Diagnostic
      if (user.subscription.plan !== 'etablissement') {
        console.log('⚠️ PROBLÈME DÉTECTÉ!');
        console.log('Le plan devrait être "etablissement" mais est:', user.subscription.plan);
        console.log('\n💡 SOLUTION: Exécutez le script de correction:');
        console.log('   node fix-professeur-subscription.js\n');
      } else if (isExpired) {
        console.log('⚠️ PROBLÈME DÉTECTÉ!');
        console.log('L\'abonnement est expiré!');
        console.log('\n💡 SOLUTION: Exécutez le script de correction:');
        console.log('   node fix-professeur-subscription.js\n');
      } else {
        console.log('✅ TOUT EST CORRECT!');
        console.log('Le compte devrait avoir accès aux dictées.');
        console.log('\n💡 Si vous voyez toujours l\'erreur:');
        console.log('   1. Déconnectez-vous');
        console.log('   2. Reconnectez-vous avec: professeur1@francais-fluide.com / Prof123!');
        console.log('   3. Rechargez la page /dictation\n');
      }

    } else {
      console.log('❌ AUCUN ABONNEMENT!');
      console.log('\n💡 SOLUTION: Exécutez le script de correction:');
      console.log('   node fix-professeur-subscription.js\n');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProfesseur();
