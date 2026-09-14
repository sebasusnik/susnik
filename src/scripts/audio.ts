/**
 * One AudioContext for the page, made on the first sound and not before.
 *
 * The drone and the 666 sting share it so they can hear each other: the sting
 * ducks the drone rather than summing on top of it and clipping.
 */
let ctx: AudioContext | null = null;
let duckTarget: GainNode | null = null;

/** Only ever called from a user gesture, so it never needs resuming. */
export function audio(): AudioContext {
  ctx ??= new AudioContext();
  return ctx;
}

export function current(): AudioContext | null {
  return ctx;
}

export function close() {
  const closing = ctx;
  ctx = null;
  duckTarget = null;
  if (closing) window.setTimeout(() => closing.close(), 2700);
}

/** The drone hands over the gain it wants pulled down while something louder happens. */
export function duckable(gain: GainNode | null) {
  duckTarget = gain;
}

/** Pull the drone under for `hold` seconds, then let it back up. */
export function duck(hold: number, depth = 0.25) {
  if (!ctx || !duckTarget) return;
  const t = ctx.currentTime;
  const level = duckTarget.gain.value;
  duckTarget.gain.cancelScheduledValues(t);
  duckTarget.gain.setValueAtTime(level, t);
  duckTarget.gain.linearRampToValueAtTime(level * depth, t + 0.03);
  duckTarget.gain.setValueAtTime(level * depth, t + hold);
  duckTarget.gain.linearRampToValueAtTime(level, t + hold + 1.2);
}
