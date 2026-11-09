import React, { useState } from 'react';
import { Layers, ArrowDown, ArrowUp, Play, Pause, RotateCcw, CheckCircle, Info, ShieldCheck } from 'lucide-react';
import { ENCAPSULATION_STEPS, EncapsulationStep } from '../utils/osiData';

export const EncapsulationVisualizerTab: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [direction, setDirection] = useState<'down' | 'up'>('down'); // down = Kapselung (Sender), up = Entkapselung (Empfänger)
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const steps = ENCAPSULATION_STEPS;
  const currentStep = steps[currentStepIndex];

  // Auto-play timer
  React.useEffect(() => {
    let interval: any = null;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (direction === 'down') {
            if (prev >= steps.length - 1) {
              setDirection('up');
              return steps.length - 1;
            }
            return prev + 1;
          } else {
            if (prev <= 0) {
              setDirection('down');
              return 0;
            }
            return prev - 1;
          }
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, direction, steps.length]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Praxisbeispiel: Kapselung & Entkapselung
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Praxis-Demonstration (09:18–11:48)
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl">
            Jede Schicht erbringt einen Dienst und hängt ihr eigenes Etikett (Header/Trailer) an.
            Die untere Schicht muss nicht wissen, was sich in den Nutzdaten befindet.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setDirection(direction === 'down' ? 'up' : 'down');
            }}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-all"
          >
            {direction === 'down' ? (
              <>
                <ArrowDown className="w-4 h-4 text-emerald-400" />
                <span>Modus: Kapselung (Sender)</span>
              </>
            ) : (
              <>
                <ArrowUp className="w-4 h-4 text-cyan-400" />
                <span>Modus: Entkapselung (Empfänger)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow ${
              isAutoPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isAutoPlaying ? 'Pause' : 'Auto-Play'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentStepIndex(0);
              setDirection('down');
            }}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            title="Zurücksetzen"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="grid grid-cols-5 gap-2">
        {steps.map((st, i) => {
          const isActive = currentStepIndex === i;
          return (
            <button
              key={st.step}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentStepIndex(i);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-md ring-1 ring-blue-500/50'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                <span>Schritt {st.step}</span>
                <span className="font-bold">L{st.layerNumber}</span>
              </div>
              <div className="font-bold text-xs truncate">{st.pduName}</div>
            </button>
          );
        })}
      </div>

      {/* Interactive Visual Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Packet Inspector Display */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                {currentStep.layerName}
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                PDU: <span className="text-amber-400">{currentStep.pduName}</span>
              </h3>
            </div>
            <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300 font-mono">
              Schritt {currentStepIndex + 1} von {steps.length}
            </div>
          </div>

          {/* Visual Packet Frame Container */}
          <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="text-xs text-slate-400 font-medium">
              Aufbau der Datenübertragung auf dieser Schicht:
            </div>

            {/* Visual Header Nested Boxes */}
            <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-slate-950 rounded-xl border border-slate-800/80">
              {/* Layer 2 MAC Header (if step >= 4) */}
              {currentStepIndex >= 3 && (
                <div className="p-2.5 rounded-lg bg-blue-950 border border-blue-500/60 text-blue-200 text-xs font-mono text-center animate-fade-in shadow">
                  <div className="text-[10px] text-blue-400 uppercase font-bold">L2 MAC-Header</div>
                  <div className="text-[11px] font-semibold">Src / Dst MAC (48-bit)</div>
                </div>
              )}

              {/* Layer 3 IP Header (if step >= 3) */}
              {currentStepIndex >= 2 && (
                <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-500/60 text-cyan-200 text-xs font-mono text-center animate-fade-in shadow">
                  <div className="text-[10px] text-cyan-400 uppercase font-bold">L3 IP-Header</div>
                  <div className="text-[11px] font-semibold">Src/Dst IP (32-bit / 128-bit)</div>
                </div>
              )}

              {/* Layer 4 TCP Header (if step >= 2) */}
              {currentStepIndex >= 1 && (
                <div className="p-2.5 rounded-lg bg-emerald-950 border border-emerald-500/60 text-emerald-200 text-xs font-mono text-center animate-fade-in shadow">
                  <div className="text-[10px] text-emerald-400 uppercase font-bold">L4 TCP-Header</div>
                  <div className="text-[11px] font-semibold">Ports: 54321 → 443</div>
                </div>
              )}

              {/* Layer 7 User Data (Always present) */}
              <div className="p-3 rounded-lg bg-red-950 border border-red-500/80 text-red-200 text-xs font-mono text-center shadow-lg">
                <div className="text-[10px] text-red-400 uppercase font-bold">L7 Nutzlast (Payload)</div>
                <div className="font-semibold text-white">GET /index.html HTTP/1.1</div>
              </div>

              {/* Layer 2 CRC Trailer (if step >= 4) */}
              {currentStepIndex >= 3 && (
                <div className="p-2.5 rounded-lg bg-blue-950 border border-blue-500/60 text-blue-200 text-xs font-mono text-center animate-fade-in shadow">
                  <div className="text-[10px] text-blue-400 uppercase font-bold">L2 FCS Trailer</div>
                  <div className="text-[11px] font-semibold">CRC32 Prüfsumme</div>
                </div>
              )}
            </div>

            {/* Layer 1 Bits representation if step 5 */}
            {currentStepIndex === 4 && (
              <div className="p-4 rounded-lg bg-purple-950/60 border border-purple-500/50 space-y-1.5">
                <div className="text-xs font-bold text-purple-300 flex items-center justify-between">
                  <span>Schicht 1: Rohes Bitmuster auf dem physikalischen Medium</span>
                  <span className="font-mono text-[10px]">1000BASE-T / Glasfaser</span>
                </div>
                <div className="p-2.5 bg-black rounded font-mono text-xs text-purple-400 break-all leading-relaxed">
                  01000111 01000101 01010100 00100000 00101111 01101001 01101110 01100100 01100101 01111000 00101110 01101000 01110100 01101101 01101100
                </div>
              </div>
            )}
          </div>

          {/* Explanation Quote from Script */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              Erklärung aus dem Fachvortrag:
            </div>
            <p className="text-sm text-slate-200 leading-relaxed italic">
              „{currentStep.explanation}“
            </p>
            <div className="text-xs text-slate-400">
              Header-Inhalt: <code className="text-cyan-300 font-mono">{currentStep.addedHeader}</code>
            </div>
          </div>
        </div>

        {/* Right: IHK Rule & Encapsulation Guide */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              IHK-Prüfungsregeln zur Kapselung
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-white text-xs">1. Isolation der Schichten</div>
                <p className="text-slate-400 leading-relaxed">
                  Schicht 1–4 weiß nicht, ob oben Webseiten (HTTP), Mails (SMTP) oder Dateien (FTP) laufen.
                  Jede Schicht hängt nur ihr eigenes Etikett an.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-white text-xs">2. PDU Bezeichnungen kennen</div>
                <ul className="text-slate-400 space-y-1 list-disc pl-4">
                  <li>L7–5: <strong>Daten / Data</strong></li>
                  <li>L4: <strong>Segment</strong> (TCP) / Datagramm (UDP)</li>
                  <li>L3: <strong>Paket / Packet</strong></li>
                  <li>L2: <strong>Frame / Rahmen</strong></li>
                  <li>L1: <strong>Bits</strong></li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-white text-xs">3. Entkapselung beim Empfänger</div>
                <p className="text-slate-400 leading-relaxed">
                  Der Empfänger verarbeitet die Nachricht in umgekehrter Reihenfolge von Layer 1 zu Layer 7.
                  Jede Schicht prüft und entfernt ihren Header.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
