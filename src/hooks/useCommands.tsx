import React, { useCallback, useState } from 'react';
import About from '../components/About';
import ProjectsList from '../components/ProjectsList';
import SkillsList from '../components/SkillsList';

interface Line {
  id: number;
  html?: string;
  element?: React.ReactNode;
}

interface UseCommandsParams {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  addLine: (html: string) => void;
  addElement: (element: React.ReactNode) => void;
  setLines: React.Dispatch<React.SetStateAction<Line[]>>;
  setCleared: React.Dispatch<React.SetStateAction<boolean>>;
}

const useCommands = ({
  scrollRef,
  addLine,
  addElement,
  setLines,
  setCleared,
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

      if (word === 'help') {
        addLine(
          `<p class="mb-1">Available commands: <span class="text-cyan-400">about, projects, skills, contact, clear, help</span></p>`
        );
        setBusy(false);
        return;
      }

      if (word === 'about') {
        addElement(<About animate showSummary onFinished={() => setBusy(false)} />);
        return;
      }

      if (word === 'projects') {
        addElement(<ProjectsList animate onFinished={() => setBusy(false)} />);
        return;
      }

      if (word === 'skills') {
        addLine(`<div class="text-cyan-400 mb-4 text-base">Running: \"skills\"...</div>`);
        addElement(<SkillsList animate onFinished={() => setBusy(false)} />);
        return;
      }

      addLine(
        `<p>Command not found: ${cmd}. Type <span class="text-cyan-400">help</span>.</p>`
      );
      setBusy(false);
    },
    [addLine, addElement, scrollRef, setLines, setCleared]
  );

  return {
    handleCommand,
    busy,
  };
};

export default useCommands; 