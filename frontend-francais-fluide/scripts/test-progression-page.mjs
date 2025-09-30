// scripts/test-progression-page.mjs
// Script pour tester la page de progression

const BACKEND_URL = 'http://localhost:3001';

async function testProgressionPage() {
  console.log('🔍 TEST PAGE PROGRESSION');
  console.log('='.repeat(50));

  try {
    // Étape 1: Connexion
    console.log('\n📝 Étape 1: Connexion');
    const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'etudiant@test.com',
        password: 'Test!1234',
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Échec de la connexion');
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Connexion réussie');
    console.log('👤 Utilisateur:', loginData.user?.name);
    console.log('🔑 Token reçu:', loginData.token ? 'Oui' : 'Non');

    // Étape 2: Test de l'API de progression (comme le fait la page)
    console.log('\n📝 Étape 2: Test API de progression');
    const progressResponse = await fetch(`${BACKEND_URL}/api/progress`, {
      headers: {
        Authorization: `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!progressResponse.ok) {
      console.log('❌ Erreur API de progression');
      const errorData = await progressResponse.json().catch(() => ({}));
      console.log('📝 Erreur:', errorData.error);
      return;
    }

    const progressData = await progressResponse.json();
    console.log('✅ API de progression accessible');
    console.log('📊 Structure de la réponse:', {
      success: progressData.success,
      hasData: !!progressData.data,
      dataKeys: progressData.data ? Object.keys(progressData.data) : [],
    });

    if (progressData.success && progressData.data) {
      console.log('📊 Données de progression:', {
        niveau: progressData.data.level,
        mots: progressData.data.wordsWritten,
        precision: progressData.data.accuracy,
        exercices: progressData.data.exercisesCompleted,
        serie: progressData.data.currentStreak,
      });

      // Étape 3: Simulation de la logique de la page
      console.log('\n📝 Étape 3: Simulation de la logique de la page');

      // Vérifier que les données nécessaires sont présentes
      const requiredFields = [
        'wordsWritten',
        'accuracy',
        'timeSpent',
        'exercisesCompleted',
        'currentStreak',
        'level',
        'xp',
      ];
      const missingFields = requiredFields.filter(field => !(field in progressData.data));

      if (missingFields.length === 0) {
        console.log('✅ Toutes les données requises sont présentes');
      } else {
        console.log('❌ Données manquantes:', missingFields);
      }

      // Simuler la génération des objectifs hebdomadaires
      const weeklyGoals = [
        {
          id: 'words',
          title: 'Mots à écrire',
          target: 10000,
          current: progressData.data.wordsWritten,
          unit: 'mots',
        },
        {
          id: 'time',
          title: 'Temps de pratique',
          target: 300,
          current: progressData.data.timeSpent,
          unit: 'minutes',
        },
        {
          id: 'exercises',
          title: 'Exercices complétés',
          target: 50,
          current: progressData.data.exercisesCompleted,
          unit: 'exercices',
        },
      ];

      console.log(
        '📊 Objectifs hebdomadaires générés:',
        weeklyGoals.map(goal => ({
          title: goal.title,
          progress: `${goal.current}/${goal.target} ${goal.unit}`,
          percentage: Math.round((goal.current / goal.target) * 100),
        }))
      );

      // Simuler la génération des succès
      const achievements = [
        {
          id: 'streak-7',
          title: 'Série de 7 jours',
          unlocked: progressData.data.currentStreak >= 7,
          progress: Math.min(progressData.data.currentStreak, 7),
          maxProgress: 7,
        },
        {
          id: 'words-10000',
          title: 'Écrivain prolifique',
          unlocked: progressData.data.wordsWritten >= 10000,
          progress: Math.min(progressData.data.wordsWritten, 10000),
          maxProgress: 10000,
        },
        {
          id: 'accuracy-95',
          title: 'Maître de la précision',
          unlocked: progressData.data.accuracy >= 95,
          progress: Math.min(progressData.data.accuracy, 95),
          maxProgress: 95,
        },
      ];

      console.log(
        '📊 Succès générés:',
        achievements.map(achievement => ({
          title: achievement.title,
          unlocked: achievement.unlocked ? '✅' : '❌',
          progress: `${achievement.progress}/${achievement.maxProgress}`,
        }))
      );
    } else {
      console.log('❌ Structure de données incorrecte');
      console.log('📝 Réponse complète:', JSON.stringify(progressData, null, 2));
    }
  } catch (error) {
    console.log('❌ Erreur générale:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Test terminé');
  console.log('\n💡 Instructions pour tester dans le navigateur:');
  console.log('1. Allez sur http://localhost:3000');
  console.log('2. Connectez-vous avec: etudiant@test.com / Test!1234');
  console.log('3. Cliquez sur "Progression" dans le menu');
  console.log("4. Vérifiez que la page s'affiche sans erreur");
}

testProgressionPage().catch(console.error);
