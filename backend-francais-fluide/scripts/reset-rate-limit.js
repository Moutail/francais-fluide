// Script pour réinitialiser le rate limiting
const rateLimit = require('express-rate-limit');

console.log('🔄 Réinitialisation du rate limiting...');

// Créer un nouveau limiter avec des paramètres très permissifs
const newLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // 10000 requêtes par 15 minutes
  message: {
    error: 'Trop de requêtes depuis cette IP, réessayez plus tard.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[RATE LIMIT] Skipping for: ${req.method} ${req.path}`);
      return true;
    }
    return false;
  }
});

console.log('✅ Rate limiting réinitialisé avec des paramètres permissifs');
console.log('📊 Configuration:');
console.log('   - Fenêtre: 15 minutes');
console.log('   - Max requêtes: 10000');
console.log('   - Mode développement: Rate limiting désactivé');

// Si on est en mode développement, on peut aussi vider le store
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Mode développement détecté - Rate limiting complètement désactivé');
}

module.exports = newLimiter;