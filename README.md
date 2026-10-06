# Radio Silence on Space Station Alpha

A digital escape room for 10–11-year-old learners preparing for Cambridge A2 Flyers. The child is a young space engineer ("Cadet") who repairs the station radio with the help of Pip, a friendly robot. There are five rooms, one for each didactic dimension (Evaluation, Inclusion, Motivation, Feedback, Ethics and technology), plus a final Radio Room.

The site is static. It has no backend, login, cookies, analytics, or external requests. Fonts are bundled. Progress is kept only in the browser tab (`sessionStorage`) and never leaves the computer.

> Status: all game text is a **DRAFT** that needs teacher approval. Audio and pictures are not recorded or drawn yet. The game works without them: it shows the transcript and a short description instead.

## Documents

| File | What it is |
|------|------------|
| `docs/journey-map.md` | Room-by-room plan, timing, and the open decisions to approve |
| `docs/audio-scripts.md` | Exact scripts for every audio clip (generated, do not edit by hand) |
| `docs/design-notes.md` | Dimension, design decision and pedagogical reason for each room |
| `docs/testing-checklist.md` | Manual test list before publishing |
| `docs/reference/` | Official Cambridge Flyers word list (PDF) and the extracted `wordlist.json` |

## Run it on your computer

You need [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install
npm run dev
```

Open the address shown in the terminal (usually `http://localhost:5173/`).

## Edit the content

All text, items, help steps, secret pieces and transcripts live in `src/content/`. You do not need to touch any component.

| File | Contents |
|------|----------|
| `room1.js` … `room5.js` | One file per room: intro, items, answers, help steps, "why" lines, secret piece |
| `final.js` | Radio Room: placing the pieces, the message from Earth, the end prize |
| `audioManifest.js` | Every audio clip: id, file name, room, speaker, target length, play limit, transcript |
| `imageManifest.js` | Every picture: id, file name, alt text, a brief for the artist |
| `ui.en.js` / `ui.es.js` | Buttons and instructions in English, with the Spanish help text |
| `index.js` | Room order and the game length (`GAME_MINUTES = 30`) |

Rules to keep while editing:

- **English words must come from the official Starters, Movers or Flyers list.** Run `npm run check-vocab` after every change. It lists any word that is not in `docs/reference/wordlist.json`. The only exceptions are the story names Pip, Alpha and Cadet, in `scripts/check-vocab.mjs`.
- Spanish (`...Es` keys and `ui.es.js`) is for instructions and buttons only. Never translate items or the words under test.
- If you change a secret piece, keep its `evidence` text inside the item or transcript it comes from. Then run `npm run check-clues`.
- If you change a transcript in `audioManifest.js`, run `npm run audio-scripts` to rebuild `docs/audio-scripts.md`.

## Add audio

1. Record each clip from `docs/audio-scripts.md`.
2. Save it as an `.mp3` with the exact file name in the script, for example `r1_q1.mp3` or `final_earth.mp3`.
3. Put the files in `public/audio/`.
4. Run `npm run check-content` to see which clips are still missing.

Play limits: listening items in Room 1 and the message from Earth play twice (`maxPlays: 2` in `audioManifest.js`). Use `null` for no limit. When the 30 minutes end, limits are removed.

Do not use browser text-to-speech. If a file is missing, the game shows the transcript and continues.

## Add pictures

1. Read the `brief` for each picture in `src/content/imageManifest.js`.
2. Save it with the exact file name, for example `r1_sarah_a.png`, in `public/img/`.
3. Run `npm run check-content`.

Keep the `alt` text in the manifest true to the picture. Screen readers use it, and the game shows it when a picture is missing.

## Checks and tests

| Command | What it checks |
|---------|----------------|
| `npm run check-content` | Lists audio and picture files that are missing. Fails if content refers to an id that does not exist |
| `npm run check-vocab` | Every English word is in the official word list |
| `npm run check-clues` | Every secret piece comes from content the child has already seen, and the Radio Room uses all five in room order |
| `npm run check-all` | All three checks above |
| `npm test` | Plays the whole game automatically. Also tests wrong answers, the very hard path, missing audio, time up, Calm mode and resume |

`npm run extract-wordlist` rebuilds `docs/reference/wordlist.json` from the PDF. You only need it if Cambridge publishes a new list.

## Build

```bash
npm run build
```

The finished site is in `dist/`. It uses relative paths (`base: './'`), so it works in any folder or sub-path. To try the build on your computer, run `npm run preview`.

## Publish on GitHub Pages

1. Create a **public** repository on GitHub. Free GitHub Pages needs a public repository.
2. Push this project to the `main` branch.
3. On GitHub, open **Settings → Pages**. Under **Source**, choose **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` runs the checks and tests, builds the site, and publishes it. It runs on every push to `main`. You can also run it from the **Actions** tab.
5. The address is `https://<your-user>.github.io/<repository-name>/`.

If the tests or the word check fail, the site is not published. Open the **Actions** tab to see why.

## Publish on Netlify Drop (no account set-up needed)

1. Run `npm run build`.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag the `dist` folder onto the page.
4. Netlify gives you a public address. To update the site, build again and drop the new `dist` folder.

## Project structure

```
src/
  content/      all text and data (teachers edit here)
  components/   buttons, audio player, Pip, help, settings, item types
  screens/      welcome, map, rooms, summary, Radio Room, end
  state/        game state machine, scoring, sessionStorage
  lib/          small helpers
  test/         Vitest walkthrough
scripts/        word list, content, vocabulary and clue checks
public/audio/   teacher recordings (.mp3)
public/img/     teacher pictures
```
