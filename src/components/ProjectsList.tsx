import React, { useEffect, useRef, useState } from 'react';

export interface Project {
  title: string;
  status: 'DONE' | 'ACTIVE';
  description: string;
}

export const projects: Project[] = [
  {
    title: 'Project: E-commerce Platform',
    status: 'DONE',
    description: 'Engineered a complete, scalable e-commerce platform using a MERN stack.',
  },
  {
    title: 'Project: Real-time Chat App',
    status: 'DONE',
    description: 'Built a responsive, real-time chat application with WebSockets and Vue.js.',
  },
  {
    title: 'Hobby: Open Source Contribution',
    status: 'ACTIVE',
    description: 'Regular contributor to open-source projects, focusing on bug fixes and new features.',
  },
];

interface Props {
  animate?: boolean;
  onFinished?: () => void;
}

const ProjectsList: React.FC<Props> = ({ animate = false, onFinished }) => {
  const [rendered, setRendered] = useState<Project[]>(animate ? [] : projects);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  useEffect(() => {
    if (!animate) return;
    const interval = setInterval(() => {
      setRendered((prev) => {
        if (prev.length < projects.length) {
          return [...prev, projects[prev.length]];
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
      <div className="text-cyan-400 mb-4 text-base">Running: "projects"...</div>
      {rendered.map((proj) => {
        const statusColor = proj.status === 'DONE' ? 'text-green-400' : 'text-yellow-400';
        return (
          <div key={proj.title} className="text-sm md:text-base mb-6">
            <div className="flex items-center">
              <span className="text-white font-bold">{proj.title}</span>
              <span className="ml-4">
                [<span className={`${statusColor} font-bold`}>{proj.status}</span>]
              </span>
            </div>
            <p className="text-gray-400 mt-1 pl-2">{proj.description}</p>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectsList; 