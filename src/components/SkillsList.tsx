import React, { useEffect, useRef, useState } from 'react';

export const skills = [
  'JavaScript (ES6+)',
  'React',
  'Vue.js',
  'Node.js',
  'Express',
  'HTML5 & CSS3',
  'Tailwind CSS',
  'SQL (PostgreSQL)',
  'NoSQL (MongoDB)',
  'AWS (EC2, S3)',
  'Docker',
  'Git & GitHub',
  'CI/CD',
  'REST APIs',
];

interface Props {
  animate?: boolean;
  onFinished?: () => void;
}

const SkillsList: React.FC<Props> = ({ animate = false, onFinished }) => {
  const [rendered, setRendered] = useState<string[]>(animate ? [] : skills);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  useEffect(() => {
    if (!animate) return;
    const interval = setInterval(() => {
      setRendered((prev) => {
        if (prev.length < skills.length) {
          return [...prev, skills[prev.length]];
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