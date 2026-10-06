import raw from '../assets/svg/message-room-bg.svg?raw';
import { SVG_NS, parseSvg, prefixDocument, tagExact } from './inlineSvg.js';
import { addGlow, wrapTagged } from './glowSvg.js';

// Static glow filters. CSS only animates opacity on the group that owns the filter.
export const SCREEN_GLOW_COLOR = '#7dffe8';
export const SCREEN_GLOW_BLUR = 14;
export const LIGHT_GLOW_COLOR = '#ffb15a';
export const LIGHT_GLOW_BLUR = 8;
export const LIGHT_GLOW_SPREAD = 5;
export const LAMP_GLOW_COLOR = '#fff3c4';
export const LAMP_GLOW_BLUR = 20;
export const LAMP_GLOW_SPREAD = 1.5;
export const GLOW_FLOOD_OPACITY = 0.9;

const ROOM_IDS = ['screen-glow', 'indicator-light1', 'indicator-light2', 'indicator-light3', 'porthole-space', 'ceiling-lamp-glow'];
const TOKEN = '__RMUID__';

function buildMessageRoom() {
  const parsed = parseSvg(raw);
  if (!parsed.ok) return '';
  const { doc, svg } = parsed;
  tagExact(svg, ROOM_IDS);

  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = doc.createElementNS(SVG_NS, 'defs');
    svg.insertBefore(defs, svg.firstChild);
  }
  defs.append(addGlow(doc, 'glow-screen', SCREEN_GLOW_COLOR, SCREEN_GLOW_BLUR));
  defs.append(addGlow(doc, 'glow-light', LIGHT_GLOW_COLOR, LIGHT_GLOW_BLUR, LIGHT_GLOW_SPREAD));
  defs.append(addGlow(doc, 'glow-lamp', LAMP_GLOW_COLOR, LAMP_GLOW_BLUR, LAMP_GLOW_SPREAD));

  const layer = svg.querySelector('g') || svg;
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
  const lamp = wrapTagged(doc, svg, 'ceiling-lamp-glow');
  if (lamp) {
    lamp.setAttribute('filter', 'url(#glow-lamp)');
    layer.appendChild(lamp);
  }
  // porthole-space is one filled path. There are no separate star shapes to twinkle.

  const prefix = `rm-${TOKEN}-`;
  prefixDocument(svg, prefix);
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  return new XMLSerializer().serializeToString(svg);
}

export const messageRoomMarkup = buildMessageRoom();
