import React from 'react';
import { useTerminal } from '../context/TerminalContext';

interface Props {
  command: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Renders a command as something you can click.
 *
 * Typing is still the point, but on a phone there is no keyboard worth using,
 * so every command the terminal mentions doubles as a control.
 */
const CommandButton: React.FC<Props> = ({ command, className = '', children }) => {
  const { runCommand, busy } = useTerminal();

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => runCommand(command)}
      className={
        'text-cyan-400 underline decoration-dotted underline-offset-4 ' +
        'hover:text-cyan-300 hover:decoration-solid ' +
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ' +
        'disabled:no-underline disabled:opacity-60 disabled:cursor-default ' +
        className
      }
    >
      {children ?? command}
    </button>
  );
};

export default CommandButton;
