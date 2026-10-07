import { useEffect, useRef, useState } from 'react';
import { useGame } from '../state/GameContext.jsx';
import { clearSaved } from '../state/storage.js';
import useReducedMotion from '../lib/useReducedMotion.js';
import AudioPlayer from '../components/AudioPlayer.jsx';
import HyperspaceJump from '../components/HyperspaceJump.jsx';
import Pip from '../components/Pip.jsx';
import Icon from '../components/Icon.jsx';
import { Button, Es } from '../components/Bilingual.jsx';
import SpaceBackdrop from '../components/SpaceBackdrop.jsx';
import { playSfx } from '../lib/sfx.js';

// Must explain the game in under 30 seconds: 3 icon steps, one button.
// The launch field plays first. Reduced motion and strong colours skip it.
export default function WelcomeScreen() {
  const { state, dispatch, t, es, saved, now } = useGame();
  const reduced = useReducedMotion();
  const skipLaunch = reduced || state.settings.contrast;
  const [phase, setPhase] = useState(skipLaunch ? 'arrived' : 'drift');
  const zoomSound = useRef(0);
  const canResume = saved && saved.screen && saved.screen !== 'welcome' && saved.screen !== 'end';
  const steps = t('welcomeSteps');
  const stepsEs = es('welcomeSteps');
  const arrived = phase === 'arrived';

  useEffect(() => {
    if (skipLaunch) setPhase('arrived');
  }, [skipLaunch]);

  useEffect(() => () => window.clearTimeout(zoomSound.current), []);

  return (
    <section className={`screen screen-welcome${arrived ? '' : ' is-launch'}`} aria-labelledby={arrived ? 'welcome-title' : 'launch-title'}>
      {arrived ? (
        <SpaceBackdrop variant="broken" />
      ) : (
        <HyperspaceJump
          jumping={phase === 'jump'}
          onJumpDone={() => {
            zoomSound.current = window.setTimeout(() => playSfx('station-in', { overlap: true }), 2000);
            setPhase('arrived');
          }}
          onUnavailable={() => setPhase('arrived')}
        />
      )}
      {arrived ? null : (
        <div className={`jump-gate${phase === 'jump' ? ' is-jumping' : ''}`}>
          <h1 id="launch-title">{t('title')}</h1>
          <Button
            icon="arrow"
            en={t('launch')}
            es={es('launch')}
            className="btn-big"
            disabled={phase === 'jump'}
            onClick={() => {
              playSfx('hyperspace');
              setPhase('jump');
            }}
          />
        </div>
      )}
      {arrived ? (
        <>
      <div className="welcome-hero welcome-reveal" style={{ '--i': 0 }}>
        <Pip mood="neutral" />
        <div>
          <h1 id="welcome-title">
            {t('welcomeTitle')}
            <Es>{es('welcomeTitle')}</Es>
          </h1>
        </div>
      </div>

      <ol className="welcome-steps welcome-reveal" style={{ '--i': 1 }}>
        {steps.map((s, i) => (
          <li key={s.text}>
            <span className="step-num" aria-hidden="true">{i + 1}</span>
            <Icon name={s.icon} size={36} />
            <span>
              {s.text}
              <Es>{stepsEs?.[i]?.text}</Es>
            </span>
          </li>
        ))}
      </ol>

      <p className="welcome-note welcome-reveal" style={{ '--i': 2 }}>
        <Icon name="clock" /> {t('timeNote')}
        <Es>{es('timeNote')}</Es>
      </p>
      <p className="welcome-note welcome-reveal" style={{ '--i': 3 }}>
        <Icon name="help" /> {t('helpNote')}
        <Es>{es('helpNote')}</Es>
      </p>

      <div className="welcome-audio welcome-reveal" style={{ '--i': 4 }}>
        <AudioPlayer clipId="intro_helen" unlimited label={t('listenHelen')} playText={t('listenHelen')} playTextEs={es('listenHelen')} variant="secondary" />
      </div>

      <div className="welcome-actions welcome-reveal" style={{ '--i': 5 }}>
        {canResume ? (
          <>
            <Button icon="arrow" en={t('resume')} es={es('resume')} onClick={() => dispatch({ type: 'RESUME', saved: { ...saved, settings: state.settings } })} />
            <Button
              variant="secondary"
              icon="replay"
              en={t('newGame')}
              es={es('newGame')}
              onClick={() => {
                clearSaved();
                dispatch({ type: 'START', now: now() });
              }}
            />
          </>
        ) : (
          <Button icon="arrow" en={t('start')} es={es('start')} onClick={() => dispatch({ type: 'START', now: now() })} className="btn-big" />
        )}
      </div>
        </>
      ) : null}
    </section>
  );
}
