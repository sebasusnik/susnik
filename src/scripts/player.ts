/**
 * The track player. A plain <audio> element rather than the page's
 * AudioContext: a file needs no synthesis, and the element brings buffering,
 * seeking and the lock-screen controls for free.
 *
 * Its sound does go through a gain of its own, for one thing: pausing cuts the
 * wave wherever it is, and that jump is a click. A 30 ms fade either side is
 * too short to hear as a fade. The element's own volume cannot do it, since
 * iOS ignores it. The context is the player's alone: the page's closes when
 * the drone stops, and an element wired into a closed context goes silent.
 *
 * It and the drone never play together. Starting either stops the other,
 * because a drone under a techno track is not an effect, it is a mistake.
 */
const STEP = 5; // seconds an arrow key moves
const FADE = 0.03; // seconds either side of a play or a pause

/**
 * Draws the playhead in screen pixels: a stem one CSS pixel wide, ticks three
 * long, and a gap of exactly one screen pixel between them. Redrawn only when
 * the pixel ratio or the height changes. Returns how far the stem sits from
 * the SVG's left edge, in CSS pixels.
 */
function caret(svg: SVGSVGElement, dpr: number, height: number): number {
  const s = Math.max(1, Math.round(dpr)); // stem and tick thickness
  const g = 1; // the gap
  const t = 3 * s; // tick length
  const key = `${dpr}:${height}`;
  if (svg.dataset.key !== key) {
    svg.dataset.key = key;
    const h = Math.round((height + 8) * dpr);
    const w = 2 * t + 2 * g + s;
    const r = t + 2 * g + s;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('shape-rendering', 'crispEdges');
    svg.style.width = `${w / dpr}px`;
    svg.style.height = `${h / dpr}px`;
    svg.innerHTML = [
      [t + g, s + g, s, h - 2 * (s + g)],
      [0, 0, t, s],
      [r, 0, t, s],
      [0, h - s, t, s],
      [r, h - s, t, s],
    ]
      .map(
        ([x, y, rw, rh]) =>
          `<rect x="${x}" y="${y}" width="${rw}" height="${rh}" fill="currentColor"/>`,
      )
      .join('');
  }
  return (t + g) / dpr;
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

for (const figure of document.querySelectorAll<HTMLElement>('.player')) {
  const audio = figure.querySelector('audio')!;
  const play = figure.querySelector<HTMLButtonElement>('[data-play]')!;
  const now = figure.querySelector<HTMLElement>('[data-now]')!;
  const seek = figure.querySelector<HTMLElement>('[data-seek]')!;
  const clip = seek.querySelector('[data-clip]')!;
  const head = seek.querySelector<SVGSVGElement>('[data-head]')!;
  const icons = {
    play: play.querySelector<HTMLElement>('[data-icon="play"]')!,
    pause: play.querySelector<HTMLElement>('[data-icon="pause"]')!,
  };
  const title = play.getAttribute('aria-label')!.replace(/^Play /, '');
  // Known before the file is, so the slider works before anything loads.
  const duration = Number(figure.dataset.duration);
  const drone = document.querySelector<HTMLButtonElement>('#drone');

  // timeupdate fires four times a second, which walks the line in steps; a
  // frame loop while playing moves it smoothly, and the text keeps to seconds.
  let frame = 0;
  const paint = () => {
    const t = audio.currentTime;
    const at = Math.min(1, t / duration);
    clip.setAttribute('width', String(at * 1000));
    const dpr = window.devicePixelRatio || 1;
    const reach = caret(head, dpr, seek.clientHeight);
    head.style.left = `${Math.round(at * seek.clientWidth * dpr) / dpr - reach}px`;
    now.textContent = clock(t);
    seek.setAttribute('aria-valuenow', String(Math.round(t)));
    seek.setAttribute('aria-valuetext', `${clock(t)} of ${clock(duration)}`);
  };
  const loop = () => {
    paint();
    frame = requestAnimationFrame(loop);
  };

  // Drawn at zero before anything plays, and redrawn if the pixel ratio
  // changes, when the window moves to another screen.
  paint();
  window.addEventListener('resize', () => audio.paused && paint());

  // Wired on the first play, inside the click, so the context may start.
  let fader: { ctx: AudioContext; gain: GainNode } | null = null;
  let stopping = 0;
  const ramp = (level: number) => {
    if (!fader) return;
    const { ctx, gain } = fader;
    const t = ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(level, t + FADE);
  };
  const start = () => {
    clearTimeout(stopping);
    stopping = 0;
    if (!fader) {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination);
      fader = { ctx, gain };
    }
    fader.ctx.resume();
    ramp(1);
    return audio.play();
  };
  const stop = () => {
    if (audio.paused) return;
    ramp(0);
    clearTimeout(stopping);
    stopping = window.setTimeout(() => {
      stopping = 0;
      audio.pause();
    }, FADE * 1000 + 10);
  };

  const to = (t: number) => {
    audio.currentTime = Math.max(0, Math.min(duration, t));
    paint();
  };

  const playing = (on: boolean) => {
    icons.play.toggleAttribute('hidden', on);
    icons.pause.toggleAttribute('hidden', !on);
    play.setAttribute('aria-label', `${on ? 'Pause' : 'Play'} ${title}`);
    cancelAnimationFrame(frame);
    if (on) loop();
    else paint();
  };

  audio.addEventListener('play', () => {
    playing(true);
    if (drone?.getAttribute('aria-pressed') === 'true') drone.click();
  });
  audio.addEventListener('pause', () => playing(false));
  audio.addEventListener('timeupdate', () => audio.paused && paint());
  audio.addEventListener('ended', () => to(0));

  // A pause already fading out counts as paused: a second click brings it back.
  play.addEventListener('click', () => (audio.paused || stopping ? start() : stop()));

  seek.addEventListener('click', (e) => {
    const box = seek.getBoundingClientRect();
    to(((e.clientX - box.left) / box.width) * duration);
  });
  seek.addEventListener('keydown', (e) => {
    const t = audio.currentTime;
    const jump: Record<string, number> = {
      ArrowRight: t + STEP,
      ArrowUp: t + STEP,
      ArrowLeft: t - STEP,
      ArrowDown: t - STEP,
      Home: 0,
      End: duration,
    };
    if (e.key in jump) {
      e.preventDefault();
      to(jump[e.key]);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      play.click();
    }
  });

  // Wait out the click, so the drone's own handler has flipped the button
  // whichever of the two scripts registered first.
  drone?.addEventListener('click', () => {
    setTimeout(() => {
      if (drone.getAttribute('aria-pressed') === 'true') stop();
    });
  });
}
