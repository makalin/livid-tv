import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';

export const useReconnection = () => {
  const { isConnected, setConnected, roomId } = useStore();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!roomId) return;

    const handleOnline = () => {
      console.log('Connection restored');
      setConnected(true);
      reconnectAttemptsRef.current = 0;
    };

    const handleOffline = () => {
      console.log('Connection lost');
      setConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connection check
    const checkInterval = setInterval(() => {
      if (!isConnected && reconnectAttemptsRef.current < maxReconnectAttempts) {
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
  }, [isConnected, roomId, setConnected]);
};

