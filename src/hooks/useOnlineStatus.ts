import { useState, useEffect, useCallback } from 'react';

export interface CacheStats {
  cachedApis: number;
  cachedReports: number;
  cachedTelemetry?: number;
  cachedStaticAssets: number;
  version: string;
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());

  const checkCacheStats = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data) {
          setCacheStats(event.data);
        }
      };
      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_OFFLINE_STATS' },
        [messageChannel.port2]
      );
    }
  }, []);

  const syncCache = useCallback(async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      setIsSyncing(true);
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = () => {
        setIsSyncing(false);
        setLastSyncTime(new Date());
        checkCacheStats();
      };
      navigator.serviceWorker.controller.postMessage(
        { type: 'SYNC_TELEMETRY_CACHE' },
        [messageChannel.port2]
      );
    }
  }, [checkCacheStats]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncCache();
    };

    const handleOffline = () => {
      setIsOnline(false);
      checkCacheStats();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkCacheStats();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkCacheStats, syncCache]);

  return {
    isOnline,
    cacheStats,
    isSyncing,
    lastSyncTime,
    syncCache,
    checkCacheStats
  };
}
