import React, { useState } from 'react';
import { Youtube, Sparkles, Film, ArrowRight, Play, Download, Copy, Check, RefreshCw, AlertCircle, FileText, CheckCircle2, Mic } from 'lucide-react';
import { PresentationScene, extractYouTubeId, buildCartesiaPrompt, formatSecondsToTime, parseTimeToSeconds } from '../utils/osiData';

interface YouTubeDecomposerTabProps {
  onApplyScenesToStudio: (newScenes: PresentationScene[], videoMeta?: any) => void;
  onNavigateToVideoGen: (scene: PresentationScene) => void;
  onNavigateToCartesia: (scene: PresentationScene) => void;
}

export const YouTubeDecomposerTab: React.FC<YouTubeDecomposerTabProps> = ({
  onApplyScenesToStudio,
  onNavigateToVideoGen,
  onNavigateToCartesia
}) => {
  const [youtubeUrl, setYoutubeUrl] = useState<string>('https://www.youtube.com/watch?v=0kFp6B0YVb0');
  const [manualTranscript, setManualTranscript] = useState<string>('');
  const [showManualTranscript, setShowManualTranscript] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzedVideoMeta, setAnalyzedVideoMeta] = useState<any>(null);
  const [decomposedScenes, setDecomposedScenes] = useState<PresentationScene[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSceneId, setCopiedSceneId] = useState<string | null>(null);
  const [appliedNotice, setAppliedNotice] = useState<boolean>(false);

  // Preset YouTube links for quick testing
  const samplePresets = [
    {
      title: 'OSI-Modell 12-Min Vortrag (FISI Comcave)',
      url: 'https://www.youtube.com/watch?v=0kFp6B0YVb0',
      description: 'Standard 12:00 Minuten IHK-Vortrag mit Patrick, Bastian, Issa, Thomas, Adem'
    },
    {
      title: 'Netzwerktechnik & Kapselung IHK Prüfung',
      url: 'https://www.youtube.com/watch?v=IPv6Netzwerk89',
      description: 'Ausführliche Erklärung von HTTP-Payload bis Bits und Troubleshooting'
    },
    {
      title: 'TCP/IP vs. OSI Schichtenmodell Deep Dive',
      url: 'https://www.youtube.com/watch?v=TCPvsOSI123',
      description: 'Gegenüberstellung 7 OSI Schichten vs. 4 TCP/IP Schichten'
    }
  ];

  const handleAnalyze = async () => {
    if (!youtubeUrl.trim() && !manualTranscript.trim()) {
      setErrorMsg('Bitte gib einen YouTube Video-Link oder ein Transkript ein.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setAppliedNotice(false);

    try {
      const response = await fetch('/api/analyze-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: youtubeUrl.trim(),
          manualTranscript: manualTranscript.trim() || undefined
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Fehler beim Analysieren des YouTube Videos.');
      }

      setAnalyzedVideoMeta(data.metadata);

      // Convert returned scenes to PresentationScene objects with Cartesia prompts
      const formattedScenes: PresentationScene[] = data.scenes.map((s: any, idx: number) => {
        const startSec = typeof s.timeStart === 'string' ? parseTimeToSeconds(s.timeStart) : (s.startSeconds || idx * 90);
        const endSec = typeof s.timeEnd === 'string' ? parseTimeToSeconds(s.timeEnd) : (s.endSeconds || (idx + 1) * 90);
        const durSec = s.durationSeconds || Math.max(10, endSec - startSec);

        // Generate ready-to-run Cartesia prompt
        const cartesiaPrompt = buildCartesiaPrompt(s.speaker || 'Sprecher', s.scriptText || '', undefined, 1.0, s.cartesiaEmotion || 'calm, professional');

        return {
          id: `yt-scene-${idx}`,
          sceneNumber: typeof s.sceneNumber === 'number' ? s.sceneNumber : idx,
          title: s.title || `Szene ${idx + 1}`,
          speaker: s.speaker || `Sprecher ${idx + 1}`,
          speakerRole: s.speakerRole || 'Fachmoderation',
          speakerColor: 'from-blue-900/60 to-slate-900 border-blue-500',
          timeStart: s.timeStart || formatSecondsToTime(startSec),
          timeEnd: s.timeEnd || formatSecondsToTime(endSec),
          startSeconds: startSec,
          endSeconds: endSec,
          durationSeconds: durSec,
          layers: Array.isArray(s.layers) ? s.layers : [],
          slides: s.slides || `Folie ${idx + 1}`,
          topic: s.topic || s.title || '',
          scriptText: s.scriptText || '',
          transitionCue: s.transitionCue || '',
          cues: Array.isArray(s.cues) ? s.cues : [],
          directorNotes: s.directorNotes || 'Ruhige Kameraführung. Passende Folienbegriffe einblenden.',
          aiVideoPrompt: s.aiVideoPrompt || `Professional 720p 16:9 video segment of ${s.title}, German IT presenter explaining technical networking concepts.`,
          cartesiaPrompt: cartesiaPrompt,
          youtubeSourceUrl: youtubeUrl,
          youtubeVideoId: data.metadata?.videoId
        };
      });

      setDecomposedScenes(formattedScenes);
    } catch (err: any) {
      console.error('YouTube Analyzer error:', err);
      setErrorMsg(err.message || 'Verbindung zum YouTube Analyzer fehlgeschlagen.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyToStudio = () => {
    if (decomposedScenes.length === 0) return;
    onApplyScenesToStudio(decomposedScenes, analyzedVideoMeta);
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 4000);
  };

  const copyCartesiaPrompt = (scene: PresentationScene) => {
    if (!scene.cartesiaPrompt) return;
    navigator.clipboard.writeText(scene.cartesiaPrompt.sampleCurlCommand);
    setCopiedSceneId(scene.id);
    setTimeout(() => setCopiedSceneId(null), 2000);
  };

  const extractedId = extractYouTubeId(youtubeUrl);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900 to-indigo-950/70 border border-red-500/30 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold mb-2 border border-red-400/30">
              <Youtube className="w-3.5 h-3.5 text-red-400" />
              Automatischer YouTube Zerleger & Transkript-Pipeline
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              YouTube Video Link in Segmente & Cartesia TTS Prompts zerlegen
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl mt-1">
              Gib einen beliebigen YouTube Video-Link ein. Das Tool extrahiert das Transkript, segmentiert das Video
              in zeitgenaue Szenen, generiert die passenden <strong>Cartesia Text-to-Speech Prompts</strong> und
              erstellt die <strong>Gemini Omni 1.1 Flash Videoprompts</strong> (16:9 / 720p) unter Beibehaltung aller Einstellungen.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-500" />
              YouTube Video URL
            </span>
            {extractedId && (
              <span className="text-xs font-mono text-emerald-400">
                Erkannte Video-ID: <strong>{extractedId}</strong>
              </span>
            )}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... oder https://youtu.be/..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={handleAnalyze}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-semibold text-sm shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Zerlege Video & erstelle Segmente...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Video zerlegen & Cartesia Prompts generieren</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5 pt-1">
          <div className="text-xs text-slate-400">Schnellauswahl / Demo-Videos:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setYoutubeUrl(preset.url)}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                  youtubeUrl === preset.url
                    ? 'bg-red-500/10 border-red-500/50 text-white ring-1 ring-red-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-slate-200 truncate">{preset.title}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Optional Manual Transcript / Subtitles Drawer */}
        <div className="pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setShowManualTranscript(!showManualTranscript)}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{showManualTranscript ? 'Transkript-Feld einklappen' : 'Eigenes Transkript / Untertitel (.srt / .txt) manuell übergeben (optional)'}</span>
          </button>

          {showManualTranscript && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-slate-400">
                Falls das YouTube Video keine öffentlichen automatischen Untertitel hat, kannst du hier das Skript oder die Untertitel einfügen:
              </p>
              <textarea
                rows={4}
                value={manualTranscript}
                onChange={(e) => setManualTranscript(e.target.value)}
                placeholder="Füge hier Untertitel oder Skripttext ein (z. B. '00:00 Guten Morgen zusammen. Wir präsentieren euch heute das OSI-Modell...')"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-xs text-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Hinweis zur Analyse:</div>
              <div>{errorMsg}</div>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {decomposedScenes.length > 0 && (
        <div className="space-y-6">
          {/* Metadata Card & Action Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {analyzedVideoMeta?.thumbnailUrl && (
                <img
                  src={analyzedVideoMeta.thumbnailUrl}
                  alt="Thumbnail"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  className="w-24 h-16 object-cover rounded-lg border border-slate-700 shrink-0 shadow"
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                    {decomposedScenes.length} Segmente erfolgreich zerlegt
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    720p / 16:9 optimiert
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {analyzedVideoMeta?.title || 'YouTube Video Segmente'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ersteller: <span className="text-slate-200">{analyzedVideoMeta?.author || 'Unbekannt'}</span> &bull;
                  Transkript: {analyzedVideoMeta?.captionsFound ? 'Automatisch aus Untertitelspur extrahiert' : 'Inhaltlich strukturiert'}
                </p>
              </div>
            </div>

            {/* Main Action to Apply to Studio */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleApplyToStudio}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>In Studio-Drehbuch & Teleprompter laden</span>
              </button>
            </div>
          </div>

          {/* Feedback notice if applied */}
          {appliedNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Die {decomposedScenes.length} Segmente wurden erfolgreich in die Regie-Timeline und den Teleprompter übernommen!</span>
            </div>
          )}

          {/* Decomposed Segment Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-blue-400" />
                Zerlegte Segmente, Transkript & Cartesia TTS Prompts
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                Gesamtlaufzeit: {decomposedScenes[decomposedScenes.length - 1]?.timeEnd}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {decomposedScenes.map((scene) => (
                <div
                  key={scene.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg space-y-4 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 border border-red-500/40 flex items-center justify-center font-mono font-bold text-xs">
                        #{scene.sceneNumber}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm">
                            {scene.title}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-amber-300 border border-slate-700">
                            {scene.speaker} ({scene.speakerRole})
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Thema: <span className="text-slate-300">{scene.topic}</span> &bull; Folie: {scene.slides}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-xs">
                      <span className="text-slate-400">Zeit:</span>
                      <strong className="text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {scene.timeStart} – {scene.timeEnd} ({scene.durationSeconds}s)
                      </strong>
                    </div>
                  </div>

                  {/* Script & Cartesia TTS Prompt side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Decomposed Transcript */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                        <span className="flex items-center gap-1.5 text-blue-400">
                          <FileText className="w-3.5 h-3.5" />
                          Segment-Transkript:
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {scene.scriptText.split(/\s+/).filter(Boolean).length} Wörter
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line line-clamp-6">
                        {scene.scriptText}
                      </p>
                      {scene.transitionCue && (
                        <div className="text-[11px] text-emerald-400 italic pt-1 border-t border-slate-900">
                          Übergabe: „{scene.transitionCue}“
                        </div>
                      )}
                    </div>

                    {/* Right: Cartesia TTS Prompt & Parameters */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <Mic className="w-3.5 h-3.5" />
                          Cartesia TTS Prompt & Stimme:
                        </span>
                        <button
                          type="button"
                          onClick={() => copyCartesiaPrompt(scene)}
                          className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
                        >
                          {copiedSceneId === scene.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Kopiert</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>cURL kopieren</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Stimme:</span>
                          <span className="text-slate-200 font-medium truncate max-w-[200px]">
                            {scene.cartesiaPrompt?.voiceName || 'Sonic German'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Voice ID:</span>
                          <span className="font-mono text-amber-400 text-[10px]">
                            {scene.cartesiaPrompt?.voiceId || 'a0e99841-438c-4a64-b679-ae501e7d6091'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Modell:</span>
                          <span className="font-mono text-cyan-300 text-[10px]">sonic-multilingual (de)</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Stimmung:</span>
                          <span className="text-slate-300 text-[10px]">{scene.cartesiaPrompt?.emotion || 'calm, professional'}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onNavigateToCartesia(scene)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>Cartesia TTS öffnen</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onNavigateToVideoGen(scene)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                          <span>Gemini Omni Video</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
