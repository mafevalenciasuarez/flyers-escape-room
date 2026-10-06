import { useState } from 'react';
import { imageById } from '../content/index.js';
import { asset } from '../lib/util.js';
import Icon from './Icon.jsx';

// Shows a teacher-supplied picture, or a clear placeholder with the description
// when the file is not there yet. Never blocks the task.
export default function ImageSlot({ id, decorative = false }) {
  const meta = imageById[id];
  const [failed, setFailed] = useState(false);
  if (!meta) return null;
  if (failed) {
    return (
      <div className="image-placeholder" role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : meta.alt}>
        <Icon name="picture" size={32} />
        <span aria-hidden={decorative ? undefined : true}>{meta.alt}</span>
      </div>
    );
  }
  return (
    <img
      className="image-slot"
      src={asset(`img/${meta.file}`)}
      alt={decorative ? '' : meta.alt}
      width={meta.width || undefined}
      height={meta.height || undefined}
      onError={() => setFailed(true)}
      loading="eager"
      decoding="async"
    />
  );
}
