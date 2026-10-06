import raw from '../assets/svg/garden-room-bg.svg?raw';
import { SVG_NS, parseSvg, prefixDocument } from './inlineSvg.js';
import { addGlow } from './glowSvg.js';

// Warm amber. Radii and colours stay here so the CSS only changes opacity.
export const GARDEN_LAMP_COLOR = '#FFC857';
export const GARDEN_LAMP_BLUR = 18;
export const GARDEN_LAMP_SPREAD = 1.5;
export const GARDEN_BEAM_COLOR = '#FFE3A6';
export const GARDEN_BEAM_BLUR = 14;
export const GARDEN_BEAM_SPREAD = 1.2;

const GLOW_NAMES = ['ceiling-lamp-glow', 'light-beam'];
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

// The filter stays on the exported group. Shapes are not wrapped one by one,
// and the group is not moved, so the drawing order stays the artist's.
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

function buildGardenRoom() {
  const parsed = parseSvg(raw);
  if (!parsed.ok) return '';
  const { doc, svg } = parsed;
  tagPrefixes(svg, GLOW_NAMES);

  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = doc.createElementNS(SVG_NS, 'defs');
    svg.insertBefore(defs, svg.firstChild);
  }
  defs.append(addGlow(doc, 'glow-lamp', GARDEN_LAMP_COLOR, GARDEN_LAMP_BLUR, GARDEN_LAMP_SPREAD));
  defs.append(addGlow(doc, 'glow-beam', GARDEN_BEAM_COLOR, GARDEN_BEAM_BLUR, GARDEN_BEAM_SPREAD));

  glowInPlace(doc, svg, 'ceiling-lamp-glow', 'glow-lamp');
  glowInPlace(doc, svg, 'light-beam', 'glow-beam');

  const prefix = `gd-${TOKEN}-`;
  prefixDocument(svg, prefix);
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  return new XMLSerializer().serializeToString(svg);
}

export const gardenRoomMarkup = buildGardenRoom();
