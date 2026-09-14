import React from 'react';
import useStaggeredReveal from '../hooks/useStaggeredReveal';
import CommandButton from './CommandButton';

interface Props {
  animate?: boolean;
  onFinished?: () => void;
  onLineRendered?: () => void;
}

const items = [
  { cmd: 'about', desc: 'Who I am' },
  { cmd: 'exp', desc: 'View my experience' },
  { cmd: 'skills', desc: 'See my competencies' },
  { cmd: 'contact', desc: 'Get in touch' },
  { cmd: 'resume', desc: 'Download my CV' },
  { cmd: 'clear', desc: 'Clear the terminal' },
  { cmd: 'repeat', desc: 'Replay the intro' },
];

const HelpList: React.FC<Props> = ({ animate = false, onFinished, onLineRendered }) => {
  const rendered = useStaggeredReveal(items, {
    animate,
    onFinished,
    onItemRendered: onLineRendered,
  });

  return (
    <div className="mt-2 mb-4 text-sm md:text-base">
      <p className="mb-1">Available commands (type them, or click):</p>
      <ul className="list-disc list-inside pl-4 leading-relaxed">
        {rendered.map(({ cmd, desc }) => (
          <li key={cmd}>
            <CommandButton command={cmd} /> – {desc}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HelpList;
