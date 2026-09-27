import { format } from 'date-fns';
import type React from 'react';
import useStaggeredReveal from '../hooks/useStaggeredReveal';
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
    description:
      'Founding engineer on PixFit, a generative ad production platform, in production with its first enterprise customer. Before that, performance and creative operations, and the engineering handover of the Brkaway acquisition.',
  },
  {
    company: 'Sinapsis',
    role: 'Cloud Engineer',
    from: new Date(2022, 1, 1),
    to: new Date(2024, 6, 1),
    description:
      "Serverless backend for the Self-Realization Fellowship's annual global convocation: tens of thousands of attendees online at once, where downtime was not an option.",
  },
  {
    company: 'before software',
    role: 'Printer repair · Purchasing & logistics · Timber roofing',
    from: new Date(2012, 0, 1),
    to: new Date(2022, 1, 1),
    description: 'Ten years of other work before the first line of code.',
  },
];

interface Props {
  animate?: boolean;
  onFinished?: () => void;
  onLineRendered?: () => void;
}

const ExpList: React.FC<Props> = ({ animate = false, onFinished, onLineRendered }) => {
  const rendered = useStaggeredReveal(experiences, {
    animate,
    speed: 150,
    onFinished,
    onItemRendered: onLineRendered,
  });

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
              {format(exp.from, 'LLL yyyy')} –{' '}
              {exp.to === 'present' ? 'Present' : format(exp.to, 'LLL yyyy')}
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
