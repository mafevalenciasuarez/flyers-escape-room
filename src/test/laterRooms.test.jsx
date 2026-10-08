import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { GameProvider } from '../state/GameContext.jsx';
import { initialState } from '../state/gameReducer.js';
import RoomBackdrop from '../components/RoomBackdrop.jsx';
import SpaceBackdrop from '../components/SpaceBackdrop.jsx';
import RadioRoomScreen from '../screens/RadioRoomScreen.jsx';
import RoomScreen from '../screens/RoomScreen.jsx';
import PrizeGlyph from '../components/PrizeGlyph.jsx';
import OrderItem from '../components/items/OrderItem.jsx';
import DilemmaItem from '../components/items/DilemmaItem.jsx';
import PostcardItem from '../components/items/PostcardItem.jsx';
import { STAR_COUNT } from '../components/Starfield.jsx';
import room4 from '../content/room4.js';
import room5 from '../content/room5.js';
import room3 from '../content/room3.js';
import { FINAL } from '../content/index.js';
import App from '../App.jsx';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.history.replaceState(null, '', '/');
  window.sessionStorage.clear();
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

function withRoom(roomId, patch = {}) {
  const state = initialState();
  state.screen = roomId === 'final' ? 'final' : 'room';
  state.currentRoom = roomId;
  state.rooms[roomId] = {
    phase: 'item',
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

function placeWords(words) {
  for (const word of words) {
    const tile = [...document.querySelectorAll('.tile-bank .tile')].find((el) => el.dataset.tile === word);
    fireEvent.click(tile);
  }
}

describe('Science, Robot and Radio backdrops', () => {
  it('renders each room hidden, tagged, with stars behind the drawing', () => {
    const { container } = render(
      <GameProvider initial={initialState()}>
        <RoomBackdrop roomId="room4" />
        <RoomBackdrop roomId="room5" />
        <RoomBackdrop roomId="final" />
        <RoomBackdrop roomId="room1" />
        <RoomBackdrop roomId="room2" />
        <RoomBackdrop roomId="room3" />
        <SpaceBackdrop />
      </GameProvider>
    );
    const scene = (id) => container.querySelector(`.room-backdrop[data-room="${id}"]`);
    for (const [id, names] of [
      ['room4', ['ceiling-lamp-glow', 'radio-screen', 'chemistry-glass']],
      ['room5', ['ceiling-lamp-glow', 'console-screen']],
      ['final', ['radio-screen']],
    ]) {
      const node = scene(id);
      expect(node.getAttribute('aria-hidden')).toBe('true');
      expect(node.getAttribute('data-audio')).toBe('idle');
      const stars = node.querySelector('.starfield');
      const art = node.querySelector('svg');
      expect(stars.querySelectorAll('.star')).toHaveLength(STAR_COUNT);
      expect(stars.querySelector('.star.is-calm')).toBeNull();
      expect(stars.compareDocumentPosition(art) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      for (const name of names) expect(node.querySelector(`[data-st="${name}"]`)).toBeTruthy();
    }
    expect(scene('room1').querySelector('.starfield')).toBeNull();
    expect(scene('room1').querySelector('[data-st="screen-glow"]')).toBeTruthy();
    expect(scene('room2').querySelector('[data-st="engine-core-glow"]')).toBeTruthy();
    expect(scene('room2').querySelector('.starfield')).toBeNull();
    expect(scene('room3').querySelector('[data-st="light-beam"]')).toBeTruthy();
    const intro = container.querySelector('.space-scene');
    expect(intro.querySelectorAll('.star.is-calm').length).toBeGreaterThan(0);
    expect(intro.querySelector('.planet')).toBeTruthy();
  });

  it('follows spoken audio and skips the reward pulse when the answer is wrong', () => {
    const { container } = render(
      <GameProvider initial={withRoom('room4')}>
        <RoomBackdrop roomId="room4" audioPlaying={false} />
        <OrderItem item={room4.items[0]} variantId="A" onDone={vi.fn()} />
      </GameProvider>
    );
    const scene = () => container.querySelector('.room-backdrop');
    placeWords(['message', 'a', 'sent', 'astronaut', 'the', 'yesterday']);
    fireEvent.click(screen.getByRole('button', { name: /Answer/i }));
    expect(scene().getAttribute('data-state')).toBe('idle');
    cleanup();

    const playing = render(
      <GameProvider initial={withRoom('room4')}>
        <RoomBackdrop roomId="room4" audioPlaying />
        <OrderItem item={room4.items[0]} variantId="A" onDone={vi.fn()} />
      </GameProvider>
    );
    const playingScene = () => playing.container.querySelector('.room-backdrop');
    expect(playingScene().getAttribute('data-audio')).toBe('playing');
    placeWords(['yesterday', 'the', 'astronaut', 'sent', 'a', 'message']);
    fireEvent.click(screen.getByRole('button', { name: /Answer/i }));
    expect(playingScene().getAttribute('data-state')).toBe('reward');
    cleanup();

    const idle = render(
      <GameProvider initial={withRoom('room4')}>
        <RoomBackdrop roomId="room4" audioPlaying={false} />
      </GameProvider>
    );
    expect(idle.container.querySelector('.room-backdrop').getAttribute('data-audio')).toBe('idle');
  });

  it('holds the radio screen steady only after every piece is in its slot', () => {
    const placed = Object.fromEntries(FINAL.slots.map((id) => [id, id]));
    const { container } = render(
      <GameProvider initial={{ ...withRoom('final', { phase: 'place' }), placed }}>
        <RadioRoomScreen />
      </GameProvider>
    );
    expect(container.querySelector('.room-backdrop').getAttribute('data-state')).toBe('repaired');
    cleanup();

    const open = render(
      <GameProvider initial={withRoom('final', { phase: 'place' })}>
        <RadioRoomScreen />
      </GameProvider>
    );
    const backdrop = () => open.container.querySelector('.room-backdrop');
    expect(backdrop().getAttribute('data-state')).toBe('idle');
    fireEvent.click(open.container.querySelector('[data-piece="room1"]'));
    fireEvent.click(open.container.querySelector('[data-slot="room2"]'));
    expect(backdrop().getAttribute('data-state')).toBe('idle');
  });

  it('uses the static class under reduced motion', () => {
    reducedMotion();
    const { container } = render(
      <GameProvider initial={initialState()}>
        <RoomBackdrop roomId="room5" audioPlaying />
      </GameProvider>
    );
    const scene = container.querySelector('.room-backdrop');
    expect(scene.classList.contains('is-static')).toBe(true);
    expect(scene.getAttribute('data-audio')).toBe('playing');
  });

  it('does not play an error sting for a dilemma or the free postcard', () => {
    const plays = [];
    HTMLMediaElement.prototype.play = vi.fn(function play() {
      plays.push(this.src);
      return Promise.resolve();
    });
    render(
      <GameProvider initial={withRoom('room5')}>
        <DilemmaItem item={room5.items[0]} onDone={vi.fn()} />
      </GameProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: /Robots are horrible/i }));
    expect(plays.some((src) => src.includes('answer-error'))).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: /I want to write it/i }));
    expect(plays.some((src) => src.includes('answer-correct'))).toBe(true);

    plays.length = 0;
    cleanup();
    render(
      <GameProvider initial={initialState()}>
        <PostcardItem item={room3.items[1]} path="veryhard" onDone={vi.fn()} />
      </GameProvider>
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: /Answer/i }));
    expect(plays.some((src) => src.includes('answer-error'))).toBe(false);
  });

  it('shows Pip beside an intro only when Pip speaks that clip', () => {
    const pipIntro = render(
      <GameProvider initial={withRoom('room3', { phase: 'intro' })}>
        <RoomScreen />
      </GameProvider>
    );
    expect(pipIntro.container.querySelector('.intro-speaker .pip')).toBeTruthy();
    cleanup();

    const science = render(
      <GameProvider initial={withRoom('room4', { phase: 'intro' })}>
        <RoomScreen />
      </GameProvider>
    );
    expect(science.container.querySelector('.intro-speaker .pip')).toBeTruthy();
    cleanup();

    const helen = render(
      <GameProvider initial={withRoom('room1', { phase: 'intro' })}>
        <RoomScreen />
      </GameProvider>
    );
    expect(helen.container.querySelector('.intro-speaker .pip')).toBeNull();
  });

  it('shows a drawn medal for every prize that has a badge file', () => {
    const { container } = render(
      <>
        <PrizeGlyph prize={{ id: 'great-ears', icon: 'ear' }} />
        <PrizeGlyph prize={{ id: 'careful-eyes', icon: 'eye' }} />
        <PrizeGlyph prize={{ id: 'garden-star', icon: 'star' }} />
        <PrizeGlyph prize={{ id: 'kind-and-fair', icon: 'heart' }} />
        <PrizeGlyph prize={{ id: 'radio-engineer', icon: 'radio' }} />
        <PrizeGlyph prize={{ id: 'word-engineer', icon: 'gear' }} />
      </>
    );
    expect(container.querySelectorAll('.prize-badge')).toHaveLength(6);
    expect(container.querySelectorAll('.icon')).toHaveLength(0);
  });

  it('opens the Radio Room from the dev shortcut with every piece ready to place', () => {
    window.history.replaceState(null, '', '/?dev=radio');
    window.sessionStorage.clear();
    render(<App />);
    expect(screen.getByRole('heading', { name: /Radio Room/ })).toBeTruthy();
    expect(screen.getByText(/5 of 5 secret pieces/)).toBeTruthy();
    expect(document.querySelectorAll('[data-piece]')).toHaveLength(5);
    expect(window.sessionStorage.getItem('radio-silence-v1')).toBeNull();
    window.history.replaceState(null, '', '/');
  });
});
