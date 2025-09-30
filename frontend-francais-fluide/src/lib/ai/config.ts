// src/lib/ai/config.ts
export const AI_CONFIG = {
  // OpenAI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: 'gpt-4',
  OPENAI_MAX_TOKENS: 1000,

  // Claude Configuration
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
  CLAUDE_MODEL: 'claude-3-sonnet-20240229',
  CLAUDE_MAX_TOKENS: 1000,

  // LanguageTool Configuration (fallback)
  LANGUAGETOOL_API_KEY: process.env.LANGUAGETOOL_API_KEY,
  LANGUAGETOOL_URL: 'https://api.languagetool.org/v2/check',

  // Rate limiting
  RATE_LIMIT: {
    free: 10, // 10 requêtes par heure
    student: 100, // 100 requêtes par heure
    premium: 500, // 500 requêtes par heure
    enterprise: 2000, // 2000 requêtes par heure
  },

  // Cache settings
  CACHE_TTL: 3600, // 1 heure en secondes
  MAX_CACHE_SIZE: 1000, // Maximum 1000 entrées en cache
};

export const AI_PROMPTS = {
  GRAMMAR_CORRECTION: `Tu es un expert en grammaire française. Corrige le texte suivant en français et explique les erreurs trouvées. Réponds au format JSON:
{
  "corrected_text": "texte corrigé",
  "errors": [
    {
      "original": "mot incorrect",
      "correction": "mot correct",
      "explanation": "explication de l'erreur",
      "type": "orthographe|grammaire|ponctuation"
    }
  ],
  "suggestions": ["suggestion 1", "suggestion 2"]
}`,

  CONTENT_GENERATION: `Tu es un professeur de français. Génère un exercice de français adapté au niveau {level} sur le thème "{topic}". Réponds au format JSON:
{
  "title": "Titre de l'exercice",
  "description": "Description de l'exercice",
  "content": "Contenu de l'exercice",
  "questions": [
    {
      "question": "Question 1",
      "type": "multiple_choice|fill_blank|true_false",
      "options": ["option 1", "option 2", "option 3"],
      "correct_answer": "réponse correcte",
      "explanation": "explication de la réponse"
    }
  ],
  "difficulty": "débutant|intermédiaire|avancé",
  "estimated_time": "temps estimé en minutes"
}`,

  AI_ASSISTANT: `Tu es un assistant IA spécialisé dans l'apprentissage du français. Tu aides les étudiants à améliorer leur français de manière pédagogique et encourageante. Réponds en français de manière claire et bienveillante.`,
};
