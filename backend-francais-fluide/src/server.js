// src/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
// Charger les variables d'environnement
require('dotenv').config({ path: '.env' });

// Vérifier et définir les variables d'environnement essentielles
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres123@localhost:5432/francais_fluide?schema=public';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'votre-secret-jwt-super-securise-ici-changez-moi';
}
if (!process.env.PORT) {
  process.env.PORT = 3001;
}
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

console.log('🔧 Variables d\'environnement chargées:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Définie' : '❌ Manquante');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Défini' : '❌ Manquant');
console.log('PORT:', process.env.PORT);
console.log('\n🤖 Clés API IA:');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `✅ Définie (${process.env.OPENAI_API_KEY.substring(0, 20)}...)` : '❌ Manquante');
console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? `✅ Définie (${process.env.ANTHROPIC_API_KEY.substring(0, 20)}...)` : '❌ Manquante');
console.log('AI_PROVIDER:', process.env.AI_PROVIDER || 'non défini (utilisera openai par défaut)');

// Import des routes
const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress-simple');
const aiRoutes = require('./routes/ai');
const subscriptionRoutes = require('./routes/subscription');
const grammarRoutes = require('./routes/grammar');
const grammarEnhancedRoutes = require('./routes/grammar-enhanced');
const exercisesRoutes = require('./routes/exercises');
const telemetryRoutes = require('./routes/telemetry');
const aiEnhancedRoutes = require('./routes/ai-enhanced');
const supportRoutes = require('./routes/support');
const editorRoutes = require('./routes/editor');
const grammarCheckRoutes = require('./routes/grammar-check');
const dictationsRoutes = require('./routes/dictations');
const calendarRoutes = require('./routes/calendar');
const achievementsRoutes = require('./routes/achievements');
const adminRoutes = require('./routes/admin');
const adminSubscriptionsRoutes = require('./routes/admin-subscriptions');
const adminSupportRoutes = require('./routes/admin-support');
const adminDictationsRoutes = require('./routes/admin-dictations');
const adminDictationsUploadRoutes = require('./routes/admin-dictations-upload');
const dissertationRoutes = require('./routes/dissertation');

// Import des middlewares
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');
const subscriptionChecker = require('./middleware/subscriptionChecker');
const { smartRateLimiter, suspiciousActivityLogger, bruteForcePrevention } = require('./middleware/rateLimiting');
const { advancedSanitization } = require('./middleware/validation');
const { 
  sqlInjectionProtection, 
  xssProtection, 
  pathTraversalProtection,
  securityHeadersValidation,
  securityLogger
} = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de sécurité avancée
app.use(securityHeadersValidation);
app.use(securityLogger);
app.use(suspiciousActivityLogger);

// Helmet avec configuration renforcée
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    },
  },
  crossOriginEmbedderPolicy: false, // Désactivé pour compatibilité
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration sécurisée (supporte les previews Vercel)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
  process.env.ALLOWED_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permettre les requêtes sans origine (ex: applications mobiles, Postman)
    if (!origin) return callback(null, true);

    // Autoriser les origins explicitement configurés
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Autoriser les domaines de preview Vercel (*.vercel.app)
    try {
      const url = new URL(origin);
      if (url.hostname.endsWith('.vercel.app')) {
        return callback(null, true);
      }
    } catch (_) {
      // ignore parsing errors
    }

    console.warn(`[CORS BLOCKED] Origin: ${origin}`);
    return callback(new Error('Non autorisé par CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token']
}));

// Compression
app.use(compression());

// Logging avancé
app.use(morgan('combined'));
app.use(requestLogger);

// Middlewares de sécurité
app.use(sqlInjectionProtection);
app.use(xssProtection);
app.use(pathTraversalProtection);
app.use(bruteForcePrevention);

// Rate limiting intelligent
app.use(smartRateLimiter);

// Vérification des abonnements (à chaque requête) - Temporairement désactivé
// app.use(subscriptionChecker);

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitization avancée après le parsing
app.use(advancedSanitization);

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/grammar', grammarRoutes);
app.use('/api/grammar-enhanced', grammarEnhancedRoutes);
app.use('/api/exercises', exercisesRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/ai-enhanced', aiEnhancedRoutes);
app.use('/api/editor', editorRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/grammar-check', grammarCheckRoutes);
app.use('/api/dictations', dictationsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/subscriptions', adminSubscriptionsRoutes);
app.use('/api/admin/support', adminSupportRoutes);
app.use('/api/admin/dictations', adminDictationsUploadRoutes); // Upload routes (doit être avant adminDictationsRoutes)
app.use('/api/admin/dictations', adminDictationsRoutes);
app.use('/api/dissertation', dissertationRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Route d'information API
app.get('/api', (req, res) => {
  res.json({
    name: 'FrançaisFluide API',
    version: '1.0.0',
    description: 'API Backend pour l\'application FrançaisFluide',
    endpoints: {
      auth: '/api/auth',
      progress: '/api/progress',
      ai: '/api/ai',
      subscription: '/api/subscription',
      grammar: '/api/grammar',
      exercises: '/api/exercises',
      dictations: '/api/dictations',
      calendar: '/api/calendar',
      achievements: '/api/achievements',
      support: '/api/support',
      telemetry: '/api/telemetry'
    },
    documentation: '/api/docs'
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method
  });
});

// Gestionnaire d'erreurs global
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur API FrançaisFluide démarré sur le port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
