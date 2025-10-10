// Script pour upgrader un utilisateur vers le plan Établissement
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function upgradeUser() {
  const userEmail = 'chaoussicherif07@gmail.com';
  
  console.log('\n🔄 UPGRADE UTILISATEUR VERS PLAN ÉTABLISSEMENT\n');
  console.log('Email:', userEmail);
  
  try {
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { subscription: true }
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    console.log('✅ Utilisateur trouvé:', user.name || user.email);
    console.log('📦 Plan actuel:', user.subscription?.plan || 'AUCUN');
    console.log('📊 Statut actuel:', user.subscription?.status || 'AUCUN');

    // Mettre à jour l'abonnement
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 365); // 1 an

    if (user.subscription) {
      // Mettre à jour l'abonnement existant
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          plan: 'etablissement',
          status: 'active',
          startDate: new Date(),
          endDate: endDate
        }
      });
      console.log('\n✅ Abonnement mis à jour avec succès!');
    } else {
      // Créer un nouvel abonnement
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: 'etablissement',
          status: 'active',
          startDate: new Date(),
          endDate: endDate
        }
      });
      console.log('\n✅ Abonnement créé avec succès!');
    }

    console.log('📦 Nouveau plan: ÉTABLISSEMENT');
    console.log('📊 Statut: ACTIVE');
    console.log('📅 Valide jusqu\'au:', endDate.toLocaleDateString('fr-FR'));
    console.log('\n📚 Accès aux dictées: ✅ ILLIMITÉ');
    console.log('\n🔄 Rechargez la page /dictation dans votre navigateur\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

upgradeUser();
