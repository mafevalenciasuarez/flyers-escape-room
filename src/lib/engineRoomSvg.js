import raw from '../assets/svg/engine-room-bg.svg?raw';
import { SVG_NS, parseSvg, prefixDocument, tagExact } from './inlineSvg.js';
import { addGlow, wrapTagged } from './glowSvg.js';

// Warm amber. Radii and colours stay here so the CSS only changes opacity.
export const ENGINE_CORE_COLOR = '#ffb15a';
export const ENGINE_CORE_BLUR = 22;
export const ENGINE_CORE_SPREAD = 2;
export const ENGINE_LIGHT_COLOR = '#ffb15a';
export const ENGINE_LIGHT_BLUR = 8;
export const ENGINE_LIGHT_SPREAD = 5;
// Dim amber on the blank cabinet glass. The filter must not draw a picture or a word.
export const ENGINE_SCREEN_COLOR = '#c47a3a';
export const ENGINE_SCREEN_BLUR = 12;
export const ENGINE_SCREEN_SPREAD = 1.5;

const ROOM_IDS = ['engine-core-glow', 'screen-glow', 'indicator-light1', 'indicator-light2', 'indicator-light3'];
const TOKEN = '__RMUID__';

function buildEngineRoom() {
  const parsed = parseSvg(raw);
  if (!parsed.ok) return '';
  const { doc, svg } = parsed;
  tagExact(svg, ROOM_IDS);

  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = doc.createElementNS(SVG_NS, 'defs');
    svg.insertBefore(defs, svg.firstChild);
  }
  defs.append(addGlow(doc, 'glow-core', ENGINE_CORE_COLOR, ENGINE_CORE_BLUR, ENGINE_CORE_SPREAD));
  defs.append(addGlow(doc, 'glow-screen', ENGINE_SCREEN_COLOR, ENGINE_SCREEN_BLUR, ENGINE_SCREEN_SPREAD));
  defs.append(addGlow(doc, 'glow-light', ENGINE_LIGHT_COLOR, ENGINE_LIGHT_BLUR, ENGINE_LIGHT_SPREAD));

  const layer = svg.querySelector('g') || svg;
  const core = wrapTagged(doc, svg, 'engine-core-glow');
  if (core) {
    core.setAttribute('filter', 'url(#glow-core)');
    layer.appendChild(core);
  }
  const screen = wrapTagged(doc, svg, 'screen-glow');
  if (screen) {
    screen.setAttribute('filter', 'url(#glow-screen)');
    layer.appendChild(screen);
  }
  for (const name of ['indicator-light1', 'indicator-light2', 'indicator-light3']) {
    const light = wrapTagged(doc, svg, name);
    if (light) {
      light.setAttribute('filter', 'url(#glow-light)');
      layer.appendChild(light);
    }
  }

  const prefix = `er-${TOKEN}-`;
  prefixDocument(svg, prefix);
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  return new XMLSerializer().serializeToString(svg);
}

export const engineRoomMarkup = buildEngineRoom();
