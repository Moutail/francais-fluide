// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  url: string;
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  lastError: Error | null;
  lastMessage: any;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const {
    url,
    autoConnect = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    lastError: null,
    lastMessage: null
  });

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setState(prev => ({ ...prev, isConnecting: true }));

    socketRef.current = io(url, {
      reconnection: true,
      reconnectionAttempts,
      reconnectionDelay,
      transports: ['websocket']
    });

    socketRef.current.on('connect', () => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        lastError: null
      }));
    });

    socketRef.current.on('disconnect', () => {
      setState(prev => ({
        ...prev,
        isConnected: false
      }));
    });

    socketRef.current.on('error', (error: any) => {
      setState(prev => ({
        ...prev,
        lastError: error,
        isConnecting: false
      }));
    });

    socketRef.current.on('message', (data: any) => {
      setState(prev => ({
        ...prev,
        lastMessage: data
      }));
    });
  }, [url, reconnectionAttempts, reconnectionDelay]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false
      }));
    }
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket is not connected. Cannot emit event:', event);
    }
  }, []);

  const on = useCallback((event: string, handler: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
    
    // Return cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, handler);
      }
    };
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    emit,
    on,
    socket: socketRef.current
  };
}