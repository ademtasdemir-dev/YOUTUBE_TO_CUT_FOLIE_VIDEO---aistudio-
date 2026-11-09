import React from 'react';
import { Film, Sparkles, Clock, Layers, Wrench, Presentation, ShieldCheck, Youtube, Mic } from 'lucide-react';

export type AppTab = 'scenes' | 'youtube' | 'video-gen' | 'cartesia' | 'teleprompter' | 'encapsulation' | 'troubleshooting' | 'slides';

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
  const tabs = [
    { id: 'scenes' as AppTab, label: 'Szenen & Regiebuch', icon: Film, badge: '8 Szenen' },
    { id: 'youtube' as AppTab, label: 'YouTube Zerleger', icon: Youtube, badge: 'Auto-Segmente', highlightRed: true },
    { id: 'video-gen' as AppTab, label: 'Gemini Omni KI-Video', icon: Sparkles, badge: 'Omni Flash 1.1', highlight: true },
    { id: 'cartesia' as AppTab, label: 'Cartesia TTS Studio', icon: Mic, badge: 'Sonic Prompts', highlightAmber: true },
    { id: 'teleprompter' as AppTab, label: 'Live Teleprompter', icon: Clock, badge: '12:00 Min' },
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
                12:00 Min Produktionskonzept &bull; 1280&times;720p 16:9 &bull; Patrick, Bastian, Issa, Thomas, Adem
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-slate-400">Target:</span>
              <span className="font-semibold text-white">720p / 16:9 / 30fps</span>
            </div>
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
                    ? (tab as any).highlightRed
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
                    ? (tab as any).highlightRed
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
                        ? (tab as any).highlightRed
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
    </header>
  );
};
