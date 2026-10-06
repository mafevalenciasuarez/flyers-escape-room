import { useEffect, useRef } from 'react';
import { FINAL, ROOMS } from '../content/index.js';
import { useGame } from '../state/GameContext.jsx';
import { clearSaved } from '../state/storage.js';
import { skillSummary, totalPoints, wordsToReview } from '../state/scoring.js';
import AudioPlayer from '../components/AudioPlayer.jsx';
import Icon from '../components/Icon.jsx';
import PrizeGlyph from '../components/PrizeGlyph.jsx';
import Pip from '../components/Pip.jsx';
import { Button, Es } from '../components/Bilingual.jsx';

// No ranking, no comparison with other children.
export default function EndScreen() {
  const { state, dispatch, t, es } = useGame();
  const headingRef = useRef(null);
  useEffect(() => headingRef.current?.focus(), []);

  const skills = skillSummary(state);
  const review = wordsToReview(state);
  const prizes = [...ROOMS.filter((r) => state.rooms[r.id]?.done).map((r) => r.prize), FINAL.prize];
  const room3Path = ROOMS.find((r) => r.paths)?.paths.find((p) => p.id === state.rooms.room3?.path);

  return (
    <section className="screen screen-end" aria-labelledby="end-title">
      <div className="summary-head">
        <Pip mood="happy" />
        <div>
          <h1 id="end-title" ref={headingRef} tabIndex={-1}>
            {t('endTitle')}
            <Es>{es('endTitle')}</Es>
          </h1>
          <p className="big-score">
            <Icon name="star" size={36} /> {t('totalScore')}: <strong>{totalPoints(state)}</strong>
          </p>
        </div>
      </div>

      <AudioPlayer clipId={FINAL.endAudio} unlimited label={t('listenHelen')} playText={t('listenHelen')} playTextEs={es('listenHelen')} variant="secondary" />

      <div className="summary-grid">
        <div className="summary-card">
          <h2>
            {t('yourPrizes')}
            <Es>{es('yourPrizes')}</Es>
          </h2>
          <ul className="prize-list">
            {prizes.map((p) => (
              <li key={p.id}>
                <PrizeGlyph prize={p} size={32} /> {p.name}
              </li>
            ))}
            {room3Path ? (
              <li className={`medal-${room3Path.medal}`}>
                <Icon name="medal" size={32} /> {room3Path.label}
              </li>
            ) : null}
          </ul>
        </div>
        <div className="summary-card">
          <ul className="skill-list">
            {Object.entries(skills).map(([k, v]) => (
              <li key={k}>
                <strong>{t('skills')[k]}</strong>
                <span className="bar" aria-hidden="true">
                  <span style={{ width: `${v.total ? (v.right / v.total) * 100 : 0}%` }} />
                </span>
                <span>{t('skillLine', { right: v.right, total: v.total })}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="summary-card">
          <h2>
            {t('wordsToReview')}
            <Es>{es('wordsToReview')}</Es>
          </h2>
          {review.length ? (
            <ul className="word-chips">
              {review.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : (
            <p>{t('noWordsToReview')}</p>
          )}
        </div>
      </div>

      <div className="item-actions">
        <Button
          icon="replay"
          en={t('playAgain')}
          es={es('playAgain')}
          onClick={() => {
            clearSaved();
            dispatch({ type: 'NEW_GAME' });
          }}
        />
      </div>
    </section>
  );
}
