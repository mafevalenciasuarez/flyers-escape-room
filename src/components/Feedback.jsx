import { useEffect, useRef, useState } from 'react';
import Pip from './Pip.jsx';
import Icon from './Icon.jsx';
import { useGame } from '../state/GameContext.jsx';

export const THINKING_MS = 700;

// After "Help, Pip!" Pip thinks for a moment before the new help step shows.
// Display only: the help level has already moved on in the item's state.
export function useThinkingBeat(helpKey = 0, hint = null) {
  const [beat, setBeat] = useState(null);
  const lastKey = useRef(helpKey);
  const lastHint = useRef(hint);

  useEffect(() => {
    if (helpKey > lastKey.current) {
      setBeat({ held: lastHint.current });
      const timer = setTimeout(() => setBeat(null), THINKING_MS);
      lastKey.current = helpKey;
      return () => clearTimeout(timer);
    }
    lastKey.current = helpKey;
    return undefined;
  }, [helpKey]);

  useEffect(() => {
    if (!beat) lastHint.current = hint;
  });

  return beat ? { thinking: true, hint: beat.held } : { thinking: false, hint };
}

// Pip's speech area: shows the "why" after a right answer, or the current help
// step after a wrong try. Icons plus words, never colour alone.
export default function Feedback({ status, why, hint, wrongText, extra, helpKey = 0, hintLevel }) {
  const { t } = useGame();
  const beat = useThinkingBeat(helpKey, hint);
  if (status === 'right') {
    return (
      <Pip mood="happy" label={t('pipSays')}>
        <strong className="fb-right">
          <Icon name="check" /> {t('right')}
        </strong>{' '}
        {why}
        {extra}
      </Pip>
    );
  }
  if (status === 'wrong' || beat.hint || beat.thinking) {
    const talks = status === 'wrong' || beat.hint || extra;
    return (
      <Pip mood={beat.thinking ? 'thinking' : 'hint'} hintLevel={beat.thinking ? undefined : hintLevel} label={t('pipSays')}>
        {talks ? (
          <>
            {status === 'wrong' ? (
              <strong className="fb-wrong">
                <Icon name="replay" /> {wrongText || t('notYet')}
              </strong>
            ) : null}{' '}
            {beat.hint}
            {extra}
          </>
        ) : null}
      </Pip>
    );
  }
  return null;
}
