import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { gameReducer, initialState } from './gameReducer.js';
import { loadSaved, save } from './storage.js';
import { GAME_MINUTES, ROOM_BY_ID, uiEn, uiEs } from '../content/index.js';
import { fill } from '../lib/util.js';
import { playTone } from '../lib/sound.js';

const GameContext = createContext(null);
const GAME_MS = GAME_MINUTES * 60 * 1000;

export function GameProvider({ children, initial, now = () => Date.now() }) {
  const [saved] = useState(() => (initial ? null : loadSaved()));
  const [state, dispatch] = useReducer(gameReducer, undefined, () => initial || initialState(saved?.settings));
  const [clock, setClock] = useState(now());
  const nowRef = useRef(now);
  nowRef.current = now;

  useEffect(() => {
    if (state.screen !== 'welcome') save(state);
  }, [state]);

  const running = state.startedAt && !state.endedAt && !state.timeUp;
  useEffect(() => {
    if (!running) return undefined;
    const tick = () => {
      const t = nowRef.current();
      setClock(t);
      if (t - state.startedAt >= GAME_MS) dispatch({ type: 'TIME_UP' });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running, state.startedAt]);

  const remainingMs = state.startedAt ? Math.max(0, GAME_MS - ((state.endedAt || clock) - state.startedAt)) : GAME_MS;

  const t = useCallback((key, vars) => {
    const v = uiEn[key];
    return typeof v === 'string' ? fill(v, vars) : v;
  }, []);
  const es = useCallback(
    (key, vars) => {
      if (!state.settings.spanish) return null;
      const v = uiEs[key];
      return typeof v === 'string' ? fill(v, vars) : v ?? null;
    },
    [state.settings.spanish]
  );

  const enterRoom = useCallback(
    (roomId) => {
      const room = ROOM_BY_ID[roomId];
      const variants = {};
      for (const item of room.items) {
        if (item.variants) variants[item.id] = item.variants[Math.floor(Math.random() * item.variants.length)].id;
      }
      dispatch({ type: 'ENTER_ROOM', roomId, variants, now: nowRef.current() });
    },
    [dispatch]
  );

  const sound = useCallback(
    (kind) => {
      if (state.settings.sounds) playTone(kind);
    },
    [state.settings.sounds]
  );

  const value = useMemo(
    () => ({ state, dispatch, t, es, enterRoom, sound, remainingMs, gameMs: GAME_MS, saved, now: () => nowRef.current() }),
    [state, t, es, enterRoom, sound, remainingMs, saved]
  );
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
