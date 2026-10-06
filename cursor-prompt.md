# Cursor prompt: "Radio Silence on Space Station Alpha"

> Before pasting: put the official Cambridge file `149681-yle-flyers-word-list.pdf` in `/docs/reference/` so Cursor can read it. Then paste everything below the line.

---

## ROLE AND CONTEXT
You are helping two primary-school teachers build a digital Escape Room for **5th graders (ages 10-11) preparing for the Cambridge A2 Flyers exam**. It is also a university assignment, so the game and a Spanish-language instructional design document must tell the same pedagogical story. Work in the order given under WORKFLOW. Do not skip the approval gates.

## NON-NEGOTIABLE DELIVERY REQUIREMENTS
- Public static site: **no backend, no login, no account, no password, no external API calls, no analytics, no cookies**. It must open from a plain URL and be playable start to finish.
- Stack: **Vite + React (JavaScript)**. No router library; use a simple state machine for screens. Set `base: './'` in `vite.config.js` so the build works on GitHub Pages (project sub-path) and Netlify. Use `import.meta.env.BASE_URL` for asset paths. Bundle fonts locally (e.g. `@fontsource/lexend`); never load from a CDN.
- Deploy: provide a GitHub Actions workflow for GitHub Pages AND instructions for Netlify Drop (`npm run build`, upload `dist`). Note that the GitHub repo must be public for free Pages.
- Zero dead ends: every screen has a way forward; a wrong answer never blocks progress permanently; missing audio never crashes the game.
- Desktop PCs with headphones are the target. Also usable on a tablet.

## THE PLAYERS
- Individual play, 10-11 years old, Spanish L1, A2 English target.
- Group includes learners with **reading difficulties, attention difficulties (ADHD) and low English level**. Inclusion is a design requirement, not an extra.
- Tutor/grader will also open the game, so the first screen must explain how to play in under 30 seconds.

## NARRATIVE (use exactly this)
- **Scenario:** Space Station Alpha orbits Earth. The main radio has gone silent and Earth Control cannot hear the crew.
- **Player role:** a young space engineer, "Cadet".
- **Sidekick:** a friendly robot called **Pip** who gives hints and feedback (never the answer).
- **Educational problem:** the Cadet must understand spoken and written messages, then write a short report, to repair the radio.
- **Mission:** restore the radio in **30 minutes** before the Earth link closes. Each room gives one **clue piece**; the five pieces build the final radio code.
- Tone: adventurous, warm, never scary. No violence, no failure screens that shame the child.

## ROOMS (one didactic dimension each + Flyers skill)
Build exactly 5 rooms plus a final room. About 3 items per room (~4 min each).

| # | Room | Dimension | Flyers skill | What the child does |
|---|------|-----------|--------------|---------------------|
| 1 | Control Room | **Evaluation** | Listening | Listen to the Commander and match people/names to descriptions (Listening Part 1 style). After each answer the child rates their own confidence (1-3 stars) and sees whether it matched their result. Clue: a number. |
| 2 | Engine Workshop | **Inclusion** | Reading | A repair manual (short text) with comprehension questions. The child **chooses how to read it**: text only / text + pictures / listen / listen + highlighted words. Same questions in every mode. Clue: a word. |
| 3 | Garden Dome | **Motivation** | Reading & Writing | Choose-your-path: Bronze, Silver or Gold mission (different difficulty, same learning goal). Badges, streak counter, progress bar. Tasks: fill gaps with one word; write a short postcard-style message to Earth from a word bank. Clue: a symbol. |
| 4 | Science Lab | **Feedback** | Writing / grammar | Reorder words into sentences; complete a diary entry. Wrong answers trigger **graduated hints** (1: what to check, 2: grammar pointer, 3: first letter or first word) and **never reveal the solution**. Correct answers get a one-line "why". Unlimited retries; hints cost no penalty. Clue: a colour. |
| 5 | AI Bay | **Ethics & Technology** | Reading + Listening | Age-appropriate dilemmas in simple English: Pip offers to "do your task for you", Pip gives a wrong fact and the child checks it against a short text, a classmate asks to copy. The child picks the responsible action and sees why. Clue: a shape. |
| Final | Radio Room | All | Mix | Enter the 5 clues in the right order. Last listening task: a message from Earth. Then the end screen. |

**Dependency rule:** no clue or task may depend on information the child has not yet received. Each clue must be obtainable through the intended learning (reading, listening or writing), not by guessing or trial-and-error.

## FLYERS CONTENT RULES
- **Source of truth for vocabulary: the official Cambridge PDF in /docs/reference/.** Use only words from the A2 Flyers list, or from the Starters and Movers lists which Flyers includes. If you want a word that is not in the PDF, do not use it. Teachers' reference blog lists contain words that are NOT in the official list, so ignore them.
- Vocabulary themes to centre on (all in the official list): space, astronaut, rocket, spaceship, planet, Earth, engine, engineer, pilot, mechanic, passenger, flashlight/torch, metal, plastic, screen, key; jobs; directions (north, south, east, west, left, right, straight on); numbers 101-1,000 and "a thousand"; time (a.m., p.m., midday, midnight, months, days); weather; places.
- Grammar to practise (Flyers-appropriate): past simple (regular and irregular), comparatives and superlatives, going to / will, should, must / have to, if + present, present perfect with ever / already / yet, can / could / may / might, how long / how much / how often, prepositions of place and movement.
- Language of all game text: **English, level A2 or below**. Max ~12 words per instruction sentence, with an icon. No idioms.
- Mix of question types that mirror the real exam: matching, multiple choice, gap-fill (one word), word order, short writing from a word bank.
- Keep every item short. Prefer 3 answer options (like Flyers) over 4.

## AUDIO
- The teachers will record `.mp3` files. **Do not use browser text-to-speech.**
- Create `public/audio/` and `src/content/audioManifest.js` listing every clip: id, filename, room, exact transcript, intended speaker, target length in seconds.
- Generate `/docs/audio-scripts.md` with the exact script for every clip (A2 level, clear, slow-normal pace, one or two speakers max, 10-40 seconds each, about 12-16 clips in total including Commander intro and Earth message). Teachers will record from this.
- Naming: `r1_q1.mp3`, `r2_manual.mp3`, `final_earth.mp3`, etc.
- Player: big Play / Replay buttons, **max 2 plays per clip** (configurable), a "Show transcript" toggle (default off in Room 1 listening items and on in the Room 2 inclusion modes), and a visible loading/error state.
- If a file is missing: show the transcript and a small message, and let the game continue. Add `npm run check-content` that lists any manifest entry with no matching file in `public/audio/`.

## INCLUSION AND ATTENTION FEATURES (global)
- One task per screen. No auto-advancing. No flashing or heavy animation; respect `prefers-reduced-motion`.
- Settings panel (always reachable): font size (3 levels), line spacing, dyslexia-friendly font option (Lexend by default), high-contrast theme, sound effects (off by default), **Calm mode** (replaces the numeric countdown with a calm progress bar).
- Optional **"Ayuda en español"** toggle that shows Spanish for the *instructions and buttons only*, never for test items or vocabulary under test.
- WCAG-minded: keyboard operable, visible focus, ARIA labels, colour never the only signal, minimum 18px body text.
- Large click targets, plenty of whitespace, consistent layout between rooms.

## TIMING AND FAIRNESS
- One **global 30-minute countdown** only. No per-item hard timers (they penalise learners with reading and attention difficulties).
- Optional soft "speed star" per room, never required, never affects clue access.
- When time reaches zero: do not end the game. Show a kind message and switch to **Training mode** (timer hidden, same content) so the child can reach the end.
- Anti-copy measures that do not hurt accessibility: audio-first tasks, shuffled answer order, small randomised item banks (2 variants per item where practical).

## FEEDBACK (every response gets guidance)
- Correct: short confirmation plus a one-line reason ("Yes! Past simple of *go* is *went*.").
- Incorrect: graduated hint via Pip; do not reveal the answer immediately.
- Room summary: stars, hints used, vocabulary practised (list the words).
- End screen: total score, badges, a per-skill summary (Listening, Reading, Writing) and a list of "words to review". No ranking against other children.

## SCORING AND GAMIFICATION
Points per correct first try, fewer for hints, never negative. Badges per room (e.g. "Good Listener", "Careful Reader", "Brave Writer", "Smart Helper", "Responsible Cadet"). Persistent progress bar and room map. Optional resume using `sessionStorage` wrapped in try/catch. No names, no data leaves the browser.

## CODE STRUCTURE
- `src/content/` holds ALL text, items, hints, clues and transcripts as plain data files so the teachers can edit content without touching components (`room1.js` ... `room5.js`, `final.js`, `audioManifest.js`, `ui.en.js`, `ui.es.js`).
- `src/components/`, `src/screens/`, `src/state/`.
- Add a small test (Vitest) that walks the whole game with correct answers and reaches the end screen, and a script that checks every clue is unlocked by content from an earlier room.
- Do not invent academic references anywhere in code or docs.

## WORKFLOW (stop at each gate and wait for my approval)
1. **Journey map** in `/docs/journey-map.md` as a table: room -> learning objective -> Flyers skill and vocabulary/grammar -> player action -> feedback received -> clue obtained -> how the player advances. **STOP and wait for approval.**
2. **Content drafts**: all items, hints, clues, and `/docs/audio-scripts.md`. **STOP and wait for approval** (I will review language level and record audio).
3. **Build** the app. Run it, fix errors, run the tests.
4. `/docs/design-notes.md`: for each room, state the dimension, the design decision, and the pedagogical reason. Write it in neutral English bullet points and **do not add citations**; I will write the Spanish document and the APA references myself.
5. `README.md`: run locally, edit content, add audio, build, deploy to GitHub Pages and Netlify.
6. **Testing checklist** covering: every room, every wrong-answer and hint path, missing audio, timer expiry and Training mode, Calm mode, keyboard-only play, 1366x768 desktop and tablet widths.
