import { useState } from 'react';
import {
  AddOutlined,
  ArrowBack,
  DeleteOutlined,
  EditOutlined,
  OndemandVideoOutlined,
  QuizOutlined,
  SaveOutlined,
  TextSnippetOutlined,
  VideoLibraryOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

type LessonType = 'Video' | 'Quiz' | 'Reading';

type Lesson = {
  id: number;
  title: string;
  type: LessonType;
  content: string;
};

type Module = {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
};

const initialModules: Module[] = [
  {
    id: 1,
    title: 'Module 1: Getting Started',
    description: 'Introduction to the course and foundational concepts.',
    lessons: [
      {
        id: 1,
        title: 'Welcome to the Course',
        type: 'Video',
        content: 'Welcome and course overview.',
      },
    ],
  },
];

function getNextId(items: Array<{ id: number }>): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function getLessonIcon(type: LessonType) {
  switch (type) {
    case 'Video':
      return <OndemandVideoOutlined fontSize="small" />;
    case 'Quiz':
      return <QuizOutlined fontSize="small" />;
    case 'Reading':
      return <TextSnippetOutlined fontSize="small" />;
  }
}

export default function CreateCourse() {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSubtitle, setCourseSubtitle] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const selectedModule = modules.find((m) => m.id === selectedModuleId);
  const selectedLesson = selectedModule?.lessons.find((l) => l.id === selectedLessonId);

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  const updateModule = (moduleId: number, updates: Partial<Module>) => {
    setModules((prev) => prev.map((m) => (m.id === moduleId ? { ...m, ...updates } : m)));
  };

  const updateLesson = (moduleId: number, lessonId: number, updates: Partial<Lesson>) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, ...updates } : l)) }
          : m
      )
    );
  };

  const addModule = () => {
    const newModule: Module = {
      id: getNextId(modules),
      title: `Module ${modules.length + 1}`,
      description: '',
      lessons: [],
    };
    setModules((prev) => [...prev, newModule]);
    setSelectedModuleId(newModule.id);
  };

  const addLesson = (type: LessonType) => {
    if (!selectedModule) return;

    const defaultTitles: Record<LessonType, string> = {
      Video: 'New Video Lesson',
      Quiz: 'New Quiz',
      Reading: 'New Reading',
    };

    const newLesson: Lesson = {
      id: getNextId(selectedModule.lessons),
      title: defaultTitles[type],
      type,
      content: '',
    };

    updateModule(selectedModule.id, { lessons: [...selectedModule.lessons, newLesson] });
    setSelectedLessonId(newLesson.id);
  };

  const deleteLesson = (moduleId: number, lessonId: number) => {
    const module = modules.find((m) => m.id === moduleId);
    if (!module) return;

    const remainingLessons = module.lessons.filter((l) => l.id !== lessonId);
    updateModule(moduleId, { lessons: remainingLessons });

    if (selectedLessonId === lessonId) {
      setSelectedLessonId(remainingLessons[0]?.id ?? null);
    }
  };

  const deleteModule = (moduleId: number) => {
    const remainingModules = modules.filter((m) => m.id !== moduleId);
    setModules(remainingModules);

    if (selectedModuleId === moduleId) {
      setSelectedModuleId(remainingModules[0]?.id ?? 0);
      setSelectedLessonId(null);
    }
  };

  const handleSave = () => {
    // TODO: Implement API call to save course
    console.log('Saving course:', { courseTitle, courseSubtitle, isPublished, modules });
    alert('Course saved! (Check console for data)');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="text"
              onClick={() => navigate('/courses')}
              startIcon={<ArrowBack />}
              sx={{ color: 'text.secondary' }}
            >
              Back
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VideoLibraryOutlined color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Create Course
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<SaveOutlined />} onClick={handleSave}>
              Save
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{ bgcolor: isPublished ? 'success.main' : 'primary.main' }}
            >
              {isPublished ? 'Update' : 'Publish'}
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Course Details */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Course Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                      fullWidth
                      label="Course Title"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      placeholder="Enter course title"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      value={isPublished ? 'published' : 'draft'}
                      onChange={(e) => setIsPublished(e.target.value === 'published')}
                      fullWidth
                    >
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                    </Select>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Subtitle"
                      value={courseSubtitle}
                      onChange={(e) => setCourseSubtitle(e.target.value)}
                      placeholder="Brief description of your course"
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Modules Section */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Modules ({modules.length})
                  </Typography>
                  <IconButton onClick={addModule} size="small" color="primary">
                    <AddOutlined />
                  </IconButton>
                </Box>

                <Stack spacing={1}>
                  {modules.map((module) => (
                    <Box
                      key={module.id}
                      onClick={() => setSelectedModuleId(module.id)}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: selectedModuleId === module.id ? 'primary.main' : 'divider',
                        bgcolor: selectedModuleId === module.id ? 'primary.light' : 'background.paper',
                        cursor: 'pointer',
                        '&:hover': { borderColor: 'primary.main' },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, noWrap: true }}>
                            {module.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteModule(module.id);
                          }}
                          sx={{ color: 'text.secondary' }}
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Stack>

                {modules.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No modules yet
                    </Typography>
                    <Button onClick={addModule} startIcon={<AddOutlined />} sx={{ mt: 1 }}>
                      Add Module
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Module Editor */}
          <Grid size={{ xs: 12, lg: 8 }}>
            {selectedModule ? (
              <Stack spacing={2}>
                {/* Module Details */}
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Edit Module
                    </Typography>
                    <TextField
                      fullWidth
                      label="Module Title"
                      value={selectedModule.title}
                      onChange={(e) => updateModule(selectedModule.id, { title: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Description"
                      value={selectedModule.description}
                      onChange={(e) => updateModule(selectedModule.id, { description: e.target.value })}
                      multiline
                      rows={2}
                    />
                  </CardContent>
                </Card>

                {/* Lessons */}
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Lessons ({selectedModule.lessons.length})
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<OndemandVideoOutlined />}
                          onClick={() => addLesson('Video')}
                        >
                          Video
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<QuizOutlined />}
                          onClick={() => addLesson('Quiz')}
                        >
                          Quiz
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<TextSnippetOutlined />}
                          onClick={() => addLesson('Reading')}
                        >
                          Reading
                        </Button>
                      </Stack>
                    </Box>

                    <Stack spacing={1}>
                      {selectedModule.lessons.map((lesson) => (
                        <Box
                          key={lesson.id}
                          onClick={() => setSelectedLessonId(lesson.id)}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: selectedLessonId === lesson.id ? 'primary.main' : 'divider',
                            bgcolor: selectedLessonId === lesson.id ? 'primary.light' : 'background.paper',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            '&:hover': { borderColor: 'primary.main' },
                          }}
                        >
                          <Box sx={{ color: 'text.secondary' }}>{getLessonIcon(lesson.type)}</Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {lesson.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {lesson.type}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteLesson(selectedModule.id, lesson.id);
                            }}
                          >
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>

                    {selectedModule.lessons.length === 0 && (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          No lessons in this module
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Lesson Editor */}
                {selectedLesson && (
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <EditOutlined fontSize="small" color="primary" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Edit Lesson
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        label="Lesson Title"
                        value={selectedLesson.title}
                        onChange={(e) =>
                          updateLesson(selectedModule.id, selectedLesson.id, { title: e.target.value })
                        }
                        sx={{ mb: 2 }}
                      />
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 6 }}>
                          <InputLabel id="lesson-type-label">Type</InputLabel>
                          <Select
                            labelId="lesson-type-label"
                            value={selectedLesson.type}
                            onChange={(e) =>
                              updateLesson(selectedModule.id, selectedLesson.id, {
                                type: e.target.value as LessonType,
                              })
                            }
                            fullWidth
                          >
                            <MenuItem value="Video">Video</MenuItem>
                            <MenuItem value="Quiz">Quiz</MenuItem>
                            <MenuItem value="Reading">Reading</MenuItem>
                          </Select>
                        </Grid>
                      </Grid>
                      <TextField
                        fullWidth
                        label="Content"
                        value={selectedLesson.content}
                        onChange={(e) =>
                          updateLesson(selectedModule.id, selectedLesson.id, { content: e.target.value })
                        }
                        multiline
                        rows={4}
                        placeholder="Enter lesson content or description..."
                      />
                    </CardContent>
                  </Card>
                )}
              </Stack>
            ) : (
              <Card sx={{ borderRadius: 2, p: 4, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Select a module from the left to start editing
                </Typography>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
