import { ROOM_BY_ID } from '../content/index.js';

// Answered items / total items. A finished room is 1. A room never opened is 0.
// results holds one entry per finished item (the item in progress is not in there yet).
export function roomProgress(state, roomId) {
  const spec = ROOM_BY_ID[roomId];
  const total = spec?.items?.length || 0;
  const room = state.rooms[roomId];
  if (!total) return room?.done ? 1 : 0;
  if (room?.done) return 1;
  const answered = Object.keys(room?.results || {}).length;
  return answered / total;
}
