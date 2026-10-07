import { useState } from 'react';
import { ROOM_BY_ID, ROOMS } from '../content/index.js';
import { useGame } from '../state/GameContext.jsx';
import Icon from './Icon.jsx';
import PieceCard from './PieceCard.jsx';
import Timer from './Timer.jsx';
import { Es } from './Bilingual.jsx';

export default function TopBar({ onSettings }) {
  const { state, dispatch, t, es } = useGame();
  const foundRooms = ROOMS.filter((r) => state.pieces[r.id]);
  const found = foundRooms.length;
  const [piecesOpen, setPiecesOpen] = useState(false);
  const inGame = state.screen !== 'welcome';
  const onSpace = state.screen === 'welcome' || state.screen === 'map';
  const here = state.screen === 'room' || state.screen === 'summary' || state.screen === 'final'
    ? ROOM_BY_ID[state.currentRoom]
    : null;
  return (
    <header className={onSpace ? 'topbar topbar-welcome' : 'topbar'}>
      <div className="topbar-title">
        <span className="topbar-chip">
          <Icon name={here?.icon || 'radio'} />
          <span>{here?.name || t('title')}</span>
        </span>
      </div>
      <div className="topbar-center">
        {inGame ? (
          <div
            className="pieces-hover"
            tabIndex={0}
            aria-label={t('piecesFound', { n: found })}
            aria-expanded={piecesOpen}
            onMouseEnter={() => setPiecesOpen(true)}
            onMouseLeave={() => setPiecesOpen(false)}
            onFocus={() => setPiecesOpen(true)}
            onBlur={() => setPiecesOpen(false)}
          >
            <div className="topbar-progress">
              <span className="topbar-chip">
                <span className="pieces-dots" aria-hidden="true">
                  {ROOMS.map((r) => (
                    <span key={r.id} className={`dot ${state.pieces[r.id] ? 'dot-on' : ''}`}>
                      {state.pieces[r.id] ? <Icon name="check" size={14} /> : null}
                    </span>
                  ))}
                </span>
                <span className="pieces-text" aria-hidden="true">
                  {t('piecesFound', { n: found })}
                  <Es>{es('piecesFound', { n: found })}</Es>
                </span>
              </span>
            </div>
            {piecesOpen ? (
              <div className="pieces-pop" role="region" aria-label={t('myPieces')}>
                <h2>
                  <Icon name="piece" /> {t('myPieces')}
                  <Es>{es('myPieces')}</Es>
                </h2>
                <p>
                  {t('piecesFound', { n: found })}
                  <Es>{es('piecesFound', { n: found })}</Es>
                </p>
                {foundRooms.length ? (
                  <div className="piece-row">
                    {foundRooms.map((room) => (
                      <PieceCard key={room.id} clue={room.clue} />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
        {inGame && state.screen !== 'end' ? <Timer /> : null}
      </div>
      <div className="topbar-actions">
        {inGame && state.screen !== 'map' && state.screen !== 'end' ? (
          <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'GO_MAP' })}>
            <Icon name="map" />
            <span className="btn-text">
              <span>{t('mapTitle')}</span>
              <Es>{es('mapTitle')}</Es>
            </span>
          </button>
        ) : null}
        <button type="button" className="btn btn-ghost" onClick={onSettings} aria-haspopup="dialog">
          <Icon name="settings" />
          <span className="btn-text">
            <span>{t('settings')}</span>
            <Es>{es('settings')}</Es>
          </span>
        </button>
      </div>
    </header>
  );
}
