import React from 'react';
import CommandButton from './CommandButton';

const hints = ['about', 'exp', 'skills', 'contact', 'resume', 'help'];

/**
 * Closes the intro with a row of tappable commands.
 *
 * Without it the clickable output is unreachable on a phone: every command is
 * clickable once `help` has run, but running `help` needs a keyboard, which is
 * exactly what a phone does not have.
 */
const CommandHints: React.FC = () => (
  <div className="mt-4 mb-2 text-sm md:text-base">
    <span className="text-gray-500">try: </span>
    <span className="inline-flex flex-wrap gap-x-4 gap-y-1 align-top">
      {hints.map((command) => (
        <CommandButton key={command} command={command} />
      ))}
    </span>
  </div>
);

export default CommandHints;
