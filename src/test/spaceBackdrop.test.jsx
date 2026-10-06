import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { GameProvider } from '../state/GameContext.jsx';
import { initialState } from '../state/gameReducer.js';
import SpaceBackdrop from '../components/SpaceBackdrop.jsx';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  cleanup();
});

describe('SpaceBackdrop', () => {
  it('is hidden from assistive tech and static when reduced motion is requested', () => {
    window.matchMedia = (query) => ({
      matches: String(query).includes('prefers-reduced-motion'),
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    });

    const { container } = render(
      <GameProvider initial={initialState()}>
        <SpaceBackdrop />
      </GameProvider>
    );

    const scene = container.querySelector('.space-scene');
    expect(scene).toBeTruthy();
    expect(scene.getAttribute('aria-hidden')).toBe('true');
    expect(scene.classList.contains('is-static')).toBe(true);
  });
});
