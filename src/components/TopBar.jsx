import { ROOMS } from '../content/index.js';
import { useGame } from '../state/GameContext.jsx';
import Icon from './Icon.jsx';
import Timer from './Timer.jsx';
import { Es } from './Bilingual.jsx';

export default function TopBar({ onSettings }) {
  const { state, dispatch, t, es } = useGame();
  const found = ROOMS.filter((r) => state.pieces[r.id]).length;
  const inGame = state.screen !== 'welcome';
  const onSpace = state.screen === 'welcome' || state.screen === 'map';
  return (
    <header className={onSpace ? 'topbar topbar-welcome' : 'topbar'}>
      <div className="topbar-title">
        <span className="topbar-chip">
          <Icon name="radio" />
          <span>{t('title')}</span>
        </span>
      </div>
      {inGame ? (
        <div className="topbar-progress" aria-label={t('piecesFound', { n: found })}>
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
      ) : null}
      <div className="topbar-actions">
        {inGame && state.screen !== 'end' ? <Timer /> : null}
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
