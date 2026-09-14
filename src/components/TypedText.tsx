import React from 'react';
import Caret from './Caret';

interface Props {
  /** The complete line. */
  text: string;
  /** How much of it is currently revealed on screen. */
  typed: string;
  /** Whether the reveal is still in progress. */
  typing: boolean;
  showCaret?: boolean;
}

/**
 * Renders a character-by-character reveal without making screen reader users
 * sit through it. The partial text is hidden from assistive tech and the whole
 * line is exposed at once instead; when the reveal ends both collapse into a
 * single node, so the text is never duplicated in browse mode.
 *
 * This matters because the surrounding log region uses
 * `aria-relevant="additions"`: text mutations are not announced, so a line that
 * animates in place would otherwise never be announced at all.
 */
const TypedText: React.FC<Props> = ({ text, typed, typing, showCaret = false }) =>
  typing ? (
    <>
      <span aria-hidden="true">{typed}</span>
      <span className="sr-only">{text}</span>
      {showCaret && <Caret />}
    </>
  ) : (
    <span>{text}</span>
  );

export default TypedText;
