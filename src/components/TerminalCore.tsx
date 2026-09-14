import React from 'react';
import PromptLine from './PromptLine';
import Intro from './Intro';
import { validCommands } from '../utils/commands';

interface Line {
  id: number;
  html?: string;
  element?: React.ReactNode;
}

interface TerminalCoreProps {
  isMobile: boolean;
  lines: Line[];
  cleared: boolean;
  introKey: number;
  onIntroDone: () => void;
  introDone: boolean;
  busy: boolean;
  input: string;
  onSubmit: (e: React.FormEvent) => void;
  focusEnableAt: React.MutableRefObject<number>;
  focusVisibleInput: () => void;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  scrollToBottom: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const TerminalCore: React.FC<TerminalCoreProps> = ({
  isMobile,
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
}) => (
  // `aria-relevant="additions"` announces whole lines as they appear. The
  // default of "additions text" would also fire on every character of the
  // typing animation and flood the screen reader.
  <div
    ref={scrollRef}
    role="log"
    aria-live="polite"
    aria-relevant="additions"
    aria-label="Terminal output"
    className="flex-1 p-4 overflow-y-auto terminal-scroll"
  >
    {!cleared && <Intro key={introKey} onDone={onIntroDone} />}
    {lines.map((l) => (
      <PromptLine key={l.id} html={l.html}>
        {l.element}
      </PromptLine>
    ))}
    {introDone && (
      <form
        className="flex items-center whitespace-pre relative"
        onSubmit={busy ? (e) => e.preventDefault() : onSubmit}
        onPointerDown={isMobile ? undefined : () => {
          if (!busy && introDone && Date.now() >= focusEnableAt.current) {
            focusVisibleInput();
          }
        }}
      >
        <div className={busy ? 'invisible' : 'visible transition-all duration-200'}>
          <PromptLine input={input} live valid={validCommands} />
        </div>
        <input
          data-terminal-input
          aria-label="Terminal command input"
          className={isMobile 
            ? "absolute left-0 bottom-0 w-full h-full opacity-0 focus:outline-none"
            : "absolute left-0 bottom-0 w-px h-px opacity-0 pointer-events-none focus:outline-none"
          }
          value={input}
          onChange={busy ? () => {} : (e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={scrollToBottom}
          onClick={scrollToBottom}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          autoFocus={!isMobile}
        />
      </form>
    )}
  </div>
);

export default TerminalCore; 