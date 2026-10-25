// src/hooks/useAiEnabled.js
// Asks the backend once whether AI features are configured, then remembers the answer.
import { useEffect, useState } from 'react';
import { getAiStatus } from '../services/api';

let cached; // undefined = not asked yet, Promise<boolean> afterwards

export const useAiEnabled = () => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let ignore = false;
    cached = cached || getAiStatus();
    cached.then((v) => !ignore && setEnabled(v));
    return () => { ignore = true; };
  }, []);
  return enabled;
};
