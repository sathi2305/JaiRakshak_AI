// JalRakshak AI — Advanced Service Worker for Offline Water Dashboards & Reports
// Predict Water Loss. Prevent Waste. Protect Tomorrow.
// Features Local Historical Sensor Telemetry Store for Offline Trend Charts

const CACHE_VERSION = 'v3';
const STATIC_CACHE_NAME = `jalrakshak-static-${CACHE_VERSION}`;
const API_CACHE_NAME = `jalrakshak-api-${CACHE_VERSION}`;
const REPORTS_CACHE_NAME = `jalrakshak-reports-${CACHE_VERSION}`;
const TELEMETRY_CACHE_NAME = `jalrakshak-telemetry-${CACHE_VERSION}`;

// Core Shell Assets to pre-cache immediately on installation
const STATIC_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-icon.svg'
];

// Critical water dashboard and reporting endpoints to pre-warm
const DASHBOARD_API_ENDPOINTS = [
  '/api/dashboard/summary',
  '/api/campuses',
  '/api/buildings',
  '/api/sensors',
  '/api/readings/latest',
  '/api/readings/history?hours=24',
  '/api/readings/history?hours=12',
  '/api/readings/history?hours=48',
  '/api/readings/history',
  '/api/anomalies',
  '/api/leakage-risk',
  '/api/forecast?horizon=24h',
  '/api/recommendations',
  '/api/alerts',
  '/api/water-quality',
  '/api/maintenance',
  '/api/sustainability',
  '/api/audit',
  '/api/config/leak-thresholds',
  '/api/reports/latest?type=weekly',
  '/api/reports/latest?type=daily',
  '/api/reports/latest?type=monthly',
  '/api/reports?type=weekly'
];

// High-fidelity synthetic historical sensor telemetry generator for offline initialization
function generateSyntheticHistoricalTelemetry(hours = 24) {
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

    let actualLiters = baselineLiters + Math.round(Math.random() * 30 - 15);
    let leakRisk = 12;
    let pressure = 3.8;

    // Preserve the 01:00-04:00 night leak anomaly pattern for offline inspection
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

// Default offline fallback report when no prior report is in cache
const DEFAULT_OFFLINE_REPORT = {
  reportId: 'RPT-OFFLINE-SNAPSHOT',
  generatedAt: new Date().toISOString(),
  type: 'weekly',
  isOfflineCached: true,
  executiveSummary: `Executive Summary (OFFLINE FIELD SNAPSHOT — JalRakshak AI)\n\n` +
    `• Network Connectivity: Operating in Offline Cached Mode due to intermittent network connectivity.\n` +
    `• Telemetry Baseline: Viewing last synchronized campus water telemetry and compliance records.\n` +
    `• Total Saved to Date: 1,240,000 Liters (77.5% of annual conservation target achieved).\n` +
    `• High-Priority Alert: Block A Floor 2 (Zone B) CPVC riser P-104 inspection remains pending.\n` +
    `• All local data queries, dashboard views, and export features are fully operational offline.`,
  metrics: {
    totalConsumptionLiters: 34850,
    averageDailyConsumption: 32750,
    anomaliesDetectedCount: 3,
    highRiskZonesCount: 1,
    estimatedPotentialSavingsLitersMonth: 42000,
    complianceScorePercent: 91
  },
  anomalies: [
    { id: 'an-1', type: 'NIGHT FLOW', location: 'Block A Floor 2 (Zone B)', severity: 'HIGH', status: 'IN_PROGRESS' },
    { id: 'an-2', type: 'PRESSURE DROP', location: 'Block A Riser P-104', severity: 'HIGH', status: 'NEW' },
    { id: 'an-3', type: 'UNUSUAL SPIKE', location: 'Block D Dining Hall', severity: 'MEDIUM', status: 'ACKNOWLEDGED' }
  ],
  recommendations: [
    { id: 'rc-1', title: 'Acoustic Sounding on CPVC Pipeline P-104', description: 'Pinpoint underground or interstitial riser joint seal fissure.' },
    { id: 'rc-2', title: 'Automated Smart Valve Throttling', description: 'Throttle PRV-201 by 15% during off-peak hours (01:00-05:00).' },
    { id: 'rc-3', title: 'Rooftop Rainwater Harvesting Storage Balancing', description: 'Equalize Block B secondary cistern overflow buffer to maintain 85% reserve.' }
  ]
};

// Helper: Network fetch with timeout to prevent hanging requests on intermittent connections
function fetchWithTimeout(request, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error(`Network request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    fetch(request, { signal: controller.signal })
      .then((response) => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
  });
}

// 1. Service Worker Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(async (cache) => {
      console.log('[JalRakshak SW] Pre-caching static app shell assets...');
      try {
        await cache.addAll(STATIC_SHELL_ASSETS);
      } catch (err) {
        console.warn('[JalRakshak SW] Static pre-caching partial skip:', err);
      }
    })
  );
  self.skipWaiting();
});

// 2. Service Worker Activation & Pre-warming Cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up legacy cache stores
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (
              key !== STATIC_CACHE_NAME &&
              key !== API_CACHE_NAME &&
              key !== REPORTS_CACHE_NAME &&
              key !== TELEMETRY_CACHE_NAME
            ) {
              console.log('[JalRakshak SW] Removing outdated cache:', key);
              return caches.delete(key);
            }
          })
        );
      }),
      // Immediately take control of all active clients
      self.clients.claim(),
      // Pre-warm critical dashboard, telemetry & report APIs into cache
      prewarmTelemetryAndReports()
    ])
  );
});

// Pre-warm dashboard telemetry and report APIs
async function prewarmTelemetryAndReports() {
  try {
    const apiCache = await caches.open(API_CACHE_NAME);
    const reportsCache = await caches.open(REPORTS_CACHE_NAME);
    const telemetryCache = await caches.open(TELEMETRY_CACHE_NAME);

    // Warm default fallback report
    const defaultReportResponse = new Response(JSON.stringify(DEFAULT_OFFLINE_REPORT), {
      headers: {
        'Content-Type': 'application/json',
        'X-JalRakshak-Offline': 'true'
      }
    });
    await reportsCache.put('/api/reports/latest', defaultReportResponse.clone());
    await reportsCache.put('/api/reports/latest?type=weekly', defaultReportResponse.clone());
    await reportsCache.put('/api/reports?type=weekly', defaultReportResponse.clone());

    // Pre-seed 24h & 12h synthetic historical telemetry so trend charts display immediately even offline
    const seed24h = generateSyntheticHistoricalTelemetry(24);
    const seed24hResponse = new Response(JSON.stringify(seed24h), {
      headers: {
        'Content-Type': 'application/json',
        'X-JalRakshak-Offline': 'true',
        'X-JalRakshak-Telemetry-Source': 'prewarm-cache'
      }
    });
    await telemetryCache.put('/api/readings/history?hours=24', seed24hResponse.clone());
    await telemetryCache.put('/api/readings/history', seed24hResponse.clone());
    await telemetryCache.put('/api/readings/history?hours=12', new Response(JSON.stringify(seed24h.slice(-12)), {
      headers: { 'Content-Type': 'application/json', 'X-JalRakshak-Offline': 'true' }
    }));
    await telemetryCache.put('/api/readings/history?hours=48', new Response(JSON.stringify(generateSyntheticHistoricalTelemetry(48)), {
      headers: { 'Content-Type': 'application/json', 'X-JalRakshak-Offline': 'true' }
    }));

    // Fetch and cache live dashboard endpoints
    for (const endpoint of DASHBOARD_API_ENDPOINTS) {
      try {
        const res = await fetch(endpoint, { cache: 'no-cache' });
        if (res.ok) {
          if (endpoint.includes('/api/reports')) {
            await reportsCache.put(endpoint, res.clone());
          } else if (endpoint.includes('/api/readings/history')) {
            await telemetryCache.put(endpoint, res.clone());
            if (endpoint.includes('hours=24')) {
              await telemetryCache.put('/api/readings/history', res.clone());
            }
          } else {
            await apiCache.put(endpoint, res.clone());
          }
        }
      } catch (e) {
        // Silently continue if offline during activation
      }
    }
    console.log('[JalRakshak SW] Telemetry and Report caches successfully initialized.');
  } catch (err) {
    console.warn('[JalRakshak SW] Pre-warming deferred:', err);
  }
}

// 3. Fetch Event Interceptor
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // A. Bypass Live SSE Streams (cannot be cached)
  if (url.pathname.includes('/readings/stream') || event.request.headers.get('accept')?.includes('text/event-stream')) {
    return;
  }

  // B. Handle Historical Sensor Telemetry for Charts with Local Telemetry Store Strategy
  if (url.pathname.includes('/api/readings/history')) {
    event.respondWith(handleHistoricalTelemetryRequest(event.request, url));
    return;
  }

  // C. Handle Report Generation (POST /api/reports/generate) with Offline Fallback
  if (url.pathname === '/api/reports/generate' && event.request.method === 'POST') {
    event.respondWith(handleReportGeneration(event.request));
    return;
  }

  // D. Handle Other Non-GET requests (bypass directly)
  if (event.request.method !== 'GET') {
    return;
  }

  // E. Water Telemetry & Dashboards API Strategy: Network-First with Timeout & Cache Fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event.request, url));
    return;
  }

  // F. SPA Navigation Requests (request.mode === 'navigate')
  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(event.request));
    return;
  }

  // G. Static App Assets (JS, CSS, SVGs, Images, Fonts) Strategy: Stale-While-Revalidate
  event.respondWith(handleStaticAssetRequest(event.request));
});

// Dedicated Handler for Historical Sensor Telemetry (Stores data locally for trend charts)
async function handleHistoricalTelemetryRequest(request, url) {
  const telemetryCache = await caches.open(TELEMETRY_CACHE_NAME);
  const hours = parseInt(url.searchParams.get('hours') || '24', 10);

  try {
    // Fast network attempt (2500ms)
    const networkResponse = await fetchWithTimeout(request.clone(), 2500);
    if (networkResponse && networkResponse.ok) {
      // Store in local telemetry cache
      await telemetryCache.put(request, networkResponse.clone());
      if (hours === 24) {
        await telemetryCache.put('/api/readings/history?hours=24', networkResponse.clone());
        await telemetryCache.put('/api/readings/history', networkResponse.clone());
      }
      return networkResponse;
    }
  } catch (err) {
    console.warn('[JalRakshak SW] Network unavailable for historical telemetry, reading local cache:', err);
  }

  // Check exact match in local telemetry cache
  let cachedResponse = await telemetryCache.match(request);
  if (!cachedResponse) {
    cachedResponse = (await telemetryCache.match('/api/readings/history?hours=24')) ||
                     (await telemetryCache.match('/api/readings/history'));
  }

  if (cachedResponse) {
    const headers = new Headers(cachedResponse.headers);
    headers.set('X-JalRakshak-Offline', 'true');
    headers.set('X-JalRakshak-Telemetry-Source', 'local-telemetry-cache');
    const body = await cachedResponse.blob();
    return new Response(body, {
      status: 200,
      statusText: 'OK (Local Telemetry Cache)',
      headers
    });
  }

  // Fallback: Generate synthetic local historical telemetry and persist to cache
  const syntheticData = generateSyntheticHistoricalTelemetry(hours);
  const syntheticResponse = new Response(JSON.stringify(syntheticData), {
    headers: {
      'Content-Type': 'application/json',
      'X-JalRakshak-Offline': 'true',
      'X-JalRakshak-Telemetry-Source': 'synthetic-local-generator'
    }
  });

  await telemetryCache.put(request, syntheticResponse.clone());
  return syntheticResponse;
}

// Handler for Report Generation (Online: fetch & cache; Offline: return cached or synthesized report)
async function handleReportGeneration(request) {
  let requestedType = 'weekly';
  try {
    const clonedReq = request.clone();
    const body = await clonedReq.json();
    if (body?.type) requestedType = body.type;
  } catch (e) {
    // ignore parse error
  }

  try {
    const networkResponse = await fetchWithTimeout(request.clone(), 6000);
    if (networkResponse && networkResponse.ok) {
      const reportsCache = await caches.open(REPORTS_CACHE_NAME);
      const clone = networkResponse.clone();
      const reportData = await clone.json();
      const syntheticResponse = new Response(JSON.stringify(reportData), {
        headers: {
          'Content-Type': 'application/json',
          'X-JalRakshak-Cached-At': new Date().toISOString()
        }
      });
      await reportsCache.put(`/api/reports/latest?type=${requestedType}`, syntheticResponse.clone());
      await reportsCache.put(`/api/reports/latest`, syntheticResponse.clone());
      await reportsCache.put(`/api/reports?type=${requestedType}`, syntheticResponse.clone());

      return networkResponse;
    }
  } catch (netErr) {
    console.warn('[JalRakshak SW] Network unavailable for report generation, serving cached report:', netErr);
  }

  // Fallback to cached report
  const reportsCache = await caches.open(REPORTS_CACHE_NAME);
  const cachedMatch = (await reportsCache.match(`/api/reports/latest?type=${requestedType}`)) ||
                      (await reportsCache.match('/api/reports/latest')) ||
                      (await reportsCache.match('/api/reports?type=weekly'));

  if (cachedMatch) {
    const data = await cachedMatch.json();
    return new Response(JSON.stringify({
      ...data,
      isOfflineCached: true,
      executiveSummary: `[OFFLINE CACHED REPORT]\n${data.executiveSummary || ''}\n\n• Note: Generated from local offline cache due to intermittent network connectivity.`
    }), {
      headers: {
        'Content-Type': 'application/json',
        'X-JalRakshak-Offline': 'true'
      }
    });
  }

  // Ultimate fallback if no cached report exists
  return new Response(JSON.stringify({
    ...DEFAULT_OFFLINE_REPORT,
    type: requestedType,
    generatedAt: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'X-JalRakshak-Offline': 'true'
    }
  });
}

// Handler for Water Telemetry and Dashboard API Requests
async function handleApiRequest(request, url) {
  const isReport = url.pathname.includes('/api/reports');
  const cacheName = isReport ? REPORTS_CACHE_NAME : API_CACHE_NAME;
  const targetCache = await caches.open(cacheName);

  try {
    const networkResponse = await fetchWithTimeout(request.clone(), 3000);
    if (networkResponse && networkResponse.ok) {
      targetCache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (err) {
    // Intermittent or offline - fall through to cache
  }

  // Search in target cache, then fallback to API cache
  let cachedResponse = await targetCache.match(request);
  if (!cachedResponse && isReport) {
    cachedResponse = await targetCache.match('/api/reports/latest');
  }

  if (cachedResponse) {
    const headers = new Headers(cachedResponse.headers);
    headers.set('X-JalRakshak-Offline', 'true');
    const body = await cachedResponse.blob();
    return new Response(body, {
      status: 200,
      statusText: 'OK (Offline Cache)',
      headers
    });
  }

  // If endpoint is not yet in cache, provide safe fallback JSON response
  return createOfflineFallbackApiResponse(url.pathname);
}

// Safe fallback responses for un-cached API endpoints when completely offline
function createOfflineFallbackApiResponse(pathname) {
  let fallbackData = {};

  if (pathname.includes('/readings/history') || pathname.includes('/readings')) {
    fallbackData = generateSyntheticHistoricalTelemetry(24);
  } else if (pathname.includes('/summary')) {
    fallbackData = {
      kpis: {
        dailyConsumptionLiters: 34850,
        flowRateLpm: 48.2,
        pressureBar: 3.2,
        leakageRiskScore: 38,
        activeAlertsCount: 3,
        waterEfficiencyScore: 84,
        totalSavedLitersMonth: 124000
      },
      currentSimulationMode: 'NORMAL',
      offline: true
    };
  } else if (pathname.includes('/buildings')) {
    fallbackData = [
      { id: 'bld-1', name: 'Engineering Block A', code: 'BLK-A', totalZones: 6, flowRateLpm: 48.2, pressureBar: 3.2, todayConsumptionLiters: 14200, riskLevel: 'HIGH', status: 'ANOMALY_DETECTED' },
      { id: 'bld-2', name: 'Science Complex B', code: 'BLK-B', totalZones: 4, flowRateLpm: 22.4, pressureBar: 3.5, todayConsumptionLiters: 8900, riskLevel: 'LOW', status: 'NORMAL' },
      { id: 'bld-3', name: 'Central Administration', code: 'BLK-C', totalZones: 3, flowRateLpm: 12.1, pressureBar: 3.6, todayConsumptionLiters: 4500, riskLevel: 'LOW', status: 'NORMAL' },
      { id: 'bld-4', name: 'Dining Hall & Hostel D', code: 'BLK-D', totalZones: 5, flowRateLpm: 38.5, pressureBar: 3.1, todayConsumptionLiters: 11200, riskLevel: 'MEDIUM', status: 'NORMAL' }
    ];
  } else if (pathname.includes('/alerts')) {
    fallbackData = [
      { id: 'alt-1', title: 'Suspected Pipe Joint Leakage', buildingName: 'Engineering Block A', severity: 'HIGH', status: 'NEW', metric: 'Pressure & Night Flow', timestamp: 'Offline Cached' },
      { id: 'alt-2', title: 'Abnormal Night Flow Observed', buildingName: 'Science Complex B', severity: 'MEDIUM', status: 'ACKNOWLEDGED', metric: 'Flow Rate', timestamp: 'Offline Cached' }
    ];
  } else if (pathname.includes('/leakage-risk')) {
    fallbackData = {
      leakageRiskPercent: 78,
      riskLevel: 'HIGH',
      possibleCause: 'Continuous night flow coupled with 29% pressure drop in Lab zone distribution.',
      estimatedWaterLossLph: 1240,
      suspectedLocation: 'Block A — Floor 2 Zone B Pipeline P-104-LAB',
      disclaimer: 'Offline Predictive Snapshot. Physical verification recommended upon connection restore.',
      featureWeights: [
        { name: 'Night Flow Rate vs Baseline', weight: 0.38, status: 'Triggered (+240%)' },
        { name: 'Dynamic Pressure Drop', weight: 0.28, status: 'Triggered (-29%)' }
      ]
    };
  } else if (pathname.includes('/reports')) {
    fallbackData = DEFAULT_OFFLINE_REPORT;
  } else {
    fallbackData = { offline: true, message: 'Offline mode active. Telemetry will sync when connection resumes.' };
  }

  return new Response(JSON.stringify(fallbackData), {
    headers: {
      'Content-Type': 'application/json',
      'X-JalRakshak-Offline': 'true'
    }
  });
}

// Handler for SPA Page Navigation
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetchWithTimeout(request, 2500);
    return networkResponse;
  } catch (err) {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedShell = (await cache.match('/index.html')) || (await cache.match('/'));
    if (cachedShell) {
      return cachedShell;
    }
    return new Response(
      '<!DOCTYPE html><html><head><title>JalRakshak AI (Offline)</title></head><body><h2>JalRakshak AI — Offline Mode</h2><p>Please reconnect to the network.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Handler for Static Assets (Stale-While-Revalidate)
async function handleStaticAssetRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// 4. Message Event Listener for manual client sync or status checks
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data?.type === 'SAVE_TELEMETRY_RECORD') {
    const { hours = 24, readings } = event.data.payload || {};
    if (Array.isArray(readings) && readings.length > 0) {
      caches.open(TELEMETRY_CACHE_NAME).then((cache) => {
        const resp = new Response(JSON.stringify(readings), {
          headers: {
            'Content-Type': 'application/json',
            'X-JalRakshak-Offline': 'true',
            'X-JalRakshak-Telemetry-Source': 'client-synced-store'
          }
        });
        cache.put(`/api/readings/history?hours=${hours}`, resp.clone());
        cache.put(`/api/readings/history`, resp.clone());
      });
    }
  } else if (event.data?.type === 'SYNC_TELEMETRY_CACHE') {
    prewarmTelemetryAndReports().then(() => {
      event.ports[0]?.postMessage({ status: 'CACHE_SYNCHRONIZED', timestamp: Date.now() });
    });
  } else if (event.data?.type === 'GET_OFFLINE_STATS') {
    Promise.all([
      caches.open(API_CACHE_NAME).then(c => c.keys()),
      caches.open(REPORTS_CACHE_NAME).then(c => c.keys()),
      caches.open(TELEMETRY_CACHE_NAME).then(c => c.keys()),
      caches.open(STATIC_CACHE_NAME).then(c => c.keys())
    ]).then(([apiKeys, reportKeys, telemetryKeys, staticKeys]) => {
      event.ports[0]?.postMessage({
        cachedApis: apiKeys.length,
        cachedReports: reportKeys.length,
        cachedTelemetry: telemetryKeys.length,
        cachedStaticAssets: staticKeys.length,
        version: CACHE_VERSION
      });
    });
  }
});
