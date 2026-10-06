import { useCallback, useState } from 'react';

// Graduated help: every wrong try or "Help, Pip!" press moves one step up the
// ladder (max 3). The ladder never contains the answer itself.
export default function useHelp(hints = []) {
  const [level, setLevel] = useState(0);
  const [wrongs, setWrongs] = useState(0);
  const [helps, setHelps] = useState(0);
  const max = hints.length;

  const onWrong = useCallback(() => {
    setWrongs((w) => w + 1);
    setLevel((l) => Math.min(max, l + 1));
  }, [max]);

  const askHelp = useCallback(() => {
    setHelps((h) => h + 1);
    setLevel((l) => Math.min(max, l + 1));
  }, [max]);

  const reset = useCallback(() => {
    setLevel(0);
    setWrongs(0);
    setHelps(0);
  }, []);

  return { level, wrongs, helps, hint: level > 0 ? hints[level - 1] : null, onWrong, askHelp, reset, maxed: level >= max };
}
