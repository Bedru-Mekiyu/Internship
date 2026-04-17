import { useMemo, type ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { themeForPath } from '../../theme';

type Props = {
  children: ReactNode;
};

export default function ThemeRouteProvider({ children }: Props) {
  const { pathname } = useLocation();
  const muiTheme = useMemo(() => themeForPath(pathname), [pathname]);

  return (
    <ThemeProvider theme={muiTheme} key={muiTheme.palette.primary.main}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
