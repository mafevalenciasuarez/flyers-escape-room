import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { GameProvider } from '../state/GameContext.jsx';
import { initialState } from '../state/gameReducer.js';
import SummaryScreen from '../screens/SummaryScreen.jsx';
import {
  configureSfx,
  playRoomEnd,
  playSfx,
  resetSfxSession,
  setSpokenPlaying,
} from '../lib/sfx.js';

const originalPlay = HTMLMediaElement.prototype.play;
const plays = [];

afterEach(() => {
  HTMLMediaElement.prototype.play = originalPlay;
  plays.length = 0;
  configureSfx({ sounds: true, calm: false });
  setSpokenPlaying(false);
  resetSfxSession();
  cleanup();
});

function listen() {
  plays.length = 0;
  HTMLMediaElement.prototype.play = vi.fn(function play() {
    plays.push({ src: this.src, volume: this.volume });
    return Promise.resolve();
  });
}

describe('sound effects', () => {
  it('stays silent when the setting is off, while speech plays, and for a missing file', () => {
    listen();
    configureSfx({ sounds: false, calm: false });
    playSfx('click');
    expect(plays).toHaveLength(0);

    configureSfx({ sounds: true, calm: false });
    setSpokenPlaying(true);
    playSfx('correct');
    expect(plays).toHaveLength(0);
    setSpokenPlaying(false);

    HTMLMediaElement.prototype.play = () => {
      throw new Error('missing');
    };
    expect(() => playSfx('error')).not.toThrow();
  });

  it('throttles clicks and refuses the error sting in Calm mode', () => {
    listen();
    let now = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    playSfx('click');
    playSfx('click');
    expect(plays).toHaveLength(1);
    now += 130;
    playSfx('click');
    expect(plays).toHaveLength(2);

    configureSfx({ sounds: true, calm: true });
    playSfx('error');
    expect(plays.some((row) => row.src.includes('answer-error'))).toBe(false);
    playSfx('correct');
    const correct = plays.find((row) => row.src.includes('answer-correct'));
    expect(correct.volume).toBeCloseTo(0.35 * 0.8 * 0.5);
    vi.restoreAllMocks();
  });

  it('plays the room ending once per room and not when a saved game mounts', () => {
    listen();
    playRoomEnd('summary:room4');
    playRoomEnd('summary:room4');
    playRoomEnd('end');
    expect(plays.filter((row) => row.src.includes('room-end-screen'))).toHaveLength(2);
    resetSfxSession();
    playRoomEnd('summary:room4');
    expect(plays.filter((row) => row.src.includes('room-end-screen'))).toHaveLength(3);

    plays.length = 0;
    const state = initialState();
    state.screen = 'summary';
    state.currentRoom = 'room4';
    state.startedAt = 5;
    state.rooms.room4 = {
      phase: 'item',
      itemIndex: 2,
      results: {},
      variants: {},
      path: null,
      mode: null,
      startedAt: 1,
      finishedAt: 2,
      done: true,
    };
    render(
      <GameProvider initial={state}>
        <SummaryScreen />
      </GameProvider>
    );
    expect(plays.some((row) => row.src.includes('room-end-screen'))).toBe(false);
  });
});
