import { useMemo, useState, useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { themeForPath, type ThemeMode } from '../../theme';

type Props = {
  children: ReactNode;
};

const emptySubscribe = () => () => {};

export default function ThemeRouteProvider({ children }: Props) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const [localThemeMode, setLocalThemeMode] = useState<ThemeMode | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useSyncExternalStore(emptySubscribe, () => {
    const stored = localStorage.getItem('themeMode');
    if (stored) setLocalThemeMode(stored as ThemeMode);
  }, () => {});

  const resolvedMode = useMemo<'light' | 'dark'>(() => {
    const userMode = localThemeMode || user?.preferences?.themeMode;
    if (userMode && userMode !== 'system') return userMode;
    if (userMode === 'system' || (!localThemeMode && !user?.preferences?.themeMode)) {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return systemPrefersDark ? 'dark' : 'light';
  }, [localThemeMode, user?.preferences?.themeMode, systemPrefersDark]);

  const muiTheme = useMemo(() => themeForPath(pathname, resolvedMode), [pathname, resolvedMode]);

  return (
    <ThemeProvider theme={muiTheme} key={muiTheme.palette.mode + pathname}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
