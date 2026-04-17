import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render errors in the subtree and shows a recovery UI instead of a blank screen.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.assign('/');
  };

  override render() {
    if (this.state.hasError && this.state.error) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            px: 2,
            bgcolor: 'background.default',
          }}
        >
          <Stack spacing={2} sx={{ maxWidth: 480, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Something went wrong
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {this.state.error.message || 'An unexpected error occurred. You can reload the app or return home.'}
            </Typography>
            <Button variant="contained" onClick={this.handleReload} sx={{ alignSelf: 'center' }}>
              Reload LearnSpace
            </Button>
          </Stack>
        </Box>
      );
    }

    return this.props.children;
  }
}
