import { Component, type ErrorInfo, type ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
} from '@mui/material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // Log to monitoring service in production
    if (import.meta.env.PROD) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Box sx={{ maxWidth: 480, width: '100%' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Something went wrong</AlertTitle>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This error has been logged. You can try reloading or go back to the home page.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button variant="contained" onClick={this.handleReload}>
                Reload Page
              </Button>
            </Box>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
