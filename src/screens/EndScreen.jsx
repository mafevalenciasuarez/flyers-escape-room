import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FINAL, ROOMS } from '../content/index.js';
import { useGame } from '../state/GameContext.jsx';
import { clearSaved } from '../state/storage.js';
import { skillSummary, totalPoints, wordsToReview } from '../state/scoring.js';
import useReducedMotion from '../lib/useReducedMotion.js';
import AudioPlayer from '../components/AudioPlayer.jsx';
import Icon from '../components/Icon.jsx';
import PrizeGlyph from '../components/PrizeGlyph.jsx';
import Pip from '../components/Pip.jsx';
import StationSvg from '../components/StationSvg.jsx';
import { Starfield } from '../components/Starfield.jsx';
import { Button, Es } from '../components/Bilingual.jsx';

// One source for the celebration timings. CSS variables below read the same numbers.
export const END_MOTION = {
  rise: 2.6,
  riseDelay: 0.3,
  lightStep: 0.15,
  wave: 3.6,
  waveGap: 1.2,
  leave: 0.3,
  station: '55vh',
  ring: '58%',
};

// The station art has light-room1, light-room2, light-room3 and light-radio.
// room4 and room5 are in the list so they light if those shapes are added.
const LIGHT_IDS = ['room1', 'room2', 'room3', 'room4', 'room5', 'radio'];

function lightMap(state) {
  return Object.fromEntries(LIGHT_IDS.map((id) => [id, state]));
}

// The dish focus sits in the bowl. The round lamp is light-radio, at the tip.
function useAntennaPoint(hostRef) {
  const [point, setPoint] = useState(null);
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let timer = 0;
    const measure = () => {
      const light = host.querySelector('[data-st="light-radio"]');
      if (!light) return;
      const lightBox = light.getBoundingClientRect();
      const hostBox = host.getBoundingClientRect();
      if (!lightBox.width || !hostBox.width || !hostBox.height) return;
      const next = {
        x: (lightBox.left + lightBox.width / 2 - hostBox.left) / hostBox.width,
        y: (lightBox.top + lightBox.height / 2 - hostBox.top) / hostBox.height,
      };
      setPoint((prev) => (prev && prev.x === next.x && prev.y === next.y ? prev : next));
    };
    measure();
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 120);
    };
    window.addEventListener('resize', onResize);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    observer?.observe(host);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      observer?.disconnect();
    };
  }, [hostRef]);
  return point;
}

export default function EndScreen() {
  const { state, dispatch, t, es } = useGame();
  const reduced = useReducedMotion();
  const frozen = reduced || state.settings.calm;
  const [phase, setPhase] = useState('celebrate');
  const [leaving, setLeaving] = useState(false);
  const [helen, setHelen] = useState(false);
  const [lights, setLights] = useState(() => lightMap(frozen ? 'on' : 'off'));
  const headingRef = useRef(null);
  const stationRef = useRef(null);
  const antenna = useAntennaPoint(stationRef);

  useEffect(() => {
    headingRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    if (frozen) {
      setLights(lightMap('on'));
      return undefined;
    }
    setLights(lightMap('off'));
    const start = (END_MOTION.rise + END_MOTION.riseDelay) * 1000;
    const timers = LIGHT_IDS.map((id, index) => window.setTimeout(() => {
      setLights((prev) => ({ ...prev, [id]: 'on' }));
    }, start + index * END_MOTION.lightStep * 1000));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [frozen]);

  useEffect(() => {
    if (!leaving) return undefined;
    const id = window.setTimeout(() => setPhase('results'), END_MOTION.leave * 1000);
    return () => window.clearTimeout(id);
  }, [leaving]);

  const skills = skillSummary(state);
  const review = wordsToReview(state);
  const prizes = [...ROOMS.filter((r) => state.rooms[r.id]?.done).map((r) => r.prize), FINAL.prize];
  const room3Path = ROOMS.find((r) => r.paths)?.paths.find((p) => p.id === state.rooms.room3?.path);
  const motionStyle = {
    '--end-rise': `${END_MOTION.rise}s`,
    '--end-rise-delay': `${END_MOTION.riseDelay}s`,
    '--end-light-step': `${END_MOTION.lightStep}s`,
    '--end-wave': `${END_MOTION.wave}s`,
    '--end-wave-gap': `${END_MOTION.waveGap}s`,
    '--end-leave': `${END_MOTION.leave}s`,
    '--end-station': END_MOTION.station,
    '--end-ring': END_MOTION.ring,
  };

  const playAgain = () => {
    clearSaved();
    dispatch({ type: 'NEW_GAME' });
  };

  const showResults = () => {
    if (frozen) setPhase('results');
    else setLeaving(true);
  };

  return (
    <section
      className={`screen screen-end${frozen ? ' is-static' : ''}${state.settings.calm ? ' is-calm' : ''}`}
      style={motionStyle}
      aria-labelledby="end-title"
      data-phase={phase}
    >
      {phase === 'celebrate' ? (
        <div className={`end-celebrate${helen ? ' is-helen' : ''}${leaving ? ' end-leave' : ''}`}>
          {state.settings.contrast ? null : <Starfield calmZone maxOpacity={0.8} />}
          <h1 id="end-title" ref={headingRef} tabIndex={-1} className={frozen ? undefined : 'end-reveal'}>
            {t('endTitle')}
            <Es>{es('endTitle')}</Es>
          </h1>
          <div className={frozen ? 'end-station-rise' : 'end-station-rise end-rise'}>
            <div className="end-station" ref={stationRef}>
              <StationSvg mode="map" lightStates={lights} static={frozen} />
              <div
                className="end-waves"
                aria-hidden="true"
                style={antenna ? { '--ring-x': `${antenna.x * 100}%`, '--ring-y': `${antenna.y * 100}%` } : undefined}
              >
                {[0, 1, 2].map((index) => (
                  <span
                    key={index}
                    className={frozen ? 'end-ring' : 'end-ring end-wave'}
                    style={frozen ? undefined : { animationDelay: `${index * END_MOTION.waveGap}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className={frozen ? 'end-dock' : 'end-dock end-reveal'}>
            <div className="end-pip">
              <Pip mood="happy" />
            </div>
            <div className="end-actions">
              <AudioPlayer
                clipId={FINAL.endAudio}
                unlimited
                label={t('listenHelen')}
                playText={t('listenHelen')}
                playTextEs={es('listenHelen')}
                variant="secondary"
                onPlayingChange={setHelen}
              />
              <Button icon="arrow" en={t('next')} es={es('next')} onClick={showResults} />
            </div>
          </div>
        </div>
      ) : (
        <div className="summary-sheet">
          <div className="summary-hero summary-card">
            <div className="summary-hero-pip">
              <Pip mood="happy" />
            </div>
            <div className="summary-hero-copy">
              <h1 id="end-title" ref={headingRef} tabIndex={-1}>
                {t('endTitle')}
                <Es>{es('endTitle')}</Es>
              </h1>
              <p className="big-score">
                <Icon name="star" size={36} /> {t('totalScore')}: <strong>{totalPoints(state)}</strong>
              </p>
            </div>
            <div className="summary-hero-actions">
              <AudioPlayer clipId={FINAL.endAudio} unlimited label={t('listenHelen')} playText={t('listenHelen')} playTextEs={es('listenHelen')} variant="secondary" />
              <Button icon="replay" en={t('playAgain')} es={es('playAgain')} onClick={playAgain} />
            </div>
          </div>

          <div className="summary-row end-row">
            <article className="summary-card">
              <h2 className="summary-kicker">
                <Icon name="medal" size={22} />
                <span>
                  {t('yourPrizes')}
                  <Es>{es('yourPrizes')}</Es>
                </span>
              </h2>
              <div className="summary-card-body">
                <ul className="end-badges">
                  {prizes.map((p) => (
                    <li key={p.id}>
                      <PrizeGlyph prize={p} />
                      <span>{p.name}</span>
                    </li>
                  ))}
                  {room3Path ? (
                    <li className={`medal-${room3Path.medal}`}>
                      <Icon name="medal" size={32} />
                      <span>{room3Path.label}</span>
                    </li>
                  ) : null}
                </ul>
              </div>
            </article>
            <article className="summary-card summary-skills">
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
            </article>
          </div>

          <article className="summary-card summary-words">
            <h2 className="summary-kicker">
              <Icon name="words" size={22} />
              <span>
                {t('wordsToReview')}
                <Es>{es('wordsToReview')}</Es>
              </span>
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
          </article>
        </div>
      )}
    </section>
  );
}
