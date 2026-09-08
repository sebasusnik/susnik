/**
 * Optimal string alignment distance: Levenshtein plus transpositions.
 *
 * Swapping two adjacent letters is the most common typo there is, and plain
 * Levenshtein scores it as two edits — enough to push 'hepl' out of range of
 * 'help' on any budget tight enough to be useful.
 */
const distance = (a: string, b: string) => {
  let beforePrevious: number[] = [];
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];

    for (let j = 1; j <= b.length; j += 1) {
      const substitution = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + substitution
      );

      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        current[j] = Math.min(current[j], beforePrevious[j - 2] + 1);
      }
    }

    beforePrevious = previous;
    previous = current;
  }

  return previous[b.length];
};

/**
 * Finds the command a typo most likely meant. Short commands get a tighter
 * budget, because at two edits away 'ls' is close to half the alphabet.
 */
export function suggestCommand(input: string, commands: string[]): string | undefined {
  const word = input.trim().toLowerCase().split(' ')[0];
  if (!word) return undefined;

  const prefixMatch = commands.find((command) => command.startsWith(word));
  if (prefixMatch) return prefixMatch;

  const budget = word.length <= 4 ? 1 : 2;
  let best: string | undefined;
  let bestDistance = Infinity;

  for (const command of commands) {
    const d = distance(word, command);
    if (d <= budget && d < bestDistance) {
      best = command;
      bestDistance = d;
    }
  }

  return best;
}
