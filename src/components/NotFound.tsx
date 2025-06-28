import React, { useEffect, useRef, useState } from 'react';

interface Props {
  command: string;
  animate?: boolean;
  onFinished?: () => void;
}

const NotFound: React.FC<Props> = ({ command, animate = false, onFinished }) => {
  const lines: React.ReactNode[] = [
    `Command not found: ${command}.`,
    <span key="suggest">Type <span className="text-cyan-400">help</span>.</span>,
  ];

  const [rendered, setRendered] = useState<React.ReactNode[]>(animate ? [] : lines);
  const finishedRef = useRef(onFinished);
  finishedRef.current = onFinished;

  useEffect(() => {
    if (!animate) return;
    const interval = setInterval(() => {
      setRendered((prev) => {
        if (prev.length < lines.length) {
          return [...prev, lines[prev.length]];
        }
        clearInterval(interval);
        finishedRef.current?.();
        return prev;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [animate]);

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