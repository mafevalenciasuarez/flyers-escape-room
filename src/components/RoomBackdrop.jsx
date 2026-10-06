import { useLayoutEffect, useRef } from 'react';
import { useGame } from '../state/GameContext.jsx';
import useReducedMotion from '../lib/useReducedMotion.js';
import { roomBackdrop } from '../lib/roomBackdrops.js';
import './RoomBackdrop.css';

// Full-bleed room art. Rooms without an entry stay on the plain page.
// The SVG string is built once. Listening state is a data attribute, so the
// markup is not rebuilt when a clip starts or stops.
export default function RoomBackdrop({ roomId, audioPlaying = false }) {
  const entry = roomBackdrop(roomId);
  const { state } = useGame();
  const reduced = useReducedMotion();
  const rootRef = useRef(null);
  const still = reduced || state.settings.calm;

  useLayoutEffect(() => {
    rootRef.current?.setAttribute('data-audio', audioPlaying ? 'playing' : 'idle');
  }, [audioPlaying]);

  if (!entry?.svg) return null;

  return (
    <div
      ref={rootRef}
      className={`room-backdrop${still ? ' is-static' : ''}`}
      data-room={roomId}
      data-audio="idle"
      style={entry.cssVars}
      aria-hidden="true"
    >
      <div dangerouslySetInnerHTML={{ __html: entry.svg }} />
    </div>
  );
}
