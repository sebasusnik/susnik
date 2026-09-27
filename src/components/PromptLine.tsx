import type React from 'react';
import Caret from './Caret';

const prefix = (
  <span>
    <span className="text-fuchsia-400">sebasusnik@portfolio</span>
    <span className="text-gray-500">:</span>
    <span className="text-cyan-400">~</span>
    <span className="text-gray-500">$</span>&nbsp;
  </span>
);

interface Props {
  input?: string;
  live?: boolean;
  children?: React.ReactNode;
  className?: string;
  valid?: string[];
}

const colourCmd = (cmd: string, valid?: string[]) => {
  const isValid = valid?.includes(cmd.toLowerCase());
  return <span className={isValid ? 'text-green-400' : 'text-red-500'}>{cmd}</span>;
};

const PromptLine: React.FC<Props> = ({ input, live = false, children, className, valid = [] }) => {
  if (input !== undefined) {
    const spaceIdx = input.indexOf(' ');
    const cmd = spaceIdx === -1 ? input : input.slice(0, spaceIdx);
    const rest = spaceIdx === -1 ? '' : input.slice(spaceIdx + 1);

    const trailingSpace = input.endsWith(' ');
    return (
      <div className={`whitespace-pre ${className ?? ''}`}>
        {prefix}
        {colourCmd(cmd, valid)}
        {rest && <span className="text-white"> {rest}</span>}
        {!rest && trailingSpace && <>&nbsp;</>}
        {live && <Caret />}
      </div>
    );
  }

  return <div className={`whitespace-pre-wrap ${className ?? ''}`}>{children}</div>;
};

export default PromptLine;
