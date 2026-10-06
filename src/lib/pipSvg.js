import { MOOD_ALIASES, PIP_MOODS, PIP_PARTS, fileMatches, normalizeId } from './pipIds.js';

// Every Pip head in src/assets/svg/pip/. A missing file is simply absent here.
const RAW = import.meta.glob('../assets/svg/pip/*.svg', { query: '?raw', import: 'default', eager: true });

// Replaced per mounted Pip so two copies of the same face never share an id.
export const INSTANCE_TOKEN = '__PIPUID__';

const FILES = Object.fromEntries(
  Object.entries(RAW).map(([p, raw]) => [p.split('/').pop(), raw])
);

const cache = new Map();

function refRewriter(prefix, ids) {
  return (value) =>
    value
      .replace(/url\(\s*(['"]?)#([^'")\s]+)\1\s*\)/g, (m, q, id) => (ids.has(id) ? `url(${q}#${prefix}${id}${q})` : m))
      .replace(/^#(.+)$/, (m, id) => (ids.has(id) ? `#${prefix}${id}` : m));
}

// Parses one file and makes it safe to inline next to other SVGs.
export function cleanPipSvg(raw, fileKey) {
  if (typeof DOMParser === 'undefined' || !raw) return null;
  const doc = new DOMParser().parseFromString(raw, 'image/svg+xml');
  const svg = doc.documentElement;
  if (!svg || svg.nodeName.toLowerCase() !== 'svg' || doc.getElementsByTagName('parsererror').length) return null;

  const prefix = `${fileKey.replace(/[^a-z0-9]+/gi, '-')}-${INSTANCE_TOKEN}-`;
  const all = [svg, ...svg.getElementsByTagName('*')];

  const tagged = new Set();
  for (const el of all) {
    const id = el.getAttribute('id');
    if (!id) continue;
    const part = PIP_PARTS[normalizeId(id)];
    if (part && !tagged.has(part)) {
      el.setAttribute('data-pip', part);
      tagged.add(part);
    }
  }

  const ids = new Set(all.map((el) => el.getAttribute('id')).filter(Boolean));
  const rewrite = refRewriter(prefix, ids);
  for (const el of all) {
    for (const attr of [...el.attributes]) {
      if (attr.name === 'id') el.setAttribute('id', prefix + attr.value);
      else if (attr.name === 'class') {
        el.setAttribute('class', attr.value.split(/\s+/).filter(Boolean).map((c) => prefix + c).join(' '));
      } else if (attr.value.includes('#')) el.setAttribute(attr.name, rewrite(attr.value));
    }
  }

  for (const style of svg.getElementsByTagName('style')) {
    style.textContent = style.textContent
      .replace(/\.(-?[_a-zA-Z][\w-]*)/g, (m, c) => `.${prefix}${c}`)
      .replace(/#([_a-zA-Z][\w-]*)/g, (m, id) => (ids.has(id) ? `#${prefix}${id}` : m))
      .replace(/url\(\s*(['"]?)#([^'")\s]+)\1\s*\)/g, (m, q, id) => (ids.has(id) ? `url(${q}#${prefix}${id}${q})` : m));
  }

  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  return new XMLSerializer().serializeToString(svg);
}

// Picks the file for a mood, walking the fallback chain. Returns null when no
// Pip art exists at all, so the caller can draw the old face.
export function resolveMood(mood, files = FILES) {
  const start = MOOD_ALIASES[mood] || (PIP_MOODS[mood] ? mood : 'neutral');
  const seen = new Set();
  const queue = [start];
  while (queue.length) {
    const m = queue.shift();
    if (seen.has(m) || !PIP_MOODS[m]) continue;
    seen.add(m);
    const name = Object.keys(files).find((f) => fileMatches(f, PIP_MOODS[m].file));
    if (name) return { mood: m, name };
    queue.push(...PIP_MOODS[m].fallback);
  }
  return null;
}

// Cleaned markup for a mood (memoised per file), or null if no art is available.
export function getPipSvg(mood, files = FILES) {
  const found = resolveMood(mood, files);
  if (!found) return null;
  const key = files === FILES ? found.name : `custom:${found.name}`;
  if (!cache.has(key)) cache.set(key, cleanPipSvg(files[found.name], found.name.replace(/\.svg$/i, '')));
  const markup = cache.get(key);
  return markup ? { ...found, markup } : null;
}
