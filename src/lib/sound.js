// Spoken clips stay in AudioPlayer. These files are the clicks and stings.
export {
  SFX_DEFAULT_ON,
  configureSfx,
  playSfx,
  playRoomEnd,
  preloadSfx,
  resetSfxSession,
  setSpokenPlaying,
} from './sfx.js';

import { playSfx } from './sfx.js';

export function playTone(kind) {
  if (kind === 'right') playSfx('correct');
  else if (kind === 'wrong') playSfx('error');
}
