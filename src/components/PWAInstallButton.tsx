import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, Apple, Sparkles } from 'lucide-react';

interface PWAInstallButtonProps {
  onOpenApkModal?: () => void;
  isLightMode?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenApkModal,
  isLightMode = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, show a clean indicator or APK options
  if (isInstalled) {
    return (
      <button
        onClick={onOpenApkModal}
        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap border shadow-xs ${
          isLightMode
            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            : 'glass-panel text-emerald-400 hover:text-white border-emerald-500/30'
        }`}
        title="App Installed / View Android APK details"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
        <span>Android APK / PWA</span>
      </button>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 whitespace-nowrap border border-emerald-400/40"
        title="Install as Progressive Web App (Offline Standalone)"
      >
        <Download className="w-3.5 h-3.5 animate-bounce" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap border shadow-xs ${
            isLightMode
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              : 'glass-panel text-slate-300 hover:text-white border-slate-700'
          }`}
          title="Install on iPhone / iPad"
        >
          <Apple className="w-3.5 h-3.5" />
          <span>Install (iOS)</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div
              className={`w-full max-w-sm rounded-2xl p-6 border shadow-2xl space-y-4 ${
                isLightMode
                  ? 'bg-white text-slate-900 border-slate-300'
                  : 'glass-panel-elevated text-white border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Apple className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/20 border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0">1</span>
                  <span>Tap the <strong>Share</strong> button (box with upward arrow) in Safari.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/20 border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0">2</span>
                  <span>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/20 border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0">3</span>
                  <span>Tap <strong>Add</strong> in the top right. The app will launch standalone offline!</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback button to open APK build & download modal
  return (
    <button
      onClick={onOpenApkModal}
      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap border shadow-xs ${
        isLightMode
          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
          : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40'
      }`}
      title="Install as Android APK or Progressive Web App"
    >
      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
      <span>APK &amp; PWA</span>
    </button>
  );
};
