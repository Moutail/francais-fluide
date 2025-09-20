// examples/grammar-backend-usage.ts
// Exemples d'utilisation du backend de correction grammaticale

import { grammarBackendService } from '../src/lib/grammar/backend-service';

// Exemple 1: Analyse simple
async function exempleAnalyseSimple() {
  console.log('📝 Exemple 1: Analyse simple\n');
  
  const texte = 'Une belle maison et un grande jardin';
  
  try {
    const result = await grammarBackendService.analyzeText(texte, {
      useLanguageTool: false,
      maxErrors: 10
    });
    
    console.log(`Texte: "${texte}"`);
    console.log(`Erreurs détectées: ${result.errors.length}`);
    console.log(`Précision: ${result.statistics.readabilityScore}%`);
    
    if (result.errors.length > 0) {
      console.log('\nErreurs trouvées:');
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.message}`);
        console.log(`     Suggestions: ${error.replacements.join(', ')}`);
      });
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exemple 2: Analyse avec LanguageTool
async function exempleAnalyseAvecLanguageTool() {
  console.log('\n📝 Exemple 2: Analyse avec LanguageTool\n');
  
  const texte = 'Malgré que j\'aie des difficultés, je vais pallier à ce problème au jour d\'aujourd\'hui. Au final, il faut que je sois plus attentif.';
  
  try {
    const result = await grammarBackendService.analyzeText(texte, {
      useLanguageTool: true,
      maxErrors: 20
    });
    
    console.log(`Texte: "${texte}"`);
    console.log(`Erreurs détectées: ${result.errors.length}`);
    console.log(`Précision: ${result.statistics.readabilityScore}%`);
    
    if (result.errors.length > 0) {
      console.log('\nErreurs trouvées:');
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.message}`);
        console.log(`     Règle: ${error.rule.id} (${error.rule.category})`);
        console.log(`     Suggestions: ${error.replacements.join(', ')}`);
      });
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exemple 3: Correction de texte
async function exempleCorrectionTexte() {
  console.log('\n📝 Exemple 3: Correction de texte\n');
  
  const texteOriginal = 'Une belle maison et un grande jardin';
  
  try {
    // Analyser le texte
    const result = await grammarBackendService.analyzeText(texteOriginal, {
      useLanguageTool: false,
      maxErrors: 10
    });
    
    console.log(`Texte original: "${texteOriginal}"`);
    console.log(`Erreurs détectées: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      // Appliquer les corrections
      const corrections = result.errors.map(error => ({
        offset: error.offset,
        length: error.length,
        replacement: error.replacements[0] || error.context.text
      }));
      
      const texteCorrige = grammarBackendService.correctText(texteOriginal, corrections);
      
      console.log(`Texte corrigé: "${texteCorrige}"`);
      
      // Analyser le texte corrigé
      const resultCorrige = await grammarBackendService.analyzeText(texteCorrige, {
        useLanguageTool: false,
        maxErrors: 10
      });
      
      console.log(`Erreurs après correction: ${resultCorrige.errors.length}`);
      console.log(`Précision après correction: ${resultCorrige.statistics.readabilityScore}%`);
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exemple 4: Test de performance
async function exempleTestPerformance() {
  console.log('\n📝 Exemple 4: Test de performance\n');
  
  const texte = 'Malgré que j\'aie des difficultés, je vais pallier à ce problème au jour d\'aujourd\'hui. Au final, il faut que je sois plus attentif.';
  const iterations = 5;
  
  try {
    console.log(`Test avec ${iterations} itérations...`);
    
    const startTime = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      await grammarBackendService.analyzeText(texte, {
        useLanguageTool: false,
        maxErrors: 10
      });
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;
    
    console.log(`Temps total: ${totalTime}ms`);
    console.log(`Temps moyen: ${avgTime.toFixed(2)}ms`);
    console.log(`Taille du cache: ${grammarBackendService.getCacheSize()}`);
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exemple 5: Test du cache
async function exempleTestCache() {
  console.log('\n📝 Exemple 5: Test du cache\n');
  
  const texte = 'Une belle maison et un grande jardin';
  
  try {
    console.log('Premier appel (pas de cache)...');
    const start1 = Date.now();
    const result1 = await grammarBackendService.analyzeText(texte, {
      useLanguageTool: false,
      maxErrors: 10
    });
    const time1 = Date.now() - start1;
    
    console.log(`Temps: ${time1}ms`);
    console.log(`Cache size: ${grammarBackendService.getCacheSize()}`);
    
    console.log('\nDeuxième appel (avec cache)...');
    const start2 = Date.now();
    const result2 = await grammarBackendService.analyzeText(texte, {
      useLanguageTool: false,
      maxErrors: 10
    });
    const time2 = Date.now() - start2;
    
    console.log(`Temps: ${time2}ms`);
    console.log(`Amélioration: ${Math.round(((time1 - time2) / time1) * 100)}%`);
    console.log(`Résultats identiques: ${JSON.stringify(result1) === JSON.stringify(result2)}`);
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exemple 6: Test de rate limiting
async function exempleTestRateLimiting() {
  console.log('\n📝 Exemple 6: Test de rate limiting\n');
  
  const texte = 'Test de rate limiting';
  const clientIP = '127.0.0.1';
  
  try {
    console.log(`Rate limit restant: ${grammarBackendService.getRateLimitRemaining(clientIP)}`);
    
    // Faire plusieurs appels rapides
    for (let i = 0; i < 5; i++) {
      try {
        await grammarBackendService.analyzeText(texte, {
          useLanguageTool: false,
          maxErrors: 10,
          clientIP
        });
        console.log(`Appel ${i + 1}: Succès`);
      } catch (error) {
        console.log(`Appel ${i + 1}: ${error.message}`);
      }
    }
    
    console.log(`Rate limit restant: ${grammarBackendService.getRateLimitRemaining(clientIP)}`);
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exécuter tous les exemples
async function executerTousLesExemples() {
  console.log('🚀 Exemples d\'utilisation du backend de correction grammaticale\n');
  
  try {
    await exempleAnalyseSimple();
    await exempleAnalyseAvecLanguageTool();
    await exempleCorrectionTexte();
    await exempleTestPerformance();
    await exempleTestCache();
    await exempleTestRateLimiting();
    
    console.log('\n✅ Tous les exemples ont été exécutés avec succès!');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'exécution des exemples:', error);
  }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  executerTousLesExemples();
}

export {
  exempleAnalyseSimple,
  exempleAnalyseAvecLanguageTool,
  exempleCorrectionTexte,
  exempleTestPerformance,
  exempleTestCache,
  exempleTestRateLimiting,
  executerTousLesExemples
};
