import { useEffect, useRef, useState } from 'react';
import { useTerminal } from '../context/TerminalContext';

interface Options {
  /** When false, every item is rendered at once. */
  animate?: boolean;
  /** Delay between items, in ms. */
  speed?: number;
  /** Called once every item is on screen. */
  onFinished?: () => void;
  /** Called after each item paints, so the terminal can scroll to it. */
  onItemRendered?: () => void;
}

/**
 * Reveals a list one item at a time.
 *
 * `items` is deliberately kept out of the effect's dependencies: several
 * callers build their list inline during render, so depending on its identity
 * would tear down and restart the interval on every render.
 */
export default function useStaggeredReveal<T>(
  items: T[],
  { animate = false, speed = 120, onFinished, onItemRendered }: Options = {}
): T[] {
  const total = items.length;
  const [revealed, setRevealed] = useState(animate ? 0 : total);

  // Ctrl+C interrupts the reveal: land on the finished state rather than
  // leaving the output half-written.
  const { interrupted } = useTerminal();

  const finishedRef = useRef(onFinished);
  finishedRef.current = onFinished;
  const itemRenderedRef = useRef(onItemRendered);
  itemRenderedRef.current = onItemRendered;

  useEffect(() => {
    if (!animate || interrupted) {
      setRevealed(total);
      finishedRef.current?.();
      return;
    }

    setRevealed(0);
    let count = 0;
    const interval = setInterval(() => {
      if (count < total) {
        count += 1;
        setRevealed(count);
        // Let the new item paint before the caller scrolls to it.
        setTimeout(() => itemRenderedRef.current?.(), 10);
        return;
      }
      clearInterval(interval);
      finishedRef.current?.();
    }, speed);

    return () => clearInterval(interval);
  }, [animate, speed, total, interrupted]);

  return revealed >= total ? items : items.slice(0, revealed);
}
