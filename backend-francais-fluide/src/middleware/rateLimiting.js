// src/middleware/rateLimiting.js
const rateLimit = require('express-rate-limit');

// Configuration de base pour l'API
const createRateLimiter = (options = {}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes par défaut
    max: options.max || (isDevelopment ? 1000 : 100), // Plus permissif en dev
    message: {
      success: false,
      error: options.message || 'Trop de requêtes depuis cette IP, réessayez plus tard.',
      retryAfter: Math.ceil((options.windowMs || 900000) / 1000),
      type: 'rate_limit_exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // En développement, on log mais on ne bloque pas complètement
    skip: (req) => {
      if (isDevelopment && options.skipInDev !== false) {
        console.log(`[RATE LIMIT] ${req.method} ${req.path} - IP: ${req.ip} (dev mode)`);
        return true;
      }
      return false;
    },
    keyGenerator: (req) => {
      // Utiliser l'ID utilisateur si authentifié, sinon l'IP
      return req.user?.userId || req.ip;
    },
    handler: (req, res) => {
      console.warn(`[RATE LIMIT EXCEEDED] ${req.method} ${req.path} - IP: ${req.ip} - User: ${req.user?.userId || 'anonymous'}`);
      res.status(429).json({
        success: false,
        error: options.message || 'Trop de requêtes depuis cette IP, réessayez plus tard.',
        retryAfter: Math.ceil((options.windowMs || 900000) / 1000),
        type: 'rate_limit_exceeded'
      });
    }
  });
};

// Rate limiter général pour l'API
const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 100 requêtes en prod, 1000 en dev
  message: 'Trop de requêtes depuis cette IP, réessayez plus tard.'
});

// Rate limiter strict pour l'authentification
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // 5 tentatives en prod, 50 en dev
  message: 'Trop de tentatives de connexion. Veuillez attendre avant de réessayer.',
  skipInDev: false // Appliquer même en développement pour tester
});

// Rate limiter pour les opérations coûteuses (IA, grammaire)
const heavyOperationsLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // 10 par minute en prod
  message: 'Trop de requêtes pour cette opération. Veuillez patienter.'
});

// Rate limiter pour les créations (exercices, événements)
const creationLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 20 : 200, // 20 créations par minute max
  message: 'Trop de créations en peu de temps. Veuillez patienter.'
});

// Rate limiter pour les uploads/soumissions
const submissionLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 30 : 300, // 30 soumissions par minute max
  message: 'Trop de soumissions en peu de temps. Veuillez patienter.'
});

// Middleware pour appliquer différents limiters selon la route
const smartRateLimiter = (req, res, next) => {
  const path = req.path.toLowerCase();
  
  // Routes d'authentification
  if (path.includes('/auth/login') || path.includes('/auth/register')) {
    return authLimiter(req, res, next);
  }
  
  // Routes d'IA et grammaire
  if (path.includes('/ai/') || path.includes('/grammar/') || path.includes('/grammar-check/')) {
    return heavyOperationsLimiter(req, res, next);
  }
  
  // Routes de création
  if (req.method === 'POST' && (
    path.includes('/exercises') || 
    path.includes('/calendar') || 
    path.includes('/dictations')
  )) {
    return creationLimiter(req, res, next);
  }
  
  // Routes de soumission
  if (path.includes('/submit') || path.includes('/attempt') || req.method === 'PUT') {
    return submissionLimiter(req, res, next);
  }
  
  // Rate limiter général pour le reste
  return generalLimiter(req, res, next);
};

// Middleware pour logger les requêtes suspectes
const suspiciousActivityLogger = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const referer = req.get('Referer') || '';
  const ip = req.ip;
  
  // Détecter les patterns suspects
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /hack/i,
    /exploit/i
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(userAgent) || pattern.test(referer)
  );
  
  if (isSuspicious) {
    console.warn(`[SUSPICIOUS ACTIVITY] IP: ${ip}, UA: ${userAgent}, Path: ${req.path}`);
  }
  
  next();
};

// Middleware de protection contre les attaques par force brute
const bruteForcePrevention = (() => {
  const attempts = new Map();
  const BLOCK_DURATION = 30 * 60 * 1000; // 30 minutes
  const MAX_ATTEMPTS = 10;
  
  return (req, res, next) => {
    const key = req.user?.userId || req.ip;
    const now = Date.now();
    
    if (!attempts.has(key)) {
      attempts.set(key, { count: 0, firstAttempt: now, blockedUntil: 0 });
    }
    
    const record = attempts.get(key);
    
    // Si l'utilisateur est bloqué
    if (record.blockedUntil > now) {
      return res.status(429).json({
        success: false,
        error: 'Compte temporairement bloqué suite à trop de tentatives échouées.',
        blockedUntil: new Date(record.blockedUntil).toISOString(),
        type: 'account_blocked'
      });
    }
    
    // Réinitialiser si la fenêtre de temps est dépassée
    if (now - record.firstAttempt > BLOCK_DURATION) {
      record.count = 0;
      record.firstAttempt = now;
      record.blockedUntil = 0;
    }
    
    // Incrémenter le compteur sur les erreurs d'auth
    res.on('finish', () => {
      if (res.statusCode === 401 || res.statusCode === 403) {
        record.count++;
        
        if (record.count >= MAX_ATTEMPTS) {
          record.blockedUntil = now + BLOCK_DURATION;
          console.warn(`[BRUTE FORCE DETECTED] Blocking ${key} for ${BLOCK_DURATION / 60000} minutes`);
        }
      } else if (res.statusCode === 200) {
        // Réinitialiser sur succès
        record.count = 0;
      }
    });
    
    next();
  };
})();

module.exports = {
  generalLimiter,
  authLimiter,
  heavyOperationsLimiter,
  creationLimiter,
  submissionLimiter,
  smartRateLimiter,
  suspiciousActivityLogger,
  bruteForcePrevention,
  createRateLimiter
};
