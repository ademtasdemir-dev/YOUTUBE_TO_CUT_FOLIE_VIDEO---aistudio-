import React, { useState } from 'react';
import { Film, Sparkles, Clock, Layers, Wrench, Presentation, ShieldCheck, Youtube, Mic, Laptop, Download, X, CheckCircle, FileText } from 'lucide-react';

export type AppTab = 'youtube' | 'frame-decomposer' | 'cartesia' | 'video-gen' | 'scenes' | 'encapsulation' | 'troubleshooting' | 'slides';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  generatedVideoCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  generatedVideoCount
}) => {
  const [showWindowsModal, setShowWindowsModal] = useState<boolean>(false);
  const tabs = [
    { id: 'youtube' as AppTab, label: 'YouTube Zerleger', icon: Youtube, badge: 'Auto-Segmente', highlightRed: true },
    { id: 'frame-decomposer' as AppTab, label: '1 FPS Spektakel-Folie', icon: Film, badge: '1 Sek = 1 Bild', highlightCyan: true },
    { id: 'cartesia' as AppTab, label: 'Cartesia Sonic Studio', icon: Mic, badge: 'Sonic 3.5 / 3.6', highlightAmber: true },
    { id: 'video-gen' as AppTab, label: 'Gemini Omni KI-Video', icon: Sparkles, badge: 'Omni Flash 1.1', highlight: true },
    { id: 'scenes' as AppTab, label: 'Szenen & Regiebuch', icon: Layers, badge: '8 Szenen' },
    { id: 'encapsulation' as AppTab, label: 'Kapselungs-Simulation', icon: Layers, badge: 'L7 → L1' },
    { id: 'troubleshooting' as AppTab, label: 'IHK Troubleshooting', icon: Wrench, badge: 'Matrix' },
    { id: 'slides' as AppTab, label: 'Folien & 720p Export', icon: Presentation, badge: '12 Folien' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-blue-400">
                <Layers className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  OSI-Modell 720p Studio
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  FISI Comcave
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  IHK-Prüfung
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Produktionskonzept &bull; 1280&times;720p 16:9 &bull; 1 FPS Spektakel-Folie &bull; Cartesia Sonic 3.5 / 3.6 Studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-slate-400">Target:</span>
              <span className="font-semibold text-white">720p / 16:9 / 30fps</span>
            </div>

            <button
              type="button"
              onClick={() => setShowWindowsModal(true)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              title="Windows .exe Anwendung & Installer öffnen"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Windows App (.exe)</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-950/40 text-[9px] font-mono font-bold">Installer</span>
            </button>

            {generatedVideoCount > 0 && (
              <div className="px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-700/50 flex items-center gap-1.5 text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-medium">{generatedVideoCount} Video{generatedVideoCount > 1 ? 's' : ''} bereit</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? (tab as any).highlightCyan
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/60 shadow-sm shadow-cyan-500/20'
                      : (tab as any).highlightRed
                      ? 'bg-red-500/20 text-red-300 border border-red-500/50 shadow-sm'
                      : (tab as any).highlightAmber
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                      : (tab as any).highlight
                      ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                      : 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${
                  isActive
                    ? (tab as any).highlightCyan
                      ? 'text-cyan-400'
                      : (tab as any).highlightRed
                      ? 'text-red-400'
                      : (tab as any).highlightAmber
                      ? 'text-amber-400'
                      : (tab as any).highlight
                      ? 'text-amber-400'
                      : 'text-blue-400'
                    : 'text-slate-500'
                }`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-mono font-semibold ${
                      isActive
                        ? (tab as any).highlightCyan
                          ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40'
                          : (tab as any).highlightRed
                          ? 'bg-red-500/30 text-red-200'
                          : (tab as any).highlightAmber
                          ? 'bg-amber-400/20 text-amber-200'
                          : (tab as any).highlight
                          ? 'bg-amber-400/20 text-amber-200'
                          : 'bg-blue-500/30 text-blue-200'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Windows App Installer Modal */}
      {showWindowsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-5">
            <button
              type="button"
              onClick={() => setShowWindowsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-blue-400">
                  <Laptop className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  OSI-Modell 720p Studio für Windows
                </h3>
                <p className="text-xs text-slate-400">
                  Ausführbare Desktop-Anwendung (.exe) & Installer für Windows 10 & 11 (64-Bit)
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>100% Standalone:</strong> Kein Node.js oder Webserver erforderlich. Alles ist direkt in der EXE gebündelt.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Vollständiger Funktionsumfang:</strong> YouTube-Zerleger, Cartesia TTS Voice Studio, Gemini Omni Video-Generator, Live Teleprompter, Kapselung & Troubleshooting.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Windows Desktop-Integration:</strong> Startet als native App im Edge/Chromium-App-Modus ohne Adressleiste.</span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="/downloads/OSI-720p-Studio-Setup.exe"
                  download="OSI-720p-Studio-Setup.exe"
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Setup .EXE herunterladen (74 MB)</span>
                </a>

                <a
                  href="/downloads/install-windows.bat"
                  download="install-windows.bat"
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>1-Klick Installer (Batch)</span>
                </a>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Schnellstart auf Windows:</div>
                <div>1. <strong>OSI-720p-Studio-Setup.exe</strong> herunterladen und doppelklicken.</div>
                <div>2. Das Studio startet sofort offline auf deinem PC und öffnet das Studiofenster.</div>
                <div className="text-slate-500 text-[10px] pt-1">Dateien liegen auch im Git-Repository unter <code>/releases/</code> und <code>/public/downloads/</code>.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
