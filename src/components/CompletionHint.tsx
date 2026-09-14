import React from 'react';
import CommandButton from './CommandButton';

interface Props {
  suggestions: string[];
}

/** The candidate list a shell prints when Tab cannot complete any further. */
const CompletionHint: React.FC<Props> = ({ suggestions }) => (
  <div className="flex flex-wrap gap-x-6 gap-y-1 mb-2 text-sm md:text-base">
    {suggestions.map((command) => (
      <CommandButton key={command} command={command} />
    ))}
  </div>
);

export default CompletionHint;
