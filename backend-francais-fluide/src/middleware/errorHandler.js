// src/middleware/errorHandler.js
const winston = require('winston');

// Configuration du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

const errorHandler = (err, req, res, next) => {
  // Log de l'erreur
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Erreurs de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: err.details || err.message
    });
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expiré'
    });
  }

  // Erreurs Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflit de données',
      message: 'Une ressource avec ces informations existe déjà'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Ressource non trouvée'
    });
  }

  // Erreurs de rate limiting
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Trop de requêtes',
      message: 'Limite de requêtes atteinte. Réessayez plus tard.',
      retryAfter: err.retryAfter
    });
  }

  // Erreur par défaut
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Erreur interne du serveur' 
    : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler, logger };
