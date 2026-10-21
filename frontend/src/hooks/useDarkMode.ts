import { useState, useEffect, useRef } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    return false;
  });

  const isFirstMount = useRef(true);

  useEffect(() => {
    const root = document.documentElement;

    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      return;
    }

    // Trigger smooth CSS color and background transition on toggle
    root.classList.add('theme-transitioning');
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(isDark));

    const timer = setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 320);

    return () => clearTimeout(timer);
  }, [isDark]);

  return { isDark, toggleDarkMode: () => setIsDark((prev) => !prev) };
}
