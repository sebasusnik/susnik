import React from 'react';
import useStaggeredReveal from '../hooks/useStaggeredReveal';

interface Props {
  command: string;
  animate?: boolean;
  onFinished?: () => void;
  onLineRendered?: () => void;
}

const NotFound: React.FC<Props> = ({ command, animate = false, onFinished, onLineRendered }) => {
  const lines: React.ReactNode[] = [
    `Command not found: ${command}.`,
    <span key="suggest">Type <span className="text-cyan-400">help</span>.</span>,
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
