import { useMemo, useState } from 'react';
import { useGame } from '../../state/GameContext.jsx';
import { normalizeAnswer, shuffle } from '../../lib/util.js';
import Feedback from '../Feedback.jsx';
import Icon from '../Icon.jsx';
import { Button, Es, Instruction } from '../Bilingual.jsx';
import { pulseReward } from '../../lib/roomFx.js';

// One-word gaps. mode: "choice" (3 words per gap), "bank" (one word box), "type" (write it).
// inline puts the menu or the writing box inside the sentence.
// Right gaps lock; wrong gaps get their own help ladder. Never shows the answer.
export default function GapFillItem({ item, mode = item.mode || 'type', onDone, title, wrapPassage, inline = false }) {
  const { t, es, dispatch, sound } = useGame();
  const gapIds = item.parts.filter((p) => typeof p === 'object').map((p) => p.gap);
  const [values, setValues] = useState({});
  const [solved, setSolved] = useState({});
  const [wrong, setWrong] = useState({});
  const [levels, setLevels] = useState({});
  const [counts, setCounts] = useState({ wrongs: 0, helps: 0 });
  const [lastWhy, setLastWhy] = useState(null);
  const shuffled = useMemo(() => {
    const out = {};
    for (const id of gapIds) out[id] = shuffle(item.gaps[id].options || []);
    out.__bank = shuffle(item.bank || []);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  const allSolved = gapIds.every((id) => solved[id]);
  const firstOpen = gapIds.find((id) => !solved[id]);
  const helpGap = gapIds.find((id) => wrong[id]) || firstOpen;
  const helpLevel = helpGap ? levels[helpGap] || 0 : 0;
  const hint = helpGap && helpLevel > 0 ? item.gaps[helpGap].hints[helpLevel - 1] : null;
  const gapNumber = (id) => gapIds.indexOf(id) + 1;

  const setValue = (id, v) => {
    setValues((s) => ({ ...s, [id]: v }));
    setWrong((s) => ({ ...s, [id]: false }));
  };

  const check = () => {
    const nextSolved = { ...solved };
    const nextWrong = {};
    const nextLevels = { ...levels };
    let newWrongs = 0;
    let why = null;
    for (const id of gapIds) {
      if (solved[id]) continue;
      const v = normalizeAnswer(values[id] || '');
      if (!v) continue;
      const ok = item.gaps[id].answers.some((a) => normalizeAnswer(a) === v);
      dispatch({ type: 'ANSWER', correct: ok });
      if (ok) {
        nextSolved[id] = true;
        why = item.gaps[id].why;
      } else {
        nextWrong[id] = true;
        newWrongs += 1;
        nextLevels[id] = Math.min(item.gaps[id].hints.length, (levels[id] || 0) + 1);
      }
    }
    setSolved(nextSolved);
    setWrong(nextWrong);
    setLevels(nextLevels);
    setCounts((c) => ({ ...c, wrongs: c.wrongs + newWrongs }));
    setLastWhy(newWrongs ? null : why);
    const finished = gapIds.every((id) => nextSolved[id]);
    if (newWrongs) sound('wrong');
    else if (finished) {
      sound('right');
      pulseReward();
    }
  };

  const askHelp = () => {
    if (!helpGap) return;
    setLevels((s) => ({ ...s, [helpGap]: Math.min(item.gaps[helpGap].hints.length, (s[helpGap] || 0) + 1) }));
    setCounts((c) => ({ ...c, helps: c.helps + 1 }));
  };

  const filledOpen = gapIds.some((id) => !solved[id] && (values[id] || '').trim());

  const inSentence = inline && (mode === 'bank' || mode === 'type' || mode === 'choice');

  const renderInlineControl = (id) => {
    const n = gapNumber(id);
    const label = `${n}`;
    if (mode === 'type') {
      return (
        <input
          id={`gap-${item.id}-${id}`}
          aria-label={label}
          data-gap={id}
          className="gap-input"
          type="text"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          value={values[id] || ''}
          onChange={(e) => setValue(id, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') check();
          }}
          aria-invalid={wrong[id] || undefined}
        />
      );
    }
    const words = mode === 'choice' ? shuffled[id] : shuffled.__bank;
    return (
      <select
        id={`gap-${item.id}-${id}`}
        aria-label={label}
        data-gap={id}
        className="gap-select"
        value={values[id] || ''}
        onChange={(e) => setValue(id, e.target.value)}
        aria-invalid={wrong[id] || undefined}
      >
        <option value="">—</option>
        {words.map((w) => (
          <option key={w} value={w}>{w}</option>
        ))}
      </select>
    );
  };

  const renderGapInline = (id) => {
    const n = gapNumber(id);
    const v = values[id];
    const open = inSentence && !solved[id];
    return (
      <span key={id} className={`gap ${solved[id] ? 'is-right' : ''} ${wrong[id] ? 'is-wrong' : ''}`}>
        <span className="gap-num" aria-hidden="true">{n}</span>
        {open ? renderInlineControl(id) : <span className="gap-value">{v || '\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0'}</span>}
        {solved[id] ? <Icon name="check" size={18} /> : null}
        {wrong[id] ? <Icon name="cross" size={18} /> : null}
      </span>
    );
  };

  const renderControl = (id) => {
    const n = gapNumber(id);
    const gap = item.gaps[id];
    const base = item.parts.find((p) => typeof p === 'object' && p.gap === id)?.base;
    const labelText = `${n}${base ? ` (${base})` : ''}`;
    if (solved[id]) {
      return (
        <div key={id} className="gap-row is-right">
          <span className="gap-row-label">{labelText}</span>
          <strong>{values[id]}</strong> <Icon name="check" label={t('right')} />
        </div>
      );
    }
    if (mode === 'type') {
      return (
        <div key={id} className={`gap-row ${wrong[id] ? 'is-wrong' : ''}`}>
          <label className="gap-row-label" htmlFor={`gap-${item.id}-${id}`}>
            {labelText}
          </label>
          <input
            id={`gap-${item.id}-${id}`}
            data-gap={id}
            className="gap-input"
            type="text"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            value={values[id] || ''}
            onChange={(e) => setValue(id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') check();
            }}
            aria-invalid={wrong[id] || undefined}
          />
          {wrong[id] ? <Icon name="cross" label={t('notYet')} /> : null}
        </div>
      );
    }
    const words = mode === 'choice' ? shuffled[id] : shuffled.__bank;
    return (
      <div key={id} className={`gap-row ${wrong[id] ? 'is-wrong' : ''}`} role="group" aria-label={`${n}`}>
        <span className="gap-row-label">{labelText}</span>
        <div className="word-buttons">
          {words.map((w) => (
            <button
              key={w}
              type="button"
              data-gap={id}
              data-word={w}
              className={`word-btn ${values[id] === w ? 'is-selected' : ''}`}
              aria-pressed={values[id] === w}
              onClick={() => setValue(id, w)}
            >
              {w}
            </button>
          ))}
        </div>
        {wrong[id] ? <Icon name="cross" label={t('notYet')} /> : null}
      </div>
    );
  };

  const passage = (
    <div className="reading-card">
      {title || item.title ? <h3>{title || item.title}</h3> : null}
      <p className="gap-text">
        {item.parts.map((p, i) =>
          typeof p === 'string' ? (
            <span key={i}>{p}</span>
          ) : (
            <span key={i}>
              {renderGapInline(p.gap)}
              {p.base ? <span className="gap-base"> ({p.base})</span> : null}
            </span>
          )
        )}
      </p>
    </div>
  );

  return (
    <div className="item item-gapfill">
      <Instruction icon="text" en={item.instruction} es={item.instructionEs} as="h2" />
      {wrapPassage ? wrapPassage(passage) : passage}
      {mode === 'bank' && !inSentence ? (
        <p className="word-box-title">
          <Icon name="words" /> {t('wordBox')}
          <Es>{es('wordBox')}</Es>
        </p>
      ) : null}
      {inSentence ? null : <div className="gap-controls">{gapIds.map(renderControl)}</div>}

      <Feedback
        status={allSolved ? 'right' : Object.values(wrong).some(Boolean) ? 'wrong' : lastWhy ? 'right' : null}
        why={allSolved ? lastWhy || item.gaps[gapIds[gapIds.length - 1]].why : lastWhy}
        hint={allSolved ? null : hint ? `${gapNumber(helpGap)}: ${hint}` : null}
        helpKey={counts.helps}
        hintLevel={helpLevel}
      />

      <div className="item-actions">
        {allSolved ? (
          <Button
            icon="arrow"
            en={t('next')}
            es={es('next')}
            onClick={() => onDone({ correct: true, wrongs: counts.wrongs, helps: counts.helps, skill: item.skill, words: item.words })}
          />
        ) : (
          <>
            <Button icon="check" en={t('answer')} es={es('answer')} onClick={check} disabled={!filledOpen} />
            <Button variant="secondary" icon="help" en={t('help')} es={es('help')} onClick={askHelp} disabled={!helpGap || helpLevel >= item.gaps[helpGap].hints.length} />
          </>
        )}
      </div>
    </div>
  );
}
