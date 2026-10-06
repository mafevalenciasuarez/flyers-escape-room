import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FINAL, ROOMS } from '../content/index.js';
import { useGame } from '../state/GameContext.jsx';
import { allPiecesFound, nextRoomId } from '../state/gameReducer.js';
import { roomProgress } from '../state/selectors.js';
import { claimCelebration, releaseClaim } from '../lib/stationVisit.js';
import useReducedMotion from '../lib/useReducedMotion.js';
import Icon from '../components/Icon.jsx';
import PieceCard from '../components/PieceCard.jsx';
import StationSvg, { usePointFractions } from '../components/StationSvg.jsx';
import { Starfield } from '../components/SpaceBackdrop.jsx';
import { Es } from '../components/Bilingual.jsx';
import './MapScreen.css';

// How far the station zooms, and how far the focus point travels toward the middle.
const CAMERA_SCALE = 1.2;
const CAMERA_PULL = 0.6;
const CELEBRATE_LIGHT_MS = 400;
const CELEBRATE_CAMERA_MS = 1200;

const ENTRIES = [
  ...ROOMS.map((room) => ({ ...room, gameId: room.id, zone: room.id })),
  { ...FINAL, gameId: 'final', zone: 'radio' },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function layoutOffset(el, ancestor) {
  let x = 0;
  let y = 0;
  let node = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    const next = node.offsetParent;
    if (!next || (next !== ancestor && !ancestor.contains(next))) break;
    node = next;
  }
  return { x, y };
}

function cameraTransform(panel, cam, frac) {
  if (!panel || !cam || !frac) return 'translate(0px, 0px) scale(1)';
  // The <svg> itself has no CSS offsetWidth. The wrapper is the station box.
  const sw = cam.offsetWidth;
  const sh = cam.offsetHeight;
  const pw = panel.clientWidth;
  const ph = panel.clientHeight;
  if (!sw || !sh || !pw || !ph) return 'translate(0px, 0px) scale(1)';
  const { x: layoutLeft, y: layoutTop } = layoutOffset(cam, panel);
  const fx = frac.x * sw;
  const fy = frac.y * sh;
  const focusX = layoutLeft + fx;
  const focusY = layoutTop + fy;
  const desiredX = focusX + CAMERA_PULL * (pw / 2 - focusX);
  const desiredY = focusY + CAMERA_PULL * (ph / 2 - focusY);
  let tx = desiredX - layoutLeft - fx * CAMERA_SCALE;
  let ty = desiredY - layoutTop - fy * CAMERA_SCALE;
  const minX = -layoutLeft;
  const maxX = pw - layoutLeft - sw * CAMERA_SCALE;
  const minY = -layoutTop;
  const maxY = ph - layoutTop - sh * CAMERA_SCALE;
  tx = clamp(tx, Math.min(minX, maxX), Math.max(minX, maxX));
  ty = clamp(ty, Math.min(minY, maxY), Math.max(minY, maxY));
  return `translate(${tx}px, ${ty}px) scale(${CAMERA_SCALE})`;
}

// Rooms 1–5 stay open in any order. Only the Radio Room is closed until every piece is found.
export default function MapScreen() {
  const { state, t, es, enterRoom } = useGame();
  const reduced = useReducedMotion();
  const isStatic = reduced || state.settings.calm;
  const next = nextRoomId(state);
  const ready = allPiecesFound(state);
  const found = ROOMS.filter((room) => state.pieces[room.id]);
  const doneIds = ROOMS.filter((room) => state.rooms[room.id]?.done).map((room) => room.id);
  const doneKey = doneIds.join(',');

  const [hover, setHover] = useState(null);
  const [keyFocus, setKeyFocus] = useState(null);
  const [celebrate, setCelebrate] = useState(null);
  const panelRef = useRef(null);
  const camRef = useRef(null);
  const stationRef = useRef(null);
  const cardRefs = useRef({});
  const points = usePointFractions(stationRef);

  useEffect(() => {
    const fresh = claimCelebration(doneIds);
    if (!fresh || isStatic) {
      setCelebrate(null);
      return undefined;
    }
    setCelebrate({ zone: fresh, lit: false, released: false });
    let finished = false;
    const lightTimer = setTimeout(() => {
      setCelebrate((current) => (current ? { ...current, lit: true } : current));
    }, CELEBRATE_LIGHT_MS);
    const cameraTimer = setTimeout(() => {
      finished = true;
      setCelebrate((current) => (current ? { ...current, released: true } : current));
    }, CELEBRATE_CAMERA_MS);
    return () => {
      clearTimeout(lightTimer);
      clearTimeout(cameraTimer);
      if (!finished) releaseClaim(fresh);
    };
    // doneKey is the stable picture of which rooms are finished.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneKey, isStatic]);

  const nextZone = next === 'final' ? 'radio' : next;
  const cameraZone = celebrate && !celebrate.released ? celebrate.zone : hover || keyFocus || nextZone;

  const lightStates = useMemo(() => {
    const lights = {};
    for (const room of ROOMS) {
      const holding = celebrate && celebrate.zone === room.id && !celebrate.lit;
      lights[room.id] = state.rooms[room.id]?.done && !holding ? 'on' : 'off';
    }
    lights.radio = 'off';
    return lights;
  }, [state.rooms, celebrate]);

  const zoneStates = useMemo(() => {
    const selected = hover || keyFocus;
    const zones = {};
    for (const entry of ENTRIES) {
      const done = !!state.rooms[entry.gameId]?.done;
      const started = !!state.rooms[entry.gameId] && !done;
      const isNext = next === entry.gameId;
      const isLocked = entry.gameId === 'final' && !ready;
      let status = 'ready';
      if (isLocked) status = 'locked';
      else if (done) status = 'done';
      else if (started) status = 'active';
      else if (isNext) status = 'next';
      if (selected === entry.zone) status = 'selected';
      zones[entry.zone] = status;
    }
    return zones;
  }, [state.rooms, hover, keyFocus, next, ready]);

  const onZoneClick = useCallback(
    (zone) => {
      const gameId = zone === 'radio' ? 'final' : zone;
      if (gameId === 'final' && !allPiecesFound(state)) {
        cardRefs.current[zone]?.focus();
        return;
      }
      enterRoom(gameId);
    },
    [enterRoom, state]
  );

  const sideRef = useRef(null);
  const [scrollEdges, setScrollEdges] = useState({ top: false, bottom: false });
  useEffect(() => {
    const el = sideRef.current;
    if (!el) return undefined;
    const update = () => {
      const top = el.scrollTop > 4;
      const bottom = el.scrollHeight - el.clientHeight - el.scrollTop > 4;
      setScrollEdges((prev) => (prev.top === top && prev.bottom === bottom ? prev : { top, bottom }));
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(el);
    for (const child of el.children) observer?.observe(child);
    return () => {
      el.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, [found.length]);

  const [transform, setTransform] = useState('translate(0px, 0px) scale(1)');
  useLayoutEffect(() => {
    const apply = () => {
      setTransform(cameraTransform(panelRef.current, camRef.current, points[cameraZone]));
    };
    apply();
    let timer = 0;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(apply, 120);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, [cameraZone, points]);

  return (
    <section className={`screen screen-map${isStatic ? ' is-static' : ''}`} aria-labelledby="map-title">
      <div className="map-sky" aria-hidden="true">
        <Starfield />
      </div>
      <div className="map-layout">
        <div className="map-station-panel" ref={panelRef}>
          <div className="map-station-cam" ref={camRef} style={{ transform }}>
            <StationSvg
              ref={stationRef}
              mode="map"
              lightStates={lightStates}
              zoneStates={zoneStates}
              focusRoom={cameraZone}
              onZoneEnter={setHover}
              onZoneLeave={() => setHover(null)}
              onZoneClick={onZoneClick}
              static={isStatic}
            />
          </div>
        </div>
        <div className={`map-side-frame${scrollEdges.top ? ' is-fade-top' : ''}${scrollEdges.bottom ? ' is-fade-bottom' : ''}`}>
          <div className="map-side" ref={sideRef}>
          <h1 id="map-title">
            <Icon name="map" /> {t('mapTitle')}
            <Es>{es('mapTitle')}</Es>
          </h1>
          <ol className="map-cards">
            {ENTRIES.map((room, index) => {
              const done = !!state.rooms[room.gameId]?.done;
              const started = !!state.rooms[room.gameId] && !done;
              const isNext = next === room.gameId;
              const isLocked = room.gameId === 'final' && !ready;
              const prevDone = index > 0 && !!state.rooms[ENTRIES[index - 1].gameId]?.done;
              const progress = roomProgress(state, room.gameId);
              let statusIcon = null;
              let statusKey = null;
              if (isLocked) {
                statusIcon = 'lock';
                statusKey = 'statusClosed';
              } else if (done) {
                statusIcon = 'check';
                statusKey = 'finished';
              } else if (isNext) {
                statusIcon = 'arrow';
                statusKey = 'nextRoom';
              } else if (started) {
                statusIcon = 'circle';
                statusKey = 'statusOpen';
              }
              return (
                <li key={room.gameId} className={`room-card${done ? ' is-done' : ''}${isNext ? ' is-next' : ''}`}>
                  {index > 0 ? (
                    <span className={`map-join${prevDone ? ' is-on' : ''}`} aria-hidden="true">
                      <span className="map-join-fill" />
                    </span>
                  ) : null}
                  <button
                    type="button"
                    className="map-card"
                    data-room={room.gameId}
                    aria-disabled={isLocked ? 'true' : undefined}
                    aria-current={isNext ? 'step' : undefined}
                    aria-describedby={isLocked ? `lock-${room.gameId}` : undefined}
                    ref={(node) => {
                      cardRefs.current[room.zone] = node;
                    }}
                    onMouseEnter={() => setHover(room.zone)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setKeyFocus(room.zone)}
                    onBlur={() => setKeyFocus(null)}
                    onClick={() => {
                      if (isLocked) return;
                      enterRoom(room.gameId);
                    }}
                  >
                    <span className="map-card-fill" style={{ transform: `scaleX(${progress})` }} />
                    <span className="map-card-body">
                      <span className="room-num" aria-hidden="true">{room.order}</span>
                      <Icon name={room.icon} size={36} />
                      <h2>{room.name}</h2>
                      {statusKey ? (
                        <p className="room-status">
                          <span data-icon={statusIcon}>
                            <Icon name={statusIcon} size={18} />
                          </span>
                          {t(statusKey)}
                          <Es>{es(statusKey)}</Es>
                        </p>
                      ) : null}
                      {isLocked ? (
                        <p id={`lock-${room.gameId}`} className="map-lock-reason">
                          {t('findAllFirst')}
                          <Es>{es('findAllFirst')}</Es>
                        </p>
                      ) : null}
                      <span className="map-go">
                        <Icon name="arrow" size={18} />
                        <span>{t('go')}</span>
                        <Es>{es('go')}</Es>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="my-pieces">
            <h2>
              <Icon name="piece" /> {t('myPieces')}
              <Es>{es('myPieces')}</Es>
            </h2>
            <p>
              {t('piecesFound', { n: found.length })}
              <Es>{es('piecesFound', { n: found.length })}</Es>
            </p>
            <div className="piece-row">
              {found.map((room) => (
                <PieceCard key={room.id} clue={room.clue} />
              ))}
            </div>
          </div>
          </div>
          <div className="map-side-fade map-side-fade-top" aria-hidden="true" />
          <div className="map-side-fade map-side-fade-bottom" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
