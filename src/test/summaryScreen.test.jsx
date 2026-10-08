import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { GameProvider } from '../state/GameContext.jsx';
import { initialState } from '../state/gameReducer.js';
import SummaryScreen from '../screens/SummaryScreen.jsx';
import EndScreen from '../screens/EndScreen.jsx';
import RoomScreen from '../screens/RoomScreen.jsx';
import { ROOMS } from '../content/index.js';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  cleanup();
});

function roomState(room, patch = {}) {
  const state = initialState();
  state.screen = 'summary';
  state.currentRoom = room.id;
  state.rooms[room.id] = {
    phase: 'intro',
    itemIndex: room.items.length,
    results: {},
    variants: {},
    path: null,
    mode: null,
    startedAt: 1,
    finishedAt: 2,
    done: true,
    ...patch,
  };
  return state;
}

function renderSummary(room, patch) {
  return render(
    <GameProvider initial={roomState(room, patch)}>
      <SummaryScreen />
    </GameProvider>
  );
}

describe('SummaryScreen layout', () => {
  it('orders the hero, the three cards and the words, with one map button in the hero', () => {
    const { container } = renderSummary(ROOMS[0]);
    const hero = container.querySelector('.summary-hero');
    const row = container.querySelector('.summary-row');
    const words = container.querySelector('.summary-words');
    expect(hero).toBeTruthy();
    expect(row.compareDocumentPosition(hero) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
    expect(words.compareDocumentPosition(row) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
    expect([...row.children].map((el) => el.className)).toEqual([
      'summary-card summary-piece',
      'summary-card summary-prize',
      'summary-card summary-score',
    ]);
    const buttons = screen.getAllByRole('button', { name: /Go to the map/ });
    expect(buttons).toHaveLength(1);
    expect(hero.contains(buttons[0])).toBe(true);
    expect(container.querySelector('.item-actions')).toBeNull();
    expect(screen.getByRole('heading', { level: 1, name: /Room finished!/ }).textContent).not.toContain('Message Room');
    expect(screen.getByRole('heading', { level: 2, name: /You found a secret piece!/ })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: /^Prize/ })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: /Words you practised/ })).toBeTruthy();
    expect(screen.getByText('Help from Pip: 0')).toBeTruthy();
    expect(container.querySelector('.summary-score-label').textContent).toBe('Score:');
    expect(container.querySelector('.summary-score-num').textContent).toBe('0');
    expect(container.querySelector('.summary-words ul').tagName).toBe('UL');
  });

  it('uses the same secret-piece card for every piece type', () => {
    for (const room of ROOMS) {
      const { container, unmount } = renderSummary(room);
      const box = container.querySelector('.summary-piece .summary-piece-box .piece-card');
      expect(box, room.clue.type).toBeTruthy();
      expect(box.textContent).toContain(room.clue.label);
      unmount();
    }
  });

  it('does not add the entrance class when motion is reduced', () => {
    window.matchMedia = (query) => ({
      matches: String(query).includes('prefers-reduced-motion'),
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    });
    const { container } = renderSummary(ROOMS[0]);
    expect(container.querySelector('.summary-rise')).toBeNull();
  });
});

describe('summary layout regressions', () => {
  it('opens the end screen on the celebration, not the results hero', () => {
    const state = initialState();
    state.screen = 'end';
    const { container } = render(
      <GameProvider initial={state}>
        <EndScreen />
      </GameProvider>
    );
    expect(screen.getByRole('heading', { level: 1, name: /You repaired the radio!/ })).toBeTruthy();
    expect(container.querySelector('.end-celebrate')).toBeTruthy();
    expect(container.querySelector('.summary-hero')).toBeNull();
    expect(screen.queryByRole('button', { name: /Play again/ })).toBeNull();
  });

  it('leaves a room intro on the room screen', () => {
    const state = initialState();
    state.screen = 'room';
    state.currentRoom = 'room1';
    state.rooms.room1 = {
      phase: 'intro',
      itemIndex: 0,
      results: {},
      variants: {},
      path: null,
      mode: null,
      startedAt: 1,
      finishedAt: null,
      done: false,
    };
    const { container } = render(
      <GameProvider initial={state}>
        <RoomScreen />
      </GameProvider>
    );
    expect(screen.getByRole('button', { name: /^Start/ })).toBeTruthy();
    expect(container.querySelector('.summary-hero')).toBeNull();
  });
});
