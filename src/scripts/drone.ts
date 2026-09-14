/**
 * A drone: one sustained note that never resolves. Two detuned saws on D1, a
 * sine on A1, another on D2, through a lowpass that breathes once every ~22
 * seconds. Synthesised here, nothing to download.
 *
 * Never autoplays. It is a button because it has to be.
 */
const button = document.querySelector<HTMLButtonElement>('#drone');

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

const VOICES: Array<[number, OscillatorType, number]> = [
  [36.7, 'sawtooth', 0.22],   // D1
  [36.95, 'sawtooth', 0.22],  // and again, off by a quarter of a hertz, so it beats
  [55, 'sine', 0.18],         // A1
  [73.4, 'sine', 0.1],        // D2
];

function start() {
  ctx = new AudioContext();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 160;
  lowpass.Q.value = 0.8;
  lowpass.connect(master);

  for (const [freq, type, level] of VOICES) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.value = level;
    osc.connect(gain);
    gain.connect(lowpass);
    osc.start();
  }

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.045;
  const depth = ctx.createGain();
  depth.gain.value = 70;
  lfo.connect(depth);
  depth.connect(lowpass.frequency);
  lfo.start();

  master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 4);
}

function stop() {
  if (!ctx || !master) return;
  const closing = ctx;
  master.gain.linearRampToValueAtTime(0, closing.currentTime + 2.5);
  window.setTimeout(() => closing.close(), 2700);
  ctx = null;
  master = null;
}

button?.addEventListener('click', () => {
  const on = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(on));
  button.textContent = on ? '■ drone' : '▶ drone';
  on ? start() : stop();
});
