import React, { useState } from 'react';
import { Mic, Volume2, Play, Pause, Download, Copy, Check, Sparkles, Sliders, Code, Terminal, AlertCircle, FileAudio } from 'lucide-react';
import { CARTESIA_VOICE_PRESETS, CartesiaVoiceConfig, PresentationScene, buildCartesiaPrompt } from '../utils/osiData';

interface CartesiaStudioTabProps {
  currentScenes: PresentationScene[];
  selectedScene?: PresentationScene | null;
}

export const CartesiaStudioTab: React.FC<CartesiaStudioTabProps> = ({
  currentScenes,
  selectedScene: initialSelectedScene
}) => {
  const [activeScene, setActiveScene] = useState<PresentationScene>(
    initialSelectedScene || currentScenes[1] || currentScenes[0]
  );
  const [selectedVoice, setSelectedVoice] = useState<CartesiaVoiceConfig>(
    CARTESIA_VOICE_PRESETS.find(v => v.recommendedRole.toLowerCase().includes(activeScene.speaker.toLowerCase())) || CARTESIA_VOICE_PRESETS[0]
  );
  const [speed, setSpeed] = useState<number>(1.0);
  const [emotion, setEmotion] = useState<string>('calm, professional');
  const [scriptText, setScriptText] = useState<string>(activeScene.scriptText);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);

  // Update text and voice when scene changes
  const handleSceneChange = (scene: PresentationScene) => {
    setActiveScene(scene);
    setScriptText(scene.scriptText);
    const matchedVoice = CARTESIA_VOICE_PRESETS.find(v => v.recommendedRole.toLowerCase().includes(scene.speaker.toLowerCase())) || CARTESIA_VOICE_PRESETS[0];
    setSelectedVoice(matchedVoice);
    setGeneratedAudioUrl(null);
    setAudioNotice(null);
  };

  const cartesiaPrompt = buildCartesiaPrompt(
    activeScene.speaker,
    scriptText,
    selectedVoice,
    speed,
    emotion
  );

  const handleTestAudio = async () => {
    if (isPlaying) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsGeneratingAudio(true);
    setAudioNotice(null);

    try {
      const response = await fetch('/api/cartesia-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: cartesiaPrompt.cleanScript,
          voiceId: selectedVoice.id,
          model: 'sonic-multilingual',
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
          const utterance = new SpeechSynthesisUtterance(cartesiaPrompt.cleanScript);
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
        const utterance = new SpeechSynthesisUtterance(cartesiaPrompt.cleanScript);
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

  const pythonCode = `import requests

url = "https://api.cartesia.ai/tts/bytes"
headers = {
    "X-API-Key": "DEIN_CARTESIA_API_KEY",
    "Cartesia-Version": "2024-06-10",
    "Content-Type": "application/json"
}
payload = {
    "model_id": "sonic-multilingual",
    "transcript": """${cartesiaPrompt.cleanScript}""",
    "voice": {
        "mode": "id",
        "id": "${selectedVoice.id}",
        "__experimental_controls": {
            "speed": ${speed},
            "emotion": ["${emotion}"]
        }
    },
    "output_format": {
        "container": "wav",
        "sample_rate": 24000,
        "encoding": "pcm_s16le"
    },
    "language": "de"
}

response = requests.post(url, headers=headers, json=payload)
with open("scene_${activeScene.sceneNumber}_${activeScene.speaker.toLowerCase()}.wav", "wb") as f:
    f.write(response.content)
print("Cartesia Audio erfolgreich gespeichert!")`;

  const nodeCode = `import fs from "fs";

const response = await fetch("https://api.cartesia.ai/tts/bytes", {
  method: "POST",
  headers: {
    "X-API-Key": process.env.CARTESIA_API_KEY,
    "Cartesia-Version": "2024-06-10",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model_id: "sonic-multilingual",
    transcript: \`${cartesiaPrompt.cleanScript.replace(/`/g, '\\`')}\`,
    voice: {
      mode: "id",
      id: "${selectedVoice.id}",
      __experimental_controls: {
        speed: ${speed},
        emotion: ["${emotion}"]
      }
    },
    output_format: {
      container: "wav",
      sample_rate: 24000,
      encoding: "pcm_s16le"
    },
    language: "de"
  })
});

const buffer = await response.arrayBuffer();
fs.writeFileSync("scene_${activeScene.sceneNumber}_${activeScene.speaker.toLowerCase()}.wav", Buffer.from(buffer));
console.log("Audio gespeichert!");`;

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/60 border border-amber-500/30 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-400/30">
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              Cartesia Sonic TTS Studio &bull; sonic-multilingual
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Cartesia Text-to-Speech Stimmen & Prompt-Generator
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Erstelle professionelle deutsche Sprachausgaben für jedes Segment deiner Präsentation.
              Optimierte Transkripte mit Akronym-Aussprache und ansprechbaren Cartesia Sonic Voice IDs.
            </p>
          </div>
          <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-right">
            <div className="text-xs text-slate-400">Cartesia Engine</div>
            <div className="text-sm font-bold text-amber-400 font-mono">Sonic Multilingual</div>
            <div className="text-[11px] text-slate-500">24 kHz WAV PCM</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Voice & Scene Selection & Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Segment Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              1. Segment auswählen ({currentScenes.length} verfügbar)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {currentScenes.map((scene) => {
                const isSelected = activeScene.id === scene.id;
                return (
                  <button
                    key={scene.id}
                    onClick={() => handleSceneChange(scene)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-white font-semibold ring-1 ring-amber-500/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-mono text-[10px] text-slate-500 mb-0.5">#{scene.sceneNumber} &bull; {scene.timeStart}</div>
                    <div className="truncate font-medium">{scene.speaker}</div>
                    <div className="text-[10px] text-slate-400 truncate">{scene.speakerRole}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Profile Picker */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block flex items-center justify-between">
              <span>2. Cartesia Sonic Stimme wählen</span>
              <span className="font-mono text-[11px] text-amber-400">German Sonic Profiles</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CARTESIA_VOICE_PRESETS.map((voice) => {
                const isSelected = selectedVoice.id === voice.id;
                return (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200">{voice.name.split('–')[1] || voice.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-[10px] font-mono text-slate-400">
                        {voice.recommendedRole}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{voice.description}</p>
                    <div className="font-mono text-[9px] text-slate-500 mt-2 truncate">ID: {voice.id}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Speech Controls: Speed & Emotion */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              3. Cartesia Sprach-Parameter & Controls
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                  <span>Sprechgeschwindigkeit (Speed):</span>
                  <span className="font-mono text-amber-400 font-bold">{speed}x</span>
                </div>
                <input
                  type="range"
                  min={0.8}
                  max={1.4}
                  step={0.05}
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block mt-1">Empfohlen für IHK-Vortrag: 1.0x (120–140 WPM)</span>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Emotion & Stil:</label>
                <select
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="calm, professional">Calm & Professional (Standard)</option>
                  <option value="confident, authoritative">Confident & Authoritative (Prüfung)</option>
                  <option value="measured, articulate">Measured & Articulate (Präzise)</option>
                  <option value="energetic, technical">Energetic & Technical (Dynamisch)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transcript Editor with Pronunciation Tips */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                4. Transkript für Cartesia TTS
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {cartesiaPrompt.cleanScript.split(/\s+/).filter(Boolean).length} Wörter
              </span>
            </div>

            <textarea
              rows={5}
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs md:text-sm text-slate-200 font-sans focus:outline-none focus:border-amber-500 leading-relaxed"
            />

            {/* Pronunciation guide */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 text-xs">Phonetische Aussprachehinweise für Cartesia Sonic:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[10px] font-mono text-amber-300/80">
                <span>&bull; OSI = O-S-I</span>
                <span>&bull; TCP = T-C-P</span>
                <span>&bull; UDP = U-D-P</span>
                <span>&bull; MAC = Mäck</span>
              </div>
            </div>

            {/* Audition Trigger */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                disabled={isGeneratingAudio}
                onClick={handleTestAudio}
                className="py-3 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                {isGeneratingAudio ? (
                  <>
                    <Volume2 className="w-4 h-4 animate-spin" />
                    <span>Generiere Cartesia Audio...</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Wiedergabe stoppen</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Cartesia Stimme anhören (Audition)</span>
                  </>
                )}
              </button>

              {generatedAudioUrl && (
                <a
                  href={generatedAudioUrl}
                  download={`Cartesia_${activeScene.speaker}_${activeScene.sceneNumber}.wav`}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>WAV Datei herunterladen</span>
                </a>
              )}
            </div>

            {audioNotice && (
              <p className="text-xs text-amber-300/90 pt-1 italic">{audioNotice}</p>
            )}
          </div>
        </div>

        {/* Right: Export Ready Code & API Payloads */}
        <div className="lg:col-span-5 space-y-6">
          {/* Cartesia cURL & REST Request */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Cartesia cURL API Request
              </h3>
              <button
                type="button"
                onClick={() => copyToClipboard(cartesiaPrompt.sampleCurlCommand, 'curl')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
              >
                {copiedCode === 'curl' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Kopiert!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopieren</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 leading-relaxed overflow-x-auto max-h-56">
              {cartesiaPrompt.sampleCurlCommand}
            </pre>
          </div>

          {/* Node.js / Python Code Snippets */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                Python / Node.js Integration
              </h3>
              <button
                type="button"
                onClick={() => copyToClipboard(pythonCode, 'python')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
              >
                {copiedCode === 'python' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Kopiert!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Python kopieren</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 leading-relaxed overflow-x-auto max-h-56">
              {pythonCode}
            </pre>
          </div>

          {/* Batch Export Overview for All Scenes */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <FileAudio className="w-4 h-4 text-amber-400" />
                Batch Voice Map ({currentScenes.length} Segmente)
              </h4>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {currentScenes.map((scene) => {
                const voice = CARTESIA_VOICE_PRESETS.find(v => v.recommendedRole.toLowerCase().includes(scene.speaker.toLowerCase())) || CARTESIA_VOICE_PRESETS[0];
                return (
                  <div
                    key={scene.id}
                    className="p-2 rounded bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div className="truncate">
                      <span className="font-bold text-white">#{scene.sceneNumber} {scene.speaker}</span>
                      <span className="text-slate-400 text-[11px] ml-1">({scene.durationSeconds}s)</span>
                    </div>
                    <span className="font-mono text-[10px] text-amber-400 shrink-0">
                      {voice.name.split('–')[1] || voice.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
