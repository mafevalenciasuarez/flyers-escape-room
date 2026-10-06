// Shared by the app (src/lib/pipSvg.js) and scripts/check-svg-ids.mjs, so both
// accept the same Illustrator id variants. No browser or Vite APIs here.

// Illustrator layer name -> data-pip value the CSS targets.
export const PIP_PARTS = {
  'eyes-mouth': 'eyes-mouth',
  ring: 'ring',
  'antenna-light': 'antenna-light',
  bulb: 'bulb',
  'thinking-dot1': 'dot1',
  'thinking-dot2': 'dot2',
  'thinking-dot3': 'dot3',
};

export const REQUIRED_PARTS = ['eyes-mouth', 'ring', 'antenna-light'];

// Mood -> file name (without .svg) and the moods to try when that file is missing.
export const PIP_MOODS = {
  neutral: { file: 'pip-neutral', fallback: ['happy'] },
  happy: { file: 'pip-happy', fallback: ['neutral'] },
  thinking: { file: 'pip-thinking', fallback: ['neutral'], parts: ['thinking-dot1', 'thinking-dot2', 'thinking-dot3'] },
  hint: { file: 'pip-hint', fallback: ['thinking', 'neutral'], parts: ['bulb'] },
  sideways: { file: 'pip-three-quarter', fallback: ['side', 'neutral'] },
  side: { file: 'pip-side', fallback: ['sideways', 'neutral'] },
};

// Names the game used before the new art. "think" was shown after wrong answers.
export const MOOD_ALIASES = { think: 'hint' };

// "antenna_x2D_light_1_" -> "antenna-light"; "eyes-mouth_1_" -> "eyes-mouth".
export function normalizeId(id) {
  return String(id)
    .replace(/_x([0-9a-f]{2})_/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/(?:_\d+_?|-\d+)$/, '')
    .toLowerCase();
}

// "pip-neutral_1.svg" and "pip-neutral.svg" both belong to "pip-neutral".
export function fileMatches(baseName, file) {
  const name = baseName.replace(/\.svg$/i, '').toLowerCase();
  return name === file || name.startsWith(`${file}_`);
}
