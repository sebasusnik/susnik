import { createBleed, type Bleed } from './blood';
import { scare } from './scare';

/**
 * Wires the three things that happen around the logo: it dies for a frame now
 * and then, it bleeds, and typing 666 turns the world over.
 */
const hero = document.querySelector<HTMLElement>('.hero');
const logo = document.querySelector<HTMLElement>('.logo');
const img = document.querySelector<HTMLImageElement>('#logo-img');
const blood = document.querySelector<HTMLCanvasElement>('#blood');
const gloss = document.querySelector<HTMLCanvasElement>('#gloss');
const hint = document.querySelector<HTMLElement>('#hint');

const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = matchMedia('(hover: none)').matches;

let bleed: Bleed | null = null;
if (hero && logo && img && blood && gloss && !calm) {
  bleed = createBleed(hero, logo, img, blood, gloss);
}

// -- the logo dies for a frame -------------------------------------------
function die() {
  if (!img || calm) return;
  img.classList.remove('animate-die', 'animate-cross');
  void img.offsetWidth;                                   // restart the animation
  img.classList.add('animate-die');
}
// First at 5s, while the eye is still on the logo. Then every 15-30s.
const schedule = (ms: number) =>
  window.setTimeout(() => { die(); schedule(15000 + Math.random() * 15000); }, ms);
if (!calm) schedule(5000);

// -- 666 ------------------------------------------------------------------
// One blow: the page inverts at the very instant the logo cuts out (7% = 50ms).
// Then absence, the flash of the other one, and it returns already flipped.
let crossing = false;
function cross() {
  if (crossing) return;
  crossing = true;
  if (img && !calm) {
    img.classList.remove('animate-die', 'animate-cross');
    void img.offsetWidth;
    img.classList.add('animate-cross');
  }
  window.setTimeout(() => {
    const inverted = document.documentElement.classList.toggle('inverted');
    bleed?.reset();
    // Only on the way in. Coming back out is quiet, which is what makes the
    // descent the event. Typing 666 or holding the logo is a deliberate
    // gesture, so this is not sound nobody asked for.
    if (inverted) { bleed?.surge(); scare(); }
  }, calm ? 0 : 50);
  window.setTimeout(() => { img?.classList.remove('animate-cross'); crossing = false; }, 720);
}

let typed = '';
window.addEventListener('keydown', (e) => {
  if (e.key.length !== 1) return;
  typed = (typed + e.key).slice(-3);
  if (typed === '666') { cross(); typed = ''; }
});

// -- the hint -------------------------------------------------------------
// Staring at the logo for a second and a half reveals it. On touch there is no
// hover and no keyboard, so holding the logo *is* the 666.
if (hint && logo) {
  const place = () => {
    const r = logo.getBoundingClientRect();
    const h = logo.parentElement!.getBoundingClientRect();
    hint.style.top = `${r.bottom - h.top + 10}px`;
  };
  place();
  window.addEventListener('resize', place);
  if (touch) hint.textContent = 'hold the beast';

  let stare: number | undefined;
  let hold: number | undefined;
  // On a mouse the hint rewards staring. Under a finger it has to arrive while
  // the press is still building, or the world turns over with no warning at
  // all — which is what made an accidental press feel like the page misfiring.
  const show = (delay: number) => { stare = window.setTimeout(() => { hint.dataset.show = ''; }, delay); };

  logo.addEventListener('pointerenter', () => { if (!touch) show(1500); });
  logo.addEventListener('pointerleave', () => { clearTimeout(stare); delete hint.dataset.show; });
  // A long press has to be deliberate. At 550ms with nothing but pointerup to
  // cancel it, a thumb resting on the logo while reading turned the world over
  // and played the sting — and the logo is 80% of the width of a phone, so
  // that is most of the screen. It now needs stillness and a full second, and
  // any of movement, scrolling or lifting calls it off.
  const HOLD_MS = 900;
  const SLOP_PX = 10;
  let from: { x: number; y: number; scroll: number } | null = null;

  const abort = () => { clearTimeout(hold); clearTimeout(stare); from = null; };

  logo.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    from = { x: e.clientX, y: e.clientY, scroll: window.scrollY };
    hold = window.setTimeout(() => { cross(); delete hint.dataset.show; }, HOLD_MS);
    show(180);   // visible well before HOLD_MS, so the press is never a surprise
  });

  logo.addEventListener('pointermove', (e) => {
    if (!from) return;
    if (Math.hypot(e.clientX - from.x, e.clientY - from.y) > SLOP_PX) abort();
  });

  // Scrolling during the press means the finger was on its way somewhere else.
  window.addEventListener('scroll', () => {
    if (from && Math.abs(window.scrollY - from.scroll) > 4) abort();
  }, { passive: true });
  // Android fires contextmenu on a long press, iOS shows its callout. Both would
  // offer to save the image over the top of the easter egg. Suppressed on touch
  // only, and only here: blocking the right-click menu on a whole page is rude.
  logo.addEventListener('contextmenu', (e) => { if (touch) e.preventDefault(); });
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave'] as const) {
    logo.addEventListener(ev, abort);
  }
  // On touch it surfaces once, so they know the logo is worth pressing.
  if (touch) {
    window.setTimeout(() => {
      hint.dataset.show = '';
      window.setTimeout(() => { delete hint.dataset.show; }, 4000);
    }, 12000);
  }
}

// Debug handles, also used by the browser tests.
window.addEventListener('keydown', (e) => { if (e.key === 'b') bleed?.drop(); });
Object.assign(window, { __bleed: bleed, __die: die, __cross: cross });
