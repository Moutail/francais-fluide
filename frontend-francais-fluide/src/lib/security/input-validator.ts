// src/lib/security/input-validator.ts
import { z } from 'zod';

export class InputValidator {
  /**
   * Nettoyer le HTML pour éviter les injections XSS
   * Version simplifiée sans dépendance externe
   */
  static sanitizeHTML(html: string): string {
    // Échapper les caractères HTML dangereux
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Valider un email
   */
  static validateEmail(email: string): { valid: boolean; error?: string } {
    const schema = z.string().email();
    const result = schema.safeParse(email);
    
    if (!result.success) {
      return { valid: false, error: 'Email invalide' };
    }
    
    return { valid: true };
  }

  /**
   * Valider un mot de passe
   */
  static validatePassword(password: string): { valid: boolean; error?: string } {
    if (password.length < 8) {
      return { valid: false, error: 'Le mot de passe doit contenir au moins 8 caractères' };
    }

    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: 'Le mot de passe doit contenir au moins une majuscule' };
    }

    if (!/[a-z]/.test(password)) {
      return { valid: false, error: 'Le mot de passe doit contenir au moins une minuscule' };
    }

    if (!/[0-9]/.test(password)) {
      return { valid: false, error: 'Le mot de passe doit contenir au moins un chiffre' };
    }

    return { valid: true };
  }

  /**
   * Valider un texte de dictée
   */
  static validateDictationText(text: string): { valid: boolean; error?: string } {
    if (!text || text.trim().length === 0) {
      return { valid: false, error: 'Le texte ne peut pas être vide' };
    }

    if (text.length > 10000) {
      return { valid: false, error: 'Le texte est trop long (max 10000 caractères)' };
    }

    // Vérifier les caractères suspects (XSS)
    const suspiciousPatterns = [
      /<script/gi,
      /javascript:/gi,
      /onerror=/gi,
      /onclick=/gi,
      /<iframe/gi,
      /eval\(/gi,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(text)) {
        return { valid: false, error: 'Caractères non autorisés détectés' };
      }
    }

    return { valid: true };
  }

  /**
   * Valider un nom d'utilisateur
   */
  static validateUsername(username: string): { valid: boolean; error?: string } {
    if (!username || username.trim().length === 0) {
      return { valid: false, error: 'Le nom d\'utilisateur ne peut pas être vide' };
    }

    if (username.length < 3) {
      return { valid: false, error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' };
    }

    if (username.length > 50) {
      return { valid: false, error: 'Le nom d\'utilisateur est trop long (max 50 caractères)' };
    }

    // Autoriser uniquement lettres, chiffres, tirets et underscores
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return {
        valid: false,
        error: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores',
      };
    }

    return { valid: true };
  }

  /**
   * Nettoyer une chaîne de caractères
   */
  static sanitizeString(str: string): string {
    return str
      .trim()
      .replace(/[<>]/g, '') // Supprimer < et >
      .replace(/javascript:/gi, '') // Supprimer javascript:
      .replace(/on\w+=/gi, ''); // Supprimer les event handlers
  }

  /**
   * Valider une URL
   */
  static validateURL(url: string): { valid: boolean; error?: string } {
    try {
      const urlObj = new URL(url);
      
      // Autoriser uniquement http et https
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { valid: false, error: 'Protocole non autorisé' };
      }

      return { valid: true };
    } catch {
      return { valid: false, error: 'URL invalide' };
    }
  }

  /**
   * Valider un nombre
   */
  static validateNumber(
    value: number,
    min?: number,
    max?: number
  ): { valid: boolean; error?: string } {
    if (typeof value !== 'number' || isNaN(value)) {
      return { valid: false, error: 'Valeur invalide' };
    }

    if (min !== undefined && value < min) {
      return { valid: false, error: `La valeur doit être supérieure ou égale à ${min}` };
    }

    if (max !== undefined && value > max) {
      return { valid: false, error: `La valeur doit être inférieure ou égale à ${max}` };
    }

    return { valid: true };
  }
}
