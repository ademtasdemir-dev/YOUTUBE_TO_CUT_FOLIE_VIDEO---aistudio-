import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, FastForward, Clock, User, Layers, AlertCircle, ArrowRight } from 'lucide-react';
import { PRESENTATION_SCENES, PresentationScene, OSI_LAYERS, formatSecondsToTime } from '../utils/osiData';

interface TeleprompterTabProps {
  scenes?: PresentationScene[];
}

export const TeleprompterTab: React.FC<TeleprompterTabProps> = ({
  scenes = PRESENTATION_SCENES
}) => {
  const displayScenes = scenes && scenes.length > 0 ? scenes : PRESENTATION_SCENES;
  const [currentSeconds, setCurrentSeconds] = useState<number>(displayScenes[0]?.startSeconds || 0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0); // 1.0x, 1.25x, 0.75x
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');
  const prompterRef = useRef<HTMLDivElement>(null);

  // Find active scene
  const activeScene: PresentationScene =
    displayScenes.find(
      (s) => currentSeconds >= s.startSeconds && currentSeconds < s.endSeconds
    ) || displayScenes[displayScenes.length - 1];

  // Seconds until transition
  const secondsToTransition = activeScene.endSeconds - currentSeconds;
  const isTransitionSoon = secondsToTransition <= 10 && secondsToTransition > 0;

  // Next speaker
  const currentSceneIndex = displayScenes.findIndex((s) => s.id === activeScene.id);
  const nextScene = currentSceneIndex < displayScenes.length - 1 ? displayScenes[currentSceneIndex + 1] : null;

  // Timer loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSeconds((prev) => {
          if (prev >= 720) {
            setIsPlaying(false);
            return 720;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed]);

  const handleSeek = (newSeconds: number) => {
    setCurrentSeconds(Math.min(720, Math.max(0, newSeconds)));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentSeconds(0);
  };

  return (
    <div className="space-y-6">
      {/* Control Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg transition-all ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
              }`}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
              title="Auf Anfang zurücksetzen"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <div>
              <div className="font-mono text-2xl font-bold text-white tracking-wider">
                {formatSecondsToTime(currentSeconds)}
                <span className="text-slate-500 text-sm font-normal ml-2">/ 12:00</span>
              </div>
              <div className="text-xs text-slate-400">
                Restzeit: <span className="font-mono text-amber-400">{formatSecondsToTime(Math.max(0, 720 - currentSeconds))}</span>
              </div>
            </div>
          </div>

          {/* Quick Scene Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {displayScenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => {
                  handleSeek(scene.startSeconds);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                  activeScene.id === scene.id
                    ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {scene.speaker}
              </button>
            ))}
          </div>

          {/* Settings: Speed & Font Size */}
          <div className="flex items-center gap-3 self-end md:self-auto text-xs">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <span className="text-slate-500 px-1 text-[11px]">Tempo:</span>
              {[0.75, 1.0, 1.25].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    playbackSpeed === speed ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <span className="text-slate-500 px-1 text-[11px]">Textgröße:</span>
              {(['normal', 'large', 'huge'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-2 py-0.5 rounded text-[11px] capitalize ${
                    fontSize === size ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Timeline Scrubber */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <input
            type="range"
            min={0}
            max={720}
            value={currentSeconds}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      {/* Main Stage: Teleprompter + Active OSI Diagram & Lower Third */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Teleprompter Script Stream */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative flex flex-col justify-between min-h-[500px]">
          {/* Transition Alert Banner */}
          {isTransitionSoon && nextScene && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2 text-xs md:text-sm font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Übergabe an {nextScene.speaker} in {secondsToTransition}s!</span>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-500/30 px-2 py-0.5 rounded">
                Cue: „{activeScene.transitionCue}“
              </span>
            </div>
          )}

          {/* Current Speaker Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-white text-base">
                Aktueller Sprecher: <span className="text-amber-400">{activeScene.speaker}</span>
              </span>
              <span className="text-xs text-slate-400">({activeScene.speakerRole})</span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Folie: <span className="text-slate-200 font-semibold">{activeScene.slides}</span>
            </div>
          </div>

          {/* Script Content */}
          <div
            ref={prompterRef}
            className={`my-4 max-h-[360px] overflow-y-auto pr-3 leading-relaxed font-sans text-slate-100 select-none whitespace-pre-line ${
              fontSize === 'normal'
                ? 'text-base leading-7'
                : fontSize === 'large'
                ? 'text-xl leading-9'
                : 'text-2xl leading-10 font-medium'
            }`}
          >
            {activeScene.scriptText}
          </div>

          {/* Handover Notice & Lower Third live view */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Live Lower Third (Kamera-Einblendung)
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-bold text-white text-sm">{activeScene.speaker}</span>
                <span className="text-xs italic text-amber-400">{activeScene.speakerRole}</span>
              </div>
            </div>

            {nextScene && (
              <div className="text-right text-xs text-slate-400">
                <span>Nächster Sprecher: </span>
                <strong className="text-white">{nextScene.speaker}</strong>
                <span className="text-slate-500"> ({nextScene.speakerRole} ab {nextScene.timeStart})</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: OSI 7-Layer Progress Indicator & Active Cues */}
        <div className="lg:col-span-4 space-y-6">
          {/* OSI Model Layer Status */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                OSI-Fortschrittsanzeige (Oben rechts)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">7 Schichten</span>
            </div>

            <div className="space-y-1.5">
              {OSI_LAYERS.map((layer) => {
                const isCurrentLayer = activeScene.layers.includes(layer.number);
                return (
                  <div
                    key={layer.number}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                      isCurrentLayer
                        ? 'bg-blue-600/25 border-blue-400 text-white shadow-md ring-1 ring-blue-400 font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-[10px] text-white"
                        style={{ backgroundColor: layer.color }}
                      >
                        {layer.number}
                      </span>
                      <span className="truncate">{layer.nameDe}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {layer.pdu}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Scene Cues */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Einblendungen in dieser Szene
            </h4>
            <div className="space-y-2">
              {activeScene.cues.map((cue, i) => (
                <div
                  key={i}
                  className="p-2 rounded bg-slate-950 border border-slate-800 text-xs flex items-center gap-2"
                >
                  <span className="font-mono text-amber-400 font-bold text-[11px] shrink-0">
                    {cue.timeOffset}
                  </span>
                  <span className="text-slate-300 text-[11px]">{cue.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
