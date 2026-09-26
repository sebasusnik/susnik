/**
 * The track player. A plain <audio> element rather than the page's
 * AudioContext: a file needs no synthesis, and the element brings buffering,
 * seeking and the lock-screen controls for free.
 *
 * It and the drone never play together. Starting either stops the other,
 * because a drone under a techno track is not an effect, it is a mistake.
 */
const STEP = 5; // seconds an arrow key moves

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

for (const figure of document.querySelectorAll<HTMLElement>('.player')) {
  const audio = figure.querySelector('audio')!;
  const play = figure.querySelector<HTMLButtonElement>('[data-play]')!;
  const now = figure.querySelector<HTMLElement>('[data-now]')!;
  const seek = figure.querySelector<HTMLElement>('[data-seek]')!;
  const bars = [...seek.children] as HTMLElement[];
  const title = play.getAttribute('aria-label')!.replace(/^Play /, '');
  // Known before the file is, so the slider works before anything loads.
  const duration = Number(figure.dataset.duration);
  const drone = document.querySelector<HTMLButtonElement>('#drone');

  let lit = 0;
  const paint = () => {
    const t = audio.currentTime;
    now.textContent = clock(t);
    seek.setAttribute('aria-valuenow', String(Math.round(t)));
    seek.setAttribute('aria-valuetext', `${clock(t)} of ${clock(duration)}`);
    const next = Math.round((t / duration) * bars.length);
    if (next === lit) return;
    bars.forEach((bar, i) => (bar.style.background = i < next ? 'var(--fg)' : ''));
    lit = next;
  };

  const to = (t: number) => {
    audio.currentTime = Math.max(0, Math.min(duration, t));
    paint();
  };

  audio.addEventListener('play', () => {
    play.textContent = '■';
    play.setAttribute('aria-label', `Pause ${title}`);
    if (drone?.getAttribute('aria-pressed') === 'true') drone.click();
  });
  audio.addEventListener('pause', () => {
    play.textContent = '▶';
    play.setAttribute('aria-label', `Play ${title}`);
  });
  audio.addEventListener('timeupdate', paint);
  audio.addEventListener('ended', () => to(0));

  play.addEventListener('click', () => (audio.paused ? audio.play() : audio.pause()));

  seek.addEventListener('click', (e) => {
    const box = seek.getBoundingClientRect();
    to(((e.clientX - box.left) / box.width) * duration);
  });
  seek.addEventListener('keydown', (e) => {
    const t = audio.currentTime;
    const jump: Record<string, number> = {
      ArrowRight: t + STEP, ArrowUp: t + STEP,
      ArrowLeft: t - STEP, ArrowDown: t - STEP,
      Home: 0, End: duration,
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
      if (drone.getAttribute('aria-pressed') === 'true') audio.pause();
    });
  });
}
