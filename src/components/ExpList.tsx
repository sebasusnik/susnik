import React, { useEffect, useRef, useState } from 'react';
import { format, differenceInMonths } from 'date-fns';
import { formatDuration } from '../utils/dates';

export interface Experience {
  company: string;
  role: string;
  from: Date;
  to: Date | 'present';
  description: string;
}

export const experiences: Experience[] = [
  {
    company: 'Winclap',
    role: 'Software Engineer',
    from: new Date(2024, 6, 1),
    to: 'present',
    description: 'Part of the engineering team, building solutions that enable growth transformation for our clients.',
  },
  {
    company: 'Sinapsis',
    role: 'Cloud Engineer',
    from: new Date(2022, 1, 1),
    to: new Date(2024, 6, 1),
    description: 'Built proof-of-concepts and enhanced existing client products, delivering tangible value and cloud-native solutions.',
  },
];

interface Props {
  animate?: boolean;
  onFinished?: () => void;
  onLineRendered?: () => void;
}

const ExpList: React.FC<Props> = ({ animate = false, onFinished, onLineRendered }) => {
  const [rendered, setRendered] = useState<Experience[]>(animate ? [] : experiences);
  const onFinishedRef = useRef(onFinished);
  const lineRenderedRef = useRef(onLineRendered);
  onFinishedRef.current = onFinished;
  lineRenderedRef.current = onLineRendered;

  useEffect(() => {
    if (!animate) return;
    const interval = setInterval(() => {
      setRendered((prev) => {
        if (prev.length < experiences.length) {
          const newRendered = [...prev, experiences[prev.length]];
          // Trigger scroll after a small delay to ensure DOM is updated
          setTimeout(() => {
            lineRenderedRef.current?.();
          }, 10);
          return newRendered;
        }
        clearInterval(interval);
        if (onFinishedRef.current) onFinishedRef.current();
        return prev;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [animate]);

  return (
    <div className="mt-2 mb-4 whitespace-pre-wrap break-words">
      <div className="text-cyan-400 mb-4 text-base">Running: "experience"...</div>
      {rendered.map((exp) => (
        <div key={`${exp.company}-${exp.role}`} className="text-sm md:text-base mb-6 pl-2">
          <div className="text-white font-bold flex flex-wrap items-center gap-x-2">
            {exp.role}
            <span className="text-cyan-400">@ {exp.company}</span>
          </div>
          <div className="text-gray-400 flex flex-wrap gap-x-2">
            <span className="text-amber-200">
              {format(exp.from, 'LLL yyyy')} – {exp.to === 'present' ? 'Present' : format(exp.to, 'LLL yyyy')}
            </span>
            <span>·</span>
            <span>{formatDuration(exp)}</span>
          </div>
          <p className="text-gray-400 mt-1">{exp.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ExpList; 