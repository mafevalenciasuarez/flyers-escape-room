import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { root } from './vocab.mjs';

async function load(name) {
  return (await import(pathToFileURL(path.join(root, 'src', 'content', `${name}.js`)).href)).default;
}

export async function loadContent() {
  const rooms = await Promise.all(['room1', 'room2', 'room3', 'room4', 'room5'].map(load));
  const final = await load('final');
  const audio = await load('audioManifest');
  const images = await load('imageManifest');
  return { rooms, final, audio, images };
}

// All strings inside a value, flattened.
export function strings(node, out = []) {
  if (typeof node === 'string') out.push(node);
  else if (Array.isArray(node)) node.forEach((v) => strings(v, out));
  else if (node && typeof node === 'object') Object.values(node).forEach((v) => strings(v, out));
  return out;
}

// Every audio id and image id an item or room refers to.
export function references(node, acc = { audio: new Set(), image: new Set() }) {
  if (Array.isArray(node)) node.forEach((v) => references(v, acc));
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if ((k === 'audio' || k === 'introAudio' || k === 'endAudio') && typeof v === 'string') acc.audio.add(v);
      else if (k === 'image' && typeof v === 'string') acc.image.add(v);
      else references(v, acc);
    }
  }
  return acc;
}
