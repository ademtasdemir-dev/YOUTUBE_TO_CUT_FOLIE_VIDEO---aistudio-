/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Mic, Volume2, Play, Pause, Download, Copy, Check, Sparkles, 
  Sliders, Code, Terminal, AlertCircle, FileAudio, BookOpen, 
  CheckCircle2, Wand2, RefreshCw, ChevronDown, ChevronUp, Layers, HelpCircle
} from 'lucide-react';
import { CARTESIA_VOICE_PRESETS, CartesiaVoiceConfig, PresentationScene } from '../utils/osiData';
import { optimizeForCartesiaSonic, CartesiaOptimizationResult } from '../utils/frameDecomposer';

interface CartesiaStudioTabProps {
  currentScenes: PresentationScene[];
  selectedScene?: PresentationScene | null;
  initialTranscriptText?: string;
}

export const CartesiaStudioTab: React.FC<CartesiaStudioTabProps> = ({
  currentScenes,
  selectedScene: initialSelectedScene,
  initialTranscriptText
}) => {
  const [activeScene, setActiveScene] = useState<PresentationScene>(
    initialSelectedScene || currentScenes[1] || currentScenes[0]
  );
  const [selectedVoice, setSelectedVoice] = useState<CartesiaVoiceConfig>(
    CARTESIA_VOICE_PRESETS[0]
  );
  const [selectedModel, setSelectedModel] = useState<'sonic-3.5' | 'sonic-3.6' | 'sonic-multilingual'>('sonic-3.5');
  const [speed, setSpeed] = useState<number>(1.0);
  const [emotion, setEmotion] = useState<string>('calm, professional');
  const [scriptText, setScriptText] = useState<string>(
    initialTranscriptText || (activeScene ? activeScene.scriptText : '')
  );

  // Cartesia Sonic Options
  const [autoSpellAcronyms, setAutoSpellAcronyms] = useState<boolean>(true);
  const [addBreakTags, setAddBreakTags] = useState<boolean>(false);
  const [breakMs, setBreakMs] = useState<number>(300);
  const [insertSonic36Fillers, setInsertSonic36Fillers] = useState<boolean>(false);
  const [showGuidelinesDrawer, setShowGuidelinesDrawer] = useState<boolean>(false);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);

  // Compute Cartesia Optimization Result dynamically
  const optimization: CartesiaOptimizationResult = optimizeForCartesiaSonic(scriptText, {
    model: selectedModel,
    autoSpellAcronyms,
    addBreakTags,
    breakDurationMs: breakMs,
    insertSonic36Fillers,
    speedRatio: speed
  });

  // When scene prop changes
  useEffect(() => {
    if (initialTranscriptText) {
      setScriptText(initialTranscriptText);
    } else if (activeScene) {
      setScriptText(activeScene.scriptText);
    }
  }, [activeScene, initialTranscriptText]);

  const handleSceneChange = (scene: PresentationScene) => {
    setActiveScene(scene);
    setScriptText(scene.scriptText);
    setGeneratedAudioUrl(null);
    setAudioNotice(null);
  };

  const handleApplyOptimization = () => {
    setScriptText(optimization.optimizedText);
  };

  const handleTestAudio = async () => {
    if (isPlaying) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsGeneratingAudio(true);
    setAudioNotice(null);

    const textToSynthesize = optimization.optimizedText.replace(/<[^>]+>/g, ' '); // Strip XML tags for browser fallback

    try {
      const response = await fetch('/api/cartesia-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: textToSynthesize,
          voiceId: selectedVoice.id,
          model: selectedModel === 'sonic-3.6' ? 'sonic-3.6' : 'sonic-multilingual',
          speed: speed,
          emotion: emotion
        })
      });

      const data = await response.json();

      if (data.success && data.audioData) {
        const audioUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioData}`;
        setGeneratedAudioUrl(audioUrl);
        const audio = new Audio(audioUrl);
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);
        await audio.play();
        setAudioNotice(data.note || 'Audio erfolgreich über Cartesia/TTS synthetisiert.');
      } else {
        // Fallback to browser SpeechSynthesis
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(textToSynthesize);
          utterance.lang = 'de-DE';
          utterance.rate = speed;
          utterance.onstart = () => setIsPlaying(true);
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
          setAudioNotice('Lokale Browser-Sprachsynthese aktiv (Rehearsal-Modus).');
        } else {
          setAudioNotice(data.message || 'Audiosynthese abgeschlossen.');
        }
      }
    } catch (err: any) {
      console.warn('Cartesia TTS call warning:', err);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(textToSynthesize);
        utterance.lang = 'de-DE';
        utterance.rate = speed;
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      }
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-800/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 shadow-sm">
                <Mic className="w-3.5 h-3.5 text-amber-400" />
                Cartesia Sonic 3.5 & 3.6 Studio • sonic-multilingual
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Score: {optimization.complianceScore}% Regelkonform
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Cartesia Text-to-Speech Prompt Studio & Optimierer
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Erstelle natürlich klingende Sprachausgaben mit minimalem Prompt-Engineering basierend auf den offiziellen Best Practices des Cartesia Teams (vollständige Sätze, Satzzeichen, Akronym-Spelling mit &lt;spell&gt;, Sprechpausen und Sonic 3.6 Sprechunflüssigkeiten).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGuidelinesDrawer(!showGuidelinesDrawer)}
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Cartesia Team Richtlinien</span>
              {showGuidelinesDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Cartesia Team Guidelines Drawer (Accurate reproduction of official docs provided in prompt) */}
      {showGuidelinesDrawer && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4 text-xs text-slate-300 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Offizielle Empfehlungen des Cartesia-Teams (Sonic 3.5 & Sonic 3.6)</span>
            </h3>
            <span className="font-mono text-amber-400 text-[11px]">Minimales Prompt-Engineering</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-amber-300">1. Vollständige Sätze & Satzzeichen</span>
              <p className="text-slate-300 leading-relaxed">
                Vollständige Sätze mit normaler Groß- und Kleinschreibung sowie Satzzeichen sorgen für den besten Rhythmus und Intonation. Jedes Transkript MUSS mit einem Satzzeichen abschließen (., ?, !). Keine isolierten Fragmente.
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-amber-300">2. Groß-/Kleinschreibung (Capitalization)</span>
              <p className="text-slate-300 leading-relaxed">
                Großbuchstaben nur für Akronyme, die Buchstabe für Buchstabe vorgelesen werden sollen (z.B. USA, OSI, TCP, UDP). Keine Großschreibung zur Lautstärke-Hervorhebung oder zum Schreien.
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-amber-300">3. Codes & IDs mit &lt;spell&gt; auslesen</span>
              <p className="text-slate-300 leading-relaxed">
                Bestätigungscodes, Seriennummern oder IDs in &lt;spell&gt;...&lt;/spell&gt; einschließen: <code className="text-amber-300">&lt;spell&gt;ABC123&lt;/spell&gt;</code> oder durch Leerzeichen trennen (<code className="text-amber-300">A B C, 1 2 3</code>). Keine Punkte zwischen Buchstaben!
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-amber-300">4. Zahlen, Daten, Symbole unverändert</span>
              <p className="text-slate-300 leading-relaxed">
                Sonic wandelt Zahlen (1,234,567), Währungen ($19.99), Uhrzeiten (7:00 PM), Datumsangaben (04/20/2025) und E-Mails automatisch um. Aufwändige manuelle Vorverarbeitung schadet der Qualität.
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-amber-300">5. Pausen & &lt;break&gt;-Tags</span>
              <p className="text-slate-300 leading-relaxed">
                Natürliche Satzzeichen (Komma, Punkt) erzeugen im Kontext die beste Pause. Für explizite Stille: <code className="text-amber-300">&lt;break time="500ms"/&gt;</code>. Niemals mehrere Break-Tags schnell hintereinander setzen!
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-amber-300">6. Sprechunflüssigkeiten (Sonic 3.6)</span>
              <p className="text-slate-300 leading-relaxed">
                Simulation natürlicher Sprechpausen beim Nachdenken mit Füllwörtern in Standard-Schreibweise durch Kommas abgetrennt: <code className="text-amber-300">uh, um, hmm</code> (z.B. „It's on, uh, Fifth Street I think.“).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Controls & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Configuration & Transcript Editor */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Scene / Segment Picker */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Segment / Szene auswählen ({currentScenes.length} verfügbar)
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {currentScenes.map((scene, idx) => {
                const isSelected = activeScene?.id === scene.id;
                return (
                  <button
                    key={scene.id || idx}
                    type="button"
                    onClick={() => handleSceneChange(scene)}
                    className={`px-3 py-2 rounded-xl text-left border shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 text-white border-amber-500/60 shadow-md ring-1 ring-amber-500/40'
                        : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-amber-400 font-bold">
                      #{idx} &bull; {scene.timeStart}
                    </div>
                    <div className="text-xs font-semibold text-white truncate max-w-[150px]">
                      {scene.speaker}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                      {scene.speakerRole}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Model & Voice Presets */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Cartesia Sonic Modell & Stimme wählen
              </label>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                {(['sonic-3.5', 'sonic-3.6', 'sonic-multilingual'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedModel(m)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                      selectedModel === m ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CARTESIA_VOICE_PRESETS.map((voice) => {
                const isSelected = selectedVoice.id === voice.id;
                return (
                  <button
                    key={voice.id}
                    type="button"
                    onClick={() => setSelectedVoice(voice)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-md'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">
                        {voice.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                        {voice.recommendedRole}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {voice.description}
                    </p>
                    <span className="text-[9px] font-mono text-slate-500 block mt-1">
                      ID: {voice.id.substring(0, 18)}...
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Sonic Parameters & Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              3. Cartesia Sonic Feineinstellungen & Optimierer
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Sprechtempo (Speed Tag):</span>
                  <span className="text-amber-400 font-mono font-bold">{speed}x</span>
                </div>
                <input
                  type="range"
                  min={0.7}
                  max={1.3}
                  step={0.05}
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-[10px] text-slate-500 font-mono">Empfohlen: 1.0x (120–140 WPM)</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Emotion & Tonalität:
                </label>
                <select
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="calm, professional">Calm & Professional (Standard)</option>
                  <option value="confident, authoritative">Confident & Authoritative (Prüfung)</option>
                  <option value="measured, articulate">Measured & Articulate (Präzise)</option>
                  <option value="energetic, technical">Energetic & Technical (Dynamisch)</option>
                </select>
              </div>
            </div>

            {/* Checkbox Options for Cartesia Rules */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSpellAcronyms}
                  onChange={(e) => setAutoSpellAcronyms(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-slate-300 text-[11px]">&lt;spell&gt; für Akronyme</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addBreakTags}
                  onChange={(e) => setAddBreakTags(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-slate-300 text-[11px]">&lt;break&gt; Pausen (300ms)</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={insertSonic36Fillers}
                  onChange={(e) => setInsertSonic36Fillers(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-slate-300 text-[11px]">Sonic 3.6 Füllwörter (uh, um)</span>
              </label>
            </div>
          </div>

          {/* 4. Transcript Editor & 1-Click Optimizer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                4. Transkript für Cartesia Sonic
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyOptimization}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  title="Wendet die geprüften Cartesia-Regeln direkt auf das Eingabefeld an"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>1-Klick Optimieren</span>
                </button>
                <span className="text-[11px] font-mono text-slate-400">
                  {scriptText.split(/\s+/).filter(Boolean).length} Wörter
                </span>
              </div>
            </div>

            <textarea
              rows={5}
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="Füge hier dein Transkript ein..."
            />

            {/* Live Audio Test Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleTestAudio}
                disabled={isGeneratingAudio}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAudio ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 fill-slate-950" />
                )}
                <span>
                  {isGeneratingAudio
                    ? 'Cartesia Audio rendert...'
                    : isPlaying
                    ? 'Wiedergabe stoppen'
                    : 'Cartesia Stimme anhören (Audition)'}
                </span>
              </button>

              {generatedAudioUrl && (
                <a
                  href={generatedAudioUrl}
                  download={`cartesia_${selectedVoice.id}_segment.wav`}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>WAV herunterladen</span>
                </a>
              )}
            </div>

            {audioNotice && (
              <p className="text-[11px] font-mono text-amber-400/90 pt-1">
                {audioNotice}
              </p>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Live Rule Audits & Code Requests */}
        <div className="lg:col-span-5 space-y-6">
          {/* Rule Compliance Checklist Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Cartesia Regel-Audit</span>
              </h3>
              <span className="text-xs font-mono font-bold text-amber-400">
                {optimization.complianceScore}%
              </span>
            </div>

            <div className="space-y-2">
              {optimization.ruleAudits.map((audit, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{audit.rule}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                      audit.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {audit.passed ? 'Bestanden' : 'Prüfen'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{audit.detail}</p>
                </div>
              ))}
            </div>

            {optimization.acronymsDetected.length > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Erkannte IT-Akronyme:</span>
                <div className="flex flex-wrap gap-1">
                  {optimization.acronymsDetected.map((a, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* cURL API Request Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Cartesia cURL Request</span>
              </h4>
              <button
                type="button"
                onClick={() => copyToClipboard(optimization.sampleCurl, 'curl')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedCode === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Kopieren</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-xl text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-800/80 leading-relaxed max-h-48">
              {optimization.sampleCurl}
            </pre>
          </div>

          {/* Voice Agent System Prompt Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>Voice Agent System Prompt</span>
              </h4>
              <button
                type="button"
                onClick={() => copyToClipboard(optimization.voiceAgentSystemPrompt, 'system-prompt')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedCode === 'system-prompt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Prompt kopieren</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Offizielle Vorlage für LLMs, damit alle Antworten direkt ohne manuelle Nachbearbeitung für Cartesia Sonic formatiert sind.
            </p>
            <pre className="p-3 bg-slate-950 rounded-xl text-[10px] font-mono text-cyan-300/90 overflow-x-auto border border-slate-800/80 leading-relaxed max-h-40">
              {optimization.voiceAgentSystemPrompt.substring(0, 320)}...
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
