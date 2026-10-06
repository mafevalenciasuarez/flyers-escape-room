import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useGame } from '../state/GameContext.jsx';
import useReducedMotion from '../lib/useReducedMotion.js';
import { roomBackdrop } from '../lib/roomBackdrops.js';
import { REWARD_MS, subscribeReward } from '../lib/roomFx.js';
import { Starfield } from './Starfield.jsx';
import './RoomBackdrop.css';

// Full-bleed room art. Rooms without an entry stay on the plain page.
// The SVG string is built once. Listening state is a data attribute, so the
// markup is not rebuilt when a clip starts or stops.
export default function RoomBackdrop({ roomId, audioPlaying = false, sceneState = 'idle' }) {
  const entry = roomBackdrop(roomId);
  const { state } = useGame();
  const reduced = useReducedMotion();
  const rootRef = useRef(null);
  const still = reduced || state.settings.calm;
  const roomDone = Boolean(state.rooms[roomId]?.done);
  const [rewardOn, setRewardOn] = useState(false);

  useEffect(() => {
    if (roomId !== 'room4') return undefined;
    return subscribeReward(() => {
      if (reduced || state.settings.calm) return;
      setRewardOn(true);
    });
  }, [roomId, reduced, state.settings.calm]);

  useEffect(() => {
    if (!rewardOn) return undefined;
    const timer = setTimeout(() => setRewardOn(false), REWARD_MS);
    return () => clearTimeout(timer);
  }, [rewardOn]);

  const visualState = sceneState === 'repaired' ? 'repaired' : rewardOn && !still ? 'reward' : 'idle';

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.setAttribute('data-audio', audioPlaying ? 'playing' : 'idle');
    root.setAttribute('data-room-done', roomDone ? 'true' : 'false');
    root.setAttribute('data-state', visualState);
  }, [audioPlaying, roomDone, visualState]);

  if (!entry?.svg) return null;

  return (
    <div
      ref={rootRef}
      className={`room-backdrop${still ? ' is-static' : ''}`}
      data-room={roomId}
      data-audio="idle"
      data-room-done={roomDone ? 'true' : 'false'}
      data-state={visualState}
      style={entry.cssVars}
      aria-hidden="true"
    >
      {entry.stars ? <Starfield calmZone={entry.stars.calmZone} maxOpacity={entry.stars.maxOpacity} /> : null}
      <div dangerouslySetInnerHTML={{ __html: entry.svg }} />
    </div>
  );
}
