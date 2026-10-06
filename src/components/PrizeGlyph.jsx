import badgeGardenStar from '../assets/svg/badge-garden-star.svg';
import Icon from './Icon.jsx';

// The badge is decorative. The prize name next to it is the text.
export default function PrizeGlyph({ prize, size = 40 }) {
  if (prize?.id === 'garden-star') {
    return <img className="prize-badge" src={badgeGardenStar} alt="" width={size} height={size} />;
  }
  return <Icon name={prize?.icon || 'star'} size={size} />;
}
