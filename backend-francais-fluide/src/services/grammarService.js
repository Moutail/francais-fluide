// src/services/grammarService.js
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

class GrammarService {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null;
    
    this.anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    }) : null;
    
    this.cache = new Map();
    this.rateLimits = new Map();
    this.maxCacheSize = 1000;
    this.rateLimitWindow = 15 * 60 * 1000; // 15 minutes
    this.maxRequestsPerWindow = 100;
  }

  async analyzeText(text, options = {}) {
    const {
      useLanguageTool = true,
      maxErrors = 50,
      clientIP = 'unknown',
      userId = null
    } = options;

    // Vérifier le rate limiting
    if (!this.checkRateLimit(clientIP)) {
      throw new Error('Rate limit exceeded');
    }

    // Vérifier le cache
    const cacheKey = `${text}_${useLanguageTool}_${maxErrors}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let result;

    try {
      // Essayer d'abord avec l'IA
      if (this.openai) {
        result = await this.analyzeWithOpenAI(text, maxErrors);
      } else if (this.anthropic) {
        result = await this.analyzeWithAnthropic(text, maxErrors);
      } else if (useLanguageTool) {
        // Fallback sur LanguageTool
        result = await this.analyzeWithLanguageTool(text, maxErrors);
      } else {
        // Analyse locale basique
        result = this.analyzeLocally(text);
      }

      // Mettre en cache
      this.setCache(cacheKey, result);
      
      return result;

    } catch (error) {
      console.error('Erreur analyse IA:', error);
      
      // Fallback sur LanguageTool
      if (useLanguageTool) {
        try {
          result = await this.analyzeWithLanguageTool(text, maxErrors);
          this.setCache(cacheKey, result);
          return result;
        } catch (ltError) {
          console.error('Erreur LanguageTool:', ltError);
        }
      }
      
      // Dernier recours : analyse locale
      result = this.analyzeLocally(text);
      this.setCache(cacheKey, result);
      return result;
    }
  }

  async analyzeWithOpenAI(text, maxErrors) {
    const prompt = `Analysez ce texte français et identifiez les erreurs grammaticales, orthographiques et de style. 
    Répondez au format JSON avec un tableau d'erreurs contenant : position, longueur, message, suggestion, type.
    Texte: "${text}"`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      temperature: 0.1
    });

    const content = response.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      return {
        text,
        errors: parsed.errors || [],
        suggestions: parsed.suggestions || [],
        confidence: 0.9
      };
    } catch (parseError) {
      // Si le JSON n'est pas valide, faire une analyse locale
      return this.analyzeLocally(text);
    }
  }

  async analyzeWithAnthropic(text, maxErrors) {
    const prompt = `Analysez ce texte français et identifiez les erreurs grammaticales, orthographiques et de style. 
    Répondez au format JSON avec un tableau d'erreurs contenant : position, longueur, message, suggestion, type.
    Texte: "${text}"`;

    const response = await this.anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    });

    const content = response.content[0].text;
    
    try {
      const parsed = JSON.parse(content);
      return {
        text,
        errors: parsed.errors || [],
        suggestions: parsed.suggestions || [],
        confidence: 0.9
      };
    } catch (parseError) {
      return this.analyzeLocally(text);
    }
  }

  async analyzeWithLanguageTool(text, maxErrors) {
    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: text,
        language: 'fr',
        enabledOnly: 'false'
      })
    });

    const data = await response.json();
    
    const errors = (data.matches || []).slice(0, maxErrors).map(match => ({
      position: match.offset,
      length: match.length,
      message: match.message,
      suggestion: match.replacements?.[0]?.value || '',
      type: match.rule?.category?.id || 'unknown',
      confidence: match.rule?.issueType === 'misspelling' ? 0.9 : 0.7
    }));

    return {
      text,
      errors,
      suggestions: errors.map(e => e.suggestion).filter(s => s),
      confidence: 0.8
    };
  }

  analyzeLocally(text) {
    // Règles de base pour l'analyse locale
    const errors = [];
    const words = text.split(/\s+/);
    
    // Vérifications basiques
    words.forEach((word, index) => {
      // Mots en double
      if (index > 0 && word.toLowerCase() === words[index - 1].toLowerCase()) {
        errors.push({
          position: text.indexOf(word),
          length: word.length,
          message: 'Mot répété',
          suggestion: '',
          type: 'repetition',
          confidence: 0.9
        });
      }
      
      // Mots trop longs (probablement des erreurs)
      if (word.length > 20 && !word.includes('-')) {
        errors.push({
          position: text.indexOf(word),
          length: word.length,
          message: 'Mot suspect (trop long)',
          suggestion: '',
          type: 'suspicious',
          confidence: 0.5
        });
      }
    });

    return {
      text,
      errors,
      suggestions: [],
      confidence: 0.3
    };
  }

  correctText(text, corrections) {
    let correctedText = text;
    
    // Appliquer les corrections en ordre décroissant de position
    const sortedCorrections = corrections.sort((a, b) => b.position - a.position);
    
    for (const correction of sortedCorrections) {
      const before = correctedText.substring(0, correction.position);
      const after = correctedText.substring(correction.position + correction.length);
      correctedText = before + correction.suggestion + after;
    }
    
    return correctedText;
  }

  checkRateLimit(clientIP) {
    const now = Date.now();
    const windowStart = now - this.rateLimitWindow;
    
    if (!this.rateLimits.has(clientIP)) {
      this.rateLimits.set(clientIP, []);
    }
    
    const requests = this.rateLimits.get(clientIP);
    
    // Nettoyer les anciennes requêtes
    const recentRequests = requests.filter(time => time > windowStart);
    this.rateLimits.set(clientIP, recentRequests);
    
    if (recentRequests.length >= this.maxRequestsPerWindow) {
      return false;
    }
    
    recentRequests.push(now);
    return true;
  }

  getRateLimitRemaining(clientIP) {
    const now = Date.now();
    const windowStart = now - this.rateLimitWindow;
    const requests = this.rateLimits.get(clientIP) || [];
    const recentRequests = requests.filter(time => time > windowStart);
    
    return Math.max(0, this.maxRequestsPerWindow - recentRequests.length);
  }

  setCache(key, value) {
    if (this.cache.size >= this.maxCacheSize) {
      // Supprimer le plus ancien
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }

  getCacheSize() {
    return this.cache.size;
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = {
  grammarService: new GrammarService()
};
