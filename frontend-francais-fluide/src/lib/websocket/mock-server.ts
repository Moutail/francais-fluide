// Simulation du serveur WebSocket pour les tests
// En production, remplacer par un vrai serveur Socket.io

export class MockWebSocketServer {
  private rooms: Map<string, any> = new Map();
  private users: Map<string, any> = new Map();
  private messages: Map<string, any[]> = new Map();

  // Simuler la connexion
  connect(userId: string, userData: any) {
    this.users.set(userId, {
      ...userData,
      connectedAt: new Date(),
      isOnline: true
    });
    
    console.log(`Utilisateur ${userId} connecté`);
    return { success: true, userId };
  }

  // Simuler la déconnexion
  disconnect(userId: string) {
    const user = this.users.get(userId);
    if (user) {
      user.isOnline = false;
      user.disconnectedAt = new Date();
    }
    
    console.log(`Utilisateur ${userId} déconnecté`);
    return { success: true };
  }

  // Simuler la création/rejoindre d'une room
  joinRoom(roomId: string, documentId: string, user: any) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        documentId,
        users: [],
        content: '',
        lastModified: new Date(),
        isLocked: false,
        lockOwner: null
      });
    }

    const room = this.rooms.get(roomId);
    const existingUser = room.users.find((u: any) => u.id === user.id);
    
    if (!existingUser) {
      room.users.push({
        ...user,
        joinedAt: new Date(),
        isTyping: false,
        lastSeen: new Date()
      });
    } else {
      existingUser.lastSeen = new Date();
    }

    this.messages.set(roomId, this.messages.get(roomId) || []);

    console.log(`Utilisateur ${user.id} a rejoint la room ${roomId}`);
    return { success: true, room };
  }

  // Simuler la sortie d'une room
  leaveRoom(roomId: string, userId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.users = room.users.filter((u: any) => u.id !== userId);
      
      if (room.users.length === 0) {
        this.rooms.delete(roomId);
        this.messages.delete(roomId);
      }
    }

    console.log(`Utilisateur ${userId} a quitté la room ${roomId}`);
    return { success: true };
  }

  // Simuler l'envoi d'un message
  sendMessage(roomId: string, message: any) {
    const messages = this.messages.get(roomId) || [];
    messages.push(message);
    this.messages.set(roomId, messages);

    console.log(`Message envoyé dans la room ${roomId}:`, message.content);
    return { success: true, message };
  }

  // Simuler le mouvement du curseur
  updateCursor(roomId: string, userId: string, cursor: any) {
    const room = this.rooms.get(roomId);
    if (room) {
      const user = room.users.find((u: any) => u.id === userId);
      if (user) {
        user.cursor = cursor;
        user.lastSeen = new Date();
      }
    }

    return { success: true };
  }

  // Simuler la sélection de texte
  updateSelection(roomId: string, userId: string, selection: any) {
    const room = this.rooms.get(roomId);
    if (room) {
      const user = room.users.find((u: any) => u.id === userId);
      if (user) {
        user.selection = selection;
        user.lastSeen = new Date();
      }
    }

    return { success: true };
  }

  // Simuler l'état de frappe
  updateTyping(roomId: string, userId: string, isTyping: boolean) {
    const room = this.rooms.get(roomId);
    if (room) {
      const user = room.users.find((u: any) => u.id === userId);
      if (user) {
        user.isTyping = isTyping;
        user.lastSeen = new Date();
      }
    }

    return { success: true };
  }

  // Simuler une opération de document
  applyDocumentOperation(roomId: string, operation: any) {
    const room = this.rooms.get(roomId);
    if (room) {
      // Simulation simple d'application d'opération
      room.content = operation.text;
      room.lastModified = new Date();
    }

    console.log(`Opération de document appliquée dans la room ${roomId}`);
    return { success: true, operation };
  }

  // Simuler le verrouillage/déverrouillage de room
  toggleRoomLock(roomId: string, userId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      if (room.isLocked && room.lockOwner === userId) {
        room.isLocked = false;
        room.lockOwner = null;
      } else if (!room.isLocked) {
        room.isLocked = true;
        room.lockOwner = userId;
      }
    }

    console.log(`Room ${roomId} ${room?.isLocked ? 'verrouillée' : 'déverrouillée'} par ${userId}`);
    return { success: true, isLocked: room?.isLocked, lockOwner: room?.lockOwner };
  }

  // Obtenir les statistiques
  getStats() {
    return {
      totalRooms: this.rooms.size,
      totalUsers: this.users.size,
      onlineUsers: Array.from(this.users.values()).filter((u: any) => u.isOnline).length,
      totalMessages: Array.from(this.messages.values()).reduce((total, msgs) => total + msgs.length, 0)
    };
  }

  // Obtenir une room
  getRoom(roomId: string) {
    return this.rooms.get(roomId);
  }

  // Obtenir les messages d'une room
  getMessages(roomId: string) {
    return this.messages.get(roomId) || [];
  }
}

// Instance globale du serveur simulé
export const mockWebSocketServer = new MockWebSocketServer();
