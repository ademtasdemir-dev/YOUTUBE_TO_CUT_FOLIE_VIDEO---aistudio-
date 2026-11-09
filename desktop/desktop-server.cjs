/**
 * Standalone Windows Desktop Server for OSI-Modell 720p Studio & YouTube Decomposer
 * Self-contained: runs with zero dependencies on Windows.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.exe': 'application/vnd.microsoft.portable-executable'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // API Routes
  if (pathname === '/api/health') {
    return sendJson(res, 200, {
      status: 'ok',
      platform: 'win32-desktop',
      version: '1.2.0',
      timestamp: new Date().toISOString()
    });
  }

  if (pathname === '/api/download-installer') {
    const installerPath = path.join(__dirname, 'OSI-720p-Studio-Setup.exe');
    if (fs.existsSync(installerPath)) {
      const stat = fs.statSync(installerPath);
      res.writeHead(200, {
        'Content-Type': 'application/vnd.microsoft.portable-executable',
        'Content-Length': stat.size,
        'Content-Disposition': 'attachment; filename="OSI-720p-Studio-Setup.exe"'
      });
      return fs.createReadStream(installerPath).pipe(res);
    }
  }

  if (pathname === '/api/analyze-youtube' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const url = body.url || '';
    const videoId = (url.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*)/) || [])[1] || '0kFp6B0YVb0';

    // Structured decomposition for the short/standard video
    const sampleDecomposition = [
      {
        sceneNumber: 0,
        title: `Intro: ${body.title || 'YouTube Video'} (${videoId})`,
        speaker: 'Intro',
        speakerRole: 'Titelfolie & Eröffnung',
        timeStart: '00:00',
        timeEnd: '00:20',
        durationSeconds: 20,
        layers: [],
        slides: 'Folie 1: Titelfolie',
        topic: 'Eröffnungsvideo & Übersicht',
        scriptText: '[Intro Musik & Animation]\n\nWillkommen zur Präsentation. Erstellt für die FISI Umschulung bei Comcave.\nSprecher-Team: Patrick, Bastian, Issa, Thomas und Adem.',
        transitionCue: 'Direkter Schnitt auf Patrick',
        cues: [
          { timeOffset: '00:00', label: 'Schwarzer Fade-in 1s' },
          { timeOffset: '00:05', label: 'Titelfolie einblenden' },
          { timeOffset: '00:15', label: 'Team-Layout einblenden' }
        ],
        directorNotes: 'Schwarzer Fade-in, Intro-Titel 16:9 720p, dezente Firmenfarben.',
        aiVideoPrompt: 'Cinematic 720p 16:9 intro title screen with glowing blue network grid lines.',
        cartesiaVoiceId: 'a0e99841-438c-4a64-b679-ae501e7d6091',
        cartesiaEmotion: 'calm, corporate'
      },
      {
        sceneNumber: 1,
        title: 'Patrick – Grundlagen & Schicht 7 (Application Layer)',
        speaker: 'Patrick',
        speakerRole: 'Einleitung & Layer 7',
        timeStart: '00:20',
        timeEnd: '02:20',
        durationSeconds: 120,
        layers: [7],
        slides: 'Folie 1–3 und Folie 8',
        topic: 'Historie ISO 1984, Schicht 7 HTTP/HTTPS/SMTP',
        scriptText: 'Guten Morgen zusammen. Wir präsentieren euch heute das Schichtenmodell der Netzwerkkommunikation. Entwickelt 1984 von der ISO, ermöglicht das Modell herstellerunabhängige Kommunikation. Ich starte direkt ganz oben, beim Benutzer, mit Schicht 7: der Anwendungsschicht, dem Application Layer. Hier befinden sich Protokolle wie HTTP, HTTPS und SMTP. Schicht 7 ist unser Tor zum Netzwerk. Das erklärt euch nun Bastian.',
        transitionCue: 'Das erklärt euch nun Bastian.',
        cues: [
          { timeOffset: '00:30', label: 'OSI-Modell ISO 1984' },
          { timeOffset: '01:00', label: 'Layer 7 orange hervorgehoben' },
          { timeOffset: '01:30', label: 'HTTP / HTTPS / SMTP Icons' }
        ],
        directorNotes: 'Patrick steht frontal zur Kamera. Klare Aussprache. Bei Begriffen Folien einblenden.',
        aiVideoPrompt: 'Professional German IT presenter Patrick explaining OSI Layer 7 in 720p 16:9 studio.',
        cartesiaVoiceId: 'a0e99841-438c-4a64-b679-ae501e7d6091',
        cartesiaEmotion: 'confident, professional, clear'
      },
      {
        sceneNumber: 2,
        title: 'Bastian – Darstellung (Layer 6) & Sitzung (Layer 5)',
        speaker: 'Bastian',
        speakerRole: 'Layer 6 & Layer 5',
        timeStart: '02:20',
        timeEnd: '04:20',
        durationSeconds: 120,
        layers: [6, 5],
        slides: 'Folie 7: Layer 6 & 5',
        topic: 'Formatierung, TLS-Verschlüsselung, Kompression, Sitzungsverwaltung',
        scriptText: 'Danke, Patrick. Bevor Daten wirklich ins Netz gehen, müssen sie aufbereitet werden. Das macht Schicht 6, der Presentation Layer. Hier werden Daten formatiert, z.B. in JPEG oder ASCII, und verschlüsselt mittels TLS. Danach folgt Schicht 5: der Session Layer als Moderator der Verbindung. Wie die Daten nun transportiert werden, zeigt euch Issa.',
        transitionCue: 'Wie die Daten nun transportiert werden, zeigt euch Issa.',
        cues: [
          { timeOffset: '02:30', label: 'Presentation Layer: TLS Schlosssymbol' },
          { timeOffset: '03:15', label: 'Session Layer: Handshake Dialog' }
        ],
        directorNotes: 'Bastian zeigt auf das Flowchart auf dem Bildschirm.',
        aiVideoPrompt: 'German IT engineer Bastian explaining SSL TLS encryption and session tokens, 16:9.',
        cartesiaVoiceId: '79a125e8-cd45-4c13-8a67-188112f4dd22',
        cartesiaEmotion: 'calm, measured, articulate'
      },
      {
        sceneNumber: 3,
        title: 'Issa – Transport (Layer 4) & Vermittlung (Layer 3)',
        speaker: 'Issa',
        speakerRole: 'Layer 4 & Layer 3',
        timeStart: '04:20',
        timeEnd: '06:20',
        durationSeconds: 120,
        layers: [4, 3],
        slides: 'Folie 6 & 5',
        topic: 'Segmente, TCP vs. UDP, Ports, IP-Pakete, Routing',
        scriptText: 'Genau. Schicht 4, die Transportschicht, zerlegt Daten in Segmente und vergibt Ports. TCP steht für verlässliche Übertragung, UDP für maximale Geschwindigkeit. In Schicht 3 kommen IP-Adressen ins Spiel und Router finden den besten Weg durch das Netz. Thomas erklärt euch jetzt, wie das im lokalen Netz aussieht.',
        transitionCue: 'Thomas erklärt euch jetzt, wie das im lokalen Netz aussieht.',
        cues: [
          { timeOffset: '04:30', label: 'TCP vs. UDP Vergleichstabelle' },
          { timeOffset: '05:15', label: 'IP Header & Routing-Animation' }
        ],
        directorNotes: 'Issa spricht zügig und fokussiert.',
        aiVideoPrompt: 'Modern network operations center with Issa pointing at TCP 3-way handshake packet flow.',
        cartesiaVoiceId: '846d3cb9-059d-4511-80c1-584742a8b98b',
        cartesiaEmotion: 'energetic, technical, sharp'
      },
      {
        sceneNumber: 4,
        title: 'Thomas – Sicherung (Layer 2) & Bitübertragung (Layer 1)',
        speaker: 'Thomas',
        speakerRole: 'Layer 2 & Layer 1',
        timeStart: '06:20',
        timeEnd: '08:20',
        durationSeconds: 120,
        layers: [2, 1],
        slides: 'Folie 4: Layer 2 & 1',
        topic: 'Switches, MAC-Adressen, Ethernet-Frames, Bits 0/1, Kabel, Funk',
        scriptText: 'Danke, Issa. Schicht 2 verpackt Pakete in Frames mit MAC-Adressen, damit Switches im lokalen Netz die Daten zustellen. Schicht 1, der Physical Layer, überträgt schließlich rohe Nullen und Einsen als elektrische Spannung, Licht oder Funk. Ohne Schicht 1 gibt es kein Netzwerk. Adem fasst das nun für uns in der Praxis zusammen.',
        transitionCue: 'Adem fasst das nun für uns in der Praxis zusammen.',
        cues: [
          { timeOffset: '06:30', label: 'Ethernet-Frame & MAC-Tabelle' },
          { timeOffset: '07:20', label: 'Oszilloskop & Bit-Signal 0/1' }
        ],
        directorNotes: 'Thomas hält ein Ethernet-Kabel RJ45 in die Kamera.',
        aiVideoPrompt: 'Server rack room close-up with Thomas inspecting RJ45 cable and fiber optic transceiver.',
        cartesiaVoiceId: '5c42302d-19c9-4673-90d2-8b438343ab88',
        cartesiaEmotion: 'deep, grounded, technical'
      },
      {
        sceneNumber: 5,
        title: 'Adem – Kapselung, Troubleshooting & Fazit',
        speaker: 'Adem',
        speakerRole: 'Praxis & Fazit',
        timeStart: '08:20',
        timeEnd: '11:45',
        durationSeconds: 205,
        layers: [7, 6, 5, 4, 3, 2, 1],
        slides: 'Folie 10–12',
        topic: 'Kapselungsprinzip Webseitenaufruf, IHK-Troubleshooting Layer 1–7, Prüfungsfazit',
        scriptText: 'Fassen wir zusammen, wie das Prinzip der Kapselung bei einem Webseitenaufruf aussieht: HTTP auf Schicht 7, TCP-Header auf Schicht 4, IP-Header auf Schicht 3, MAC-Header auf Schicht 2 und Bits auf Schicht 1. Beim Troubleshooting gehen wir strukturiert von Schicht 1 aufwärts vor. Wer das OSI-Modell kennt, stochert nicht im Dunkeln. Vielen Dank für eure Aufmerksamkeit.',
        transitionCue: 'Vielen Dank für eure Aufmerksamkeit.',
        cues: [
          { timeOffset: '08:30', label: 'Kapselungs-Flussdiagramm L7 bis L1' },
          { timeOffset: '09:45', label: 'Troubleshooting Bottom-Up Matrix' }
        ],
        directorNotes: 'Adem spricht selbstbewusst und adressiert direkt die IHK-Prüfer.',
        aiVideoPrompt: 'Professional IT instructor Adem summarizing 7 OSI layers on an interactive smartboard.',
        cartesiaVoiceId: '694f9389-aac1-45b6-b726-9d9369183238',
        cartesiaEmotion: 'confident, authoritative, engaging'
      },
      {
        sceneNumber: 6,
        title: 'Outro: Endcard & Danksagung',
        speaker: 'Outro',
        speakerRole: 'Abschluss',
        timeStart: '11:45',
        timeEnd: '12:00',
        durationSeconds: 15,
        layers: [],
        slides: 'Folie 12: Endcard',
        topic: 'Danksagung, Team-Nennung, Ausblendung',
        scriptText: '[Outro Musik & Fade-Out] Vielen Dank für Ihre Aufmerksamkeit! FISI Umschulung – Comcave Team: Patrick, Bastian, Issa, Thomas, Adem',
        transitionCue: 'Ende des Videos',
        cues: [
          { timeOffset: '11:45', label: 'Danksagung einblenden' },
          { timeOffset: '11:55', label: 'Abspann auf Schwarz' }
        ],
        directorNotes: 'Kamera zoomt langsam zurück, Text wird zentriert.',
        aiVideoPrompt: 'Professional outro endcard with Comcave logo and IT team names in 720p 16:9.',
        cartesiaVoiceId: 'a0e99841-438c-4a64-b679-ae501e7d6091',
        cartesiaEmotion: 'calm'
      }
    ];

    return sendJson(res, 200, {
      success: true,
      metadata: {
        videoId,
        title: body.title || `YouTube Video (${videoId})`,
        author: 'YouTube Ersteller',
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        durationSeconds: 720,
        captionsFound: false,
        rawTranscript: body.manualTranscript || ''
      },
      scenes: sampleDecomposition,
      count: sampleDecomposition.length
    });
  }

  if (pathname === '/api/cartesia-tts' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    return sendJson(res, 200, {
      success: true,
      provider: 'cartesia-desktop-stub',
      message: 'Cartesia TTS Prompt erfolgreich erstellt. In der Desktop-App wird der Sprach-Rehearsal-Modus genutzt.',
      cleanText: body.transcript
    });
  }

  if (pathname === '/api/generate-video' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    // Return generated HD/360p interaction descriptor
    return sendJson(res, 200, {
      success: true,
      interactionId: `desktop-vid-${Date.now()}`,
      aspectRatio: body.aspect_ratio || '16:9',
      resolution: body.resolution || '360p',
      duration: body.duration || '5s',
      note: 'Video-Descriptor im Desktop-Modus erfolgreich erzeugt.'
    });
  }

  // Static File Serving
  let filePath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname);
  
  if (!fs.existsSync(filePath)) {
    filePath = path.join(ROOT_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end('File not found');
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\n======================================================================');
  console.log('  OSI-MODELL 720p STUDIO & YOUTUBE DECOMPOSER (WINDOWS DESKTOP)');
  console.log('======================================================================');
  console.log(`  Lokaler Desktop-Server laeuft auf: http://127.0.0.1:${PORT}`);
  console.log('  Oeffne Browser...');
  console.log('  Druecke Strg + C im Fenster, um die Anwendung zu beenden.');
  console.log('======================================================================\n');

  // Launch browser automatically on Windows
  const targetUrl = `http://127.0.0.1:${PORT}`;
  if (process.platform === 'win32') {
    exec(`start msedge --app=${targetUrl}`, (edgeErr) => {
      if (edgeErr) {
        exec(`start ${targetUrl}`);
      }
    });
  }
});
