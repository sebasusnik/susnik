import React, { useEffect, useRef, useState } from 'react';

export interface Experience {
  company: string;
  role: string;
  employment: string;
  period: string;
  description: string;
}

export const experiences: Experience[] = [
  {
    company: 'Winclap',
    role: 'Software Engineer',
    employment: 'Full-time',
    period: 'Jul 2024 – Present · 1 mo',
    description: 'Part of the engineering team, building solutions that enable growth transformation for our clients.',
  },
  {
    company: 'Sinapsis',
    role: 'Cloud Engineer',
    employment: 'Full-time',
    period: 'Feb 2022 – Jul 2024 · 2 yrs 6 mos',
    description: 'Built proof-of-concepts and enhanced existing client products, delivering tangible value and cloud-native solutions.',
  },
];

interface Props {
  animate?: boolean;
  onFinished?: () => void;
}

const ProjectsList: React.FC<Props> = ({ animate = false, onFinished }) => {
  const [rendered, setRendered] = useState<Experience[]>(animate ? [] : experiences);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  useEffect(() => {
    if (!animate) return;
    const interval = setInterval(() => {
      setRendered((prev) => {
        if (prev.length < experiences.length) {
          return [...prev, experiences[prev.length]];
        }
        clearInterval(interval);
        if (onFinishedRef.current) onFinishedRef.current();
        return prev;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [animate]);

  return (
    <div className="mt-2 mb-4">
      <div className="text-cyan-400 mb-4 text-base">Running: "experience"...</div>
      {rendered.map((exp) => (
        <div key={`${exp.company}-${exp.role}`} className="text-sm md:text-base mb-6 pl-2">
          <div className="text-white font-bold flex flex-wrap items-center gap-x-2">
            {exp.role}
            <span className="text-cyan-400">@ {exp.company}</span>
          </div>
          <div className="text-gray-400 flex flex-wrap gap-x-2">
            <span>{exp.employment}</span>
            <span>·</span>
            <span>{exp.period}</span>
          </div>
          <p className="text-gray-400 mt-1">{exp.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ProjectsList; 