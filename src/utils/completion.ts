export interface Completion {
  /** The input, advanced as far as it can go unambiguously. */
  value: string;
  /** Candidates to list, when completing further would be a guess. */
  suggestions: string[];
}

const longestCommonPrefix = (values: string[]) =>
  values.reduce((prefix, value) => {
    let i = 0;
    while (i < prefix.length && i < value.length && prefix[i] === value[i]) i += 1;
    return prefix.slice(0, i);
  });

/**
 * Completes the command word, the way a shell does: fill in as far as the
 * candidates agree, and only list them once the prefix stops growing.
 */
export function completeCommand(input: string, commands: string[]): Completion {
  const word = input.trimStart().toLowerCase();

  // Nothing here takes arguments, so there is nothing to complete past the
  // first word.
  if (/\s/.test(word)) return { value: input, suggestions: [] };

  const matches = commands.filter((command) => command.startsWith(word));
  if (matches.length === 0) return { value: input, suggestions: [] };
  if (matches.length === 1) return { value: matches[0], suggestions: [] };

  const prefix = longestCommonPrefix(matches);
  return { value: prefix, suggestions: prefix === word ? matches : [] };
}
