import { useEffect, useRef } from 'react';
import { ROOM_BY_ID } from '../content/index.js';
import { useGame } from '../state/GameContext.jsx';
import { roomHelps, roomPoints, roomStars, wordsPractised } from '../state/scoring.js';
import useReducedMotion from '../lib/useReducedMotion.js';
import Icon from '../components/Icon.jsx';
import PrizeGlyph from '../components/PrizeGlyph.jsx';
import PieceCard from '../components/PieceCard.jsx';
import Pip from '../components/Pip.jsx';
import RoomBackdrop from '../components/RoomBackdrop.jsx';
import { hasRoomArt } from '../lib/roomBackdrops.js';
import { Button, Es } from '../components/Bilingual.jsx';

export default function SummaryScreen() {
  const { state, dispatch, t, es } = useGame();
  const reduced = useReducedMotion();
  const room = ROOM_BY_ID[state.currentRoom];
  const rs = state.rooms[state.currentRoom];
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  if (!room || !rs) return null;
  const roomArt = hasRoomArt(room.id) && !state.settings.contrast;
  const stars = roomStars(rs.results);
  const minutes = rs.finishedAt && rs.startedAt ? (rs.finishedAt - rs.startedAt) / 60000 : Infinity;
  const fast = !state.practice && minutes <= room.targetMinutes;
  const words = wordsPractised(room, rs);
  const path = room.paths?.find((p) => p.id === rs.path);
  const rise = !reduced && !state.settings.calm;
  const riseAt = (step) => (rise ? { className: 'summary-rise', style: { '--summary-delay': `${step * 60}ms` } } : { className: '', style: undefined });
  const heroRise = riseAt(0);
  const rowRise = riseAt(1);
  const wordsRise = riseAt(2);

  return (
    <section className={`screen screen-summary${state.settings.calm ? ' is-calm' : ''}`} aria-labelledby="summary-title">
      {roomArt ? <RoomBackdrop roomId={room.id} audioPlaying={false} /> : null}
      <div className="summary-sheet">
        <div className={`summary-hero summary-card ${heroRise.className}`} style={heroRise.style}>
          <div className="summary-hero-pip">
            <Pip mood="happy" />
          </div>
          <div className="summary-hero-copy">
            <h1 id="summary-title" ref={headingRef} tabIndex={-1}>
              {t('summaryTitle')}
              <Es>{es('summaryTitle')}</Es>
            </h1>
            <p className="summary-room-line">
              <Icon name={room.icon} size={22} />
              <span className="summary-room">{room.name}</span>
            </p>
            <p className="stars-line" aria-label={`${t('stars')}: ${stars} / 3`}>
              {[1, 2, 3].map((n) => (
                <Icon key={n} name="star" size={36} className={n <= stars ? 'star-on' : 'star-off'} />
              ))}
            </p>
          </div>
          <Button icon="map" en={t('backToMap')} es={es('backToMap')} className="btn-big" onClick={() => dispatch({ type: 'GO_MAP' })} />
        </div>

        <div className={`summary-row ${rowRise.className}`} style={rowRise.style}>
          <article className="summary-card summary-piece">
            <h2 className="summary-kicker">
              <Icon name="piece" size={22} />
              <span>
                {t('foundPiece')}
                <Es>{es('foundPiece')}</Es>
              </span>
            </h2>
            <div className="summary-card-body">
              <div className="summary-piece-box">
                <PieceCard clue={room.clue} />
              </div>
            </div>
          </article>

          <article className="summary-card summary-prize">
            <h2 className="summary-kicker">
              <Icon name="medal" size={22} />
              <span>
                {t('prize')}
                <Es>{es('prize')}</Es>
              </span>
            </h2>
            <div className="summary-card-body">
              <div className="summary-prize-main">
                <span className="summary-prize-slot">
                  <PrizeGlyph prize={room.prize} size={64} />
                </span>
                <strong>{room.prize.name}</strong>
              </div>
              {path ? (
                <p className={`prize medal-${path.medal}`}>
                  <Icon name="medal" size={32} /> {path.label}
                </p>
              ) : null}
            </div>
            {fast ? (
              <p className="summary-note prize">
                <Icon name="clock" size={28} /> {t('fastStar')}
              </p>
            ) : null}
          </article>

          <article className="summary-card summary-score">
            <p className="summary-kicker">
              <Icon name="star" size={22} />
              <span>
                <span className="summary-score-label">{t('score')}:</span>{' '}
                <strong className="summary-score-num">{roomPoints(rs.results)}</strong>
                <Es>{es('score')}</Es>
              </span>
            </p>
            <div className="summary-card-body">
              <p>
                <Icon name="help" /> {t('helpUsed', { n: roomHelps(rs.results) })}
                <Es>{es('helpUsed', { n: roomHelps(rs.results) })}</Es>
              </p>
            </div>
          </article>
        </div>

        <article className={`summary-card summary-words ${wordsRise.className}`} style={wordsRise.style}>
          <h2 className="summary-kicker">
            <Icon name="words" size={22} />
            <span>
              {t('wordsPractised')}
              <Es>{es('wordsPractised')}</Es>
            </span>
          </h2>
          <ul className="word-chips">
            {words.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
