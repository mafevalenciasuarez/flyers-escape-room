import { useMemo, useRef, useState } from 'react';
import { FINAL, ROOM_BY_ID } from '../content/index.js';
import { useGame } from '../state/GameContext.jsx';
import { pointsFor } from '../state/scoring.js';
import { shuffle } from '../lib/util.js';
import { roomBackdrop } from '../lib/roomBackdrops.js';
import AudioPlayer from '../components/AudioPlayer.jsx';
import RoomBackdrop from '../components/RoomBackdrop.jsx';
import Icon from '../components/Icon.jsx';
import PieceCard from '../components/PieceCard.jsx';
import Pip from '../components/Pip.jsx';
import { useThinkingBeat } from '../components/Feedback.jsx';
import ChoiceItem from '../components/items/ChoiceItem.jsx';
import { Button, Es, Instruction } from '../components/Bilingual.jsx';

function PlacePieces({ onDone }) {
  const { state, dispatch, t, es, sound } = useGame();
  const tray = useMemo(() => shuffle(FINAL.slots), []);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState(null);
  const [level, setLevel] = useState(0);
  const [helpPresses, setHelpPresses] = useState(0);
  const beat = useThinkingBeat(helpPresses, level ? FINAL.place.hints[level - 1] : null);
  const placedPieces = new Set(Object.values(state.placed));
  const allPlaced = FINAL.slots.every((slot) => state.placed[slot] === slot);

  const tryPlace = (slot) => {
    if (!selected || state.placed[slot]) return;
    if (selected === slot) {
      dispatch({ type: 'PLACE', slot, piece: selected });
      dispatch({ type: 'ANSWER', correct: true });
      sound('right');
      setSelected(null);
      setMessage(null);
    } else {
      dispatch({ type: 'ANSWER', correct: false });
      sound('wrong');
      setLevel((l) => Math.min(FINAL.place.hints.length, l + 1));
      setMessage(FINAL.place.wrong);
    }
  };

  return (
    <div className="item item-place">
      <Instruction icon="piece" en={FINAL.place.instruction} es={FINAL.place.instructionEs} as="h2" />
      <div className="tray" role="group" aria-label={t('choosePiece')}>
        <p className="tray-title">
          {t('choosePiece')}
          <Es>{es('choosePiece')}</Es>
        </p>
        {tray
          .filter((roomId) => !placedPieces.has(roomId))
          .map((roomId) => (
            <button
              key={roomId}
              type="button"
              data-piece={roomId}
              className={`tray-piece ${selected === roomId ? 'is-selected' : ''}`}
              aria-pressed={selected === roomId}
              onClick={() => {
                setSelected(roomId);
                setMessage(null);
              }}
            >
              <PieceCard clue={ROOM_BY_ID[roomId].clue} />
            </button>
          ))}
      </div>
      <ol className="slots">
        {FINAL.slots.map((slot) => {
          const room = ROOM_BY_ID[slot];
          const filled = state.placed[slot];
          return (
            <li key={slot}>
              <button
                type="button"
                data-slot={slot}
                className={`slot ${filled ? 'is-filled' : ''}`}
                onClick={() => tryPlace(slot)}
                disabled={!!filled}
                aria-label={`${room.order}. ${room.name}${filled ? `: ${room.clue.label}` : ''}`}
              >
                <span className="slot-head">
                  <span className="room-num" aria-hidden="true">{room.order}</span>
                  <Icon name={room.icon} /> {room.name}
                </span>
                {filled ? <PieceCard clue={room.clue} size="sm" /> : <span className="slot-empty" aria-hidden="true">?</span>}
              </button>
            </li>
          );
        })}
      </ol>
      {message || beat.hint || beat.thinking ? (
        <Pip mood={beat.thinking ? 'thinking' : 'hint'} hintLevel={beat.thinking ? undefined : level} label={t('pipSays')}>
          {message || beat.hint ? (
            <>
              {message ? <strong className="fb-wrong">{message}</strong> : null}{' '}
              {beat.hint}
            </>
          ) : null}
        </Pip>
      ) : null}
      {allPlaced ? (
        <>
          <Pip mood="happy" label={t('pipSays')}>
            <strong className="fb-right">
              <Icon name="radio" /> {t('radioWorking')}
            </strong>{' '}
            {FINAL.place.done}
          </Pip>
          <div className="item-actions">
            <Button icon="arrow" en={t('next')} es={es('next')} onClick={onDone} />
          </div>
        </>
      ) : (
        <div className="item-actions">
          <Button variant="secondary" icon="help" en={t('help')} es={es('help')} disabled={level >= FINAL.place.hints.length}
            onClick={() => {
              setLevel((l) => Math.min(FINAL.place.hints.length, l + 1));
              setHelpPresses((n) => n + 1);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function RadioRoomScreen() {
  const { state, dispatch, t, es } = useGame();
  const rs = state.rooms.final;
  const [audioPlaying, setAudioPlaying] = useState(false);
  const playingIds = useRef(new Set());
  const watchAudio = (id) => (playing) => {
    const ids = playingIds.current;
    if (playing) ids.add(id);
    else ids.delete(id);
    setAudioPlaying(ids.size > 0);
  };
  if (!rs) return null;
  const item = FINAL.items[0];
  const art = roomBackdrop('final');
  const roomArt = Boolean(art) && !state.settings.contrast;
  const repaired = FINAL.slots.every((slot) => state.placed[slot] === slot);

  let body;
  if (rs.phase === 'intro') {
    body = (
      <div className="room-intro">
        <Icon name="radio" size={64} />
        <Instruction icon="arrow" en={FINAL.intro} es={FINAL.introEs} />
        <AudioPlayer clipId={FINAL.introAudio} unlimited label={FINAL.name} onPlayingChange={watchAudio(FINAL.introAudio)} />
        <Button icon="arrow" en={t('start')} es={es('start')} className="btn-big" onClick={() => dispatch({ type: 'SET_PHASE', roomId: 'final', phase: 'place' })} />
      </div>
    );
  } else if (rs.phase === 'place') {
    body = <PlacePieces onDone={() => dispatch({ type: 'SET_PHASE', roomId: 'final', phase: 'item' })} />;
  } else {
    body = (
      <ChoiceItem
        key={item.id}
        item={item}
        onPlayingChange={item.audio ? watchAudio(item.audio) : undefined}
        onDone={(r) => {
          const points = pointsFor(r, FINAL.helpCostsPoints);
          const firstTry = r.wrongs === 0 && r.helps === 0;
          dispatch({ type: 'ITEM_DONE', roomId: 'final', itemId: item.id, result: { ...r, points, firstTry } });
          dispatch({ type: 'FINISH', now: Date.now() });
        }}
      />
    );
  }

  return (
    <section className="screen screen-room room-final" aria-labelledby="room-title">
      {roomArt ? <RoomBackdrop roomId="final" audioPlaying={audioPlaying} sceneState={repaired ? 'repaired' : 'idle'} /> : null}
      <h1 id="room-title" className="room-title">
        <Icon name="radio" /> {FINAL.name}
      </h1>
      {roomArt ? <div className="room-panel">{body}</div> : body}
    </section>
  );
}
