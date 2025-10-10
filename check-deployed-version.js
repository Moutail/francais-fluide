// Script pour vérifier quelle version est déployée sur Vercel
const https = require('https');
const { execSync } = require('child_process');

const VERCEL_URL = 'https://francais-fluide.vercel.app'; // Remplacez par votre URL

console.log('\n🔍 VÉRIFICATION DE LA VERSION DÉPLOYÉE\n');
console.log('═══════════════════════════════════════════════════\n');

// 1. Obtenir le dernier commit local
console.log('📋 Version Locale:');
try {
  const localCommit = execSync('git log -1 --format="%H %s"').toString().trim();
  const localCommitShort = execSync('git log -1 --format="%h"').toString().trim();
  const localDate = execSync('git log -1 --format="%ci"').toString().trim();
  
  console.log(`   Commit: ${localCommitShort}`);
  console.log(`   Message: ${localCommit.split(' ').slice(1).join(' ')}`);
  console.log(`   Date: ${localDate}`);
} catch (error) {
  console.log('   ❌ Impossible de récupérer les infos Git');
}

console.log('\n📡 Version Déployée sur Vercel:');

// 2. Vérifier la version déployée
https.get(`${VERCEL_URL}/_next/static/chunks/main.js`, (res) => {
  const lastModified = res.headers['last-modified'];
  const etag = res.headers['etag'];
  const cacheControl = res.headers['cache-control'];
  
  console.log(`   URL: ${VERCEL_URL}`);
  console.log(`   Dernière modification: ${lastModified || 'Non disponible'}`);
  console.log(`   ETag: ${etag || 'Non disponible'}`);
  console.log(`   Cache-Control: ${cacheControl || 'Non disponible'}`);
  
  // Calculer l'âge du déploiement
  if (lastModified) {
    const deployDate = new Date(lastModified);
    const now = new Date();
    const diffMinutes = Math.floor((now - deployDate) / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    console.log(`\n⏰ Âge du déploiement:`);
    if (diffDays > 0) {
      console.log(`   ${diffDays} jour(s) ${diffHours % 24} heure(s)`);
    } else if (diffHours > 0) {
      console.log(`   ${diffHours} heure(s) ${diffMinutes % 60} minute(s)`);
    } else {
      console.log(`   ${diffMinutes} minute(s)`);
    }
    
    // Avertissement si le déploiement est ancien
    if (diffHours > 24) {
      console.log(`\n   ⚠️  Le déploiement date de plus de 24h`);
      console.log(`   💡 Vos modifications récentes ne sont peut-être pas déployées`);
    } else if (diffMinutes < 10) {
      console.log(`\n   ✅ Déploiement très récent !`);
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('\n💡 ACTIONS RECOMMANDÉES:\n');
  
  if (lastModified) {
    const deployDate = new Date(lastModified);
    const now = new Date();
    const diffMinutes = Math.floor((now - deployDate) / (1000 * 60));
    
    if (diffMinutes > 60) {
      console.log('1. ⚠️  Le déploiement semble ancien');
      console.log('   → Exécutez: force-redeploy.bat');
      console.log('   → Ou allez sur Vercel Dashboard et redéployez\n');
    } else {
      console.log('1. ✅ Le déploiement est récent\n');
    }
  }
  
  console.log('2. Vider le cache du navigateur:');
  console.log('   → Ctrl + Shift + Delete');
  console.log('   → Cochez "Cookies" et "Cache"');
  console.log('   → Effacer les données\n');
  
  console.log('3. Tester en mode incognito:');
  console.log('   → Ctrl + Shift + N (Chrome/Edge)');
  console.log('   → Visitez votre site\n');
  
  console.log('4. Désinscrire les Service Workers:');
  console.log('   → F12 → Application → Service Workers');
  console.log('   → Cliquez sur "Unregister"\n');
  
  console.log('═══════════════════════════════════════════════════\n');
  
}).on('error', (error) => {
  console.log(`   ❌ Erreur: ${error.message}`);
  console.log('\n💡 Vérifiez que:');
  console.log('   1. L\'URL Vercel est correcte dans ce script');
  console.log('   2. Le site est bien déployé et accessible');
  console.log('   3. Vous avez une connexion internet\n');
});

// 3. Vérifier le statut de Vercel
console.log('\n🌐 Vérification du statut de Vercel...');
https.get('https://status.vercel.com/api/v2/status.json', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const status = JSON.parse(data);
      console.log(`   Statut: ${status.status.description}`);
      
      if (status.status.indicator !== 'none') {
        console.log(`   ⚠️  Incident en cours: ${status.status.indicator}`);
        console.log(`   🔗 Plus d'infos: https://status.vercel.com`);
      }
    } catch (error) {
      console.log('   ⚠️  Impossible de vérifier le statut');
    }
  });
}).on('error', () => {
  console.log('   ⚠️  Impossible de vérifier le statut de Vercel');
});
