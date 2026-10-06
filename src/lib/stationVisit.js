// Which finished rooms have already been shown lighting up on the map.
// Survives re-renders. Cleared when a new game starts.
const shown = new Set();
let seeded = false;

export function resetStationVisit() {
  shown.clear();
  seeded = false;
}

// First call in a game records rooms that were already done (a resumed game)
// and returns nothing, so the map does not replay old lights. Later calls
// return the newest room that just became done.
export function claimCelebration(doneIds) {
  if (!seeded) {
    for (const id of doneIds) shown.add(id);
    seeded = true;
    return null;
  }
  let fresh = null;
  for (const id of doneIds) {
    if (!shown.has(id)) {
      shown.add(id);
      fresh = id;
    }
  }
  return fresh;
}

export function releaseClaim(id) {
  if (id) shown.delete(id);
}
