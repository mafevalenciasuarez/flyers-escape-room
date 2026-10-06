// Shared word-checking logic: decides whether a token is covered by the official
// Starters/Movers/Flyers list (docs/reference/wordlist.json) including inflections.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const root = path.resolve(here, '..', '..');

const raw = JSON.parse(fs.readFileSync(path.join(root, 'docs', 'reference', 'wordlist.json'), 'utf8')).words;

export const LIST = new Map();
for (const [key, level] of Object.entries(raw)) {
  const clean = key.replace(/[’]/g, "'").replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
  for (const w of clean.split(' ')) if (w && !LIST.has(w)) LIST.set(w, level);
  LIST.set(clean, level);
}
// Bracketed forms printed in the PDF, e.g. "sweet(s)", "stair(s)", "blond(e)".
for (const [w, l] of [['sweets', 'S'], ['stairs', 'M'], ['blonde', 'M'], ['candy', 'S'], ['chemist', 'F'], ["chemist's", 'F']]) LIST.set(w, l);

// Irregular forms of verbs/nouns/adjectives that are on the list.
const IRREGULAR = {
  am: 'be', is: 'be', are: 'be', was: 'be', were: 'be', been: 'be', being: 'be',
  began: 'begin', begun: 'begin', broke: 'break', brought: 'bring', built: 'build', bought: 'buy',
  caught: 'catch', chose: 'choose', chosen: 'choose', came: 'come', did: 'do', done: 'do', does: 'do',
  drew: 'draw', drawn: 'draw', drank: 'drink', drunk: 'drink', drove: 'drive', driven: 'drive',
  ate: 'eat', eaten: 'eat', fell: 'fall', fallen: 'fall', fed: 'feed', felt: 'feel', found: 'find',
  flew: 'fly', flown: 'fly', forgot: 'forget', forgotten: 'forget', got: 'get', gotten: 'get',
  gave: 'give', given: 'give', went: 'go', gone: 'go', grew: 'grow', grown: 'grow', had: 'have', has: 'have',
  heard: 'hear', hid: 'hide', hidden: 'hide', held: 'hold', kept: 'keep', knew: 'know', known: 'know',
  learnt: 'learn', left: 'leave', lay: 'lie', lost: 'lose', made: 'make', meant: 'mean', met: 'meet',
  rode: 'ride', ran: 'run', said: 'say', saw: 'see', seen: 'see', sold: 'sell', sent: 'send',
  sang: 'sing', sung: 'sing', sat: 'sit', slept: 'sleep', smelt: 'smell', spoke: 'speak', spoken: 'speak',
  spent: 'spend', stood: 'stand', swam: 'swim', swung: 'swing', took: 'take', taken: 'take',
  taught: 'teach', told: 'tell', thought: 'think', threw: 'throw', thrown: 'throw',
  understood: 'understand', woke: 'wake', woken: 'wake', wore: 'wear', worn: 'wear', won: 'win',
  wrote: 'write', written: 'write', could: 'can', might: 'may',
  better: 'good', best: 'good', worse: 'bad', worst: 'bad', further: 'far', farther: 'far',
  children: 'child', men: 'man', women: 'woman', people: 'person', feet: 'foot', teeth: 'tooth',
  mice: 'mouse', leaves: 'leaf', sheep: 'sheep', fish: 'fish',
  myself: 'by myself', yourself: 'by yourself',
};

const CONTRACTIONS = {
  "i'm": ['i', 'be'], "you're": ['you', 'be'], "he's": ['he', 'be'], "she's": ['she', 'be'], "it's": ['it', 'be'],
  "we're": ['we', 'be'], "they're": ['they', 'be'], "that's": ['that', 'be'], "what's": ['what', 'be'],
  "there's": ['there', 'be'], "here's": ['here', 'be'], "where's": ['where', 'be'], "who's": ['who', 'be'],
  "let's": ["let's"], "i'll": ['i', 'will'], "you'll": ['you', 'will'], "we'll": ['we', 'will'], "it'll": ['it', 'will'],
  "i've": ['i', 'have'], "you've": ['you', 'have'], "we've": ['we', 'have'], "i'd": ['i', 'would'],
  "don't": ['do', 'not'], "doesn't": ['do', 'not'], "didn't": ['do', 'not'], "can't": ['can', 'not'],
  "couldn't": ['can', 'not'], "won't": ['will', 'not'], "isn't": ['be', 'not'], "aren't": ['be', 'not'],
  "wasn't": ['be', 'not'], "weren't": ['be', 'not'], "haven't": ['have', 'not'], "hasn't": ['have', 'not'],
  "shouldn't": ['should', 'not'], "mustn't": ['must', 'not'], cannot: ['can', 'not'],
};

const NUMBER_WORDS = new Set(
  ('zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen ' +
    'seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million ' +
    'first second third fourth fifth sixth seventh eighth ninth tenth eleventh twelfth thirteenth fourteenth ' +
    'fifteenth sixteenth seventeenth eighteenth nineteenth twentieth thirtieth').split(' ')
);

function known(w) {
  return LIST.has(w);
}

function candidates(w) {
  const c = [w];
  if (IRREGULAR[w]) c.push(IRREGULAR[w]);
  // plurals / 3rd person
  if (w.endsWith('ies')) c.push(w.slice(0, -3) + 'y');
  if (w.endsWith('es')) c.push(w.slice(0, -2));
  if (w.endsWith('s')) c.push(w.slice(0, -1));
  if (w.endsWith("'s")) c.push(w.slice(0, -2));
  if (w.endsWith("s'")) c.push(w.slice(0, -2));
  // past -ed
  if (w.endsWith('ied')) c.push(w.slice(0, -3) + 'y');
  if (w.endsWith('ed')) {
    c.push(w.slice(0, -2), w.slice(0, -1));
    if (/(.)\1ed$/.test(w)) c.push(w.slice(0, -3));
  }
  // -ing
  if (w.endsWith('ing')) {
    const s = w.slice(0, -3);
    c.push(s, s + 'e');
    if (/(.)\1$/.test(s)) c.push(s.slice(0, -1));
    if (s.endsWith('y')) c.push(s.slice(0, -1) + 'ie');
  }
  // comparatives / superlatives
  for (const suf of ['er', 'est']) {
    if (w.endsWith(suf)) {
      const s = w.slice(0, -suf.length);
      c.push(s, s + 'e');
      if (s.endsWith('i')) c.push(s.slice(0, -1) + 'y');
      if (/(.)\1$/.test(s)) c.push(s.slice(0, -1));
    }
  }
  return c;
}

export function isAllowed(token, extra = new Set()) {
  let w = token.toLowerCase().replace(/[’‘]/g, "'").replace(/^'+|'+$/g, '');
  if (!w) return true;
  if (/^\d[\d,.:]*(st|nd|rd|th|am|pm)?$/.test(w)) return true;
  if (extra.has(w)) return true;
  if (NUMBER_WORDS.has(w)) return true;
  if (CONTRACTIONS[w]) return CONTRACTIONS[w].every((p) => known(p) || NUMBER_WORDS.has(p));
  if (w.includes('-')) {
    if (known(w)) return true;
    return w.split('-').every((p) => isAllowed(p, extra));
  }
  return candidates(w).some(known);
}

export function tokenize(text) {
  return (
    String(text)
      .replace(/\{[^}]*\}/g, ' ') // template slots like {name}
      .replace(/\ba\.m\.|\bp\.m\./gi, ' ')
      .replace(/(^|[\s"(])-(ed|er|est|ing|s)\b/g, ' ') // spelling endings quoted in help text
      .replace(/(^|[\s"(])[A-Za-z](?=[\s".,!?:)]|$)/g, ' ') // single letters ("It starts with w")
      .replace(/_+/g, ' ')
      .match(/[A-Za-z][A-Za-z'’-]*/g) || []
  );
}

export function unknownWords(text, extra = new Set()) {
  return tokenize(text).filter((t) => !isAllowed(t, extra));
}
