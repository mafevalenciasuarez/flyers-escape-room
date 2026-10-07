import { useEffect, useState } from 'react';
import Pip from './Pip.jsx';
import Icon from './Icon.jsx';
import { useGame } from '../state/GameContext.jsx';

export const THINKING_MS = 700;

// After "Help, Pip!" Pip thinks for a moment before the new help step shows.
// The previous step stays hidden during that beat. The help level has already
// moved on in the item's state.
export function useThinkingBeat(helpKey = 0, hint = null) {
  const [prevKey, setPrevKey] = useState(helpKey);
  const [thinking, setThinking] = useState(false);
  const justAsked = helpKey > prevKey;
  if (justAsked) {
    setPrevKey(helpKey);
    setThinking(true);
  }

  useEffect(() => {
    if (!thinking) return undefined;
    const timer = setTimeout(() => setThinking(false), THINKING_MS);
    return () => clearTimeout(timer);
  }, [thinking, helpKey]);

  return thinking ? { thinking: true, hint: null } : { thinking: false, hint };
}

// Pip's speech area: shows the "why" after a right answer, or the current help
// step after a wrong try. Icons plus words, never colour alone.
export default function Feedback({ status, why, hint, wrongText, extra, helpKey = 0, hintLevel }) {
  const { t } = useGame();
  const beat = useThinkingBeat(helpKey, hint);
  // A later "Help, Pip!" replaces the green "Right" line. The line only stays
  // when this step is finished and there is no new clue to show.
  if (status === 'right' && !beat.thinking && !beat.hint) {
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
    const talks = !beat.thinking && (status === 'wrong' || beat.hint || extra);
    return (
      <Pip dock mood={beat.thinking ? 'thinking' : 'hint'} hintLevel={beat.thinking ? undefined : hintLevel} label={t('pipSays')} arrive={helpKey}>
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
