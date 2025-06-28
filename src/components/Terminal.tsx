import React, { useEffect, useRef, useState, useCallback } from 'react';
import PromptLine from './PromptLine';
import Intro from './Intro';
import useHistory from '../hooks/useHistory';
import useCommands from '../hooks/useCommands';
import { Resizable } from 're-resizable';
import Draggable from 'react-draggable';

const validCommands = ['about', 'exp', 'skills', 'contact', 'clear', 'help', 'repeat'];

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
  const [size, setSize] = useState({ width: 934, height: 672 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const initialResizeState = useRef<{ width: number; height: number; x: number; y: number } | null>(null);
  const [introKey, setIntroKey] = useState(0);

  const focusVisibleInput = () => {
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[data-terminal-input]'));
    const visible = inputs.find((el) => el.offsetParent !== null);
    visible?.focus();
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({
        x: (window.innerWidth - size.width) / 2,
        y: (window.innerHeight - size.height) / 2,
      });
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof MutationObserver === 'undefined') return;

    const observer = new MutationObserver(() => {
      el.scrollTop = el.scrollHeight;
    });

    observer.observe(el, { childList: true, subtree: true, characterData: true });
    el.scrollTop = el.scrollHeight;

    return () => observer.disconnect();
  }, []);

  const addElement = (element: React.ReactNode) => setLines((prev) => [...prev, { id: ++idCounter, element }]);

  const resetIntro = () => {
    setLines([]);
    setCleared(false);
    setIntroDone(false);
    setIntroKey((k) => k + 1);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const { handleCommand, busy } = useCommands({
    scrollRef,
    addElement,
    setLines,
    setCleared,
    resetIntro,
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
    focusVisibleInput();
  }, [busy]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, introDone]);

  useEffect(() => {
    const handleWindowKeyDown = (e: KeyboardEvent) => {
      if (busy) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      focusVisibleInput();
    };
    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [busy]);

  return (
    <>
      {/* Mobile: full-screen terminal without draggable/resize UI */}
      <div className="fixed inset-0 flex flex-col bg-term-bg font-mono text-sm z-10 sm:hidden">
        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto terminal-scroll">
          {!cleared && <Intro key={introKey} onDone={onIntroDone} />}
          {lines.map((l) => (
            <PromptLine key={l.id} html={l.html}>
              {l.element}
            </PromptLine>
          ))}
          {introDone && !busy && (
            <form className="flex items-center whitespace-pre" onSubmit={onSubmit}>
              <PromptLine input={input} live valid={validCommands} />
              <input
                data-terminal-input
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

      {/* Desktop: draggable & resizable window */}
      <div className="hidden sm:block">
        <Draggable
          handle=".terminal-handle"
          nodeRef={draggableRef}
          position={position}
          onStop={(e, data) => setPosition({ x: data.x, y: data.y })}
        >
          <div ref={draggableRef} style={{ position: 'absolute', zIndex: 10 }}>
            <Resizable
              size={size}
              minWidth={320}
              minHeight={200}
              onResizeStart={() => {
                initialResizeState.current = { ...size, ...position };
              }}
              onResize={(e, direction, ref, d) => {
                if (!initialResizeState.current) return;

                let newWidth = initialResizeState.current.width + d.width;
                let newHeight = initialResizeState.current.height + d.height;
                let newX = initialResizeState.current.x;
                let newY = initialResizeState.current.y;

                if (direction.includes('left')) {
                  newWidth = initialResizeState.current.width + d.width;
                  newX = initialResizeState.current.x - d.width;
                }

                if (direction.includes('top')) {
                  newHeight = initialResizeState.current.height + d.height;
                  newY = initialResizeState.current.y - d.height;
                }

                setSize({ width: newWidth, height: newHeight });
                setPosition({ x: newX, y: newY });
              }}
              onResizeStop={() => {
                initialResizeState.current = null;
              }}
            >
              <div className="flex flex-col w-full h-full rounded-lg bg-term-bg border border-term-bor font-mono">
                <div className="terminal-handle flex items-center px-3 h-8 rounded-t-lg bg-term-bor/50 cursor-move select-none">
                  <div className="flex items-center space-x-2 mr-4">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56] cursor-pointer"></span>
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e] cursor-pointer"></span>
                    <span className="w-3 h-3 rounded-full bg-[#27c93f] cursor-pointer"></span>
                  </div>
                  <span className="text-xs text-gray-300">sebasusnik@portfolio:~</span>
                </div>
                <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto terminal-scroll">
                  {!cleared && <Intro key={introKey} onDone={onIntroDone} />}
                  {lines.map((l) => (
                    <PromptLine key={l.id} html={l.html}>
                      {l.element}
                    </PromptLine>
                  ))}
                  {introDone && !busy && (
                    <form className="flex items-center whitespace-pre" onSubmit={onSubmit}>
                      <PromptLine input={input} live valid={validCommands} />
                      <input
                        data-terminal-input
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
      </div>
    </>
  );
};

export default Terminal;