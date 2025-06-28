import React, { useEffect, useRef, useState } from 'react';
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

const SummaryAnimated: React.FC<{ lines: Array<React.ReactNode>; animate?: boolean; onFinished?: () => void }> = ({ lines, animate = false, onFinished }) => {
  const [rendered, setRendered] = useState<Array<React.ReactNode>>(animate ? [] : lines);
  const finishedRef = useRef(onFinished);
  finishedRef.current = onFinished;

  useEffect(() => {
    if (!animate) return;
    const interval = setInterval(() => {
      setRendered((prev) => {
        if (prev.length < lines.length) {
          return [...prev, lines[prev.length]];
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
        <p key={idx} className="text-gray-400 first:text-white">
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
}

const About: React.FC<Props> = ({ animate = false, showSummary = false, onFinished }) => {
  const [step, setStep] = useState(0); // 0 typing first line, 1 typing second, 2 done typing

  const next = () => setStep((s) => s + 1);

  const typed1 = useTyping(step === 0 && animate ? introLines[0] : '', 50, next);
  const typed2 = useTyping(step === 1 && animate ? introLines[1] : '', 50, next);

  useEffect(() => {
    if (!animate) return;
    if (step === 2 && !showSummary) {
      onFinished?.();
    }
  }, [step, animate, showSummary, onFinished]);

  const renderIntro = (
    <>
      {/* line1 */}
      <div className="text-lg md:text-xl lg:text-2xl">
        <span>{animate ? (step > 0 ? introLines[0] : typed1) : introLines[0]}</span>
        {animate && step === 0 && <Caret />}
      </div>
      {/* line2 */}
      <div className="text-lg md:text-xl lg:text-2xl mb-4">
        <span>{animate ? (step > 1 ? introLines[1] : typed2) : introLines[1]}</span>
        {animate && step === 1 && <Caret />}
      </div>
    </>
  );

  const renderSummary = (
    <SummaryAnimated lines={summaryLines} animate={animate} onFinished={() => onFinished?.()} />
  );

  return (
    <div>
      {renderIntro}
      {showSummary && (!animate ? renderSummary : step === 2 && renderSummary)}
    </div>
  );
};

export default About; 