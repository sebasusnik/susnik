import React, { useState, useCallback } from 'react';

/**
 * Hook to manage command history navigation (ArrowUp / ArrowDown) for an input field.
 *
 * @param setInput External state setter used to update the visible input.
 * @param initialHistory Optional list of initial commands in the history.
 */
function useHistory(
  setInput: React.Dispatch<React.SetStateAction<string>>,
  initialHistory: string[] = []
) {
  const [history, setHistory] = useState<string[]>(initialHistory);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (history.length === 0) return;
        const newIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIdx === -1) return;
        const newIdx = historyIdx + 1;
        if (newIdx >= history.length) {
          setHistoryIdx(-1);
          setInput('');
        } else {
          setHistoryIdx(newIdx);
          setInput(history[newIdx]);
        }
      }
    },
    [history, historyIdx, setInput]
  );

  const addToHistory = useCallback((command: string) => {
    setHistory((prev) => [...prev, command]);
    setHistoryIdx(-1);
  }, []);

  return {
    handleKeyDown,
    addToHistory,
  };
}

export default useHistory; 