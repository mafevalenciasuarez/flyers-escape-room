import { useGame } from '../state/GameContext.jsx';
import { Es } from './Bilingual.jsx';
import Icon from './Icon.jsx';

// One global countdown. Minutes only (no ticking seconds). Calm mode shows a bar
// with no numbers. After time is up, practice mode hides the timer completely.
export default function Timer() {
  const { state, t, es, remainingMs, gameMs } = useGame();
  if (!state.startedAt) return null;
  if (state.practice) {
    return (
      <span className="timer timer-practice">
        <Icon name="star" /> {t('practice')}
        <Es>{es('practice')}</Es>
      </span>
    );
  }
  const minutes = Math.ceil(remainingMs / 60000);
  const pct = Math.round((remainingMs / gameMs) * 100);
  if (state.settings.calm) {
    return (
      <span className="timer timer-calm">
        <Icon name="clock" />
        <span className="visually-hidden">{t('time')}</span>
        <span className="calm-bar" role="progressbar" aria-label={t('time')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <span style={{ width: `${pct}%` }} />
        </span>
      </span>
    );
  }
  return (
    <span className="timer" aria-label={`${t('time')}: ${t('timeLeft', { n: minutes })}`}>
      <Icon name="clock" /> <span aria-hidden="true">{t('timeLeft', { n: minutes })}</span>
    </span>
  );
}
