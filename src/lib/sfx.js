import { sfxManifest } from '../content/sfxManifest.js';

export const SFX_DEFAULT_ON = true;
export const SFX_MASTER = 0.35;
export const SFX_CLICK_GAP_MS = 120;
export const SFX_BASE = Object.fromEntries(sfxManifest.map((row) => [row.id, row.volume]));

const byId = Object.fromEntries(sfxManifest.map((row) => [row.id, row]));
const pools = new Map();
const cursor = new Map();
const playedEnds = new Set();
let enabled = SFX_DEFAULT_ON;
let calm = false;
let spoken = 0;
let current = null;
let lastClick = 0;
let armed = false;

export function configureSfx({ sounds, calm: isCalm }) {
  enabled = Boolean(sounds);
  calm = Boolean(isCalm);
}

export function setSpokenPlaying(on) {
  spoken += on ? 1 : -1;
  if (spoken < 0) spoken = 0;
}

export function spokenBusy() {
  return spoken > 0;
}

export function resetSfxSession() {
  playedEnds.clear();
}

function fileUrl(file) {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}audio/sfx/${file}`;
}

function poolFor(id) {
  if (!pools.has(id)) {
    const row = byId[id];
    const made = [0, 1].map(() => {
      const audio = new Audio();
      audio.preload = 'auto';
      if (row) audio.src = fileUrl(row.file);
      return audio;
    });
    pools.set(id, made);
    cursor.set(id, 0);
  }
  return pools.get(id);
}

export function preloadSfx() {
  if (armed) return;
  armed = true;
  try {
    for (const row of sfxManifest) poolFor(row.id);
  } catch {
    /* a blocked file must not break the game */
  }
}

function stop(audio) {
  try {
    audio.pause();
    audio.currentTime = 0;
  } catch {
    /* ignore */
  }
}

export function playSfx(id) {
  try {
    if (!enabled || !byId[id]) return;
    if (spokenBusy()) return;
    if (id === 'error' && calm) return;
    if (id === 'click') {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (now - lastClick < SFX_CLICK_GAP_MS) return;
      lastClick = now;
    }
    const gain = SFX_MASTER * SFX_BASE[id] * (calm ? 0.5 : 1);
    const list = poolFor(id);
    const index = cursor.get(id) % 2;
    cursor.set(id, index + 1);
    const audio = list[index];
    if (current && current !== audio) stop(current);
    audio.volume = Math.min(1, Math.max(0, gain));
    try {
      audio.currentTime = 0;
    } catch {
      /* not seekable yet */
    }
    current = audio;
    const pending = audio.play();
    if (pending && typeof pending.catch === 'function') pending.catch(() => {});
  } catch {
    /* sound is optional */
  }
}

export function playRoomEnd(key) {
  if (!key || playedEnds.has(key)) return;
  playedEnds.add(key);
  playSfx('room-end');
}
