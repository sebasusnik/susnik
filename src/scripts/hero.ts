import { createBleed, type Bleed } from './blood';

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
    if (inverted) bleed?.surge();
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
  const show = () => { stare = window.setTimeout(() => { hint.dataset.show = ''; }, 1500); };

  logo.addEventListener('pointerenter', () => { if (!touch) show(); });
  logo.addEventListener('pointerleave', () => { clearTimeout(stare); delete hint.dataset.show; });
  logo.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    hold = window.setTimeout(() => { cross(); delete hint.dataset.show; }, 550);
    show();
  });
  // Android fires contextmenu on a long press, iOS shows its callout. Both would
  // offer to save the image over the top of the easter egg. Suppressed on touch
  // only, and only here: blocking the right-click menu on a whole page is rude.
  logo.addEventListener('contextmenu', (e) => { if (touch) e.preventDefault(); });
  for (const ev of ['pointerup', 'pointercancel'] as const) {
    logo.addEventListener(ev, () => { clearTimeout(hold); clearTimeout(stare); });
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
