import React from 'react';

interface Props {
  command: 'ls' | 'pwd';
  animate?: boolean;
  onFinished?: () => void;
  onLineRendered?: () => void;
}

const EasterEgg: React.FC<Props> = ({ command, animate = false, onFinished, onLineRendered }) => {
  const lsLines: React.ReactNode[] = [
    <div key="total" className="text-gray-400 mb-2">total 8</div>,
    <div key="skills" className="mb-1">
      <span className="text-blue-400">drwx------</span>
      <span className="ml-2 text-white">skills/</span>
    </div>,
    <div key="exp" className="mb-1">
      <span className="text-blue-400">drwx------</span>
      <span className="ml-2 text-white">experience/</span>
    </div>,
    <div key="readme" className="mb-1">
      <span className="text-green-400">-rw-------</span>
      <span className="ml-2 text-white">README.md</span>
    </div>,
    <div key="contact" className="mb-1">
      <span className="text-green-400">-rw-------</span>
      <span className="ml-2 text-white">contact_info.txt</span>
    </div>,
    <div key="quip1" className="text-amber-200 mt-4">Oh, you tried 'ls'?</div>,
    <div key="quip2" className="text-gray-400 mt-1">This isn't actually a shell, but I appreciate the muscle memory.</div>,
  ];

  const pwdLines: React.ReactNode[] = [
    <div key="path" className="text-white mb-2">/home/portfolio/sebastian_usnik</div>,
    <div key="quip1" className="text-amber-200 mt-4">Let me guess, checking if you're in the right directory?</div>,
    <div key="quip2" className="text-gray-400 mt-1">Spoiler alert: you're exactly where you need to be.</div>,
  ];

  const lines = command === 'ls' ? lsLines : pwdLines;

  const [rendered, setRendered] = React.useState<React.ReactNode[]>(animate ? [] : lines);
  const finishedRef = React.useRef(onFinished);
  const lineRenderedRef = React.useRef(onLineRendered);
  finishedRef.current = onFinished;
  lineRenderedRef.current = onLineRendered;

  React.useEffect(() => {
    if (!animate) {
      if (finishedRef.current) finishedRef.current();
      return;
    }

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
    }, 120);

    return () => clearInterval(interval);
  }, [animate, lines]);

  return (
    <div className="mt-2 mb-4 whitespace-pre-wrap break-all">
      <div className="text-sm md:text-base font-mono pl-2">
        {rendered.map((line, idx) => (
          <React.Fragment key={idx}>{line}</React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default EasterEgg; 