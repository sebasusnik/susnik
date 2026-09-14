import React from 'react';
import useStaggeredReveal from '../hooks/useStaggeredReveal';

interface Props {
  animate?: boolean;
  onFinished?: () => void;
  onLineRendered?: () => void;
}

const Contact: React.FC<Props> = ({ animate = false, onFinished, onLineRendered }) => {
  const lines: React.ReactNode[] = [
    'You can reach me at:',
    <a
      href="mailto:sebasusnik@gmail.com"
      className="text-cyan-400 underline"
      key="email"
    >
      sebasusnik@gmail.com
    </a>,
  ];

  const rendered = useStaggeredReveal(lines, {
    animate,
    speed: 150,
    onFinished,
    onItemRendered: onLineRendered,
  });

  return (
    <div className="mt-2 mb-4 text-sm md:text-base">
      <div className="text-cyan-400 mb-2">Running: "contact"...</div>
      <div className="space-y-1 pl-2">
        {rendered.map((line, idx) => (
          <p
            key={idx}
            className={idx === 0 ? 'text-white' : 'text-gray-400'}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Contact;
