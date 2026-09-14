import { useEffect, useRef, useState } from 'react';
import { useTerminal } from '../context/TerminalContext';

export interface TypingState {
  /** The portion of `text` revealed so far. */
  text: string;
  /** True while characters are still being revealed. */
  typing: boolean;
}

/**
 * Reveals `text` one character at a time.
 *
 * Pass an empty string to keep the hook idle; callers use that to sequence
 * several lines through a single shared step counter.
 *
 * @param speed Delay in ms between characters.
 * @param onDone Called once the last character is on screen.
 */
export default function useTyping(text: string, speed = 50, onDone?: () => void): TypingState {
  const [state, setState] = useState<TypingState>({ text: '', typing: false });
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  // Ctrl+C interrupts the reveal; show the whole line instead of freezing
  // mid-word.
  const { interrupted } = useTerminal();

  // Latched per line: once a line has been typed out it never retypes.
  // `interrupted` is shared by every output on screen and flips back to false
  // when the next command starts, which would otherwise replay finished text.
  const settledFor = useRef<string | null>(null);

  useEffect(() => {
    if (!text) {
      setState({ text: '', typing: false });
      return;
    }

    if (settledFor.current === text) {
      setState({ text, typing: false });
      return;
    }

    if (interrupted) {
      settledFor.current = text;
      setState({ text, typing: false });
      doneRef.current?.();
      return;
    }

    setState({ text: '', typing: true });
    let revealed = 0;
    const interval = setInterval(() => {
      if (revealed < text.length) {
        revealed += 1;
        setState({ text: text.slice(0, revealed), typing: true });
        return;
      }
      clearInterval(interval);
      settledFor.current = text;
      setState({ text, typing: false });
      doneRef.current?.();
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, interrupted]);

  return state;
}
