import React, { useState } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff, Database, RefreshCw, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, cacheStats, isSyncing, lastSyncTime, syncCache } = useOnlineStatus();
  const [isExpanded, setIsExpanded] = useState(false);

  // If online and not expanded, we don't need to take up space, or we can show a small subtle indicator
  if (isOnline && !isExpanded) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm w-full transition-all duration-300">
      <div className={`rounded-xl border shadow-xl backdrop-blur-md overflow-hidden transition-colors ${
        isOnline
          ? 'bg-slate-900/90 border-slate-700 text-white'
          : 'bg-amber-950/95 border-amber-600/80 text-amber-100 shadow-amber-950/30'
      }`}>
        {/* Header Bar */}
        <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {isOnline ? (
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400">
                <WifiOff className="w-3.5 h-3.5" />
              </div>
            )}
            <div>
              <div className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                {isOnline ? (
                  <>
                    <span className="text-emerald-400">Online</span>
                    <span className="text-[10px] text-slate-400 font-normal">Offline Cache Ready</span>
                  </>
                ) : (
                  <>
                    <span className="text-amber-300">Offline Access Active</span>
                    <span className="text-[10px] bg-amber-500/30 text-amber-200 px-1.5 py-0.2 rounded font-mono">
                      Cached
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-amber-200/80 leading-tight">
                {isOnline
                  ? 'Water dashboards & audit reports cached for field work.'
                  : 'Intermittent connectivity detected. Viewing cached dashboards & reports.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors"
              title={isExpanded ? 'Collapse' : 'View Cache Details'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Telemetry & Cache Details */}
        {isExpanded && (
          <div className="px-3.5 pb-3 pt-1 border-t border-white/10 text-xs space-y-2 bg-black/20">
            <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
              <div className="bg-white/5 rounded-lg p-1.5">
                <div className="text-[10px] text-slate-400">Dashboards</div>
                <div className="text-sm font-bold text-cyan-400">
                  {cacheStats?.cachedApis ?? '15+'}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-1.5">
                <div className="text-[10px] text-slate-400">Reports</div>
                <div className="text-sm font-bold text-indigo-400">
                  {cacheStats?.cachedReports ?? '3'}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-1.5">
                <div className="text-[10px] text-slate-400">Cache Layer</div>
                <div className="text-sm font-bold text-emerald-400">
                  {cacheStats?.version ?? 'v2'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
              <span className="flex items-center gap-1 text-slate-400">
                <Database className="w-3 h-3 text-cyan-400" />
                Last Cache Sync: {lastSyncTime?.toLocaleTimeString() ?? 'Active'}
              </span>

              <button
                onClick={syncCache}
                disabled={isSyncing}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-[11px] transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Telemetry'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
