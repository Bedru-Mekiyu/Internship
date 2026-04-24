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
import { api, normalizeApiError } from '../../services/api';
import { resolvePublicApiOrigin } from '../../utils/apiBaseUrl';
import { useAuth } from '../../context/AuthContext';
interface Certificate {
  id: string;
  courseId: string;
  title: string;
  issued: string;
  certificateId: string;
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

export default function MyCertificates() {
  const { user } = useAuth();
  const firstName = user?.firstName?.trim();
  const welcomeGreeting = firstName ? `Welcome back, ${firstName}` : 'Welcome back';
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

    return rows.map((item) => ({
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
          <Alert severity="success" sx={{ mb: 2.25, borderRadius: 1.5 }} onClose={() => setStatusMessage(null)}>
            {statusMessage}
          </Alert>
        ) : null}

        {isError ? (
          <Alert severity="error" sx={{ mb: 2.25, borderRadius: 1.5 }}>
            {normalizeApiError(error).message || 'Failed to load certificates'}
          </Alert>
        ) : null}

        <Card sx={{ mb: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={2.2}>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {welcomeGreeting}
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

                <Button variant="contained" sx={{ minWidth: 160 }} onClick={handleShareProfile}>
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
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>No certificates yet</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75 }}>
                Complete enrolled courses to unlock certificates.
              </Typography>
            </CardContent>
          </Card>
        ) : null}

        {eligibleCourses.length > 0 ? (
          <Card sx={{ mb: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
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
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1.5,
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
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                    <Stack spacing={2}>
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
                        sx={{ flex: 1, minWidth: 120 }}
                        onClick={() => handlePdf(certificate)}
                      >
                        PDF
                      </Button>
                      <Button size="small" variant="text" onClick={() => handleHtmlCertificate(certificate)} sx={{ minWidth: 'auto' }}>
                        HTML
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{
                          flex: 1,
                          minWidth: 120,
                          color: 'text.primary',
                          borderColor: 'divider',
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
