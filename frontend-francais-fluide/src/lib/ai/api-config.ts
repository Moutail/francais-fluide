// src/lib/ai/api-config.ts
export interface AIConfig {
  openai: {
    apiKey: string;
    baseUrl?: string;
    model?: string;
  };
  azure: {
    apiKey: string;
    endpoint: string;
    deploymentName: string;
  };
  anthropic: {
    apiKey: string;
    baseUrl?: string;
  };
  elevenlabs: {
    apiKey: string;
    baseUrl?: string;
  };
}

export interface AIServiceConfig {
  provider: 'openai' | 'azure' | 'anthropic';
  fallbackProvider?: 'openai' | 'azure' | 'anthropic';
  enableVoice?: boolean;
  enableAdvancedCorrections?: boolean;
  enablePersonalizedExercises?: boolean;
  enableIntelligentTutor?: boolean;
}

class AIConfigManager {
  private config: Partial<AIConfig> = {};
  private serviceConfig: AIServiceConfig = {
    provider: 'openai',
    enableVoice: false,
    enableAdvancedCorrections: false,
    enablePersonalizedExercises: false,
    enableIntelligentTutor: false
  };

  constructor() {
    this.loadFromEnvironment();
  }

  /**
   * Charge la configuration depuis les variables d'environnement
   */
  private loadFromEnvironment() {
    this.config = {
      openai: {
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
        baseUrl: process.env.NEXT_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1',
        model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4'
      },
      azure: {
        apiKey: process.env.NEXT_PUBLIC_AZURE_API_KEY || '',
        endpoint: process.env.NEXT_PUBLIC_AZURE_ENDPOINT || '',
        deploymentName: process.env.NEXT_PUBLIC_AZURE_DEPLOYMENT_NAME || ''
      },
      anthropic: {
        apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
        baseUrl: process.env.NEXT_PUBLIC_ANTHROPIC_BASE_URL || 'https://api.anthropic.com'
      },
      elevenlabs: {
        apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
        baseUrl: process.env.NEXT_PUBLIC_ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1'
      }
    };

    // Configuration des services basée sur les clés disponibles
    this.updateServiceConfig();
  }

  /**
   * Met à jour la configuration des services selon les clés disponibles
   */
  private updateServiceConfig() {
    const hasOpenAI = !!this.config.openai?.apiKey;
    const hasAzure = !!this.config.azure?.apiKey;
    const hasAnthropic = !!this.config.anthropic?.apiKey;
    const hasElevenLabs = !!this.config.elevenlabs?.apiKey;

    // Déterminer le provider principal
    if (hasOpenAI) {
      this.serviceConfig.provider = 'openai';
    } else if (hasAzure) {
      this.serviceConfig.provider = 'azure';
    } else if (hasAnthropic) {
      this.serviceConfig.provider = 'anthropic';
    }

    // Activer les fonctionnalités selon les clés disponibles
    this.serviceConfig.enableVoice = hasElevenLabs;
    this.serviceConfig.enableAdvancedCorrections = hasOpenAI || hasAzure || hasAnthropic;
    this.serviceConfig.enablePersonalizedExercises = hasOpenAI || hasAzure || hasAnthropic;
    this.serviceConfig.enableIntelligentTutor = hasOpenAI || hasAzure || hasAnthropic;
  }

  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig: Partial<AIConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.updateServiceConfig();
  }

  /**
   * Met à jour la configuration des services
   */
  updateServiceConfig(newServiceConfig: Partial<AIServiceConfig>) {
    this.serviceConfig = { ...this.serviceConfig, ...newServiceConfig };
  }

  /**
   * Obtient la configuration actuelle
   */
  getConfig(): Partial<AIConfig> {
    return { ...this.config };
  }

  /**
   * Obtient la configuration des services
   */
  getServiceConfig(): AIServiceConfig {
    return { ...this.serviceConfig };
  }

  /**
   * Vérifie si une clé API est configurée
   */
  isApiKeyConfigured(provider: keyof AIConfig): boolean {
    switch (provider) {
      case 'openai':
        return !!this.config.openai?.apiKey;
      case 'azure':
        return !!this.config.azure?.apiKey;
      case 'anthropic':
        return !!this.config.anthropic?.apiKey;
      case 'elevenlabs':
        return !!this.config.elevenlabs?.apiKey;
      default:
        return false;
    }
  }

  /**
   * Obtient la configuration pour un provider spécifique
   */
  getProviderConfig(provider: AIServiceConfig['provider']) {
    switch (provider) {
      case 'openai':
        return this.config.openai;
      case 'azure':
        return this.config.azure;
      case 'anthropic':
        return this.config.anthropic;
      default:
        return null;
    }
  }

  /**
   * Valide la configuration
   */
  validateConfig(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Vérifier au moins un provider principal
    const hasMainProvider = this.isApiKeyConfigured('openai') || 
                           this.isApiKeyConfigured('azure') || 
                           this.isApiKeyConfigured('anthropic');

    if (!hasMainProvider) {
      errors.push('Aucune clé API principale configurée (OpenAI, Azure, ou Anthropic)');
    }

    // Vérifier les fonctionnalités activées sans clés
    if (this.serviceConfig.enableVoice && !this.isApiKeyConfigured('elevenlabs')) {
      warnings.push('Fonctionnalité vocale activée mais clé ElevenLabs manquante');
    }

    // Vérifier la configuration Azure
    if (this.isApiKeyConfigured('azure')) {
      const azure = this.config.azure!;
      if (!azure.endpoint) {
        errors.push('Endpoint Azure manquant');
      }
      if (!azure.deploymentName) {
        errors.push('Nom de déploiement Azure manquant');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Génère un rapport de configuration
   */
  generateReport(): {
    status: 'ready' | 'partial' | 'not_ready';
    providers: {
      name: string;
      configured: boolean;
      features: string[];
    }[];
    availableFeatures: string[];
    missingFeatures: string[];
  } {
    const providers = [
      {
        name: 'OpenAI',
        configured: this.isApiKeyConfigured('openai'),
        features: ['Corrections IA', 'Exercices personnalisés', 'Tuteur IA']
      },
      {
        name: 'Azure OpenAI',
        configured: this.isApiKeyConfigured('azure'),
        features: ['Corrections IA', 'Exercices personnalisés', 'Tuteur IA']
      },
      {
        name: 'Anthropic Claude',
        configured: this.isApiKeyConfigured('anthropic'),
        features: ['Corrections IA', 'Exercices personnalisés', 'Tuteur IA']
      },
      {
        name: 'ElevenLabs',
        configured: this.isApiKeyConfigured('elevenlabs'),
        features: ['Synthèse vocale', 'Exercices de dictée']
      }
    ];

    const availableFeatures: string[] = [];
    const missingFeatures: string[] = [];

    if (this.serviceConfig.enableAdvancedCorrections) {
      availableFeatures.push('Corrections IA avancées');
    } else {
      missingFeatures.push('Corrections IA avancées');
    }

    if (this.serviceConfig.enablePersonalizedExercises) {
      availableFeatures.push('Exercices personnalisés');
    } else {
      missingFeatures.push('Exercices personnalisés');
    }

    if (this.serviceConfig.enableIntelligentTutor) {
      availableFeatures.push('Tuteur IA intelligent');
    } else {
      missingFeatures.push('Tuteur IA intelligent');
    }

    if (this.serviceConfig.enableVoice) {
      availableFeatures.push('Synthèse vocale');
    } else {
      missingFeatures.push('Synthèse vocale');
    }

    let status: 'ready' | 'partial' | 'not_ready' = 'not_ready';
    if (availableFeatures.length === 4) {
      status = 'ready';
    } else if (availableFeatures.length > 0) {
      status = 'partial';
    }

    return {
      status,
      providers,
      availableFeatures,
      missingFeatures
    };
  }
}

// Instance singleton
export const aiConfigManager = new AIConfigManager();

// Hook React pour utiliser la configuration
export function useAIConfig() {
  const [config, setConfig] = React.useState(aiConfigManager.getConfig());
  const [serviceConfig, setServiceConfig] = React.useState(aiConfigManager.getServiceConfig());
  const [report, setReport] = React.useState(aiConfigManager.generateReport());

  const updateConfig = (newConfig: Partial<AIConfig>) => {
    aiConfigManager.updateConfig(newConfig);
    setConfig(aiConfigManager.getConfig());
    setReport(aiConfigManager.generateReport());
  };

  const updateServiceConfig = (newServiceConfig: Partial<AIServiceConfig>) => {
    aiConfigManager.updateServiceConfig(newServiceConfig);
    setServiceConfig(aiConfigManager.getServiceConfig());
    setReport(aiConfigManager.generateReport());
  };

  const validateConfig = () => {
    return aiConfigManager.validateConfig();
  };

  const isApiKeyConfigured = (provider: keyof AIConfig) => {
    return aiConfigManager.isApiKeyConfigured(provider);
  };

  return {
    config,
    serviceConfig,
    report,
    updateConfig,
    updateServiceConfig,
    validateConfig,
    isApiKeyConfigured
  };
}

// Fonction utilitaire pour créer un client API
export function createAPIClient(provider: AIServiceConfig['provider']) {
  const config = aiConfigManager.getProviderConfig(provider);
  
  if (!config) {
    throw new Error(`Configuration manquante pour le provider: ${provider}`);
  }

  switch (provider) {
    case 'openai':
      return {
        apiKey: config.apiKey,
        baseURL: config.baseUrl,
        model: config.model
      };
    case 'azure':
      return {
        apiKey: config.apiKey,
        endpoint: config.endpoint,
        deploymentName: config.deploymentName
      };
    case 'anthropic':
      return {
        apiKey: config.apiKey,
        baseURL: config.baseUrl
      };
    default:
      throw new Error(`Provider non supporté: ${provider}`);
  }
}
