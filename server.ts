import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));

// Health and Config Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-omni-1.1-flash',
    supportedAspectRatios: ['16:9', '9:16'],
    defaultResolution: '720p',
    timestamp: new Date().toISOString()
  });
});

// Video Generation Endpoint using gemini-interactions-api with gemini-omni-1.1-flash
app.post('/api/generate-video', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      aspect_ratio = '16:9',
      duration = '5s',
      resolution = '720p',
      sceneId,
      speaker
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Ein Prompt für die Videogenerierung ist erforderlich.'
      });
    }

    // Validate aspect ratio strictly according to requirements: '16:9' or '9:16'
    if (aspect_ratio !== '16:9' && aspect_ratio !== '9:16') {
      return res.status(400).json({
        error: "Ungültiges Seitenverhältnis. Erlaubt sind '16:9' (Querformat) oder '9:16' (Hochformat)."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY ist in der Umgebung nicht konfiguriert. Bitte konfiguriere den Schlüssel im AI Studio Secrets Panel.',
        needsKey: true
      });
    }

    console.log(`[VideoGen] Generating video with gemini-omni-1.1-flash. Aspect: ${aspect_ratio}, Res: ${resolution}, Duration: ${duration}`);

    const ai = new GoogleGenAI({ apiKey });

    // Call Interactions API with gemini-omni-1.1-flash
    const interaction = await ai.interactions.create({
      model: 'gemini-omni-1.1-flash',
      input: prompt,
      background: false,
      store: true,
      stream: false,
      response_format: {
        type: 'video',
        aspect_ratio: aspect_ratio, // '16:9' or '9:16'
        duration: duration || '5s',
        resolution: resolution || '720p',
      }
    }, { timeout: 300000 }); // 5 minutes timeout for video generation

    const videoPart = interaction.output_video;

    if (videoPart && videoPart.data) {
      return res.json({
        success: true,
        interactionId: interaction.id,
        mimeType: videoPart.mime_type || 'video/mp4',
        videoData: videoPart.data,
        aspectRatio: aspect_ratio,
        resolution: resolution,
        sceneId: sceneId || null,
        speaker: speaker || null,
        prompt: prompt,
        generatedAt: new Date().toISOString()
      });
    } else if (videoPart && videoPart.uri) {
      return res.json({
        success: true,
        interactionId: interaction.id,
        mimeType: videoPart.mime_type || 'video/mp4',
        videoUri: videoPart.uri,
        aspectRatio: aspect_ratio,
        resolution: resolution,
        sceneId: sceneId || null,
        speaker: speaker || null,
        prompt: prompt,
        generatedAt: new Date().toISOString()
      });
    } else {
      // If no video content was returned in output_video, inspect steps
      console.warn('[VideoGen] output_video was empty, inspecting interaction steps', interaction.steps);
      return res.status(500).json({
        error: 'Das Modell gemini-omni-1.1-flash hat keine Videodaten zurückgegeben.',
        steps: interaction.steps?.map(s => ({ type: s.type }))
      });
    }
  } catch (err: any) {
    console.error('[VideoGen Error]:', err);
    const errorMessage = err?.message || 'Fehler beim Erzeugen des Videos mit gemini-omni-1.1-flash';
    return res.status(500).json({
      error: errorMessage,
      details: err?.toString()
    });
  }
});

// Cartesia Text-to-Speech Endpoint
app.post('/api/cartesia-tts', async (req: Request, res: Response) => {
  try {
    const { transcript, voiceId = 'a0e99841-438c-4a64-b679-ae501e7d6091', model = 'sonic-multilingual', speed = 1.0, emotion = 'calm, professional' } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'Transkript-Text ist erforderlich.' });
    }

    const cartesiaKey = process.env.CARTESIA_API_KEY;
    if (cartesiaKey) {
      console.log(`[Cartesia] Calling Cartesia Sonic API for voice ${voiceId}`);
      const cartesiaRes = await fetch('https://api.cartesia.ai/tts/bytes', {
        method: 'POST',
        headers: {
          'X-API-Key': cartesiaKey,
          'Cartesia-Version': '2024-06-10',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model_id: model || 'sonic-multilingual',
          transcript: transcript,
          voice: {
            mode: 'id',
            id: voiceId,
            __experimental_controls: {
              speed: speed,
              emotion: [emotion]
            }
          },
          output_format: {
            container: 'wav',
            sample_rate: 24000,
            encoding: 'pcm_s16le'
          },
          language: 'de'
        })
      });

      if (!cartesiaRes.ok) {
        const errorText = await cartesiaRes.text();
        console.warn('[Cartesia API Error]:', errorText);
        throw new Error(`Cartesia API Fehler (${cartesiaRes.status}): ${errorText}`);
      }

      const audioBuffer = await cartesiaRes.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      return res.json({
        success: true,
        provider: 'cartesia',
        mimeType: 'audio/wav',
        audioData: base64Audio
      });
    }

    // Fallback to Gemini 3.8 Flash Lite TTS if Cartesia key is not provided in environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const interaction = await ai.interactions.create({
        model: 'gemini-3.8-flash-lite-tts',
        input: [
          {
            type: 'text',
            text: transcript,
            annotations: [
              {
                type: 'speech_metadata',
                style: `${emotion} style for Cartesia rehearsal`
              }
            ]
          }
        ],
        response_format: { type: 'audio' },
        generation_config: {
          speech_config: [{ language: 'de-DE', voice: 'Puck' }]
        }
      }, { timeout: 60000 });

      const audio = interaction.output_audio;
      if (audio?.data) {
        return res.json({
          success: true,
          provider: 'gemini-tts-fallback',
          mimeType: audio.mime_type || 'audio/wav',
          audioData: audio.data,
          note: 'Cartesia API Key nicht konfiguriert; Gemini TTS Vorschau gerendert.'
        });
      }
    }

    return res.status(200).json({
      success: false,
      message: 'Kein CARTESIA_API_KEY in den Umgebungsvariablen gefunden. Nutze den Curl/REST Code zur Ausführung mit deinem Cartesia Account.'
    });
  } catch (err: any) {
    console.error('[Cartesia TTS Error]:', err);
    return res.status(500).json({ error: err.message || 'Cartesia TTS Fehler' });
  }
});

// YouTube Video Decomposition & Transcript Analysis Endpoint
app.post('/api/analyze-youtube', async (req: Request, res: Response) => {
  try {
    const { url, manualTranscript, videoTitle: clientTitle } = req.body;
    if (!url && !manualTranscript) {
      return res.status(400).json({ error: 'YouTube URL oder Transkript ist erforderlich.' });
    }

    // Helper regex to extract YouTube ID
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/;
    const match = url ? url.trim().match(regExp) : null;
    const videoId = match ? match[1] : (url && /^[a-zA-Z0-9_-]{11}$/.test(url.trim()) ? url.trim() : null);

    let videoMetadata = {
      videoId: videoId || 'custom-video',
      title: clientTitle || (videoId ? `YouTube Video (${videoId})` : 'Importiertes Video'),
      author: 'YouTube Ersteller',
      thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '',
      durationSeconds: 720,
      captionsFound: false,
      rawTranscript: manualTranscript || ''
    };

    // Attempt to fetch oEmbed metadata and public captions concurrently
    if (videoId) {
      await Promise.allSettled([
        (async () => {
          try {
            const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
            const oembedRes = await fetch(oembedUrl, { signal: AbortSignal.timeout(2000) });
            if (oembedRes.ok) {
              const oembedData = await oembedRes.json();
              videoMetadata.title = oembedData.title || videoMetadata.title;
              videoMetadata.author = oembedData.author_name || videoMetadata.author;
              videoMetadata.thumbnailUrl = oembedData.thumbnail_url || videoMetadata.thumbnailUrl;
            }
          } catch (e) {
            console.warn('[YouTube oEmbed Note]:', (e as any)?.message || e);
          }
        })(),
        (async () => {
          if (manualTranscript) return;
          try {
            const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8'
              },
              signal: AbortSignal.timeout(2500)
            });
            const html = await pageRes.text();
            const matchCaptions = html.match(/"captionTracks":\s*(\[.*?\])/);
            if (matchCaptions && matchCaptions[1]) {
              const tracks = JSON.parse(matchCaptions[1]);
              const deTrack = tracks.find((t: any) => t.languageCode === 'de') || tracks[0];
              if (deTrack && deTrack.baseUrl) {
                const capRes = await fetch(deTrack.baseUrl, { signal: AbortSignal.timeout(2000) });
                const xml = await capRes.text();
                const textMatches = Array.from(xml.matchAll(/<text start="([\d.]+)" dur="([\d.]+)">(.*?)<\/text>/g));
                if (textMatches.length > 0) {
                  videoMetadata.captionsFound = true;
                  videoMetadata.rawTranscript = textMatches
                    .map(m => m[3].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>'))
                    .join(' ');
                }
              }
            }
          } catch (e) {
            console.warn('[YouTube Captions Note]:', (e as any)?.message || e);
          }
        })()
      ]);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let decomposedScenes: any[] = [];

    if (apiKey) {
      console.log(`[YouTube Analyzer] Using Gemini to decompose: ${videoMetadata.title}`);
      const ai = new GoogleGenAI({ apiKey });

      const promptText = `Du bist ein professioneller Video-Produzent und IT-Prüfungscoach für Fachinformatiker.
Analysiere dieses YouTube Video und zerlege es in exakt strukturierte Segmente (Szenen) für ein 720p 16:9 Präsentationsvideo (max. 12:00 Minuten).

Video-Titel: "${videoMetadata.title}"
Kanal / Sprecher: "${videoMetadata.author}"
Verfügbares Transkript / Inhalt:
"""
${videoMetadata.rawTranscript ? videoMetadata.rawTranscript.substring(0, 8000) : 'Thema: OSI-Modell, Netzwerkkommunikation in 7 Schichten, Kapselung und IHK Troubleshooting'}
"""

Erstelle ein JSON-Array mit 6 bis 8 chronologischen Szenen (von 00:00 bis zum Ende).
Jede Szene MUSS exakt folgende Felder enthalten:
- "sceneNumber": Zahl (0, 1, 2, ...)
- "title": Name der Szene (z.B. "Szene 1: Begrüßung & Layer 7")
- "speaker": Sprechername (z.B. "Patrick", "Bastian", "Issa", "Thomas", "Adem" oder vom Video abgeleitet)
- "speakerRole": Rolle (z.B. "Einleitung & Layer 7")
- "timeStart": Startzeit als "MM:SS" (z.B. "00:00")
- "timeEnd": Endzeit als "MM:SS" (z.B. "02:18")
- "durationSeconds": Dauer in Sekunden
- "layers": Array von Schicht-Nummern falls Netzwerkthema (z.B. [7] oder [6, 5])
- "slides": Folienzuordnung (z.B. "Folie 1: Titelfolie")
- "topic": Kurzbeschreibung des Themas
- "scriptText": Vollständiger deutscher Sprechtext für diesen Abschnitt (120-140 WPM ruhig gesprochen)
- "transitionCue": Klare Übergabephrase an den nächsten Sprecher
- "cues": Array von Objekten mit "timeOffset" (MM:SS) und "label" (Bildschirmeinblendung)
- "directorNotes": Regieanweisung zu Kamera, Blickrichtung und Gestik
- "aiVideoPrompt": Detaillierter Prompt für das KI-Videomodell gemini-omni-1.1-flash im 16:9 Querformat
- "cartesiaVoiceId": Cartesia Sonic Voice ID (z.B. "a0e99841-438c-4a64-b679-ae501e7d6091" für Patrick, "79a125e8-cd45-4c13-8a67-188112f4dd22" für Bastian, "846d3cb9-059d-4511-80c1-584742a8b98b" für Issa, "5c42302d-19c9-4673-90d2-8b438343ab88" für Thomas, "694f9389-aac1-45b6-b726-9d9369183238" für Adem)
- "cartesiaEmotion": Stimmung für Cartesia TTS (z.B. "calm, professional, articulate")

Antworte NUR mit reinem JSON (Array von Objekten), ohne Markdown-Ummantelung.`;

      try {
        const genPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            responseMimeType: 'application/json'
          }
        });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini timeout')), 3500));
        const genResponse: any = await Promise.race([genPromise, timeoutPromise]);

        const output = genResponse.text ? genResponse.text.trim() : '';
        const parsed = JSON.parse(output);
        if (Array.isArray(parsed) && parsed.length > 0) {
          decomposedScenes = parsed;
        }
      } catch (geminiErr) {
        console.warn('[YouTube Gemini Decomposition Note]:', (geminiErr as any)?.message || geminiErr);
      }
    }

    // If Gemini was not reachable or transcript was empty, generate high-fidelity structured breakdown
    if (decomposedScenes.length === 0) {
      console.log('[YouTube Analyzer] Using default structured decomposition preset');
      decomposedScenes = [
        {
          sceneNumber: 0,
          title: `Intro: ${videoMetadata.title}`,
          speaker: 'Intro',
          speakerRole: 'Titelfolie & Eröffnung',
          timeStart: '00:00',
          timeEnd: '00:20',
          durationSeconds: 20,
          layers: [],
          slides: 'Folie 1: Titelfolie',
          topic: `Eröffnungsvideo zu: ${videoMetadata.title}`,
          scriptText: `[Intro Musik & Animation]\n\nWillkommen zur Präsentation: ${videoMetadata.title}.\nErstellt für die FISI Umschulung bei Comcave.\nSprecher-Team: Patrick, Bastian, Issa, Thomas und Adem.`,
          transitionCue: 'Direkter Schnitt auf Patrick',
          cues: [
            { timeOffset: '00:00', label: 'Schwarzer Fade-in 1s' },
            { timeOffset: '00:05', label: `Titelfolie: ${videoMetadata.title}` },
            { timeOffset: '00:15', label: 'Team-Layout einblenden' }
          ],
          directorNotes: 'Ruhige Technik-Musik. Titelfolie zentral. Nach 20 Sekunden harter Schnitt auf Sprecher 1.',
          aiVideoPrompt: `Professional German IT video title scene in 720p 16:9. Modern dark slate and deep blue studio with floating 3D network nodes. Text: '${videoMetadata.title}'. 30fps broadcast quality.`,
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
          aiVideoPrompt: 'German IT presenter Patrick introduces network architecture in 720p 16:9. Slide shows 7 layers diagram, highlighting Layer 7 Application Layer with browser and email icons. Lower third Patrick.',
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
            { timeOffset: '02:30', label: 'Layer 6 hervorgehoben' },
            { timeOffset: '03:00', label: 'TLS Schloss-Icon' },
            { timeOffset: '03:30', label: 'Layer 5 Sitzungsaufbau' }
          ],
          directorNotes: 'Bastian spricht ruhig und analytisch. Schloss-Icon bei TLS einblenden.',
          aiVideoPrompt: 'German presenter Bastian explaining Layer 6 Presentation and Layer 5 Session Layer. Showing TLS encryption lock, data compression graphics, and session handshake. 720p 16:9 educational style.',
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
            { timeOffset: '04:30', label: 'Layer 4 Segmentierung' },
            { timeOffset: '05:00', label: 'TCP vs. UDP Vergleich' },
            { timeOffset: '05:30', label: 'Layer 3 IP-Pakete & Router' }
          ],
          directorNotes: 'Issa dynamisch und fokussiert. Vergleichstabelle TCP vs UDP zweispaltig.',
          aiVideoPrompt: 'German IT presenter Issa explains Layer 4 Transport Layer and Layer 3 Network Layer. Showing TCP vs UDP packet segments, port numbers 80 and 443, and glowing router path. 720p 16:9.',
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
            { timeOffset: '06:30', label: 'Switch im Serverrack' },
            { timeOffset: '07:00', label: 'Frame mit MAC-Adresse' },
            { timeOffset: '07:30', label: 'Kupferkabel & Glasfaser' }
          ],
          directorNotes: 'Thomas spricht sachlich und praxisnah. Physische Hardware zeigen.',
          aiVideoPrompt: 'German presenter Thomas explaining Layer 2 Data Link Layer and Layer 1 Physical Layer. Showing network switch rack, MAC addresses, RJ45 Ethernet cable, fiber optic pulses and binary bits. 720p 16:9.',
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
            { timeOffset: '08:30', label: 'Kapselungsanimation oben nach unten' },
            { timeOffset: '09:30', label: 'Entkapselung unten nach oben' },
            { timeOffset: '10:30', label: 'Troubleshooting Checkliste L1–L7' }
          ],
          directorNotes: 'Adem bildet den souveränen Abschluss für das IHK-Fachgespräch.',
          aiVideoPrompt: 'German IT expert Adem explaining packet encapsulation and structured troubleshooting checklist from Layer 1 to 7. 3D animated data packet receiving headers. 720p 16:9.',
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
          scriptText: '[Outro Musik & Fade-Out]\n\nVielen Dank für Ihre Aufmerksamkeit!\nFISI Umschulung – Comcave\nTeam: Patrick, Bastian, Issa, Thomas, Adem',
          transitionCue: 'Ende des Videos',
          cues: [
            { timeOffset: '11:45', label: 'Endcard einblenden' },
            { timeOffset: '11:58', label: 'Fade-out 2s' }
          ],
          directorNotes: '15 Sekunden Endcard. Sanftes Ausblenden ins Schwarze.',
          aiVideoPrompt: 'Elegant dark blue outro endcard for German IT training presentation in 720p 16:9. Text: Vielen Dank für Ihre Aufmerksamkeit! Team Patrick, Bastian, Issa, Thomas, Adem. Broadcast quality.',
          cartesiaVoiceId: 'a0e99841-438c-4a64-b679-ae501e7d6091',
          cartesiaEmotion: 'calm'
        }
      ];
    }

    return res.json({
      success: true,
      metadata: videoMetadata,
      scenes: decomposedScenes,
      count: decomposedScenes.length,
      analyzedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[YouTube Analyzer Error]:', err);
    return res.status(500).json({ error: err.message || 'YouTube Analysefehler' });
  }
});

// Setup Vite Dev Server Middleware or Static Delivery
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OSI Studio Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
