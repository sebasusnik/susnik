/**
 * The logo is all edges, so it bleeds from them.
 *
 * 1. Tips are found by reading the PNG's alpha, in both orientations: a bottom
 *    edge pixel with little material around it (an edge, not a belly) and that
 *    material above it (so it points down).
 * 2. A drop hangs from a tip, swells, necks, drops, hits the floor and opens.
 * 3. It reads as liquid because the body and neck are discs fused by an SVG
 *    blur-and-threshold filter. Threads go on a second, unfiltered canvas —
 *    the threshold flattens anything thin.
 * 4. Under 666 the logo is upside down but gravity is not, so it bleeds from
 *    the spikes that now point down.
 */

interface Tip { x: number; y: number }
interface RawTip extends Tip { fill: number }
interface Hanging { tip: Tip; r: number; stretch: number; age: number; grow: number }
interface Falling { x: number; y: number; vy: number; r: number; tip: Tip; age: number }
interface Satellite { x: number; y: number; vx: number; vy: number; r: number }
interface Puddle { x: number; w0: number; w: number; wt: number; h: number; age: number; life: number }

export interface Bleed {
  /** 666: a clean cut. Whatever hung, fell or stained belongs to the old world. */
  reset(): void;
  /** 666: it pours, and keeps pouring while the page stays inverted. */
  surge(): void;
  /** Force one drop. Bound to `b`, and used by the tests. */
  drop(index?: number, grow?: number): void;
  tips(): Tip[];
  state(): Record<string, number | boolean>;
  pause(): void;
  resume(): void;
  /** Advance without waiting, for tests. */
  warp(seconds: number): void;
  floor(): number;
}

const RED = '#9b0a0a';
const SHINE = 'rgba(255,120,120,.55)';
const GRAVITY = 420;

export function createBleed(
  hero: HTMLElement,
  logo: HTMLElement,
  img: HTMLImageElement,
  blood: HTMLCanvasElement,
  gloss: HTMLCanvasElement
): Bleed {
  const bc = blood.getContext('2d')!;
  const gc = gloss.getContext('2d')!;
  const inverted = () => document.documentElement.classList.contains('inverted');

  let rawUpright: RawTip[] = [];
  let rawFlipped: RawTip[] | null = null;
  let tipsUpright: Tip[] = [];
  let tipsFlipped: Tip[] = [];
  let hanging: Hanging[] = [];
  let falling: Falling[] = [];
  let satellites: Satellite[] = [];
  let puddles: Puddle[] = [];
  let scale = 1, W = 0, H = 0, floorY = 0;
  let running = false, last = 0, t = 0;

  const tips = () => (inverted() ? tipsFlipped : tipsUpright);

  // ---------------------------------------------------------------- tips --
  function findTips(flip: boolean): RawTip[] {
    const w = img.naturalWidth, h = img.naturalHeight;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d')!;
    if (flip) { x.translate(w, h); x.rotate(Math.PI); }
    x.drawImage(img, 0, 0);
    const data = x.getImageData(0, 0, w, h).data;

    const opaque = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) opaque[i] = data[i * 4 + 3] > 110 ? 1 : 0;

    // Summed-area tables for count and for x/y sums: density and centroid of
    // any window in constant time.
    const W1 = w + 1;
    const S = new Int32Array(W1 * (h + 1));
    const SX = new Float64Array(W1 * (h + 1));
    const SY = new Float64Array(W1 * (h + 1));
    for (let py = 1; py <= h; py++) {
      for (let px = 1; px <= w; px++) {
        const a = opaque[(py - 1) * w + (px - 1)];
        const i = py * W1 + px, up = i - W1, left = i - 1, ul = up - 1;
        S[i] = a + S[up] + S[left] - S[ul];
        SX[i] = a * (px - 1) + SX[up] + SX[left] - SX[ul];
        SY[i] = a * (py - 1) + SY[up] + SY[left] - SY[ul];
      }
    }
    const box = (T: Int32Array | Float64Array, px: number, py: number, R: number) => {
      const x0 = Math.max(0, px - R), y0 = Math.max(0, py - R);
      const x1 = Math.min(w, px + R + 1), y1 = Math.min(h, py + R + 1);
      return T[y1 * W1 + x1] - T[y0 * W1 + x1] - T[y1 * W1 + x0] + T[y0 * W1 + x0];
    };

    const R = 7, cells = (2 * R + 1) ** 2;
    const found: RawTip[] = [];
    for (let py = 1; py < h - 1; py++) {
      for (let px = 1; px < w - 1; px++) {
        if (!opaque[py * w + px] || opaque[(py + 1) * w + px]) continue;   // bottom edge
        const n = box(S, px, py, R);
        const fill = n / cells;
        if (fill >= 0.24) continue;                                        // too much material: a belly
        const dx = box(SX, px, py, R) / n - px;
        const dy = box(SY, px, py, R) / n - py;
        if (dy > -2.2 || Math.abs(dx) > 1.2 * -dy) continue;               // must point down, within ~50°
        found.push({ x: px, y: py, fill });
      }
    }

    const picked: RawTip[] = [];
    for (const c of found.sort((a, b) => b.y - a.y)) {
      if (!picked.some((u) => Math.hypot(u.x - c.x, u.y - c.y) < 30)) picked.push(c);
    }
    return picked.sort((a, b) => a.fill - b.fill).slice(0, 14).sort((a, b) => a.x - b.x);
  }

  function layout() {
    const hr = hero.getBoundingClientRect();
    const r = img.getBoundingClientRect();
    if (!r.width) return;
    scale = r.width / img.naturalWidth;
    W = Math.round(r.width);
    H = Math.round(hr.bottom - r.top);
    floorY = H - 26;                       // the floor is the bottom of the hero, never the setlist

    for (const cv of [blood, gloss]) {
      cv.width = W; cv.height = H;
      cv.style.cssText =
        `left:${Math.round(r.left - hr.left)}px;top:${Math.round(r.top - hr.top)}px;width:${W}px;height:${H}px`;
    }
    if (!rawUpright.length) rawUpright = findTips(false);
    rawFlipped ||= findTips(true);
    const toCss = (p: RawTip): Tip => ({ x: p.x * scale, y: p.y * scale });
    tipsUpright = rawUpright.map(toCss);
    tipsFlipped = rawFlipped.map(toCss);
  }

  // ------------------------------------------------------------ schedule --
  /** [base, jitter, max hanging]. Under 666 it is a haemorrhage. */
  const rate = (): [number, number, number] => (inverted() ? [0.6, 1.0, 6] : [10, 15, 2]);
  let nextDropAt = 5.4;
  /** The first two drops come fast so the effect is seen at all; then cruise. */
  let opening = 2;

  const hang = (tip: Tip, grow = 5 + Math.random() * 6) =>
    hanging.push({ tip, r: 1.6, stretch: 0, age: 0, grow });

  function hangSomewhere(grow?: number) {
    const free = tips().filter((tip) => !hanging.some((h) => h.tip === tip));
    if (free.length) hang(free[Math.floor(Math.random() * free.length)], grow);
  }

  function splat(x: number, r: number, scatter: boolean) {
    puddles.push({
      x, w0: r * 1.1, w: r * 1.1, wt: r * (2.6 + Math.random() * 1.2),
      h: r * 0.5, age: 0, life: 25 + Math.random() * 25,
    });
    if (!scatter) return;
    const n = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      satellites.push({
        x, y: floorY - 1,
        vx: (Math.random() < 0.5 ? -1 : 1) * (30 + Math.random() * 90),
        vy: -(50 + Math.random() * 110),
        r: 0.9 + Math.random() * 0.8,
      });
    }
  }

  function update(dt: number) {
    t += dt;
    const [base, jitter, max] = rate();

    if (t >= nextDropAt && tips().length) {
      if (opening > 0 && !inverted()) {
        hangSomewhere(opening === 2 ? 3 : 3.5 + Math.random() * 1.5);
        nextDropAt = t + 7 + Math.random() * 2;
        opening--;
      } else {
        if (hanging.length < max) hangSomewhere();
        nextDropAt = t + base + Math.random() * jitter;
      }
    }

    for (let i = hanging.length - 1; i >= 0; i--) {
      const h = hanging[i];
      h.age += dt;
      const k = Math.min(1, h.age / h.grow);
      h.r = 1.6 + 4.4 * k;
      h.stretch = 16 * k * k;                      // the neck gives under the weight
      if (k >= 1) {
        falling.push({ x: h.tip.x, y: h.tip.y + h.stretch + h.r, vy: 12, r: h.r, tip: h.tip, age: 0 });
        hanging.splice(i, 1);
      }
    }

    for (let i = falling.length - 1; i >= 0; i--) {
      const f = falling[i];
      f.vy += GRAVITY * dt; f.y += f.vy * dt; f.age += dt;
      if (f.y + f.r * 0.6 >= floorY) { splat(f.x, f.r, true); falling.splice(i, 1); }
    }

    for (let i = satellites.length - 1; i >= 0; i--) {
      const s = satellites[i];
      s.vy += GRAVITY * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= 1 - dt * 0.6;
      if (s.y >= floorY && s.vy > 0) { splat(s.x, s.r * 1.3, false); satellites.splice(i, 1); }
    }

    for (let i = puddles.length - 1; i >= 0; i--) {
      const p = puddles[i];
      p.age += dt;
      const k = Math.min(1, p.age / 0.28);
      const eased = 1 - (1 - k) ** 3;              // opens fast, then settles
      p.w = p.w0 + (p.wt - p.w0) * eased;
      p.h *= 1 - dt * 0.15;
      if (p.age > p.life + 10) puddles.splice(i, 1);
    }
  }

  // -------------------------------------------------------------- render --
  const dot = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  };

  function render() {
    bc.clearRect(0, 0, W, H);
    gc.clearRect(0, 0, W, H);
    bc.fillStyle = RED;

    for (const p of puddles) {                     // they dry: fade over the last 10s
      bc.globalAlpha = p.age > p.life ? Math.max(0, 1 - (p.age - p.life) / 10) : 1;
      bc.beginPath();
      bc.ellipse(p.x, floorY, p.w, Math.max(0.6, p.h), 0, 0, Math.PI * 2);
      bc.fill();
    }
    bc.globalAlpha = 1;

    for (const h of hanging) {
      const steps = Math.max(2, Math.ceil(h.stretch / 1.5));
      for (let i = 0; i <= steps; i++) {
        const q = i / steps;
        dot(bc, h.tip.x, h.tip.y + h.stretch * q, 0.9 + (h.r - 0.9) * q * 0.45);
      }
      const cy = h.tip.y + h.stretch + h.r * 0.9;
      dot(bc, h.tip.x, cy, h.r);
      gc.fillStyle = SHINE;
      dot(gc, h.tip.x - h.r * 0.35, cy - h.r * 0.4, Math.max(0.5, h.r * 0.28));
    }

    gc.strokeStyle = RED;
    gc.lineCap = 'round';
    for (const f of falling) {
      // A teardrop: round body, tail thinning to nothing. The tail is part of
      // the body, so the metaballs fuse it seamlessly.
      const tail = Math.min(f.r * 4, f.r * 1.3 + f.vy * 0.045);
      const steps = Math.max(3, Math.ceil(tail / 1.1));
      for (let i = 1; i <= steps; i++) {
        const q = i / steps;
        dot(bc, f.x, f.y - tail * q, f.r * (0.82 * (1 - q) ** 1.4 + 0.1));
      }
      const stretch = Math.min(1.22, 1 + f.vy / 1100);   // a real drop barely deforms
      bc.save(); bc.translate(f.x, f.y); bc.scale(1, stretch); dot(bc, 0, 0, f.r); bc.restore();
      gc.fillStyle = SHINE;
      dot(gc, f.x - f.r * 0.3, f.y - f.r * 0.45, f.r * 0.25);

      // The filament only exists for the first instant, then it snaps.
      const LIFE = 0.3;
      if (f.age < LIFE) {
        const k = f.age / LIFE;
        gc.globalAlpha = 1 - k * 0.6;
        gc.lineWidth = 1.5 - k * 0.9;
        gc.beginPath(); gc.moveTo(f.tip.x, f.tip.y); gc.lineTo(f.x, f.y - tail); gc.stroke();
        gc.globalAlpha = 1;
      }
    }

    for (const s of satellites) dot(bc, s.x, s.y, s.r);
  }

  // ---------------------------------------------------------------- loop --
  function frame(now: number) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt); render();
    requestAnimationFrame(frame);
  }
  const resume = () => { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); };
  const pause = () => { running = false; };

  const init = () => { layout(); resume(); };
  if (img.complete && img.naturalWidth) init();
  else img.addEventListener('load', init);
  window.addEventListener('resize', layout);

  // Only simulate while the logo is on screen and the tab is in front.
  let onScreen = true;
  new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    onScreen && !document.hidden ? resume() : pause();
  }).observe(logo);
  document.addEventListener('visibilitychange', () => {
    document.hidden || !onScreen ? pause() : resume();
  });

  return {
    reset() {
      hanging = []; falling = []; satellites = []; puddles = [];
      nextDropAt = t + (inverted() ? 0.5 : 3 + Math.random() * 5);
      render();
    },
    surge() {
      for (let i = 0; i < 4; i++) hangSomewhere(1.5 + Math.random() * 3);
      nextDropAt = t + 0.5;
    },
    drop(index, grow) {
      const T = tips();
      const tip = T[index ?? Math.floor(Math.random() * T.length)];
      if (tip && !hanging.some((h) => h.tip === tip)) hang(tip, grow);
    },
    tips,
    state: () => ({
      t: +t.toFixed(1), nextDropAt: +nextDropAt.toFixed(1),
      hanging: hanging.length, falling: falling.length, puddles: puddles.length, running,
    }),
    pause, resume,
    warp(seconds) { for (let i = 0; i < seconds * 60; i++) update(1 / 60); render(); },
    floor: () => floorY,
  };
}
