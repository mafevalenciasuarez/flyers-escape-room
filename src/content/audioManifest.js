// Every audio clip in the game. Teachers record the transcript exactly and save the
// file in public/audio/ with this filename. Missing files never stop the game:
// the player shows the transcript instead.
// maxPlays: number of plays allowed (null = no limit). Practice mode removes all limits.

const clips = [
  {
    id: 'intro_helen',
    file: 'intro_helen.mp3',
    room: 'start',
    speaker: 'Helen (station manager) - Teacher A',
    seconds: 30,
    maxPlays: null,
    transcript:
      'Hello, Cadet! I\'m Helen, the manager of Space Station Alpha. We\'ve got a big problem. Our radio is broken, and the team on Earth can\'t hear us. Can you help? Go to five rooms. In every room, you can find a secret piece. Then go to the Radio Room and repair the radio. You\'ve got thirty minutes. Pip, our robot, can help you. Let\'s start!',
  },
  {
    id: 'r1_intro',
    file: 'r1_intro.mp3',
    room: 'room1',
    speaker: 'Helen - Teacher A',
    seconds: 12,
    maxPlays: null,
    transcript:
      'This is the Message Room. Here you can meet our team. Listen carefully and find the right person. You can listen two times.',
  },
  {
    id: 'r1_q1',
    file: 'r1_q1.mp3',
    room: 'room1',
    speaker: 'Helen - Teacher A',
    seconds: 15,
    maxPlays: 2,
    transcript:
      'Cadet, can you see Sarah? She\'s our engineer. She\'s got long, curly hair, and she\'s wearing glasses. Oh, and look! She\'s holding a torch.',
  },
  {
    id: 'r1_q2',
    file: 'r1_q2.mp3',
    room: 'room1',
    speaker: 'Helen - Teacher A',
    seconds: 15,
    maxPlays: 2,
    transcript:
      'Now find Richard. He\'s our pilot. He\'s got a short beard, but he hasn\'t got a moustache. He\'s sitting next to the window, and he\'s looking at the Earth.',
  },
  {
    id: 'r1_q3',
    file: 'r1_q3.mp3',
    room: 'room1',
    speaker: 'Helen - Teacher A; William (mechanic) - Teacher B',
    seconds: 20,
    maxPlays: 2,
    transcript:
      'Helen: This is William. He\'s our mechanic, and he\'s the youngest person on the station. William, what\'s the number on your metal box? William: It\'s four hundred and fifty. Not four hundred and fifteen. Four hundred and fifty! Helen: Thank you, William. Cadet, remember this number. It\'s a secret piece!',
  },
  {
    id: 'r2_manual',
    file: 'r2_manual.mp3',
    room: 'room2',
    speaker: 'Narrator - Teacher B',
    seconds: 40,
    maxPlays: null,
    transcript:
      'How to repair the engine. First, turn off the engine. Then wait for five minutes, because the engine is very hot. Next, open the small metal door on the left. Don\'t open the big door on the right! Inside, you can see three pieces of plastic: a blue one, a green one and a yellow one. The broken piece is the yellow one. Take out the broken piece and put the new piece in its place. Close the door and turn on the engine. When the engine works, the screen shows a secret word: MOON.',
  },
  {
    id: 'r3_intro',
    file: 'r3_intro.mp3',
    room: 'room3',
    speaker: 'Pip (robot) - Teacher B',
    seconds: 12,
    maxPlays: null,
    transcript:
      'Welcome to the Garden Room! Choose your path: easy, hard or very hard. Every path is good. You can change your path later.',
  },
  {
    id: 'r4_intro',
    file: 'r4_intro.mp3',
    room: 'room4',
    speaker: 'Pip (robot) - Teacher B',
    seconds: 12,
    maxPlays: null,
    transcript:
      'This is the Science Room. Use the words and make sentences. Don\'t worry about mistakes. You can try again, and I can help you!',
  },
  {
    id: 'r5_offer',
    file: 'r5_offer.mp3',
    room: 'room5',
    speaker: 'Pip (robot) - Teacher B',
    seconds: 12,
    maxPlays: null,
    transcript:
      'Cadet, writing is boring! I can write your message to Earth for you. Then you can play a game. OK?',
  },
  {
    id: 'r5_fact',
    file: 'r5_fact.mp3',
    room: 'room5',
    speaker: 'Pip (robot) - Teacher B',
    seconds: 10,
    maxPlays: null,
    transcript:
      'Here\'s some information for your message, Cadet. The moon is bigger than the Earth! Write that in your message.',
  },
  {
    id: 'r5_friend',
    file: 'r5_friend.mp3',
    room: 'room5',
    speaker: 'Holly (classmate) - Teacher A',
    seconds: 10,
    maxPlays: null,
    transcript:
      'Cadet, I didn\'t do my homework, and the lesson starts in five minutes. Can I write your answers in my book? Please?',
  },
  {
    id: 'final_intro',
    file: 'final_intro.mp3',
    room: 'final',
    speaker: 'Helen - Teacher A',
    seconds: 12,
    maxPlays: null,
    transcript:
      'You\'re in the Radio Room! Put your five secret pieces in the right places. Then listen to the message from Earth.',
  },
  {
    id: 'final_earth',
    file: 'final_earth.mp3',
    room: 'final',
    speaker: 'Michael (team on Earth) - Teacher B',
    seconds: 30,
    maxPlays: 2,
    transcript:
      'Hello, Space Station Alpha! This is Michael, on Earth. We can hear you! Thank you, Cadet. The radio is working again. Now, when can we talk again? We can\'t talk at seven p.m. today, sorry. And we\'re busy at midday tomorrow. So we can talk again tonight, at midnight. Goodbye!',
  },
  {
    id: 'end_helen',
    file: 'end_helen.mp3',
    room: 'final',
    speaker: 'Helen - Teacher A',
    seconds: 12,
    maxPlays: null,
    transcript:
      'Well done, Cadet! You repaired the radio. The team on Earth can hear us now. Thank you! You\'re a great space engineer.',
  },
];

export const audioById = Object.fromEntries(clips.map((c) => [c.id, c]));
export default clips;
