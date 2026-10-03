import React, { useState } from 'react';
import {
  Smartphone,
  Github,
  Download,
  CheckCircle2,
  X,
  Copy,
  Check,
  Terminal,
  WifiOff,
  Layers,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ApkBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLightMode?: boolean;
}

export const ApkBuildModal: React.FC<ApkBuildModalProps> = ({
  isOpen,
  onClose,
  isLightMode = false,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCmd(id);
      setTimeout(() => setCopiedCmd(null), 2000);
    });
  };

  const workflowTriggerText = `git add .
git commit -m "Build Android APK with custom icon"
git push origin main`;

  const localBuildCmd = `npm run build
npx cap sync android
cd android && ./gradlew assembleDebug`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className={`relative w-full max-w-2xl rounded-2xl p-5 sm:p-6 border shadow-2xl my-6 flex flex-col max-h-[92vh] overflow-y-auto transition-colors ${
          isLightMode
            ? 'bg-white text-slate-900 border-slate-300'
            : 'glass-panel-elevated text-white border-slate-700/80'
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/pwa-192x192.png"
              alt="Smart Parking App Icon"
              className="w-12 h-12 rounded-2xl shadow-lg border border-amber-400/40 object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  Offline PWA &amp; Native APK Build
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  OFFLINE 100%
                </span>
              </div>
              <p
                className={`text-xs font-mono mt-0.5 ${
                  isLightMode ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                શ્રી સરકારી માધ્યમિક શાળા લાખાપર · Android Capacitor &amp; GitHub Actions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 pt-4 text-xs">
          {/* Section 1: Immediate PWA Install Option */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isLightMode
                ? 'bg-emerald-50 border-emerald-200 text-slate-800'
                : 'bg-emerald-950/25 border-emerald-500/30 text-emerald-100'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Option 1: Instant Install (PWA Offline)</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                Install directly on your Android phone or PC from browser. Works completely offline
                without internet and launches full-screen with the custom app icon!
              </p>
            </div>
            {isInstallable && (
              <button
                onClick={install}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 justify-center"
              >
                <Download className="w-4 h-4" />
                <span>Install Now</span>
              </button>
            )}
            {isInstalled && (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold border border-emerald-500/40 shrink-0 text-center">
                ✔ Already Installed
              </span>
            )}
          </div>

          {/* Section 2: GitHub Actions Automated APK Build */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-cyan-600 dark:text-cyan-400">
                <Github className="w-4 h-4" />
                <span>Option 2: Build Native Android APK with GitHub Actions</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                AUTOMATED CI/CD
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              We have configured <code>.github/workflows/build-apk.yml</code>. Whenever you push to
              GitHub, it automatically compiles the native Android APK with your custom school icon
              and makes it available for download!
            </p>

            {/* Steps */}
            <div className="space-y-2 font-sans">
              <div className="flex items-start gap-2 text-[11px]">
                <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0 text-[10px]">
                  1
                </span>
                <span>
                  Push this repository to GitHub using terminal or Git client:
                </span>
              </div>
              <div className="relative">
                <pre className="p-2.5 rounded-lg bg-black/60 text-slate-300 font-mono text-[10px] overflow-x-auto border border-white/10">
                  {workflowTriggerText}
                </pre>
                <button
                  onClick={() => copyText(workflowTriggerText, 'git')}
                  className="absolute top-2 right-2 p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300"
                  title="Copy git commands"
                >
                  {copiedCmd === 'git' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              <div className="flex items-start gap-2 text-[11px] pt-1">
                <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0 text-[10px]">
                  2
                </span>
                <span>
                  On GitHub, open the <strong>Actions</strong> tab and click on{' '}
                  <strong>&quot;Build Android APK (Smart Parking)&quot;</strong>.
                </span>
              </div>

              <div className="flex items-start gap-2 text-[11px] pt-1">
                <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0 text-[10px]">
                  3
                </span>
                <span>
                  Once completed (~2 minutes), download the generated{' '}
                  <strong className="text-emerald-400">SmartParking-Lakhapar-APK.zip</strong> from
                  the <strong>Artifacts</strong> section at the bottom.
                </span>
              </div>

              <div className="flex items-start gap-2 text-[11px] pt-1">
                <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0 text-[10px]">
                  4
                </span>
                <span>
                  Unzip and transfer the <code>SmartParking-Lakhapar-debug.apk</code> to your
                  Android smartphone to install and run 100% offline!
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Local Developer Build Command */}
          <div
            className={`p-3.5 rounded-xl border space-y-2 ${
              isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[11px] flex items-center gap-1.5 text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>Build APK Locally (If Android Studio / SDK installed):</span>
              </span>
              <button
                onClick={() => copyText(localBuildCmd, 'local')}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 font-mono text-[10px] text-slate-300 flex items-center gap-1"
              >
                {copiedCmd === 'local' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy Command</span>
              </button>
            </div>
            <pre className="p-2 rounded-lg bg-black/60 text-amber-300 font-mono text-[10px] overflow-x-auto border border-white/5">
              {localBuildCmd}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Offline Compatible · No server required</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
