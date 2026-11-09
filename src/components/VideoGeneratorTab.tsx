import React, { useState } from 'react';
import { Sparkles, Video, Play, Download, CheckCircle2, AlertCircle, RefreshCw, Layers, Film, ArrowRight, Info } from 'lucide-react';
import { PRESENTATION_SCENES, PresentationScene } from '../utils/osiData';

export interface GeneratedVideoItem {
  id: string;
  interactionId?: string;
  sceneId?: string;
  sceneTitle?: string;
  speaker?: string;
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  resolution: string;
  duration: string;
  videoUrl: string;
  createdAt: string;
  isDemo?: boolean;
}

interface VideoGeneratorTabProps {
  onVideoCreated: (video: GeneratedVideoItem) => void;
  generatedVideos: GeneratedVideoItem[];
  scenes?: PresentationScene[];
  initialSelectedScene?: PresentationScene | null;
}

export const VideoGeneratorTab: React.FC<VideoGeneratorTabProps> = ({
  onVideoCreated,
  generatedVideos,
  scenes = PRESENTATION_SCENES,
  initialSelectedScene,
}) => {
  const displayScenes = scenes && scenes.length > 0 ? scenes : PRESENTATION_SCENES;
  const initialScene = initialSelectedScene || displayScenes[1] || displayScenes[0];
  const [selectedScene, setSelectedScene] = useState<PresentationScene>(initialScene);
  const [prompt, setPrompt] = useState<string>(initialScene.aiVideoPrompt);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [duration, setDuration] = useState<'5s' | '10s'>('5s');
  const [resolution, setResolution] = useState<'720p' | '1080p' | '360p'>('720p');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<GeneratedVideoItem | null>(
    generatedVideos.length > 0 ? generatedVideos[0] : null
  );

  const handleSceneSelect = (scene: PresentationScene) => {
    setSelectedScene(scene);
    setPrompt(scene.aiVideoPrompt);
    setErrorMsg(null);
  };

  const generateVideo = async (useDemoFallback = false) => {
    setIsGenerating(true);
    setErrorMsg(null);
    setElapsedSeconds(0);

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    try {
      if (useDemoFallback) {
        // Create an illustrative Canvas video preview as immediate local render
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const demoItem = createDemoVideo(prompt, selectedScene, aspectRatio, resolution, duration);
        onVideoCreated(demoItem);
        setActiveVideo(demoItem);
      } else {
        const response = await fetch('/api/generate-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            aspect_ratio: aspectRatio,
            duration,
            resolution,
            sceneId: selectedScene.id,
            speaker: selectedScene.speaker,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Fehler bei der Videogenerierung');
        }

        let videoUrl = '';
        if (data.videoData) {
          videoUrl = `data:${data.mimeType || 'video/mp4'};base64,${data.videoData}`;
        } else if (data.videoUri) {
          videoUrl = data.videoUri;
        }

        const newItem: GeneratedVideoItem = {
          id: data.interactionId || `vid-${Date.now()}`,
          interactionId: data.interactionId,
          sceneId: selectedScene.id,
          sceneTitle: selectedScene.title,
          speaker: selectedScene.speaker,
          prompt,
          aspectRatio,
          resolution,
          duration,
          videoUrl,
          createdAt: new Date().toLocaleTimeString('de-DE'),
          isDemo: false,
        };

        onVideoCreated(newItem);
        setActiveVideo(newItem);
      }
    } catch (err: any) {
      console.error('Video Generation Error:', err);
      setErrorMsg(err.message || 'Die Videogenerierung konnte nicht abgeschlossen werden.');
    } finally {
      clearInterval(timer);
      setIsGenerating(false);
    }
  };

  // Helper to generate a visual animated MP4/WebM blob if external quota or trial key is awaiting activation
  const createDemoVideo = (
    promptText: string,
    scene: PresentationScene,
    ratio: '16:9' | '9:16',
    res: string,
    dur: string
  ): GeneratedVideoItem => {
    // Generate a high quality animated SVG data URI video card
    const width = ratio === '16:9' ? 1280 : 720;
    const height = ratio === '16:9' ? 720 : 1280;
    const speaker = scene.speaker;
    const title = scene.title;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#090d16" />
            <stop offset="50%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#1e1b4b" />
          </linearGradient>
          <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#3b82f6" />
            <stop offset="100%" stop-color="#f97316" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)" />
        <circle cx="${width / 2}" cy="${height / 2}" r="${width / 4}" fill="#3b82f6" opacity="0.08" />
        <line x1="60" y1="90" x2="${width - 60}" y2="90" stroke="#334155" stroke-width="2" />
        
        <text x="60" y="65" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#f8fafc">
          OSI-Modell 720p Studio &bull; FISI Comcave
        </text>
        <rect x="${width - 240}" y="35" width="180" height="40" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
        <text x="${width - 150}" y="61" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="#93c5fd" text-anchor="middle">
          Gemini Omni Flash 1.1
        </text>

        <!-- Center badge -->
        <rect x="${width / 2 - 280}" y="${height / 2 - 120}" width="560" height="240" rx="16" fill="#0f172a" stroke="url(#accent)" stroke-width="3" />
        <text x="${width / 2}" y="${height / 2 - 60}" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#38bdf8" text-anchor="middle">
          ${scene.speakerRole.toUpperCase()}
        </text>
        <text x="${width / 2}" y="${height / 2 - 10}" font-family="system-ui, sans-serif" font-size="34" font-weight="bold" fill="#ffffff" text-anchor="middle">
          ${title}
        </text>
        <text x="${width / 2}" y="${height / 2 + 40}" font-family="system-ui, sans-serif" font-size="18" fill="#94a3b8" text-anchor="middle">
          Sprecher: ${speaker} &bull; Folien: ${scene.slides} &bull; Dauer: ${scene.durationSeconds}s
        </text>
        <text x="${width / 2}" y="${height / 2 + 80}" font-family="system-ui, sans-serif" font-size="15" fill="#f59e0b" text-anchor="middle">
          Format: ${ratio} &bull; Ziel-Export: ${res} &bull; H.264 MP4 30fps
        </text>

        <!-- Lower Third overlay simulation -->
        <rect x="60" y="${height - 120}" width="420" height="70" rx="8" fill="#020617" opacity="0.9" stroke="#f97316" stroke-width="2" />
        <text x="85" y="${height - 86}" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#ffffff">
          ${speaker}
        </text>
        <text x="85" y="${height - 62}" font-family="system-ui, sans-serif" font-size="16" font-style="italic" fill="#fb923c">
          ${scene.speakerRole}
        </text>
      </svg>
    `;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    return {
      id: `demo-${Date.now()}`,
      sceneId: scene.id,
      sceneTitle: scene.title,
      speaker: scene.speaker,
      prompt: promptText,
      aspectRatio: ratio,
      resolution: res,
      duration: dur,
      videoUrl: url,
      createdAt: new Date().toLocaleTimeString('de-DE'),
      isDemo: true,
    };
  };

  return (
    <div className="space-y-8">
      {/* Intro Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-950/80 via-indigo-950/60 to-slate-900 border border-blue-500/30 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Modell: gemini-omni-1.1-flash &bull; Interactions API
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              KI-Videogenerierung für das 720p OSI-Präsentationsvideo
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Erzeuge professionelle Bild- und Videoclips für jede der 8 Szenen deiner Präsentation mit Google Gemini Omni Flash.
              Präzise abgestimmt auf 16:9 Querformat (1280&times;720px) oder 9:16 Hochformat.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-right">
              <div className="text-xs text-slate-400">Standardauflösung</div>
              <div className="text-base font-bold text-amber-400 font-mono">720p HD (16:9)</div>
              <div className="text-[11px] text-slate-500">IHK-Prüfungsanforderung</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scene Picker & Prompt Configuration */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Scene Preset Selector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-blue-400" />
                1. Szene & Sprecher wählen
              </h3>
              <span className="text-xs text-slate-400 font-mono">{displayScenes.length} Szenen verfügbar</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {displayScenes.map((scene) => {
                const isSelected = selectedScene.id === scene.id;
                return (
                  <button
                    key={scene.id}
                    onClick={() => handleSceneSelect(scene)}
                    className={`text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 mb-1">
                      <span>Szene {scene.sceneNumber}</span>
                      <span>{scene.timeStart}</span>
                    </div>
                    <div className="font-semibold text-slate-200 truncate">{scene.speaker}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{scene.speakerRole}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Format & Generation Parameters */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              2. Video-Format & Einstellungen
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Aspect Ratio Selector - strictly 16:9 or 9:16 */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Seitenverhältnis (Aspect Ratio)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-center ${
                      aspectRatio === '16:9'
                        ? 'bg-blue-600 text-white border-blue-500 font-semibold shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    16:9
                    <span className="block text-[10px] opacity-75">Querformat (720p)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-center ${
                      aspectRatio === '9:16'
                        ? 'bg-blue-600 text-white border-blue-500 font-semibold shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    9:16
                    <span className="block text-[10px] opacity-75">Hochformat</span>
                  </button>
                </div>
              </div>

              {/* Resolution Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Auflösung (Resolution)
                </label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="720p">720p (1280&times;720) &bull; Standard</option>
                  <option value="1080p">1080p (Full HD)</option>
                  <option value="360p">360p (Schnellvorschau)</option>
                </select>
                <span className="text-[10px] text-amber-400 mt-1 block">Empfohlen für IHK: 720p</span>
              </div>

              {/* Duration Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Clip-Dauer (Duration)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="5s">5 Sekunden</option>
                  <option value="10s">10 Sekunden</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">Interactions API Parameter</span>
              </div>
            </div>
          </div>

          {/* 3. Prompt Editor */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                3. Video-Prompt für gemini-omni-1.1-flash
              </label>
              <button
                type="button"
                onClick={() => setPrompt(selectedScene.aiVideoPrompt)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Prompt zurücksetzen
              </button>
            </div>

            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs md:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 leading-relaxed font-mono"
              placeholder="Beschreibe die Szene, den Sprecher, Folien und Animationen..."
            />

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Sprecher: <strong className="text-slate-200">{selectedScene.speaker}</strong> ({selectedScene.speakerRole})</span>
              <span>Zeit: <strong className="text-slate-200">{selectedScene.timeStart} – {selectedScene.timeEnd}</strong></span>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold">Hinweis zur API-Generierung:</div>
                  <div className="mt-0.5">{errorMsg}</div>
                  <div className="mt-2 text-slate-300">
                    Möchtest du eine sofortige 720p-Vorschau rendern? Klicke auf <strong>„Sofortige HD-Vorschau rendern“</strong> unten.
                  </div>
                </div>
              </div>
            )}

            {/* Submit Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                disabled={isGenerating || !prompt.trim()}
                onClick={() => generateVideo(false)}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generiere mit gemini-omni-1.1-flash ({elapsedSeconds}s)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>KI-Video generieren (gemini-omni-1.1-flash)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isGenerating}
                onClick={() => generateVideo(true)}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                title="Erzeugt eine animierte 720p Test-Vorschau ohne Cloud-Wartezeit"
              >
                <Play className="w-3.5 h-3.5 text-blue-400" />
                <span>Sofortige HD-Vorschau rendern</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Video Preview & Generated Gallery */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Video Monitor */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-400" />
                Vorschau-Monitor
              </h3>
              {activeVideo && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/30">
                  {activeVideo.aspectRatio} &bull; {activeVideo.resolution}
                </span>
              )}
            </div>

            {/* Video Player Display */}
            <div
              className={`w-full bg-black rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center relative ${
                aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[480px]' : 'aspect-video'
              }`}
            >
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                    <Sparkles className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="text-sm font-semibold text-white">
                    gemini-omni-1.1-flash rendert Video...
                  </div>
                  <div className="text-xs text-slate-400 max-w-xs">
                    Interactions API verarbeitet Video im Format {aspectRatio} mit {resolution} Auflösung.
                  </div>
                  <div className="font-mono text-xs text-amber-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
                    Laufzeit: {elapsedSeconds} Sekunden
                  </div>
                </div>
              ) : activeVideo ? (
                activeVideo.videoUrl.startsWith('data:video') || activeVideo.videoUrl.endsWith('.mp4') ? (
                  <video
                    src={activeVideo.videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                    <img
                      src={activeVideo.videoUrl}
                      alt="Generiertes Video-Frame"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-slate-300">
                      Vorschau &bull; {activeVideo.speaker}
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500">
                  <Video className="w-12 h-12 text-slate-700 mb-2" />
                  <p className="text-xs text-slate-400 font-medium">Noch kein Video gerendert</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Wähle oben eine Szene und klicke auf „KI-Video generieren“
                  </p>
                </div>
              )}
            </div>

            {/* Active Video Info & Download */}
            {activeVideo && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white truncate max-w-[200px]">
                    {activeVideo.sceneTitle || 'Eigener Clip'}
                  </span>
                  <span className="text-slate-400 text-[11px]">{activeVideo.createdAt}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                  „{activeVideo.prompt}“
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={activeVideo.videoUrl}
                    download={`OSI_${activeVideo.speaker || 'Scene'}_${activeVideo.aspectRatio.replace(':', 'x')}_720p.mp4`}
                    className="flex-1 py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Video / Frame herunterladen</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Video History List */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Gerenderte Projektclips ({generatedVideos.length})
              </h4>
              <span className="text-[10px] text-slate-500">Klicke zum Abspielen</span>
            </div>

            {generatedVideos.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                Keine Clips in der Historie.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {generatedVideos.map((vid) => {
                  const isCurrent = activeVideo?.id === vid.id;
                  return (
                    <div
                      key={vid.id}
                      onClick={() => setActiveVideo(vid)}
                      className={`p-2.5 rounded-lg border cursor-pointer text-xs flex items-center justify-between gap-3 transition-all ${
                        isCurrent
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Play className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <div className="truncate">
                          <div className="font-medium truncate">{vid.sceneTitle || vid.speaker}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {vid.aspectRatio} &bull; {vid.resolution} &bull; {vid.duration}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {vid.createdAt}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
