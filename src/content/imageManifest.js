// Every picture the game shows. Teachers put the files in public/img/ with these names.
// Until a file exists, the game shows a placeholder with the "alt" text, so every item
// can still be answered. "brief" is for the person drawing the picture (not shown in the game).
// Use PNG, JPG, WEBP or SVG. Square pictures (for example 600 x 600) work best.

const images = [
  {
    id: 'r1_sarah_a',
    file: 'r1-q1-curly-glasses-torch.jpg',
    width: 1152,
    height: 864,
    room: 'room1',
    alt: 'A woman with long curly hair and glasses. She is holding a torch.',
    brief: 'Answer picture. Same woman style in all three Sarah pictures. Long CURLY hair, GLASSES, holding a TORCH.',
  },
  {
    id: 'r1_sarah_b',
    file: 'r1-q1-straight-glasses-torch.jpg',
    width: 1152,
    height: 864,
    room: 'room1',
    alt: 'A woman with long straight hair and glasses. She is holding a torch.',
    brief: 'Distractor. Long STRAIGHT hair, GLASSES, holding a TORCH.',
  },
  {
    id: 'r1_sarah_c',
    file: 'r1-q1-curly-noglasses-key.jpg',
    width: 1152,
    height: 864,
    room: 'room1',
    alt: 'A woman with long curly hair. She has not got glasses. She is holding a key.',
    brief: 'Distractor. Long CURLY hair, NO glasses, holding a KEY.',
  },
  {
    id: 'r1_richard_a',
    file: 'r1-q2-beard-nomoustache-window.jpg',
    width: 1152,
    height: 864,
    room: 'room1',
    alt: 'A man with a short beard and no moustache. He is looking out of the window at the Earth.',
    brief: 'Answer picture. Short BEARD, NO moustache, SITTING next to a WINDOW with the Earth outside.',
  },
  {
    id: 'r1_richard_b',
    file: 'r1-q2-beard-moustache-window.jpg',
    width: 1152,
    height: 864,
    room: 'room1',
    alt: 'A man with a short beard and a moustache. He is looking out of the window at the Earth.',
    brief: 'Distractor. Short BEARD and a MOUSTACHE, SITTING next to a WINDOW.',
  },
  {
    id: 'r1_richard_c',
    file: 'r1-q2-beard-nomoustache-screen.jpg',
    width: 1152,
    height: 864,
    room: 'room1',
    alt: 'A man with a short beard and no moustache. He is standing next to the door.',
    brief: 'Distractor. Short BEARD, NO moustache, STANDING next to a DOOR.',
  },
  {
    id: 'r2_step1',
    file: 'r2-step1-turn-off-engine.jpg',
    width: 1138,
    height: 850,
    room: 'room2',
    alt: 'A hand turns off the engine. The engine is very hot.',
    brief: 'Engine with an OFF control being pressed, and a small clock showing 5 minutes. Show "hot" (steam lines).',
  },
  {
    id: 'r2_step2',
    file: 'r2-step2-open-small-door.jpg',
    width: 1138,
    height: 850,
    room: 'room2',
    alt: 'A hand opens the small metal door on the left. The big door on the right is closed.',
    brief: 'Engine with a SMALL metal door on the LEFT (open) and a BIG door on the RIGHT (closed).',
  },
  {
    id: 'r2_step3',
    file: 'r2-step3-three-pieces.jpg',
    width: 1138,
    height: 850,
    room: 'room2',
    alt: 'Inside the engine there are three pieces of plastic: a blue one, a green one and a yellow one. The yellow one is broken.',
    brief: 'Inside the engine: three plastic pieces, blue, green and yellow. The YELLOW one has a crack.',
  },
  {
    id: 'r5_holly',
    file: 'r5_holly.png',
    room: 'room5',
    alt: 'Holly, a girl in a space uniform, is holding her homework book.',
    brief: 'Friendly classmate Holly (about 10 years old) in a space uniform, holding an empty homework book, looking worried.',
  },
];

export const imageById = Object.fromEntries(images.map((i) => [i.id, i]));
export default images;
