import { ROOMS, FINAL } from '../content/index.js';

export const POINTS_FIRST_TRY = 10;
export const POINTS_WITH_HELP = 5;

// Never negative. Help requests are free in rooms with helpCostsPoints: false;
// a wrong try always moves the item from "first try" to "with help".
export function pointsFor({ wrongs, helps }, helpCostsPoints) {
  const clean = wrongs === 0 && (helps === 0 || !helpCostsPoints);
  return clean ? POINTS_FIRST_TRY : POINTS_WITH_HELP;
}

export function roomStars(results) {
  const list = Object.values(results || {});
  if (!list.length) return 1;
  const first = list.filter((r) => r.firstTry).length;
  if (first === list.length) return 3;
  if (first >= list.length / 2) return 2;
  return 1;
}

export function roomHelps(results) {
  return Object.values(results || {}).reduce((s, r) => s + r.helps + r.wrongs, 0);
}

export function roomPoints(results) {
  return Object.values(results || {}).reduce((s, r) => s + r.points, 0);
}

export function totalPoints(state) {
  return [...ROOMS, FINAL].reduce((s, room) => s + roomPoints(state.rooms[room.id]?.results), 0);
}

export function skillSummary(state) {
  const out = { listening: { right: 0, total: 0 }, reading: { right: 0, total: 0 }, writing: { right: 0, total: 0 } };
  for (const room of [...ROOMS, FINAL]) {
    for (const r of Object.values(state.rooms[room.id]?.results || {})) {
      if (!out[r.skill]) continue;
      out[r.skill].total += 1;
      if (r.firstTry) out[r.skill].right += 1;
    }
  }
  return out;
}

export function wordsToReview(state) {
  const words = new Set();
  for (const room of [...ROOMS, FINAL]) {
    for (const r of Object.values(state.rooms[room.id]?.results || {})) {
      if (!r.firstTry) (r.words || []).forEach((w) => words.add(w));
    }
  }
  return [...words];
}

export function wordsPractised(room, roomState) {
  const words = new Set();
  for (const item of room.items) {
    const res = roomState?.results?.[item.id];
    (res?.words || item.words || []).forEach((w) => words.add(w));
  }
  return [...words];
}
