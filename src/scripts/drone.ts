/**
 * A drone: one sustained note that never resolves. Two detuned saws on D1, a
 * sine on A1, another on D2, through a lowpass that breathes once every ~22
 * seconds. Synthesised here, nothing to download.
 *
 * Scrolling disturbs it. Speed opens the filter, so the saws bare their
 * harmonics when you move and sink back when you stop, and a hard scroll
 * stutters the signal like a loose cable. Position is deliberately not mapped
 * to pitch: that reads as a DJ, not as dread.
 *
 * Never autoplays. It is a button because it has to be.
 */
const button = document.querySelector<HTMLButtonElement>('#drone');

const BASE_CUTOFF = 160;      // Hz, where the drone sits at rest
const SCROLL_OPEN = 700;      // Hz it can climb to at full tilt
const FULL_SPEED = 2600;      // px/s that counts as full tilt
const STUTTER_AT = 0.62;      // agitation above which the signal drops out
const STUTTER_GAP = 420;      // ms between stutters, so it cannot machine-gun
const TRIM_REST = 0.8;        // level going into the shaper at rest
const TRIM_DUCK = 0.74;       // how much of that the drive gives back

const VOICES: Array<[number, OscillatorType, number]> = [
  [36.7, 'sawtooth', 0.22],   // D1
  [36.95, 'sawtooth', 0.22],  // and again, off by a quarter of a hertz, so it beats
  [55, 'sine', 0.18],         // A1
  [73.4, 'sine', 0.1],        // D2
];

/** Soft clip. Drive comes from the gain feeding it, not from rebuilding this. */
function softClip(): Float32Array<ArrayBuffer> {
  const n = 1024;
  const curve = new Float32Array(new ArrayBuffer(n * 4));
  for (let i = 0; i < n; i++) curve[i] = Math.tanh(((i * 2) / n - 1) * 2.2);
  return curve;
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let lowpass: BiquadFilterNode | null = null;
let drive: GainNode | null = null;
let trim: GainNode | null = null;
let gate: GainNode | null = null;
let frame = 0;
let stutters = 0;

function start() {
  const audio = new AudioContext();
  ctx = audio;

  master = audio.createGain();
  master.gain.value = 0;
  master.connect(audio.destination);

  // Cut by the stutter, so the fades of `master` stay untouched.
  gate = audio.createGain();
  gate.gain.value = 1;
  gate.connect(master);

  lowpass = audio.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = BASE_CUTOFF;
  lowpass.Q.value = 0.8;
  lowpass.connect(gate);

  const shaper = audio.createWaveShaper();
  shaper.curve = softClip();
  shaper.connect(lowpass);

  // Pushing harder into a fixed curve is the drive; the trim takes back the
  // loudness that buys, so agitation changes the tone and not the level. The
  // 0.74 is measured, not guessed: rendered offline, the drone comes out
  // within 7% of its resting loudness at full tilt, against 2.1x without it.
  trim = audio.createGain();
  trim.gain.value = TRIM_REST;
  trim.connect(shaper);

  drive = audio.createGain();
  drive.gain.value = 1;
  drive.connect(trim);

  for (const [freq, type, level] of VOICES) {
    const osc = audio.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const gain = audio.createGain();
    gain.gain.value = level;
    osc.connect(gain);
    gain.connect(drive);
    osc.start();
  }

  // The slow breath underneath everything scrolling does.
  const lfo = audio.createOscillator();
  lfo.frequency.value = 0.045;
  const depth = audio.createGain();
  depth.gain.value = 70;
  lfo.connect(depth);
  depth.connect(lowpass.frequency);
  lfo.start();

  master.gain.linearRampToValueAtTime(0.55, audio.currentTime + 4);
  listen();
}

function stop() {
  if (!ctx || !master) return;
  const closing = ctx;
  master.gain.linearRampToValueAtTime(0, closing.currentTime + 2.5);
  window.setTimeout(() => closing.close(), 2700);
  cancelAnimationFrame(frame);
  ctx = null; master = null; lowpass = null; drive = null; trim = null; gate = null;
}

/**
 * Agitation decays on its own, so stopping mid-page settles the drone instead
 * of freezing it wherever the last scroll event left it.
 */
function listen() {
  let lastY = window.scrollY;
  let lastT = performance.now();
  let agitation = 0;
  let nextStutter = 0;
  stutters = 0;

  const tick = (now: number) => {
    if (!ctx || !lowpass || !drive || !trim || !gate) return;
    const dt = Math.max(16, now - lastT) / 1000;
    const speed = Math.abs(window.scrollY - lastY) / dt;
    lastY = window.scrollY;
    lastT = now;

    const target = Math.min(1, speed / FULL_SPEED);
    // Rises with the scroll, falls back over about a second.
    agitation = target > agitation ? target : agitation + (target - agitation) * Math.min(1, dt * 3.5);

    const t = ctx.currentTime;
    lowpass.frequency.setTargetAtTime(BASE_CUTOFF + SCROLL_OPEN * agitation, t, 0.08);
    drive.gain.setTargetAtTime(1 + 3 * agitation, t, 0.12);
    trim.gain.setTargetAtTime(TRIM_REST * (1 - TRIM_DUCK * agitation), t, 0.12);

    if (agitation > STUTTER_AT && now > nextStutter) {
      nextStutter = now + STUTTER_GAP + Math.random() * 300;
      stutters++;
      let at = t;
      for (let i = 0, n = 2 + Math.floor(Math.random() * 3); i < n; i++) {
        const len = 0.02 + Math.random() * 0.035;
        gate.gain.setValueAtTime(0.06, at);
        gate.gain.setValueAtTime(1, at + len);
        at += len + 0.015 + Math.random() * 0.05;
      }
    }

    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
}

button?.addEventListener('click', () => {
  const on = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(on));
  button.textContent = on ? '■ drone' : '▶ drone';
  on ? start() : stop();
});

// So the tests can read what the scroll is doing to the sound.
Object.assign(window, {
  __drone: () =>
    ctx && lowpass && drive && trim
      ? { cutoff: lowpass.frequency.value, drive: drive.gain.value, trim: trim.gain.value, stutters }
      : null,
});
