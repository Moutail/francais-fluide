// test-api-simple.js
// Test simple des clés API

const fs = require('fs');
const path = require('path');

// Lire le fichier .env manuellement
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parser les variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

async function testOpenAI() {
  console.log('\n🔍 Test OpenAI API...\n');
  
  const apiKey = envVars.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('❌ OPENAI_API_KEY non trouvée dans .env');
    return false;
  }
  
  console.log('✅ OPENAI_API_KEY trouvée');
  console.log(`   Clé : ${apiKey.substring(0, 30)}...`);
  console.log(`   Longueur : ${apiKey.length} caractères\n`);
  
  try {
    console.log('   Test de connexion à l\'API OpenAI...');
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Connexion réussie !');
      console.log(`   📊 ${data.data.length} modèles disponibles`);
      
      // Vérifier GPT-4
      const gpt4Models = data.data.filter(m => m.id.includes('gpt-4'));
      const gpt35Models = data.data.filter(m => m.id.includes('gpt-3.5'));
      
      console.log(`   🤖 Modèles GPT-4 : ${gpt4Models.length}`);
      console.log(`   🤖 Modèles GPT-3.5 : ${gpt35Models.length}`);
      
      if (gpt4Models.length > 0) {
        console.log('   ✅ Accès à GPT-4 confirmé');
      } else {
        console.log('   ⚠️  Pas d\'accès à GPT-4 (utilisez GPT-3.5)');
      }
      
      return true;
    } else {
      const error = await response.json();
      console.log(`   ❌ Erreur API : ${error.error?.message || 'Erreur inconnue'}`);
      console.log(`   📄 Code : ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erreur de connexion : ${error.message}`);
    return false;
  }
}

async function testAnthropic() {
  console.log('\n🔍 Test Anthropic API...\n');
  
  const apiKey = envVars.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('❌ ANTHROPIC_API_KEY non trouvée dans .env');
    return false;
  }
  
  console.log('✅ ANTHROPIC_API_KEY trouvée');
  console.log(`   Clé : ${apiKey.substring(0, 30)}...`);
  console.log(`   Longueur : ${apiKey.length} caractères\n`);
  
  try {
    console.log('   Test de connexion à l\'API Anthropic...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 20,
        messages: [
          {
            role: 'user',
            content: 'Dis bonjour en français',
          },
        ],
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Connexion réussie !');
      console.log(`   🤖 Modèle testé : claude-3-haiku`);
      console.log(`   💬 Réponse : "${data.content[0].text}"`);
      return true;
    } else {
      const error = await response.json();
      console.log(`   ❌ Erreur API : ${error.error?.message || 'Erreur inconnue'}`);
      console.log(`   📄 Code : ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erreur de connexion : ${error.message}`);
    return false;
  }
}

async function testGeneration() {
  console.log('\n🧪 Test de Génération d\'Exercice...\n');
  
  const apiKey = envVars.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('   ⚠️  Pas de clé OpenAI, test ignoré');
    return false;
  }
  
  try {
    console.log('   Génération d\'une phrase simple...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tu es un professeur de français. Réponds brièvement.',
          },
          {
            role: 'user',
            content: 'Écris une phrase simple avec le mot "soleil".',
          },
        ],
        max_tokens: 50,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      const generatedText = data.choices[0].message.content;
      console.log('   ✅ Génération réussie !');
      console.log(`   💬 Phrase générée : "${generatedText}"`);
      console.log(`   💰 Tokens utilisés : ${data.usage.total_tokens}`);
      return true;
    } else {
      const error = await response.json();
      console.log(`   ❌ Erreur : ${error.error?.message || 'Erreur inconnue'}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erreur : ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   🤖 Test des Clés API - Français Fluide');
  console.log('═══════════════════════════════════════════════════');
  
  const openaiOk = await testOpenAI();
  const anthropicOk = await testAnthropic();
  const generationOk = await testGeneration();
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   📊 Résumé des Tests');
  console.log('═══════════════════════════════════════════════════\n');
  console.log(`   OpenAI API      : ${openaiOk ? '✅ FONCTIONNE' : '❌ ERREUR'}`);
  console.log(`   Anthropic API   : ${anthropicOk ? '✅ FONCTIONNE' : '❌ ERREUR'}`);
  console.log(`   Génération IA   : ${generationOk ? '✅ FONCTIONNE' : '❌ ERREUR'}`);
  console.log('\n═══════════════════════════════════════════════════\n');
  
  if (openaiOk && anthropicOk) {
    console.log('   🎉 Toutes les clés API fonctionnent parfaitement !');
    console.log('   ✨ Vous pouvez générer des exercices avec l\'IA.\n');
  } else if (openaiOk || anthropicOk) {
    console.log('   ⚠️  Certaines clés fonctionnent, d\'autres non.');
    console.log('   💡 Vérifiez les clés qui ne fonctionnent pas.\n');
  } else {
    console.log('   ❌ Aucune clé API ne fonctionne.');
    console.log('   🔧 Vérifiez vos clés dans le fichier .env\n');
  }
}

main().catch(console.error);
