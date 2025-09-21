// src/services/aiService.js
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

class AIService {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null;
    
    this.anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    }) : null;
  }

  async generateResponse(message, options = {}) {
    const {
      context = '',
      conversationHistory = [],
      userId = null
    } = options;

    try {
      // Essayer d'abord avec OpenAI
      if (this.openai) {
        return await this.generateWithOpenAI(message, context, conversationHistory);
      }
      
      // Sinon utiliser Anthropic
      if (this.anthropic) {
        return await this.generateWithAnthropic(message, context, conversationHistory);
      }
      
      // Fallback sur une réponse basique
      return this.generateBasicResponse(message);
      
    } catch (error) {
      console.error('Erreur génération réponse IA:', error);
      return this.generateBasicResponse(message);
    }
  }

  async generateWithOpenAI(message, context, conversationHistory) {
    const systemPrompt = `Vous êtes un assistant IA spécialisé dans l'apprentissage du français. 
    Vous aidez les utilisateurs à améliorer leur français en fournissant des explications claires, 
    des corrections grammaticales et des conseils pédagogiques.
    
    Contexte: ${context}
    
    Répondez de manière pédagogique et encourageante.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages,
      max_tokens: 1000,
      temperature: 0.7
    });

    return {
      content: response.choices[0].message.content,
      context: {
        model: 'gpt-4',
        tokens: response.usage?.total_tokens || 0
      }
    };
  }

  async generateWithAnthropic(message, context, conversationHistory) {
    const systemPrompt = `Vous êtes un assistant IA spécialisé dans l'apprentissage du français. 
    Vous aidez les utilisateurs à améliorer leur français en fournissant des explications claires, 
    des corrections grammaticales et des conseils pédagogiques.
    
    Contexte: ${context}`;

    const conversationText = conversationHistory
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const fullMessage = conversationText 
      ? `${conversationText}\n\nuser: ${message}`
      : message;

    const response = await this.anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: fullMessage }]
    });

    return {
      content: response.content[0].text,
      context: {
        model: 'claude-3-sonnet',
        tokens: response.usage?.input_tokens + response.usage?.output_tokens || 0
      }
    };
  }

  generateBasicResponse(message) {
    // Réponses basiques pour les cas où les APIs IA ne sont pas disponibles
    const responses = [
      "Je suis là pour vous aider avec votre français ! Pouvez-vous me donner plus de contexte sur ce que vous souhaitez apprendre ?",
      "C'est une excellente question ! Pour vous donner la meilleure réponse, pourriez-vous préciser votre niveau de français ?",
      "Je comprends votre question. Malheureusement, je ne peux pas accéder aux services IA en ce moment, mais je peux vous orienter vers des ressources utiles.",
      "Merci pour votre message ! Pour vous aider efficacement, pourriez-vous me dire quel aspect du français vous souhaitez améliorer ?"
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      content: randomResponse,
      context: {
        model: 'basic',
        fallback: true
      }
    };
  }

  async analyzeTextComplexity(text) {
    // Analyser la complexité du texte pour adapter les réponses
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentenceCount;
    
    let complexity = 'beginner';
    if (avgWordsPerSentence > 15) complexity = 'advanced';
    else if (avgWordsPerSentence > 10) complexity = 'intermediate';
    
    return {
      wordCount,
      sentenceCount,
      avgWordsPerSentence,
      complexity
    };
  }
}

module.exports = {
  aiService: new AIService()
};
