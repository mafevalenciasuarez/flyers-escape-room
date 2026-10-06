# Design notes: Radio Silence on Space Station Alpha

Status: DRAFT. Written for the teachers' Spanish design document. No references are included on purpose.

Each room focuses on one didactic dimension and one Flyers skill. For every room: the dimension, the design decisions, and the pedagogical reason for each decision.

---

## Whole game (applies to every room)

**Dimension: inclusion and attention, across the game**

- **Decision:** one task per screen, no auto-advance, the same layout in every room.
  - **Reason:** fewer things compete for attention. Children with attention difficulties always know where to look and what to press next.
- **Decision:** one global 30-minute soft timer only. There are no timers on items. When the time ends, the game switches to practice mode ("Practice time"): the timer is hidden, the play limits are removed, and the content stays the same.
  - **Reason:** timers on items mostly measure reading speed, not understanding, which is unfair for slow readers. A kind message and practice mode mean every child can finish the story.
  - **Note:** the spec calls this "Training mode". The word "training" is not in the Flyers list, so the child sees "Practice time".
- **Decision:** a Settings panel that can always be reached. It has three text sizes, line spacing, a font choice (Lexend by default, Atkinson Hyperlegible, or system), high contrast, sounds (off by default), and Calm mode.
  - **Reason:** each child adjusts the screen to their needs without asking for help or being singled out.
- **Decision:** Calm mode replaces the minutes with a progress bar.
  - **Reason:** a counting clock can cause anxiety. A bar still shows how much time is left without numbers.
- **Decision:** the optional "Ayuda en español" toggle translates instructions and buttons only, never items or the words under test.
  - **Reason:** children with a low English level understand what to do, but the English task still measures English.
- **Decision:** all English text uses only words from the official Starters, Movers and Flyers lists. A script checks this (`npm run check-vocab`).
  - **Reason:** the child is never stopped by words they cannot know. Every word they meet is useful for the exam.
- **Decision:** Pip, the robot, gives help in up to three steps and never gives the answer.
  - **Reason:** the child stays the one who solves the task. Each step gives a little more support, so the child gets only as much help as they need.
- **Decision:** points are 10 for a first try and 5 after help, and are never negative. There is no ranking between children.
  - **Reason:** the score rewards effort and learning, not only speed or luck. Mistakes are a normal part of the game, not a punishment.
- **Decision:** answer options are shuffled, and Room 4 has two versions of each word-order item.
  - **Reason:** this makes copying from a neighbour harder without adding timers or other pressure.
- **Decision:** each room gives one secret piece, which goes on a card the child keeps. The Radio Room asks the child to put the pieces in room order.
  - **Reason:** the final task depends on what the child learned, not on memory or guessing. A script checks this rule (`npm run check-clues`).

---

## Room 1: Message Room

**Dimension: Evaluation. Skill: Listening (Part 1 style)**

- **Decision:** the child listens to short descriptions of crew members and chooses the right person from three pictures.
  - **Reason:** this copies a real Flyers listening task, so the practice transfers directly to the exam.
- **Decision:** after each answer, the child chooses how sure they were (1 to 3 stars). The game then shows whether that matched their result.
  - **Reason:** comparing confidence with the real result builds self-evaluation. The child learns to notice when they are guessing and when they really know.
- **Decision:** each clip can play twice. The transcript is off by default and is offered only as the third help step.
  - **Reason:** two plays copy the exam. Keeping the transcript for later means the task stays a listening task, with support for children who need it.
- **Decision:** the secret piece (the number 450) is heard in the last item ("four hundred and fifty").
  - **Reason:** big numbers are on the Flyers list. The child only gets the piece by listening carefully.

## Room 2: Engine Room

**Dimension: Inclusion. Skill: Reading**

- **Decision:** a short repair manual with four ways to read it: text only, text with pictures, listen, or listen with key words highlighted. The questions are the same in every mode, and the child can change mode at any time.
  - **Reason:** children with reading difficulties reach the same content as everyone else. Comprehension is assessed, not decoding speed, and no one gets an easier task.
- **Decision:** key words are highlighted all at once, not in time with the audio.
  - **Reason:** audio timing is not known until the teachers record. Static highlighting always works and does not move on screen.
- **Decision:** the third help step outlines the step of the manual where the answer is ("Look here").
  - **Reason:** this teaches the child to scan a text for information, which is a useful exam strategy, without giving the answer.
- **Decision:** the secret piece is a word (MOON) that the child finds in the manual.
  - **Reason:** the piece comes from reading the text, so the reading is the key.

## Room 3: Garden Room

**Dimension: Motivation. Skill: Reading and Writing**

- **Decision:** the child chooses a path: Easy, Hard or Very hard (bronze, silver or gold medal). All paths have the same learning goal: one-word gaps in a short garden text (past simple and plant words), then a postcard to Earth.
  - **Reason:** choice gives the child a sense of control, and challenge at the right level keeps them interested. No path blocks the story, and every path gives the same secret piece.
- **Decision:** support goes down with each path:
  - **Easy:** three options for every gap.
  - **Hard:** one shared word box, with extra words.
  - **Very hard:** the child types every word, then writes a free postcard (at least 12 words and 3 box words, with sentence starters). The free postcard is never marked wrong.
  - **Reason:** the same skill is practised with less support at each level. Stronger children are stretched, and weaker children can still succeed.
- **Decision:** a streak counter, a progress bar, a medal and a room prize.
  - **Reason:** visible progress and small rewards keep effort going over a 30-minute game. They reward finishing, not beating others.
- **Decision:** the secret piece is a symbol (a leaf) taken from the gap-fill text.
  - **Reason:** the piece comes from reading, the same on every path.

## Room 4: Science Room

**Dimension: Feedback. Skill: Writing and grammar**

- **Decision:** the child puts words in order to make a sentence, then completes a diary with past simple verbs.
  - **Reason:** these copy Flyers writing tasks and practise word order, comparatives, superlatives, the present perfect and the past simple.
- **Decision:** after a wrong answer, help comes in three steps: what to think about, a grammar pointer, then the first word or first letter. The answer is never shown, retries are unlimited, and help costs no points in this room.
  - **Reason:** the feedback teaches the rule instead of giving the solution. Because there is no penalty, children ask for help without fear.
- **Decision:** every correct answer gets a one-line "why".
  - **Reason:** the child connects the right answer to the grammar rule, so the rule can be used again.
- **Decision:** the Answer button stays off after a wrong answer until the child changes the sentence.
  - **Reason:** the child cannot try the same wrong answer again and again. They must think and change something.
- **Decision:** the secret piece is a colour (purple), read in the diary text.

## Room 5: Robot Room

**Dimension: Ethics and technology. Skill: Reading and Listening**

- **Decision:** three short dilemmas, each one heard and read:
  - Pip offers to do the task for the child.
  - Pip says something wrong, and the child checks it against a short text.
  - A friend asks to copy.
  - **Reason:** these are real situations children meet with AI tools and in class. The simple English keeps the focus on the decision.
- **Decision:** every option, right or wrong, shows a reason.
  - **Reason:** the child learns why one action is responsible, not only which button is correct. Kind feedback on the other options avoids shame.
- **Decision:** in the second dilemma, the child must use the text to show that Pip is wrong.
  - **Reason:** this models checking what a machine says against a trusted source, an important habit with AI.
- **Decision:** the secret piece is a shape (a circle). The text says the moon is "round".
  - **Reason:** the child reaches the piece by reading. The shape word is on the Flyers list.

## Radio Room (final)

**Dimension: all. Skill: mixed**

- **Decision:** the child puts the five pieces in the boxes in room order (labelled 1 to 5). If a piece goes in the wrong box, Pip gives a kind hint.
  - **Reason:** the task reviews the whole journey and uses only things the child already has. It cannot be done by trial and error alone, because the hints point back to each room.
- **Decision:** a last listening task (the message from Earth), then an end screen with:
  - the total score
  - prizes
  - a summary for listening, reading and writing
  - "words to look at again"
  - **Reason:** the summary turns the game into feedback the child and the teacher can use. The word list gives clear next steps without comparing children.
