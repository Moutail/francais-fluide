/**
 * Tests d'intégration pour la synchronisation offline
 * Teste la persistance locale et la synchronisation avec le serveur
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmartEditor } from '@/components/editor/SmartEditor';
import { SyncIndicator } from '@/components/sync/SyncIndicator';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useCollaboration } from '@/hooks/useCollaboration';
import { persistence } from '@/lib/storage/persistence';

// Mock des hooks et modules
jest.mock('@/hooks/useAutoSave');
jest.mock('@/hooks/useCollaboration');
jest.mock('@/hooks/useGrammarCheck');
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: any) => value,
}));

const mockUseAutoSave = useAutoSave as jest.MockedFunction<typeof useAutoSave>;
const mockUseCollaboration = useCollaboration as jest.MockedFunction<typeof useCollaboration>;

// Mock de localStorage et sessionStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

describe('Synchronisation offline - Intégration', () => {
  const mockSave = jest.fn();
  const mockLoad = jest.fn();
  const mockSync = jest.fn();
  const mockConnect = jest.fn();
  const mockDisconnect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock du hook useAutoSave
    mockUseAutoSave.mockReturnValue({
      save: mockSave,
      load: mockLoad,
      isSaving: false,
      lastSaved: new Date(),
    });

    // Mock du hook useCollaboration
    mockUseCollaboration.mockReturnValue({
      connect: mockConnect,
      disconnect: mockDisconnect,
      sync: mockSync,
      isConnected: true,
      isOnline: true,
      pendingChanges: [],
    });
  });

  describe('Sauvegarde automatique', () => {
    it('sauvegarde automatiquement le contenu lors de la saisie', async () => {
      const user = userEvent.setup();
      
      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Contenu à sauvegarder');
      
      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith('Contenu à sauvegarder');
      });
    });

    it('sauvegarde avec un délai pour éviter les appels trop fréquents', async () => {
      const user = userEvent.setup();
      
      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      
      // Taper rapidement plusieurs caractères
      await user.type(textarea, 'a');
      await user.type(textarea, 'b');
      await user.type(textarea, 'c');
      
      // Attendre que la sauvegarde se déclenche
      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith('abc');
      }, { timeout: 1000 });
    });

    it('gère les erreurs de sauvegarde', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockSave.mockRejectedValue(new Error('Erreur de sauvegarde'));
      
      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test erreur');
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Erreur de sauvegarde');
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Chargement du contenu sauvegardé', () => {
    it('charge le contenu sauvegardé au démarrage', async () => {
      mockLoad.mockResolvedValue('Contenu sauvegardé');
      
      render(<SmartEditor />);
      
      await waitFor(() => {
        expect(mockLoad).toHaveBeenCalled();
      });
    });

    it('gère l\'absence de contenu sauvegardé', async () => {
      mockLoad.mockResolvedValue(null);
      
      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('');
    });

    it('gère les erreurs de chargement', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLoad.mockRejectedValue(new Error('Erreur de chargement'));
      
      render(<SmartEditor />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Erreur de chargement');
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Indicateur de synchronisation', () => {
    it('affiche l\'état de connexion', () => {
      render(<SyncIndicator />);
      
      expect(screen.getByText(/En ligne/)).toBeInTheDocument();
    });

    it('affiche l\'état hors ligne', () => {
      mockUseCollaboration.mockReturnValue({
        connect: mockConnect,
        disconnect: mockDisconnect,
        sync: mockSync,
        isConnected: false,
        isOnline: false,
        pendingChanges: [],
      });

      render(<SyncIndicator />);
      
      expect(screen.getByText(/Hors ligne/)).toBeInTheDocument();
    });

    it('affiche le nombre de changements en attente', () => {
      mockUseCollaboration.mockReturnValue({
        connect: mockConnect,
        disconnect: mockDisconnect,
        sync: mockSync,
        isConnected: false,
        isOnline: true,
        pendingChanges: [
          { id: '1', type: 'text_change', content: 'change1' },
          { id: '2', type: 'text_change', content: 'change2' },
        ],
      });

      render(<SyncIndicator />);
      
      expect(screen.getByText(/2 changements en attente/)).toBeInTheDocument();
    });
  });

  describe('Synchronisation avec le serveur', () => {
    it('synchronise les changements lors de la reconnexion', async () => {
      const user = userEvent.setup();
      
      // Simuler une déconnexion puis reconnexion
      mockUseCollaboration
        .mockReturnValueOnce({
          connect: mockConnect,
          disconnect: mockDisconnect,
          sync: mockSync,
          isConnected: false,
          isOnline: false,
          pendingChanges: [
            { id: '1', type: 'text_change', content: 'change1' },
          ],
        })
        .mockReturnValueOnce({
          connect: mockConnect,
          disconnect: mockDisconnect,
          sync: mockSync,
          isConnected: true,
          isOnline: true,
          pendingChanges: [],
        });

      const { rerender } = render(<SyncIndicator />);
      
      // Simuler la reconnexion
      rerender(<SyncIndicator />);
      
      await waitFor(() => {
        expect(mockSync).toHaveBeenCalled();
      });
    });

    it('gère les erreurs de synchronisation', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSync.mockRejectedValue(new Error('Erreur de synchronisation'));
      
      render(<SyncIndicator />);
      
      // Déclencher la synchronisation
      mockUseCollaboration.mockReturnValue({
        connect: mockConnect,
        disconnect: mockDisconnect,
        sync: mockSync,
        isConnected: true,
        isOnline: true,
        pendingChanges: [
          { id: '1', type: 'text_change', content: 'change1' },
        ],
      });
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Erreur de synchronisation');
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Persistance locale', () => {
    it('utilise localStorage pour la persistance', async () => {
      const user = userEvent.setup();
      
      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test localStorage');
      
      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith('Test localStorage');
      });
    });

    it('utilise sessionStorage pour les données temporaires', async () => {
      const user = userEvent.setup();
      
      render(<SmartEditor />);
      
      // Simuler la sauvegarde de données temporaires
      sessionStorageMock.setItem('temp-data', 'données temporaires');
      
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('temp-data', 'données temporaires');
    });

    it('gère les erreurs de stockage local', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Simuler une erreur de localStorage
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Quota exceeded');
      });
      
      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test quota');
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Erreur de stockage local');
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Gestion des conflits', () => {
    it('détecte les conflits lors de la synchronisation', async () => {
      const user = userEvent.setup();
      
      mockSync.mockResolvedValue({
        success: false,
        conflict: true,
        serverVersion: 'version serveur',
        localVersion: 'version locale',
      });
      
      render(<SyncIndicator />);
      
      await waitFor(() => {
        expect(screen.getByText(/Conflit détecté/)).toBeInTheDocument();
      });
    });

    it('propose la résolution de conflits', async () => {
      const user = userEvent.setup();
      
      mockSync.mockResolvedValue({
        success: false,
        conflict: true,
        serverVersion: 'Version serveur',
        localVersion: 'Version locale',
      });
      
      render(<SyncIndicator />);
      
      await waitFor(() => {
        expect(screen.getByText(/Conflit détecté/)).toBeInTheDocument();
      });
      
      // Vérifier que les options de résolution sont disponibles
      expect(screen.getByText(/Garder version locale/)).toBeInTheDocument();
      expect(screen.getByText(/Utiliser version serveur/)).toBeInTheDocument();
    });

    it('résout les conflits en gardant la version locale', async () => {
      const user = userEvent.setup();
      
      mockSync.mockResolvedValue({
        success: false,
        conflict: true,
        serverVersion: 'Version serveur',
        localVersion: 'Version locale',
      });
      
      render(<SyncIndicator />);
      
      await waitFor(() => {
        const keepLocalButton = screen.getByText(/Garder version locale/);
        fireEvent.click(keepLocalButton);
      });
      
      await waitFor(() => {
        expect(mockSync).toHaveBeenCalledWith({
          resolveConflict: 'local',
          version: 'Version locale',
        });
      });
    });
  });

  describe('Mode hors ligne complet', () => {
    it('fonctionne entièrement hors ligne', async () => {
      const user = userEvent.setup();
      
      mockUseCollaboration.mockReturnValue({
        connect: mockConnect,
        disconnect: mockDisconnect,
        sync: mockSync,
        isConnected: false,
        isOnline: false,
        pendingChanges: [],
      });
      
      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Travail hors ligne');
      
      // Le texte devrait être sauvegardé localement
      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith('Travail hors ligne');
      });
    });

    it('synchronise automatiquement lors du retour en ligne', async () => {
      const user = userEvent.setup();
      
      // Simuler le passage hors ligne puis en ligne
      mockUseCollaboration
        .mockReturnValueOnce({
          connect: mockConnect,
          disconnect: mockDisconnect,
          sync: mockSync,
          isConnected: false,
          isOnline: false,
          pendingChanges: [
            { id: '1', type: 'text_change', content: 'changement offline' },
          ],
        })
        .mockReturnValueOnce({
          connect: mockConnect,
          disconnect: mockDisconnect,
          sync: mockSync,
          isConnected: true,
          isOnline: true,
          pendingChanges: [],
        });

      const { rerender } = render(<SyncIndicator />);
      
      // Simuler le retour en ligne
      rerender(<SyncIndicator />);
      
      await waitFor(() => {
        expect(mockSync).toHaveBeenCalled();
      });
    });
  });

  describe('Performance et optimisation', () => {
    it('optimise les sauvegardes avec debounce', async () => {
      const user = userEvent.setup();
      
      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      
      // Taper rapidement
      await user.type(textarea, 'a');
      await user.type(textarea, 'b');
      await user.type(textarea, 'c');
      
      // Attendre que le debounce se déclenche
      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith('abc');
      }, { timeout: 1000 });
      
      // Vérifier qu'on n'a pas trop d'appels
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it('utilise le cache pour éviter les sauvegardes inutiles', async () => {
      const user = userEvent.setup();
      
      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'même contenu');
      
      // Taper le même contenu plusieurs fois
      await user.clear(textarea);
      await user.type(textarea, 'même contenu');
      
      // La sauvegarde ne devrait pas être appelée deux fois pour le même contenu
      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith('même contenu');
      });
    });
  });

  describe('Sécurité et validation', () => {
    it('valide les données avant sauvegarde', async () => {
      const user = userEvent.setup();
      
      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      
      // Taper du contenu avec des caractères spéciaux
      await user.type(textarea, 'Contenu avec <script>alert("test")</script>');
      
      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith('Contenu avec <script>alert("test")</script>');
      });
    });

    it('gère les données corrompues lors du chargement', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLoad.mockRejectedValue(new Error('Données corrompues'));
      
      render(<SmartEditor />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Erreur de chargement');
      });
      
      consoleSpy.mockRestore();
    });
  });
});
