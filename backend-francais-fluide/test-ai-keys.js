// test-ai-keys.js
// Script pour tester les clés API OpenAI et Anthropic

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testOpenAI() {
  console.log('\n🔍 Test OpenAI API...');
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('❌ OPENAI_API_KEY non définie');
    console.log('   Vérifiez que le fichier .env existe et contient OPENAI_API_KEY');
    return false;
  }
  
  console.log('✅ OPENAI_API_KEY définie');
  console.log(`   Clé : ${apiKey.substring(0, 20)}...`);
  
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ OpenAI API fonctionne');
      console.log(`   Modèles disponibles : ${data.data.length}`);
      
      // Vérifier GPT-4
      const hasGPT4 = data.data.some(m => m.id.includes('gpt-4'));
      if (hasGPT4) {
        console.log('✅ Accès à GPT-4 confirmé');
      } else {
        console.log('⚠️  Pas d\'accès à GPT-4 (utiliser gpt-3.5-turbo)');
      }
      
      return true;
    } else {
      const error = await response.json();
      console.log('❌ Erreur OpenAI API:', error.error?.message || 'Erreur inconnue');
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur de connexion OpenAI:', error.message);
    return false;
  }
}

async function testAnthropic() {
  console.log('\n🔍 Test Anthropic API...');
  
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('❌ ANTHROPIC_API_KEY non définie');
    return false;
  }
  
  console.log('✅ ANTHROPIC_API_KEY définie');
  console.log(`   Clé : ${apiKey.substring(0, 20)}...`);
  
  try {
    // Test simple avec Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Bonjour',
          },
        ],
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Anthropic API fonctionne');
      console.log(`   Modèle testé : claude-3-haiku`);
      console.log(`   Réponse : ${data.content[0].text}`);
      return true;
    } else {
      const error = await response.json();
      console.log('❌ Erreur Anthropic API:', error.error?.message || 'Erreur inconnue');
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur de connexion Anthropic:', error.message);
    return false;
  }
}

async function testAIGeneration() {
  console.log('\n🧪 Test de génération d\'exercice...');
  
  const provider = process.env.AI_PROVIDER || 'openai';
  console.log(`   Provider configuré : ${provider}`);
  
  // Tester une génération simple
  if (provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY;
    try {
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
              content: 'Tu es un expert en français. Réponds en JSON.',
            },
            {
              role: 'user',
              content: 'Crée une phrase simple en français avec le mot "soleil".',
            },
          ],
          max_tokens: 50,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Génération OpenAI réussie');
        console.log(`   Réponse : ${data.choices[0].message.content}`);
        return true;
      }
    } catch (error) {
      console.log('❌ Erreur de génération:', error.message);
      return false;
    }
  }
  
  return false;
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   Test des Clés API - Français Fluide');
  console.log('═══════════════════════════════════════════════════');
  
  const openaiOk = await testOpenAI();
  const anthropicOk = await testAnthropic();
  const generationOk = await testAIGeneration();
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   Résumé des Tests');
  console.log('═══════════════════════════════════════════════════');
  console.log(`OpenAI API     : ${openaiOk ? '✅ OK' : '❌ ERREUR'}`);
  console.log(`Anthropic API  : ${anthropicOk ? '✅ OK' : '❌ ERREUR'}`);
  console.log(`Génération IA  : ${generationOk ? '✅ OK' : '❌ ERREUR'}`);
  console.log('═══════════════════════════════════════════════════\n');
  
  if (openaiOk && anthropicOk) {
    console.log('🎉 Toutes les clés API sont fonctionnelles !');
    console.log('   Vous pouvez générer des exercices avec l\'IA.\n');
  } else {
    console.log('⚠️  Certaines clés API ne fonctionnent pas.');
    console.log('   Vérifiez votre fichier .env\n');
  }
}

main().catch(console.error);
