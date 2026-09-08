import { useSyncExternalStore } from 'react';

/**
 * Tracks whether the viewport is below Tailwind's `sm` breakpoint, i.e. the
 * width at which the layout swaps the draggable desktop window for the
 * full-screen mobile terminal.
 */
const MOBILE_QUERY = '(max-width: 639.98px)';

let mediaQuery: MediaQueryList | null = null;

const getMediaQuery = () => (mediaQuery ??= window.matchMedia(MOBILE_QUERY));

const subscribe = (onStoreChange: () => void) => {
  const mql = getMediaQuery();
  mql.addEventListener('change', onStoreChange);
  return () => mql.removeEventListener('change', onStoreChange);
};

const getSnapshot = () => getMediaQuery().matches;

// The server has no viewport; match the desktop branch, which is what the
// prerendered markup renders.
const getServerSnapshot = () => false;

export default function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
