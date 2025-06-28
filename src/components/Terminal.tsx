import React, { useEffect, useRef, useState, useCallback } from 'react';
import PromptLine from './PromptLine';
import Intro from './Intro';
import useHistory from '../hooks/useHistory';
import useCommands from '../hooks/useCommands';
import { Resizable } from 're-resizable';
import Draggable from 'react-draggable';

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
  const draggableRef = useRef<HTMLDivElement>(null);

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
    if (busy) return;

    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;

    document.getElementById('terminal-input')?.focus();
  }, [busy]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, introDone]);

  // Focus the hidden input whenever the user types anywhere in the window
  useEffect(() => {
    const handleWindowKeyDown = (e: KeyboardEvent) => {
      if (busy) return;               // Ignore while commands are processing
      if (e.metaKey || e.ctrlKey || e.altKey) return; // Ignore shortcut combos

      const inputEl = document.getElementById('terminal-input') as HTMLInputElement | null;
      if (inputEl && document.activeElement !== inputEl) {
        inputEl.focus();
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [busy]);

  return (
    <Draggable handle=".terminal-handle" nodeRef={draggableRef}>
      <div ref={draggableRef} className="max-w-none">
        <Resizable
          defaultSize={{ width: 896, height: 672 }}
          minWidth={320}
          minHeight={200}
        >
          <div className="flex flex-col w-full h-full rounded-lg bg-term-bg border border-term-bor font-mono">
            {/* Header / Drag handle */}
            <div className="terminal-handle flex items-center px-3 h-8 rounded-t-lg bg-term-bor/50 cursor-move select-none">
              {/* macOS window controls */}
              <div className="flex items-center space-x-2 mr-4">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
                <span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
              </div>
              <span className="text-xs text-gray-300">sebasusnik@portfolio:~</span>
            </div>

            {/* Scrollable content */}
            <div
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto"
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
          </div>
        </Resizable>
      </div>
    </Draggable>
  );
};

export default Terminal;