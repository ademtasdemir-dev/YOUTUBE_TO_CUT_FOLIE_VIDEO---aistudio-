/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Film, Play, Pause, SkipBack, SkipForward, RotateCcw, 
  Sparkles, Download, Copy, Check, Layers, Cpu, Radio, 
  Terminal, ShieldCheck, ArrowRight, Eye, Grid, Maximize2,
  Share2, Zap, FileJson, Mic, MonitorPlay
} from 'lucide-react';
import { PresentationScene, formatSecondsToTime } from '../utils/osiData';
import { decomposeScenesIntoFrames, VideoFrameSlice } from '../utils/frameDecomposer';

interface FrameDecomposerTabProps {
  scenes: PresentationScene[];
  onNavigateToVideoGen?: (prompt: string) => void;
  onNavigateToCartesia?: (text: string) => void;
}

export const FrameDecomposerTab: React.FC<FrameDecomposerTabProps> = ({
  scenes,
  onNavigateToVideoGen,
  onNavigateToCartesia
}) => {
  const frames = decomposeScenesIntoFrames(scenes);
  const totalFrames = frames.length;

  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'stage' | 'filmstrip' | 'split'>('stage');
  const [showTechnicalHud, setShowTechnicalHud] = useState<boolean>(true);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [loopCurrentSecond, setLoopCurrentSecond] = useState<boolean>(false);

  const activeFrame: VideoFrameSlice = frames[currentFrameIndex] || frames[0] || {
    frameIndex: 0,
    second: 0,
    timestamp: '00:00',
    sceneId: 'init',
    sceneNumber: 0,
    sceneTitle: 'Intro',
    speakerRole: 'Moderation',
    speakerColor: 'border-blue-500',
    activeLayer: 7,
    layerName: 'Schicht 7: Anwendungsschicht',
    pduType: 'Daten (HTTP Payload)',
    activeProtocols: ['HTTP', 'HTTPS'],
    transcriptSlice: 'Willkommen zur Video-Dekonstruktion.',
    visualSceneType: 'topology',
    visualCue: 'Netzwerk Übersicht',
    deltaDescription: 'Initiale Szene',
    geminiOmniPrompt: 'Video frame in 720p',
    cartesiaChunkText: 'Willkommen zur Video-Dekonstruktion.',
    accentColor: '#3B82F6',
    hardwareDevice: 'Client Workstation',
    packetHeader: 'GET / HTTP/1.1'
  };

  // Playback timer (1 frame per second)
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrameIndex((prev) => {
          if (loopCurrentSecond) return prev;
          if (prev >= totalFrames - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, totalFrames, loopCurrentSecond]);

  const handleNextFrame = () => {
    setCurrentFrameIndex((prev) => Math.min(totalFrames - 1, prev + 1));
  };

  const handlePrevFrame = () => {
    setCurrentFrameIndex((prev) => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(0);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadFrameJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeFrame, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `schnipsel_sekunde_${activeFrame.second}_${activeFrame.timestamp.replace(':', '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadAllFramesJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(frames, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `alle_${totalFrames}_schnipsel_1fps_dekomposition.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Spektakel Pitch */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1.5 shadow-sm">
                <Film className="w-3.5 h-3.5 text-cyan-400" />
                1 FPS Filmstreifen & 1:1 Rekonstruktions-Studio
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {totalFrames} Sekunden / Schnipsel aktiv
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Video in Bild-zu-Bild zerlegen • Jede Sekunde 1 Bild
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Exakte 1:1 Dekonstruktion des analysierten Videos in sekundengenaue Einzelbilder (1 FPS). Jedes Bild liefert die visualisierte PDU, den gesprochenen Transkriptsatz, technische Header und maßgeschneiderte Prompts für den 1:1 Nachbau mit Gemini Omni KI-Video.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadAllFramesJson}
              className="px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all shadow-md cursor-pointer"
              title="Alle Sekunden-Schnipsel als strukturiertes JSON-Bundle exportieren"
            >
              <FileJson className="w-4 h-4 text-cyan-400" />
              <span>Alle {totalFrames} Schnipsel exportieren</span>
            </button>

            <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
              <button
                type="button"
                onClick={() => setViewMode('stage')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === 'stage' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MonitorPlay className="w-3.5 h-3.5" />
                <span>Spektakel-Bühne</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('filmstrip')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === 'filmstrip' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Filmstreifen</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === 'split' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>1:1 Vergleich</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stage: Die Spektakel-Folie */}
      {(viewMode === 'stage' || viewMode === 'split') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden space-y-4 p-5">
          {/* Stage Header & Controller */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: activeFrame.accentColor }} />
                <span>Sekunde #{activeFrame.second}</span>
                <span className="font-mono text-cyan-400 font-black tracking-wider">({activeFrame.timestamp})</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                Frame {currentFrameIndex + 1} / {totalFrames}
              </span>
              <span className="text-slate-400 hidden sm:inline">
                {activeFrame.sceneTitle}
              </span>
            </div>

            {/* Playback Transport Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevFrame}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                title="1 Sekunde zurück (←)"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? 'Pause' : '1 FPS Play'}</span>
              </button>

              <button
                type="button"
                onClick={handleNextFrame}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                title="1 Sekunde vor (→)"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Zum Anfang zurück"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-750 mx-1" />

              <button
                type="button"
                onClick={() => setLoopCurrentSecond(!loopCurrentSecond)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  loopCurrentSecond ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white bg-slate-800'
                }`}
                title="Aktuelle Sekunde loopen für genaue Analyse"
              >
                Loop 1s
              </button>

              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 text-xs font-mono cursor-pointer"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1.0x (Echtzeit)</option>
                <option value={2}>2.0x (Schnell)</option>
              </select>

              <div className="flex items-center gap-1.5 ml-2">
                <button
                  type="button"
                  onClick={() => setShowTechnicalHud(!showTechnicalHud)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    showTechnicalHud ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 bg-slate-800'
                  }`}
                >
                  Tech-HUD
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubtitles(!showSubtitles)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    showSubtitles ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 bg-slate-800'
                  }`}
                >
                  Untertitel
                </button>
              </div>
            </div>
          </div>

          {/* Timeline Scrubber Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={Math.max(0, totalFrames - 1)}
              value={currentFrameIndex}
              onChange={(e) => setCurrentFrameIndex(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>00:00 (Start)</span>
              <span>Aktuell: {activeFrame.timestamp} (Sekunde {activeFrame.second} von {totalFrames}s)</span>
              <span>{formatSecondsToTime(totalFrames)} (Ende)</span>
            </div>
          </div>

          {/* THE MEGA INTERACTIVE SCREEN / CANVAS (16:9 Aspect Ratio) */}
          <div className="relative aspect-video w-full rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-2 border-slate-700/80 shadow-inner overflow-hidden flex flex-col justify-between p-6 select-none group">
            {/* Background High-Tech Circuit & Hex Grid */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none" />

            {/* Glowing Layer Accent Line along Top */}
            <div 
              className="absolute top-0 left-0 right-0 h-1.5 shadow-lg transition-all duration-300"
              style={{ backgroundColor: activeFrame.accentColor, boxShadow: `0 0 15px ${activeFrame.accentColor}` }}
            />

            {/* Top HUD: Layer Badge, Frame Timestamp, Resolution Indicator */}
            {showTechnicalHud && (
              <div className="relative z-15 flex items-center justify-between text-xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <span 
                    className="px-3 py-1 rounded-lg text-white font-mono font-bold text-xs uppercase tracking-wider shadow-md"
                    style={{ backgroundColor: activeFrame.accentColor }}
                  >
                    OSI L{activeFrame.activeLayer || 'X'} • {activeFrame.pduType}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-slate-750 text-slate-200 font-mono text-[11px]">
                    Protokolle: {activeFrame.activeProtocols.join(', ') || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    1 FPS • 1280×720p 16:9
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-slate-750 text-amber-300 font-mono text-xs">
                    {activeFrame.timestamp}
                  </span>
                </div>
              </div>
            )}

            {/* Central Visual Spectacle: Interactive Graphic per Scene Type */}
            <div className="relative z-10 flex-1 flex items-center justify-center py-4">
              {activeFrame.visualSceneType === 'topology' && (
                <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-md border border-red-500/30 rounded-xl p-5 shadow-2xl space-y-3 text-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-300 font-mono text-xs border border-red-500/40">
                    Schicht 7: Anwendung & HTTP Payload
                  </div>
                  <div className="flex items-center justify-around py-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/20">
                        <MonitorPlay className="w-7 h-7" />
                      </div>
                      <span className="text-[11px] text-slate-300 font-mono font-medium">Browser Client</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center px-4">
                      <span className="text-[10px] font-mono text-red-300 bg-red-950/60 px-2 py-0.5 rounded border border-red-700/50 mb-1">
                        {activeFrame.packetHeader}
                      </span>
                      <div className="w-full h-1 bg-gradient-to-r from-red-500 via-amber-400 to-red-500 rounded-full animate-pulse shadow-md" />
                      <span className="text-[9px] text-slate-400 mt-1">GET Request Stream</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/20">
                        <Cpu className="w-7 h-7" />
                      </div>
                      <span className="text-[11px] text-slate-300 font-mono font-medium">Webserver</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 font-mono bg-black/40 p-2 rounded-lg border border-slate-800">
                    Gerät: {activeFrame.hardwareDevice} • Nutzdaten ohne Netzwerk-Header
                  </p>
                </div>
              )}

              {activeFrame.visualSceneType === 'packet_flow' && (
                <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 rounded-xl p-5 shadow-2xl space-y-3 text-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/40">
                    Schicht {activeFrame.activeLayer}: {activeFrame.layerName}
                  </div>
                  <div className="flex items-center justify-center gap-2 py-2 flex-wrap">
                    <div className="px-3 py-2 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 font-mono text-xs shadow-lg">
                      [TCP Header: 54321 → 443]
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-cyan-950/80 border border-cyan-500/60 text-cyan-200 font-mono text-xs shadow-lg">
                      [IP Header: 192.168.1.100 → 93.184.216.34]
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-red-950/80 border border-red-500/60 text-red-200 font-mono text-xs shadow-lg">
                      [HTTP Payload: GET /]
                    </div>
                  </div>
                  <div className="p-2.5 bg-black/50 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 flex items-center justify-between">
                    <span>Routing Node: {activeFrame.hardwareDevice}</span>
                    <span className="text-amber-400">PDU: {activeFrame.pduType}</span>
                  </div>
                </div>
              )}

              {activeFrame.visualSceneType === 'hardware' && (
                <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-md border border-blue-500/30 rounded-xl p-5 shadow-2xl space-y-3 text-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-mono text-xs border border-blue-500/40">
                    Schicht {activeFrame.activeLayer}: Hardware, Frames & Bitübertragung
                  </div>
                  {/* Switch Ports Simulation with Blinking LEDs */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>24-Port Gigabit Managed Switch (CAM Table)</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> LINK UP
                      </span>
                    </div>
                    <div className="grid grid-cols-12 gap-1.5 py-1">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 p-1 bg-slate-900 rounded border border-slate-800">
                          <span className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                          <span className="text-[8px] font-mono text-slate-500">{i + 1}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] font-mono text-cyan-300 text-left pt-1 border-t border-slate-800">
                      CAM: MAC 00:1A:2B:3C:4D:5E an Port 4 &bull; Signal: 1000BASE-T (Kupfer Cat6)
                    </div>
                  </div>
                </div>
              )}

              {activeFrame.visualSceneType === 'terminal' && (
                <div className="w-full max-w-xl bg-slate-950/95 border border-pink-500/40 rounded-xl p-4 shadow-2xl font-mono text-xs text-left space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[10px] text-slate-400">
                    <span className="text-pink-400 font-bold flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5" /> root@ihk-diagnostic-station:~#
                    </span>
                    <span>OSI L1–L7 Speedrun Check</span>
                  </div>
                  <div className="space-y-1 text-slate-300 text-[11px]">
                    <p className="text-cyan-400">$ ethtool eth0 | grep "Link detected"</p>
                    <p className="text-emerald-400">  Link detected: yes (Schicht 1 OK)</p>
                    <p className="text-cyan-400">$ ping -c 1 192.168.1.1</p>
                    <p className="text-emerald-400">  64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=0.42 ms (Schicht 3 OK)</p>
                    <p className="text-cyan-400">$ nc -zv 192.168.1.1 443</p>
                    <p className="text-emerald-400">  Connection to 192.168.1.1 443 port [tcp/https] succeeded! (Schicht 4 OK)</p>
                  </div>
                </div>
              )}

              {activeFrame.visualSceneType === 'infographic' && (
                <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-md border border-amber-500/30 rounded-xl p-5 shadow-2xl space-y-3 text-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs border border-amber-500/40">
                    {activeFrame.layerName}
                  </div>
                  <div className="grid grid-cols-2 gap-3 py-2">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-1">
                      <span className="text-[10px] font-mono text-amber-400 uppercase">OSI 7-Schichten</span>
                      <p className="text-xs text-white font-semibold">Theoretisches Referenzmodell</p>
                      <p className="text-[11px] text-slate-400">ISO 1984 Standard für Herstellerunabhängigkeit</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-1">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase">TCP/IP 4-Schichten</span>
                      <p className="text-xs text-white font-semibold">Praxisstandard im Internet</p>
                      <p className="text-[11px] text-slate-400">Schlanker Aufbau: Application, Transport, Internet, Link</p>
                    </div>
                  </div>
                </div>
              )}

              {activeFrame.visualSceneType === 'intro_outro' && (
                <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-md border border-indigo-500/40 rounded-xl p-6 shadow-2xl text-center space-y-3">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs border border-indigo-500/40">
                    OSI-Modell 720p HD Studio
                  </span>
                  <h3 className="text-xl font-black text-white">
                    Schichtenmodell der Netzwerkkommunikation
                  </h3>
                  <p className="text-xs text-slate-300 font-mono">
                    FISI Umschulung &bull; IHK-Fachgespräch Vorbereitung &bull; 1 FPS Dekonstruktion
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Section: Lower Third & Synchronized Live Transcript */}
            <div className="relative z-15 flex flex-col md:flex-row items-end md:items-center justify-between gap-3 animate-fade-in">
              {/* Lower Third Banner */}
              <div className="flex items-center gap-2.5 bg-slate-950/90 backdrop-blur-md border border-slate-750 px-3.5 py-2 rounded-xl shadow-lg">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeFrame.accentColor }} />
                <div>
                  <div className="text-xs font-bold text-white leading-tight">
                    {activeFrame.speakerRole}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {activeFrame.sceneTitle} &bull; Sekunde {activeFrame.second}s
                  </div>
                </div>
              </div>

              {/* Subtitle Bar matching exact spoken words for this second */}
              {showSubtitles && (
                <div className="flex-1 max-w-xl px-4 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-slate-700/80 text-center shadow-xl">
                  <span className="text-xs md:text-sm font-medium text-amber-200 tracking-wide font-sans">
                    „{activeFrame.transcriptSlice}“
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Row for the Current 1-Second Schnipsel */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Schnipsel-Werkbank für Sekunde #{activeFrame.second} ({activeFrame.timestamp}):</span>
              </div>
              <p className="text-xs text-slate-400">
                {activeFrame.deltaDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onNavigateToVideoGen && (
                <button
                  type="button"
                  onClick={() => onNavigateToVideoGen(activeFrame.geminiOmniPrompt)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="In Gemini Omni 1.1 Flash Video Generator laden für 1:1 KI-Generierung"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>1:1 Prompt in Gemini Video</span>
                </button>
              )}

              {onNavigateToCartesia && (
                <button
                  type="button"
                  onClick={() => onNavigateToCartesia(activeFrame.transcriptSlice)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="In Cartesia Sonic Studio laden für Sprachausgabe"
                >
                  <Mic className="w-3.5 h-3.5 text-amber-400" />
                  <span>In Cartesia Sonic Prompt</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => copyToClipboard(activeFrame.geminiOmniPrompt, `prompt-${activeFrame.frameIndex}`)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedType === `prompt-${activeFrame.frameIndex}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Prompt kopieren</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadFrameJson}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Schnipsel-JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filmstrip View: Jede Sekunde 1 Bild Schnipsel-Katalog */}
      {(viewMode === 'filmstrip' || viewMode === 'split') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Grid className="w-4 h-4 text-cyan-400" />
                <span>Filmstreifen-Katalog (Jede Sekunde 1 Bild • {totalFrames} Schnipsel)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Klicke auf eine beliebige Sekunde, um das Bild zu vergrößern und sofort in Gemini oder Cartesia zu nutzen.
              </p>
            </div>

            <div className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-lg border border-cyan-700/50">
              1 Frame = 1000ms Video-Zeit
            </div>
          </div>

          {/* Grid of All 1-Second Frames */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 max-h-[560px] overflow-y-auto pr-1">
            {frames.map((frame, idx) => {
              const isSelected = frame.frameIndex === currentFrameIndex;
              return (
                <div
                  key={frame.frameIndex}
                  onClick={() => setCurrentFrameIndex(idx)}
                  className={`relative rounded-xl p-2.5 transition-all cursor-pointer flex flex-col justify-between border ${
                    isSelected
                      ? 'bg-slate-800/95 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/50'
                      : 'bg-slate-950/80 hover:bg-slate-800/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {/* Top Bar of Card */}
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                    <span 
                      className="px-1.5 py-0.2 rounded font-bold text-white text-[9px]"
                      style={{ backgroundColor: frame.accentColor }}
                    >
                      L{frame.activeLayer || 'X'}
                    </span>
                    <span className="font-bold text-slate-300">
                      {frame.timestamp}
                    </span>
                  </div>

                  {/* Thumbnail Miniature Graphic */}
                  <div className="aspect-video w-full rounded-lg bg-slate-900 border border-slate-800/80 flex flex-col items-center justify-center p-1.5 text-center my-1 overflow-hidden relative group">
                    <span className="text-[9px] font-mono text-cyan-300 truncate w-full">
                      {frame.pduType}
                    </span>
                    <span className="text-[8px] text-slate-500 line-clamp-1 mt-0.5">
                      {frame.hardwareDevice}
                    </span>
                  </div>

                  {/* Transcript excerpt */}
                  <div className="text-[10px] text-slate-300 line-clamp-2 leading-tight mt-1">
                    {frame.transcriptSlice}
                  </div>

                  {/* Active selection dot */}
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-cyan-400 rounded-full border-2 border-slate-900 flex items-center justify-center shadow">
                      <span className="w-1.5 h-1.5 bg-slate-950 rounded-full" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
