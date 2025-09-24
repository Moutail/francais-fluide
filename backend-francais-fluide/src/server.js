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

// Import des routes
const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress-simple');
const aiRoutes = require('./routes/ai');
const subscriptionRoutes = require('./routes/subscription');
const grammarRoutes = require('./routes/grammar');
const exercisesRoutes = require('./routes/exercises');

// Import des middlewares
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');
const subscriptionChecker = require('./middleware/subscriptionChecker');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));
app.use(requestLogger);

// Vérification des abonnements (à chaque requête) - Temporairement désactivé
// app.use(subscriptionChecker);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Trop de requêtes depuis cette IP, réessayez plus tard.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/grammar', grammarRoutes);
app.use('/api/exercises', exercisesRoutes);

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
      exercises: '/api/exercises'
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
