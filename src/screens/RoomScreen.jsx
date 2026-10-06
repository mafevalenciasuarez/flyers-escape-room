import { useEffect, useRef, useState } from 'react';
import { ROOM_BY_ID, imageById } from '../content/index.js';
import { asset } from '../lib/util.js';
import { useGame } from '../state/GameContext.jsx';
import { pointsFor } from '../state/scoring.js';
import AudioPlayer from '../components/AudioPlayer.jsx';
import RoomBackdrop from '../components/RoomBackdrop.jsx';
import { roomBackdrop } from '../lib/roomBackdrops.js';
import Icon from '../components/Icon.jsx';
import { Button, Es, Instruction } from '../components/Bilingual.jsx';
import ChoiceItem from '../components/items/ChoiceItem.jsx';
import GapFillItem from '../components/items/GapFillItem.jsx';
import OrderItem from '../components/items/OrderItem.jsx';
import DilemmaItem from '../components/items/DilemmaItem.jsx';
import PostcardItem from '../components/items/PostcardItem.jsx';
import ReadingPanel, { ModePicker } from './ReadingPanel.jsx';

function PathPicker({ room, value, onChange }) {
  const { t, es } = useGame();
  return (
    <fieldset className="path-picker">
      <legend>
        {t('choosePath')}
        <Es>{es('choosePath')}</Es>
      </legend>
      <div className="path-options">
        {room.paths.map((p) => (
          <button
            key={p.id}
            type="button"
            data-path={p.id}
            className={`path-btn medal-${p.medal} ${value === p.id ? 'is-selected' : ''}`}
            aria-pressed={value === p.id}
            onClick={() => onChange(p.id)}
          >
            <span className="medal" aria-hidden="true">
              <Icon name="medal" size={44} />
            </span>
            <strong>
              {p.label}
              <Es>{p.labelEs}</Es>
            </strong>
            <span>
              {p.description}
              <Es>{p.descriptionEs}</Es>
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ProgressBar({ done, total }) {
  const { t } = useGame();
  return (
    <div className="room-progress">
      <span>{t('questionOf', { n: Math.min(done + 1, total), total })}</span>
      <span className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={t('questionOf', { n: Math.min(done + 1, total), total })}>
        <span style={{ width: `${(done / total) * 100}%` }} />
      </span>
    </div>
  );
}

export default function RoomScreen() {
  const { state, dispatch, t, es } = useGame();
  const roomId = state.currentRoom;
  const room = ROOM_BY_ID[roomId];
  const rs = state.rooms[roomId];
  const [highlightStep, setHighlightStep] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [manualPlaying, setManualPlaying] = useState(false);
  const playingIds = useRef(new Set());
  const watchAudio = (id) => (playing) => {
    const ids = playingIds.current;
    if (playing) ids.add(id);
    else ids.delete(id);
    setAudioPlaying(ids.size > 0);
    setManualPlaying(Boolean(room?.reading?.audio) && ids.has(room.reading.audio));
  };

  useEffect(() => {
    if (room?.id !== 'room2' || !room.reading) return undefined;
    for (const step of room.reading.steps) {
      const meta = step.image && imageById[step.image];
      if (!meta?.file) continue;
      const img = new Image();
      img.src = `${import.meta.env.BASE_URL}img/${meta.file}`;
    }
    return undefined;
  }, [room]);

  useEffect(() => {
    if (!room || !rs || rs.phase !== 'item') return undefined;
    const next = room.items[rs.itemIndex + 1];
    if (!next?.options) return undefined;
    for (const option of next.options) {
      const meta = option.image && imageById[option.image];
      if (!meta?.file) continue;
      const img = new Image();
      img.src = asset(`img/${meta.file}`);
    }
    return undefined;
  }, [room, rs]);

  if (!room || !rs) return null;

  const item = room.items[rs.itemIndex];
  const startPhase = room.reading ? 'mode' : room.paths ? 'path' : 'item';

  const onDone = (r) => {
    const points = pointsFor(r, room.helpCostsPoints);
    const firstTry = r.wrongs === 0 && (r.helps === 0 || !room.helpCostsPoints);
    setHighlightStep(null);
    dispatch({ type: 'ITEM_DONE', roomId, itemId: item.id, result: { ...r, points, firstTry, path: rs.path, mode: rs.mode }, now: Date.now() });
  };

  let body;
  if (rs.phase === 'intro') {
    body = (
      <div className="room-intro">
        <Icon name={room.icon} size={64} />
        <Instruction icon="arrow" en={room.intro} es={room.introEs} />
        {room.introAudio ? (
          <AudioPlayer clipId={room.introAudio} unlimited label={room.name} onPlayingChange={watchAudio(room.introAudio)} />
        ) : null}
        <Button icon="arrow" en={t('start')} es={es('start')} className="btn-big" onClick={() => dispatch({ type: 'SET_PHASE', roomId, phase: startPhase })} />
      </div>
    );
  } else if (rs.phase === 'mode') {
    body = (
      <div className="room-choose">
        <ModePicker reading={room.reading} value={rs.mode} onChange={(mode) => dispatch({ type: 'SET_MODE', roomId, mode })} />
      </div>
    );
  } else if (rs.phase === 'path') {
    body = (
      <div className="room-choose">
        <PathPicker room={room} value={rs.path} onChange={(path) => dispatch({ type: 'SET_PATH', roomId, path })} />
      </div>
    );
  } else if (item) {
    let itemView;
    switch (item.type) {
      case 'choice':
        itemView = (
          <ChoiceItem
            key={item.id}
            item={item}
            confidence={room.confidence}
            onDone={onDone}
            onHelpLevel={(lvl) => item.highlightStepOnHint && setHighlightStep(item.highlightStepOnHint[lvl] || null)}
            onPlayingChange={item.audio ? watchAudio(item.audio) : undefined}
          />
        );
        break;
      case 'gapfill': {
        const mode = item.mode || (rs.path === 'easy' ? 'choice' : rs.path === 'hard' ? 'bank' : 'type');
        itemView = <GapFillItem key={`${item.id}-${mode}`} item={item} mode={mode} onDone={onDone} />;
        break;
      }
      case 'order':
        itemView = <OrderItem key={item.id} item={item} variantId={rs.variants?.[item.id]} onDone={onDone} />;
        break;
      case 'dilemma':
        itemView = <DilemmaItem key={item.id} item={item} onDone={onDone} />;
        break;
      case 'postcard':
        itemView = <PostcardItem key={`${item.id}-${rs.path}`} item={item} path={rs.path} onDone={onDone} />;
        break;
      default:
        itemView = null;
    }
    body = (
      <>
        <div className="room-toolbar">
          <ProgressBar done={rs.itemIndex} total={room.items.length} />
          {room.paths ? (
            <>
              {state.streak >= 2 ? (
                <span className="streak" role="status">
                  <Icon name="star" /> {t('streak', { n: state.streak })}
                </span>
              ) : null}
              <Button variant="secondary" icon="medal" en={t('changePath')} es={es('changePath')} onClick={() => dispatch({ type: 'SET_PHASE', roomId, phase: 'path' })} />
            </>
          ) : null}
        </div>
        {room.reading ? (
          <div className="split">
            <ReadingPanel
              reading={room.reading}
              mode={rs.mode}
              onMode={(mode) => dispatch({ type: 'SET_MODE', roomId, mode, keepPhase: true })}
              highlightStep={highlightStep}
              onAudioPlaying={watchAudio(room.reading.audio)}
            />
            <div className="split-main">{itemView}</div>
          </div>
        ) : (
          itemView
        )}
      </>
    );
  }

  const art = roomBackdrop(room.id);
  const roomArt = Boolean(art) && !state.settings.contrast;
  const backdropAudio = art?.audio === 'any' ? audioPlaying : manualPlaying;

  return (
    <section className={`screen screen-room room-${room.id}`} aria-labelledby="room-title">
      {roomArt ? <RoomBackdrop roomId={room.id} audioPlaying={backdropAudio} /> : null}
      <h1 id="room-title" className="room-title">
        <Icon name={room.icon} /> {room.name}
      </h1>
      {roomArt ? <div className="room-panel">{body}</div> : body}
    </section>
  );
}
