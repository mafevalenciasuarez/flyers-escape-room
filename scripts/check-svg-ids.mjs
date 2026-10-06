// Fails if the station art is missing an id the map or the intro lights need,
// or if a Pip head is missing a part the CSS animates.
import fs from 'node:fs';
import path from 'node:path';
import { root } from './lib/vocab.mjs';
import { PIP_MOODS, REQUIRED_PARTS, fileMatches, normalizeId } from '../src/lib/pipIds.js';

const problems = [];
const notes = [];

const REQUIRED = [
  'station-art',
  'map-zones',
  'map-focus',
  'light-room1',
  'light-room2',
  'light-room3',
  'light-room4',
  'light-room5',
  'light-radio',
  'zone-room1',
  'zone-room2',
  'zone-room3',
  'zone-room4',
  'zone-room5',
  'zone-radio',
  'focus-room1',
  'focus-room2',
  'focus-room3',
  'focus-room4',
  'focus-room5',
  'focus-radio',
];

const LIGHTS = ['light-room1', 'light-room2', 'light-room3', 'light-room4', 'light-room5', 'light-radio'];
const LAYERS = ['map-zones', 'map-focus'];

function hasName(ids, name) {
  return ids.some((id) => id === name || id.startsWith(`${name}_`) || id.startsWith(`${name}-`));
}

function findId(ids, name) {
  return ids.find((id) => id === name || id.startsWith(`${name}_`) || id.startsWith(`${name}-`));
}

function groupInner(svg, id) {
  const re = new RegExp(`<g\\b[^>]*\\sid="${id}"[^>]*>`);
  const match = re.exec(svg);
  if (!match) return '';
  let i = match.index + match[0].length;
  let depth = 1;
  const start = i;
  while (i < svg.length && depth > 0) {
    const nextOpen = svg.indexOf('<g', i);
    const nextClose = svg.indexOf('</g>', i);
    if (nextClose < 0) break;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      i = nextOpen + 2;
    } else {
      depth -= 1;
      if (depth === 0) return svg.slice(start, nextClose);
      i = nextClose + 4;
    }
  }
  return '';
}

function openTag(svg, id) {
  const at = svg.indexOf(`id="${id}"`);
  if (at < 0) return '';
  const start = svg.lastIndexOf('<', at);
  const end = svg.indexOf('>', at);
  return svg.slice(start, end + 1);
}

function shapeCount(svg, id) {
  const tag = openTag(svg, id);
  const kind = tag.match(/^<([a-zA-Z]+)/)?.[1];
  if (!kind) return 0;
  if (kind !== 'g') return /^(?:path|rect|circle|polygon|ellipse)$/.test(kind) ? 1 : 0;
  const inner = groupInner(svg, id);
  return (inner.match(/<(?:path|rect|circle|polygon|ellipse)\b/g) || []).length;
}

const svgPath = path.join(root, 'src', 'assets', 'svg', 'space-station.svg');
if (!fs.existsSync(svgPath)) problems.push('missing src/assets/svg/space-station.svg');
else {
  const svg = fs.readFileSync(svgPath, 'utf8');
  const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  for (const name of REQUIRED) {
    if (!hasName(ids, name)) problems.push(`space-station.svg has no id "${name}"`);
  }
  for (const name of LIGHTS) {
    const id = findId(ids, name);
    if (id && !shapeCount(svg, id)) problems.push(`${id} has no shapes inside, so its light cannot turn on`);
  }
  for (const name of LAYERS) {
    const id = findId(ids, name);
    if (!id) continue;
    const inner = groupInner(svg, id).trim();
    const first = inner.match(/^<([a-zA-Z]+)([^>]*)>/);
    if (first && !/\sid="(?:zone-|focus-)/.test(first[2] || '')) {
      notes.push(`${id} has an unnamed <${first[1]}> directly inside it`);
    }
  }
  for (const name of REQUIRED.filter((n) => n.startsWith('zone-'))) {
    const id = findId(ids, name);
    if (id && /\sstyle=/.test(openTag(svg, id))) notes.push(`${id} has a style attribute; the map CSS should own the paint`);
  }
}

const pipDir = path.join(root, 'src', 'assets', 'svg', 'pip');
const pipFiles = fs.existsSync(pipDir) ? fs.readdirSync(pipDir).filter((f) => f.toLowerCase().endsWith('.svg')) : [];
if (!pipFiles.length) problems.push('no Pip art found in src/assets/svg/pip/ (the game would draw the old face)');

const viewBoxes = new Map();
for (const [mood, spec] of Object.entries(PIP_MOODS)) {
  const file = pipFiles.find((f) => fileMatches(f, spec.file));
  if (!file) {
    notes.push(`${spec.file}.svg is missing: mood "${mood}" falls back to "${spec.fallback.join('" then "')}"`);
    continue;
  }
  const svg = fs.readFileSync(path.join(pipDir, file), 'utf8');
  const found = new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => normalizeId(m[1])));
  for (const part of [...REQUIRED_PARTS, ...(spec.parts || [])]) {
    if (!found.has(part)) problems.push(`${file}: no layer named "${part}" (Pip's CSS animates it)`);
  }
  const viewBox = svg.match(/<svg\b[^>]*\sviewBox="([^"]+)"/)?.[1]?.trim().replace(/\s+/g, ' ');
  if (!viewBox) problems.push(`${file}: the <svg> has no viewBox`);
  else viewBoxes.set(file, viewBox);
}

const distinct = new Set(viewBoxes.values());
if (distinct.size > 1) {
  problems.push('Pip files use different viewBox values, so the face would jump when the mood changes:');
  for (const [file, vb] of viewBoxes) problems.push(`    ${file}: ${vb}`);
}

const roomBgPath = path.join(root, 'src', 'assets', 'svg', 'message-room-bg.svg');
if (!fs.existsSync(roomBgPath)) {
  problems.push('message-room-bg.svg is missing');
} else {
  const roomBg = fs.readFileSync(roomBgPath, 'utf8');
  for (const id of ['screen-glow', 'indicator-light1', 'indicator-light2', 'indicator-light3', 'porthole-space']) {
    if (!new RegExp(`\\sid="${id}"`).test(roomBg)) problems.push(`message-room-bg.svg has no id "${id}"`);
  }
  if (/<image\b/i.test(roomBg)) problems.push('message-room-bg.svg contains an embedded <image>');
  if (/<text\b/i.test(roomBg)) problems.push('message-room-bg.svg contains a <text> element');
}

const engineBgPath = path.join(root, 'src', 'assets', 'svg', 'engine-room-bg.svg');
if (!fs.existsSync(engineBgPath)) {
  problems.push('engine-room-bg.svg is missing');
} else {
  const engineBg = fs.readFileSync(engineBgPath, 'utf8');
  for (const id of ['engine-core-glow', 'screen-glow', 'indicator-light1', 'indicator-light2', 'indicator-light3']) {
    if (!new RegExp(`\\sid="${id}"`).test(engineBg)) problems.push(`engine-room-bg.svg has no id "${id}"`);
  }
  if (/<image\b/i.test(engineBg)) problems.push('engine-room-bg.svg contains an embedded <image>');
  if (/<text\b/i.test(engineBg)) problems.push('engine-room-bg.svg contains a <text> element');
}

for (const n of notes) console.log(`  note: ${n}`);
if (problems.length) {
  console.error('check-svg: the art and the CSS disagree.');
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(
  `check-svg: station ids OK; ${viewBoxes.size} Pip file(s) have eyes-mouth, ring and antenna-light, and share viewBox ${[...distinct][0] || '-'}.`
);
