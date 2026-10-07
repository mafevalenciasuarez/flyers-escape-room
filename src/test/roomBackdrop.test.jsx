import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GameProvider } from '../state/GameContext.jsx';
import { initialState } from '../state/gameReducer.js';
import RoomBackdrop from '../components/RoomBackdrop.jsx';
import AudioPlayer from '../components/AudioPlayer.jsx';
import ChoiceItem from '../components/items/ChoiceItem.jsx';
import room1 from '../content/room1.js';
import room2 from '../content/room2.js';
import ReadingPanel from '../screens/ReadingPanel.jsx';

const originalMatchMedia = window.matchMedia;
const originalPlay = HTMLMediaElement.prototype.play;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  HTMLMediaElement.prototype.play = originalPlay;
  cleanup();
});

function reducedMotion() {
  window.matchMedia = (query) => ({
    matches: String(query).includes('prefers-reduced-motion'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  });
}

describe('RoomBackdrop', () => {
  it('is hidden from assistive tech and tags the room layers', () => {
    const { container } = render(
      <GameProvider initial={initialState()}>
        <RoomBackdrop roomId="room1" />
      </GameProvider>
    );
    const scene = container.querySelector('.room-backdrop');
    expect(scene.getAttribute('aria-hidden')).toBe('true');
    expect(scene.getAttribute('data-room')).toBe('room1');
    expect(scene.getAttribute('data-audio')).toBe('idle');
    for (const id of ['screen-glow', 'indicator-light1', 'indicator-light2', 'indicator-light3', 'porthole-space', 'ceiling-lamp-glow']) {
      expect(container.querySelector(`[data-st="${id}"]`)).toBeTruthy();
    }
    expect(container.querySelector('[data-st="engine-core-glow"]')).toBeNull();
  });

  it('adds the static class when reduced motion is requested', () => {
    reducedMotion();
    const { container } = render(
      <GameProvider initial={initialState()}>
        <RoomBackdrop roomId="room1" />
      </GameProvider>
    );
    expect(container.querySelector('.room-backdrop').classList.contains('is-static')).toBe(true);
  });

  it('switches data-audio to playing when a clip reports that it started', async () => {
    HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
    const { container } = render(
      <GameProvider initial={initialState()}>
        <AudioHarness />
      </GameProvider>
    );
    const scene = () => container.querySelector('.room-backdrop');
    expect(scene().getAttribute('data-audio')).toBe('idle');
    fireEvent.click(screen.getByRole('button', { name: /Play/i }));
    await waitFor(() => expect(scene().getAttribute('data-audio')).toBe('playing'));
    fireEvent.ended(container.querySelector('audio'));
    expect(scene().getAttribute('data-audio')).toBe('idle');
  });
});

function AudioHarness() {
  const [playing, setPlaying] = useState(false);
  return (
    <>
      <RoomBackdrop roomId="room1" audioPlaying={playing} />
      <AudioPlayer clipId="r1_q1" label="Sarah" onPlayingChange={setPlaying} />
    </>
  );
}

describe('ChoiceItem answer pictures', () => {
  const item = room1.items[0];

  it('renders each picture with the manifest alt text and falls back when a file fails', () => {
    const { container } = render(
      <GameProvider initial={initialState()}>
        <ChoiceItem item={item} onDone={() => {}} />
      </GameProvider>
    );
    const img = screen.getByAltText('A woman with long curly hair and glasses. She is holding a torch.');
    expect(img.tagName).toBe('IMG');
    expect(img.getAttribute('src')).toContain('img/r1-q1-curly-glasses-torch.jpg');
    expect(img.closest('.monitor')).toBeTruthy();
    fireEvent.error(img);
    expect(screen.queryByAltText('A woman with long curly hair and glasses. She is holding a torch.')).toBeNull();
    expect(container.querySelector('.image-placeholder').textContent).toContain(
      'A woman with long curly hair and glasses. She is holding a torch.'
    );
    expect(container.querySelector('.image-placeholder').closest('.monitor')).toBeTruthy();
  });
});

describe('Engine Room backdrop', () => {
  it('is hidden from assistive tech and tags the engine layers', () => {
    const { container } = render(
      <GameProvider initial={initialState()}>
        <RoomBackdrop roomId="room2" />
      </GameProvider>
    );
    const scene = container.querySelector('.room-backdrop');
    expect(scene.getAttribute('aria-hidden')).toBe('true');
    expect(scene.getAttribute('data-room')).toBe('room2');
    expect(scene.getAttribute('data-audio')).toBe('idle');
    expect(container.querySelector('svg')).toBeTruthy();
    for (const id of ['engine-core-glow', 'screen-glow', 'ceiling-lamp-glow', 'indicator-light1', 'indicator-light2', 'indicator-light3']) {
      expect(container.querySelector(`[data-st="${id}"]`)).toBeTruthy();
    }
    expect(container.textContent).not.toContain('MOON');
  });

  it('adds the static class when reduced motion is requested', () => {
    reducedMotion();
    const { container } = render(
      <GameProvider initial={initialState()}>
        <RoomBackdrop roomId="room2" />
      </GameProvider>
    );
    expect(container.querySelector('.room-backdrop').classList.contains('is-static')).toBe(true);
  });

  it('follows the manual clip, and returns to idle when the mode changes', async () => {
    HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
    const { container } = render(
      <GameProvider initial={initialState()}>
        <EngineAudioHarness />
      </GameProvider>
    );
    const scene = () => container.querySelector('.room-backdrop');
    expect(scene().getAttribute('data-audio')).toBe('idle');
    fireEvent.click(screen.getByRole('button', { name: /Play/i }));
    await waitFor(() => expect(scene().getAttribute('data-audio')).toBe('playing'));
    fireEvent.ended(container.querySelector('audio'));
    await waitFor(() => expect(scene().getAttribute('data-audio')).toBe('idle'));
    fireEvent.click(screen.getByRole('button', { name: /Listen again/i }));
    await waitFor(() => expect(scene().getAttribute('data-audio')).toBe('playing'));
    fireEvent.click(container.querySelector('[data-mode="text"]'));
    await waitFor(() => expect(scene().getAttribute('data-audio')).toBe('idle'));
  });
});

function EngineAudioHarness() {
  const [mode, setMode] = useState('listen');
  const [playing, setPlaying] = useState(false);
  return (
    <>
      <RoomBackdrop roomId="room2" audioPlaying={playing} />
      <ReadingPanel reading={room2.reading} mode={mode} onMode={setMode} onAudioPlaying={setPlaying} />
    </>
  );
}

describe('Engine Room step pictures', () => {
  function panel(mode) {
    return render(
      <GameProvider initial={initialState()}>
        <ReadingPanel reading={room2.reading} mode={mode} onMode={() => {}} />
      </GameProvider>
    );
  }

  it('shows a picture for the first three steps only', () => {
    const { container } = panel('pictures');
    const sources = [...container.querySelectorAll('.reading-panel img')].map((img) => img.getAttribute('src'));
    expect(sources).toEqual([
      expect.stringContaining('img/r2-step1-turn-off-engine.jpg'),
      expect.stringContaining('img/r2-step2-open-small-door.jpg'),
      expect.stringContaining('img/r2-step3-three-pieces.jpg'),
    ]);
    expect(container.querySelector('[data-step="s1"] img').getAttribute('width')).toBe('1138');
    expect(container.querySelector('[data-step="s1"] img').getAttribute('height')).toBe('850');
    expect(container.querySelector('[data-step="s1"] .monitor')).toBeTruthy();
    expect(container.querySelector('[data-step="s4"] img')).toBeNull();
    expect(container.querySelector('[data-step="s4"] .step-image')).toBeNull();
    expect(container.querySelector('[data-step="s5"] img')).toBeNull();
    expect(container.querySelector('[data-step="s5"] .step-image')).toBeNull();
    expect(container.querySelector('li.is-target')).toBeNull();
  });

  it('includes the picture in a highlighted step', () => {
    const { container } = render(
      <GameProvider initial={initialState()}>
        <ReadingPanel reading={room2.reading} mode="pictures" onMode={() => {}} highlightStep="s1" />
      </GameProvider>
    );
    const step = container.querySelector('li.is-target[data-step="s1"]');
    expect(step.querySelector('img')).toBeTruthy();
    expect(step.textContent).toContain('Look here');
  });

  it('renders no pictures in text mode', () => {
    const { container } = panel('text');
    expect(container.querySelector('.reading-panel img')).toBeNull();
    expect(container.querySelector('.step-image')).toBeNull();
  });

  it('falls back to the description when a picture fails', () => {
    const { container } = panel('pictures');
    const img = screen.getByAltText('A hand turns off the engine. The engine is very hot.');
    fireEvent.error(img);
    expect(screen.queryByAltText('A hand turns off the engine. The engine is very hot.')).toBeNull();
    expect(container.querySelector('[data-step="s1"] .image-placeholder').textContent).toContain(
      'A hand turns off the engine. The engine is very hot.'
    );
    expect(container.querySelector('[data-step="s1"] p').textContent).toContain('turn off the engine');
  });
});
