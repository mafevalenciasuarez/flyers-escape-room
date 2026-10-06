import { useEffect, useRef } from 'react';
import { ROOM_BY_ID } from '../content/index.js';
import { useGame } from '../state/GameContext.jsx';
import { roomHelps, roomPoints, roomStars, wordsPractised } from '../state/scoring.js';
import Icon from '../components/Icon.jsx';
import PrizeGlyph from '../components/PrizeGlyph.jsx';
import PieceCard from '../components/PieceCard.jsx';
import Pip from '../components/Pip.jsx';
import RoomBackdrop from '../components/RoomBackdrop.jsx';
import { hasRoomArt } from '../lib/roomBackdrops.js';
import { Button, Es } from '../components/Bilingual.jsx';

export default function SummaryScreen() {
  const { state, dispatch, t, es } = useGame();
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

  return (
    <section className="screen screen-summary" aria-labelledby="summary-title">
      {roomArt ? <RoomBackdrop roomId={room.id} audioPlaying={false} /> : null}
      <div className="summary-head">
        <Pip mood="happy" />
        <div>
          <h1 id="summary-title" ref={headingRef} tabIndex={-1}>
            {t('summaryTitle')} <span className="summary-room">{room.name}</span>
            <Es>{es('summaryTitle')}</Es>
          </h1>
          <p className="stars-line" aria-label={`${t('stars')}: ${stars} / 3`}>
            {[1, 2, 3].map((n) => (
              <Icon key={n} name="star" size={36} className={n <= stars ? 'star-on' : 'star-off'} />
            ))}
          </p>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card summary-piece">
          <h2>
            {t('foundPiece')}
            <Es>{es('foundPiece')}</Es>
          </h2>
          <PieceCard clue={room.clue} size="lg" />
        </div>
        <div className="summary-card">
          <h2>
            {t('prize')}
            <Es>{es('prize')}</Es>
          </h2>
          <p className="prize">
            <PrizeGlyph prize={room.prize} size={40} /> <strong>{room.prize.name}</strong>
          </p>
          {path ? (
            <p className={`prize medal-${path.medal}`}>
              <Icon name="medal" size={32} /> {path.label}
            </p>
          ) : null}
          {fast ? (
            <p className="prize">
              <Icon name="clock" size={28} /> {t('fastStar')}
            </p>
          ) : null}
        </div>
        <div className="summary-card">
          <p>
            <Icon name="star" /> {t('score')}: <strong>{roomPoints(rs.results)}</strong>
            <Es>{es('score')}</Es>
          </p>
          <p>
            <Icon name="help" /> {t('helpUsed', { n: roomHelps(rs.results) })}
            <Es>{es('helpUsed', { n: roomHelps(rs.results) })}</Es>
          </p>
        </div>
        <div className="summary-card">
          <h2>
            {t('wordsPractised')}
            <Es>{es('wordsPractised')}</Es>
          </h2>
          <ul className="word-chips">
            {words.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="item-actions">
        <Button icon="map" en={t('backToMap')} es={es('backToMap')} className="btn-big" onClick={() => dispatch({ type: 'GO_MAP' })} />
      </div>
    </section>
  );
}
