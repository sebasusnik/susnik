import React, { useEffect, useState } from 'react';
import TypedText from './TypedText';
import useTyping from '../hooks/useTyping';
import useStaggeredReveal from '../hooks/useStaggeredReveal';

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
  const rendered = useStaggeredReveal(lines, {
    animate,
    onFinished,
    onItemRendered: onLineRendered,
  });

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
  const [step, setStep] = useState(0); // 0 typing first line, 1 typing second, 2 done typing

  const next = () => setStep((s) => s + 1);

  const typed1 = useTyping(step === 0 && animate ? introLines[0] : '', 50, () => {
    next();
    onLineRendered?.();
  });
  const typed2 = useTyping(step === 1 && animate ? introLines[1] : '', 50, () => {
    next();
    onLineRendered?.();
  });

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
        <TypedText
          text={introLines[0]}
          typed={typed1.text}
          typing={animate && step === 0}
          showCaret={animate && step === 0}
        />
      </div>
      {/* line2 */}
      <div className="text-lg md:text-xl lg:text-2xl mb-4">
        <TypedText
          text={introLines[1]}
          typed={typed2.text}
          typing={animate && step === 1}
          showCaret={animate && step === 1}
        />
      </div>
    </>
  );

  const renderSummary = (
    <SummaryAnimated lines={summaryLines} animate={animate} onFinished={() => onFinished?.()} onLineRendered={onLineRendered} />
  );

  return (
    <div>
      {renderIntro}
      {showSummary && (!animate ? renderSummary : step === 2 && renderSummary)}
    </div>
  );
};

export default About; 