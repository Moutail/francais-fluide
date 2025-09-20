// test-grammar-api.js
// Script de test pour l'API de correction grammaticale

const API_BASE_URL = 'http://localhost:3000/api/grammar';

// Fonction pour tester l'API
async function testAPI() {
  console.log('🧪 Test de l\'API de correction grammaticale...\n');

  const testCases = [
    {
      name: 'Texte correct',
      text: 'Une belle maison et un grand jardin',
      expectedErrors: 0
    },
    {
      name: 'Erreur d\'accord',
      text: 'Une belle maison et un grande jardin',
      expectedErrors: 1
    },
    {
      name: 'Barbarismes',
      text: 'Au jour d\'aujourd\'hui, je vais monter en haut',
      expectedErrors: 4 // LanguageTool + détecteur local
    },
    {
      name: 'Anglicismes',
      text: 'Au final, j\'ai un problème avec cette situation',
      expectedErrors: 2
    },
    {
      name: 'Texte complexe',
      text: 'Malgré que j\'aie des difficultés, je vais pallier à ce problème au jour d\'aujourd\'hui. Au final, il faut que je sois plus attentif.',
      expectedErrors: 5 // LanguageTool + détecteur local
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    try {
      console.log(`📝 Test: ${testCase.name}`);
      console.log(`   Texte: "${testCase.text}"`);
      
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testCase.text,
          action: 'analyze',
          useLanguageTool: true, // Utiliser LanguageTool pour une meilleure détection
          maxErrors: 10
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erreur inconnue');
      }

      const errorCount = data.data.analysis.errors.length;
      const passed = errorCount === testCase.expectedErrors;
      
      console.log(`   Erreurs détectées: ${errorCount} (attendu: ${testCase.expectedErrors})`);
      console.log(`   Précision: ${data.data.metrics.accuracy}%`);
      console.log(`   Cache: ${data.data.metrics.cacheSize} entrées`);
      console.log(`   Rate limit: ${data.data.metrics.rateLimitRemaining} requêtes restantes`);
      
      if (data.data.analysis.errors.length > 0) {
        console.log(`   Erreurs trouvées:`);
        data.data.analysis.errors.forEach((error, index) => {
          console.log(`     ${index + 1}. ${error.message}`);
          if (error.replacements.length > 0) {
            console.log(`        Suggestions: ${error.replacements.join(', ')}`);
          }
        });
      }
      
      if (passed) {
        console.log(`   ✅ PASSÉ\n`);
        passedTests++;
      } else {
        console.log(`   ❌ ÉCHOUÉ\n`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERREUR: ${error.message}\n`);
    }
  }

  console.log(`📊 Résultats: ${passedTests}/${totalTests} tests passés`);
  console.log(`📈 Taux de réussite: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  return {
    passed: passedTests,
    total: totalTests,
    successRate: Math.round((passedTests / totalTests) * 100)
  };
}

// Test de performance
async function testPerformance() {
  console.log('\n⚡ Test de performance...\n');
  
  const testText = 'Malgré que j\'aie des difficultés, je vais pallier à ce problème au jour d\'aujourd\'hui. Au final, il faut que je sois plus attentif.';
  const iterations = 5;
  
  const startTime = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testText,
        action: 'analyze',
        useLanguageTool: false,
        maxErrors: 10
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Erreur inconnue');
    }
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / iterations;
  
  console.log(`📊 Performance:`);
  console.log(`   Itérations: ${iterations}`);
  console.log(`   Temps total: ${totalTime}ms`);
  console.log(`   Temps moyen: ${avgTime.toFixed(2)}ms`);
  
  return {
    iterations,
    totalTime,
    avgTime: Math.round(avgTime * 100) / 100
  };
}

// Test du cache
async function testCache() {
  console.log('\n💾 Test du cache...\n');
  
  const testText = 'Une belle maison et un grande jardin';
  
  // Premier appel (pas de cache)
  const start1 = Date.now();
  const response1 = await fetch(`${API_BASE_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: testText,
      action: 'analyze',
      useLanguageTool: false,
      maxErrors: 10
    })
  });
  const time1 = Date.now() - start1;
  
  if (!response1.ok) {
    throw new Error(`HTTP ${response1.status}: ${response1.statusText}`);
  }
  
  const data1 = await response1.json();
  if (!data1.success) {
    throw new Error(data1.error || 'Erreur inconnue');
  }
  
  // Deuxième appel (avec cache)
  const start2 = Date.now();
  const response2 = await fetch(`${API_BASE_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: testText,
      action: 'analyze',
      useLanguageTool: false,
      maxErrors: 10
    })
  });
  const time2 = Date.now() - start2;
  
  if (!response2.ok) {
    throw new Error(`HTTP ${response2.status}: ${response2.statusText}`);
  }
  
  const data2 = await response2.json();
  if (!data2.success) {
    throw new Error(data2.error || 'Erreur inconnue');
  }
  
  console.log(`📊 Cache:`);
  console.log(`   Premier appel: ${time1}ms`);
  console.log(`   Deuxième appel: ${time2}ms`);
  console.log(`   Amélioration: ${Math.round(((time1 - time2) / time1) * 100)}%`);
  console.log(`   Cache size: ${data2.data.metrics.cacheSize}`);
  
  return {
    firstCall: time1,
    secondCall: time2,
    improvement: Math.round(((time1 - time2) / time1) * 100)
  };
}

// Test des informations de l'API
async function testAPIInfo() {
  console.log('\n📋 Test des informations de l\'API...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur inconnue');
    }
    
    console.log(`📊 Informations de l'API:`);
    console.log(`   Version: ${data.data.version}`);
    console.log(`   Langues supportées: ${data.data.supportedLanguages.join(', ')}`);
    console.log(`   Longueur max: ${data.data.maxTextLength} caractères`);
    console.log(`   Fonctionnalités: ${Object.keys(data.data.features).join(', ')}`);
    console.log(`   Règles de grammaire: ${data.data.grammarRules.total}`);
    console.log(`   Catégories: ${data.data.grammarRules.categories.join(', ')}`);
    console.log(`   Règles avancées: ${data.data.grammarRules.advanced.join(', ')}`);
    
    return data.data;
    
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}\n`);
    return null;
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Démarrage des tests de l\'API de correction grammaticale\n');
  
  try {
    const apiInfo = await testAPIInfo();
    const grammarResults = await testAPI();
    const performanceResults = await testPerformance();
    const cacheResults = await testCache();
    
    console.log('\n📋 Résumé des tests:');
    console.log(`   Tests de grammaire: ${grammarResults.passed}/${grammarResults.total} (${grammarResults.successRate}%)`);
    console.log(`   Performance: ${performanceResults.avgTime}ms en moyenne`);
    console.log(`   Cache: ${cacheResults.improvement}% d'amélioration`);
    
    if (apiInfo) {
      console.log(`   API version: ${apiInfo.version}`);
    }
    
    return {
      apiInfo,
      grammar: grammarResults,
      performance: performanceResults,
      cache: cacheResults
    };
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    return null;
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runAllTests().then(results => {
    if (results) {
      console.log('\n✅ Tests terminés avec succès!');
      process.exit(0);
    } else {
      console.log('\n❌ Tests échoués!');
      process.exit(1);
    }
  });
}

module.exports = {
  testAPI,
  testPerformance,
  testCache,
  testAPIInfo,
  runAllTests
};
