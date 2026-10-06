import { useGame } from '../state/GameContext.jsx';
import { clearSaved } from '../state/storage.js';
import AudioPlayer from '../components/AudioPlayer.jsx';
import Pip from '../components/Pip.jsx';
import Icon from '../components/Icon.jsx';
import { Button, Es } from '../components/Bilingual.jsx';
import SpaceBackdrop from '../components/SpaceBackdrop.jsx';

// Must explain the game in under 30 seconds: 3 icon steps, one button.
export default function WelcomeScreen() {
  const { state, dispatch, t, es, saved, now } = useGame();
  const canResume = saved && saved.screen && saved.screen !== 'welcome' && saved.screen !== 'end';
  const steps = t('welcomeSteps');
  const stepsEs = es('welcomeSteps');

  return (
    <section className="screen screen-welcome" aria-labelledby="welcome-title">
      <SpaceBackdrop variant="broken" />
      <div className="welcome-hero">
        <Pip mood="neutral" />
        <div>
          <h1 id="welcome-title">
            {t('welcomeTitle')}
            <Es>{es('welcomeTitle')}</Es>
          </h1>
          <p className="welcome-sub">{t('title')}</p>
        </div>
      </div>

      <ol className="welcome-steps">
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

      <p className="welcome-note">
        <Icon name="clock" /> {t('timeNote')}
        <Es>{es('timeNote')}</Es>
      </p>
      <p className="welcome-note">
        <Icon name="help" /> {t('helpNote')}
        <Es>{es('helpNote')}</Es>
      </p>

      <div className="welcome-audio">
        <AudioPlayer clipId="intro_helen" unlimited label={t('listenHelen')} playText={t('listenHelen')} playTextEs={es('listenHelen')} variant="secondary" />
      </div>

      <div className="welcome-actions">
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
    </section>
  );
}
