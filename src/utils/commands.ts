/** Everything the prompt accepts. Drives colouring, completion and suggestions. */
export const validCommands = [
  'about',
  'exp',
  'skills',
  'contact',
  'resume',
  'help',
  'repeat',
  'clear',
  'ls',
  'pwd',
];

/**
 * Commands worth reflecting in the URL, so a visitor can link straight to a
 * section instead of describing which word to type.
 */
export const deepLinkCommands = ['about', 'exp', 'skills', 'contact', 'resume'];
