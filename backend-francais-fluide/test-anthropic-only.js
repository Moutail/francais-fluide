// test-anthropic-only.js
// Test uniquement de la clé Anthropic

const fs = require('fs');
const path = require('path');

// Lire le fichier .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Extraire la clé Anthropic
let anthropicKey = null;
envContent.split('\n').forEach(line => {
  if (line.includes('ANTHROPIC_API_KEY')) {
    const parts = line.split('=');
    if (parts.length >= 2) {
      anthropicKey = parts.slice(1).join('=').trim();
    }
  }
});

async function testAnthropic() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   🤖 Test Anthropic Claude API');
  console.log('═══════════════════════════════════════════════════\n');
  
  if (!anthropicKey) {
    console.log('❌ ANTHROPIC_API_KEY non trouvée dans .env\n');
    return false;
  }
  
  console.log('✅ Clé Anthropic trouvée');
  console.log(`   Préfixe : ${anthropicKey.substring(0, 20)}...`);
  console.log(`   Longueur : ${anthropicKey.length} caractères\n`);
  
  try {
    console.log('📡 Test 1 : Connexion à l\'API...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: 'Dis "Bonjour" en français',
          },
        ],
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connexion réussie !\n');
      console.log('📊 Détails de la réponse :');
      console.log(`   Modèle : ${data.model}`);
      console.log(`   Réponse : "${data.content[0].text}"`);
      console.log(`   Tokens input : ${data.usage.input_tokens}`);
      console.log(`   Tokens output : ${data.usage.output_tokens}`);
      console.log(`   Total tokens : ${data.usage.input_tokens + data.usage.output_tokens}\n`);
      
      // Test 2 : Génération d'un exercice
      console.log('📝 Test 2 : Génération d\'un exercice de grammaire...');
      const exerciseResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 200,
          messages: [
            {
              role: 'user',
              content: 'Crée une question de grammaire française simple sur l\'accord des adjectifs. Format : Question, 3 options, réponse correcte, explication courte.',
            },
          ],
        }),
      });
      
      if (exerciseResponse.ok) {
        const exerciseData = await exerciseResponse.json();
        console.log('✅ Génération réussie !\n');
        console.log('📝 Exercice généré :');
        console.log(exerciseData.content[0].text);
        console.log(`\n💰 Tokens utilisés : ${exerciseData.usage.input_tokens + exerciseData.usage.output_tokens}`);
        
        // Calcul du coût (Haiku : $0.25/1M input, $1.25/1M output)
        const inputCost = (exerciseData.usage.input_tokens / 1000000) * 0.25;
        const outputCost = (exerciseData.usage.output_tokens / 1000000) * 1.25;
        const totalCost = inputCost + outputCost;
        console.log(`💵 Coût : $${totalCost.toFixed(6)} (~${(totalCost * 1000).toFixed(3)} cents)\n`);
        
        // Estimation du nombre d'exercices possibles avec 5$
        const exercisesWithBudget = Math.floor(5 / totalCost);
        console.log(`📊 Avec 5 $US, vous pouvez générer ~${exercisesWithBudget} exercices similaires\n`);
      }
      
      console.log('═══════════════════════════════════════════════════');
      console.log('   ✅ RÉSULTAT : Clé Anthropic FONCTIONNELLE !');
      console.log('═══════════════════════════════════════════════════\n');
      console.log('🎉 Votre clé Anthropic fonctionne parfaitement !');
      console.log('✨ Vous pouvez générer des exercices avec Claude');
      console.log('💡 Utilisez claude-3-haiku pour économiser vos crédits\n');
      
      return true;
    } else {
      const error = await response.json();
      console.log(`❌ Erreur API : ${error.error?.message || error.message || 'Erreur inconnue'}`);
      console.log(`📄 Code HTTP : ${response.status}\n`);
      
      if (response.status === 401) {
        console.log('🔑 La clé API est invalide ou expirée');
        console.log('💡 Vérifiez votre clé sur https://console.anthropic.com/settings/keys\n');
      } else if (response.status === 429) {
        console.log('⏱️  Limite de taux atteinte');
        console.log('💡 Attendez quelques secondes et réessayez\n');
      }
      
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur de connexion : ${error.message}\n`);
    return false;
  }
}

testAnthropic().catch(console.error);
