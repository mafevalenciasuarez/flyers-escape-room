# Testing checklist

Use this list before every release. Test in a fresh browser tab (or a private window) so no saved game is loaded. Automated checks come first. The manual checks cover what the automated tests cannot see.

Tester: ________  Date: ________  Browser: ________  Build / URL: ________

## 0. Automated checks

- [ ] `npm run check-all` passes. Missing audio or pictures are listed but do not fail the check.
- [ ] `npm test` passes (7 tests).
- [ ] `npm run build` finishes with no errors.
- [ ] The published site opens from its real address (GitHub Pages sub-path or Netlify) and the fonts look right (Lexend).
- [ ] In DevTools → Network, reload: every request goes to the same site. Nothing goes to another domain.
- [ ] In DevTools → Application: no cookies, and only one `sessionStorage` key (`radio-silence-v1`).

## 1. Start and welcome

- [ ] A new person understands how to play in under 30 seconds from the first screen.
- [ ] "Listen to Helen" plays the intro. If the audio is missing, the transcript shows.
- [ ] "Start" goes to the station map. The timer starts at 30 minutes.
- [ ] Reload the page during a game: "Go back to my game" brings you to the same place, and "New game" starts again.

## 2. Every room: correct path

For each room, play with correct answers and check:

- [ ] Room 1, Message Room
- [ ] Room 2, Engine Room
- [ ] Room 3, Garden Room
- [ ] Room 4, Science Room
- [ ] Room 5, Robot Room

For every room:

- [ ] The intro screen shows the room name, an icon, and one short instruction.
- [ ] Each correct answer shows "Yes!" and a one-line reason.
- [ ] The summary shows the stars, the help used, the words practised and the secret piece.
- [ ] The piece appears in "My secret pieces" on the map and in the top bar.
- [ ] "Next" (or the map) leads to the next room. Every screen has a way forward.

Room-specific checks:

- [ ] **Room 1:** after each answer, the confidence choice (1–3 stars) appears, and the message says whether it matched the result.
- [ ] **Room 1:** each clip plays only twice. After the second play the button says so kindly, and the game continues.
- [ ] **Room 2:** all four reading modes work (Read / Read and look / Listen / Listen and read). The questions are the same in each mode.
- [ ] **Room 2:** the mode can be changed in the middle of the questions without losing progress.
- [ ] **Room 2:** in "Listen and read", the key words are highlighted. Highlighting is not shown only by colour (there is also a line under the words).
- [ ] **Room 3:** each path works: Easy (3 options), Hard (word box), Very hard (type the words, then free postcard).
- [ ] **Room 3:** the free postcard needs 12 words and 3 box words, and is never marked wrong. Help tells the child what is missing.
- [ ] **Room 3:** the streak counter, progress bar and medal are visible.
- [ ] **Room 4:** reload or play again a few times. Both versions of each word-order item appear.
- [ ] **Room 4:** in the diary, the typed answers accept capitals and extra spaces.
- [ ] **Room 5:** every option, right or wrong, shows a reason.
- [ ] **Radio Room:** the five pieces go in the boxes in room order. Then the message from Earth plays, then the end screen.
- [ ] **End screen:** the total score, the prizes, the summary for listening, reading and writing, and "words to look at again" all show. No ranking.

## 3. Wrong answers and help

For every item type, give a wrong answer at least three times:

- [ ] Choice (Rooms 1, 2, Radio Room)
- [ ] Gap-fill: choose, word box and type (Rooms 3 and 4)
- [ ] Word order (Room 4)
- [ ] Dilemma (Room 5)
- [ ] Radio Room piece in the wrong box

Check each time:

- [ ] A wrong answer never shows the right answer.
- [ ] Pip gives help step 1, then 2, then 3. Each step gives a little more, and none of them is the answer.
- [ ] After step 3 the child can still try again. They are never stuck.
- [ ] "Help, Pip!" before answering gives the same help steps.
- [ ] Room 1, help step 3: the transcript appears.
- [ ] Room 2, help step 3: the right step in the manual gets a "Look here" outline in every reading mode.
- [ ] Room 4: help never costs points, and the score after help is the same as a first try.
- [ ] Room 4, word order: after a wrong answer, "Answer" stays off until a word is moved.
- [ ] Points are never negative. Help in Rooms 1, 2, 3 and 5 lowers the points for that item from 10 to 5, never more.
- [ ] Wrong answers never show red alone. There is always an icon and text too.

## 4. Missing audio

- [ ] Rename `public/audio/` (or start with no audio) and play the whole game.
- [ ] Every player shows a short message and the transcript. Nothing crashes and no room is blocked.
- [ ] With audio present: the loading state shows, then Play / Play again work, and the transcript toggle works.
- [ ] Missing pictures show a description box, not a broken image.

## 5. Timer, time up and practice mode

To test quickly, set `GAME_MINUTES` to `1` in `src/content/index.js`, then set it back.

- [ ] The timer counts down on every screen except the end screen.
- [ ] At zero, a kind message appears ("Don't worry! You can still repair the radio."). There is no failure screen.
- [ ] After closing it, the timer is hidden and "Practice time" shows.
- [ ] All content is the same, the play limits are removed, and the game can be finished.
- [ ] No "Fast star" is given in practice mode.
- [ ] No item has its own timer.

## 6. Calm mode and settings

- [ ] Settings ("Configuration") opens from every screen and closes with Escape or the close button. Focus goes back to the button.
- [ ] Calm mode: the minutes are replaced by a progress bar. Turn it off: the minutes come back.
- [ ] Text size (3 levels): text never overlaps or hides buttons at the largest size.
- [ ] Line spacing, font (Lexend / Atkinson Hyperlegible / system) and high contrast all apply right away, and stay after a reload.
- [ ] Sounds are off by default, and play only when turned on.
- [ ] "Ayuda en español": Spanish appears under instructions and buttons only, never in questions, options, transcripts or the words under test.
- [ ] With "reduce motion" on in the computer settings, nothing moves on screen.

## 7. Keyboard only (no mouse)

- [ ] The first Tab shows "Go to the game", and Enter moves focus to the main content.
- [ ] Every button, option, word tile, gap, piece and box can be reached with Tab and used with Enter or Space.
- [ ] Focus is always visible (a thick outline), including in high contrast.
- [ ] Focus never goes behind an open window. Tab stays inside Settings or the time-up message until it closes.
- [ ] After each answer or a new screen, focus goes somewhere sensible (it never jumps to the top of the page).
- [ ] With a screen reader (NVDA or Narrator): Pip's messages and right/wrong messages are read aloud, and pictures read their alt text.
- [ ] The whole game can be finished with the keyboard only.

## 8. Screen sizes

- [ ] **Desktop 1366×768** (main target): every room fits without scrolling sideways. The main button can be seen without scrolling, or after a short scroll down.
- [ ] **Tablet 768×1024 (portrait)** and **1024×768 (landscape)**: the top bar wraps neatly, room cards and pieces stay readable, and touch targets are big.
- [ ] With Spanish help on at tablet width, the Spanish text stays inside its card.
- [ ] Browser zoom at 200%: everything can still be used.
- [ ] Headphones: the volume is comfortable and no clip is much louder than the others.

## 9. Language review (teachers)

- [ ] Every instruction is 12 words or fewer and has an icon.
- [ ] No idioms. The story names Pip, Alpha and Cadet are the only words outside the list (`npm run check-vocab` checks the rest).
- [ ] The audio recordings match `docs/audio-scripts.md` word for word.
- [ ] Remove "DRAFT" from the content files once approved.

Notes / problems found:

| Where | What happened | Fixed? |
|-------|---------------|--------|
|       |               |        |
