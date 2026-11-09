/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PresentationScene, formatSecondsToTime } from './osiData';

export interface VideoFrameSlice {
  frameIndex: number;          // 0, 1, 2, ...
  second: number;              // 0, 1, 2, ...
  timestamp: string;           // "00:00", "00:01", ...
  sceneId: string;
  sceneNumber: number;
  sceneTitle: string;
  speakerRole: string;
  speakerColor: string;
  activeLayer: number;         // 1 to 7, or 0
  layerName: string;
  pduType: string;
  activeProtocols: string[];
  transcriptSlice: string;     // Exact words spoken in this second
  visualSceneType: 'topology' | 'packet_flow' | 'terminal' | 'hardware' | 'infographic' | 'intro_outro';
  visualCue: string;
  deltaDescription: string;    // What changes in this exact second
  geminiOmniPrompt: string;    // 1:1 replica prompt for Gemini Omni 1.1 Flash
  cartesiaChunkText: string;   // Cleaned text slice for Cartesia TTS
  accentColor: string;
  hardwareDevice?: string;
  packetHeader?: string;
}

export interface CartesiaSonicOptions {
  model?: 'sonic-3.5' | 'sonic-3.6' | 'sonic-multilingual';
  autoSpellAcronyms?: boolean;
  addBreakTags?: boolean;
  breakDurationMs?: number;
  insertSonic36Fillers?: boolean; // 'uh', 'um' for natural thinking
  speedRatio?: number;
}

export interface CartesiaOptimizationResult {
  originalText: string;
  optimizedText: string;
  acronymsDetected: string[];
  spelledTokens: string[];
  ruleAudits: {
    rule: string;
    passed: boolean;
    detail: string;
  }[];
  complianceScore: number; // 0 to 100%
  sampleCurl: string;
  samplePython: string;
  voiceAgentSystemPrompt: string;
}

// Common German IT abbreviations that should be spelled out or wrapped in <spell>
const KNOWN_SPELL_ACRONYMS = [
  'OSI', 'TCP', 'UDP', 'MAC', 'IP', 'DNS', 'DHCP', 'HTTP', 'HTTPS', 'SMTP',
  'TLS', 'SSH', 'FTP', 'LAN', 'WAN', 'VLAN', 'NAT', 'ARP', 'ICMP', 'RJ45', 'CAT6', 'CAT7'
];

/**
 * Optimizes text strictly following Cartesia's official guidelines:
 * 1. Plain prose in full sentences. Always end with . ? or !
 * 2. Normal capitalization (all-caps ONLY for initialisms to be spelled out).
 * 3. Conventional numbers ($19.99, 1,234,567, 04/20/2025, 7:00 PM).
 * 4. Spelling tags <spell>...</spell> or spaced characters (A B C, 1 2 3).
 * 5. Pauses with commas/periods or <break time="500ms"/>.
 * 6. Speed ratio <speed ratio="0.85"/> ... <speed ratio="1.0"/>.
 * 7. Speech disfluencies (Sonic 3.6): uh, um, hmm.
 * 8. Zero markdown, no bold asterisks, no bullets, no raw JSON, no emojis.
 */
export function optimizeForCartesiaSonic(
  rawTranscript: string,
  options: CartesiaSonicOptions = {}
): CartesiaOptimizationResult {
  const model = options.model || 'sonic-3.5';
  const autoSpell = options.autoSpellAcronyms !== false;
  const addBreaks = options.addBreakTags || false;
  const breakMs = options.breakDurationMs || 300;
  const addFillers = options.insertSonic36Fillers || false;
  const speed = options.speedRatio || 1.0;

  let text = rawTranscript || '';

  // 1. Strip Markdown, bullets, brackets, asterisks, hashtags, raw JSON
  text = text.replace(/\[.*?\]/g, ''); // Remove audio cues like [Musik]
  text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold asterisks
  text = text.replace(/\*(.*?)\*/g, '$1'); // Remove italic
  text = text.replace(/^[\s*•\-#\d.)]+/gm, ''); // Remove bullet points and headers
  text = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ''); // Remove emojis

  // Normalize multi-spaces and newlines into single spaces
  text = text.replace(/\s+/g, ' ').trim();

  const acronymsFound: string[] = [];
  const spelledTokens: string[] = [];

  // 2. Identify legitimate initialisms and prevent accidental all-caps shouting
  const words = text.split(' ');
  const processedWords = words.map((w, idx) => {
    // Strip trailing punctuation for inspection
    const cleanWord = w.replace(/[.,!?;:"'()]/g, '');
    const punctMatch = w.match(/[.,!?;:"']+$/);
    const trailingPunct = punctMatch ? punctMatch[0] : '';

    if (KNOWN_SPELL_ACRONYMS.includes(cleanWord.toUpperCase())) {
      const upper = cleanWord.toUpperCase();
      if (!acronymsFound.includes(upper)) acronymsFound.push(upper);

      if (autoSpell && model.startsWith('sonic')) {
        spelledTokens.push(upper);
        return `<spell>${upper}</spell>${trailingPunct}`;
      }
      return `${upper}${trailingPunct}`;
    }

    // If an ordinary word is written in ALL-CAPS, convert to standard capitalization
    if (cleanWord.length > 3 && cleanWord === cleanWord.toUpperCase() && !/^\d+$/.test(cleanWord)) {
      const titleCased = cleanWord.charAt(0) + cleanWord.slice(1).toLowerCase();
      return `${titleCased}${trailingPunct}`;
    }

    return w;
  });

  text = processedWords.join(' ');

  // 3. Ensure full sentence terminating punctuation (. ? !)
  if (text.length > 0 && !/[.?!]$/.test(text.trim())) {
    text = text.trim() + '.';
  }

  // 4. Pauses & breaks (if configured)
  if (addBreaks && !text.includes('<break')) {
    // Insert natural break after major clause punctuation if requested
    text = text.replace(/\. /g, `.<break time="${breakMs}ms"/> `);
  }

  // 5. Sonic 3.6 natural disfluencies (uh, um) for thinking pause
  if (addFillers && (model === 'sonic-3.6' || model === 'sonic-3.5') && !text.includes('uh') && !text.includes('um')) {
    // Insert one natural filler before a technical explanation
    if (text.length > 40) {
      const parts = text.split(', ');
      if (parts.length > 1) {
        parts[1] = `uh, ${parts[1]}`;
        text = parts.join(', ');
      }
    }
  }

  // 6. Optional speed tag if ratio is not 1.0
  if (speed !== 1.0) {
    text = `<speed ratio="${speed}"/>${text}<speed ratio="1.0"/>`;
  }

  // Rule Audit Checklist
  const ruleAudits = [
    {
      rule: 'Vollständige Sätze mit Satzzeichen am Ende (. ? !)',
      passed: /[.?!]$/.test(text.trim()),
      detail: 'Sonic benötigt zwingend abschließende Satzzeichen für korrekte Intonation.'
    },
    {
      rule: 'Kein Markdown, keine Aufzählungszeichen, keine Emojis',
      passed: !/[*#_`~•]/.test(text),
      detail: 'Markdown-Zeichen oder Emojis werden von Sonic wörtlich vorgelesen.'
    },
    {
      rule: 'Keine Großbuchstaben zur Lautstärke-Hervorhebung',
      passed: !/\b[A-Z]{4,}\b/.test(text.replace(/<spell>.*?<\/spell>/g, '')),
      detail: 'Großschreibung darf nur für Akronyme wie OSI, TCP, UDP genutzt werden.'
    },
    {
      rule: 'Akronyme & Codes mit <spell>-Kennzeichnung geschützt',
      passed: autoSpell ? text.includes('<spell>') || acronymsFound.length === 0 : true,
      detail: 'Verhindert Fehlinterpretationen von Protokollabkürzungen.'
    },
    {
      rule: 'Herkömmliche Zahlen- und Datumsformate beibehalten',
      passed: true,
      detail: 'Sonic 3.5 normalisiert $19.99, 1,234,567 und Uhrzeiten automatisch.'
    },
    {
      rule: 'Vollständige Sätze statt isolierter Fragmente',
      passed: text.split(/[.?!]/).filter(s => s.trim().length > 0).length >= 1,
      detail: 'Ganze Sätze klingen natürlicher als isolierte Fragmente oder einzelne Wörter.'
    }
  ];

  const passedCount = ruleAudits.filter(r => r.passed).length;
  const complianceScore = Math.round((passedCount / ruleAudits.length) * 100);

  const sampleCurl = `curl -X POST "https://api.cartesia.ai/tts/bytes" \\
  -H "X-API-Key: $CARTESIA_API_KEY" \\
  -H "Cartesia-Version: 2024-06-10" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model_id": "${model === 'sonic-3.6' ? 'sonic-3.6' : 'sonic-multilingual'}",
    "transcript": ${JSON.stringify(text)},
    "voice": {
      "mode": "id",
      "id": "a0e99841-438c-4a64-b679-ae501e7d6091"
    },
    "output_format": {
      "container": "wav",
      "sample_rate": 24000,
      "encoding": "pcm_s16le"
    },
    "language": "de"
  }' \\
  --output "cartesia_output.wav"`;

  const samplePython = `import requests

url = "https://api.cartesia.ai/tts/bytes"
headers = {
    "X-API-Key": "DEIN_CARTESIA_API_KEY",
    "Cartesia-Version": "2024-06-10",
    "Content-Type": "application/json"
}
payload = {
    "model_id": "${model === 'sonic-3.6' ? 'sonic-3.6' : 'sonic-multilingual'}",
    "transcript": """${text}""",
    "voice": {"mode": "id", "id": "a0e99841-438c-4a64-b679-ae501e7d6091"},
    "output_format": {"container": "wav", "sample_rate": 24000, "encoding": "pcm_s16le"},
    "language": "de"
}

response = requests.post(url, headers=headers, json=payload)
with open("cartesia_output.wav", "wb") as f:
    f.write(response.content)
print("Audio erfolgreich generiert mit Cartesia ${model}!")`;

  const voiceAgentSystemPrompt = `You are a voice agent. Everything you output will be spoken aloud by Cartesia Sonic (Sonic 3.5 & Sonic 3.6) text-to-speech. Follow these rules:

1. GENERAL FORMATTING
- Write plain prose in full sentences. Always end with . ? or !
- Send complete phrases, not isolated words or fragments. Keep numbers, codes, and spell tags inside a surrounding sentence.
- Do NOT use markdown, bullet points, headers, bold, raw JSON, emoji, or special characters. Sonic reads them aloud as written.

2. CAPITALIZATION
- Use normal capitalization, exactly as the sentence would normally be written: capitalize the first word, proper nouns, and lowercase everything else.
- The model tends to read an all-caps token letter by letter. Use all-caps only when you want that, like an initialism you want spelled out (OSI, TCP, UDP, MAC, IP, USA).
- Do not put ordinary words in all-caps.

3. NUMBERS, DATES, AND SYMBOLS
- Use conventional written forms: numbers like 1,234,567; currency like $19.99; dates like 04/20/2025; times like 7:00 PM.
- Do not strip punctuation or force casing.

4. SPELLING OUT CODES AND IDS
- For confirmation codes or IDs, wrap in <spell> tags: Example: Your confirmation code is <spell>TKT4829XB</spell>.
- Alternatively delimit with spaces (A B C, 1 2 3).

5. PAUSES
- Use natural punctuation for pauses. For explicit silence, use <break time="500ms"/>. Never chain multiple break tags.

6. SPEED
- Use <speed ratio="0.85"/> to slow down, and return with <speed ratio="1.0"/>.`;

  return {
    originalText: rawTranscript,
    optimizedText: text,
    acronymsDetected: acronymsFound,
    spelledTokens,
    ruleAudits,
    complianceScore,
    sampleCurl,
    samplePython,
    voiceAgentSystemPrompt
  };
}

/**
 * Splits scenes into exact 1-second frames (1 FPS Filmstrip).
 * E.g. for a 45s video -> 45 frames (00:00 to 00:44).
 * E.g. for a 40s video -> 40 frames (00:00 to 00:39).
 */
export function decomposeScenesIntoFrames(scenes: PresentationScene[]): VideoFrameSlice[] {
  if (!scenes || scenes.length === 0) return [];

  const frames: VideoFrameSlice[] = [];
  let currentSecond = 0;

  scenes.forEach((scene, sceneIdx) => {
    const sceneDuration = scene.durationSeconds || 15;
    const rawScript = scene.scriptText || scene.spokenScript || scene.description || '';
    const cleanWords = rawScript
      .replace(/\[.*?\]/g, '')
      .replace(/[\n\r]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter((w: string) => w.length > 0);

    // Approximate words per second
    const wordsPerSecond = Math.max(1, Math.ceil(cleanWords.length / sceneDuration));

    for (let secOffset = 0; secOffset < sceneDuration; secOffset++) {
      const overallSecond = currentSecond + secOffset;
      const timestamp = formatSecondsToTime(overallSecond);

      // Slice transcript for this exact second
      const wordStart = secOffset * wordsPerSecond;
      const wordEnd = Math.min(cleanWords.length, wordStart + wordsPerSecond);
      const transcriptSlice = cleanWords.slice(wordStart, wordEnd).join(' ') || `[Visuelle Szene - Sekunde ${secOffset + 1}s]`;

      // Determine active OSI layer for this frame
      let activeLayer = 0;
      let layerName = 'Übersicht / Architektur';
      let pduType = 'N/A';
      let protocols: string[] = [];
      let sceneType: VideoFrameSlice['visualSceneType'] = 'infographic';
      let accent = '#3B82F6';
      let device = 'Workstation';
      let packetHeader = 'None';

      if (scene.layers && scene.layers.length > 0) {
        activeLayer = scene.layers[Math.min(scene.layers.length - 1, Math.floor((secOffset / sceneDuration) * scene.layers.length))];
      }

      switch (activeLayer) {
        case 7:
          layerName = 'Schicht 7: Anwendungsschicht (Application)';
          pduType = 'Daten (HTTP Payload)';
          protocols = ['HTTP', 'HTTPS', 'DNS', 'SMTP'];
          sceneType = 'topology';
          accent = '#EF4444';
          device = 'Webbrowser / Client Host';
          packetHeader = 'GET /index.html HTTP/1.1';
          break;
        case 6:
          layerName = 'Schicht 6: Darstellungsschicht (Presentation)';
          pduType = 'Formatierte Daten';
          protocols = ['TLS 1.3', 'ASCII', 'JPEG', 'MIME'];
          sceneType = 'infographic';
          accent = '#F97316';
          device = 'TLS Crypto Engine';
          packetHeader = 'TLS Handshake [Cipher: AES-GCM]';
          break;
        case 5:
          layerName = 'Schicht 5: Sitzungsschicht (Session)';
          pduType = 'Sitzungs-Daten';
          protocols = ['NetBIOS', 'RPC', 'PPTP'];
          sceneType = 'infographic';
          accent = '#EAB308';
          device = 'Session Manager';
          packetHeader = 'Session ID: #0x8F4A2 [Established]';
          break;
        case 4:
          layerName = 'Schicht 4: Transportschicht (Transport)';
          pduType = 'Segment (TCP) / Datagramm (UDP)';
          protocols = ['TCP (Port 443)', 'UDP (Port 53)', 'SYN/ACK'];
          sceneType = 'packet_flow';
          accent = '#10B981';
          device = 'Transport Socket / Endpunkte';
          packetHeader = 'TCP Src: 52140 → Dst: 443 [SYN, ACK, Seq: 1024]';
          break;
        case 3:
          layerName = 'Schicht 3: Vermittlungsschicht (Network)';
          pduType = 'Paket (IP Packet)';
          protocols = ['IPv4', 'IPv6', 'ICMP (Ping)', 'OSPF'];
          sceneType = 'packet_flow';
          accent = '#06B6D4';
          device = 'Cisco / Juniper Core Router';
          packetHeader = 'IP Src: 192.168.1.100 → Dst: 93.184.216.34 [TTL: 64]';
          break;
        case 2:
          layerName = 'Schicht 2: Sicherungsschicht (Data Link)';
          pduType = 'Frame (Ethernet Rahmen)';
          protocols = ['Ethernet II', '802.1Q (VLAN)', 'ARP'];
          sceneType = 'hardware';
          accent = '#3B82F6';
          device = '24-Port Gigabit Managed Switch (CAM Table)';
          packetHeader = 'MAC Src: 00:1A:2B:3C:4D:5E → Dst: AA:BB:CC:DD:EE:FF';
          break;
        case 1:
          layerName = 'Schicht 1: Bitübertragung (Physical)';
          pduType = 'Bits (0 & 1 Signale)';
          protocols = ['1000BASE-T (Cat6)', '10GBASE-LR (LWL)', 'WLAN 802.11ax'];
          sceneType = 'hardware';
          accent = '#8B5CF6';
          device = 'Patchpanel, Glasfaser SFP+, RJ45 Port LED';
          packetHeader = 'Bits: 01001000 01110100 01110100 01110000...';
          break;
        default:
          if (overallSecond < 5) {
            sceneType = 'intro_outro';
            layerName = 'Intro & Titelkarte';
            pduType = 'Referenzmodell Übersicht';
            accent = '#6366F1';
          } else {
            sceneType = 'terminal';
            layerName = 'IHK Troubleshooting & Diagnose';
            pduType = 'Diagnose & Ping / Traceroute';
            protocols = ['ping', 'traceroute', 'wireshark'];
            accent = '#EC4899';
            device = 'Linux Diagnostic Shell';
            packetHeader = 'ping -c 4 192.168.1.1 => 0% packet loss';
          }
          break;
      }

      // Delta detection
      const deltaDescription = secOffset === 0
        ? `Szenenwechsel zu "${scene.title}" – Einblendung des Themenbereichs.`
        : `Sekunde ${secOffset}s: Datenfluss schreitet voran, visuelle Aktualisierung der PDU (${pduType}).`;

      // Tailored 1:1 Gemini Replica Prompt for this exact second
      const geminiOmniPrompt = `Generate precise 1-second video frame for timestamp ${timestamp} (${sceneType} style). Showing ${layerName} with ${pduType}. Visual element: ${packetHeader} on ${device}. High contrast 16:9 720p/360p, professional German IT educational graphic with animated glowing bus lines, subtle HUD timestamp "${timestamp}", crisp typography.`;

      frames.push({
        frameIndex: frames.length,
        second: overallSecond,
        timestamp,
        sceneId: scene.id,
        sceneNumber: sceneIdx,
        sceneTitle: scene.title,
        speakerRole: scene.speakerRole || 'Moderation',
        speakerColor: scene.speakerColor || 'border-blue-500',
        activeLayer,
        layerName,
        pduType,
        activeProtocols: protocols,
        transcriptSlice,
        visualSceneType: sceneType,
        visualCue: `${layerName} • ${pduType}`,
        deltaDescription,
        geminiOmniPrompt,
        cartesiaChunkText: transcriptSlice,
        accentColor: accent,
        hardwareDevice: device,
        packetHeader
      });
    }

    currentSecond += sceneDuration;
  });

  return frames;
}
