import { createContext, useContext } from 'react';

export interface TerminalContextValue {
  /** Runs a command as if the visitor had typed it. */
  runCommand: (command: string) => void;
  /**
   * True from a Ctrl+C until the next command starts.
   *
   * Deliberately a flag scoped to the running command rather than a counter
   * compared against mount time: a command can mount more output after being
   * interrupted — `about` reveals its summary once the headings finish — and
   * that late output has to appear at once too, not start a fresh animation.
   */
  interrupted: boolean;
  /** True while a command is still rendering its output. */
  busy: boolean;
}

const TerminalContext = createContext<TerminalContextValue>({
  runCommand: () => {},
  interrupted: false,
  busy: false,
});

export const TerminalProvider = TerminalContext.Provider;

export const useTerminal = () => useContext(TerminalContext);
