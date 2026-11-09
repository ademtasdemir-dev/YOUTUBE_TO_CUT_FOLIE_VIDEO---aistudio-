import React, { useState } from 'react';
import { Presentation, Terminal, Copy, Check, Download, Video, CheckSquare, Camera, Mic, Sun } from 'lucide-react';
import { PRESENTATION_SLIDES, TECHNICAL_SPEC_720P, generateFfmpegCommand } from '../utils/osiData';

export const SlidesExportTab: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [copiedFfmpeg, setCopiedFfmpeg] = useState<boolean>(false);
  const [crf, setCrf] = useState<number>(20);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const slides = PRESENTATION_SLIDES;
  const currentSlide = slides[currentSlideIndex];

  const ffmpegCommand = generateFfmpegCommand({
    inputFile: 'input.mp4',
    outputFile: 'OSI_Modell_Comcave_720p_12min.mp4',
    resolution: '720p',
    crf: crf,
    audioBitrate: '192k'
  });

  const handleCopyFfmpeg = () => {
    navigator.clipboard.writeText(ffmpegCommand);
    setCopiedFfmpeg(true);
    setTimeout(() => setCopiedFfmpeg(false), 2000);
  };

  const checklistItems = [
    'Video ist exakt 1280 × 720 px (720p)',
    'Seitenverhältnis ist 16:9',
    'Länge überschreitet nicht 12:00 Minuten (Punktlandung)',
    'Jeder Sprecher (Patrick, Bastian, Issa, Thomas, Adem) hat seinen festen Part',
    'Kein Dazwischenreden / saubere Audioübergaben',
    'Übergänge und Cues sind klar definiert',
    'Folien sind in 720p gut lesbar (Schriftgröße ca. 28–32px)',
    'Namen und Rollen als Lower Third eingeblendet',
    'OSI-7-Schichten-Diagramm als Fortschrittsanzeige aktiv',
    'Kapselungs-Prinzip visuell animiert erklärt',
    'Troubleshooting-Checkliste von Schicht 1 aufwärts erklärt',
    'Audiopegel bei ca. -16 LUFS (Stereo, 48 kHz AAC)',
    'Ende mit Dankesfolie und Teamnamen',
    'Export-Codec: H.264 / AVC in MP4-Container'
  ];

  const toggleChecklist = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-8">
      {/* 1. Slide Deck Viewer (16:9 Presentation Format) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Presentation className="w-5 h-5 text-blue-400" />
              Folienplan (12 Folien in 16:9)
            </h2>
            <p className="text-xs text-slate-400">
              Präsentationsfolien für Beamer, OBS oder Screen-Capture
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              Folie {currentSlideIndex + 1} von {slides.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentSlideIndex === 0}
                onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 disabled:opacity-40"
              >
                &larr; Vorherige
              </button>
              <button
                type="button"
                disabled={currentSlideIndex === slides.length - 1}
                onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 disabled:opacity-40"
              >
                Nächste &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* 16:9 Slide Canvas Mockup */}
        <div className="w-full aspect-video bg-gradient-to-br from-slate-950 via-[#0a1128] to-[#040817] rounded-xl border border-slate-700/80 p-8 md:p-12 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Subtle Background Glow & Network Lines */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Slide Header */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold font-mono border border-blue-400/30">
                {currentSlide.badge}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Folie {currentSlide.slideNumber} / 12
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              {currentSlide.title}
            </h1>
            <p className="text-sm md:text-lg text-amber-400 font-medium mt-1">
              {currentSlide.subtitle}
            </p>
          </div>

          {/* Slide Body */}
          <div className="relative z-10 my-4 space-y-3">
            {currentSlide.bullets.map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-2 shrink-0 shadow-sm shadow-blue-400" />
                <span className="text-sm md:text-lg text-slate-200 leading-relaxed font-sans">
                  {bullet}
                </span>
              </div>
            ))}
          </div>

          {/* Slide Footer */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div>FISI Umschulung &bull; Comcave</div>
            <div className="text-slate-300 font-medium">Team: Patrick, Bastian, Issa, Thomas, Adem</div>
            <div>OSI-Modell 720p</div>
          </div>
        </div>

        {/* Thumbnail Selector */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-2">
          {slides.map((s, idx) => (
            <button
              key={s.slideNumber}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`p-1.5 rounded-lg border text-center transition-all ${
                currentSlideIndex === idx
                  ? 'bg-blue-600 text-white border-blue-400 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="text-[10px] font-mono">F{s.slideNumber}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Technical 720p Specifications & FFmpeg Command */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Technical Specs Table */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Video className="w-4 h-4 text-emerald-400" />
            Technische Vorgaben für 720p Export
          </h3>

          <div className="overflow-hidden rounded-lg border border-slate-800 text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px]">
                <tr>
                  <th className="p-2.5">Einstellung</th>
                  <th className="p-2.5">Sollwert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                <tr>
                  <td className="p-2.5 text-slate-400">Auflösung</td>
                  <td className="p-2.5 text-white font-bold">{TECHNICAL_SPEC_720P.resolution}</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-slate-400">Seitenverhältnis</td>
                  <td className="p-2.5 text-amber-400 font-bold">{TECHNICAL_SPEC_720P.aspectRatio}</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-slate-400">Framerate</td>
                  <td className="p-2.5">{TECHNICAL_SPEC_720P.fps} fps</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-slate-400">Codec & Container</td>
                  <td className="p-2.5">{TECHNICAL_SPEC_720P.codec} ({TECHNICAL_SPEC_720P.container})</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-slate-400">Audio</td>
                  <td className="p-2.5">{TECHNICAL_SPEC_720P.audio}</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-slate-400">Ziel-Lautstärke</td>
                  <td className="p-2.5">{TECHNICAL_SPEC_720P.targetLoudness}</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-slate-400">Video-Bitrate</td>
                  <td className="p-2.5">{TECHNICAL_SPEC_720P.videoBitrate}</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-slate-400">Max. Gesamtlänge</td>
                  <td className="p-2.5 text-emerald-400 font-bold">{TECHNICAL_SPEC_720P.maxDuration}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FFmpeg Generator */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              FFmpeg 720p Encoding-Befehl
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <label className="text-slate-400 font-mono">CRF: {crf}</label>
              <input
                type="range"
                min={16}
                max={26}
                value={crf}
                onChange={(e) => setCrf(Number(e.target.value))}
                className="w-20 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="relative">
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 leading-relaxed overflow-x-auto">
              {ffmpegCommand}
            </pre>
            <button
              type="button"
              onClick={handleCopyFfmpeg}
              className="absolute top-3 right-3 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 shadow"
            >
              {copiedFfmpeg ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kopiert!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Befehl kopieren</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Dieser Befehl skaliert das Rohmaterial sauber auf 1280&times;720, nutzt libx264 für maximale Kompatibilität mit Standard-Playern
            und setzt <code className="text-cyan-300 font-mono">-movflags +faststart</code> für sofortigen Web-Start.
          </p>
        </div>
      </div>

      {/* 3. Pre-Export Quality Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            Qualitätscheckliste vor dem Export
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {Object.values(checkedItems).filter(Boolean).length} von {checklistItems.length} abgehakt
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {checklistItems.map((item, idx) => {
            const isChecked = !!checkedItems[idx];
            return (
              <label
                key={idx}
                className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-all select-none ${
                  isChecked
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleChecklist(idx)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <span>{item}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Studio Shotlist & Setup Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="font-semibold text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-400" />
            Kamera 1 (Hauptkamera)
          </div>
          <p className="text-slate-400 leading-relaxed">
            Stativ verwenden. Halbnahe Einstellung. Sprecher blickt direkt ins Objektiv. Fester Ausschnitt ohne wilde Schwenks.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="font-semibold text-white flex items-center gap-2">
            <Mic className="w-4 h-4 text-amber-400" />
            Mikrofon & Akustik
          </div>
          <p className="text-slate-400 leading-relaxed">
            Ansteckmikrofon oder Richtmikrofon (Abstand 20–30 cm). Raumhall dämpfen. Keine Musik während des Sprechens.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="font-semibold text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-yellow-400" />
            Ausleuchtung
          </div>
          <p className="text-slate-400 leading-relaxed">
            Weiches LED-Licht oder Tageslicht von vorne. Starkes Gegenlicht vermeiden. Gesicht schattenfrei ausleuchten.
          </p>
        </div>
      </div>
    </div>
  );
};
