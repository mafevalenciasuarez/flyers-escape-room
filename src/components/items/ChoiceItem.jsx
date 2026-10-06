import { useMemo, useState } from 'react';
import { useGame } from '../../state/GameContext.jsx';
import { shuffle } from '../../lib/util.js';
import useHelp from '../useHelp.js';
import Feedback from '../Feedback.jsx';
import AudioPlayer from '../AudioPlayer.jsx';
import ImageSlot from '../ImageSlot.jsx';
import MonitorFrame from '../MonitorFrame.jsx';
import Icon from '../Icon.jsx';
import { Button, Es, Instruction } from '../Bilingual.jsx';
import { pulseReward } from '../../lib/roomFx.js';

const LETTERS = ['A', 'B', 'C', 'D'];

function ConfidenceRating({ value, onChange }) {
  const { t, es } = useGame();
  const labels = t('sure');
  const labelsEs = es('sure');
  return (
    <fieldset className="confidence">
      <legend>
        <Icon name="star" /> {t('howSure')}
        <Es>{es('howSure')}</Es>
      </legend>
      <div className="confidence-options">
        {[1, 2, 3].map((n) => (
          <label key={n} className={`confidence-option ${value === n ? 'is-on' : ''}`}>
            <input type="radio" name="confidence" checked={value === n} onChange={() => onChange(n)} />
            <span className="stars" aria-hidden="true">
              {Array.from({ length: n }, (_, i) => (
                <Icon key={i} name="star" size={22} />
              ))}
            </span>
            <span>
              {labels[n - 1]}
              <Es>{labelsEs?.[n - 1]}</Es>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function confidenceMessage(t, correct, rating) {
  if (correct) return rating === 3 ? t('sureRightHigh') : t('sureRightLow');
  return rating === 3 ? t('sureWrongHigh') : t('sureWrongLow');
}

// Multiple choice (text or pictures), optional audio, optional confidence rating,
// optional reading-panel highlight on help step 3 (Room 2).
export default function ChoiceItem({ item, confidence = false, onDone, onHelpLevel, audioUnlimited = false, onPlayingChange }) {
  const { t, es, dispatch, sound } = useGame();
  const options = useMemo(() => shuffle(item.options), [item]);
  const [selected, setSelected] = useState(null);
  const [rating, setRating] = useState(null);
  const [status, setStatus] = useState(null); // null | right | wrong
  const [ratingNote, setRatingNote] = useState(null);
  const [tried, setTried] = useState(new Set());
  const help = useHelp(item.hints);

  const notifyLevel = (lvl) => onHelpLevel && onHelpLevel(lvl);
  const needRating = confidence && status !== 'right';
  const canAnswer = selected && (!needRating || rating) && status !== 'right';

  const answer = () => {
    if (!canAnswer) return;
    const correct = selected === item.answer;
    dispatch({ type: 'ANSWER', correct });
    if (confidence) setRatingNote(confidenceMessage(t, correct, rating));
    if (correct) {
      setStatus('right');
      sound('right');
      pulseReward();
    } else {
      setStatus('wrong');
      setTried((s) => new Set(s).add(selected));
      sound('wrong');
      help.onWrong();
      notifyLevel(Math.min(item.hints.length, help.level + 1));
      setSelected(null);
      setRating(null);
    }
  };

  const askHelp = () => {
    help.askHelp();
    notifyLevel(Math.min(item.hints.length, help.level + 1));
  };

  const finish = () =>
    onDone({ correct: true, wrongs: help.wrongs, helps: help.helps, skill: item.skill, words: item.words, confidence: rating });

  const transcriptForced = item.showTranscriptOnHint && help.level >= item.showTranscriptOnHint;
  const pictures = item.layout === 'pictures';

  return (
    <div className="item item-choice">
      <Instruction icon={item.audio ? 'headphones' : 'text'} en={item.instruction} es={item.instructionEs} as="h2" />
      {item.audio ? (
        <AudioPlayer
          clipId={item.audio}
          unlimited={audioUnlimited}
          forceTranscript={transcriptForced}
          label={item.instruction}
          onPlayingChange={onPlayingChange}
        />
      ) : null}
      <div className={`options ${pictures ? 'options-pictures' : ''} ${item.layout === 'big-text' ? 'options-big' : ''}`} role="group" aria-label={item.instruction}>
        {options.map((o, i) => {
          const isSel = selected === o.id;
          const isRight = status === 'right' && o.id === item.answer;
          const wasTried = tried.has(o.id) && status !== 'right';
          return (
            <button
              key={o.id}
              type="button"
              data-option-id={o.id}
              className={`option ${isSel ? 'is-selected' : ''} ${isRight ? 'is-right' : ''} ${wasTried ? 'is-tried' : ''}`}
              aria-pressed={isSel}
              aria-label={`${LETTERS[i]}: ${o.text || o.alt}`}
              disabled={status === 'right'}
              onClick={() => {
                setSelected(o.id);
                if (status === 'wrong') setStatus(null);
              }}
            >
              <span className="option-letter" aria-hidden="true">{LETTERS[i]}</span>
              {o.image ? (
                <MonitorFrame className={`${isSel ? 'is-selected' : ''} ${isRight ? 'is-right' : ''} ${wasTried ? 'is-review' : ''}`}>
                  <ImageSlot id={o.image} />
                  {isSel ? <Icon name="circle" size={22} className="monitor-radio" /> : null}
                  {isRight ? (
                    <span className="monitor-status">
                      <Icon name="check" /> Right
                    </span>
                  ) : null}
                  {wasTried ? (
                    <span className="monitor-status">
                      <Icon name="arrow" />
                    </span>
                  ) : null}
                </MonitorFrame>
              ) : null}
              {o.text ? <span className="option-text">{o.text}</span> : null}
              {!o.image && isRight ? <Icon name="check" className="option-mark" /> : null}
              {!o.image && wasTried ? <Icon name="cross" className="option-mark" /> : null}
            </button>
          );
        })}
      </div>

      {needRating && selected ? <ConfidenceRating value={rating} onChange={setRating} /> : null}

      {ratingNote ? (
        <p className="rating-note" role="status">
          <Icon name="star" /> {ratingNote}
        </p>
      ) : null}

      <Feedback status={status} why={item.why} hint={status === 'right' ? null : help.hint} helpKey={help.helps} hintLevel={help.level} />

      <div className="item-actions">
        {status === 'right' ? (
          <Button icon="arrow" en={t('next')} es={es('next')} onClick={finish} />
        ) : (
          <>
            <Button icon="check" en={t('answer')} es={es('answer')} onClick={answer} disabled={!canAnswer} />
            <Button variant="secondary" icon="help" en={t('help')} es={es('help')} onClick={askHelp} disabled={help.maxed} />
          </>
        )}
      </div>
    </div>
  );
}
