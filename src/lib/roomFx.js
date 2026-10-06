// Visual-only pulse for the Science Room glass. Items call this when a
// right-or-wrong answer is first marked correct. It never changes scoring.
const listeners = new Set();

export const REWARD_MS = 1400;

export function pulseReward() {
  for (const fn of listeners) fn();
}

export function subscribeReward(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
