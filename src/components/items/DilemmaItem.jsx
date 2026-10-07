import { useMemo, useState } from 'react';
import { useGame } from '../../state/GameContext.jsx';
import { shuffle } from '../../lib/util.js';
import AudioPlayer from '../AudioPlayer.jsx';
import ImageSlot from '../ImageSlot.jsx';
import Pip from '../Pip.jsx';
import Icon from '../Icon.jsx';
import { Button, Instruction } from '../Bilingual.jsx';

// Pip's own dilemmas: checking Pip against a text is the fact-check (thinking);
// the one without a text is Pip offering to do the work (sideways glance).
function speakerMood(item) {
  if (item.speaker !== 'Pip') return null;
  return item.text ? 'thinking' : 'sideways';
}

const LETTERS = ['A', 'B', 'C', 'D'];

// Ethics dilemma: every choice gets a reason. The kind and fair choice ends the item;
// other choices say "Think again" with a reason. No "wrong" screen.
export default function DilemmaItem({ item, onDone, onPlayingChange }) {
  const { t, es, dispatch, sound } = useGame();
  const options = useMemo(() => shuffle(item.options), [item]);
  const [picked, setPicked] = useState(null);
  const [wrongs, setWrongs] = useState(0);
  const [tried, setTried] = useState(new Set());
  const best = picked === item.answer;
  const pickedOption = item.options.find((o) => o.id === picked);

  const choose = (id) => {
    if (best) return;
    const ok = id === item.answer;
    setPicked(id);
    dispatch({ type: 'ANSWER', correct: ok });
    if (ok) sound('right');
    if (!ok) {
      setWrongs((w) => w + 1);
      setTried((s) => new Set(s).add(id));
    }
  };

  return (
    <div className={`item item-dilemma${item.image ? ' has-picture' : ''}`}>
      <Instruction icon={item.audio ? 'headphones' : 'text'} en={item.instruction} es={item.instructionEs} as="h2" />
      <div className="dilemma-layout">
        <div className="dilemma-main">
          <div className="dilemma-scene">
            {speakerMood(item) && !pickedOption ? <Pip mood={speakerMood(item)} /> : null}
            {item.audio ? <AudioPlayer clipId={item.audio} unlimited label={item.speaker} onPlayingChange={onPlayingChange} /> : null}
          </div>
          {item.text ? (
            <div className="reading-card">
              <p>{item.text}</p>
            </div>
          ) : null}
          <div className="options options-dilemma" role="group" aria-label={item.instruction}>
            {options.map((o, i) => (
              <button
                key={o.id}
                type="button"
                data-option-id={o.id}
                className={`option ${picked === o.id ? 'is-selected' : ''} ${best && o.id === item.answer ? 'is-right' : ''} ${tried.has(o.id) ? 'is-tried' : ''}`}
                aria-pressed={picked === o.id}
                aria-label={`${LETTERS[i]}: ${o.text}`}
                disabled={best}
                onClick={() => choose(o.id)}
              >
                <span className="option-letter" aria-hidden="true">{LETTERS[i]}</span>
                <span className="option-text">{o.text}</span>
                {best && o.id === item.answer ? <Icon name="check" className="option-mark" /> : null}
                {tried.has(o.id) ? <Icon name="replay" className="option-mark" /> : null}
              </button>
            ))}
          </div>
          {pickedOption ? (
            <Pip mood={best ? 'happy' : 'hint'} label={t('pipSays')}>
              {pickedOption.reason}
            </Pip>
          ) : null}
          <div className="item-actions">
            {best ? (
              <Button icon="arrow" en={t('next')} es={es('next')} onClick={() => onDone({ correct: true, wrongs, helps: 0, skill: item.skill, words: item.words })} />
            ) : null}
          </div>
        </div>
        {item.image ? (
          <div className="dilemma-image">
            <ImageSlot id={item.image} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
