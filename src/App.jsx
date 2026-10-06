import { useEffect, useRef, useState } from 'react';
import { GameProvider, useGame } from './state/GameContext.jsx';
import TopBar from './components/TopBar.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import Modal from './components/Modal.jsx';
import { Button, Es } from './components/Bilingual.jsx';
import Pip from './components/Pip.jsx';
import WelcomeScreen from './screens/WelcomeScreen.jsx';
import MapScreen from './screens/MapScreen.jsx';
import RoomScreen from './screens/RoomScreen.jsx';
import SummaryScreen from './screens/SummaryScreen.jsx';
import RadioRoomScreen from './screens/RadioRoomScreen.jsx';
import EndScreen from './screens/EndScreen.jsx';
import { hasRoomArt } from './lib/roomBackdrops.js';

const SCREENS = {
  welcome: WelcomeScreen,
  map: MapScreen,
  room: RoomScreen,
  summary: SummaryScreen,
  final: RadioRoomScreen,
  end: EndScreen,
};

function Shell() {
  const { state, dispatch, t, es } = useGame();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const mainRef = useRef(null);
  const s = state.settings;
  const Screen = SCREENS[state.screen] || WelcomeScreen;
  const screenKey = `${state.screen}-${state.currentRoom || ''}`;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.size = String(s.size);
    root.dataset.spacing = String(s.spacing);
    root.dataset.font = s.font;
    root.dataset.contrast = s.contrast ? 'high' : 'normal';
  }, [s.size, s.spacing, s.font, s.contrast]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (state.screen !== 'summary' && state.screen !== 'end') mainRef.current?.focus();
  }, [screenKey, state.screen]);

  return (
    <div
      className={`app${state.screen === 'map' ? ' is-map' : ''}${
        (state.screen === 'room' || state.screen === 'summary') && hasRoomArt(state.currentRoom) && !s.contrast ? ' is-room-art' : ''
      }`}
    >
      <a className="skip-link" href="#main">
        {t('skipLink')}
      </a>
      <TopBar onSettings={() => setSettingsOpen(true)} />
      <main id="main" ref={mainRef} tabIndex={-1} className="main">
        <Screen key={screenKey} />
      </main>
      {settingsOpen ? <SettingsPanel onClose={() => setSettingsOpen(false)} /> : null}
      {state.showTimeUp ? (
        <Modal title={t('timeUpTitle')} labelledBy="timeup-title" onClose={() => dispatch({ type: 'ACK_TIME_UP' })}>
          <Es>{es('timeUpTitle')}</Es>
          <div className="timeup">
            <Pip mood="neutral" />
            <p>
              {t('timeUpText')}
              <Es>{es('timeUpText')}</Es>
            </p>
          </div>
          <div className="modal-actions">
            <Button icon="check" en={t('ok')} es={es('ok')} onClick={() => dispatch({ type: 'ACK_TIME_UP' })} />
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

export default function App({ initial, now }) {
  return (
    <GameProvider initial={initial} now={now}>
      <Shell />
    </GameProvider>
  );
}
