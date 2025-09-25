// src/middleware/security.js
const crypto = require('crypto');

// Middleware de protection CSRF
const csrfProtection = (() => {
  const tokens = new Map();
  const TOKEN_LIFETIME = 30 * 60 * 1000; // 30 minutes
  
  return {
    generateToken: (req, res, next) => {
      const token = crypto.randomBytes(32).toString('hex');
      const key = req.user?.userId || req.ip;
      
      tokens.set(key, {
        token,
        createdAt: Date.now()
      });
      
      // Nettoyer les tokens expirés
      for (const [k, v] of tokens.entries()) {
        if (Date.now() - v.createdAt > TOKEN_LIFETIME) {
          tokens.delete(k);
        }
      }
      
      res.locals.csrfToken = token;
      next();
    },
    
    validateToken: (req, res, next) => {
      // Ignorer pour les requêtes GET
      if (req.method === 'GET') return next();
      
      const token = req.headers['x-csrf-token'] || req.body._csrf;
      const key = req.user?.userId || req.ip;
      
      if (!token) {
        return res.status(403).json({
          success: false,
          error: 'Token CSRF manquant',
          type: 'csrf_token_missing'
        });
      }
      
      const storedToken = tokens.get(key);
      
      if (!storedToken || storedToken.token !== token) {
        return res.status(403).json({
          success: false,
          error: 'Token CSRF invalide',
          type: 'csrf_token_invalid'
        });
      }
      
      // Vérifier l'expiration
      if (Date.now() - storedToken.createdAt > TOKEN_LIFETIME) {
        tokens.delete(key);
        return res.status(403).json({
          success: false,
          error: 'Token CSRF expiré',
          type: 'csrf_token_expired'
        });
      }
      
      next();
    }
  };
})();

// Protection contre l'injection SQL et NoSQL
const sqlInjectionProtection = (req, res, next) => {
  const suspiciousPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
    /(\b(or|and)\s+\d+\s*=\s*\d+)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\$where|\$regex|\$ne|\$gt|\$lt)/gi
  ];
  
  const checkForInjection = (obj, path = '') => {
    if (typeof obj === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(obj)) {
          console.warn(`[SQL INJECTION ATTEMPT] Path: ${path}, Value: ${obj}, IP: ${req.ip}`);
          return true;
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (checkForInjection(value, `${path}.${key}`)) {
          return true;
        }
      }
    }
    return false;
  };
  
  if (checkForInjection(req.body, 'body') || 
      checkForInjection(req.query, 'query') || 
      checkForInjection(req.params, 'params')) {
    return res.status(400).json({
      success: false,
      error: 'Requête suspecte détectée',
      type: 'suspicious_request'
    });
  }
  
  next();
};

// Protection contre les attaques XSS
const xssProtection = (req, res, next) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]*src\s*=\s*["\']?\s*data:/gi
  ];
  
  const sanitizeForXSS = (obj) => {
    if (typeof obj === 'string') {
      for (const pattern of xssPatterns) {
        if (pattern.test(obj)) {
          console.warn(`[XSS ATTEMPT] Value: ${obj}, IP: ${req.ip}`);
          return obj.replace(pattern, '');
        }
      }
      return obj;
    } else if (typeof obj === 'object' && obj !== null) {
      const sanitized = Array.isArray(obj) ? [] : {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeForXSS(value);
      }
      return sanitized;
    }
    return obj;
  };
  
  req.body = sanitizeForXSS(req.body);
  req.query = sanitizeForXSS(req.query);
  
  next();
};

// Protection contre les attaques de traversée de répertoire
const pathTraversalProtection = (req, res, next) => {
  const suspiciousPaths = [
    /\.\./g,
    /\/etc\/passwd/gi,
    /\/proc\/self\/environ/gi,
    /\\windows\\system32/gi
  ];
  
  const checkPath = (value) => {
    if (typeof value === 'string') {
      return suspiciousPaths.some(pattern => pattern.test(value));
    }
    return false;
  };
  
  const allValues = [
    ...Object.values(req.params || {}),
    ...Object.values(req.query || {}),
    ...Object.values(req.body || {})
  ];
  
  if (allValues.some(checkPath)) {
    console.warn(`[PATH TRAVERSAL ATTEMPT] IP: ${req.ip}, Path: ${req.path}`);
    return res.status(400).json({
      success: false,
      error: 'Chemin de fichier non autorisé',
      type: 'path_traversal_attempt'
    });
  }
  
  next();
};

// Middleware de détection d'anomalies
const anomalyDetection = (() => {
  const requestPatterns = new Map();
  const WINDOW_SIZE = 5 * 60 * 1000; // 5 minutes
  const MAX_REQUESTS_PER_ENDPOINT = 100;
  
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    
    if (!requestPatterns.has(key)) {
      requestPatterns.set(key, []);
    }
    
    const requests = requestPatterns.get(key);
    
    // Nettoyer les anciennes requêtes
    const recentRequests = requests.filter(time => now - time < WINDOW_SIZE);
    requestPatterns.set(key, [...recentRequests, now]);
    
    // Détecter les anomalies
    if (recentRequests.length > MAX_REQUESTS_PER_ENDPOINT) {
      console.warn(`[ANOMALY DETECTED] Excessive requests from ${req.ip} to ${req.path}`);
      
      // Optionnel: bloquer temporairement
      return res.status(429).json({
        success: false,
        error: 'Comportement anormal détecté',
        type: 'anomaly_detected'
      });
    }
    
    next();
  };
})();

// Middleware de validation des en-têtes de sécurité
const securityHeadersValidation = (req, res, next) => {
  // Vérifier l'origine pour les requêtes CORS
  const origin = req.get('Origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
    process.env.ALLOWED_ORIGIN
  ].filter(Boolean);
  
  if (origin && !allowedOrigins.includes(origin)) {
    console.warn(`[UNAUTHORIZED ORIGIN] ${origin} from IP: ${req.ip}`);
  }
  
  // Vérifier les en-têtes suspects
  const suspiciousHeaders = [
    'x-forwarded-host',
    'x-host',
    'x-forwarded-server'
  ];
  
  for (const header of suspiciousHeaders) {
    if (req.get(header)) {
      console.warn(`[SUSPICIOUS HEADER] ${header}: ${req.get(header)} from IP: ${req.ip}`);
    }
  }
  
  next();
};

// Middleware de chiffrement des données sensibles
const sensitiveDataEncryption = (req, res, next) => {
  const algorithm = 'aes-256-gcm';
  const secretKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
  
  const encrypt = (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, secretKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  };
  
  const decrypt = (encryptedData) => {
    const decipher = crypto.createDecipher(
      algorithm, 
      secretKey, 
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  };
  
  // Ajouter les fonctions d'encryption aux locals pour utilisation dans les routes
  res.locals.encrypt = encrypt;
  res.locals.decrypt = decrypt;
  
  next();
};

// Middleware de logging de sécurité
const securityLogger = (req, res, next) => {
  const securityInfo = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    method: req.method,
    path: req.path,
    userId: req.user?.userId,
    sessionId: req.sessionID
  };
  
  // Logger les requêtes sensibles
  const sensitivePaths = ['/auth/', '/admin/', '/api/ai/', '/api/grammar/'];
  
  if (sensitivePaths.some(path => req.path.includes(path))) {
    console.log(`[SECURITY LOG] ${JSON.stringify(securityInfo)}`);
  }
  
  next();
};

module.exports = {
  csrfProtection,
  sqlInjectionProtection,
  xssProtection,
  pathTraversalProtection,
  anomalyDetection,
  securityHeadersValidation,
  sensitiveDataEncryption,
  securityLogger
};
