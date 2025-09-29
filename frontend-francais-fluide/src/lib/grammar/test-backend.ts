// src/lib/grammar/test-backend.ts
import { grammarBackendService } from './backend-service';

// Tests pour valider le backend de correction grammaticale
export async function testGrammarBackend() {
  console.log('🧪 Test du backend de correction grammaticale...\n');

  const testCases = [
    {
      name: 'Accord des adjectifs',
      text: 'Une belle maison et un grand jardin',
      expectedErrors: 0
    },
    {
      name: 'Erreur d\'accord',
      text: 'Une belle maison et un grande jardin',
      expectedErrors: 1
    },
    {
      name: 'Concordance des temps',
      text: 'Quand j\'étais petit, je mangeais des bonbons',
      expectedErrors: 0
    },
    {
      name: 'Erreur de concordance',
      text: 'Quand j\'étais petit, je mange des bonbons',
      expectedErrors: 1
    },
    {
      name: 'Subjonctif',
      text: 'Il faut que je sois à l\'heure',
      expectedErrors: 0
    },
    {
      name: 'Erreur de subjonctif',
      text: 'Il faut que je suis à l\'heure',
      expectedErrors: 1
    },
    {
      name: 'Barbarismes',
      text: 'Au jour d\'aujourd\'hui, je vais monter en haut',
      expectedErrors: 2
    },
    {
      name: 'Anglicismes',
      text: 'Au final, j\'ai un problème avec cette situation',
      expectedErrors: 2
    },
    {
      name: 'Pléonasmes',
      text: 'Je vais sortir dehors et descendre en bas',
      expectedErrors: 2
    },
    {
      name: 'Texte complexe',
      text: 'Malgré que j\'aie des difficultés, je vais pallier à ce problème au jour d\'aujourd\'hui. Au final, il faut que je sois plus attentif.',
      expectedErrors: 4
    }
  ];

  let passedTests = 0;
  const totalTests = testCases.length;

  for (const testCase of testCases) {
    try {
      console.log(`📝 Test: ${testCase.name}`);
      console.log(`   Texte: "${testCase.text}"`);
      
      const result = await grammarBackendService.analyzeText(testCase.text, {
        useLanguageTool: false, // Test local seulement
        maxErrors: 10
      });
      
      const errorCount = result.errors.length;
      const passed = errorCount === testCase.expectedErrors;
      
      console.log(`   Erreurs détectées: ${errorCount} (attendu: ${testCase.expectedErrors})`);
      
      if (result.errors.length > 0) {
        console.log(`   Erreurs trouvées:`);
        result.errors.forEach((error, index) => {
          console.log(`     ${index + 1}. ${error.message}`);
          if (error.suggestions.length > 0) {
            console.log(`        Suggestions: ${error.suggestions.join(', ')}`);
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
      console.log(`   ❌ ERREUR: ${error}\n`);
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
export async function testPerformance() {
  console.log('\n⚡ Test de performance...\n');
  
  const testText = 'Malgré que j\'aie des difficultés, je vais pallier à ce problème au jour d\'aujourd\'hui. Au final, il faut que je sois plus attentif.';
  const iterations = 10;
  
  const startTime = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    await grammarBackendService.analyzeText(testText, {
      useLanguageTool: false,
      maxErrors: 10
    });
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / iterations;
  
  console.log(`📊 Performance:`);
  console.log(`   Itérations: ${iterations}`);
  console.log(`   Temps total: ${totalTime}ms`);
  console.log(`   Temps moyen: ${avgTime.toFixed(2)}ms`);
  console.log(`   Taille du cache: ${grammarBackendService.getCacheSize()}`);
  
  return {
    iterations,
    totalTime,
    avgTime: Math.round(avgTime * 100) / 100
  };
}

// Test du cache
export async function testCache() {
  console.log('\n💾 Test du cache...\n');
  
  const testText = 'Une belle maison et un grande jardin';
  
  // Premier appel (pas de cache)
  const start1 = Date.now();
  const result1 = await grammarBackendService.analyzeText(testText);
  const time1 = Date.now() - start1;
  
  // Deuxième appel (avec cache)
  const start2 = Date.now();
  const result2 = await grammarBackendService.analyzeText(testText);
  const time2 = Date.now() - start2;
  
  console.log(`📊 Cache:`);
  console.log(`   Premier appel: ${time1}ms`);
  console.log(`   Deuxième appel: ${time2}ms`);
  console.log(`   Amélioration: ${Math.round(((time1 - time2) / time1) * 100)}%`);
  console.log(`   Résultats identiques: ${JSON.stringify(result1) === JSON.stringify(result2)}`);
  
  return {
    firstCall: time1,
    secondCall: time2,
    improvement: Math.round(((time1 - time2) / time1) * 100)
  };
}

// Exécuter tous les tests
export async function runAllTests() {
  console.log('🚀 Démarrage des tests du backend de correction grammaticale\n');
  
  const grammarResults = await testGrammarBackend();
  const performanceResults = await testPerformance();
  const cacheResults = await testCache();
  
  console.log('\n📋 Résumé des tests:');
  console.log(`   Tests de grammaire: ${grammarResults.passed}/${grammarResults.total} (${grammarResults.successRate}%)`);
  console.log(`   Performance: ${performanceResults.avgTime}ms en moyenne`);
  console.log(`   Cache: ${cacheResults.improvement}% d'amélioration`);
  
  return {
    grammar: grammarResults,
    performance: performanceResults,
    cache: cacheResults
  };
}
