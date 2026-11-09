import test from 'node:test';
import assert from 'node:assert/strict';
import {
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

test('All 8 scenes are present with proper speaker distribution', () => {
  assert.equal(PRESENTATION_SCENES.length, 8);
  const speakers = PRESENTATION_SCENES.map(s => s.speaker);
  assert.deepEqual(speakers, ['Intro', 'Patrick', 'Bastian', 'Issa', 'Thomas', 'Bastian', 'Adem', 'Outro']);
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

  // Patrick's scene has ~170 words in 120s => ~85 words/min
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
  const prompt = buildCartesiaPrompt('Patrick', 'Guten Morgen zusammen. Wir präsentieren das OSI-Modell.');
  assert.equal(prompt.model, 'sonic-multilingual');
  assert.equal(prompt.language, 'de');
  assert.ok(prompt.voiceId.length > 10);
  assert.match(prompt.samplePayloadJson, /sonic-multilingual/);
  assert.match(prompt.sampleCurlCommand, /api\.cartesia\.ai\/tts\/bytes/);
  assert.equal(prompt.cleanScript, 'Guten Morgen zusammen. Wir präsentieren das OSI-Modell.');
});

