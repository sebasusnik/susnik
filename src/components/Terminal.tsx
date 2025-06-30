import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import TerminalCore from './TerminalCore';
import DesktopWindow from './DesktopWindow';
import PromptLine from './PromptLine';
import useHistory from '../hooks/useHistory';
import useCommands from '../hooks/useCommands';

const validCommands = ['about', 'exp', 'skills', 'contact', 'clear', 'help', 'repeat', 'ls', 'pwd'];

interface Line {
  id: number;
  html?: string;
  element?: React.ReactNode;
}

let idCounter = 0;

const Terminal: React.FC = () => {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const { handleKeyDown, addToHistory } = useHistory(setInput, ['about', 'exp', 'skills']);
  const [introDone, setIntroDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [cleared, setCleared] = useState(false);
  const [introKey, setIntroKey] = useState(0);
  const focusEnableAt = useRef<number>(0);

  const focusVisibleInput = () => {
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[data-terminal-input]'));
    const visible = inputs.find((el) => el.offsetParent !== null);
    visible?.focus();
  };

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 640;
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

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

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
    scrollToBottom,
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
    focusEnableAt.current = Date.now() + 700;
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, introDone]);

  useEffect(() => {
    const handleWindowKeyDown = (e: KeyboardEvent) => {
      if (busy) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isMobile) return;
      focusVisibleInput();
    };
    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [busy, isMobile]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      scrollToBottom();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scrollToBottom]);

  const baseTerminalProps = {
    lines,
    cleared,
    introKey,
    onIntroDone,
    introDone,
    busy,
    input,
    onSubmit,
    focusEnableAt,
    focusVisibleInput,
    setInput,
    handleKeyDown,
    scrollToBottom,
    scrollRef,
  };

  return (
    <>
      <div className="fixed inset-0 flex flex-col bg-term-bg font-mono text-sm z-10 sm:hidden">
        <TerminalCore {...baseTerminalProps} isMobile={true} />
      </div>

      <div className="hidden sm:block">
        <DesktopWindow>
          <TerminalCore {...baseTerminalProps} isMobile={false} />
        </DesktopWindow>
      </div>
    </>
  );
};

export default Terminal;