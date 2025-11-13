import { useState, useEffect } from 'react';

// Kleine Helferfunktion
function getIsVisible() {
  if (typeof document === 'undefined') return false; // Sicherstellen, dass wir im Browser sind
  return !document.hidden;
}

/**
 * Ein Hook, der 'true' zurückgibt, wenn die PWA im Vordergrund (sichtbar) ist,
 * und 'false', wenn sie minimiert oder der Tab im Hintergrund ist.
 */
export function useAppVisibility() {
  const [isAppVisible, setIsAppVisible] = useState(getIsVisible());

  useEffect(() => {
    function handleVisibilityChange() {
      setIsAppVisible(getIsVisible());
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Aufräumen, wenn der Hook nicht mehr verwendet wird
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Leeres Array, damit dies nur einmal beim Mounten passiert

  return isAppVisible;
}