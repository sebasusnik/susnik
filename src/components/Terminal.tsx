import React, { useEffect, useRef, useState, useCallback } from 'react';
import PromptLine from './PromptLine';
import Intro from './Intro';
import useHistory from '../hooks/useHistory';
import useCommands from '../hooks/useCommands';

const validCommands = ['about', 'projects', 'skills', 'contact', 'clear', 'help'];

interface Line {
  id: number;
  html?: string;
  element?: React.ReactNode;
}

let idCounter = 0;

const Terminal: React.FC = () => {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const { handleKeyDown, addToHistory } = useHistory(setInput, ['about', 'projects', 'skills']);
  const [introDone, setIntroDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [cleared, setCleared] = useState(false);

  const addLine = (html: string) =>
    setLines((prev) => [...prev, { id: ++idCounter, html }]);

  const addElement = (element: React.ReactNode) =>
    setLines((prev) => [...prev, { id: ++idCounter, element }]);

  const { handleCommand, busy } = useCommands({
    scrollRef,
    addLine,
    addElement,
    setLines,
    setCleared,
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    addElement(<PromptLine input={trimmed} valid={validCommands} />);
    handleCommand(trimmed);
    addToHistory(trimmed);
    setInput('');
  };

  const onIntroDone = useCallback(() => {
    setIntroDone(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, introDone]);

  return (
    <div
      ref={scrollRef}
      className="w-full max-w-4xl rounded-lg p-4 bg-term-bg border border-term-bor h-[42em] overflow-y-auto font-mono"
      onClick={() => document.getElementById('terminal-input')?.focus()}
    >
      {!cleared && <Intro onDone={onIntroDone} />}

      {lines.map((l) => (
        <PromptLine key={l.id} html={l.html}>{l.element}</PromptLine>
      ))}

      {introDone && !busy && (
        <form className="flex items-center whitespace-pre" onSubmit={onSubmit}>
          <PromptLine input={input} live valid={validCommands} />
          <input
            id="terminal-input"
            className="opacity-0 absolute w-0 h-0"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </form>
      )}
    </div>
  );
};

export default Terminal;