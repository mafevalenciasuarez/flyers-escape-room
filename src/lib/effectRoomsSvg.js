import scienceRaw from '../assets/svg/science-room-bg.svg?raw';
import robotRaw from '../assets/svg/robot-room-bg.svg?raw';
import radioRaw from '../assets/svg/radio-room-bg.svg?raw';
import { SVG_NS, parseSvg, prefixDocument } from './inlineSvg.js';
import { addGlow } from './glowSvg.js';

// Warm amber lamps and mint-blue screens. CSS only changes opacity.
export const LAMP_COLOR = '#FFC857';
export const LAMP_BLUR = 18;
export const LAMP_SPREAD = 1.5;
export const SCREEN_COLOR = '#7FE7D6';
export const SCREEN_BLUR = 14;
export const SCREEN_SPREAD = 1.2;

const TOKEN = '__RMUID__';

function matches(id, name) {
  return id === name || id.startsWith(`${name}_`) || id.startsWith(`${name}-`);
}

function tagPrefixes(svg, names) {
  for (const el of svg.getElementsByTagName('*')) {
    const id = el.getAttribute('id');
    if (!id) continue;
    const name = names.find((n) => matches(id, n));
    if (name) el.setAttribute('data-st', name);
  }
}

function glowInPlace(doc, svg, name, filterId) {
  const nodes = [...svg.querySelectorAll(`[data-st="${name}"]`)];
  for (const el of nodes) {
    if (el.parentNode?.getAttribute?.('data-st') === name) continue;
    const group = doc.createElementNS(SVG_NS, 'g');
    group.setAttribute('data-st', name);
    group.setAttribute('filter', `url(#${filterId})`);
    el.removeAttribute('data-st');
    el.parentNode.insertBefore(group, el);
    group.appendChild(el);
  }
}

function build(raw, prefix, glowNames, plainNames) {
  const parsed = parseSvg(raw);
  if (!parsed.ok) return '';
  const { doc, svg } = parsed;
  tagPrefixes(svg, [...glowNames.map((g) => g.name), ...plainNames]);

  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = doc.createElementNS(SVG_NS, 'defs');
    svg.insertBefore(defs, svg.firstChild);
  }
  for (const glow of glowNames) {
    defs.append(addGlow(doc, glow.filter, glow.color, glow.blur, glow.spread));
    glowInPlace(doc, svg, glow.name, glow.filter);
  }

  prefixDocument(svg, `${prefix}-${TOKEN}-`);
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  return new XMLSerializer().serializeToString(svg);
}

const lamp = { name: 'ceiling-lamp-glow', filter: 'glow-lamp', color: LAMP_COLOR, blur: LAMP_BLUR, spread: LAMP_SPREAD };

export const scienceRoomMarkup = build(
  scienceRaw,
  'sc',
  [lamp, { name: 'radio-screen', filter: 'glow-screen', color: SCREEN_COLOR, blur: SCREEN_BLUR, spread: SCREEN_SPREAD }],
  ['chemistry-glass']
);

export const robotRoomMarkup = build(
  robotRaw,
  'rb',
  [lamp, { name: 'console-screen', filter: 'glow-screen', color: SCREEN_COLOR, blur: SCREEN_BLUR, spread: SCREEN_SPREAD }],
  []
);

export const radioRoomMarkup = build(
  radioRaw,
  'rd',
  [{ name: 'radio-screen', filter: 'glow-screen', color: SCREEN_COLOR, blur: SCREEN_BLUR, spread: SCREEN_SPREAD }],
  []
);
