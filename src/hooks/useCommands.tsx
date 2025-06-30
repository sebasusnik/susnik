import React, { useCallback, useState } from 'react';
import About from '../components/About';
import ExpList from '../components/ExpList';
import SkillsList from '../components/SkillsList';
import HelpList from '../components/HelpList';
import Contact from '../components/Contact';
import NotFound from '../components/NotFound';
import EasterEgg from '../components/EasterEgg';

interface Line {
  id: number;
  html?: string;
  element?: React.ReactNode;
}

interface UseCommandsParams {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  addElement: (element: React.ReactNode) => void;
  setLines: React.Dispatch<React.SetStateAction<Line[]>>;
  setCleared: React.Dispatch<React.SetStateAction<boolean>>;
  resetIntro: () => void;
  scrollToBottom: () => void;
}

const useCommands = ({
  scrollRef,
  addElement,
  setLines,
  setCleared,
  resetIntro,
  scrollToBottom,
}: UseCommandsParams) => {
  const [busy, setBusy] = useState(false);

  const handleCommand = useCallback(
    (cmd: string) => {
      const word = cmd.split(' ')[0];
      setBusy(true);

      if (word === 'clear') {
        setLines([]);
        setCleared(true);
        setBusy(false);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
        return;
      }

      if (word === 'repeat') {
        resetIntro();
        setBusy(false);
        return;
      }

      if (word === 'help') {
        addElement(<HelpList animate onFinished={() => setBusy(false)} onLineRendered={scrollToBottom} />);
        return;
      }

      if (word === 'about') {
        addElement(<About animate showSummary onFinished={() => setBusy(false)} onLineRendered={scrollToBottom} />);
        return;
      }

      if (word === 'exp') {
        addElement(<ExpList animate onFinished={() => setBusy(false)} onLineRendered={scrollToBottom} />);
        return;
      }

      if (word === 'skills') {
        addElement(<SkillsList animate onFinished={() => setBusy(false)} onLineRendered={scrollToBottom} />);
        return;
      }

      if (word === 'contact') {
        addElement(<Contact animate onFinished={() => setBusy(false)} onLineRendered={scrollToBottom} />);
        return;
      }

      if (word === 'ls') {
        addElement(<EasterEgg command="ls" animate onFinished={() => setBusy(false)} onLineRendered={scrollToBottom} />);
        return;
      }

      if (word === 'pwd') {
        addElement(<EasterEgg command="pwd" animate onFinished={() => setBusy(false)} onLineRendered={scrollToBottom} />);
        return;
      }

      addElement(<NotFound command={cmd} animate onFinished={() => setBusy(false)} onLineRendered={scrollToBottom} />);
    },
    [addElement, scrollRef, setLines, setCleared, resetIntro, scrollToBottom]
  );

  return {
    handleCommand,
    busy,
  };
};

export default useCommands; 