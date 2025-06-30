import React, { useEffect, useRef, useState, useCallback } from 'react';
import Caret from './Caret';
import useTyping from '../hooks/useTyping';

const introLines = [
  'I am Sebastian Susnik',
  'and I like to build stuff...'
];

const summaryLines: Array<React.ReactNode> = [
  (
    <>
      👋 Hi, I'm a <span className="text-cyan-400">full-stack developer</span> who loves transforming ideas into reliable, elegant software.
    </>
  ),
  '• Focus : TypeScript, React, Node, and cloud-native architectures.',
  '• Philosophy : Clean code, meaningful UX, and shipping fast without breaking things.',
  '• Currently : Building side-projects, contributing to open source and always learning.',
  ' '
];

const SummaryAnimated: React.FC<{ lines: Array<React.ReactNode>; animate?: boolean; onFinished?: () => void; onLineRendered?: () => void }> = ({ lines, animate = false, onFinished, onLineRendered }) => {
  const [rendered, setRendered] = useState<Array<React.ReactNode>>(animate ? [] : lines);
  const finishedRef = useRef(onFinished);
  const lineRenderedRef = useRef(onLineRendered);
  finishedRef.current = onFinished;
  lineRenderedRef.current = onLineRendered;

  useEffect(() => {
    if (!animate) return;
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
    <div className="space-y-2 mt-2">
      {rendered.map((l, idx) => (
        <p key={idx} className="text-gray-400 first:text-white whitespace-pre-wrap break-words">
          {l}
        </p>
      ))}
    </div>
  );
};

interface Props {
  animate?: boolean;
  showSummary?: boolean;
  onFinished?: () => void;
  onLineRendered?: () => void;
}

const About: React.FC<Props> = ({ animate = false, showSummary = false, onFinished, onLineRendered }) => {
  const [animating, setAnimating] = useState(animate);
  const [step, setStep] = useState(0); // 0 typing first line, 1 typing second, 2 done typing

  const next = () => setStep((s) => s + 1);

  // Skip handler
  const skip = useCallback(() => {
    if (!animating) return;
    setAnimating(false);
    setStep(2);
    onFinished?.();
  }, [animating, onFinished]);

  const typed1 = useTyping(step === 0 && animating ? introLines[0] : '', 50, () => {
    next();
    onLineRendered?.();
  });
  const typed2 = useTyping(step === 1 && animating ? introLines[1] : '', 50, () => {
    next();
    onLineRendered?.();
  });

  useEffect(() => {
    if (!animating) return;
    if (step === 2 && !showSummary) {
      onFinished?.();
    }
  }, [step, animating, showSummary, onFinished]);

  // Attach key and pointer listeners while animating for skip
  useEffect(() => {
    if (!animating) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.length === 1 || ["Enter", "Tab", "Escape", " "].includes(e.key)) {
        e.preventDefault();
        skip();
      }
    };
    const handlePointer = () => skip();
    window.addEventListener('keydown', handleKey);
    window.addEventListener('mousedown', handlePointer);
    window.addEventListener('touchstart', handlePointer, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('mousedown', handlePointer);
      window.removeEventListener('touchstart', handlePointer);
    };
  }, [animating, skip]);

  const renderIntro = (
    <>
      {/* line1 */}
      <div className="text-lg md:text-xl lg:text-2xl">
        <span>{animating ? (step > 0 ? introLines[0] : typed1) : introLines[0]}</span>
        {animating && step === 0 && <Caret />}
      </div>
      {/* line2 */}
      <div className="text-lg md:text-xl lg:text-2xl mb-4">
        <span>{animating ? (step > 1 ? introLines[1] : typed2) : introLines[1]}</span>
        {animating && step === 1 && <Caret />}
      </div>
    </>
  );

  const renderSummary = (
    <SummaryAnimated lines={summaryLines} animate={animating} onFinished={() => onFinished?.()} onLineRendered={onLineRendered} />
  );

  return (
    <div>
      {renderIntro}
      {showSummary && (!animating ? renderSummary : step === 2 && renderSummary)}
    </div>
  );
};

export default About; 