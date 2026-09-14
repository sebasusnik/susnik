import { audio, duck } from './audio';

/**
 * The sting that lands when the world turns over.
 *
 * Built to be sharp rather than loud, because it can arrive in headphones: a
 * noise transient with a fast downward filter sweep, a dissonant cluster of
 * high sines sliding flat as they decay, and a short sub thump underneath for
 * body. Peak is kept around -6 dBFS; startle comes from the 3ms attack, not
 * from level.
 *
 * It only fires on the way into 666. Coming back out is quiet, which is what
 * makes the descent feel like the event.
 */
const PEAK = 2.2;   // swept against the limiter below; lands near -5.7 dBFS

/**
 * Four milliseconds of unfiltered noise. The bandpass in the burst below has to
 * ring up before it is loud, which costs about 10ms — too slow to make anyone
 * jump. This has no filter to wait for, so the edge is instant.
 */
function click(ctx: AudioContext, out: AudioNode, t: number) {
  const dur = 0.006;
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);

  const src = ctx.createBufferSource();
  src.buffer = buf;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.55, t);
  env.gain.linearRampToValueAtTime(0, t + dur);
  src.connect(env); env.connect(out);
  src.start(t); src.stop(t + dur);
}

function noiseBurst(ctx: AudioContext, out: AudioNode, t: number) {
  const dur = 0.6;
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buf;

  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.Q.value = 1.4;
  band.frequency.setValueAtTime(5200, t);
  band.frequency.exponentialRampToValueAtTime(700, t + 0.45);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(0.75, t + 0.003);   // the snap
  env.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);

  src.connect(band); band.connect(env); env.connect(out);
  src.start(t); src.stop(t + dur);
}

function cluster(ctx: AudioContext, out: AudioNode, t: number) {
  // A tritone stacked on a fourth: no resolution anywhere in it.
  for (const [freq, level] of [[1860, 0.3], [2630, 0.26], [3720, 0.16]] as const) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq * (1 + (Math.random() - 0.5) * 0.01), t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.84, t + 0.8);  // sliding flat

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(level, t + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);

    osc.connect(env); env.connect(out);
    osc.start(t); osc.stop(t + 0.85);
  }
}

function thump(ctx: AudioContext, out: AudioNode, t: number) {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(58, t);
  osc.frequency.exponentialRampToValueAtTime(28, t + 0.3);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(0.5, t + 0.006);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);

  osc.connect(env); env.connect(out);
  osc.start(t); osc.stop(t + 0.45);
}

export function scare() {
  const ctx = audio();
  const t = ctx.currentTime;

  const bus = ctx.createGain();
  bus.gain.value = PEAK;

  // Nothing gets to spike past the ceiling, however the parts happen to align.
  const ceiling = ctx.createDynamicsCompressor();
  ceiling.threshold.value = -3;
  ceiling.knee.value = 2;
  ceiling.ratio.value = 20;
  ceiling.attack.value = 0.002;
  ceiling.release.value = 0.2;

  bus.connect(ceiling);
  ceiling.connect(ctx.destination);

  click(ctx, bus, t);
  noiseBurst(ctx, bus, t);
  cluster(ctx, bus, t);
  thump(ctx, bus, t);

  duck(0.6);

  window.setTimeout(() => { bus.disconnect(); ceiling.disconnect(); }, 1400);
}
