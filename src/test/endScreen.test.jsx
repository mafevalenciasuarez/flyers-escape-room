import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from '../App.jsx';
import { GameProvider, useGame } from '../state/GameContext.jsx';
import { initialState } from '../state/gameReducer.js';
import EndScreen from '../screens/EndScreen.jsx';
import { ROOMS } from '../content/index.js';
import { configureSfx, resetSfxSession, setSpokenPlaying } from '../lib/sfx.js';

const originalMatchMedia = window.matchMedia;
const originalPlay = HTMLMediaElement.prototype.play;
const plays = [];

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  HTMLMediaElement.prototype.play = originalPlay;
  plays.length = 0;
  configureSfx({ sounds: true, calm: false });
  setSpokenPlaying(false);
  resetSfxSession();
  cleanup();
});

function matchMedia(reduced) {
  window.matchMedia = (query) => ({
    matches: reduced && String(query).includes('prefers-reduced-motion'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  });
}

function finishedState() {
  const state = initialState();
  state.screen = 'end';
  state.startedAt = 1;
  state.endedAt = 2;
  const blank = {
    phase: 'intro',
    itemIndex: 1,
    results: {},
    variants: {},
    path: null,
    mode: null,
    startedAt: 1,
    finishedAt: 2,
    done: true,
  };
  for (const room of ROOMS) state.rooms[room.id] = { ...blank, path: room.id === 'room3' ? 'easy' : null };
  state.rooms.final = {
    ...blank,
    results: {
      final_q1: { points: 5, helps: 1, wrongs: 0, firstTry: false, skill: 'listening', words: ['midnight'] },
    },
  };
  return state;
}

function renderEnd() {
  return render(
    <GameProvider initial={finishedState()}>
      <EndScreen />
    </GameProvider>
  );
}

describe('EndScreen', () => {
  it('opens on the station with its lights on, three rings, the title and both buttons', () => {
    matchMedia(true);
    const { container } = renderEnd();
    expect(screen.getByRole('heading', { level: 1, name: /You repaired the radio!/ })).toBeTruthy();
    expect(container.querySelector('.station-svg')).toBeTruthy();
    for (const id of ['room1', 'room2', 'room3', 'radio']) {
      expect(container.querySelector(`[data-st="light-${id}"]`).getAttribute('data-state')).toBe('on');
    }
    expect(container.querySelectorAll('.end-ring')).toHaveLength(3);
    expect(screen.getByRole('button', { name: /Listen to Helen/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Next/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Play again/ })).toBeNull();
  });

  it('shows the results after Next, with one Play again button in the hero', () => {
    matchMedia(true);
    const { container } = renderEnd();
    fireEvent.click(screen.getByRole('button', { name: /^Next/ }));
    expect(container.querySelector('.summary-hero')).toBeTruthy();
    expect(container.querySelectorAll('.prize-badge')).toHaveLength(6);
    expect(screen.getByRole('heading', { level: 2, name: /Your prizes/ })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: /Words to look at again/ })).toBeTruthy();
    expect(screen.getByText('0 of 1 right the first time')).toBeTruthy();
    expect(screen.getAllByText('0 of 0 right the first time')).toHaveLength(2);
    expect(screen.getByText('5')).toBeTruthy();
    const again = screen.getAllByRole('button', { name: /Play again/ });
    expect(again).toHaveLength(1);
    expect(container.querySelector('.summary-hero').contains(again[0])).toBe(true);
    expect(container.querySelector('.end-wave')).toBeNull();
    expect(container.querySelector('.end-rise')).toBeNull();
    expect(container.querySelector('.end-reveal')).toBeNull();
  });

  it('renders static rings and no entrance classes when motion is reduced', () => {
    matchMedia(true);
    const { container } = renderEnd();
    expect(container.querySelectorAll('.end-ring')).toHaveLength(3);
    expect(container.querySelector('.end-wave')).toBeNull();
    expect(container.querySelector('.end-rise')).toBeNull();
    expect(container.querySelector('.end-reveal')).toBeNull();
    expect(container.querySelector('.screen-end').classList.contains('is-static')).toBe(true);
  });

  it('adds the rise and the wave classes when motion is allowed', () => {
    matchMedia(false);
    const { container } = renderEnd();
    expect(container.querySelector('.end-rise')).toBeTruthy();
    expect(container.querySelectorAll('.end-wave')).toHaveLength(3);
  });

  it('plays the room-end sound once, including after Next', () => {
    matchMedia(true);
    plays.length = 0;
    HTMLMediaElement.prototype.play = vi.fn(function play() {
      plays.push(this.src);
      return Promise.resolve();
    });
    function Jump() {
      const { state, dispatch } = useGame();
      return (
        <>
          <button type="button" onClick={() => dispatch({ type: 'FINISH' })}>Finish the radio</button>
          {state.screen === 'end' ? <EndScreen /> : null}
        </>
      );
    }
    render(
      <GameProvider initial={initialState()}>
        <Jump />
      </GameProvider>
    );
    expect(plays.some((src) => src.includes('room-end-screen'))).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: /Finish the radio/ }));
    expect(plays.filter((src) => src.includes('room-end-screen'))).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: /^Next/ }));
    expect(plays.filter((src) => src.includes('room-end-screen'))).toHaveLength(1);
  });

  it('does not play the room-end sound when a saved end screen mounts', () => {
    matchMedia(true);
    plays.length = 0;
    HTMLMediaElement.prototype.play = vi.fn(function play() {
      plays.push(this.src);
      return Promise.resolve();
    });
    render(<App initial={finishedState()} />);
    expect(plays.some((src) => src.includes('room-end-screen'))).toBe(false);
  });

  it('sends Play again back to the start', () => {
    matchMedia(true);
    render(<App initial={finishedState()} />);
    fireEvent.click(screen.getByRole('button', { name: /^Next/ }));
    fireEvent.click(screen.getByRole('button', { name: /Play again/ }));
    expect(screen.getByText(/Hello, Cadet!/)).toBeTruthy();
  });
});
