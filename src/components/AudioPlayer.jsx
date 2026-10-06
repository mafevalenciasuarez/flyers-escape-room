import { useEffect, useRef, useState } from 'react';
import { audioById } from '../content/index.js';
import { asset, fill } from '../lib/util.js';
import { useGame } from '../state/GameContext.jsx';
import { Button, Es } from './Bilingual.jsx';
import Icon from './Icon.jsx';

// Big Play / Listen again buttons, a play limit, a transcript toggle and a
// visible loading / error state. A missing file shows the transcript instead.
export default function AudioPlayer({
  clipId,
  unlimited = false,
  transcriptDefault = false,
  forceTranscript = false,
  transcriptOverride,
  hideTranscriptToggle = false,
  label,
  playText,
  playTextEs,
  variant = 'primary',
  onPlayingChange,
}) {
  const { state, dispatch, t, es } = useGame();
  const clip = audioById[clipId];
  const audioRef = useRef(null);
  const onPlayingRef = useRef(onPlayingChange);
  onPlayingRef.current = onPlayingChange;
  const [status, setStatus] = useState('idle'); // idle | loading | playing | ended | error
  const [showWords, setShowWords] = useState(transcriptDefault);
  const plays = state.plays[clipId] || 0;
  const limit = unlimited || state.practice ? null : clip?.maxPlays ?? null;
  const left = limit == null ? Infinity : Math.max(0, limit - plays);

  useEffect(() => {
    if (forceTranscript) setShowWords(true);
  }, [forceTranscript]);

  useEffect(() => {
    onPlayingRef.current?.(status === 'playing');
  }, [status]);

  useEffect(() => {
    const a = audioRef.current;
    return () => {
      if (a) a.pause();
      onPlayingRef.current?.(false);
    };
  }, []);

  if (!clip) return null;
  const transcript = transcriptOverride ?? clip.transcript;
  const missing = status === 'error';
  const wordsVisible = showWords || missing;
  const canToggle = !hideTranscriptToggle && (plays > 0 || missing || transcriptDefault || forceTranscript);

  const play = () => {
    const a = audioRef.current;
    if (!a || left <= 0 || status === 'loading') return;
    setStatus('loading');
    try {
      a.currentTime = 0;
    } catch {
      /* not loaded yet */
    }
    let p;
    try {
      p = a.play();
    } catch {
      setStatus('error');
      return;
    }
    Promise.resolve(p)
      .then(() => {
        setStatus('playing');
        dispatch({ type: 'AUDIO_PLAYED', clipId });
      })
      .catch(() => setStatus('error'));
  };

  const playLabel = plays > 0 ? t('listenAgain') : playText || t('play');
  const playEs = plays > 0 ? es('listenAgain') : playTextEs || es('play');

  return (
    <div className="audio-player" aria-label={label || clip.id}>
      <audio
        ref={audioRef}
        src={asset(`audio/${clip.file}`)}
        preload="none"
        onEnded={() => setStatus('ended')}
        onPause={() => {
          if (audioRef.current && !audioRef.current.paused) return;
          setStatus((s) => (s === 'playing' ? 'idle' : s));
        }}
        onError={() => setStatus('error')}
      />
      <div className="audio-controls">
        <Button
          variant={variant}
          icon={plays > 0 ? 'replay' : 'play'}
          en={status === 'loading' ? t('loading') : playLabel}
          es={status === 'loading' ? es('loading') : playEs}
          onClick={play}
          disabled={left <= 0 || missing || status === 'loading' || status === 'playing'}
          className="btn-audio"
          aria-label={playText ? undefined : `${playLabel}: ${label || ''}`.trim()}
        />
        {status === 'playing' ? (
          <span className="audio-status" role="status">
            <Icon name="headphones" /> ...
          </span>
        ) : null}
        {limit != null && !missing ? (
          <span className="audio-plays">
            {left <= 0 ? t('noPlaysLeft') : left === 1 ? t('oneLeft') : fill(t('playsLeft'), { n: left })}
            <Es>{left <= 0 ? es('noPlaysLeft') : left === 1 ? es('oneLeft') : es('playsLeft', { n: left })}</Es>
          </span>
        ) : null}
        {canToggle && !missing ? (
          <Button
            variant="secondary"
            icon="words"
            en={showWords ? t('hideWords') : t('showWords')}
            es={showWords ? es('hideWords') : es('showWords')}
            aria-expanded={showWords}
            onClick={() => setShowWords((v) => !v)}
          />
        ) : null}
      </div>
      {missing ? (
        <p className="audio-missing" role="status">
          <Icon name="words" /> {t('audioMissing')}
          <Es>{es('audioMissing')}</Es>
        </p>
      ) : null}
      {wordsVisible ? <div className="transcript">{typeof transcript === 'string' ? <p>{transcript}</p> : transcript}</div> : null}
    </div>
  );
}
