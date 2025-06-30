import React, { useEffect, useRef, useState } from 'react';

export const skills = [
  'Typescript',
  'React',
  'Node.js',
  'Tailwind CSS',
  'SQL',
  'AWS',
];

interface Props {
  animate?: boolean;
  onFinished?: () => void;
  onLineRendered?: () => void;
}

const SkillsList: React.FC<Props> = ({ animate = false, onFinished, onLineRendered }) => {
  const [rendered, setRendered] = useState<string[]>(animate ? [] : skills);
  const onFinishedRef = useRef(onFinished);
  const lineRenderedRef = useRef(onLineRendered);
  onFinishedRef.current = onFinished;
  lineRenderedRef.current = onLineRendered;

  useEffect(() => {
    if (!animate) return;
    const interval = setInterval(() => {
      setRendered((prev) => {
        if (prev.length < skills.length) {
          const newRendered = [...prev, skills[prev.length]];
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
    }, 35);
    return () => clearInterval(interval);
  }, [animate]);

  return (
    <div className="mt-2 mb-4">
      <div className="text-cyan-400 mb-4 text-base">Running: "skills"...</div>
      <h3 className="text-lg text-cyan-400 font-bold mb-2">Core Competencies:</h3>
      <div className="flex flex-wrap gap-x-8 gap-y-2 pl-2">
        {rendered.map((skill) => (
          <span key={skill} className="text-white">
            - {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SkillsList; 