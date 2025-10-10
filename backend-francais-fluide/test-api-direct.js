// test-api-direct.js
// Test direct avec les clés en dur

async function testOpenAI() {
  console.log('\n🔍 Test OpenAI API...\n');
  
  // Clé fournie par l'utilisateur
  const apiKey = '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';
  
  console.log('✅ Clé OpenAI chargée');
  console.log(`   Longueur : ${apiKey.length} caractères\n`);
  
  try {
    console.log('   📡 Connexion à l\'API OpenAI...');
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
        console.log('   ✅ Accès à GPT-4 confirmé !');
        console.log(`   📝 Exemples : ${gpt4Models.slice(0, 3).map(m => m.id).join(', ')}`);
      } else {
        console.log('   ⚠️  Pas d\'accès à GPT-4');
        console.log('   💡 Vous pouvez utiliser GPT-3.5-turbo');
      }
      
      return true;
    } else {
      const error = await response.json();
      console.log(`   ❌ Erreur API : ${error.error?.message || 'Erreur inconnue'}`);
      console.log(`   📄 Code HTTP : ${response.status}`);
      
      if (response.status === 401) {
        console.log('   🔑 La clé API est invalide ou expirée');
      } else if (response.status === 429) {
        console.log('   ⏱️  Limite de taux atteinte');
      }
      
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erreur de connexion : ${error.message}`);
    return false;
  }
}

async function testAnthropic() {
  console.log('\n🔍 Test Anthropic API...\n');
  
  // Clé fournie par l'utilisateur
  const apiKey = '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';
  
  console.log('✅ Clé Anthropic chargée');
  console.log(`   Longueur : ${apiKey.length} caractères\n`);
  
  try {
    console.log('   📡 Connexion à l\'API Anthropic...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 30,
        messages: [
          {
            role: 'user',
            content: 'Dis bonjour en français en une phrase courte',
          },
        ],
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Connexion réussie !');
      console.log(`   🤖 Modèle testé : claude-3-haiku`);
      console.log(`   💬 Réponse : "${data.content[0].text}"`);
      console.log(`   📊 Tokens utilisés : ${data.usage.input_tokens + data.usage.output_tokens}`);
      return true;
    } else {
      const error = await response.json();
      console.log(`   ❌ Erreur API : ${error.error?.message || error.message || 'Erreur inconnue'}`);
      console.log(`   📄 Code HTTP : ${response.status}`);
      
      if (response.status === 401) {
        console.log('   🔑 La clé API est invalide ou expirée');
      } else if (response.status === 429) {
        console.log('   ⏱️  Limite de taux atteinte');
      }
      
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erreur de connexion : ${error.message}`);
    return false;
  }
}

async function testGeneration() {
  console.log('\n🧪 Test de Génération d\'Exercice...\n');
  
  const apiKey = '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';
  
  try {
    console.log('   📝 Génération d\'une phrase simple avec GPT-3.5...');
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
            content: 'Tu es un professeur de français. Réponds brièvement en une phrase.',
          },
          {
            role: 'user',
            content: 'Écris une belle phrase avec le mot "soleil".',
          },
        ],
        max_tokens: 50,
        temperature: 0.7,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      const generatedText = data.choices[0].message.content;
      console.log('   ✅ Génération réussie !');
      console.log(`   💬 Phrase : "${generatedText}"`);
      console.log(`   💰 Tokens : ${data.usage.total_tokens} (${data.usage.prompt_tokens} prompt + ${data.usage.completion_tokens} completion)`);
      console.log(`   💵 Coût estimé : ~$${(data.usage.total_tokens / 1000 * 0.002).toFixed(4)}`);
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
    console.log('   🎉 PARFAIT ! Toutes les clés API fonctionnent !');
    console.log('   ✨ Vous pouvez générer des exercices avec l\'IA.');
    console.log('   💡 Utilisez GPT-4 pour les textes créatifs');
    console.log('   💡 Utilisez Claude pour la grammaire et les corrections\n');
  } else if (openaiOk || anthropicOk) {
    console.log('   ⚠️  Certaines clés fonctionnent :');
    if (openaiOk) console.log('   ✅ OpenAI fonctionne');
    if (anthropicOk) console.log('   ✅ Anthropic fonctionne');
    console.log('   🔧 Vérifiez les clés qui ne fonctionnent pas\n');
  } else {
    console.log('   ❌ Aucune clé API ne fonctionne.');
    console.log('   🔧 Vérifiez vos clés API\n');
  }
}

main().catch(console.error);
