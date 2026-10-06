// Lists audio and image manifest entries that have no file yet, and fails if a room
// refers to an audio or image id that is not in a manifest.
import fs from 'node:fs';
import path from 'node:path';
import { root } from './lib/vocab.mjs';
import { loadContent, references } from './lib/content.mjs';

const { rooms, final, audio, images } = await loadContent();
const audioDir = path.join(root, 'public', 'audio');
const imgDir = path.join(root, 'public', 'img');

const missingAudio = audio.filter((c) => !fs.existsSync(path.join(audioDir, c.file)));
const missingImages = images.filter((i) => !fs.existsSync(path.join(imgDir, i.file)));
const SIZE_WARN = 150 * 1024;
const SIZE_FAIL = 400 * 1024;
const imageProblems = [];
for (const image of images) {
  const filePath = path.join(imgDir, image.file);
  if (!fs.existsSync(filePath)) {
    imageProblems.push(`image "${image.file}" is named in imageManifest.js but is not in public/img/`);
    continue;
  }
  const bytes = fs.statSync(filePath).size;
  const kb = Math.round(bytes / 1024);
  if (bytes > SIZE_FAIL) imageProblems.push(`image "${image.file}" is ${kb} KB, above the 400 KB limit`);
  else if (bytes > SIZE_WARN) console.log(`  warn: ${image.file} is ${kb} KB (above 150 KB)`);
}

console.log(`Audio: ${audio.length - missingAudio.length} of ${audio.length} files found in public/audio/.`);
for (const c of missingAudio) {
  if (c.id === 'r2_manual') {
    console.log('  warn: public/audio/r2_manual.mp3 is missing. Listen modes show the transcript until that file is added.');
  } else {
    console.log(`  missing  ${c.file}  (${c.room}, ${c.speaker}, ~${c.seconds}s)`);
  }
}
console.log(`Images: ${images.length - missingImages.length} of ${images.length} files found in public/img/.`);
for (const i of missingImages) console.log(`  missing  ${i.file}  (${i.room})`);

const audioIds = new Set(audio.map((c) => c.id));
const imageIds = new Set(images.map((i) => i.id));
const refs = references([...rooms, final]);
const broken = [
  ...imageProblems,
  ...[...refs.audio].filter((id) => !audioIds.has(id)).map((id) => `audio "${id}" is used in a room but not in audioManifest.js`),
  ...[...refs.image].filter((id) => !imageIds.has(id)).map((id) => `image "${id}" is used in a room but not in imageManifest.js`),
];
const unusedAudio = [...audioIds].filter((id) => !refs.audio.has(id) && id !== 'intro_helen');
for (const id of unusedAudio) broken.push(`audio "${id}" is in audioManifest.js but no room uses it`);

const extraFiles = fs.existsSync(audioDir)
  ? fs.readdirSync(audioDir).filter((f) => f.endsWith('.mp3') && !audio.some((c) => c.file === f))
  : [];
for (const f of extraFiles) console.log(`  note: public/audio/${f} is not in the manifest (the game will not use it)`);

if (broken.length) {
  console.log('\nProblems:');
  for (const b of broken) console.log(`  ${b}`);
  process.exit(1);
}
console.log(
  missingAudio.length || missingImages.length
    ? '\nThe game still works: missing audio shows the transcript, missing pictures show a description.'
    : '\nAll audio and image files are present.'
);
