import React, { useCallback, useState } from 'react';
import About from '../components/About';
import ExpList from '../components/ExpList';
import SkillsList from '../components/SkillsList';
import HelpList from '../components/HelpList';
import Contact from '../components/Contact';
import Resume from '../components/Resume';
import NotFound from '../components/NotFound';
import EasterEgg from '../components/EasterEgg';

interface OutputProps {
  animate?: boolean;
  onFinished?: () => void;
  onLineRendered?: () => void;
}

/** Commands whose only job is to render a block of output. */
const outputs: Record<string, React.ComponentType<OutputProps>> = {
  help: HelpList,
  about: (props) => <About showSummary {...props} />,
  exp: ExpList,
  skills: SkillsList,
  contact: Contact,
  resume: Resume,
  ls: (props) => <EasterEgg command="ls" {...props} />,
  pwd: (props) => <EasterEgg command="pwd" {...props} />,
};

interface UseCommandsParams {
  addElement: (element: React.ReactNode) => void;
  clearScreen: () => void;
  resetIntro: () => void;
  scrollToBottom: () => void;
}

const useCommands = ({ addElement, clearScreen, resetIntro, scrollToBottom }: UseCommandsParams) => {
  const [busy, setBusy] = useState(false);

  const handleCommand = useCallback(
    (cmd: string) => {
      const word = cmd.trim().toLowerCase().split(' ')[0];

      // These act on the terminal itself and render nothing, so they never
      // occupy the prompt.
      if (word === 'clear') {
        clearScreen();
        setBusy(false);
        return;
      }

      if (word === 'repeat') {
        resetIntro();
        setBusy(false);
        return;
      }

      setBusy(true);
      const Output = outputs[word];

      if (Output) {
        addElement(
          <Output animate onFinished={() => setBusy(false)} onLineRendered={scrollToBottom} />
        );
        return;
      }

      addElement(
        <NotFound
          command={cmd}
          animate
          onFinished={() => setBusy(false)}
          onLineRendered={scrollToBottom}
        />
      );
    },
    [addElement, clearScreen, resetIntro, scrollToBottom]
  );

  /** Frees the prompt when the visitor interrupts with Ctrl+C. */
  const abort = useCallback(() => setBusy(false), []);

  return {
    handleCommand,
    abort,
    busy,
  };
};

export default useCommands;
