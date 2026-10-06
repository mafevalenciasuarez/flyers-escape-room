import { useState } from 'react';
import { useGame } from '../state/GameContext.jsx';
import { imageById } from '../content/index.js';
import AudioPlayer from '../components/AudioPlayer.jsx';
import MonitorFrame from '../components/MonitorFrame.jsx';
import Icon from '../components/Icon.jsx';
import { Es } from '../components/Bilingual.jsx';

function highlightText(text, words) {
  if (!words?.length) return text;
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(${escaped.join('|')})`, 'gi');
  return text.split(re).map((part, i) =>
    words.some((w) => w.toLowerCase() === part.toLowerCase()) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
  );
}

export function ModePicker({ reading, value, onChange, compact = false }) {
  const { t, es } = useGame();
  return (
    <fieldset className={`mode-picker ${compact ? 'is-compact' : ''}`}>
      <legend>
        {t('chooseRead')}
        <Es>{es('chooseRead')}</Es>
      </legend>
      <div className="mode-options">
        {reading.modes.map((m) => (
          <button
            key={m.id}
            type="button"
            data-mode={m.id}
            className={`mode-btn ${value === m.id ? 'is-selected' : ''}`}
            aria-pressed={value === m.id}
            onClick={() => onChange(m.id)}
          >
            <Icon name={m.icon} size={compact ? 24 : 36} />
            <span>
              {m.label}
              <Es>{m.labelEs}</Es>
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function StepPicture({ id }) {
  const meta = imageById[id];
  const [failed, setFailed] = useState(false);
  if (!meta) return null;
  return (
    <div className="step-image">
      <MonitorFrame>
        {failed ? (
          <div className="image-placeholder" role="img" aria-label={meta.alt}>
            <Icon name="picture" size={32} />
            <span aria-hidden="true">{meta.alt}</span>
          </div>
        ) : (
          <img
            className="image-slot"
            src={`${import.meta.env.BASE_URL}img/${meta.file}`}
            alt={meta.alt}
            width={meta.width}
            height={meta.height}
            loading="eager"
            decoding="async"
            onError={() => setFailed(true)}
          />
        )}
      </MonitorFrame>
    </div>
  );
}

// Room 2: the same text in four ways. Help step 3 outlines the step to read.
export default function ReadingPanel({ reading, mode, onMode, highlightStep, onAudioPlaying }) {
  const { t } = useGame();
  const listen = mode === 'listen' || mode === 'listen-highlight';
  const marks = mode === 'listen-highlight';
  const steps = (
    <ol className="manual-steps">
      {reading.steps.map((s) => (
        <li key={s.id} className={highlightStep === s.id ? 'is-target' : ''} data-step={s.id}>
          {highlightStep === s.id ? (
            <span className="target-label">
              <Icon name="arrow" size={18} /> {t('lookHere')}
            </span>
          ) : null}
          {mode === 'pictures' && s.image ? (
            <div className="step-row">
              <StepPicture id={s.image} />
              <p>{marks ? highlightText(s.text, s.highlight) : s.text}</p>
            </div>
          ) : (
            <p>{marks ? highlightText(s.text, s.highlight) : s.text}</p>
          )}
        </li>
      ))}
    </ol>
  );
  return (
    <aside className="reading-panel" aria-label={reading.title}>
      <ModePicker reading={reading} value={mode} onChange={onMode} compact />
      <div className="reading-card">
        <h3>{reading.title}</h3>
        {listen ? (
          <AudioPlayer
            key={mode}
            clipId={reading.audio}
            unlimited
            transcriptDefault
            transcriptOverride={steps}
            label={reading.title}
            onPlayingChange={onAudioPlaying}
          />
        ) : (
          steps
        )}
      </div>
    </aside>
  );
}
