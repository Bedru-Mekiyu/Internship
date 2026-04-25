import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export const useThemeModeSync = () => {
  return useSyncExternalStore(
    emptySubscribe,
    () => localStorage.getItem('themeMode'),
    () => null,
  );
};

export const setThemeModeStorage = (mode: string | null) => {
  if (mode) {
    localStorage.setItem('themeMode', mode);
  } else {
    localStorage.removeItem('themeMode');
  }
  window.dispatchEvent(new Event('thememodeupdate'));
};