import { useMemo, useState } from 'react';
import { useGame } from '../../state/GameContext.jsx';
import { normalizeAnswer, sentenceCase, shuffle } from '../../lib/util.js';
import useHelp from '../useHelp.js';
import Feedback from '../Feedback.jsx';
import Icon from '../Icon.jsx';
import { Button, Es, Instruction } from '../Bilingual.jsx';

// Word order: choose tiles one by one to build the sentence. Choosing a placed
// word sends it back. Unlimited tries; help never shows the full sentence.
export default function OrderItem({ item, variantId, onDone }) {
  const { t, es, dispatch, sound } = useGame();
  const variant = item.variants.find((v) => v.id === variantId) || item.variants[0];
  const tiles = useMemo(() => shuffle(variant.tiles.map((w, i) => ({ id: `${i}`, w }))), [variant]);
  const [placed, setPlaced] = useState([]);
  const [status, setStatus] = useState(null);
  const help = useHelp(variant.hints);

  const available = tiles.filter((tile) => !placed.includes(tile.id));
  const words = placed.map((id) => tiles.find((x) => x.id === id).w);
  const sentence = sentenceCase(words);
  const complete = available.length === 0;

  const check = () => {
    const ok = variant.answers.some((a) => normalizeAnswer(a) === normalizeAnswer(sentence));
    dispatch({ type: 'ANSWER', correct: ok });
    if (ok) {
      setStatus('right');
      sound('right');
    } else {
      setStatus('wrong');
      sound('wrong');
      help.onWrong();
    }
  };

  const place = (id) => {
    if (status === 'right') return;
    setPlaced((p) => [...p, id]);
    setStatus(null);
  };
  const unplace = (id) => {
    if (status === 'right') return;
    setPlaced((p) => p.filter((x) => x !== id));
    setStatus(null);
  };

  return (
    <div className="item item-order">
      <Instruction icon="text" en={item.instruction} es={item.instructionEs} as="h2" />
      <p className="hint-line">
        {t('tapWords')}
        <Es>{es('tapWords')}</Es>
      </p>

      <div className={`sentence-area ${status === 'right' ? 'is-right' : ''} ${status === 'wrong' ? 'is-wrong' : ''}`} aria-live="polite">
        <span className="sentence-label">
          {t('yourSentence')}
          <Es>{es('yourSentence')}</Es>
        </span>
        <div className="sentence-tiles">
          {placed.length === 0 ? <span className="sentence-empty">...</span> : null}
          {placed.map((id, i) => {
            const tile = tiles.find((x) => x.id === id);
            const shown = i === 0 ? tile.w.charAt(0).toUpperCase() + tile.w.slice(1) : tile.w;
            return (
              <button key={id} type="button" className="tile tile-placed" data-tile={tile.w} onClick={() => unplace(id)} disabled={status === 'right'}>
                {shown}
              </button>
            );
          })}
          {complete ? <span className="sentence-end">.</span> : null}
          {status === 'right' ? <Icon name="check" label={t('right')} /> : null}
        </div>
      </div>

      <div className="tile-bank" role="group" aria-label={t('wordBox')}>
        {available.map((tile) => (
          <button key={tile.id} type="button" className="tile" data-tile={tile.w} onClick={() => place(tile.id)}>
            {tile.w}
          </button>
        ))}
      </div>

      <Feedback status={status} why={variant.why} hint={status === 'right' ? null : help.hint} helpKey={help.helps} hintLevel={help.level} />

      <div className="item-actions">
        {status === 'right' ? (
          <Button
            icon="arrow"
            en={t('next')}
            es={es('next')}
            onClick={() => onDone({ correct: true, wrongs: help.wrongs, helps: help.helps, skill: item.skill, words: variant.words, variant: variant.id })}
          />
        ) : (
          <>
            <Button icon="check" en={t('answer')} es={es('answer')} onClick={check} disabled={!complete || status === 'wrong'} />
            <Button variant="secondary" icon="replay" en={t('clear')} es={es('clear')} onClick={() => { setPlaced([]); setStatus(null); }} disabled={!placed.length} />
            <Button variant="secondary" icon="help" en={t('help')} es={es('help')} onClick={help.askHelp} disabled={help.maxed} />
          </>
        )}
      </div>
    </div>
  );
}
