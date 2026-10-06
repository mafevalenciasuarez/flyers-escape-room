// Checks every English string the child can see or hear against the official
// Cambridge Starters/Movers/Flyers list. Exits with code 1 if any word is not covered.
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { root, unknownWords } from './lib/vocab.mjs';

// Story names that are not on the list. They are never tested.
const STORY_NAMES = new Set(['pip', "pip's", 'alpha', 'cadet', 'silence', 'configuration']);

// Keys that are not shown to the child in English (or are not English).
const SKIP_KEYS = new Set(['id', 'file', 'image', 'audio', 'icon', 'medal', 'type', 'layout', 'mode', 'room', 'speaker',
  'brief', 'specName', 'dimension', 'skill', 'introAudio', 'endAudio', 'sourceItem', 'gap', 'value', 'slots', 'answer', 'highlightStepOnHint', 'spanish']);

const files = ['room1', 'room2', 'room3', 'room4', 'room5', 'final', 'audioManifest', 'imageManifest', 'ui.en'];

function walk(node, where, out) {
  if (typeof node === 'string') {
    out.push({ where, text: node });
  } else if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, `${where}[${i}]`, out));
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (SKIP_KEYS.has(k) || k.endsWith('Es') || typeof v === 'function') continue;
      walk(v, where ? `${where}.${k}` : k, out);
    }
  }
}

let problems = 0;
const unique = new Map();
for (const f of files) {
  const mod = await import(pathToFileURL(path.join(root, 'src', 'content', `${f}.js`)).href);
  const strings = [];
  walk(mod.default, '', strings);
  for (const { where, text } of strings) {
    const bad = unknownWords(text, STORY_NAMES);
    if (bad.length) {
      problems += bad.length;
      console.log(`${f}.js  ${where}:  ${[...new Set(bad)].join(', ')}`);
      for (const b of bad) unique.set(b.toLowerCase(), (unique.get(b.toLowerCase()) || 0) + 1);
    }
  }
}

if (problems) {
  console.log(`\n${unique.size} word(s) not in the Cambridge list: ${[...unique.keys()].join(', ')}`);
  console.log('Change the text, or (for story names only) add the word to STORY_NAMES in scripts/check-vocab.mjs.');
  process.exit(1);
}
console.log('check-vocab: every English word is in the Starters/Movers/Flyers list (plus story names: Pip, Alpha, Cadet).');
