import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { GameProvider } from '../state/GameContext.jsx';
import { initialState } from '../state/gameReducer.js';
import Pip from '../components/Pip.jsx';
import { getPipSvg, resolveMood } from '../lib/pipSvg.js';
import { PIP_MOODS } from '../lib/pipIds.js';

const originalMatchMedia = window.matchMedia;

function mockReducedMotion(on) {
  window.matchMedia = (query) => ({
    matches: on && String(query).includes('prefers-reduced-motion'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  });
}

function renderPips(ui) {
  return render(<GameProvider initial={initialState()}>{ui}</GameProvider>);
}

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  cleanup();
});

describe('Pip', () => {
  it('renders every mood, including the old "think" name, without throwing', () => {
    for (const mood of [...Object.keys(PIP_MOODS), 'think']) {
      const { container, unmount } = renderPips(<Pip mood={mood} />);
      expect(container.querySelector('.pip svg')).toBeTruthy();
      unmount();
    }
  });

  it('tags the animated parts with data-pip', () => {
    const neutral = renderPips(<Pip mood="neutral" />);
    for (const part of ['eyes-mouth', 'ring', 'antenna-light']) {
      expect(neutral.container.querySelector(`[data-pip="${part}"]`)).toBeTruthy();
    }
    neutral.unmount();

    const hint = renderPips(<Pip mood="hint" hintLevel={2} />);
    expect(hint.container.querySelector('[data-pip="bulb"]')).toBeTruthy();
    expect(hint.container.querySelector('.pip').style.getPropertyValue('--bulb-glow')).toBe('0.8');
    hint.unmount();

    const thinking = renderPips(<Pip mood="thinking" />);
    for (const dot of ['dot1', 'dot2', 'dot3']) {
      expect(thinking.container.querySelector(`[data-pip="${dot}"]`)).toBeTruthy();
    }
  });

  it('never repeats an id when two Pips share the page', () => {
    const { container } = renderPips(
      <>
        <Pip mood="happy" />
        <Pip mood="happy" />
        <Pip mood="hint">Help</Pip>
      </>
    );
    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    for (const el of container.querySelectorAll('[clip-path]')) {
      const ref = el.getAttribute('clip-path').match(/#([^)'"]+)/)[1];
      expect(container.querySelector(`[id="${ref}"]`)).toBeTruthy();
    }
  });

  it('falls back safely when a mood file is missing', () => {
    const { container } = renderPips(<Pip mood="side" />);
    expect(container.querySelector('.pip').dataset.pipFile).toMatch(/^pip-(three-quarter|neutral)/);
    expect(resolveMood('side', { 'pip-happy.svg': '<svg/>' })).toEqual({ mood: 'happy', name: 'pip-happy.svg' });
    expect(resolveMood('hint', {})).toBeNull();
    expect(getPipSvg('neutral', {})).toBeNull();
  });

  it('only animates one Pip at a time, and never the small one', () => {
    const { container } = renderPips(
      <>
        <Pip mood="neutral" />
        <Pip mood="happy" />
        <Pip mood="hint" size="sm" />
      </>
    );
    const pips = [...container.querySelectorAll('.pip')];
    const moving = pips.filter((p) => !p.classList.contains('is-still') && !p.classList.contains('is-static'));
    expect(moving).toHaveLength(1);
    expect(pips[2].classList.contains('is-still')).toBe(true);
  });

  it('is static and hidden from screen readers under reduced motion', () => {
    mockReducedMotion(true);
    const { container } = renderPips(<Pip mood="happy">Well done</Pip>);
    const pip = container.querySelector('.pip');
    expect(pip.classList.contains('is-static')).toBe(true);
    expect(container.querySelector('.pip-avatar').getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.pip-bubble').getAttribute('role')).toBe('status');
  });
});
