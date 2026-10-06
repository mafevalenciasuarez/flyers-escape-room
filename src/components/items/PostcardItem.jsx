import { useMemo, useState } from 'react';
import { useGame } from '../../state/GameContext.jsx';
import { countWords } from '../../lib/util.js';
import useHelp from '../useHelp.js';
import Feedback from '../Feedback.jsx';
import Icon from '../Icon.jsx';
import GapFillItem from './GapFillItem.jsx';
import { Button, Es, Instruction } from '../Bilingual.jsx';

function boxWordsUsed(text, box) {
  const lower = ` ${text.toLowerCase().replace(/[^a-z' ]/g, ' ')} `;
  return box.filter((w) => lower.includes(` ${w.toLowerCase()} `));
}

function FreePostcard({ item, onDone }) {
  const { t, es, dispatch, sound } = useGame();
  const free = item.free;
  const [text, setText] = useState('');
  const [status, setStatus] = useState(null);
  const help = useHelp(free.hints);
  const words = countWords(text);
  const used = boxWordsUsed(text, free.box);

  const check = () => {
    const ok = words >= free.minWords && used.length >= free.minBoxWords;
    dispatch({ type: 'ANSWER', correct: ok });
    if (ok) {
      setStatus('right');
      sound('right');
    } else {
      // Not "wrong": Pip asks for a little more.
      setStatus(null);
      help.onWrong();
    }
  };

  return (
    <div className="item item-postcard">
      <Instruction icon="text" en={free.instruction} es={free.instructionEs} as="h2" />
      <div className="word-box" aria-label={t('wordBox')}>
        <span className="word-box-title">
          <Icon name="words" /> {t('wordBox')}
          <Es>{es('wordBox')}</Es>
        </span>
        <ul>
          {free.box.map((w) => (
            <li key={w} className={used.includes(w) ? 'is-used' : ''}>
              {used.includes(w) ? <Icon name="check" size={16} /> : null} {w}
            </li>
          ))}
        </ul>
      </div>
      <div className="postcard">
        <p className="postcard-line">{item.opening}</p>
        <label htmlFor={`free-${item.id}`} className="visually-hidden">
          {free.instruction}
        </label>
        <textarea
          id={`free-${item.id}`}
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={free.starters.join('  ')}
          disabled={status === 'right'}
          spellCheck="false"
        />
        <p className="postcard-line">{item.closing}</p>
      </div>
      <p className="counters">
        {t('wordCount', { n: words })} · {t('boxWordsUsed', { n: used.length })}
      </p>
      <Feedback status={status} why={free.why} hint={status === 'right' ? null : help.hint} helpKey={help.helps} hintLevel={help.level} />
      <div className="item-actions">
        {status === 'right' ? (
          <Button
            icon="arrow"
            en={t('next')}
            es={es('next')}
            onClick={() => onDone({ correct: true, wrongs: help.wrongs, helps: help.helps, skill: item.skill, words: item.words })}
          />
        ) : (
          <>
            <Button icon="check" en={t('answer')} es={es('answer')} onClick={check} disabled={!text.trim()} />
            <Button variant="secondary" icon="help" en={t('help')} es={es('help')} onClick={help.askHelp} disabled={help.maxed} />
          </>
        )}
      </div>
    </div>
  );
}

// Easy and hard paths complete sentence frames (same engine as gap-fill);
// the very hard path writes freely and is checked for length and box words.
export default function PostcardItem({ item, path, onDone }) {
  const framed = useMemo(() => {
    const parts = [`${item.opening} `];
    const gaps = {};
    item.frames.forEach((f, i) => {
      parts.push(`${i ? ' ' : ''}${f.before}`, { gap: f.id }, f.after);
      gaps[f.id] = { answers: f.answers, options: f.options, why: f.why, hints: f.hints };
    });
    parts.push(` ${item.closing}`);
    return { ...item, parts, gaps, bank: item.bank, title: null };
  }, [item]);

  if (path === 'veryhard') return <FreePostcard item={item} onDone={onDone} />;
  return <GapFillItem item={framed} mode={path === 'hard' ? 'bank' : 'choice'} onDone={onDone} />;
}
