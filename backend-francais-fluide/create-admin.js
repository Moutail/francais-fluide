#!/usr/bin/env node

// Script pour créer un utilisateur administrateur
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  console.log('🔐 Création d\'un utilisateur administrateur\n');

  try {
    // Demander les informations
    const name = await question('Nom complet de l\'administrateur: ');
    const email = await question('Email de l\'administrateur: ');
    const password = await question('Mot de passe (minimum 8 caractères): ');
    const role = await question('Rôle (admin/super_admin) [admin]: ') || 'admin';

    // Validation basique
    if (!name || name.length < 2) {
      console.error('❌ Le nom doit contenir au moins 2 caractères');
      process.exit(1);
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error('❌ Format d\'email invalide');
      process.exit(1);
    }

    if (!password || password.length < 8) {
      console.error('❌ Le mot de passe doit contenir au moins 8 caractères');
      process.exit(1);
    }

    if (!['admin', 'super_admin'].includes(role)) {
      console.error('❌ Le rôle doit être "admin" ou "super_admin"');
      process.exit(1);
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      console.error('❌ Un utilisateur avec cet email existe déjà');
      process.exit(1);
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur avec transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role,
          isActive: true
        }
      });

      // Créer la progression initiale
      await tx.userProgress.create({
        data: {
          userId: user.id,
          wordsWritten: 0,
          accuracy: 0,
          timeSpent: 0,
          exercisesCompleted: 0,
          currentStreak: 0,
          level: 1,
          xp: 0
        }
      });

      // Créer un abonnement premium pour l'admin
      await tx.subscription.create({
        data: {
          userId: user.id,
          plan: 'premium',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 an
        }
      });

      return user;
    });

    console.log('\n✅ Utilisateur administrateur créé avec succès !');
    console.log(`📧 Email: ${result.email}`);
    console.log(`👤 Nom: ${result.name}`);
    console.log(`🔑 Rôle: ${result.role}`);
    console.log(`🆔 ID: ${result.id}`);
    console.log('\n🚀 L\'administrateur peut maintenant se connecter à:');
    console.log('   - Interface utilisateur: http://localhost:3000/auth/login');
    console.log('   - Interface admin: http://localhost:3000/admin');

  } catch (error) {
    console.error('\n❌ Erreur lors de la création:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Gestion des signaux pour nettoyer proprement
process.on('SIGINT', async () => {
  console.log('\n\n👋 Annulation...');
  await prisma.$disconnect();
  rl.close();
  process.exit(0);
});

// Afficher les informations au démarrage
console.log('🏠 FrançaisFluide - Création d\'administrateur');
console.log('===============================================');
console.log('Ce script va créer un utilisateur administrateur pour accéder au panneau d\'administration.');
console.log('Appuyez sur Ctrl+C pour annuler à tout moment.\n');

createAdmin();
