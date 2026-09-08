import { useEffect, useRef, useState } from 'react';

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

  useEffect(() => {
    if (!text) {
      setState({ text: '', typing: false });
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
      setState({ text, typing: false });
      doneRef.current?.();
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return state;
}
