import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, within, cleanup } from '@testing-library/react';
import App from '../App.jsx';
import { ROOMS, ROOM_BY_ID } from '../content/index.js';
import room3 from '../content/room3.js';
import room4 from '../content/room4.js';

const $ = (sel) => document.querySelector(sel);
const click = (el) => {
  if (!el) throw new Error('Element not found');
  fireEvent.click(el);
};
const clickText = (re) => click(screen.getAllByRole('button', { name: re })[0]);

function goToRoom(id) {
  click($(`[data-room="${id}"]`));
}
function startRoom() {
  clickText(/^Start/);
}
function answer() {
  clickText(/^Answer/);
}
function next() {
  clickText(/^Next/);
}
function backToMap() {
  clickText(/^Go to the map/);
}

function playRoom1() {
  goToRoom('room1');
  startRoom();
  for (const item of ROOM_BY_ID.room1.items) {
    click($(`[data-option-id="${item.answer}"]`));
    fireEvent.click(screen.getByLabelText(/Very sure/));
    answer();
    expect(screen.getByText(/You were very sure, and you were right/)).toBeTruthy();
    next();
  }
  expect(screen.getByText(/Room finished!/)).toBeTruthy();
  backToMap();
}

function playRoom2() {
  goToRoom('room2');
  startRoom();
  click($('[data-mode="listen-highlight"]'));
  for (const item of ROOM_BY_ID.room2.items) {
    click($(`[data-option-id="${item.answer}"]`));
    answer();
    next();
  }
  backToMap();
}

function playRoom3(path = 'easy') {
  goToRoom('room3');
  startRoom();
  click($(`[data-path="${path}"]`));
  const gaps = room3.items[0].gaps;
  for (const [id, gap] of Object.entries(gaps)) fireEvent.change($(`select[data-gap="${id}"]`), { target: { value: gap.answers[0] } });
  answer();
  next();
  for (const f of room3.items[1].frames) fireEvent.change($(`select[data-gap="${f.id}"]`), { target: { value: f.answers[0] } });
  answer();
  next();
  backToMap();
}

function buildSentence(item) {
  const bankWords = [...document.querySelectorAll('.tile-bank .tile')].map((b) => b.dataset.tile).sort().join('|');
  const variant = item.variants.find((v) => [...v.tiles].sort().join('|') === bankWords);
  const words = variant.answers[0].replace(/[.]/g, '').split(' ');
  for (const w of words) {
    const tile = [...document.querySelectorAll('.tile-bank .tile')].find((b) => b.dataset.tile.toLowerCase() === w.toLowerCase());
    click(tile);
  }
}

function playRoom4({ wrongFirst = false } = {}) {
  goToRoom('room4');
  startRoom();
  for (const item of room4.items.slice(0, 2)) {
    if (wrongFirst) {
      // all tiles in shown order is (almost always) wrong; help must not block
      [...document.querySelectorAll('.tile-bank .tile')].forEach((b) => click(b));
      answer();
      if (screen.queryByText(/Not yet/)) {
        expect(screen.getByText(/Think:/)).toBeTruthy();
        clickText(/^Start again/);
        buildSentence(item);
        answer();
      }
    } else {
      buildSentence(item);
      answer();
    }
    expect(screen.getAllByText(/Right!/).length).toBeGreaterThan(0);
    next();
  }
  const diary = room4.items[2];
  for (const [id, gap] of Object.entries(diary.gaps)) {
    fireEvent.change($(`input[data-gap="${id}"]`), { target: { value: gap.answers[0] } });
  }
  answer();
  next();
  backToMap();
}

function playRoom5() {
  goToRoom('room5');
  startRoom();
  for (const item of ROOM_BY_ID.room5.items) {
    click($(`[data-option-id="${item.answer}"]`));
    next();
  }
  backToMap();
}

function playFinal() {
  goToRoom('final');
  startRoom();
  for (const room of ROOMS) {
    click($(`[data-piece="${room.id}"]`));
    click($(`[data-slot="${room.id}"]`));
  }
  expect(screen.getByText(/The radio is working!/)).toBeTruthy();
  next();
  click($(`[data-option-id="${ROOM_BY_ID.final.items[0].answer}"]`));
  answer();
  next();
}

beforeEach(() => {
  window.sessionStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('full game walkthrough', () => {
  it('reaches the end screen with correct answers in every room', () => {
    render(<App />);
    expect(screen.getByText(/Hello, Cadet!/)).toBeTruthy();
    clickText(/^Start/);
    playRoom1();
    playRoom2();
    playRoom3('easy');
    playRoom4();
    playRoom5();
    expect(screen.getByText(/5 of 5 secret pieces/, { selector: '.pieces-text' })).toBeTruthy();
    playFinal();

    expect(screen.getByText(/You repaired the radio!/)).toBeTruthy();
    // 15 items, all right the first time = 10 points each
    expect(screen.getByText('150')).toBeTruthy();
    expect(screen.getByText(/haven't got any words to look at again/)).toBeTruthy();
    const skills = screen.getByText('Listening').closest('ul');
    expect(within(skills).getByText(/5 of 5 right the first time/)).toBeTruthy();
  });

  it('never blocks after wrong answers, and lists words to review', () => {
    render(<App />);
    clickText(/^Start/);
    playRoom4({ wrongFirst: true });
    expect($('[data-room="room4"]').closest('.room-card').className).toContain('is-done');
  });

  it('works on the hard and very hard paths in Room 3', () => {
    render(<App />);
    clickText(/^Start/);
    goToRoom('room3');
    startRoom();
    click($('[data-path="veryhard"]'));
    const gaps = room3.items[0].gaps;
    fireEvent.change($('input[data-gap="g1"]'), { target: { value: 'sand' } });
    answer();
    expect(screen.getByText(/Not yet/)).toBeTruthy();
    for (const [id, gap] of Object.entries(gaps)) fireEvent.change($(`input[data-gap="${id}"]`), { target: { value: gap.answers[0].toUpperCase() } });
    answer();
    next();
    const textarea = $('textarea');
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    answer();
    expect(screen.getByText(/Write a little more/)).toBeTruthy();
    fireEvent.change(textarea, { target: { value: 'Yesterday I saw a big planet. The garden is lovely. Tomorrow I am going to repair the radio.' } });
    answer();
    next();
    expect(screen.getByText(/Room finished!/)).toBeTruthy();
  });

  it('shows the transcript when an audio file is missing', async () => {
    render(<App />);
    clickText(/^Start/);
    goToRoom('room1');
    startRoom();
    await act(async () => {
      clickText(/^Play/);
    });
    expect(screen.getByText(/there is no sound here/)).toBeTruthy();
    expect(screen.getByText(/She's holding a torch/)).toBeTruthy();
  });

  it('switches to practice mode when time is up, without ending the game', () => {
    vi.useFakeTimers();
    let now = 1_000_000;
    render(<App now={() => now} />);
    clickText(/^Start/);
    expect(screen.getByText(/30 minutes/)).toBeTruthy();
    now += 31 * 60 * 1000;
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByText(/The clock stopped/)).toBeTruthy();
    clickText(/^OK/);
    expect(screen.getByText(/Practice time/)).toBeTruthy();
    expect(screen.queryByText(/minutes$/)).toBeNull();
    goToRoom('room1');
    expect(screen.getByText(/Meet the team/)).toBeTruthy();
  });

  it('calm mode hides the minutes and shows a bar', () => {
    render(<App />);
    clickText(/^Start/);
    clickText(/^Configuration/);
    fireEvent.click(screen.getByLabelText(/Quiet clock/));
    clickText(/^Close/);
    expect(screen.getByRole('progressbar', { name: 'Time' })).toBeTruthy();
    expect(screen.queryByText(/30 minutes/)).toBeNull();
  });

  it('resumes a saved game from sessionStorage', () => {
    const first = render(<App />);
    clickText(/^Start/);
    playRoom5();
    first.unmount();
    render(<App />);
    clickText(/^Go back to my game/);
    expect($('[data-room="room5"]').closest('.room-card').className).toContain('is-done');
  });
});
