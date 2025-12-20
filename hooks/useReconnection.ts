import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';

export const useReconnection = () => {
  const { roomId } = useStore();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const setConnectedRef = useRef<((connected: boolean) => void) | null>(null);

  // Update ref when store changes (only in browser)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setConnectedRef.current = useStore.getState().setConnected;
    }
  });

  useEffect(() => {
    if (!roomId) return;
    
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      console.log('Connection restored');
      if (setConnectedRef.current) {
        setConnectedRef.current(true);
      }
      reconnectAttemptsRef.current = 0;
    };

    const handleOffline = () => {
      console.log('Connection lost');
      if (setConnectedRef.current) {
        setConnectedRef.current(false);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connection check
    const checkInterval = setInterval(() => {
      const currentConnected = useStore.getState().isConnected;
      if (!currentConnected && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current += 1;
        console.log(`Reconnection attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
        
        // Trigger reconnection by reloading WebRTC
        if (navigator.onLine) {
          window.location.reload();
        }
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(checkInterval);
    };
  }, [roomId]); // Removed isConnected and setConnected from dependencies
};
