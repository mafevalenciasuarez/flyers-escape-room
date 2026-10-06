// Final - Radio Room. All dimensions. Skill: mix.
// Step 1: place the 5 secret pieces in the slots (one slot per room, in room order).
// Step 2: listen to the message from Earth and answer one question.
// DRAFT: waiting for teacher approval of language level.

export default {
  id: 'final',
  order: 6,
  name: 'Radio Room',
  specName: 'Radio Room',
  dimension: 'All',
  skill: 'listening',
  icon: 'radio',
  prize: { id: 'radio-engineer', name: 'Radio Engineer', icon: 'radio' },
  introAudio: 'final_intro',
  intro: 'Put your secret pieces in the right places.',
  introEs: 'Pon tus piezas secretas en los lugares correctos.',
  helpCostsPoints: true,
  // Slots use the clue from each earlier room, in this order.
  slots: ['room1', 'room2', 'room3', 'room4', 'room5'],
  place: {
    instruction: 'Choose a piece. Then choose the room it came from.',
    instructionEs: 'Elige una pieza. Luego elige la sala de donde vino.',
    wrong: 'Oh, not there. Which room gave you this piece?',
    wrongEs: 'Mmm, ahí no. ¿Qué sala te dio esta pieza?',
    hints: [
      'Look at the map. Which room gave you a number?',
      'You found the word in the Engine Room.',
      'The leaf was in the Garden Room. The colour was in the Science Room.',
    ],
    done: 'Now listen to the message from Earth.',
  },
  items: [
    {
      id: 'final_q1',
      type: 'choice',
      skill: 'listening',
      audio: 'final_earth',
      instruction: 'Listen. When can the team on Earth talk to you again?',
      instructionEs: 'Escucha. ¿Cuándo puede volver a hablar contigo el equipo de la Tierra?',
      options: [
        { id: 'a', text: 'tonight, at midnight' },
        { id: 'b', text: 'tomorrow, at midday' },
        { id: 'c', text: 'today, at 7 p.m.' },
      ],
      answer: 'a',
      why: 'Yes! Michael says: "We can talk again tonight, at midnight."',
      hints: [
        'Listen again. Listen to the end of the message.',
        'Two times are not OK for Michael. Listen for "can\'t" and "busy".',
        'Read the words of the message. Then look at the answers again.',
      ],
      showTranscriptOnHint: 3,
      words: ['midnight', 'midday', 'tonight', 'tomorrow', 'p.m.'],
    },
  ],
  endAudio: 'end_helen',
};
