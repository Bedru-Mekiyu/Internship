import { useState, type ChangeEvent } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  SendOutlined,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
}

function JobCard({
  job,
  expanded,
  onApply,
  onToggle,
}: {
  job: Job;
  expanded: boolean;
  onApply: (jobId: string) => void;
  onToggle: () => void;
}) {
  return (
    <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {job.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {job.department} • {job.location} • {job.type}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
            {job.description}
          </Typography>
          {expanded ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Requirements
              </Typography>
              {job.requirements.map((requirement) => (
                <Typography key={requirement} variant="body2" sx={{ color: 'text.secondary' }}>
                  • {requirement}
                </Typography>
              ))}
            </Stack>
          ) : null}
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" onClick={onToggle}>
              {expanded ? 'Hide details' : 'View details'}
            </Button>
            <Button variant="contained" onClick={() => onApply(job.id)}>
              Apply now
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function CareersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const jobs: Job[] = [
    {
      id: 'senior-frontend',
      title: 'Senior Frontend Engineer',
      department: 'Engineering',
      location: 'Remote / San Francisco',
      type: 'Full-time',
      description: 'Join our frontend team to build beautiful, performant learning experiences. You\'ll work with React, TypeScript, and Material UI to create engaging course interfaces.',
      requirements: [
        '5+ years experience with React and TypeScript',
        'Strong understanding of web performance',
        'Experience with state management (Redux/RTK)',
        'Excellent communication skills',
      ],
    },
    {
      id: 'fullstack-engineer',
      title: 'Full Stack Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build and maintain our learning platform end-to-end. Work on APIs, real-time features, and learning management tools.',
      requirements: [
        '3+ years full-stack development',
        'Experience with Node.js and databases',
        'Understanding of REST and real-time APIs',
        'Ability to work independently',
      ],
    },
    {
      id: 'product-designer',
      title: 'Product Designer',
      department: 'Design',
      location: 'Remote / San Francisco',
      type: 'Full-time',
      description: 'Shape the future of online learning through thoughtful, beautiful design. Create experiences that inspire learners and educators.',
      requirements: [
        '4+ years product design experience',
        'Strong portfolio showing UX process',
        'Experience with design systems',
        'Familiarity with EdTech a plus',
      ],
    },
    {
      id: 'developer-advocate',
      title: 'Developer Advocate',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time',
      description: 'Be the voice of our developer community. Create content, build demos, and help educators succeed on our platform.',
      requirements: [
        'Technical background with ability to code',
        'Excellent written and verbal communication',
        'Experience creating technical content',
        'Community management experience',
      ],
    },
    {
      id: 'customer-success',
      title: 'Customer Success Manager',
      department: 'Success',
      location: 'Remote',
      type: 'Full-time',
      description: 'Help our enterprise customers get the most from LearnSpace. Onboard new accounts, drive adoption, and ensure satisfaction.',
      requirements: [
        '3+ years in customer success',
        'Strong relationship-building skills',
        'Experience with SaaS platforms',
        'Data-driven approach to account management',
      ],
    },
    {
      id: 'content-strategist',
      title: 'Content Strategist',
      department: 'Content',
      location: 'Remote',
      type: 'Full-time',
      description: 'Shape our content strategy and help instructors create compelling courses. Work with top educators to optimize learning outcomes.',
      requirements: [
        'Experience in educational content',
        'Strong analytical skills',
        'Experience with LMS platforms',
        'Excellent editorial judgment',
      ],
    },
  ];

  const departments = [...new Set(jobs.map((j) => j.department))];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = !searchQuery.trim() ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = !departmentFilter || job.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const handleApply = (jobId: string) => {
    window.open(`/contact?subject=Application for ${jobId.replace('-', ' ')}`, '_blank');
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
      <Box sx={{ pt: { xs: 6, md: 9 }, pb: { xs: 4, md: 5 }, bgcolor: 'background.default', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Stack spacing={2}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.2em' }}>
              JOIN OUR TEAM
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Build the future of learning
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 560, mx: 'auto', lineHeight: 1.8 }}>
              We're on a mission to make great education accessible to everyone. Join a team of passionate builders, designers, and educators creating transformative learning experiences.
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  select
                  label="Department"
                  value={departmentFilter || ''}
                  onChange={(e) => setDepartmentFilter(e.target.value || null)}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>
                  {filteredJobs.length} position{filteredJobs.length !== 1 ? 's' : ''} available
                </Typography>
              </Grid>
            </Grid>

            {filteredJobs.length === 0 ? (
              <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    No positions match your search. Check back soon!
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Stack spacing={2}>
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={handleApply}
                    expanded={expandedJob === job.id}
                    onToggle={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 5, md: 6 }, bgcolor: 'background.default' }}>
        <Container maxWidth="md">
          <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'grey.100' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 }, textAlign: 'center' }}>
              <Stack spacing={2}>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  Don't see the right role?
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  We're always looking for great people. Send us your resume and tell us how you'd like to contribute.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/contact"
                  variant="outlined"
                  endIcon={<SendOutlined />}
                  sx={{ alignSelf: 'center' }}
                >
                  Get in Touch
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>

    </Box>
  );
}




