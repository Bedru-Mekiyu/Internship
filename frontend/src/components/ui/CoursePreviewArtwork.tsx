import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface CoursePreviewArtworkProps {
  variant: number;
}

export function CoursePreviewArtwork({ variant }: CoursePreviewArtworkProps) {
  const normalizedVariant = variant % 3;

  if (normalizedVariant === 0) {
    return <CodePreviewVariant />;
  }

  if (normalizedVariant === 1) {
    return <AnalyticsPreviewVariant />;
  }

  return <DashboardPreviewVariant />;
}

function CodePreviewVariant() {
  const codeRows = [
    { width: '72%', color: '#60A5FA' },
    { width: '44%', color: '#A78BFA' },
    { width: '64%', color: '#34D399' },
    { width: '52%', color: '#FBBF24' },
    { width: '78%', color: '#60A5FA' },
    { width: '38%', color: '#F472B6' },
  ];

  return (
    <Box sx={{ height: 120, bgcolor: '#101827', p: 1.15, display: 'flex', flexDirection: 'column', gap: 0.9 }}>
      <Box sx={{ display: 'flex', gap: 0.45 }}>
        {['#EF4444', '#F59E0B', '#22C55E'].map((color) => (
          <Box key={color} sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: color }} />
        ))}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 0.9, alignItems: 'start' }}>
        <Stack spacing={0.58}>
          {[1, 2, 3, 4, 5, 6].map((line) => (
            <Typography key={line} sx={{ color: '#64748B', fontSize: '0.46rem', lineHeight: 1 }}>
              {line}
            </Typography>
          ))}
        </Stack>
        <Stack spacing={0.62}>
          {codeRows.map((row, index) => (
            <Box key={`${row.width}-${index}`} sx={{ display: 'flex', gap: 0.55, alignItems: 'center' }}>
              <Box
                sx={{
                  width: index % 2 === 0 ? 18 : 10,
                  height: 5,
                  borderRadius: 0.7,
                  bgcolor: alpha(row.color, 0.75),
                }}
              />
              <Box
                sx={{
                  width: row.width,
                  height: 5,
                  borderRadius: 0.7,
                  bgcolor: alpha('#CBD5E1', 0.18),
                }}
              />
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

function AnalyticsPreviewVariant() {
  const bars = [26, 40, 55, 68, 82];

  return (
    <Box sx={{ height: 120, bgcolor: '#F8FBFF', p: 1.25, position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', inset: 12, borderLeft: '1px solid #D8E2F1', borderBottom: '1px solid #D8E2F1' }} />
      <Box
        component="svg"
        viewBox="0 0 180 82"
        preserveAspectRatio="none"
        sx={{ position: 'absolute', left: 22, right: 14, bottom: 24, width: 'calc(100% - 36px)', height: 70 }}
      >
        <polyline fill="none" stroke="#F59E0B" strokeWidth="3" points="0,70 36,56 72,43 108,25 144,15 180,6" />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          left: 28,
          right: 22,
          bottom: 17,
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'space-between',
        }}
      >
        {bars.map((height, index) => (
          <Box
            key={height}
            sx={{
              width: 14,
              height,
              borderRadius: '4px 4px 0 0',
              bgcolor: index % 2 === 0 ? '#38BDF8' : '#6366F1',
              boxShadow: `0 0 0 4px ${alpha(index % 2 === 0 ? '#38BDF8' : '#6366F1', 0.12)}`,
            }}
          />
        ))}
      </Box>
      <Typography sx={{ position: 'absolute', top: 11, left: 14, color: '#334155', fontWeight: 800, fontSize: '0.5rem' }}>
        Growth Analytics
      </Typography>
    </Box>
  );
}

function DashboardPreviewVariant() {
  return (
    <Box sx={{ height: 120, bgcolor: '#F8FBFF', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', inset: '14px 18px 18px', bgcolor: '#FFFFFF', border: '1px solid #DCE6F4', borderRadius: 1 }} />
      <Box sx={{ position: 'absolute', top: 26, left: 34, width: 66, height: 42, borderRadius: 0.8, bgcolor: '#EEF2FF', border: '1px solid #C7D2FE' }}>
        <Box sx={{ position: 'absolute', left: 8, right: 8, top: 9, height: 4, borderRadius: 1, bgcolor: '#6366F1' }} />
        <Box sx={{ position: 'absolute', left: 8, width: 34, top: 20, height: 4, borderRadius: 1, bgcolor: '#93C5FD' }} />
        <Box sx={{ position: 'absolute', left: 8, width: 44, top: 31, height: 4, borderRadius: 1, bgcolor: '#F9A8D4' }} />
      </Box>
      <Box sx={{ position: 'absolute', top: 29, right: 34, width: 42, height: 42, borderRadius: '50%', bgcolor: '#FDE68A' }} />
      {[38, 62, 88, 118].map((left, index) => (
        <Box key={left} sx={{ position: 'absolute', left, bottom: 25, width: 16, height: 27 }}>
          <Box sx={{ width: 10, height: 10, mx: 'auto', borderRadius: '50%', bgcolor: index % 2 === 0 ? '#F59E0B' : '#64748B' }} />
          <Box sx={{ mt: 0.35, height: 16, borderRadius: '8px 8px 3px 3px', bgcolor: index % 2 === 0 ? '#6366F1' : '#38BDF8' }} />
        </Box>
      ))}
      <Box sx={{ position: 'absolute', left: 28, right: 28, bottom: 17, height: 5, borderRadius: 999, bgcolor: '#CBD5E1' }} />
    </Box>
  );
}