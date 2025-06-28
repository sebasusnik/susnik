import { useEffect, useRef, useState } from 'react';

/**
 * Simple typing animation hook.
 * @param text The full text to "type" out.
 * @param speed Delay in ms between characters.
 * @param onDone Optional callback when typing completes.
 */
export default function useTyping(text: string, speed = 50, onDone?: () => void) {
  const [typed, setTyped] = useState('');
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!text) {
      setTyped('');
      return;
    }
    setTyped('');
    const interval = setInterval(() => {
      setTyped((prev) => {
        if (prev.length < text.length) {
          return text.slice(0, prev.length + 1);
        }
        clearInterval(interval);
        doneRef.current?.();
        return prev;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return typed;
} 