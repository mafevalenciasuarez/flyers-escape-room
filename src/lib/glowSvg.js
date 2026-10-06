import { SVG_NS } from './inlineSvg.js';

// Static glow filters. CSS only animates opacity on the group that owns the filter.
export function addGlow(doc, id, color, blur, spread = 1.5) {
  const filter = doc.createElementNS(SVG_NS, 'filter');
  filter.setAttribute('id', id);
  filter.setAttribute('color-interpolation-filters', 'sRGB');
  const pad = spread * 100;
  filter.setAttribute('x', `${-pad}%`);
  filter.setAttribute('y', `${-pad}%`);
  filter.setAttribute('width', `${pad * 2 + 100}%`);
  filter.setAttribute('height', `${pad * 2 + 100}%`);
  const hex = color.replace('#', '');
  const channels = [0, 2, 4].map((i) => (parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(4));
  const matrix = doc.createElementNS(SVG_NS, 'feColorMatrix');
  matrix.setAttribute('in', 'SourceGraphic');
  matrix.setAttribute('type', 'matrix');
  matrix.setAttribute('values', `0 0 0 0 ${channels[0]}  0 0 0 0 ${channels[1]}  0 0 0 0 ${channels[2]}  0 0 0 1 0`);
  matrix.setAttribute('result', 'lit');
  const blurNode = doc.createElementNS(SVG_NS, 'feGaussianBlur');
  blurNode.setAttribute('in', 'lit');
  blurNode.setAttribute('stdDeviation', String(blur));
  blurNode.setAttribute('result', 'soft');
  const merge = doc.createElementNS(SVG_NS, 'feMerge');
  for (const inn of ['soft', 'lit']) {
    const node = doc.createElementNS(SVG_NS, 'feMergeNode');
    node.setAttribute('in', inn);
    merge.appendChild(node);
  }
  filter.append(matrix, blurNode, merge);
  return filter;
}

// Illustrator exports lights and glows as single shapes. Wrap each one so the
// glow filter covers the whole shape, including any highlight added later.
export function wrapTagged(doc, svg, name) {
  const el = svg.querySelector(`[data-st="${name}"]`);
  if (!el || el.parentNode?.getAttribute?.('data-st') === name) return el;
  const group = doc.createElementNS(SVG_NS, 'g');
  group.setAttribute('data-st', name);
  el.removeAttribute('data-st');
  el.parentNode.insertBefore(group, el);
  group.appendChild(el);
  return group;
}
