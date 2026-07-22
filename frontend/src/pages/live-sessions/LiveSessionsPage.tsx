import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Alert,
  Divider,
} from '@mui/material';
import { useGetLiveSessionsByCourseQuery } from '../../store/api/liveSessionApi';
import { LiveSessionList } from '../../components/ui/LiveSessionList';

export default function LiveSessionsPage() {
  const { courseId } = useParams<{ courseId: string }>();

  const { data: sessions, isLoading, error } = useGetLiveSessionsByCourseQuery(courseId || '', {
    skip: !courseId,
  });

  return (
    <Box sx={{ p: 3, maxWidth: 960, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Live Sessions
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Join scheduled live sessions for this course.
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {error ? (
        <Alert severity="error">Failed to load live sessions.</Alert>
      ) : (
        <LiveSessionList sessions={sessions || []} isLoading={isLoading} />
      )}
    </Box>
  );
}
