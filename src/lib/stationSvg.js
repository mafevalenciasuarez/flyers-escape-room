import raw from '../assets/svg/space-station.svg?raw';
import { SVG_NS, parseSvg, prefixDocument, tagByNames } from './inlineSvg.js';

// Replaced per mounted station so the intro and the map never share an id.
export const INSTANCE_TOKEN = '__STUID__';

// SVG filter amounts, in viewBox units (the station box is 2120.85 wide).
// A blur of 28 is about 5px when the station is drawn ~400px wide.
export const GLOW_BLUR = 28;
export const GLOW_COLOR = '#FFC857';
export const GLOW_OPACITY = 0.7;
export const DIM_SATURATE = 0.15;
export const DIM_SLOPE_R = 0.32;
export const DIM_SLOPE_G = 0.34;
export const DIM_SLOPE_B = 0.42;

// Longest match wins, so light-room1 does not swallow a longer name.
const NAMES = [
  'station-art',
  'map-zones',
  'map-focus',
  'light-room1',
  'light-room2',
  'light-room3',
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
].sort((a, b) => b.length - a.length);

const PAINT = ['style', 'fill', 'opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'fill-opacity'];

export const stationCleanupNotes = [];

function buildStation() {
  const notes = [];
  const parsed = parseSvg(raw);
  if (!parsed.ok) return { markup: '', notes: [parsed.error || 'space-station.svg did not parse'] };
  const { doc, svg } = parsed;

  const vb = svg.viewBox?.baseVal;
  const boxArea = vb && vb.width && vb.height ? vb.width * vb.height : 0;
  for (const child of [...svg.children]) {
    if (child.localName !== 'rect' || !boxArea) continue;
    const w = parseFloat(child.getAttribute('width') || '0');
    const h = parseFloat(child.getAttribute('height') || '0');
    if ((w * h) / boxArea >= 0.95) {
      notes.push('removed a root rectangle that covered the viewBox');
      child.remove();
    }
  }

  tagByNames(svg, NAMES);

  for (const layerName of ['map-zones', 'map-focus']) {
    const layer = svg.querySelector(`[data-st="${layerName}"]`);
    if (!layer) continue;
    for (const child of [...layer.children]) {
      if (child.getAttribute('data-st')) continue;
      const keepsShapes = child.querySelector && child.querySelector('[data-st]');
      if (keepsShapes && child.localName === 'g') {
        const kind = child.getAttribute('clip-path') ? 'clip wrapper' : 'unnamed group';
        while (child.firstChild) layer.insertBefore(child.firstChild, child);
        child.remove();
        notes.push(`${layerName}: unwrapped an unnamed <g> (${kind}) and kept its shapes`);
      } else {
        const id = child.getAttribute('id');
        notes.push(`${layerName}: removed <${child.localName}>${id ? `#${id}` : ' with no name'}`);
        child.remove();
      }
    }
  }

  for (const el of svg.querySelectorAll('[data-st^="zone-"], [data-st^="focus-"]')) {
    for (const node of [el, ...el.querySelectorAll('*')]) {
      for (const attr of PAINT) node.removeAttribute(attr);
    }
  }
  for (const el of svg.querySelectorAll('[data-st^="zone-"]')) {
    el.setAttribute('fill', '#ffffff');
    el.setAttribute('pointer-events', 'all');
    el.setAttribute('tabindex', '-1');
    el.setAttribute('aria-hidden', 'true');
  }
  for (const el of svg.querySelectorAll('[data-st^="focus-"]')) {
    el.setAttribute('pointer-events', 'none');
    el.setAttribute('aria-hidden', 'true');
  }
  const zones = svg.querySelector('[data-st="map-zones"]');
  if (zones) zones.setAttribute('aria-hidden', 'true');

  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = doc.createElementNS(SVG_NS, 'defs');
    svg.insertBefore(defs, svg.firstChild);
  }

  const dim = doc.createElementNS(SVG_NS, 'filter');
  dim.setAttribute('id', 'dim');
  dim.setAttribute('color-interpolation-filters', 'sRGB');
  dim.setAttribute('x', '-20%');
  dim.setAttribute('y', '-20%');
  dim.setAttribute('width', '140%');
  dim.setAttribute('height', '140%');
  const saturate = doc.createElementNS(SVG_NS, 'feColorMatrix');
  saturate.setAttribute('type', 'saturate');
  saturate.setAttribute('values', String(DIM_SATURATE));
  const transfer = doc.createElementNS(SVG_NS, 'feComponentTransfer');
  for (const [channel, slope] of [
    ['feFuncR', DIM_SLOPE_R],
    ['feFuncG', DIM_SLOPE_G],
    ['feFuncB', DIM_SLOPE_B],
  ]) {
    const fn = doc.createElementNS(SVG_NS, channel);
    fn.setAttribute('type', 'linear');
    fn.setAttribute('slope', String(slope));
    fn.setAttribute('intercept', '0.02');
    transfer.appendChild(fn);
  }
  dim.append(saturate, transfer);

  const glow = doc.createElementNS(SVG_NS, 'filter');
  glow.setAttribute('id', 'glow');
  glow.setAttribute('color-interpolation-filters', 'sRGB');
  glow.setAttribute('x', '-50%');
  glow.setAttribute('y', '-50%');
  glow.setAttribute('width', '200%');
  glow.setAttribute('height', '200%');
  const blur = doc.createElementNS(SVG_NS, 'feGaussianBlur');
  blur.setAttribute('in', 'SourceGraphic');
  blur.setAttribute('stdDeviation', String(GLOW_BLUR));
  blur.setAttribute('result', 'blur');
  const flood = doc.createElementNS(SVG_NS, 'feFlood');
  flood.setAttribute('flood-color', GLOW_COLOR);
  flood.setAttribute('flood-opacity', String(GLOW_OPACITY));
  flood.setAttribute('result', 'flood');
  const composite = doc.createElementNS(SVG_NS, 'feComposite');
  composite.setAttribute('in', 'flood');
  composite.setAttribute('in2', 'blur');
  composite.setAttribute('operator', 'in');
  composite.setAttribute('result', 'glow');
  const merge = doc.createElementNS(SVG_NS, 'feMerge');
  for (const inn of ['glow', 'SourceGraphic']) {
    const node = doc.createElementNS(SVG_NS, 'feMergeNode');
    node.setAttribute('in', inn);
    merge.appendChild(node);
  }
  glow.append(blur, flood, composite, merge);
  defs.append(dim, glow);

  for (const el of [...svg.querySelectorAll('[data-st^="light-"]')]) {
    const use = doc.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', `#${el.getAttribute('id')}`);
    use.setAttribute('class', 'station-light-dark');
    el.parentNode.insertBefore(use, el);
  }

  const prefix = prefixDocument(svg, `st-${INSTANCE_TOKEN}-`, { preserveClass: ['station-light-dark'] });

  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('overflow', 'visible');
  svg.setAttribute('style', `--st-dim:url(#${prefix}dim);--st-glow:url(#${prefix}glow)`);

  return { markup: new XMLSerializer().serializeToString(svg), notes };
}

const built = buildStation();
stationCleanupNotes.push(...built.notes);
if (built.notes.length && import.meta.env && import.meta.env.DEV) {
  console.info(`[stationSvg] ${built.notes.join(' | ')}`);
}

export function getStationMarkup() {
  return built.markup;
}
