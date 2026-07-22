import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  EventAvailableOutlined,
  VideocamOutlined,
} from '@mui/icons-material';
import type { LiveSession } from '../../types';

interface LiveSessionListProps {
  sessions: LiveSession[];
  isLoading: boolean;
}

function formatDateTime(iso: string) {
  if (!iso) return 'TBD';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusColor(status?: string) {
  switch (status) {
    case 'ongoing':
      return 'success';
    case 'scheduled':
      return 'info';
    case 'completed':
      return 'default';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
}

export function LiveSessionList({ sessions, isLoading }: LiveSessionListProps) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No live sessions scheduled for this course yet.
      </Alert>
    );
  }

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {sessions.map((session) => (
        <Card key={session._id} variant="outlined">
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {session.title}
                </Typography>
                {session.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5 }}
                  >
                    {session.description}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <Chip
                    icon={<EventAvailableOutlined />}
                    label={formatDateTime(session.startTime)}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<VideocamOutlined />}
                    label={(session.provider || '').replace('_', ' ').toUpperCase()}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={session.status || 'scheduled'}
                    size="small"
                    color={statusColor(session.status) as 'success' | 'info' | 'default' | 'error'}
                  />
                </Stack>
              </Box>
              <Box sx={{ ml: 2, flexShrink: 0 }}>
                <Button
                  variant="contained"
                  size="small"
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  disabled={session.status === 'completed' || session.status === 'cancelled'}
                  startIcon={<VideocamOutlined />}
                >
                  Join
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
