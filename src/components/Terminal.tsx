import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import TerminalCore from './TerminalCore';
import DesktopWindow from './DesktopWindow';
import PromptLine from './PromptLine';
import CompletionHint from './CompletionHint';
import useHistory from '../hooks/useHistory';
import useCommands from '../hooks/useCommands';
import useIsMobile from '../hooks/useIsMobile';
import { TerminalProvider } from '../context/TerminalContext';
import { completeCommand } from '../utils/completion';
import { validCommands, deepLinkCommands } from '../utils/commands';

interface Line {
  id: number;
  html?: string;
  element?: React.ReactNode;
}

let idCounter = 0;

const Terminal: React.FC = () => {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');

  // The input a candidate list was last printed for, so holding Tab down does
  // not stack identical lists.
  const listedFor = useRef<string | null>(null);

  // Any edit — typing or walking the history — makes the next Tab list again,
  // so coming back to an input that was already listed still responds.
  const updateInput: React.Dispatch<React.SetStateAction<string>> = useCallback((value) => {
    listedFor.current = null;
    setInput(value);
  }, []);

  const { handleKeyDown, addToHistory } = useHistory(updateInput, ['about', 'exp', 'skills']);
  const [introDone, setIntroDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [cleared, setCleared] = useState(false);
  const [introKey, setIntroKey] = useState(0);
  const focusEnableAt = useRef<number>(0);
  const [interrupted, setInterrupted] = useState(false);
  const isMobile = useIsMobile();

  // Read inside stable callbacks without resubscribing listeners per keystroke.
  const inputRef = useRef(input);
  inputRef.current = input;

  const focusVisibleInput = () => {
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[data-terminal-input]'));
    const visible = inputs.find((el) => el.offsetParent !== null);
    visible?.focus();
  };

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

  const addElement = useCallback(
    (element: React.ReactNode) => setLines((prev) => [...prev, { id: ++idCounter, element }]),
    []
  );

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const clearScreen = useCallback(() => {
    setLines([]);
    setCleared(true);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  const resetIntro = useCallback(() => {
    setInterrupted(false);
    setLines([]);
    setCleared(false);
    setIntroDone(false);
    setIntroKey((k) => k + 1);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  const { handleCommand, abort, busy } = useCommands({
    addElement,
    clearScreen,
    resetIntro,
    scrollToBottom,
  });

  const runCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      // A fresh command clears the previous interrupt, so its output animates.
      setInterrupted(false);
      addElement(<PromptLine input={trimmed} valid={validCommands} />);
      handleCommand(trimmed);
      addToHistory(trimmed);
      setInput('');

      // Keep the address bar shareable: /#exp links straight to the experience.
      const word = trimmed.toLowerCase().split(' ')[0];
      if (deepLinkCommands.includes(word)) {
        window.history.replaceState(null, '', `#${word}`);
      } else if (word === 'clear' || word === 'repeat') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    },
    [addElement, handleCommand, addToHistory]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(input);
  };

  /** Ctrl+C: stop the running animation, echo ^C and hand the prompt back. */
  const interrupt = useCallback(() => {
    setInterrupted(true);
    abort();
    addElement(<PromptLine input={`${inputRef.current}^C`} valid={validCommands} />);
    setInput('');
  }, [abort, addElement]);

  const onIntroDone = useCallback(() => {
    setIntroDone(true);
    focusEnableAt.current = Date.now() + 700;
  }, []);

  // A deep link jumps straight to the section instead of replaying the intro.
  useEffect(() => {
    const command = window.location.hash.replace(/^#/, '').toLowerCase();
    if (!deepLinkCommands.includes(command)) return;

    setCleared(true);
    setIntroDone(true);
    addElement(<PromptLine input={command} valid={validCommands} />);
    handleCommand(command);
    addToHistory(command);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, introDone]);

  useEffect(() => {
    const handleWindowKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (e.ctrlKey && key === 'c') {
        // Only claim Ctrl+C when there is nothing to copy, so selecting text
        // and copying it still works the way it does everywhere else.
        if (window.getSelection()?.toString()) return;
        e.preventDefault();
        // During the intro there is no prompt to hand back; Intro skips itself.
        if (introDone) interrupt();
        return;
      }

      if (e.ctrlKey && key === 'l') {
        e.preventDefault();
        clearScreen();
        return;
      }

      if (busy) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isMobile) return;
      focusVisibleInput();
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [busy, isMobile, introDone, interrupt, clearScreen]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Shift+Tab keeps moving focus, so the terminal never traps a keyboard
      // user inside itself.
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        if (busy) return;

        const { value, suggestions } = completeCommand(inputRef.current, validCommands);

        // A shell reprints the candidates on every Tab, but it also redraws the
        // line in place. Here each list is appended, so reprinting stacks
        // identical rows that read as a glitch. Print once per distinct input.
        if (suggestions.length && listedFor.current !== value) {
          addElement(<CompletionHint suggestions={suggestions} />);
        }

        setInput(value);
        listedFor.current = suggestions.length ? value : null;
        return;
      }

      // The window listener owns the shortcuts.
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (busy) {
        e.preventDefault();
        return;
      }

      handleKeyDown(e);
    },
    [busy, addElement, handleKeyDown]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      scrollToBottom();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scrollToBottom]);

  const terminalContext = useMemo(
    () => ({ runCommand, interrupted, busy }),
    [runCommand, interrupted, busy]
  );

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
    setInput: updateInput,
    handleKeyDown: handleInputKeyDown,
    scrollToBottom,
    scrollRef,
  };

  return (
    <TerminalProvider value={terminalContext}>
      <div className="fixed inset-0 terminal-mobile flex flex-col bg-term-bg font-mono text-sm z-10 sm:hidden">
        <TerminalCore {...baseTerminalProps} isMobile={true} />
      </div>

      <div className="hidden sm:block">
        <DesktopWindow>
          <TerminalCore {...baseTerminalProps} isMobile={false} />
        </DesktopWindow>
      </div>
    </TerminalProvider>
  );
};

export default Terminal;
