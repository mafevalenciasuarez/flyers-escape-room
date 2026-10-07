import { useEffect, useId, useMemo, useSyncExternalStore } from 'react';
import useReducedMotion from '../lib/useReducedMotion.js';
import { INSTANCE_TOKEN, getPipSvg } from '../lib/pipSvg.js';
import { MOOD_ALIASES } from '../lib/pipIds.js';
import './Pip.css';

// The most recently mounted moving Pip animates; any others on screen hold still.
const moving = [];
const listeners = new Set();
const motionStore = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  current: () => moving[moving.length - 1] ?? null,
  add(id) {
    moving.push(id);
    listeners.forEach((l) => l());
  },
  remove(id) {
    const i = moving.indexOf(id);
    if (i < 0) return;
    moving.splice(i, 1);
    listeners.forEach((l) => l());
  },
};

const BULB_GLOW = { 1: 0.6, 2: 0.8, 3: 1 };

// The old drawn face, used only if no Pip art file can be loaded at all.
function LegacyFace() {
  return (
    <svg className="pip-legacy" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <line x1="32" y1="4" x2="32" y2="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="4" r="3" className="pip-light" />
      <rect x="10" y="12" width="44" height="36" rx="12" className="pip-head" />
      <circle cx="24" cy="28" r="5" className="pip-eye" />
      <circle cx="40" cy="28" r="5" className="pip-eye" />
      <path d="M23 37c3 4 15 4 18 0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <rect x="20" y="50" width="24" height="10" rx="4" className="pip-head" />
    </svg>
  );
}

// Pip the robot. With children, Pip talks: the bubble is a polite live region so
// screen readers hear new help without moving focus. The head is decorative.
export default function Pip({ children, mood = 'neutral', size = 'md', hintLevel, label = 'Pip says:' }) {
  const reduced = useReducedMotion();
  const uid = `p${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const frozen = reduced;
  const wantsMotion = size !== 'sm' && !frozen;

  useEffect(() => {
    if (!wantsMotion) return undefined;
    motionStore.add(uid);
    return () => motionStore.remove(uid);
  }, [wantsMotion, uid]);
  const leader = useSyncExternalStore(motionStore.subscribe, motionStore.current, motionStore.current);
  const animated = wantsMotion && leader === uid;

  const art = getPipSvg(mood);
  const markup = useMemo(() => (art ? art.markup.split(INSTANCE_TOKEN).join(uid) : null), [art?.markup, uid]);
  const shownMood = art ? art.mood : 'legacy';

  // The bubble colour follows the requested mood, even when its art falls back.
  const classes = ['pip', `pip-${size}`, `pip-${MOOD_ALIASES[mood] || mood}`];
  if (frozen) classes.push('is-static');
  else if (!animated) classes.push('is-still');
  const style = hintLevel && BULB_GLOW[hintLevel] ? { '--bulb-glow': BULB_GLOW[hintLevel] } : undefined;

  return (
    <div className={classes.join(' ')} data-mood={shownMood} data-pip-file={art?.name} style={style}>
      <span className="pip-avatar" aria-hidden="true">
        <span className="pip-float">
          {markup ? (
            <span key={shownMood} className="pip-swap" dangerouslySetInnerHTML={{ __html: markup }} />
          ) : (
            <span key="legacy" className="pip-swap">
              <LegacyFace />
            </span>
          )}
        </span>
      </span>
      {children ? (
        <div className="pip-bubble" role="status" aria-live="polite">
          <span className="visually-hidden">{label} </span>
          {children}
        </div>
      ) : null}
    </div>
  );
}
