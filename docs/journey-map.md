# Journey map: Radio Silence on Space Station Alpha

Status: **Gate 1 draft, waiting for teacher approval.**

Vocabulary source: `docs/reference/149681-yle-flyers-word-list.pdf` ("Wordlists for exams from 2018"). Levels below: **S** = Pre A1 Starters, **M** = A1 Movers, **F** = A2 Flyers. Every level was looked up by script from `docs/reference/wordlist.json`, which `npm run extract-wordlist` builds from the PDF.

## Story frame

- Space Station Alpha goes around the Earth. The radio is broken, and the team on Earth cannot hear the people on the station.
- The child is the young engineer, "Cadet". Pip, a friendly robot, gives help and feedback, never the answer.
- Helen, the station manager, gives the job: repair the radio in 30 minutes. Each room gives one **secret piece**. The five pieces repair the radio in the Radio Room.

## Journey table

| Room | Learning objective | Flyers skill, vocabulary and grammar | Player action | Feedback received | Clue (secret piece) | How the player advances |
|---|---|---|---|---|---|---|
| Start | Understand the job and the controls in under 30 seconds | Listening: Helen's welcome (`intro_helen`) | Reads 3 icon steps, can play Helen's message, opens the help and settings panel if needed | None, this is orientation | None | "Start" button opens the station map |
| 1. Message Room (Evaluation) | Identify people from spoken descriptions; understand a spoken 3-digit number; compare self-rating with result | Listening Part 1 style. Jobs: manager F, engineer F, pilot F, mechanic F. Appearance: curly M, beard M, glasses S. Objects: torch F, metal F, box S. Numbers: hundred M, 101-1,000 F. Grammar: have got, present continuous (*is holding*, *is carrying*), superlative (*the youngest*) | Item 1: listen, then choose which of 3 people is Sarah. Item 2: listen, choose Richard. Item 3: listen, choose the number on William's box. After each choice the child rates "How sure are you?" (1-3 stars) | Result shown next to the star rating ("You were very sure and you were right!"). Wrong answer: Pip help step 1 (what to listen for), step 2 (key word), step 3 (show the words of the message). Max 2 plays per clip | **Number: 450** (heard in item 3) | All 3 items answered, then room summary, then map. A wrong answer never blocks: after help step 3 the transcript is visible |
| 2. Engine Room (Inclusion) | Follow a short written set of instructions and find specific information | Reading. engine F, repair F, turn off / turn on F, wait M, minute F, plastic F, piece F, broken F, screen F, left F. Sequencing: first M, next F, then S. Grammar: imperatives, *must* M | Chooses how to read the repair text: text only / text + pictures / listen / listen + highlighted words. Answers the same 3 questions in every mode | Correct: one-line reason quoting the text. Wrong: Pip step 1 (which step to read), step 2 (key word), step 3 (highlights the right sentence, not the answer) | **Word: MOON** (shown on the screen in step 5 of the text; question 3 asks for it) | 3 questions answered, then summary, then map. The child can change reading mode at any time without losing answers |
| 3. Garden Room (Motivation) | Complete a text with one word; write a short message to Earth | Reading and Writing. garden S, plant M, grow M, water S, insect F, leaf M, postcard F, dear F, planet F, tomorrow F. Grammar: past simple (*found*, *saw*), present simple, *going to* | Chooses a path: Easy / Hard / Very hard (shown as bronze, silver and gold medals). Task A: 4 gaps, one word each. Task B: postcard to Earth from a word box | Streak counter ("3 right answers!"), progress bar, room prize "Garden Star" plus the path medal. Wrong: Pip help steps. Very hard postcard is checked for words used from the box and length, never marked wrong | **Symbol: leaf** (the answer to gap 4 is "leaf"; the leaf symbol appears) | Both tasks done, then summary. The child can change path between tasks |
| 4. Science Room (Feedback) | Build correct sentences; use the past simple of irregular verbs in a diary | Writing and grammar. Past simple irregular (*sent, woke, ate, went, saw*), present perfect with *already*, comparatives and superlatives (*smaller than*, *the heaviest*). astronaut F, message M, moon M, diary F, light F, purple S | Item 1 and 2: put words in order (2 variants each). Item 3: complete a diary with 4 verbs (type one word each) | Graduated help that never shows the answer: 1 what to check, 2 grammar pointer, 3 first word or first letter. Correct: one-line "why". Unlimited tries, no point loss for help beyond the first-try bonus | **Colour: purple** (from the diary: "I saw a purple light on the radio") | 3 items done, then summary |
| 5. Robot Room (Ethics and technology) | Choose responsible actions with computers, robots and classmates; check a robot's information against a text | Reading and Listening. robot S, computer S, mistake M, homework M, together F, kind F, fair M, *should* F, *must* M, information F, round M, circle M | Dilemma 1 (listen): Pip offers to write your message for you. Dilemma 2 (listen and read): Pip says the moon is bigger than the Earth; the child reads a short text and decides. Dilemma 3 (read): Holly asks to write your answers in her book | Every option gets a reason. The kind and fair choice is confirmed with why. The other choices get a gentle "Think again" and a reason, never a "wrong" screen | **Shape: circle** (from the text: "The moon is round, like a ball") | 3 dilemmas done, then summary |
| Final: Radio Room (all) | Bring the pieces together; understand a spoken message with times | Mix. radio S, midnight F, midday F, tonight F, tomorrow F, p.m. F, hear F, team F | Places the 5 secret pieces into 5 slots (one slot per room, in room order). Then listens to the Earth message and answers 1 question about when the next call is | Wrong slot: Pip asks "Which room gave you a number?" Listening: Pip help steps as in Room 1 | Radio repaired | End screen: total score, prizes, Listening / Reading / Writing summary, "words to look at again". No ranking |

## Timing (realistic)

[Likely] A confident A2 reader needs about 25-30 minutes. A child with reading or attention difficulties needs 35-45 minutes. The timer never ends the game: at zero it says something kind and switches to practice mode (no timer), so every child reaches the end.

| Room | Items | Estimated minutes |
|---|---|---|
| Start + map | - | 1-2 |
| 1 Message Room | 3 | 5-7 |
| 2 Engine Room | 3 + reading | 5-8 |
| 3 Garden Room | 2 tasks | 6-9 |
| 4 Science Room | 3 | 5-8 |
| 5 Robot Room | 3 | 4-6 |
| Radio Room + end | 2 | 3-4 |

## Open decisions (accept or reject each)

1. **Secret pieces go into labelled slots in room order.** The spec says "enter the 5 clues in the right order" but never tells the child the order, which breaks the dependency rule. The Radio Room shows five slots labelled with the room names and icons. The child places each piece from "My pieces".
2. **Pieces are collected, not remembered.** Each piece is shown when the room ends and kept in "My pieces". The final step is placing, not recalling from memory. This protects children with working-memory or attention difficulties.
3. **Play limits.** Max 2 plays applies to Room 1 items and the final Earth message (exam-like). Room 2 listen modes, Room 5 clips and practice mode allow unlimited plays. The limit can be changed per clip in `audioManifest.js`.
4. **Room names changed to words on the list.** "Control", "Workshop", "Dome", "Lab" and "AI Bay" are not in the PDF. The proposed names are Message Room, Engine Room, Garden Room, Science Room, Robot Room and Radio Room (kept). The original names stay in the design documents so the university story is unchanged.
5. **Other story words replaced.** None of these are in the PDF, so they are replaced on screen:
   - clue becomes "secret piece"
   - hint becomes "help"
   - badge becomes "prize"
   - mission becomes "job"
   - Commander becomes "Helen, the station manager"
   - Earth Control becomes "the team on Earth"
   - check becomes "Is Pip right?"
   - copy becomes "write your answers in my book"
   - Training mode becomes "practice mode"
6. **Allowed exceptions (names only):** *Pip*, *Alpha*, *Cadet*, and the game title *Radio Silence* are story names. They are never tested. Every other English word on screen must pass `npm run check-vocab`.
7. **Badge names changed.** "Listener", "Reader", "Writer", "Smart", "Helper" and "Responsible" are not in the PDF. The prizes are: Great Ears (Room 1), Careful Eyes (Room 2), Garden Star (Room 3), Word Engineer (Room 4), Kind and Fair (Room 5) and Radio Engineer (end).
8. **Path names.** "Bronze" is not in the PDF. The paths show bronze, silver and gold medal pictures, with the labels "Easy", "Hard" and "Very hard".
9. **"Listen + highlighted words"** highlights key words in the text all the time. Word-by-word highlighting in time with the audio would need timings from the final recordings, so it is out of scope unless you ask for it after recording.
10. **Item variants.** The Room 4 word-order items have two variants each, chosen at random. Audio items have one version, to keep recording work reasonable. Answer options are shuffled everywhere.
11. **Images.** Teachers supply images in `public/img/` (list in `src/content/imageManifest.js`). Until then each image shows a labelled placeholder with a text description, so all items stay answerable.
