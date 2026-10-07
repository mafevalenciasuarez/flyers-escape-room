import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { GameProvider } from '../state/GameContext.jsx';
import { initialState } from '../state/gameReducer.js';
import RoomBackdrop from '../components/RoomBackdrop.jsx';
import SpaceBackdrop from '../components/SpaceBackdrop.jsx';
import RoomScreen from '../screens/RoomScreen.jsx';
import SummaryScreen from '../screens/SummaryScreen.jsx';
import PostcardItem from '../components/items/PostcardItem.jsx';
import { STAR_COUNT } from '../components/Starfield.jsx';
import room3 from '../content/room3.js';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
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

function room3State(patch = {}) {
  const state = initialState();
  state.screen = 'room';
  state.currentRoom = 'room3';
  state.rooms.room3 = {
    phase: 'path',
    itemIndex: 0,
    results: {},
    variants: {},
    path: null,
    mode: null,
    startedAt: 1,
    finishedAt: null,
    done: false,
    ...patch,
  };
  return state;
}

describe('Garden Room backdrop', () => {
  it('hides the art from assistive tech, tags the lights, and paints stars behind the drawing', () => {
    const { container } = render(
      <GameProvider initial={initialState()}>
        <RoomBackdrop roomId="room3" />
      </GameProvider>
    );
    const scene = container.querySelector('.room-backdrop');
    expect(scene.getAttribute('aria-hidden')).toBe('true');
    expect(scene.getAttribute('data-room')).toBe('room3');
    expect(scene.getAttribute('data-audio')).toBe('idle');
    expect(scene.getAttribute('data-room-done')).toBe('false');
    expect(container.querySelector('[data-st="ceiling-lamp-glow"]')).toBeTruthy();
    expect(container.querySelector('[data-st="light-beam"]')).toBeTruthy();
    const stars = scene.querySelector('.starfield');
    const art = scene.querySelector('svg[preserveAspectRatio]');
    expect(stars).toBeTruthy();
    expect(scene.querySelectorAll('.star')).toHaveLength(STAR_COUNT);
    expect(scene.querySelector('.star.is-calm')).toBeNull();
    expect(stars.compareDocumentPosition(art) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(stars.getAttribute('aria-hidden')).toBe('true');
  });

  it('raises the lamps and the beam while the intro plays, then returns to idle', () => {
    function Harness() {
      const [playing, setPlaying] = useState(false);
      return (
        <>
          <RoomBackdrop roomId="room3" audioPlaying={playing} />
          <button type="button" onClick={() => setPlaying(true)}>Play intro</button>
          <button type="button" onClick={() => setPlaying(false)}>Stop intro</button>
        </>
      );
    }
    const { container } = render(
      <GameProvider initial={initialState()}>
        <Harness />
      </GameProvider>
    );
    const scene = () => container.querySelector('.room-backdrop');
    expect(scene().getAttribute('data-audio')).toBe('idle');
    fireEvent.click(screen.getByRole('button', { name: 'Play intro' }));
    expect(scene().getAttribute('data-audio')).toBe('playing');
    fireEvent.click(screen.getByRole('button', { name: 'Stop intro' }));
    expect(scene().getAttribute('data-audio')).toBe('idle');
  });

  it('holds the done state when both tasks are complete, and freezes under reduced motion', () => {
    reducedMotion();
    const done = room3State({ done: true, phase: 'item', itemIndex: 2 });
    const { container } = render(
      <GameProvider initial={done}>
        <RoomBackdrop roomId="room3" audioPlaying />
      </GameProvider>
    );
    const scene = container.querySelector('.room-backdrop');
    expect(scene.getAttribute('data-room-done')).toBe('true');
    expect(scene.classList.contains('is-static')).toBe(true);
  });
});

describe('Rooms 1 and 2 and the intro star field', () => {
  it('leaves the intro star field and the first two rooms unchanged', () => {
    const { container } = render(
      <GameProvider initial={initialState()}>
        <SpaceBackdrop />
        <RoomBackdrop roomId="room1" />
        <RoomBackdrop roomId="room2" />
      </GameProvider>
    );
    const intro = container.querySelector('.space-scene');
    expect(intro.querySelectorAll('.star')).toHaveLength(STAR_COUNT);
    expect(intro.querySelectorAll('.star.is-calm').length).toBeGreaterThan(0);
    expect(intro.querySelector('.planet')).toBeTruthy();
    expect(intro.querySelector('.station')).toBeTruthy();
    const rooms = container.querySelectorAll('.room-backdrop');
    expect(rooms[0].querySelector('.starfield')).toBeNull();
    expect(rooms[0].querySelector('[data-st="screen-glow"]')).toBeTruthy();
    expect(rooms[0].querySelector('[data-st="light-beam"]')).toBeNull();
    expect(rooms[1].querySelector('.starfield')).toBeNull();
    expect(rooms[1].querySelector('[data-st="engine-core-glow"]')).toBeTruthy();
    expect(rooms[1].querySelector('[data-st="ceiling-lamp-glow"]')).toBeTruthy();
  });
});

describe('Garden path cards, postcard and prize', () => {
  it('shows three decorative medals and a tick on the selected path', () => {
    const { container } = render(
      <GameProvider initial={room3State({ path: 'hard' })}>
        <RoomScreen />
      </GameProvider>
    );
    const medals = container.querySelectorAll('.path-medal');
    expect(medals).toHaveLength(3);
    for (const img of medals) {
      expect(img.getAttribute('alt')).toBe('');
      expect(img.getAttribute('aria-hidden')).toBe('true');
      expect(img.getAttribute('height')).toBe('80');
    }
    expect(screen.queryByText('1 star')).toBeNull();
    expect(screen.queryByText('2 stars')).toBeNull();
    expect(screen.queryByText('3 stars')).toBeNull();
    expect(container.querySelector('.path-stars')).toBeNull();
    expect(screen.queryByText(/bronze|silver|gold/i)).toBeNull();
    const selected = container.querySelector('[data-path="hard"]');
    expect(selected.classList.contains('is-selected')).toBe(true);
    expect(selected.querySelector('.path-tick')).toBeTruthy();
    expect(container.querySelector('[data-path="easy"] .path-tick')).toBeNull();
  });

  it('puts a menu in each hard gap and a writing box in each very hard gap', () => {
    const { container } = render(
      <GameProvider initial={room3State({ phase: 'item', path: 'hard' })}>
        <RoomScreen />
      </GameProvider>
    );
    const selects = container.querySelectorAll('.gap-text select.gap-select');
    expect(selects).toHaveLength(4);
    expect(container.querySelector('.word-btn')).toBeNull();
    expect(container.querySelector('.gap-controls')).toBeNull();
    for (const word of room3.items[0].bank) expect(selects[0].textContent).toContain(word);
    cleanup();

    const writing = render(
      <GameProvider initial={room3State({ phase: 'item', path: 'veryhard' })}>
        <RoomScreen />
      </GameProvider>
    );
    expect(writing.container.querySelectorAll('.gap-text input[data-gap]')).toHaveLength(4);
    expect(writing.container.querySelector('select')).toBeNull();
    expect(writing.container.querySelector('.gap-controls')).toBeNull();
    cleanup();

    const card = render(
      <GameProvider initial={initialState()}>
        <PostcardItem item={room3.items[1]} path="hard" onDone={vi.fn()} />
      </GameProvider>
    );
    expect(card.container.querySelectorAll('.postcard select.gap-select')).toHaveLength(3);
    expect(card.container.querySelector('.word-btn')).toBeNull();
  });

  it('keeps the stamp and postmark off the postcard text', () => {
    render(
      <GameProvider initial={initialState()}>
        <PostcardItem item={room3.items[1]} path="easy" onDone={vi.fn()} />
      </GameProvider>
    );
    const marks = document.querySelector('.postcard-marks');
    expect(marks.getAttribute('aria-hidden')).toBe('true');
    expect(marks.querySelector('.postcard-stamp').getAttribute('alt')).toBe('');
    expect(marks.querySelector('.postcard-postmark').getAttribute('alt')).toBe('');
    const opening = screen.getByText('Dear Earth,');
    const closing = screen.getByText('From, Cadet');
    expect(marks.contains(opening)).toBe(false);
    expect(marks.contains(closing)).toBe(false);
    expect(document.querySelector('.postcard-head').textContent).toContain('Dear Earth,');
  });

  it('shows the garden-star badge beside the prize name', () => {
    const state = room3State({ done: true, phase: 'item', itemIndex: 2 });
    state.screen = 'summary';
    const { container } = render(
      <GameProvider initial={state}>
        <SummaryScreen />
      </GameProvider>
    );
    const badge = container.querySelector('.prize-badge');
    expect(badge).toBeTruthy();
    expect(badge.getAttribute('alt')).toBe('');
    expect(screen.getByText('Garden Star')).toBeTruthy();
  });
});
