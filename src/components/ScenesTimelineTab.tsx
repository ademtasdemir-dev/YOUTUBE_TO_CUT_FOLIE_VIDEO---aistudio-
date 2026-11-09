import React, { useState } from 'react';
import { Film, User, Clock, ArrowRight, Sparkles, Volume2, CheckCircle, ChevronDown, ChevronUp, Layers, HelpCircle, Mic } from 'lucide-react';
import { PRESENTATION_SCENES, PresentationScene, calculateWordsPerMinute, OSI_LAYERS } from '../utils/osiData';

interface ScenesTimelineTabProps {
  onSelectSceneForVideo: (scene: PresentationScene) => void;
  scenes?: PresentationScene[];
  onResetDefaultScenes?: () => void;
  isCustomSource?: boolean;
  onNavigateToCartesia?: (scene: PresentationScene) => void;
}

export const ScenesTimelineTab: React.FC<ScenesTimelineTabProps> = ({
  onSelectSceneForVideo,
  scenes = PRESENTATION_SCENES,
  onResetDefaultScenes,
  isCustomSource = false,
  onNavigateToCartesia
}) => {
  const displayScenes = scenes && scenes.length > 0 ? scenes : PRESENTATION_SCENES;
  const [expandedSceneId, setExpandedSceneId] = useState<string>(displayScenes[1]?.id || displayScenes[0]?.id || 'scene-1');
  const [playingAudioScene, setPlayingAudioScene] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSceneId((prev) => (prev === id ? '' : id));
  };

  const handlePlayTTS = async (scene: PresentationScene) => {
    if (playingAudioScene === scene.id) {
      setPlayingAudioScene(null);
      return;
    }

    try {
      setPlayingAudioScene(scene.id);
      setAudioError(null);

      // Clean speech text
      const cleanText = scene.scriptText.replace(/\[.*?\]/g, '').trim();
      if (!cleanText) {
        setPlayingAudioScene(null);
        return;
      }

      // Check if browser SpeechSynthesis is available for instant rehearsal
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText.substring(0, 300));
        utterance.lang = 'de-DE';
        utterance.rate = 1.0;
        utterance.onend = () => setPlayingAudioScene(null);
        utterance.onerror = () => setPlayingAudioScene(null);
        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback to server TTS endpoint
        const res = await fetch('/api/generate-tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText.substring(0, 250),
            speaker: scene.speaker,
          }),
        });
        const data = await res.json();
        if (data.audioData) {
          const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioData}`);
          audio.onended = () => setPlayingAudioScene(null);
          await audio.play();
        } else {
          setPlayingAudioScene(null);
        }
      }
    } catch (err: any) {
      console.warn('TTS playback note:', err);
      setAudioError('Sprachprobe wird im Browser abgespielt.');
      setPlayingAudioScene(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-blue-400" />
              Regiebuch & Schnittplan
            </h2>
            {isCustomSource ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                YouTube Import aktiv
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                Comcave OSI Standard
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isCustomSource
              ? 'Individuell aus YouTube Video zerlegte Segmente mit Cartesia TTS Voice-Prompts und Gemini Omni Videoprompts.'
              : 'FISI Umschulung bei Comcave • Vorbereitung für das IHK-Fachgespräch. Jeder Sprecher hat einen fest definierten Part und klare Übergaben ohne Dazwischenreden.'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {isCustomSource && onResetDefaultScenes && (
            <button
              type="button"
              onClick={onResetDefaultScenes}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
            >
              Standard-Drehbuch wiederherstellen
            </button>
          )}
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300">
            Gesamt: <strong className="text-amber-400">{Math.floor(displayScenes.reduce((acc, s) => acc + s.durationSeconds, 0) / 60)}:{String(displayScenes.reduce((acc, s) => acc + s.durationSeconds, 0) % 60).padStart(2, '0')} Min ({displayScenes.reduce((acc, s) => acc + s.durationSeconds, 0)}s)</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300">
            Tempo: <strong className="text-emerald-400">120–140 WPM</strong>
          </div>
        </div>
      </div>

      {/* Visual Timeline Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <span>00:00 (Start)</span>
          <span>{displayScenes[Math.floor(displayScenes.length / 2)]?.timeStart || 'Mitte'}</span>
          <span>{displayScenes[displayScenes.length - 1]?.timeEnd || 'Ende'}</span>
        </div>
        <div className="w-full h-8 bg-slate-900 rounded-lg overflow-hidden flex border border-slate-800">
          {displayScenes.map((scene) => {
            const totalSec = Math.max(1, displayScenes.reduce((acc, s) => acc + s.durationSeconds, 0));
            const percent = (scene.durationSeconds / totalSec) * 100;
            const isExpanded = expandedSceneId === scene.id;
            return (
              <div
                key={scene.id}
                onClick={() => setExpandedSceneId(scene.id)}
                style={{ width: `${percent}%` }}
                className={`h-full cursor-pointer transition-all border-r border-slate-900/80 flex items-center justify-center text-[11px] font-bold text-white truncate px-1 hover:brightness-125 ${
                  scene.sceneNumber === 0 || scene.sceneNumber === displayScenes.length - 1
                    ? 'bg-slate-700'
                    : scene.sceneNumber % 5 === 1
                    ? 'bg-red-600'
                    : scene.sceneNumber % 5 === 2
                    ? 'bg-orange-600'
                    : scene.sceneNumber % 5 === 3
                    ? 'bg-emerald-600'
                    : scene.sceneNumber % 5 === 4
                    ? 'bg-blue-600'
                    : 'bg-cyan-600'
                } ${isExpanded ? 'ring-2 ring-white z-10 brightness-110' : 'opacity-85'}`}
                title={`Szene ${scene.sceneNumber}: ${scene.speaker} (${scene.timeStart}-${scene.timeEnd})`}
              >
                {scene.speaker}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scene Cards Accordion */}
      <div className="space-y-4">
        {displayScenes.map((scene) => {
          const isExpanded = expandedSceneId === scene.id;
          const wpm = calculateWordsPerMinute(scene.scriptText, scene.durationSeconds);

          return (
            <div
              key={scene.id}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? 'bg-slate-900/90 border-blue-500/50 shadow-lg shadow-blue-500/5'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div
                onClick={() => toggleExpand(scene.id)}
                className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-sm shrink-0 border ${
                      scene.sceneNumber === 0 || scene.sceneNumber === displayScenes.length - 1
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : scene.sceneNumber % 5 === 1
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : scene.sceneNumber % 5 === 2
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                        : scene.sceneNumber % 5 === 3
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : scene.sceneNumber % 5 === 4
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                        : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                    }`}
                  >
                    #{scene.sceneNumber}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm md:text-base">
                        {scene.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {scene.speaker}
                      </span>
                      <span className="text-xs text-slate-400">
                        &bull; {scene.speakerRole}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Folie: <span className="text-slate-300">{scene.slides}</span> &bull; {scene.topic}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <div className="text-right font-mono">
                    <div className="text-xs font-semibold text-white">
                      {scene.timeStart} – {scene.timeEnd}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Dauer: {scene.durationSeconds}s {wpm > 0 && `(${wpm} WPM)`}
                    </div>
                  </div>
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Expanded Card Details */}
              {isExpanded && (
                <div className="px-4 pb-5 pt-2 border-t border-slate-800/80 space-y-4">
                  {/* Lower Third & Regie Info Box */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1">
                        Lower Third Einblendung
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="font-bold text-white text-xs">{scene.speaker}</div>
                        <div className="text-[11px] italic text-amber-400">{scene.speakerRole}</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1">
                        Regieanweisung & Bildaufbau
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed">
                        {scene.directorNotes}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1">
                          Übergabe-Cue (Nicht unterbrechen)
                        </div>
                        <div className="text-xs font-medium text-emerald-300 italic">
                          {scene.transitionCue ? `„${scene.transitionCue}“` : 'Fade-Out / Ende'}
                        </div>
                      </div>
                      <div className="pt-2 flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => onSelectSceneForVideo(scene)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Gemini Video</span>
                        </button>
                        {onNavigateToCartesia && (
                          <button
                            type="button"
                            onClick={() => onNavigateToCartesia(scene)}
                            className="py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs flex items-center gap-1 border border-amber-500/40"
                            title="Cartesia Voice Prompt öffnen"
                          >
                            <Mic className="w-3.5 h-3.5 text-amber-400" />
                            <span>Cartesia TTS</span>
                          </button>
                        )}
                        {scene.scriptText && !scene.scriptText.startsWith('[Kein Sprechtext') && (
                          <button
                            type="button"
                            onClick={() => handlePlayTTS(scene)}
                            className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700"
                            title="Sprachprobe vorlesen"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                            <span>{playingAudioScene === scene.id ? 'Stop' : 'Audio'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Speech Text (Drehbuch) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>Vollständiger Sprechtext:</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {wpm} Wörter / Minute
                      </span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 font-sans text-xs md:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                      {scene.scriptText}
                    </div>
                  </div>

                  {/* Visual Cues Timeline Table */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-slate-300">
                      Visuelle Einblendungen & Folienwechsel:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {scene.cues.map((cue, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-slate-950 border border-slate-800/80 text-xs flex items-start gap-2"
                        >
                          <span className="font-mono text-amber-400 font-bold shrink-0">
                            {cue.timeOffset}
                          </span>
                          <span className="text-slate-300">{cue.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
