// Dependency rule: every secret piece must come from content the child has already
// received (reading, listening or writing), and the Radio Room may only use pieces
// from earlier rooms. Exits with code 1 on any problem.
import { loadContent, strings } from './lib/content.mjs';

const { rooms, final, audio } = await loadContent();
const audioById = Object.fromEntries(audio.map((c) => [c.id, c]));
const problems = [];

function deliveredText(room, item) {
  const texts = strings(item);
  if (item.audio && audioById[item.audio]) texts.push(audioById[item.audio].transcript);
  // Room-level reading text is shown before every item in that room.
  if (room.reading) texts.push(...strings(room.reading.steps.map((s) => s.text)));
  return texts.join(' \n ').toLowerCase();
}

for (const room of rooms) {
  const { clue } = room;
  if (!clue) {
    problems.push(`${room.id}: no clue`);
    continue;
  }
  const idx = room.items.findIndex((i) => i.id === clue.sourceItem);
  if (idx === -1) {
    problems.push(`${room.id}: clue source item "${clue.sourceItem}" does not exist in this room`);
    continue;
  }
  const item = room.items[idx];
  const text = deliveredText(room, item);
  if (!text.includes(String(clue.evidence).toLowerCase())) {
    problems.push(`${room.id}: evidence "${clue.evidence}" for clue "${clue.value}" is not in ${item.id} (text, options or transcript)`);
  }
  // The evidence must not first appear in a later room.
  for (const later of rooms.filter((r) => r.order > room.order)) {
    const laterText = strings(later).join(' ').toLowerCase();
    if (laterText.includes(`secret piece: ${String(clue.value).toLowerCase()}`)) {
      problems.push(`${room.id}: clue "${clue.value}" is announced in later room ${later.id}`);
    }
  }
  console.log(`ok  ${room.id} (${room.name}) -> ${clue.type} "${clue.value}" from ${item.id}: "${clue.evidence}"`);
}

const roomIds = rooms.map((r) => r.id);
const seen = new Set();
final.slots.forEach((id, i) => {
  const r = rooms.find((x) => x.id === id);
  if (!r) problems.push(`final: slot ${i + 1} uses unknown room "${id}"`);
  else if (r.order >= final.order) problems.push(`final: slot ${i + 1} uses ${id}, which is not an earlier room`);
  if (seen.has(id)) problems.push(`final: room ${id} is used in two slots`);
  seen.add(id);
});
for (const id of roomIds) if (!seen.has(id)) problems.push(`final: the piece from ${id} is never used`);
const sorted = [...final.slots].sort((a, b) => rooms.find((r) => r.id === a).order - rooms.find((r) => r.id === b).order);
if (sorted.join() !== final.slots.join()) problems.push('final: slots are not in room order, so the child cannot know the order');

if (problems.length) {
  console.log('\nProblems:');
  for (const p of problems) console.log(`  ${p}`);
  process.exit(1);
}
console.log('check-clues: every secret piece comes from earlier content, and the Radio Room uses all 5 in room order.');
