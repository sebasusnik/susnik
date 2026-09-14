import React from 'react';
import useStaggeredReveal from '../hooks/useStaggeredReveal';
import CommandButton from './CommandButton';
import { suggestCommand } from '../utils/suggest';
import { validCommands } from '../utils/commands';

interface Props {
  command: string;
  animate?: boolean;
  onFinished?: () => void;
  onLineRendered?: () => void;
}

const NotFound: React.FC<Props> = ({ command, animate = false, onFinished, onLineRendered }) => {
  const suggestion = suggestCommand(command, validCommands);

  const lines: React.ReactNode[] = [
    `Command not found: ${command}.`,
    suggestion ? (
      <span key="suggest">
        Did you mean <CommandButton command={suggestion} />?
      </span>
    ) : (
      <span key="suggest">
        Type <CommandButton command="help" />.
      </span>
    ),
  ];

  const rendered = useStaggeredReveal(lines, {
    animate,
    onFinished,
    onItemRendered: onLineRendered,
  });

  return (
    <div className="mt-2 mb-4 text-sm md:text-base space-y-1 pl-2">
      {rendered.map((l, idx) => (
        <p key={idx} className="text-gray-400 first:text-red-500">
          {l}
        </p>
      ))}
    </div>
  );
};

export default NotFound;
