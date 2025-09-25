// src/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

// Middleware pour traiter les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Logger les erreurs de validation pour le monitoring
    console.warn(`[VALIDATION ERROR] ${req.method} ${req.path}:`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      errors: errors.array(),
      body: req.body
    });

    return res.status(400).json({
      success: false,
      error: 'Données invalides',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      })),
      type: 'validation_error'
    });
  }
  
  next();
};

// Validations communes
const commonValidations = {
  // Validation d'email sécurisée
  email: body('email')
    .isEmail()
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      outlookdotcom_remove_subaddress: false,
      yahoo_remove_subaddress: false,
      icloud_remove_subaddress: false
    })
    .isLength({ max: 254 })
    .withMessage('Email invalide ou trop long'),

  // Validation de mot de passe robuste
  password: body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'),

  // Validation de nom sécurisée
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'),

  // Validation d'ID
  id: param('id')
    .isString()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('ID invalide'),

  // Validation de texte général
  text: body('text')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Le texte doit contenir entre 1 et 10000 caractères'),

  // Validation de titre
  title: body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Le titre doit contenir entre 2 et 200 caractères')
    .escape(),

  // Validation de description
  description: body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La description ne peut pas dépasser 1000 caractères')
    .escape()
};

// Validations spécifiques pour l'authentification
const authValidations = {
  register: [
    commonValidations.name,
    commonValidations.email,
    commonValidations.password,
    // Vérification de confirmation de mot de passe
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        return true;
      }),
    handleValidationErrors
  ],

  login: [
    commonValidations.email,
    body('password')
      .notEmpty()
      .withMessage('Mot de passe requis')
      .isLength({ max: 128 })
      .withMessage('Mot de passe trop long'),
    handleValidationErrors
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Mot de passe actuel requis'),
    commonValidations.password,
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        return true;
      }),
    handleValidationErrors
  ]
};

// Validations pour les exercices
const exerciseValidations = {
  create: [
    commonValidations.title,
    commonValidations.description,
    body('type')
      .isIn(['grammar', 'vocabulary', 'conjugation', 'comprehension'])
      .withMessage('Type d\'exercice invalide'),
    body('level')
      .isInt({ min: 1, max: 20 })
      .withMessage('Niveau invalide (1-20)'),
    body('difficulty')
      .isIn(['easy', 'medium', 'hard'])
      .withMessage('Difficulté invalide'),
    handleValidationErrors
  ],

  submit: [
    commonValidations.id,
    body('answers')
      .isArray({ min: 1, max: 100 })
      .withMessage('Réponses invalides'),
    body('timeSpent')
      .optional()
      .isInt({ min: 0, max: 7200 })
      .withMessage('Temps passé invalide (max 2h)'),
    handleValidationErrors
  ]
};

// Validations pour les dictées
const dictationValidations = {
  create: [
    commonValidations.title,
    commonValidations.description,
    body('difficulty')
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Difficulté invalide'),
    body('duration')
      .isInt({ min: 10, max: 600 })
      .withMessage('Durée invalide (10-600 secondes)'),
    body('text')
      .trim()
      .isLength({ min: 50, max: 5000 })
      .withMessage('Le texte doit contenir entre 50 et 5000 caractères'),
    body('audioUrl')
      .optional()
      .isURL()
      .withMessage('URL audio invalide'),
    handleValidationErrors
  ],

  attempt: [
    commonValidations.id,
    body('userText')
      .trim()
      .isLength({ min: 10, max: 10000 })
      .withMessage('Texte utilisateur invalide'),
    body('timeSpent')
      .optional()
      .isInt({ min: 0, max: 3600 })
      .withMessage('Temps passé invalide (max 1h)'),
    handleValidationErrors
  ]
};

// Validations pour le calendrier
const calendarValidations = {
  create: [
    commonValidations.title,
    body('type')
      .isIn(['exercise', 'study', 'achievement', 'reminder'])
      .withMessage('Type d\'événement invalide'),
    body('date')
      .isISO8601()
      .toDate()
      .custom((value) => {
        const now = new Date();
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(now.getFullYear() + 1);
        
        if (value < now.setHours(0, 0, 0, 0)) {
          throw new Error('La date ne peut pas être dans le passé');
        }
        if (value > oneYearFromNow) {
          throw new Error('La date ne peut pas être dans plus d\'un an');
        }
        return true;
      }),
    body('time')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Format d\'heure invalide (HH:MM)'),
    body('points')
      .optional()
      .isInt({ min: 0, max: 1000 })
      .withMessage('Points invalides (0-1000)'),
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    commonValidations.title,
    body('type')
      .isIn(['exercise', 'study', 'achievement', 'reminder'])
      .withMessage('Type d\'événement invalide'),
    body('date')
      .isISO8601()
      .toDate(),
    body('completed')
      .optional()
      .isBoolean()
      .withMessage('Statut de completion invalide'),
    handleValidationErrors
  ]
};

// Validations pour les requêtes de grammaire/IA
const aiValidations = {
  analyzeText: [
    body('text')
      .trim()
      .isLength({ min: 1, max: 50000 })
      .withMessage('Le texte doit contenir entre 1 et 50000 caractères'),
    body('action')
      .optional()
      .isIn(['analyze', 'correct'])
      .withMessage('Action invalide'),
    body('maxErrors')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Nombre maximum d\'erreurs invalide'),
    handleValidationErrors
  ],

  chatMessage: [
    body('message')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Le message doit contenir entre 1 et 2000 caractères'),
    body('context')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Contexte trop long'),
    body('conversationId')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('ID de conversation invalide'),
    handleValidationErrors
  ]
};

// Validations pour les paramètres de requête
const queryValidations = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Numéro de page invalide'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite invalide (1-100)'),
    handleValidationErrors
  ],

  dateRange: [
    query('startDate')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Date de début invalide'),
    query('endDate')
      .optional()
      .isISO8601()
      .toDate()
      .custom((value, { req }) => {
        if (req.query.startDate && value < new Date(req.query.startDate)) {
          throw new Error('La date de fin doit être après la date de début');
        }
        return true;
      }),
    handleValidationErrors
  ]
};

// Middleware de sanitization avancée
const advancedSanitization = (req, res, next) => {
  // Nettoyer les chaînes de caractères des caractères dangereux
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Supprimer les caractères de contrôle
    return str.replace(/[\x00-\x1F\x7F]/g, '')
              .trim();
  };

  // Sanitiser récursivement un objet
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return typeof obj === 'string' ? sanitizeString(obj) : obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  };

  // Appliquer la sanitization
  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);

  next();
};

module.exports = {
  handleValidationErrors,
  commonValidations,
  authValidations,
  exerciseValidations,
  dictationValidations,
  calendarValidations,
  aiValidations,
  queryValidations,
  advancedSanitization
};
