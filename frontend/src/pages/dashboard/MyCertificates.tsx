import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  DownloadOutlined,
  LinkedIn,
  ShareOutlined,
  LockOutlined,
} from '@mui/icons-material';
import { api, normalizeApiError } from '../../services/api';
import { resolvePublicApiOrigin } from '../../utils/apiBaseUrl';
import { useAuth } from '../../context/AuthContext';
interface Certificate {
  id: string;
  courseId: string;
  title: string;
  issued: string;
  certificateId: string;
  previewTone: string;
  previewImage: string;
}

interface CertificateApiModel {
  _id: string;
  certificateNumber: string;
  issuedAt: string;
  courseId?: {
    _id?: string;
    title?: string;
  } | string;
}

interface StudentDashboardResponse {
  enrolledCourses: Array<{
    courseId: string;
    title: string;
    progress: number;
  }>;
}

const previewTones = ['#F5F3FF', '#EEF2FF', '#F8FAFC', '#EAF2FF'];
const previewImages = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80',
];

function CertificatePreview({ certificate }: { certificate: Certificate }) {
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${certificate.previewTone} 0%, #FFFFFF 100%)`,
        border: '1px solid #D8CFF9',
        boxShadow: 'inset 0 0 0 1px rgba(99,102,241,0.12)',
      }}
    >
      <Box sx={{ p: 2.25, minHeight: 250 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: '999px',
              bgcolor: alpha('#6366F1', 0.12),
              color: '#6366F1',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <LockOutlined />
          </Box>
        </Box>

        <Box
          sx={{
            border: '2px solid #C7BBF9',
            borderRadius: '12px',
            bgcolor: '#FFFFFF',
            p: 2,
            height: 178,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'grid', gap: 1 }}>
            <Box sx={{ height: 10, width: '52%', borderRadius: 999, bgcolor: '#EDE9FE' }} />
            <Box sx={{ height: 6, width: '72%', borderRadius: 999, bgcolor: '#E5E7EB' }} />
            <Box sx={{ height: 6, width: '62%', borderRadius: 999, bgcolor: '#E5E7EB' }} />
            <Box sx={{ height: 6, width: '66%', borderRadius: 999, bgcolor: '#E5E7EB' }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, alignItems: 'end' }}>
            <Box sx={{ display: 'grid', gap: 0.7, flex: 1 }}>
              <Box sx={{ height: 8, width: '68%', borderRadius: 999, bgcolor: '#E5E7EB' }} />
              <Box sx={{ height: 8, width: '48%', borderRadius: 999, bgcolor: '#E5E7EB' }} />
            </Box>
            <Box sx={{ width: 62, height: 62, borderRadius: '999px', bgcolor: alpha('#6366F1', 0.1) }} />
          </Box>
        </Box>

        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(99,102,241,0.04), transparent 40%, rgba(0,102,255,0.03) 100%)', pointerEvents: 'none' }} />
      </Box>
    </Box>
  );
}

export default function MyCertificates() {
  const { user } = useAuth();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['certificates', 'me'],
    queryFn: async () => {
      const response = await api.get<CertificateApiModel[]>('/api/certificates/me');
      return response.data;
    },
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard', 'student', 'certificate-candidates'],
    queryFn: async () => {
      const response = await api.get<StudentDashboardResponse>('/api/dashboard/student');
      return response.data;
    },
  });

  const certificates = useMemo<Certificate[]>(() => {
    const rows = data ?? [];

    return rows.map((item, index) => ({
      id: item._id,
      courseId:
        typeof item.courseId === 'object' && item.courseId?._id
          ? item.courseId._id
          : typeof item.courseId === 'string'
            ? item.courseId
            : '',
      title:
        typeof item.courseId === 'object' && item.courseId?.title
          ? item.courseId.title
          : 'Completed Course',
      issued: `Issued ${new Date(item.issuedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })}`,
      certificateId: item.certificateNumber,
      previewTone: previewTones[index % previewTones.length],
      previewImage: previewImages[index % previewImages.length],
    }));
  }, [data]);

  const eligibleCourses = useMemo(() => {
    const existingCertificateCourseIds = new Set(
      certificates
        .map((certificate) => certificate.courseId)
        .filter(Boolean),
    );

    return (dashboardData?.enrolledCourses || []).filter((course) => {
      return Number(course.progress || 0) >= 100 && !existingCertificateCourseIds.has(course.courseId);
    });
  }, [certificates, dashboardData?.enrolledCourses]);

  const generateCertificateMutation = useMutation({
    mutationFn: async (courseId: string) => {
      await api.post(`/api/certificates/course/${courseId}/generate`);
    },
    onSuccess: async () => {
      await refetch();
      setStatusMessage('Certificate generated successfully.');
    },
    onError: (requestError) => {
      setStatusMessage(normalizeApiError(requestError).message || 'Could not generate certificate');
    },
  });

  const totalCertificates = useMemo(() => certificates.length, [certificates.length]);

  const handlePdf = (certificate: Certificate) => {
    void (async () => {
      try {
        const response = await api.get(`/api/certificates/${certificate.id}/download-pdf`, {
          responseType: 'blob',
        });

        const blobUrl = window.URL.createObjectURL(response.data);
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = `certificate-${certificate.certificateId}.pdf`;
        anchor.click();
        window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
        setStatusMessage(`Downloaded PDF certificate for ${certificate.title}`);
      } catch (requestError) {
        setStatusMessage(normalizeApiError(requestError).message || 'Could not download certificate PDF');
      }
    })();
  };

  const handleHtmlCertificate = (certificate: Certificate) => {
    void (async () => {
      try {
        const response = await api.get(`/api/certificates/${certificate.id}/download`, {
          responseType: 'blob',
        });

        const blobUrl = window.URL.createObjectURL(response.data);
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = `certificate-${certificate.certificateId}.html`;
        anchor.click();
        window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
        setStatusMessage(`Downloaded HTML certificate for ${certificate.title}`);
      } catch (requestError) {
        setStatusMessage(normalizeApiError(requestError).message || 'Could not download HTML certificate');
      }
    })();
  };

  const handleLinkedIn = (certificate: Certificate) => {
    try {
      const renderUrl = `${resolvePublicApiOrigin()}/api/certificates/${certificate.id}/render`;
      window.open(renderUrl, '_blank', 'noopener,noreferrer');
      setStatusMessage(`Opened shareable certificate view for ${certificate.title}`);
    } catch {
      setStatusMessage('Could not open certificate preview');
    }
  };

  const handleShareProfile = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatusMessage('Profile link copied to clipboard');
    } catch {
      setStatusMessage('Could not copy the profile link');
    }
  };

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2.5 }}>
          My certificates
        </Typography>

        {statusMessage ? (
          <Alert severity="success" sx={{ mb: 2.25, borderRadius: '12px' }} onClose={() => setStatusMessage(null)}>
            {statusMessage}
          </Alert>
        ) : null}

        {isError ? (
          <Alert severity="error" sx={{ mb: 2.25, borderRadius: '12px' }}>
            {normalizeApiError(error).message || 'Failed to load certificates'}
          </Alert>
        ) : null}

        <Card sx={{ mb: 2.5 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={2.2}>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Welcome back, {user?.firstName || 'Learner'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
                    My Certificates
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.75, color: 'text.secondary' }}>
                    Verify and download your earned credentials.
                  </Typography>
                </Box>

                <Button variant="contained" startIcon={<ShareOutlined />} sx={{ minWidth: 160 }} onClick={handleShareProfile}>
                  Share Profile
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {isLoading ? (
          <Typography sx={{ color: 'text.secondary', mb: 2 }}>Loading certificates...</Typography>
        ) : null}

        {!isLoading && certificates.length === 0 ? (
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>No certificates yet</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75 }}>
                Complete enrolled courses to unlock certificates.
              </Typography>
            </CardContent>
          </Card>
        ) : null}

        {eligibleCourses.length > 0 ? (
          <Card sx={{ mb: 2.5 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Ready to generate</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75, mb: 2 }}>
                These completed courses can issue a certificate now.
              </Typography>
              <Stack spacing={1.25}>
                {eligibleCourses.map((course) => (
                  <Box
                    key={course.courseId}
                    sx={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{course.title}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Progress: {course.progress}%</Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={generateCertificateMutation.isPending}
                      onClick={() => void generateCertificateMutation.mutateAsync(course.courseId)}
                    >
                      {generateCertificateMutation.isPending ? 'Generating...' : 'Generate'}
                    </Button>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        <Grid container spacing={2.5}>
          {certificates.map((certificate) => (
            <Grid key={certificate.id} size={{ xs: 12, md: 6, xl: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 160ms ease, box-shadow 160ms ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 28px rgba(15,23,42,0.12)',
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack spacing={2}>
                    <CertificatePreview certificate={certificate} />

                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.35 }}>
                        {certificate.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>
                        {certificate.issued} • ID: {certificate.certificateId}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        startIcon={<DownloadOutlined />}
                        sx={{
                          flex: 1,
                          minWidth: 120,
                          bgcolor: '#6366F1',
                          '&:hover': { bgcolor: '#4F46E5' },
                        }}
                        onClick={() => handlePdf(certificate)}
                      >
                        PDF
                      </Button>
                      <Button size="small" variant="text" onClick={() => handleHtmlCertificate(certificate)} sx={{ minWidth: 'auto' }}>
                        HTML
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<LinkedIn />}
                        sx={{
                          flex: 1,
                          minWidth: 120,
                          borderColor: '#CBD5E1',
                          color: 'text.primary',
                          '&:hover': {
                            borderColor: '#6366F1',
                            bgcolor: alpha('#6366F1', 0.04),
                          },
                        }}
                        onClick={() => handleLinkedIn(certificate)}
                      >
                        LinkedIn
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 2.5, color: 'text.secondary', fontSize: 14 }}>
          {totalCertificates} certificates available
        </Box>
    </Box>
  );
}
