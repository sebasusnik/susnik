/**
 * Turns a rendered WAV into what the player needs: an MP3 in public/audio, and
 * next to it the shape of the track as JSON, so the waveform is drawn before a
 * single byte of audio is fetched.
 *
 *   node scripts/track.mjs <in.wav> <name>
 *
 * Needs ffmpeg on the PATH. The shape is the RMS of each slice, scaled so the
 * loudest slice is 1: peaks would draw every bar of a mastered track the same
 * height, and loudness is what the eye should read.
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const BARS = 120;
const RATE = 4000;

const [input, name] = process.argv.slice(2);
if (!input || !name) {
  console.error('usage: node scripts/track.mjs <in.wav> <name>');
  process.exit(1);
}

const mp3 = `public/audio/${name}.mp3`;
execFileSync('ffmpeg', [
  '-loglevel',
  'error',
  '-y',
  '-i',
  input,
  '-c:a',
  'libmp3lame',
  '-q:a',
  '2',
  mp3,
]);

const raw = execFileSync(
  'ffmpeg',
  ['-loglevel', 'error', '-i', input, '-ac', '1', '-ar', String(RATE), '-f', 'f32le', '-'],
  { maxBuffer: 1 << 28 },
);
const samples = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);

const per = Math.floor(samples.length / BARS);
const rms = Array.from({ length: BARS }, (_, i) => {
  let sum = 0;
  for (let j = i * per; j < (i + 1) * per; j++) sum += samples[j] ** 2;
  return Math.sqrt(sum / per);
});
const top = Math.max(...rms);

writeFileSync(
  `public/audio/${name}.json`,
  `${JSON.stringify({
    duration: Math.round((samples.length / RATE) * 10) / 10,
    shape: rms.map((v) => Math.round((v / top) * 100) / 100),
  })}\n`,
);
console.log(`${mp3}, public/audio/${name}.json`);
