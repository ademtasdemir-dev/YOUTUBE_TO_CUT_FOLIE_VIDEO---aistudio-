import React, { useState } from 'react';
import { Wrench, CheckCircle2, AlertTriangle, Terminal, Search, ShieldCheck, ChevronRight } from 'lucide-react';
import { OSI_LAYERS } from '../utils/osiData';

interface TroubleshootingScenario {
  id: string;
  symptom: string;
  expectedLayer: number;
  explanation: string;
  solution: string;
  command: string;
}

const SCENARIOS: TroubleshootingScenario[] = [
  {
    id: 's1',
    symptom: '„Network Cable Unplugged“ / Switch-Port LED leuchtet nicht',
    expectedLayer: 1,
    explanation: 'Ein klassischer Physical-Layer-Fehler. Es gibt kein elektrisches oder optisches Signal.',
    solution: 'Patchkabel austauschen, Port am Patchpanel prüfen, Link-Status am Switch prüfen.',
    command: 'ethtool eth0 / show interfaces status'
  },
  {
    id: 's2',
    symptom: '„Destination Host Unreachable“ im gleichen Subnetz, aber Switch ist online',
    expectedLayer: 2,
    explanation: 'Layer 2 (Data Link). Die MAC-Adresse des Zielgeräts kann im lokalen Netz nicht über ARP aufgelöst werden oder VLAN ist falsch konfiguriert.',
    solution: 'ARP-Cache überprüfen, VLAN-Zugehörigkeit des Switchports kontrollieren, Port-Security prüfen.',
    command: 'arp -a / show mac address-table'
  },
  {
    id: 's3',
    symptom: 'Lokale PCs können einander pingen, aber keine Internet-IP (z.B. 8.8.8.8) erreichbar',
    expectedLayer: 3,
    explanation: 'Layer 3 (Network). Das Standard-Gateway (Default Gateway) fehlt oder ist falsch eingetragen, oder Router-Routing ist gestört.',
    solution: 'Default Gateway in IP-Konfiguration prüfen, Routing-Tabelle analysieren, Next-Hop Router prüfen.',
    command: 'ip route show / traceroute 8.8.8.8'
  },
  {
    id: 's4',
    symptom: 'Ping auf den Webserver funktioniert, aber Website lädt nicht („Connection Refused“ auf Port 443)',
    expectedLayer: 4,
    explanation: 'Layer 4 (Transport). Der Port 443 ist nicht geöffnet oder der Dienst lauscht nicht, bzw. Firewall blockiert TCP SYN.',
    solution: 'Portverfügbarkeit mit Telnet oder Test-NetConnection prüfen, lokale Firewall-Regeln prüfen.',
    command: 'Test-NetConnection -ComputerName web.local -Port 443 / netstat -tulpen'
  },
  {
    id: 's5',
    symptom: 'Browser meldet: „SEC_ERROR_EXPIRED_CERTIFICATE“ bei https://intranet.comcave.de',
    expectedLayer: 6,
    explanation: 'Layer 6 (Presentation). Das TLS/SSL-Zertifikat ist abgelaufen oder die Verschlüsselungsparameter stimmen nicht überein.',
    solution: 'SSL/TLS-Zertifikat auf dem Webserver erneuern, Systemzeit des Clients überprüfen.',
    command: 'openssl s_client -connect intranet.comcave.de:443'
  },
  {
    id: 's6',
    symptom: 'IP-Adresse 142.250.185.206 lässt sich im Browser öffnen, aber www.google.com schlägt fehl',
    expectedLayer: 7,
    explanation: 'Layer 7 (Application). DNS-Dienst (Domain Name System) funktioniert nicht oder falscher DNS-Server hinterlegt.',
    solution: 'DNS-Server in Netzwerkeinstellungen kontrollieren, DNS-Cache leeren (ipconfig /flushdns).',
    command: 'nslookup www.google.com / dig @8.8.8.8 www.google.com'
  }
];

export const TroubleshootingTab: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<number>(1);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('s1');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState<boolean>(false);

  const activeScenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];
  const activeOSILayer = OSI_LAYERS.find((l) => l.number === selectedLayer) || OSI_LAYERS[6];

  const handleScenarioChange = (scenario: TroubleshootingScenario) => {
    setActiveScenarioId(scenario.id);
    setQuizAnswer(null);
    setShowQuizResult(false);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-400" />
              IHK FISI Troubleshooting-Matrix
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Prüfungsrelevant
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl">
            Strukturiertes Vorgehen von Schicht 1 aufwärts (Bottom-Up-Methode).
            „Wer das OSI-Modell kennt, stochert bei der Fehlersuche nicht im Dunkeln.“
          </p>
        </div>
      </div>

      {/* Layer Checklist (Layers 1 to 7) */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {OSI_LAYERS.slice().reverse().map((layer) => {
          const isSelected = selectedLayer === layer.number;
          return (
            <button
              key={layer.number}
              onClick={() => setSelectedLayer(layer.number)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500/40 shadow-lg'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                <span
                  className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px]"
                  style={{ backgroundColor: layer.color }}
                >
                  {layer.number}
                </span>
                <span className="text-[10px] text-slate-500">L{layer.number}</span>
              </div>
              <div className="font-semibold text-xs truncate">{layer.nameDe}</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{layer.pdu}</div>
            </button>
          );
        })}
      </div>

      {/* Layer Diagnostic Detail Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-3">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ backgroundColor: activeOSILayer.color }}
            >
              {activeOSILayer.number}
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                Schicht {activeOSILayer.number}: {activeOSILayer.nameDe} ({activeOSILayer.nameEn})
              </h3>
              <p className="text-xs text-slate-400">
                PDU: <strong className="text-slate-200">{activeOSILayer.pdu}</strong> &bull; TCP/IP-Pendant: <strong className="text-cyan-300">{activeOSILayer.tcpIpLayer}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {activeOSILayer.devices.map((dev, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[11px]">
                {dev}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs uppercase font-semibold text-amber-400 flex items-center gap-1.5">
              <Search className="w-4 h-4" />
              Checkliste für Fehlersuche (Troubleshooting)
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {activeOSILayer.troubleshootingCheck}
            </p>
            <div className="text-xs text-slate-400 pt-1">
              Typische Protokolle: <span className="font-mono text-blue-300">{activeOSILayer.protocols.join(', ')}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs uppercase font-semibold text-cyan-400 flex items-center gap-1.5">
              <Terminal className="w-4 h-4" />
              Wichtige Diagnose-Tools auf Schicht {activeOSILayer.number}
            </div>
            <div className="space-y-1.5 text-xs font-mono text-slate-300">
              {activeOSILayer.number === 1 && (
                <>
                  <div>&bull; Kabeltester / TDR (Fluke Tester)</div>
                  <div>&bull; Port Link-LED (Amber/Green/Blink)</div>
                  <div>&bull; <code>ethtool &lt;interface&gt;</code> / <code>mii-tool</code></div>
                </>
              )}
              {activeOSILayer.number === 2 && (
                <>
                  <div>&bull; <code>arp -a</code> (ARP-Tabelle anzeigen)</div>
                  <div>&bull; <code>show mac address-table</code> (Cisco Switch)</div>
                  <div>&bull; Wireshark (Ethernet-Frames & FCS CRC Fehler)</div>
                </>
              )}
              {activeOSILayer.number === 3 && (
                <>
                  <div>&bull; <code>ping &lt;IP&gt;</code> (ICMP Echo Request/Reply)</div>
                  <div>&bull; <code>traceroute</code> / <code>tracert</code> (TTL Hop-by-Hop)</div>
                  <div>&bull; <code>ip route show</code> / <code>route print</code></div>
                </>
              )}
              {activeOSILayer.number === 4 && (
                <>
                  <div>&bull; <code>Test-NetConnection -Port 80/443</code></div>
                  <div>&bull; <code>netstat -tulpen</code> (Aktive Listening Ports)</div>
                  <div>&bull; <code>nc -zv &lt;IP&gt; &lt;Port&gt;</code> (Netcat Port Scan)</div>
                </>
              )}
              {activeOSILayer.number === 5 && (
                <>
                  <div>&bull; Session Timeout Logs (Websocket / RPC)</div>
                  <div>&bull; <code>ss -o state established</code> (TCP Keep-Alive)</div>
                </>
              )}
              {activeOSILayer.number === 6 && (
                <>
                  <div>&bull; <code>openssl s_client -connect host:443</code></div>
                  <div>&bull; MIME / Zeichenkodierung (UTF-8 Validierung)</div>
                </>
              )}
              {activeOSILayer.number === 7 && (
                <>
                  <div>&bull; <code>nslookup &lt;Domain&gt;</code> / <code>dig</code> (DNS)</div>
                  <div>&bull; <code>curl -Iv &lt;URL&gt;</code> (HTTP Status Codes)</div>
                  <div>&bull; Anwendungslogs (nginx, apache, systemctl)</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Scenario Quiz for Exam Prep */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              IHK-Prüfungsfall: Welcher Schicht ordnest du diesen Fehler zu?
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Wähle ein Fehlerszenario und teste dein Fachwissen für das Prüfungsgespräch.
            </p>
          </div>
        </div>

        {/* Scenario Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {SCENARIOS.map((sc) => {
            const isSelected = activeScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleScenarioChange(sc)}
                className={`p-3 rounded-lg border text-left text-xs transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-white font-semibold'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="truncate">{sc.symptom}</div>
              </button>
            );
          })}
        </div>

        {/* Active Scenario Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="text-sm font-semibold text-white">
            Szenario: <span className="text-amber-400">„{activeScenario.symptom}“</span>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-slate-300">Auf welcher OSI-Schicht beginnst du die Analyse?</div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                const isPicked = quizAnswer === num;
                return (
                  <button
                    key={num}
                    onClick={() => {
                      setQuizAnswer(num);
                      setShowQuizResult(true);
                    }}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-mono font-bold transition-all ${
                      isPicked
                        ? num === activeScenario.expectedLayer
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-red-600 text-white border-red-500'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    Schicht {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quiz Result Feedback */}
          {showQuizResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 animate-fade-in ${
                quizAnswer === activeScenario.expectedLayer
                  ? 'bg-emerald-950/50 border-emerald-700 text-emerald-200'
                  : 'bg-red-950/50 border-red-800 text-red-200'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 text-sm">
                {quizAnswer === activeScenario.expectedLayer ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Richtig! Schicht {activeScenario.expectedLayer} ({OSI_LAYERS.find(l => l.number === activeScenario.expectedLayer)?.nameDe})</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>Nicht ganz: Das gehört primär zu Schicht {activeScenario.expectedLayer} ({OSI_LAYERS.find(l => l.number === activeScenario.expectedLayer)?.nameDe})</span>
                  </>
                )}
              </div>
              <p className="leading-relaxed">{activeScenario.explanation}</p>
              <div className="pt-1 text-slate-300">
                <strong>Empfohlene Lösung:</strong> {activeScenario.solution}
              </div>
              <div className="pt-1 font-mono text-[11px] text-amber-300 bg-slate-950 p-2 rounded border border-slate-800">
                Diagnose-Befehl: {activeScenario.command}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
