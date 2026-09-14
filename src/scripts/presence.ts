// The tab calls you back.
const title = document.title;
document.addEventListener('visibilitychange', () => {
  document.title = document.hidden ? 'come back.' : title;
});

// For whoever opens the console.
console.log(
  "%c\nyou're looking under the skin. hi.\n\ntry typing the number of the beast.\nsrc: github.com/sebasusnik/susnik\n",
  'font-family:monospace;color:#777'
);
