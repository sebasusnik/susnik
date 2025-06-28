import React from 'react';
import Caret from './Caret';

const PREFIX_HTML =
  '<span class="text-fuchsia-400">sebastian@portfolio</span>' +
  '<span class="text-gray-500">:</span>' +
  '<span class="text-cyan-400">~</span>' +
  '<span class="text-gray-500">$</span>&nbsp;';

interface Props {
  /**
   * Full input currently being typed or already executed.
   * When provided the component renders the shell prompt and colours the first word.
   */
  input?: string;
  /** Set to true for the live command line so a blinking caret is shown */
  live?: boolean;
  /** HTML string (legacy) shown if provided */
  html?: string;
  children?: React.ReactNode;
  className?: string;
  /** List of valid commands to highlight in green, otherwise red */
  valid?: string[];
}

const colourCmd = (cmd: string, valid?: string[]) => {
  const isValid = valid?.includes(cmd.toLowerCase());
  return (
    <span className={isValid ? 'text-green-400' : 'text-red-500'}>{cmd}</span>
  );
};

const PromptLine: React.FC<Props> = ({ input, live = false, html, children, className, valid = [] }) => {
  if (html) {
    return (
      <div
        className={`whitespace-pre ${className ?? ''}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  if (input !== undefined) {
    const spaceIdx = input.indexOf(' ');
    const cmd = spaceIdx === -1 ? input : input.slice(0, spaceIdx);
    const rest = spaceIdx === -1 ? '' : input.slice(spaceIdx + 1);

    const trailingSpace = input.endsWith(' ');
    return (
      <div className={`whitespace-pre ${className ?? ''}`}>
        <span dangerouslySetInnerHTML={{ __html: PREFIX_HTML }} />
        {colourCmd(cmd, valid)}
        {rest && <span className="text-white"> {rest}</span>}
        {!rest && trailingSpace && <>&nbsp;</>}
        {live && <Caret />}
      </div>
    );
  }

  return <div className={`whitespace-pre ${className ?? ''}`}>{children}</div>;
};

export default PromptLine;