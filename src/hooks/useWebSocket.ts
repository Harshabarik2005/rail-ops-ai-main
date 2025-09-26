import { useEffect, useRef, useCallback } from 'react';
import { wsManager } from '@/lib/websocket';

export function useWebSocket(channel: string, onMessage: (data: any) => void) {
  const callbackRef = useRef(onMessage);
  
  // Update callback ref when onMessage changes
  useEffect(() => {
    callbackRef.current = onMessage;
  }, [onMessage]);

  // Stable callback that won't change on re-renders
  const stableCallback = useCallback((data: any) => {
    callbackRef.current(data);
  }, []);

  useEffect(() => {
    // Subscribe to the channel
    wsManager.subscribe(channel, stableCallback);

    // Cleanup subscription on unmount
    return () => {
      wsManager.unsubscribe(channel, stableCallback);
    };
  }, [channel, stableCallback]);

  // Return send function for convenience
  const send = useCallback((data: any) => {
    wsManager.send(data);
  }, []);

  return {
    send,
    isConnected: wsManager.isConnected(),
    connectionState: wsManager.getConnectionState()
  };
}

export function useRealTimeTrains(onUpdate: (trains: any[]) => void) {
  return useWebSocket('train_positions', onUpdate);
}

export function useRealTimeMetrics(onUpdate: (metrics: any) => void) {
  return useWebSocket('performance_metrics', onUpdate);
}

export function useRealTimeAlerts(onAlert: (alert: any) => void) {
  return useWebSocket('alerts', onAlert);
}

export function useOptimizationUpdates(onUpdate: (optimization: any) => void) {
  return useWebSocket('optimization_update', onUpdate);
}