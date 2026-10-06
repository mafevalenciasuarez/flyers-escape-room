// Room 3 - Garden Room (spec name: Garden Dome)
// Dimension: Motivation. Skill: Reading and Writing.
// Three paths with the same learning goal:
//   easy     = choose from 3 words for every gap
//   hard     = one dropdown in each gap, options from the word box
//   veryhard = write the word in the gap
// DRAFT: waiting for teacher approval of language level.

export default {
  id: 'room3',
  order: 3,
  name: 'Garden Room',
  specName: 'Garden Dome',
  dimension: 'Motivation',
  skill: 'writing',
  icon: 'plant',
  prize: { id: 'garden-star', name: 'Garden Star', icon: 'star' },
  introAudio: 'r3_intro',
  intro: 'Choose your path. Every path is good.',
  introEs: 'Elige tu camino. Todos los caminos están bien.',
  helpCostsPoints: true,
  targetMinutes: 8,
  paths: [
    { id: 'easy', label: 'Easy', labelEs: 'Fácil', medal: 'bronze', description: 'Choose from 3 words.', descriptionEs: 'Elige entre 3 palabras.' },
    { id: 'hard', label: 'Hard', labelEs: 'Difícil', medal: 'silver', description: 'Choose from a word box.', descriptionEs: 'Elige de una caja de palabras.' },
    { id: 'veryhard', label: 'Very hard', labelEs: 'Muy difícil', medal: 'gold', description: 'Write the words.', descriptionEs: 'Escribe tú las palabras.' },
  ],
  clue: {
    type: 'symbol',
    value: 'leaf',
    label: 'leaf',
    icon: 'leaf',
    sourceItem: 'r3_gaps',
    evidence: 'leaf',
  },
  items: [
    {
      id: 'r3_gaps',
      type: 'gapfill',
      skill: 'reading',
      instruction: 'Read the text. Write one word in every space.',
      instructionEs: 'Lee el texto. Escribe una palabra en cada espacio.',
      title: 'Our space garden',
      parts: [
        'Our space garden is very special. Plants can\'t grow without ',
        { gap: 'g1' },
        '. Every morning, we ',
        { gap: 'g2' },
        ' the plants water. Last week, Oliver ',
        { gap: 'g3' },
        ' a small green insect. It was on a ',
        { gap: 'g4' },
        '! Now the insect is our pet.',
      ],
      bank: ['water', 'give', 'found', 'leaf', 'find', 'sand', 'gives'],
      gaps: {
        g1: {
          answers: ['water'],
          options: ['water', 'sand', 'paper'],
          why: 'Yes! Plants need water.',
          hints: ['What do plants need?', 'You can drink it.', 'It starts with "w".'],
        },
        g2: {
          answers: ['give'],
          options: ['give', 'gives', 'giving'],
          why: 'Yes! After "we", the word has no "s": we give.',
          hints: ['Look at the word before the space: "we".', 'After "we", the word has no "s".', 'It starts with "g".'],
        },
        g3: {
          answers: ['found'],
          options: ['found', 'find', 'finds'],
          why: 'Yes! "Last week" is in the past. Find - found.',
          hints: ['Look: "Last week". Is it now or in the past?', 'Use the past of "find". It doesn\'t end in -ed.', 'It starts with "f".'],
        },
        g4: {
          answers: ['leaf'],
          options: ['leaf', 'leg', 'lamp'],
          why: 'Yes! Insects like to sit on a leaf.',
          hints: ['Where can an insect sit on a plant?', 'It is a green part of a plant.', 'It starts with "l".'],
        },
      },
      words: ['garden', 'plant', 'grow', 'water', 'insect', 'leaf', 'found'],
    },
    {
      id: 'r3_postcard',
      type: 'postcard',
      skill: 'writing',
      instruction: 'Write a postcard to Earth. Use the words in the box.',
      instructionEs: 'Escribe una postal a la Tierra. Usa las palabras de la caja.',
      opening: 'Dear Earth,',
      closing: 'From, Cadet',
      // easy and hard paths complete these sentences
      frames: [
        {
          id: 'f1',
          before: 'Yesterday I ',
          after: ' a beautiful planet from the window.',
          answers: ['saw'],
          options: ['saw', 'see', 'seeing'],
          why: 'Yes! "Yesterday" is in the past: see - saw.',
          hints: ['Look at the first word: "Yesterday".', 'Use the past of "see". It doesn\'t end in -ed.', 'It starts with "s".'],
        },
        {
          id: 'f2',
          before: 'The space garden is ',
          after: ' than my garden at home.',
          answers: ['bigger'],
          options: ['bigger', 'big', 'biggest'],
          why: 'Yes! Before "than", we say "bigger".',
          hints: ['Look at the word after the space: "than".', 'Use big + -er. Be careful with the "g".', 'It starts with "b".'],
        },
        {
          id: 'f3',
          before: 'Tomorrow I\'m going to ',
          after: ' the radio.',
          answers: ['repair'],
          options: ['repair', 'repaired', 'repairing'],
          why: 'Yes! After "going to", the word has no ending: repair.',
          hints: ['Look at the words before the space: "going to".', 'After "going to", the word has no ending.', 'It starts with "r".'],
        },
      ],
      bank: ['saw', 'see', 'bigger', 'biggest', 'repair', 'repaired'],
      // very hard path: free writing, checked for length and box words, never marked wrong
      free: {
        instruction: 'Write 3 sentences to Earth. Use 3 words from the box.',
        instructionEs: 'Escribe 3 oraciones a la Tierra. Usa 3 palabras de la caja.',
        box: ['space', 'planet', 'garden', 'yesterday', 'tomorrow', 'repair', 'saw', 'going to'],
        minWords: 12,
        minBoxWords: 3,
        starters: ['Yesterday I saw ...', 'The garden is ...', 'Tomorrow I\'m going to ...'],
        why: 'Great writing! You used words from the box.',
        hints: [
          'Write a little more. Try 3 sentences.',
          'Use 3 words from the box. Look at the box again.',
          'Start with: "Yesterday I saw ..."',
        ],
      },
      words: ['postcard', 'dear', 'planet', 'bigger', 'going to', 'repair'],
    },
  ],
};
