import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  Monitor,
  CheckCircle,
  X,
  ExternalLink,
  Laptop,
  Smartphone,
  Shield,
  Copy,
  Check,
  QrCode,
  Share2,
  Compass
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  isInstalled: boolean;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  isInstalled
}) => {
  const { appInstallTab, setAppInstallTab } = useApp();
  const [activeTab, setActiveTab] = useState<'pc' | 'mobile'>('pc');
  const [installing, setInstalling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync tab with AppContext
  useEffect(() => {
    if (appInstallTab) {
      setActiveTab(appInstallTab);
    }
  }, [appInstallTab]);

  useEffect(() => {
    if (isInstalled) {
      setSuccess(true);
    }
  }, [isInstalled]);

  // Generate real QR code for the application URL
  useEffect(() => {
    if (isOpen && activeTab === 'mobile' && qrCanvasRef.current) {
      const appUrl = window.location.href || window.location.origin;
      QRCode.toCanvas(
        qrCanvasRef.current,
        appUrl,
        {
          width: 180,
          margin: 1.5,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        },
        (error) => {
          if (error) console.warn('QR code generation failed:', error);
        }
      );
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const appUrl = window.location.href || window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setSuccess(true);
        }
      } catch (err) {
        console.warn('Install prompt failed:', err);
      } finally {
        setInstalling(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 to-cyan-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              {activeTab === 'mobile' ? <Smartphone className="w-6 h-6" /> : <Laptop className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-base">
                {activeTab === 'mobile' ? 'Install JalRakshak Mobile App' : 'Install JalRakshak PC Workstation'}
              </h3>
              <p className="text-xs text-slate-300">
                Enterprise PWA with offline caching & live alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Switcher Tabs: PC vs Mobile */}
        <div className="grid grid-cols-2 p-2 bg-slate-100 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('pc');
              setAppInstallTab('pc');
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'pc'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Laptop className="w-4 h-4 text-cyan-600" />
            <span>PC Workstation App</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('mobile');
              setAppInstallTab('mobile');
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'mobile'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Smartphone className="w-4 h-4 text-cyan-600" />
            <span>Mobile App (Android / iOS)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {success || isInstalled ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg">App Installed Successfully!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                JalRakshak AI is now configured as a standalone application on your device with sub-second launch times and offline caching.
              </p>
              <button
                onClick={onClose}
                className="mt-3 px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          ) : activeTab === 'mobile' ? (
            /* ================= MOBILE APP INSTALLATION TAB ================= */
            <div className="space-y-4">
              
              {/* QR Code Scan Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200 shrink-0">
                  <canvas ref={qrCanvasRef} className="rounded-lg" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                    <QrCode className="w-3.5 h-3.5 text-cyan-600" />
                    Scan with Phone Camera
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Open &amp; Install on Android / iPhone
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Point your smartphone camera at this QR code to open JalRakshak AI instantly on your phone.
                  </p>
                  
                  {/* Copy Link Button */}
                  <div className="pt-1">
                    <button
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Mobile App Link'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct Install Button if open on Mobile Device */}
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  disabled={installing}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  {installing ? 'Installing Mobile App...' : 'Tap to Install Mobile App Now'}
                </button>
              )}

              {/* Step-by-Step Instructions: Android & iOS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* Android Steps */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">
                      A
                    </span>
                    <span>Android (Chrome / Edge)</span>
                  </div>
                  <ol className="text-[11px] text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Open link in <strong>Chrome</strong> on phone.</li>
                    <li>Tap the <strong>Three Dots (⋮)</strong> at top-right.</li>
                    <li>Tap <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.</li>
                    <li>The app will install directly into your Android app drawer.</li>
                  </ol>
                </div>

                {/* iPhone / iOS Steps */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                      iOS
                    </span>
                    <span>Apple iPhone (Safari)</span>
                  </div>
                  <ol className="text-[11px] text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Open link in <strong>Safari</strong> on iPhone.</li>
                    <li>Tap the <strong>Share icon (⎋)</strong> at screen bottom.</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen" (+)</strong>.</li>
                    <li>Tap <strong>"Add"</strong> in top-right for standalone view.</li>
                  </ol>
                </div>

              </div>

            </div>
          ) : (
            /* ================= PC WORKSTATION TAB ================= */
            <div className="space-y-4">
              
              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <Monitor className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Dedicated Window</span>
                    <span className="text-slate-500">Full-screen workstation with zero browser tabs</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Offline Cache</span>
                    <span className="text-slate-500">Telemetry schemas cached in service worker</span>
                  </div>
                </div>
              </div>

              {/* Direct PC Install Button if supported */}
              {deferredPrompt ? (
                <button
                  onClick={handleInstallClick}
                  disabled={installing}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  {installing ? 'Preparing Installation...' : 'Install on this PC Now'}
                </button>
              ) : (
                /* Manual Desktop Install Steps for Chrome / Edge / Brave */
                <div className="bg-cyan-50/70 border border-cyan-100 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-cyan-950">
                    <span>How to Install on Chrome, Edge & Brave on PC:</span>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-700" />
                  </div>
                  <ol className="text-xs text-slate-700 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Look at your browser's <strong>address bar (top right)</strong>.</li>
                    <li>Click the <strong>Install icon <span className="inline-block px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono">⊕</span> or <span className="inline-block px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono">💻</span></strong>.</li>
                    <li>Or click the <strong>Three Dots Menu (⋮)</strong> &gt; select <strong>"Install JalRakshak AI"</strong>.</li>
                    <li>Click <strong>Install</strong> to add it to your Windows/macOS desktop &amp; taskbar.</li>
                  </ol>
                </div>
              )}

              <div className="text-[11px] text-slate-500">
                Supports Windows 10/11, macOS, and Linux workstations.
              </div>

            </div>
          )}

          {/* Footer Dismiss Button */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500">JalRakshak AI Enterprise PWA</span>
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 font-medium px-3 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              Dismiss
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
