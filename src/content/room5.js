// Room 5 - Robot Room (spec name: AI Bay)
// Dimension: Ethics and technology. Skill: Reading and Listening.
// Every option has a reason. The best option is confirmed, the others get "Think again".
// DRAFT: waiting for teacher approval of language level.

export default {
  id: 'room5',
  order: 5,
  name: 'Robot Room',
  specName: 'AI Bay',
  dimension: 'Ethics and technology',
  skill: 'reading',
  icon: 'robot',
  prize: { id: 'kind-and-fair', name: 'Kind and Fair', icon: 'heart' },
  intro: 'Robots and friends ask you things. What should you do?',
  introEs: 'Robots y amigos te piden cosas. ¿Qué deberías hacer?',
  helpCostsPoints: true,
  targetMinutes: 5,
  clue: {
    type: 'shape',
    value: 'circle',
    label: 'circle',
    icon: 'circle',
    sourceItem: 'r5_d2',
    evidence: 'round',
  },
  items: [
    {
      id: 'r5_d1',
      type: 'dilemma',
      skill: 'listening',
      audio: 'r5_offer',
      speaker: 'Pip',
      instruction: 'Listen to Pip. What should you do?',
      instructionEs: 'Escucha a Pip. ¿Qué deberías hacer?',
      options: [
        {
          id: 'a',
          text: 'Yes, please! You write it, Pip.',
          reason: 'Then Pip does the work, and you don\'t learn. Think again!',
        },
        {
          id: 'b',
          text: 'No, thanks. I want to write it. Can you help me with one word?',
          reason: 'Yes! You do the work, so you learn. Pip can help, but you write.',
        },
        {
          id: 'c',
          text: 'No! Robots are horrible.',
          reason: 'Pip wants to help. You can say no, but be kind. Think again!',
        },
      ],
      answer: 'b',
      words: ['robot', 'help', 'learn', 'should'],
    },
    {
      id: 'r5_d2',
      type: 'dilemma',
      skill: 'reading',
      audio: 'r5_fact',
      speaker: 'Pip',
      instruction: 'Listen to Pip. Then read the text. Is Pip right?',
      instructionEs: 'Escucha a Pip. Luego lee el texto. ¿Tiene razón Pip?',
      text: 'The moon goes around the Earth. The moon is round, like a ball. It is much smaller than the Earth. About fifty moons can go inside the Earth!',
      options: [
        {
          id: 'a',
          text: 'Yes. Robots are always right.',
          reason: 'Robots and computers can make mistakes. Read the text again. Think again!',
        },
        {
          id: 'b',
          text: 'No. The text says the moon is smaller than the Earth.',
          reason: 'Yes! You read and found the answer. Robots and computers can make mistakes.',
        },
        {
          id: 'c',
          text: 'I don\'t know. I\'m going to write it in my message.',
          reason: 'Read first! The text has the answer. Think again!',
        },
      ],
      answer: 'b',
      words: ['moon', 'round', 'smaller than', 'mistake', 'computer'],
    },
    {
      id: 'r5_d3',
      type: 'dilemma',
      skill: 'listening',
      audio: 'r5_friend',
      speaker: 'Holly',
      image: 'r5_holly',
      instruction: 'Listen to Holly. What should you do?',
      instructionEs: 'Escucha a Holly. ¿Qué deberías hacer?',
      options: [
        {
          id: 'a',
          text: 'OK. Here\'s my book.',
          reason: 'Then Holly doesn\'t learn, and it isn\'t fair. Think again!',
        },
        {
          id: 'b',
          text: 'No, but I can help you. Let\'s do it together.',
          reason: 'Yes! Helping is kind, and Holly learns too.',
        },
        {
          id: 'c',
          text: 'No! Go away!',
          reason: 'You can say no, but be kind. Can you help Holly? Think again!',
        },
      ],
      answer: 'b',
      words: ['homework', 'together', 'kind', 'fair'],
    },
  ],
};
