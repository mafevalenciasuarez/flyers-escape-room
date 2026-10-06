// Extracts the combined Starters/Movers/Flyers alphabetic list from the official
// Cambridge PDF into docs/reference/wordlist.json. Run once after adding the PDF.
import fs from 'node:fs';
import path from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const refDir = path.join(root, 'docs', 'reference');
const pdfName = fs.readdirSync(refDir).find((f) => /flyers-word-list.*\.pdf$/i.test(f));
if (!pdfName) {
  console.error('No *flyers-word-list*.pdf found in docs/reference/.');
  process.exit(1);
}

const data = new Uint8Array(fs.readFileSync(path.join(refDir, pdfName)));
const doc = await getDocument({ data, useSystemFonts: true }).promise;

// Combined S/M/F list: printed pages 23-30 (PDF pages 23-30).
const lines = [];
for (let p = 23; p <= 30; p++) {
  const page = await doc.getPage(p);
  const content = await page.getTextContent();
  let current = '';
  let lastY = null;
  for (const item of content.items) {
    const y = Math.round(item.transform[5]);
    if (lastY !== null && Math.abs(y - lastY) > 2) {
      lines.push(current);
      current = '';
    }
    current += item.str;
    if (item.hasEOL) {
      lines.push(current);
      current = '';
      lastY = null;
      continue;
    }
    lastY = y;
  }
  if (current) lines.push(current);
}

// Join wrapped entries: an entry is complete when it ends with a level letter.
const entries = [];
let buffer = '';
for (const raw of lines) {
  const line = raw.replace(/\s+/g, ' ').trim();
  if (!line || /^\d+$/.test(line) || /appears at|vocabulary list|^Pre A1|^Grammatical key|^(adj|adv|conj|det|dis|excl|int|n|poss|prep|pron|v) [a-z]/.test(line)) continue;
  buffer = buffer ? `${buffer} ${line}` : line;
  if (/\s[SMF]$/.test(buffer)) {
    for (const part of buffer.split(/(?<=\s[SMF])\s+(?=\S)/)) entries.push(part);
    buffer = '';
  }
}

const POS = /\s(n|v|adj|adv|det|prep|pron|conj|dis|excl|int|poss|title)\b/;
const words = {};
for (let entry of entries) {
  const level = entry.slice(-1);
  entry = entry.slice(0, -2).trim();
  // Drop a leading section letter like "A a det" -> "a det".
  entry = entry.replace(/^[A-Z]\s(?=\S)/, '');
  const posIdx = entry.search(POS);
  let head = posIdx > 0 ? entry.slice(0, posIdx) : entry;
  head = head.replace(/\(.*?\)/g, ' ').replace(/\si\.e\..*$/, '').trim();
  const forms = new Set();
  for (const part of head.split('/')) {
    const w = part.trim().toLowerCase();
    if (w) forms.add(w);
  }
  // Also capture UK/US alternatives in brackets, e.g. "flashlight (UK torch)".
  for (const m of entry.matchAll(/\((?:UK|US)\s([^)]+)\)/g)) forms.add(m[1].trim().toLowerCase());
  for (const f of forms) {
    if (!words[f] || 'SMF'.indexOf(level) < 'SMF'.indexOf(words[f])) words[f] = level;
  }
}

const out = path.join(refDir, 'wordlist.json');
fs.writeFileSync(out, JSON.stringify({ source: pdfName, count: Object.keys(words).length, words }, null, 2));
console.log(`Extracted ${Object.keys(words).length} headwords from ${pdfName} -> docs/reference/wordlist.json`);
