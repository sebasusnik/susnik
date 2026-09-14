/**
 * Analogue static, and something in it.
 *
 * Noise is generated at a third of the viewport and scaled up with
 * `image-rendering: pixelated`, which is both far cheaper than a full-resolution
 * grain and closer to what a tube actually showed. A scanline modulation and a
 * tear that drifts up the screen do the rest.
 *
 * Every eight to sixteen seconds the signal almost comes back: the logo's alpha
 * is sampled into the same low-resolution grid, and for a few frames the noise
 * is biased bright where the logo is, so it surfaces out of the snow rather
 * than being drawn on top of it.
 */
const canvas = document.querySelector<HTMLCanvasElement>('#static');
const box = document.querySelector<HTMLElement>('#signal-box');
const path = document.querySelector<HTMLElement>('#signal-path');

if (path) path.textContent = location.pathname + location.search;

const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas) {
  const ctx = canvas.getContext('2d', { alpha: false })!;
  const SCALE = 3;
  let w = 0, h = 0;
  let image: ImageData | null = null;
  /** The logo's alpha, resampled onto the noise grid. */
  let ghost: Uint8Array | null = null;

  const logo = new Image();
  logo.src = '/logo.webp';

  function sizeUp() {
    w = Math.max(1, Math.ceil(window.innerWidth / SCALE));
    h = Math.max(1, Math.ceil(window.innerHeight / SCALE));
    canvas!.width = w;
    canvas!.height = h;
    image = ctx.createImageData(w, h);
    ghost = null;
    if (logo.complete && logo.naturalWidth) bakeGhost();
  }

  function bakeGhost() {
    const scratch = document.createElement('canvas');
    scratch.width = w; scratch.height = h;
    const s = scratch.getContext('2d')!;
    // Same size and place the real logo sits in the hero, so the shape that
    // surfaces is the one people already know.
    const drawW = Math.min(w * 0.62, (520 / SCALE));
    const drawH = drawW * (logo.naturalHeight / logo.naturalWidth);
    s.drawImage(logo, (w - drawW) / 2, (h - drawH) / 2, drawW, drawH);
    const a = s.getImageData(0, 0, w, h).data;
    const out = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) out[i] = a[i * 4 + 3];
    ghost = out;
  }

  logo.addEventListener('load', () => { if (w) bakeGhost(); });
  sizeUp();
  window.addEventListener('resize', sizeUp);

  let tear = Math.random() * h;      // the band where vertical hold gives out
  let surfacing = 0;                 // 0 to 1, how far the signal has come back
  let nextSurface = 5 + Math.random() * 6;
  let t = 0;
  let last = performance.now();

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;

    if (t >= nextSurface) {
      surfacing = 1;
      nextSurface = t + 8 + Math.random() * 8;
    }
    surfacing = Math.max(0, surfacing - dt * 2.2);   // about half a second

    tear -= dt * 22;
    if (tear < -20) tear = h + 20;

    const d = image!.data;
    const bias = ghost ? surfacing * surfacing * 190 : 0;   // eases in, snaps out

    for (let y = 0; y < h; y++) {
      // Scanlines, plus a brighter band around the tear.
      const scan = y % 2 === 0 ? 1 : 0.82;
      const near = Math.abs(y - tear);
      const band = near < 3 ? 1.9 : near < 9 ? 1.25 : 1;
      const row = y * w;
      for (let x = 0; x < w; x++) {
        const i = row + x;
        let v = (Math.random() * 74 + 6) * scan * band;
        if (bias && ghost![i]) v += (ghost![i] / 255) * bias * (0.55 + Math.random() * 0.45);
        const p = i * 4;
        d[p] = d[p + 1] = d[p + 2] = v > 255 ? 255 : v;
        d[p + 3] = 255;
      }
    }
    ctx.putImageData(image!, 0, 0);
    requestAnimationFrame(frame);
  }

  // For the tests, and for anyone who wants to see it without waiting.
  Object.assign(window, { __surface: () => { surfacing = 1; } });

  if (calm) {
    // One still frame of snow. No movement, no surfacing.
    const d = image!.data;
    for (let i = 0; i < w * h; i++) {
      const v = Math.random() * 70 + 8;
      const p = i * 4;
      d[p] = d[p + 1] = d[p + 2] = v;
      d[p + 3] = 255;
    }
    ctx.putImageData(image!, 0, 0);
  } else {
    requestAnimationFrame(frame);
  }
}

/**
 * The box drifts, the way a real set moved its on-screen display so it would
 * not burn into the phosphor. Nothing on this page is going to burn in, which
 * is exactly why it is worth doing.
 */
if (box && !calm) {
  let angle = Math.random() * Math.PI * 2;
  const drift = () => {
    angle += 0.0016;
    box.style.transform =
      `translate(${Math.cos(angle) * 4.5}vw, ${Math.sin(angle * 0.73) * 5}vh)`;
    requestAnimationFrame(drift);
  };
  requestAnimationFrame(drift);
}
