import React, { useEffect, useRef, useState } from 'react';

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

  const [rendered, setRendered] = useState<React.ReactNode[]>(animate ? [] : lines);
  const finishedRef = useRef(onFinished);
  const lineRenderedRef = useRef(onLineRendered);
  finishedRef.current = onFinished;
  lineRenderedRef.current = onLineRendered;

  useEffect(() => {
    if (!animate) return;
    const interval = setInterval(() => {
      setRendered((prev) => {
        if (prev.length < lines.length) {
          const newRendered = [...prev, lines[prev.length]];
          // Trigger scroll after a small delay to ensure DOM is updated
          setTimeout(() => {
            lineRenderedRef.current?.();
          }, 10);
          return newRendered;
        }
        clearInterval(interval);
        finishedRef.current?.();
        return prev;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [animate]);

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