// Script pour lister tous les utilisateurs et leurs abonnements
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listAllUsers() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    LISTE DE TOUS LES UTILISATEURS                             ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

  try {
    const users = await prisma.user.findMany({
      include: {
        subscription: true,
        progress: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (users.length === 0) {
      console.log('⚠️ Aucun utilisateur trouvé dans la base de données.\n');
      return;
    }

    console.log(`📊 Total: ${users.length} utilisateur(s)\n`);
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 ${user.name || 'Sans nom'}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🎭 Rôle: ${user.role}`);
      console.log(`   ✅ Actif: ${user.isActive ? 'Oui' : 'Non'}`);
      
      if (user.subscription) {
        const plan = user.subscription.plan;
        const status = user.subscription.status;
        const isExpired = user.subscription.endDate < new Date();
        
        let planEmoji = '📦';
        if (plan === 'etablissement') planEmoji = '🏢';
        else if (plan === 'premium') planEmoji = '⭐';
        else if (plan === 'etudiant') planEmoji = '🎓';
        else if (plan === 'demo') planEmoji = '🆓';

        console.log(`   ${planEmoji} Plan: ${plan.toUpperCase()}`);
        console.log(`   📊 Statut: ${status}${isExpired ? ' (EXPIRÉ)' : ''}`);
        console.log(`   📅 Expire le: ${user.subscription.endDate.toLocaleDateString('fr-FR')}`);

        // Accès aux dictées
        const quotas = {
          'demo': 0,
          'etudiant': 10,
          'premium': -1,
          'etablissement': -1
        };
        const dictationAccess = quotas[plan];
        if (dictationAccess === 0) {
          console.log(`   📚 Dictées: 🚫 BLOQUÉ`);
        } else if (dictationAccess === -1) {
          console.log(`   📚 Dictées: ✅ ILLIMITÉ`);
        } else {
          console.log(`   📚 Dictées: ✅ ${dictationAccess}/jour`);
        }
      } else {
        console.log(`   ❌ AUCUN ABONNEMENT`);
        console.log(`   📚 Dictées: 🚫 BLOQUÉ (pas d'abonnement)`);
      }

      console.log(`   🆔 ID: ${user.id}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════════════════════════');
    
    // Statistiques
    const stats = {
      total: users.length,
      withSubscription: users.filter(u => u.subscription).length,
      withoutSubscription: users.filter(u => !u.subscription).length,
      byPlan: {
        demo: users.filter(u => u.subscription?.plan === 'demo').length,
        etudiant: users.filter(u => u.subscription?.plan === 'etudiant').length,
        premium: users.filter(u => u.subscription?.plan === 'premium').length,
        etablissement: users.filter(u => u.subscription?.plan === 'etablissement').length,
      },
      byRole: {
        user: users.filter(u => u.role === 'user').length,
        teacher: users.filter(u => u.role === 'teacher').length,
        admin: users.filter(u => u.role === 'admin').length,
        super_admin: users.filter(u => u.role === 'super_admin').length,
        tester: users.filter(u => u.role === 'tester').length,
      }
    };

    console.log('\n📊 STATISTIQUES');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log(`Total utilisateurs: ${stats.total}`);
    console.log(`Avec abonnement: ${stats.withSubscription}`);
    console.log(`Sans abonnement: ${stats.withoutSubscription}`);
    
    console.log('\n📦 Par Plan:');
    console.log(`   🆓 Demo: ${stats.byPlan.demo}`);
    console.log(`   🎓 Étudiant: ${stats.byPlan.etudiant}`);
    console.log(`   ⭐ Premium: ${stats.byPlan.premium}`);
    console.log(`   🏢 Établissement: ${stats.byPlan.etablissement}`);

    console.log('\n🎭 Par Rôle:');
    console.log(`   👤 User: ${stats.byRole.user}`);
    console.log(`   👨‍🏫 Teacher: ${stats.byRole.teacher}`);
    console.log(`   🔧 Admin: ${stats.byRole.admin}`);
    console.log(`   👑 Super Admin: ${stats.byRole.super_admin}`);
    console.log(`   🧪 Tester: ${stats.byRole.tester}`);

    console.log('\n═══════════════════════════════════════════════════════════════════════════════\n');

    // Utilisateurs sans abonnement
    const usersWithoutSub = users.filter(u => !u.subscription);
    if (usersWithoutSub.length > 0) {
      console.log('⚠️ UTILISATEURS SANS ABONNEMENT:');
      usersWithoutSub.forEach(u => {
        console.log(`   - ${u.email} (${u.role})`);
      });
      console.log('\n💡 Ces utilisateurs n\'ont pas accès aux dictées.');
      console.log('   Utilisez create-test-accounts.js pour créer des comptes complets.\n');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllUsers();
