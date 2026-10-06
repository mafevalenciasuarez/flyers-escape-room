// Room 4 - Science Room (spec name: Science Lab)
// Dimension: Feedback. Skill: Writing / grammar.
// Help never shows the answer: 1 what to check, 2 grammar pointer, 3 first word or first letter.
// Unlimited tries. Help does not cost points in this room.
// DRAFT: waiting for teacher approval of language level.

export default {
  id: 'room4',
  order: 4,
  name: 'Science Room',
  specName: 'Science Lab',
  dimension: 'Feedback',
  skill: 'writing',
  icon: 'science',
  prize: { id: 'word-engineer', name: 'Word Engineer', icon: 'gear' },
  introAudio: 'r4_intro',
  intro: 'Use the words and make sentences. Don\'t worry about mistakes!',
  introEs: 'Ordena las palabras. ¡No te preocupes por los errores!',
  helpCostsPoints: false,
  targetMinutes: 7,
  clue: {
    type: 'colour',
    value: 'purple',
    label: 'purple',
    sourceItem: 'r4_q3',
    evidence: 'purple light',
  },
  items: [
    {
      id: 'r4_q1',
      type: 'order',
      skill: 'writing',
      instruction: 'Make a sentence. Use all the words.',
      instructionEs: 'Ordena las palabras. Forma una oración.',
      variants: [
        {
          id: 'A',
          tiles: ['yesterday', 'the', 'astronaut', 'a', 'sent', 'message'],
          answers: ['The astronaut sent a message yesterday.', 'Yesterday the astronaut sent a message.'],
          why: 'Yes! Who (the astronaut) + did what (sent) + what (a message) + when (yesterday).',
          hints: [
            'Think: who did something? What did they do?',
            'In the past: "sent" comes after the person.',
            'The first word is "The".',
          ],
          words: ['astronaut', 'sent', 'message', 'yesterday'],
        },
        {
          id: 'B',
          tiles: ['already', 'has', 'Pip', 'the', 'repaired', 'screen'],
          answers: ['Pip has already repaired the screen.'],
          why: 'Yes! has + already + repaired: Pip has already repaired the screen.',
          hints: [
            'Think: who did something? Start with the person.',
            '"already" goes between "has" and "repaired".',
            'The first word is "Pip".',
          ],
          words: ['already', 'has repaired', 'screen'],
        },
      ],
    },
    {
      id: 'r4_q2',
      type: 'order',
      skill: 'writing',
      instruction: 'Make a sentence. Use all the words.',
      instructionEs: 'Ordena las palabras. Forma una oración.',
      variants: [
        {
          id: 'A',
          tiles: ['than', 'the', 'moon', 'is', 'smaller', 'the', 'Earth'],
          answers: ['The moon is smaller than the Earth.'],
          why: 'Yes! smaller + than: The moon is smaller than the Earth.',
          hints: [
            'Think: which one is small, the moon or the Earth?',
            'We say: A is smaller than B.',
            'The first word is "The".',
          ],
          words: ['moon', 'smaller than', 'Earth'],
        },
        {
          id: 'B',
          tiles: ['the', 'is', 'box', 'this', 'heaviest', 'metal'],
          answers: ['This is the heaviest metal box.'],
          why: 'Yes! the + heaviest + thing: This is the heaviest metal box.',
          hints: [
            'Think: is it a question? No, it isn\'t. Start with "This" or "Is"?',
            'We say: the + heaviest + thing.',
            'The first word is "This".',
          ],
          words: ['heaviest', 'metal', 'box'],
        },
      ],
    },
    {
      id: 'r4_q3',
      type: 'gapfill',
      mode: 'type',
      skill: 'writing',
      instruction: 'Complete the diary. Write the words in the past.',
      instructionEs: 'Completa el diario. Escribe los verbos en pasado.',
      title: 'My diary',
      parts: [
        'Dear diary, today I ',
        { gap: 'd1', base: 'wake' },
        ' up at six a.m. I ',
        { gap: 'd2', base: 'eat' },
        ' breakfast with Pip. Then we ',
        { gap: 'd3', base: 'go' },
        ' to the Science Room. There, I ',
        { gap: 'd4', base: 'see' },
        ' a purple light on the radio. It was very strange!',
      ],
      gaps: {
        d1: {
          answers: ['woke'],
          why: 'Yes! wake - woke.',
          hints: ['Think: is it now or in the past?', '"wake" doesn\'t end in -ed in the past.', 'It starts with "w".'],
        },
        d2: {
          answers: ['ate'],
          why: 'Yes! eat - ate.',
          hints: ['Think: is it now or in the past?', '"eat" doesn\'t end in -ed in the past.', 'It starts with "a".'],
        },
        d3: {
          answers: ['went'],
          why: 'Yes! go - went.',
          hints: ['Think: is it now or in the past?', '"go" is very different in the past.', 'It starts with "w".'],
        },
        d4: {
          answers: ['saw'],
          why: 'Yes! see - saw.',
          hints: ['Think: is it now or in the past?', '"see" doesn\'t end in -ed in the past.', 'It starts with "s".'],
        },
      },
      words: ['diary', 'woke', 'ate', 'went', 'saw', 'purple', 'light'],
    },
  ],
};
