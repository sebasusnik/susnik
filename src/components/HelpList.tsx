import React from 'react';

interface Props {
  animate?: boolean;
  onFinished?: () => void;
  onLineRendered?: () => void;
}

const items = [
  { cmd: 'about', desc: 'Who I am' },
  { cmd: 'exp', desc: 'View my experience' },
  { cmd: 'skills', desc: 'See my competencies' },
  { cmd: 'contact', desc: 'Get in touch' },
  { cmd: 'clear', desc: 'Clear the terminal' },
  { cmd: 'repeat', desc: 'Replay the intro' },
];

const HelpList: React.FC<Props> = ({ animate = false, onFinished, onLineRendered }) => {
  const [rendered, setRendered] = React.useState<typeof items>(animate ? [] : items);
  const finishedRef = React.useRef(onFinished);
  const lineRenderedRef = React.useRef(onLineRendered);
  finishedRef.current = onFinished;
  lineRenderedRef.current = onLineRendered;

  React.useEffect(() => {
    if (!animate) return;
    const interval = setInterval(() => {
      setRendered((prev) => {
        if (prev.length < items.length) {
          const newRendered = [...prev, items[prev.length]];
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
    }, 120);
    return () => clearInterval(interval);
  }, [animate]);

  return (
    <div className="mt-2 mb-4 text-sm md:text-base">
      <p className="mb-1">Available commands:</p>
      <ul className="list-disc list-inside pl-4 leading-tight">
        {rendered.map(({ cmd, desc }) => (
          <li key={cmd}>
            <span className="text-cyan-400">{cmd}</span> – {desc}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HelpList; 