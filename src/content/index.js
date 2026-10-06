import room1 from './room1.js';
import room2 from './room2.js';
import room3 from './room3.js';
import room4 from './room4.js';
import room5 from './room5.js';
import final from './final.js';
import audio, { audioById } from './audioManifest.js';
import images, { imageById } from './imageManifest.js';
import uiEn from './ui.en.js';
import uiEs from './ui.es.js';

export const ROOMS = [room1, room2, room3, room4, room5];
export const ROOM_BY_ID = Object.fromEntries([...ROOMS, final].map((r) => [r.id, r]));
export const GAME_MINUTES = 30;

export { final as FINAL, audio as AUDIO, audioById, images as IMAGES, imageById, uiEn, uiEs };
