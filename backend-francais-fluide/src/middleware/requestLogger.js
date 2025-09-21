// src/middleware/requestLogger.js
const { logger } = require('./errorHandler');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log de la requête entrante
  logger.info({
    message: 'Requête entrante',
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Intercepter la réponse
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    // Log de la réponse
    logger.info({
      message: 'Réponse envoyée',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0
    });

    originalSend.call(this, data);
  };

  next();
};

module.exports = { requestLogger };
