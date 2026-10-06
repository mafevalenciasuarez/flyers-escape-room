import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from '../App.jsx';
import StationSvg from '../components/StationSvg.jsx';
import { stationCleanupNotes } from '../lib/stationSvg.js';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  cleanup();
});

function startGame() {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /^Start/ }));
}

describe('StationSvg', () => {
  it('tags the station parts and keeps zone hit targets', () => {
    const { container } = render(
      <StationSvg mode="map" lightStates={{ room1: 'on', room4: 'on' }} zoneStates={{ room1: 'next', radio: 'locked' }} />
    );
    for (const name of ['station-art', 'map-zones', 'map-focus', 'zone-room1', 'zone-radio', 'focus-room1', 'focus-radio', 'light-room1', 'light-radio']) {
      expect(container.querySelector(`[data-st="${name}"]`), name).toBeTruthy();
    }
    expect(container.querySelector('[data-st="light-room4"]')).toBeNull();
    expect(container.querySelector('[data-st="light-room5"]')).toBeNull();
    expect(container.querySelector('[data-st="zone-room1"]').getAttribute('pointer-events')).toBe('all');
    expect(container.querySelector('[data-st="focus-radio"]').getAttribute('pointer-events')).toBe('none');
    expect(container.querySelector('[data-st="light-room1"]').getAttribute('data-state')).toBe('on');
    expect(container.querySelector('[data-st="zone-radio"]').getAttribute('data-state')).toBe('locked');
    expect(stationCleanupNotes.some((note) => note.includes('map-zones'))).toBe(true);
  });
});

describe('MapScreen', () => {
  it('lists six cards in order, marks the next room, and closes only the Radio Room', () => {
    startGame();
    const cards = [...document.querySelectorAll('[data-room]')];
    expect(cards.map((card) => card.getAttribute('data-room'))).toEqual(['room1', 'room2', 'room3', 'room4', 'room5', 'final']);
    expect(cards[0].getAttribute('aria-current')).toBe('step');
    expect(cards[0].textContent).toContain('Next');
    expect(cards[0].querySelector('[data-icon="arrow"]')).toBeTruthy();
    expect(cards[1].getAttribute('aria-disabled')).not.toBe('true');
    expect(cards[1].textContent).not.toContain('Closed');
    const radio = cards[5];
    expect(radio.getAttribute('aria-disabled')).toBe('true');
    expect(radio.textContent).toContain('Closed');
    expect(radio.textContent).toContain('Find all 5 secret pieces first.');
    expect(radio.querySelector('[data-icon="lock"]')).toBeTruthy();
    fireEvent.click(radio);
    expect(screen.getByRole('heading', { name: /Station map/ })).toBeTruthy();
  });

  it('opens a room from its zone the same way the card does', () => {
    startGame();
    fireEvent.click(document.querySelector('[data-st="zone-room3"]'));
    expect(screen.getByText(/Choose your path/)).toBeTruthy();
  });

  it('focuses the Radio Room card when its closed zone is clicked', () => {
    startGame();
    fireEvent.click(document.querySelector('[data-st="zone-radio"]'));
    expect(document.activeElement?.getAttribute('data-room')).toBe('final');
    expect(screen.getByRole('heading', { name: /Station map/ })).toBeTruthy();
  });

  it('adds the static class when reduced motion is on', () => {
    window.matchMedia = (query) => ({
      matches: String(query).includes('prefers-reduced-motion'),
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    });
    startGame();
    expect(document.querySelector('.screen-map').classList.contains('is-static')).toBe(true);
  });
});
