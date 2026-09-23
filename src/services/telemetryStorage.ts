// JalRakshak AI — Client-side Local Storage & IndexedDB Service
// Persists historical and real-time sensor telemetry for seamless offline trend visualization

const DB_NAME = 'jalrakshak_telemetry_db';
const DB_VERSION = 1;
const STORE_NAME = 'historical_readings';
const LATEST_STORE = 'latest_telemetry';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(LATEST_STORE)) {
        db.createObjectStore(LATEST_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Generate fallback baseline readings if storage is pristine while offline
export function generateLocalFallbackHistoricalReadings(hours = 24): any[] {
  const readings = [];
  const now = new Date();
  
  for (let i = hours - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600000);
    const hourVal = d.getHours();
    const timeLabel = `${hourVal.toString().padStart(2, '0')}:00`;
    
    let baselineLiters = 250;
    if (hourVal >= 1 && hourVal <= 5) {
      baselineLiters = 130 + Math.round(Math.sin(hourVal) * 20);
    } else if (hourVal >= 8 && hourVal <= 12) {
      baselineLiters = 740 + Math.round(Math.sin(hourVal) * 90);
    } else if (hourVal >= 13 && hourVal <= 16) {
      baselineLiters = 580 + Math.round(Math.sin(hourVal) * 50);
    } else if (hourVal >= 17 && hourVal <= 21) {
      baselineLiters = 690 + Math.round(Math.sin(hourVal) * 70);
    } else {
      baselineLiters = 350;
    }

    // Include recent 4 hours leak anomaly profile
    let actualLiters = baselineLiters + Math.round(Math.random() * 30 - 15);
    let leakRisk = 12;
    let pressure = 3.8;

    if (i <= 4) {
      actualLiters += 390;
      leakRisk = 82;
      pressure = 2.7;
    }

    readings.push({
      hour: timeLabel,
      actualLiters,
      baselineLiters,
      flowRateLpm: Number(((actualLiters / 60) * 1.05).toFixed(1)),
      pressureBar: Number(pressure.toFixed(1)),
      leakRiskPercent: leakRisk,
      isOfflineCached: true,
      timestamp: d.toISOString()
    });
  }

  return readings;
}

export const telemetryStorage = {
  // Store historical readings in IndexedDB (with LocalStorage fallback)
  async storeHistoricalReadings(readings: any[], hours = 24): Promise<void> {
    if (!Array.isArray(readings) || readings.length === 0) return;

    try {
      const db = await openDatabase();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      store.put({
        key: `history_${hours}`,
        readings,
        savedAt: new Date().toISOString(),
        hours
      });
      
      // Also store generic 'history_latest'
      store.put({
        key: 'history_latest',
        readings,
        savedAt: new Date().toISOString(),
        hours
      });

      // Keep in localStorage as backup
      try {
        localStorage.setItem('jalrakshak_offline_history', JSON.stringify({
          readings,
          savedAt: new Date().toISOString()
        }));
      } catch (e) {
        // quota exceeded or private mode
      }
    } catch (err) {
      try {
        localStorage.setItem('jalrakshak_offline_history', JSON.stringify({
          readings,
          savedAt: new Date().toISOString()
        }));
      } catch (e) {
        console.warn('Failed to store telemetry to localStorage fallback:', e);
      }
    }
  },

  // Retrieve stored historical readings
  async getStoredHistoricalReadings(hours = 24): Promise<any[]> {
    try {
      const db = await openDatabase();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);

      const result: any = await new Promise((resolve, reject) => {
        const req = store.get(`history_${hours}`);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      if (result && Array.isArray(result.readings) && result.readings.length > 0) {
        return result.readings;
      }

      // Try 'history_latest'
      const latestResult: any = await new Promise((resolve) => {
        const req = store.get('history_latest');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });

      if (latestResult && Array.isArray(latestResult.readings) && latestResult.readings.length > 0) {
        return latestResult.readings;
      }
    } catch (err) {
      // IndexedDB lookup failed, fallback to localStorage
    }

    try {
      const localStr = localStorage.getItem('jalrakshak_offline_history');
      if (localStr) {
        const parsed = JSON.parse(localStr);
        if (Array.isArray(parsed.readings) && parsed.readings.length > 0) {
          return parsed.readings;
        }
      }
    } catch (e) {
      // ignore
    }

    // Pristine offline fallback
    return generateLocalFallbackHistoricalReadings(hours);
  },

  // Store latest single telemetry snapshot
  async storeLatestTelemetry(telemetry: any): Promise<void> {
    if (!telemetry) return;
    try {
      const db = await openDatabase();
      const tx = db.transaction(LATEST_STORE, 'readwrite');
      tx.objectStore(LATEST_STORE).put({
        key: 'current',
        telemetry,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('jalrakshak_offline_latest_telemetry', JSON.stringify(telemetry));
    } catch (e) {
      try {
        localStorage.setItem('jalrakshak_offline_latest_telemetry', JSON.stringify(telemetry));
      } catch (err) {
        // ignore
      }
    }
  },

  // Retrieve stored single telemetry snapshot
  async getStoredLatestTelemetry(): Promise<any | null> {
    try {
      const db = await openDatabase();
      const tx = db.transaction(LATEST_STORE, 'readonly');
      const res: any = await new Promise((resolve) => {
        const req = tx.objectStore(LATEST_STORE).get('current');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
      if (res && res.telemetry) return res.telemetry;
    } catch (e) {
      // ignore
    }

    try {
      const item = localStorage.getItem('jalrakshak_offline_latest_telemetry');
      if (item) return JSON.parse(item);
    } catch (e) {
      // ignore
    }

    return null;
  }
};
