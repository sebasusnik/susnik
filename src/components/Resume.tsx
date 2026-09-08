import React from 'react';
import useStaggeredReveal from '../hooks/useStaggeredReveal';

/** Lives in public/, so it is served straight from the CDN. */
const RESUME_PATH = '/resume.pdf';

interface Props {
  animate?: boolean;
  onFinished?: () => void;
  onLineRendered?: () => void;
}

const Resume: React.FC<Props> = ({ animate = false, onFinished, onLineRendered }) => {
  const lines: React.ReactNode[] = [
    'Fetching the latest copy...',
    <a
      key="pdf"
      href={RESUME_PATH}
      download
      className="text-cyan-400 underline decoration-dotted underline-offset-4 hover:text-cyan-300 hover:decoration-solid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
    >
      resume.pdf
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
      <div className="text-cyan-400 mb-2">Running: "resume"...</div>
      <div className="space-y-1 pl-2">
        {rendered.map((line, idx) => (
          <p key={idx} className={idx === 0 ? 'text-white' : 'text-gray-400'}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Resume;
