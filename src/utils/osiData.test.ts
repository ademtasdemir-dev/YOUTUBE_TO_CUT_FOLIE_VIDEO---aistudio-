import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PresentationScene,
  PRESENTATION_SCENES,
  OSI_LAYERS,
  ENCAPSULATION_STEPS,
  calculateTotalDuration,
  formatSecondsToTime,
  parseTimeToSeconds,
  calculateWordsPerMinute,
  generateFfmpegCommand,
  validatePresentationSchedule,
  extractYouTubeId,
  buildCartesiaPrompt,
} from './osiData';
import {
  decomposeScenesIntoFrames,
  optimizeForCartesiaSonic,
} from './frameDecomposer';

test('Presentation scenes total exactly 720 seconds (12:00 minutes)', () => {
  const totalSeconds = calculateTotalDuration(PRESENTATION_SCENES);
  assert.equal(totalSeconds, 720, 'Total duration must be exactly 720 seconds for the 12:00 minute presentation');
  assert.equal(formatSecondsToTime(totalSeconds), '12:00');
});

test('Presentation scenes have seamless continuity without gaps or overlaps', () => {
  const validation = validatePresentationSchedule(PRESENTATION_SCENES);
  assert.equal(validation.isValid, true, `Schedule must be valid without errors: ${validation.errors.join(', ')}`);
  assert.equal(validation.errors.length, 0);
});

test('All 8 scenes are present with proper speaker distribution (neutral roles)', () => {
  assert.equal(PRESENTATION_SCENES.length, 8);
  const speakers = PRESENTATION_SCENES.map(s => s.speaker);
  assert.deepEqual(speakers, ['Intro', 'Sprecher 1', 'Sprecher 2', 'Sprecher 3', 'Sprecher 4', 'Sprecher 2', 'Sprecher 5', 'Outro']);
});

test('OSI Layers contains all 7 layers in correct descending hierarchy', () => {
  assert.equal(OSI_LAYERS.length, 7);
  assert.equal(OSI_LAYERS[0].number, 7);
  assert.equal(OSI_LAYERS[0].nameDe, 'Anwendungsschicht');
  assert.equal(OSI_LAYERS[6].number, 1);
  assert.equal(OSI_LAYERS[6].nameDe, 'Bitübertragungsschicht');
});

test('Encapsulation steps follow correct sequence from Layer 7 to Layer 1', () => {
  assert.equal(ENCAPSULATION_STEPS.length, 5);
  assert.equal(ENCAPSULATION_STEPS[0].layerNumber, 7);
  assert.equal(ENCAPSULATION_STEPS[1].layerNumber, 4);
  assert.equal(ENCAPSULATION_STEPS[2].layerNumber, 3);
  assert.equal(ENCAPSULATION_STEPS[3].layerNumber, 2);
  assert.equal(ENCAPSULATION_STEPS[4].layerNumber, 1);
});

test('Helper functions compute time and words per minute correctly', () => {
  assert.equal(parseTimeToSeconds('04:18'), 258);
  assert.equal(parseTimeToSeconds('12:00'), 720);
  assert.equal(formatSecondsToTime(258), '04:18');

  // Sprecher 1 scene has ~170 words in 120s => ~85 words/min
  const wpm = calculateWordsPerMinute(PRESENTATION_SCENES[1].scriptText, PRESENTATION_SCENES[1].durationSeconds);
  assert.ok(wpm > 60 && wpm < 160, `WPM ${wpm} should be in a calm speaking range (60-160 wpm)`);
});

test('generateFfmpegCommand produces valid 720p 16:9 encoding command', () => {
  const cmd = generateFfmpegCommand({ resolution: '720p', crf: 20 });
  assert.match(cmd, /-scale 1280:720/);
  assert.match(cmd, /-c:v libx264/);
  assert.match(cmd, /-c:a aac/);
  assert.match(cmd, /OSI_Modell_Comcave_720p_12min\.mp4/);
});

test('extractYouTubeId parses standard, short, and embedded YouTube URLs', () => {
  assert.equal(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeId('dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeId('not-a-valid-url'), null);
});

test('buildCartesiaPrompt generates proper Cartesia Sonic payload and curl command', () => {
  const prompt = buildCartesiaPrompt('Sprecher 1', 'Guten Morgen zusammen. Wir präsentieren das OSI-Modell.');
  assert.equal(prompt.model, 'sonic-multilingual');
  assert.equal(prompt.language, 'de');
  assert.ok(prompt.voiceId.length > 10);
  assert.match(prompt.samplePayloadJson, /sonic-multilingual/);
  assert.match(prompt.sampleCurlCommand, /api\.cartesia\.ai\/tts\/bytes/);
  assert.equal(prompt.cleanScript, 'Guten Morgen zusammen. Wir präsentieren das OSI-Modell.');
});

test('generateFfmpegCommand supports 360p low-res mode for resource efficiency', () => {
  const cmd360 = generateFfmpegCommand({ resolution: '360p', crf: 28 });
  assert.match(cmd360, /-scale 640:360/);
  assert.match(cmd360, /-c:v libx264/);
  assert.match(cmd360, /OSI_Modell_Comcave_360p_12min\.mp4/);
});

test('Short video timing calculation formats correctly for 45s and 40s clips', () => {
  assert.equal(formatSecondsToTime(45), '00:45');
  assert.equal(formatSecondsToTime(40), '00:40');
  assert.equal(parseTimeToSeconds('00:45'), 45);
  assert.equal(parseTimeToSeconds('00:40'), 40);
});

test('decomposeScenesIntoFrames decomposes 12-minute presentation into exactly 720 1-second frames', () => {
  const frames = decomposeScenesIntoFrames(PRESENTATION_SCENES);
  assert.equal(frames.length, 720, '12 minutes * 60 seconds should yield exactly 720 frame slices');
  assert.equal(frames[0].second, 0);
  assert.equal(frames[0].timestamp, '00:00');
  assert.equal(frames[719].second, 719);
  assert.equal(frames[719].timestamp, '11:59');

  // Verify each frame has gemini replica prompt and cartesia chunk
  assert.ok(frames[0].geminiOmniPrompt.length > 20);
  assert.ok(frames[0].cartesiaChunkText.length > 0);
  assert.ok(frames[25].transcriptSlice.length > 0);
});

test('decomposeScenesIntoFrames decomposes a short 45-second clip into 45 frames', () => {
  const shortScenes: PresentationScene[] = [
    {
      id: 'short-1',
      sceneNumber: 1,
      title: 'OSI 7 Schichten Kurzclip',
      speaker: 'Sprecher 1',
      speakerRole: 'Moderation',
      speakerColor: 'border-blue-500',
      timeStart: '00:00',
      timeEnd: '00:45',
      startSeconds: 0,
      endSeconds: 45,
      durationSeconds: 45,
      layers: [7, 6, 5, 4, 3, 2, 1],
      slides: 'Kurzclip',
      topic: 'OSI 7 Schichten Kurzclip',
      scriptText: 'Wir erklären das OSI-Modell in fünfundvierzig Sekunden von Schicht sieben bis eins.',
      cues: [],
      directorNotes: 'Schnelle 360p Übersicht',
      aiVideoPrompt: '360p overview of all 7 layers',
      cartesiaVoiceId: 'german-narrator'
    }
  ];
  const frames = decomposeScenesIntoFrames(shortScenes);
  assert.equal(frames.length, 45);
  assert.equal(frames[0].timestamp, '00:00');
  assert.equal(frames[44].timestamp, '00:44');
});

test('optimizeForCartesiaSonic follows official Cartesia guidelines', () => {
  const rawText = 'Wir testen TCP und UDP auf Schicht 4 mit Port 80 und Port 443';
  const result = optimizeForCartesiaSonic(rawText, {
    model: 'sonic-3.5',
    autoSpellAcronyms: true,
  });

  // Verify acronyms are spelled with <spell>
  assert.match(result.optimizedText, /<spell>TCP<\/spell>/);
  assert.match(result.optimizedText, /<spell>UDP<\/spell>/);
  // Must end with punctuation
  assert.match(result.optimizedText, /[.?!]$/);
  // High compliance score
  assert.ok(result.complianceScore >= 80, `Compliance score was ${result.complianceScore}`);
  assert.ok(result.ruleAudits.length >= 6);
  assert.ok(result.voiceAgentSystemPrompt.includes('Sonic 3.5'));
});



