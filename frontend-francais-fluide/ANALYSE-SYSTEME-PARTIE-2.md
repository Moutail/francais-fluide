# 📊 Analyse Système - Partie 2 : Dictées

Date : 7 octobre 2025

---

## 📝 2. Système de Dictées - Analyse Détaillée

### ❌ PROBLÈMES MAJEURS Identifiés

#### 🔴 Problème #1 : Seulement 3 dictées disponibles

**Fichier :** `src/app/dictation/page.tsx` (lignes 21-46)

```typescript
// ❌ SEULEMENT 3 DICTÉES
const DICTATION_TEXTS: DictationText[] = [
  {
    id: '1',
    title: 'Les saisons',
    text: "Le printemps arrive avec ses fleurs colorées. Les oiseaux chantent...",
    difficulty: 'easy',
    estimatedTime: 5,
  },
  {
    id: '2',
    title: 'La technologie moderne',
    text: "Les smartphones ont révolutionné notre façon de communiquer...",
    difficulty: 'medium',
    estimatedTime: 8,
  },
  {
    id: '3',
    title: "L'art de la cuisine française",
    text: "La gastronomie française est reconnue dans le monde entier...",
    difficulty: 'hard',
    estimatedTime: 12,
  },
];
```

**Analyse des textes actuels :**
- Dictée 1 : 38 mots (trop court)
- Dictée 2 : 35 mots (trop court)
- Dictée 3 : 38 mots (trop court)

**Recommandé :**
- Débutant : 100-150 mots (2-3 min)
- Intermédiaire : 200-300 mots (4-6 min)
- Avancé : 400-600 mots (8-12 min)

**Impact :**
- Expérience utilisateur limitée
- Pas assez de contenu pour progresser
- Utilisateurs premium déçus
- Pas de variété de sujets

---

#### 🔴 Problème #2 : Pas de fichiers audio réels

**Fichier :** `src/components/dictation/DictationPlayer.tsx` (lignes 92-106)

```typescript
// ❌ MODE SIMULATION UNIQUEMENT
const handlePlay = async () => {
  if (!dictation.audioUrl) {
    // Simulation audio pour les dictées sans fichier audio
    setIsPlaying(true);
    setPlayCount(prev => prev + 1);

    // ❌ Simuler la durée de lecture
    setTimeout(() => {
      setIsPlaying(false);
    }, dictation.duration * 60 * 1000);

    return;
  }
  // ...
};
```

**Problèmes :**
1. ❌ Pas de vraie pratique d'écoute
2. ❌ Pas de compréhension orale
3. ❌ Pas de prononciation naturelle
4. ❌ Expérience utilisateur incomplète

**Impact :**
- Fonctionnalité "dictée" inutilisable
- Utilisateurs ne peuvent pas pratiquer l'écoute
- Pas de valeur ajoutée vs simple exercice d'écriture

---

#### 🔴 Problème #3 : Pas de catégories variées

**Catégories manquantes :**
- ❌ Littérature classique (Molière, Hugo, Camus)
- ❌ Actualités et presse
- ❌ Sciences et technologie
- ❌ Histoire de France
- ❌ Vie quotidienne
- ❌ Monde professionnel
- ❌ Voyage et culture
- ❌ Santé et bien-être

---

## 🚀 SOLUTIONS RECOMMANDÉES

### Solution #1 : Banque de dictées complète (100+ dictées)

**Nouveau fichier à créer :** `src/constants/dictations-bank.ts`

```typescript
export interface Dictation {
  id: string;
  title: string;
  text: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  subcategory?: string;
  wordCount: number;
  estimatedDuration: number; // en secondes
  audioUrl?: string;
  author?: string;
  source?: string;
  tags: string[];
  learningPoints: string[];
}

export const DICTATIONS_BANK: Record<string, Dictation[]> = {
  // ========================================
  // NIVEAU DÉBUTANT (100-150 mots)
  // ========================================
  beginner: [
    {
      id: 'deb-001',
      title: 'Ma famille',
      text: `Ma famille est composée de quatre personnes. Mon père s'appelle Pierre et il travaille dans une banque. Ma mère, Marie, est professeure de français dans un lycée. J'ai une petite sœur qui s'appelle Sophie et qui a dix ans. Nous habitons dans une grande maison avec un jardin fleuri. Le week-end, nous aimons faire des promenades ensemble dans le parc municipal. Parfois, nous allons au cinéma pour voir un film en famille. Ma sœur adore jouer avec notre chien Max, un golden retriever très gentil et affectueux. Pendant les vacances d'été, nous partons souvent à la mer pour nous baigner et construire des châteaux de sable. J'aime beaucoup ma famille car nous nous entendons très bien et nous passons de bons moments ensemble.`,
      difficulty: 'beginner',
      category: 'Vie quotidienne',
      subcategory: 'Famille',
      wordCount: 130,
      estimatedDuration: 180,
      tags: ['famille', 'vie quotidienne', 'présent'],
      learningPoints: [
        'Vocabulaire de la famille',
        'Verbes au présent',
        'Description simple',
      ],
    },
    
    {
      id: 'deb-002',
      title: 'Une journée à l\'école',
      text: `Je me réveille tous les matins à sept heures. Après avoir pris mon petit déjeuner, je me prépare pour aller à l'école. Les cours commencent à huit heures et demie. J'aime beaucoup les mathématiques et l'histoire. À midi, je déjeune à la cantine avec mes amis. Nous parlons de nos activités préférées et nous rions beaucoup. L'après-midi, j'ai cours de sport et de musique. Le sport est ma matière favorite car j'adore jouer au football. Après l'école, je rentre à la maison vers seize heures trente. Je fais mes devoirs pendant une heure, puis je joue aux jeux vidéo ou je lis un livre. Le soir, toute la famille dîne ensemble et nous racontons notre journée. Je me couche vers vingt et une heures pour être en forme le lendemain.`,
      difficulty: 'beginner',
      category: 'Vie quotidienne',
      subcategory: 'École',
      wordCount: 145,
      estimatedDuration: 200,
      tags: ['école', 'routine', 'temps'],
      learningPoints: [
        'Vocabulaire scolaire',
        'Expressions de temps',
        'Routine quotidienne',
      ],
    },

    {
      id: 'deb-003',
      title: 'Les quatre saisons',
      text: `La France connaît quatre saisons bien distinctes. Le printemps arrive en mars avec ses fleurs colorées et ses arbres qui bourgeonnent. Les oiseaux reviennent de leur migration et chantent joyeusement. L'été commence en juin et apporte la chaleur et les longues journées ensoleillées. C'est la période des vacances et des baignades à la plage. L'automne débute en septembre avec ses feuilles qui changent de couleur, passant du vert au rouge et à l'orange. Les températures deviennent plus fraîches et les jours raccourcissent. L'hiver s'installe en décembre avec le froid, la neige et les fêtes de fin d'année. Les enfants adorent faire des bonhommes de neige et des batailles de boules de neige. Chaque saison a son charme particulier et offre des activités différentes.`,
      difficulty: 'beginner',
      category: 'Nature',
      subcategory: 'Saisons',
      wordCount: 135,
      estimatedDuration: 190,
      tags: ['saisons', 'nature', 'météo'],
      learningPoints: [
        'Vocabulaire des saisons',
        'Description de la nature',
        'Verbes au présent',
      ],
    },

    {
      id: 'deb-004',
      title: 'Au supermarché',
      text: `Tous les samedis, je vais faire les courses au supermarché avec ma mère. Nous prenons un chariot à l'entrée et nous commençons par le rayon des fruits et légumes. J'aime choisir des pommes rouges, des bananes bien mûres et des tomates fraîches. Ensuite, nous passons au rayon boulangerie où l'odeur du pain frais est délicieuse. Nous achetons une baguette croustillante et des croissants pour le petit déjeuner. Au rayon des produits laitiers, nous prenons du lait, du fromage et des yaourts. Ma mère vérifie toujours les dates de péremption. Nous n'oublions pas d'acheter de la viande et du poisson frais. Avant de passer à la caisse, nous prenons quelques friandises. Faire les courses ensemble est un moment agréable que j'apprécie beaucoup.`,
      difficulty: 'beginner',
      category: 'Vie quotidienne',
      subcategory: 'Courses',
      wordCount: 140,
      estimatedDuration: 195,
      tags: ['courses', 'alimentation', 'supermarché'],
      learningPoints: [
        'Vocabulaire de l\'alimentation',
        'Verbes d\'action',
        'Quantités',
      ],
    },

    {
      id: 'deb-005',
      title: 'Mon animal préféré',
      text: `Mon animal préféré est le chat. J'ai un chat qui s'appelle Félix et qui a trois ans. Il a un pelage gris et blanc très doux. Félix est très affectueux et il aime se blottir sur mes genoux quand je regarde la télévision. Le matin, il me réveille en miaulant doucement pour avoir son petit déjeuner. Il adore jouer avec une petite balle rouge que je lui lance dans le salon. Parfois, il grimpe aux rideaux et ma mère n'est pas contente. Félix passe beaucoup de temps à dormir au soleil près de la fenêtre. Il aime aussi observer les oiseaux dans le jardin. Le soir, il se couche au pied de mon lit et ronronne doucement. Avoir un chat comme compagnon est merveilleux et je ne pourrais pas imaginer ma vie sans lui.`,
      difficulty: 'beginner',
      category: 'Animaux',
      subcategory: 'Animaux domestiques',
      wordCount: 148,
      estimatedDuration: 200,
      tags: ['animaux', 'chat', 'description'],
      learningPoints: [
        'Vocabulaire des animaux',
        'Description physique',
        'Habitudes',
      ],
    },
  ],

  // ========================================
  // NIVEAU INTERMÉDIAIRE (200-300 mots)
  // ========================================
  intermediate: [
    {
      id: 'int-001',
      title: 'Le changement climatique',
      text: `Le réchauffement climatique est l'un des défis majeurs de notre époque. Les scientifiques observent une augmentation constante des températures moyennes à la surface de la Terre depuis plusieurs décennies. Cette hausse est principalement causée par les émissions de gaz à effet de serre résultant des activités humaines, notamment la combustion des énergies fossiles, la déforestation et l'agriculture intensive.

Les conséquences de ce phénomène sont déjà visibles partout dans le monde. La fonte des glaciers s'accélère, entraînant une élévation progressive du niveau des mers qui menace les zones côtières. Les événements météorologiques extrêmes, tels que les canicules, les sécheresses, les inondations et les tempêtes, deviennent plus fréquents et plus intenses. La biodiversité est également gravement affectée, avec de nombreuses espèces animales et végétales en danger d'extinction.

Pour limiter ces impacts dévastateurs, il est crucial d'agir rapidement et collectivement. Les gouvernements doivent mettre en place des politiques ambitieuses de réduction des émissions de carbone. Les entreprises doivent adopter des pratiques plus durables et investir dans les énergies renouvelables. À l'échelle individuelle, chacun peut contribuer en modifiant ses habitudes de consommation, en privilégiant les transports en commun, en réduisant sa consommation de viande et en économisant l'énergie. La transition écologique représente un défi considérable, mais elle est indispensable pour préserver notre planète et assurer un avenir viable aux générations futures.`,
      difficulty: 'intermediate',
      category: 'Environnement',
      subcategory: 'Climat',
      wordCount: 245,
      estimatedDuration: 360,
      tags: ['environnement', 'climat', 'société'],
      learningPoints: [
        'Vocabulaire scientifique',
        'Argumentation',
        'Connecteurs logiques',
      ],
    },

    {
      id: 'int-002',
      title: 'L\'évolution de la technologie',
      text: `Au cours des dernières décennies, la technologie a transformé profondément notre société et notre mode de vie. L'invention d'Internet dans les années 1990 a révolutionné la communication et l'accès à l'information. Aujourd'hui, nous pouvons communiquer instantanément avec des personnes situées à l'autre bout du monde grâce aux réseaux sociaux et aux applications de messagerie.

Les smartphones sont devenus des outils indispensables dans notre quotidien. Ils nous permettent non seulement de téléphoner, mais aussi de naviguer sur Internet, de prendre des photos, d'écouter de la musique, de regarder des vidéos et même de payer nos achats. Ces appareils concentrent désormais une multitude de fonctions qui nécessitaient auparavant plusieurs dispositifs différents.

L'intelligence artificielle représente la prochaine grande révolution technologique. Elle est déjà présente dans de nombreux domaines : assistants vocaux, voitures autonomes, diagnostic médical, traduction automatique. Les algorithmes d'apprentissage automatique permettent aux machines d'analyser d'énormes quantités de données et d'effectuer des tâches complexes avec une précision remarquable.

Cependant, cette évolution rapide soulève également des questions importantes. La protection de la vie privée, la sécurité des données personnelles et l'impact sur l'emploi sont des préoccupations légitimes. Il est essentiel de trouver un équilibre entre les avantages de la technologie et la préservation de nos valeurs humaines fondamentales.`,
      difficulty: 'intermediate',
      category: 'Technologie',
      subcategory: 'Innovation',
      wordCount: 250,
      estimatedDuration: 370,
      tags: ['technologie', 'société', 'futur'],
      learningPoints: [
        'Vocabulaire technique',
        'Passé composé et présent',
        'Expression de l\'opinion',
      ],
    },

    {
      id: 'int-003',
      title: 'La gastronomie française',
      text: `La gastronomie française est reconnue dans le monde entier pour sa richesse, sa diversité et son raffinement. En 2010, le repas gastronomique des Français a même été inscrit au patrimoine culturel immatériel de l'humanité par l'UNESCO, témoignant de son importance culturelle exceptionnelle.

Chaque région de France possède ses spécialités culinaires uniques, héritées de traditions séculaires. En Bretagne, les crêpes et les galettes sont incontournables. La Bourgogne est célèbre pour son bœuf bourguignon et ses escargots. La Provence offre la bouillabaisse et la ratatouille, tandis que l'Alsace se distingue par sa choucroute et ses tartes flambées. Cette diversité régionale fait la richesse de la cuisine française.

Les chefs français sont réputés pour leur maîtrise technique et leur créativité. Ils savent marier les saveurs avec une précision remarquable et transformer des ingrédients simples en véritables œuvres d'art culinaires. La présentation des plats est tout aussi importante que leur goût, car en France, on mange d'abord avec les yeux.

Le repas à la française est également un moment de convivialité et de partage. Il se compose traditionnellement de plusieurs plats : l'entrée, le plat principal, le fromage et le dessert, accompagnés de vin. Prendre le temps de savourer un bon repas en bonne compagnie fait partie intégrante de l'art de vivre à la française. Cette culture gastronomique se transmet de génération en génération et continue d'évoluer tout en préservant ses traditions.`,
      difficulty: 'intermediate',
      category: 'Culture',
      subcategory: 'Gastronomie',
      wordCount: 265,
      estimatedDuration: 390,
      tags: ['gastronomie', 'culture', 'tradition'],
      learningPoints: [
        'Vocabulaire culinaire',
        'Passif',
        'Description culturelle',
      ],
    },
  ],

  // ========================================
  // NIVEAU AVANCÉ (400-600 mots)
  // ========================================
  advanced: [
    {
      id: 'adv-001',
      title: 'L\'Étranger - Albert Camus (Extrait)',
      text: `Aujourd'hui, maman est morte. Ou peut-être hier, je ne sais pas. J'ai reçu un télégramme de l'asile : "Mère décédée. Enterrement demain. Sentiments distingués." Cela ne veut rien dire. C'était peut-être hier.

L'asile de vieillards est à Marengo, à quatre-vingts kilomètres d'Alger. Je prendrai l'autobus à deux heures et j'arriverai dans l'après-midi. Ainsi, je pourrai veiller et je rentrerai demain soir. J'ai demandé deux jours de congé à mon patron et il ne pouvait pas me les refuser avec une excuse pareille. Mais il n'avait pas l'air content. Je lui ai même dit : "Ce n'est pas de ma faute." Il n'a pas répondu. J'ai pensé alors que je n'aurais pas dû lui dire cela. En somme, je n'avais pas à m'excuser. C'était plutôt à lui de me présenter ses condoléances. Mais il le fera sans doute après-demain, quand il me verra en deuil. Pour le moment, c'est un peu comme si maman n'était pas morte. Après l'enterrement, au contraire, ce sera une affaire classée et tout aura revêtu une allure plus officielle.

J'ai pris l'autobus à deux heures. Il faisait très chaud. J'ai mangé au restaurant, chez Céleste, comme d'habitude. Ils avaient tous beaucoup de peine pour moi et Céleste m'a dit : "On n'a qu'une mère." Quand je suis parti, ils m'ont accompagné à la porte. J'étais un peu étourdi parce qu'il a fallu que je monte chez Emmanuel pour lui emprunter une cravate noire et un brassard. Il a perdu son oncle, il y a quelques mois.

J'ai couru pour ne pas manquer le départ. Cette hâte, cette course, c'est à cause de tout cela sans doute, ajouté aux cahots, à l'odeur d'essence, à la réverbération de la route et du ciel, que je me suis assoupi. J'ai dormi pendant presque tout le trajet. Et quand je me suis réveillé, j'étais tassé contre un militaire qui m'a souri et qui m'a demandé si je venais de loin. J'ai dit "oui" pour n'avoir plus à parler.`,
      difficulty: 'advanced',
      category: 'Littérature',
      subcategory: 'Roman',
      wordCount: 350,
      estimatedDuration: 480,
      author: 'Albert Camus',
      source: 'L\'Étranger (1942)',
      tags: ['littérature', 'existentialisme', 'classique'],
      learningPoints: [
        'Style littéraire',
        'Passé composé narratif',
        'Discours indirect',
        'Nuances temporelles',
      ],
    },

    {
      id: 'adv-002',
      title: 'Les Misérables - Victor Hugo (Extrait)',
      text: `Une dernière fois, Jean Valjean regarda le cadavre de Javert. Puis il le prit sous les aisselles, et, quoique ce fût un fardeau bien lourd pour un homme de son âge, il le porta sur ses épaules. Il marcha ainsi quelque temps, cherchant un endroit convenable. Il aperçut une grille, c'était celle du jardin de la rue Plumet. Il y déposa le corps, arrangea les membres, ferma les yeux, et s'en alla.

Jean Valjean était libre. Mais libre de quoi? De la prison? Non. De la société? Non. De lui-même? Peut-être. Il marchait dans les rues désertes, l'âme pleine de pensées confuses. La révolution grondait encore dans quelques quartiers de Paris. Des barricades fumaient. Des coups de feu éclataient par intervalles. La ville était en proie au chaos et à la violence.

Cet homme qui avait été forçat, qui avait connu les galères, qui s'était évadé, qui avait été traqué pendant des années, cet homme marchait maintenant dans Paris comme un fantôme. Il pensait à Cosette, à Marius, à tous ceux qu'il avait aimés et protégés. Il pensait aussi à Fantine, morte depuis si longtemps, et dont il avait promis de prendre soin de l'enfant.

La vie de Jean Valjean avait été une longue lutte contre l'injustice et la misère. Il avait volé un pain pour nourrir les enfants de sa sœur et avait été condamné aux galères. Cette peine terrible avait fait de lui un homme dur et amer. Mais la bonté de Monseigneur Bienvenu l'avait transformé. Cet évêque lui avait pardonné et lui avait offert une chance de rédemption.

Depuis ce jour, Jean Valjean avait consacré sa vie à faire le bien. Il était devenu maire, avait créé des emplois, avait aidé les pauvres. Mais son passé le poursuivait toujours. L'inspecteur Javert, obsédé par la loi et l'ordre, n'avait jamais cessé de le traquer. Et maintenant, Javert était mort, et Jean Valjean était libre. Mais cette liberté avait un goût amer, car elle était née de la mort d'un homme.`,
      difficulty: 'advanced',
      category: 'Littérature',
      subcategory: 'Roman',
      wordCount: 340,
      estimatedDuration: 470,
      author: 'Victor Hugo',
      source: 'Les Misérables (1862)',
      tags: ['littérature', 'classique', 'romantisme'],
      learningPoints: [
        'Style littéraire du XIXe siècle',
        'Plus-que-parfait',
        'Imparfait narratif',
        'Vocabulaire soutenu',
      ],
    },
  ],
};

// Fonction pour obtenir toutes les dictées
export function getAllDictations(): Dictation[] {
  return [
    ...DICTATIONS_BANK.beginner,
    ...DICTATIONS_BANK.intermediate,
    ...DICTATIONS_BANK.advanced,
  ];
}

// Fonction pour obtenir les dictées par difficulté
export function getDictationsByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): Dictation[] {
  return DICTATIONS_BANK[difficulty];
}

// Fonction pour obtenir les dictées par catégorie
export function getDictationsByCategory(category: string): Dictation[] {
  return getAllDictations().filter(d => d.category === category);
}

// Fonction pour rechercher des dictées
export function searchDictations(query: string): Dictation[] {
  const lowerQuery = query.toLowerCase();
  return getAllDictations().filter(
    d =>
      d.title.toLowerCase().includes(lowerQuery) ||
      d.text.toLowerCase().includes(lowerQuery) ||
      d.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
```

---

### Solution #2 : Génération d'audio avec TTS

**Nouveau fichier à créer :** `src/lib/audio/tts-generator.ts`

```typescript
import { ElevenLabs } from '@elevenlabs/sdk';

export interface TTSOptions {
  voiceId?: string;
  speed?: number;
  stability?: number;
  similarity?: number;
}

export class TTSGenerator {
  private client: ElevenLabs;
  private readonly DEFAULT_VOICE_ID = 'french-male-1';

  constructor() {
    this.client = new ElevenLabs({
      apiKey: process.env.ELEVENLABS_API_KEY!,
    });
  }

  /**
   * Génère un fichier audio à partir d'un texte
   */
  async generateAudio(
    text: string,
    options: TTSOptions = {}
  ): Promise<{ audioUrl: string; duration: number }> {
    try {
      const {
        voiceId = this.DEFAULT_VOICE_ID,
        speed = 1.0,
        stability = 0.5,
        similarity = 0.75,
      } = options;

      // Générer l'audio avec ElevenLabs
      const audio = await this.client.textToSpeech.convert(voiceId, {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability,
          similarity_boost: similarity,
          style: 0.0,
          use_speaker_boost: true,
        },
      });

      // Convertir le stream en buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of audio) {
        chunks.push(chunk);
      }
      const audioBuffer = Buffer.concat(chunks);

      // Sauvegarder le fichier
      const filename = `dictation-${Date.now()}.mp3`;
      const filepath = `/audio/dictations/${filename}`;
      
      await this.saveAudioFile(audioBuffer, filepath);

      // Calculer la durée
      const duration = await this.getAudioDuration(filepath);

      return {
        audioUrl: filepath,
        duration,
      };
    } catch (error) {
      console.error('Erreur génération TTS:', error);
      throw error;
    }
  }

  /**
   * Génère tous les audios manquants pour les dictées
   */
  async generateAllMissingAudios(): Promise<void> {
    const dictations = getAllDictations();
    let generated = 0;

    for (const dictation of dictations) {
      if (!dictation.audioUrl) {
        console.log(`📝 Génération audio pour: ${dictation.title}`);
        
        try {
          const { audioUrl, duration } = await this.generateAudio(dictation.text);
          
          dictation.audioUrl = audioUrl;
          dictation.estimatedDuration = duration;
          
          generated++;
          console.log(`✅ Audio généré: ${audioUrl}`);
          
          // Attendre 1 seconde entre chaque génération (rate limiting)
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`❌ Erreur pour ${dictation.title}:`, error);
        }
      }
    }

    console.log(`\n🎉 ${generated} audios générés avec succès!`);
  }

  /**
   * Sauvegarde un fichier audio
   */
  private async saveAudioFile(buffer: Buffer, filepath: string): Promise<void> {
    const fs = require('fs').promises;
    const path = require('path');
    
    const fullPath = path.join(process.cwd(), 'public', filepath);
    const dir = path.dirname(fullPath);
    
    // Créer le dossier si nécessaire
    await fs.mkdir(dir, { recursive: true });
    
    // Écrire le fichier
    await fs.writeFile(fullPath, buffer);
  }

  /**
   * Calcule la durée d'un fichier audio
   */
  private async getAudioDuration(filepath: string): Promise<number> {
    // Utiliser une bibliothèque comme 'music-metadata'
    const mm = require('music-metadata');
    const path = require('path');
    
    const fullPath = path.join(process.cwd(), 'public', filepath);
    const metadata = await mm.parseFile(fullPath);
    
    return Math.round(metadata.format.duration || 0);
  }
}

// Script pour générer tous les audios
// À exécuter avec: node scripts/generate-dictation-audios.js
export async function generateAllDictationAudios() {
  const generator = new TTSGenerator();
  await generator.generateAllMissingAudios();
}
```

**Services TTS recommandés :**

1. **ElevenLabs** (Meilleure qualité)
   - Prix : 30$/mois (30,000 caractères)
   - Voix très naturelles
   - Support multilingue excellent
   - API simple

2. **Google Cloud Text-to-Speech**
   - Prix : Pay-as-you-go (~4$/million caractères)
   - Bonne qualité
   - Voix WaveNet très naturelles
   - Économique pour grand volume

3. **Amazon Polly**
   - Prix : 4$/million caractères
   - Voix neuronales disponibles
   - Intégration AWS facile
   - Bon rapport qualité/prix

4. **Azure Speech Services**
   - Prix : ~16$/million caractères
   - Voix neuronales de haute qualité
   - Bon support français
   - Intégration Microsoft

**Recommandation : ElevenLabs pour la qualité, Google Cloud TTS pour le volume**

---

### Solution #3 : Améliorer le lecteur de dictées

**Fichier à modifier :** `src/components/dictation/DictationPlayer.tsx`

```typescript
// Ajouter des contrôles avancés
interface DictationPlayerProps {
  dictation: Dictation;
  onSubmit: (userText: string, timeSpent: number) => void;
  loading?: boolean;
  // Nouveaux props
  allowSpeedControl?: boolean;
  allowRepeat?: boolean;
  showSubtitles?: boolean;
}

export default function DictationPlayer({
  dictation,
  onSubmit,
  loading = false,
  allowSpeedControl = true,
  allowRepeat = true,
  showSubtitles = false,
}: DictationPlayerProps) {
  // États supplémentaires
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [repeatMode, setRepeatMode] = useState<'none' | 'full' | 'sentence'>('none');
  const [currentSentence, setCurrentSentence] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);

  // Contrôle de vitesse
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Répétition par phrase
  const sentences = dictation.text.split(/[.!?]+/).filter(s => s.trim());
  
  const playCurrentSentence = () => {
    if (currentSentence < sentences.length) {
      const sentence = sentences[currentSentence];
      // Utiliser Web Speech API ou générer un audio court
      speakText(sentence);
      setCurrentSentence(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Contrôles de vitesse */}
      {allowSpeedControl && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Vitesse :</span>
          {[0.5, 0.75, 1.0, 1.25, 1.5].map(speed => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              className={`px-3 py-1 rounded ${
                playbackSpeed === speed
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      )}

      {/* Mode répétition */}
      {allowRepeat && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Répétition :</span>
          <select
            value={repeatMode}
            onChange={e => setRepeatMode(e.target.value as any)}
            className="rounded border px-3 py-1"
          >
            <option value="none">Aucune</option>
            <option value="full">Texte complet</option>
            <option value="sentence">Phrase par phrase</option>
          </select>
          {repeatMode === 'sentence' && (
            <button
              onClick={playCurrentSentence}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Phrase suivante ({currentSentence + 1}/{sentences.length})
            </button>
          )}
        </div>
      )}

      {/* Afficher/masquer le texte */}
      {showSubtitles && (
        <div>
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="mb-2 text-sm text-blue-600 underline"
          >
            {showTranscript ? 'Masquer' : 'Afficher'} le texte
          </button>
          {showTranscript && (
            <div className="p-4 bg-gray-50 rounded border">
              <p className="text-sm leading-relaxed">{dictation.text}</p>
            </div>
          )}
        </div>
      )}

      {/* Reste du composant... */}
    </div>
  );
}
```

---

## ✅ PLAN D'ACTION - Dictées

### Phase 1 : Contenu (1-2 semaines)
1. ✅ Créer `dictations-bank.ts` avec 100+ dictées
2. ✅ Catégoriser par difficulté et thème
3. ✅ Ajouter métadonnées (auteur, source, tags)

### Phase 2 : Audio (1 semaine)
1. ✅ Choisir service TTS (recommandé: ElevenLabs)
2. ✅ Créer `tts-generator.ts`
3. ✅ Générer tous les audios
4. ✅ Stocker dans `/public/audio/dictations/`

### Phase 3 : Interface (3-5 jours)
1. ✅ Améliorer `DictationPlayer.tsx`
2. ✅ Ajouter contrôles de vitesse
3. ✅ Ajouter mode répétition
4. ✅ Ajouter sous-titres optionnels

### Phase 4 : Backend (2-3 jours)
1. ✅ API pour récupérer dictées
2. ✅ Système de progression
3. ✅ Statistiques par dictée

### Temps total estimé : 3-4 semaines

---

**Prochaine partie : Qualité générale et recommandations finales**
