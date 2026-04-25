import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { normalizeApiError } from '../../services/api';
import { useCreateQuizMutation } from '../../store/api/quizApi';
import DashboardPageFrame from '../../components/common/DashboardPageFrame';

type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';

interface QuestionOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  explanation: string;
  points: number;
}

const initialQuestions: Question[] = [
  {
    id: 1,
    text: '',
    type: 'multiple-choice',
    options: [
      { id: 1, text: '', isCorrect: false },
      { id: 2, text: '', isCorrect: false },
    ],
    explanation: '',
    points: 1,
  },
];

function getNextId<T extends { id: number }>(items: T[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

export default function QuizBuilder() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();
  const [createQuiz, { isLoading: isCreating }] = useCreateQuizMutation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const [attempts, setAttempts] = useState(3);
  const [passingScore, setPassingScore] = useState(70);
  const [isPublished, setIsPublished] = useState(true);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  const updateQuestion = (questionId: number, updates: Partial<Question>) => {
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, ...updates } : q)));
  };

  const addQuestion = () => {
    const newId = getNextId(questions);
    const newQuestion: Question = {
      id: newId,
      text: '',
      type: 'multiple-choice',
      options: [
        { id: 1, text: '', isCorrect: false },
        { id: 2, text: '', isCorrect: false },
      ],
      explanation: '',
      points: 1,
    };
    setQuestions((prev) => [...prev, newQuestion]);
    setSelectedQuestionId(newId);
  };

  const deleteQuestion = (questionId: number) => {
    if (questions.length <= 1) {
      setStatusMessage({ type: 'error', text: 'Quiz must have at least one question.' });
      return;
    }
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(questions[0].id);
    }
  };

  const updateOption = (questionId: number, optionId: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          options: q.options.map((o) => (o.id === optionId ? { ...o, text } : o)),
        };
      })
    );
  };

  const toggleCorrectOption = (questionId: number, optionId: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          options: q.options.map((o) => ({
            ...o,
            isCorrect: o.id === optionId ? !o.isCorrect : q.type === 'multiple-choice' ? false : o.isCorrect,
          })),
        };
      })
    );
  };

  const addOption = (questionId: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          options: [...q.options, { id: getNextId(q.options), text: '', isCorrect: false }],
        };
      })
    );
  };

  const removeOption = (questionId: number, optionId: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId || q.options.length <= 2) return q;
        return {
          ...q,
          options: q.options.filter((o) => o.id !== optionId),
        };
      })
    );
  };

  const validateQuiz = (): string | null => {
    if (!title.trim()) return 'Quiz title is required.';
    if (!lessonId) return 'No lesson selected.';
    for (const q of questions) {
      if (!q.text.trim()) return `Question ${q.id} text is required.`;
      if (q.type === 'multiple-choice' || q.type === 'true-false') {
        const hasCorrect = q.options.some((o) => o.isCorrect);
        if (!hasCorrect) return `Question ${q.id} must have at least one correct answer.`;
      }
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validateQuiz();
    if (validationError) {
      setStatusMessage({ type: 'error', text: validationError });
      return;
    }

    setStatusMessage(null);

    try {
      const quizData = {
        lessonId: lessonId!,
        title: title.trim(),
        description: description.trim() || undefined,
        timeLimit,
        attempts,
        passingScore,
        isPublished,
        questions: questions.map((q) => ({
          question: q.text,
          type: q.type,
          options: q.type === 'multiple-choice' || q.type === 'true-false'
            ? q.options.map((o) => o.text).filter(Boolean)
            : undefined,
          correctAnswer: q.type === 'multiple-choice'
            ? q.options.find((o) => o.isCorrect)?.text
            : q.type === 'true-false'
              ? q.options.find((o) => o.isCorrect)?.text === 'True'
              : undefined,
          points: q.points,
          explanation: q.explanation || undefined,
        })),
      };

      await createQuiz(quizData).unwrap();
      setStatusMessage({ type: 'success', text: 'Quiz created successfully!' });

      setTimeout(() => {
        navigate(`/courses/${courseId}/learn`);
      }, 1500);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: normalizeApiError(error).message || 'Failed to create quiz.',
      });
    }
  };

  return (
    <DashboardPageFrame
      title="Create Quiz"
      description="Add a quiz to assess learner understanding."
      eyebrow="Course Builder"
      actionLabel="Save Quiz"
      actionTo=""
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                  <TextField
                    label="Quiz Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                    required
                  />

                  <TextField
                    label="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                  />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, md: 4 }}>
                      <TextField
                        label="Time Limit (minutes)"
                        type="number"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(Number(e.target.value))}
                        fullWidth
                        inputProps={{ min: 1, max: 180 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 4 }}>
                      <TextField
                        label="Max Attempts"
                        type="number"
                        value={attempts}
                        onChange={(e) => setAttempts(Number(e.target.value))}
                        fullWidth
                        inputProps={{ min: 1, max: 10 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 4 }}>
                      <TextField
                        label="Passing Score (%)"
                        type="number"
                        value={passingScore}
                        onChange={(e) => setPassingScore(Number(e.target.value))}
                        fullWidth
                        inputProps={{ min: 0, max: 100 }}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Questions
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addQuestion}
                    size="small"
                  >
                    Add Question
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {questions.map((q, index) => (
                    <Button
                      key={q.id}
                      variant={selectedQuestionId === q.id ? 'contained' : 'outlined'}
                      onClick={() => setSelectedQuestionId(q.id)}
                      size="small"
                    >
                      Q{index + 1}
                    </Button>
                  ))}
                </Box>

                {selectedQuestion && (
                  <Stack spacing={2.5}>
                    <TextField
                      label="Question Text"
                      value={selectedQuestion.text}
                      onChange={(e) => updateQuestion(selectedQuestion.id, { text: e.target.value })}
                      fullWidth
                      required
                    />

                    <FormControl fullWidth>
                      <InputLabel>Question Type</InputLabel>
                      <Select
                        value={selectedQuestion.type}
                        label="Question Type"
                        onChange={(e) =>
                          updateQuestion(selectedQuestion.id, {
                            type: e.target.value as QuestionType,
                            options:
                              e.target.value === 'true-false'
                                ? [
                                    { id: 1, text: 'True', isCorrect: false },
                                    { id: 2, text: 'False', isCorrect: false },
                                  ]
                                : [
                                    { id: 1, text: '', isCorrect: false },
                                    { id: 2, text: '', isCorrect: false },
                                  ],
                          })
                        }
                      >
                        <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
                        <MenuItem value="true-false">True / False</MenuItem>
                        <MenuItem value="short-answer">Short Answer</MenuItem>
                        <MenuItem value="essay">Essay</MenuItem>
                      </Select>
                    </FormControl>

                    {(selectedQuestion.type === 'multiple-choice' || selectedQuestion.type === 'true-false') && (
                      <Stack spacing={1.5}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Answer Options (select the correct answer)
                        </Typography>
                        {selectedQuestion.options.map((option, index) => (
                          <Box
                            key={option.id}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            <Button
                              variant={option.isCorrect ? 'contained' : 'outlined'}
                              color={option.isCorrect ? 'success' : 'inherit'}
                              onClick={() => toggleCorrectOption(selectedQuestion.id, option.id)}
                              sx={{ minWidth: 80 }}
                            >
                              {option.isCorrect ? 'Correct' : `Option ${index + 1}`}
                            </Button>
                            <TextField
                              placeholder={`Option ${index + 1}`}
                              value={option.text}
                              onChange={(e) => updateOption(selectedQuestion.id, option.id, e.target.value)}
                              fullWidth
                              size="small"
                            />
                            {selectedQuestion.type === 'multiple-choice' &&
                              selectedQuestion.options.length > 2 && (
                                <IconButton
                                  onClick={() => removeOption(selectedQuestion.id, option.id)}
                                  size="small"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                          </Box>
                        ))}
                        {selectedQuestion.type === 'multiple-choice' && (
                          <Button
                            variant="text"
                            startIcon={<AddIcon />}
                            onClick={() => addOption(selectedQuestion.id)}
                            size="small"
                          >
                            Add Option
                          </Button>
                        )}
                      </Stack>
                    )}

                    <TextField
                      label="Explanation (shown after answer)"
                      value={selectedQuestion.explanation}
                      onChange={(e) => updateQuestion(selectedQuestion.id, { explanation: e.target.value })}
                      fullWidth
                      multiline
                      rows={2}
                    />

                    <TextField
                      label="Points"
                      type="number"
                      value={selectedQuestion.points}
                      onChange={(e) => updateQuestion(selectedQuestion.id, { points: Number(e.target.value) })}
                      fullWidth
                      inputProps={{ min: 1, max: 100 }}
                      sx={{ maxWidth: 120 }}
                    />

                    <Box sx={{ pt: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => deleteQuestion(selectedQuestion.id)}
                      >
                        Delete Question
                      </Button>
                    </Box>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Quiz Settings
                  </Typography>

                  <FormControl fullWidth>
                    <InputLabel>Publish Status</InputLabel>
                    <Select
                      value={isPublished ? 'published' : 'draft'}
                      label="Publish Status"
                      onChange={(e) => setIsPublished(e.target.value === 'published')}
                    >
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="draft">Draft</MenuItem>
                    </Select>
                  </FormControl>

                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {questions.length} question(s) · {questions.reduce((sum, q) => sum + q.points, 0)} total points
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {statusMessage && (
              <Alert severity={statusMessage.type}>{statusMessage.text}</Alert>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={isCreating}
              onClick={handleSave}
              sx={{ py: 1.5 }}
            >
              {isCreating ? 'Creating Quiz...' : 'Create Quiz'}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </DashboardPageFrame>
  );
}