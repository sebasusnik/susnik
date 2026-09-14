import React from 'react';
import useStaggeredReveal from '../hooks/useStaggeredReveal';

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
  const rendered = useStaggeredReveal(skills, {
    animate,
    speed: 35,
    onFinished,
    onItemRendered: onLineRendered,
  });

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
