import { useEffect, useState } from 'react';

let autoplayUnlocked = false;

export const useAutoplayUnlock = () => {
  const [ready, setReady] = useState(autoplayUnlocked);

  useEffect(() => {
    if (autoplayUnlocked) return;

    const unlock = () => {
      autoplayUnlocked = true;
      setReady(true);
    };

    const opts: AddEventListenerOptions = { once: true };
    window.addEventListener('pointerdown', unlock, opts);
    window.addEventListener('keydown', unlock, opts);

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  return ready;
};

