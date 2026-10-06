import { ROOMS, ROOM_BY_ID } from '../content/index.js';
import { resetStationVisit } from '../lib/stationVisit.js';

export const DEFAULT_SETTINGS = {
  size: 0, // 0 big, 1 bigger, 2 very big
  spacing: 0, // 0 normal, 1 wide
  font: 'lexend', // lexend | atkinson | system
  contrast: false,
  sounds: false,
  calm: false,
  spanish: false,
};

export function initialState(settings = DEFAULT_SETTINGS) {
  return {
    version: 1,
    screen: 'welcome', // welcome | map | room | summary | final | end
    currentRoom: null,
    startedAt: null,
    endedAt: null,
    timeUp: false,
    practice: false,
    showTimeUp: false,
    rooms: {},
    pieces: {}, // roomId -> true when found
    placed: {}, // slot roomId -> piece roomId
    plays: {}, // clipId -> plays used
    streak: 0,
    bestStreak: 0,
    settings: { ...DEFAULT_SETTINGS, ...settings },
  };
}

function newRoomState(variants = {}, now = Date.now()) {
  return { phase: 'intro', itemIndex: 0, results: {}, variants, path: null, mode: null, startedAt: now, finishedAt: null, done: false };
}

function updateRoom(state, roomId, patch) {
  return { ...state, rooms: { ...state.rooms, [roomId]: { ...state.rooms[roomId], ...patch } } };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'START':
      resetStationVisit();
      return { ...initialState(state.settings), screen: 'map', startedAt: action.now ?? Date.now() };
    case 'RESUME':
      return { ...action.saved, settings: { ...DEFAULT_SETTINGS, ...action.saved.settings } };
    case 'NEW_GAME':
      resetStationVisit();
      return initialState(state.settings);
    case 'GO_MAP':
      return { ...state, screen: 'map', currentRoom: null };
    case 'ENTER_ROOM': {
      const { roomId } = action;
      const existing = state.rooms[roomId];
      const rooms = existing ? state.rooms : { ...state.rooms, [roomId]: newRoomState(action.variants, action.now) };
      const screen = roomId === 'final' ? 'final' : 'room';
      if (existing?.done && roomId !== 'final') {
        return { ...state, rooms, screen: 'summary', currentRoom: roomId };
      }
      return { ...state, rooms, screen, currentRoom: roomId };
    }
    case 'SET_PHASE':
      return updateRoom(state, action.roomId, { phase: action.phase });
    case 'SET_PATH':
      return updateRoom(state, action.roomId, { path: action.path, phase: 'item' });
    case 'SET_MODE':
      return updateRoom(state, action.roomId, { mode: action.mode, phase: action.keepPhase ? state.rooms[action.roomId].phase : 'item' });
    case 'ANSWER': {
      const streak = action.correct ? state.streak + 1 : 0;
      return { ...state, streak, bestStreak: Math.max(state.bestStreak, streak) };
    }
    case 'AUDIO_PLAYED':
      return { ...state, plays: { ...state.plays, [action.clipId]: (state.plays[action.clipId] || 0) + 1 } };
    case 'ITEM_DONE': {
      const { roomId, itemId, result } = action;
      const room = ROOM_BY_ID[roomId];
      const rs = state.rooms[roomId];
      const results = { ...rs.results, [itemId]: result };
      const itemIndex = rs.itemIndex + 1;
      if (roomId !== 'final' && itemIndex >= room.items.length) {
        const next = updateRoom(state, roomId, { results, itemIndex, done: true, finishedAt: action.now ?? Date.now() });
        return { ...next, pieces: { ...state.pieces, [roomId]: true }, screen: 'summary' };
      }
      return updateRoom(state, roomId, { results, itemIndex });
    }
    case 'PLACE':
      return { ...state, placed: { ...state.placed, [action.slot]: action.piece } };
    case 'FINISH': {
      const next = updateRoom(state, 'final', { done: true, finishedAt: action.now ?? Date.now() });
      return { ...next, screen: 'end', endedAt: action.now ?? Date.now() };
    }
    case 'TIME_UP':
      return state.timeUp ? state : { ...state, timeUp: true, practice: true, showTimeUp: true };
    case 'ACK_TIME_UP':
      return { ...state, showTimeUp: false };
    case 'SETTING':
      return { ...state, settings: { ...state.settings, [action.key]: action.value } };
    default:
      return state;
  }
}

export function allPiecesFound(state) {
  return ROOMS.every((r) => state.pieces[r.id]);
}

export function nextRoomId(state) {
  const r = ROOMS.find((room) => !state.rooms[room.id]?.done);
  return r ? r.id : 'final';
}
