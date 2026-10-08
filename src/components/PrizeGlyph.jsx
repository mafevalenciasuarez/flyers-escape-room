import badgeGreatEars from '../assets/svg/badge-great-ears.svg';
import badgeCarefulEyes from '../assets/svg/badge-careful-eyes.svg';
import badgeGardenStar from '../assets/svg/badge-garden-star.svg';
import badgeKindAndFair from '../assets/svg/badge-kind-and-fair.svg';
import badgeRadioEngineer from '../assets/svg/badge-radio-engineer.svg';
import badgeWordEngineer from '../assets/svg/badge-word-engineer.svg';
import Icon from './Icon.jsx';

// Decorative medals. The prize name next to the picture is the text.
// Width and height keep the portrait ratio; CSS sets the on-screen size.
const BADGES = {
  'great-ears': badgeGreatEars,
  'careful-eyes': badgeCarefulEyes,
  'garden-star': badgeGardenStar,
  'word-engineer': badgeWordEngineer,
  'kind-and-fair': badgeKindAndFair,
  'radio-engineer': badgeRadioEngineer,
};

export default function PrizeGlyph({ prize, size = 40 }) {
  const src = BADGES[prize?.id];
  if (src) return <img className="prize-badge" src={src} alt="" width={262} height={363} />;
  return <Icon name={prize?.icon || 'star'} size={size} />;
}
