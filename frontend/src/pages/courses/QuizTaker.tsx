import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Radio,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowBackOutlined,
  ArrowForwardOutlined,
  ReportProblemOutlined,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { normalizeApiError } from '../../services/api';
import { buildCourseLearnPath, buildQuizAttemptAnswers } from '../../services/lessonFlow';
import { theme } from '../../theme';
import { useLessonQuiz, useQuizAttemptsMe, useSubmitQuizAttempt } from '../../hooks/useQuiz';

type QuestionStatus = 'not-visited' | 'answered' | 'review' | 'current';

interface QuizQuestion {
  id: string;
  number: number;
  question: string;
  options: string[];
}

const demoQuizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    number: 1,
    question: 'What is the primary purpose of useState in a React component?',
    options: ['Manage local component state', 'Fetch remote data', 'Create context providers', 'Handle CSS styling'],
  },
  {
    id: 'q2',
    number: 2,
    question: 'Which hook should you use to memoize an expensive computation?',
    options: ['useMemo', 'useRef', 'useCallback', 'useEffect'],
  },
  {
    id: 'q3',
    number: 3,
    question: 'What is the purpose of useRef in React?',
    options: ['Store mutable values without re-rendering', 'Replace useState completely', 'Build forms automatically', 'Track routing transitions'],
  },
  {
    id: 'q4',
    number: 4,
    question: 'When should you use useEffect?',
    options: ['For side effects after render', 'Only for form validation', 'To create reducers', 'To style components'],
  },
  {
    id: 'q5',
    number: 5,
    question:
      'Which hook should you use to perform side effects in a function component, such as data fetching or manually changing the DOM?',
    options: ['useState', 'useEffect', 'useContext', 'useReducer'],
  },
  {
    id: 'q6',
    number: 6,
    question: 'What does useContext provide to a component?',
    options: ['Access to context values', 'A local cache', 'DOM mutation helpers', 'A form submit handler'],
  },
  {
    id: 'q7',
    number: 7,
    question: 'Which hook is best for handling more complex state transitions?',
    options: ['useReducer', 'useMemo', 'useRef', 'useEffect'],
  },
  {
    id: 'q8',
    number: 8,
    question: 'What does useCallback help with?',
    options: ['Memoizing functions', 'Creating refs', 'Fetching data', 'Styling components'],
  },
  {
    id: 'q9',
    number: 9,
    question: 'What is a common benefit of splitting UI into components?',
    options: ['Improved reuse and maintainability', 'Higher bundle size always', 'Less predictable state', 'No need for props'],
  },
  {
    id: 'q10',
    number: 10,
    question: 'What is the best practice for accessibility in quiz forms?',
    options: ['Use clear labels and keyboard support', 'Hide all labels', 'Disable focus outlines', 'Avoid semantic elements'],
  },
];

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function QuizTaker() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();
  const useDemoQuiz = !lessonId;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | null>>({});
  const [reviewFlags, setReviewFlags] = useState<Record<string, boolean>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(24 * 60 + 15);

  const {
    quiz: activeQuiz,
    isLoading: isQuizLoading,
    error: quizLoadError,
  } = useLessonQuiz(lessonId ?? '');
  const quizQuestions = useMemo<QuizQuestion[]>(() => {
    if (useDemoQuiz) {
      return demoQuizQuestions;
    }

    if (!activeQuiz) {
      return [];
    }

    return (activeQuiz.questions || []).map((question, index) => ({
      id: `q${index + 1}`,
      number: index + 1,
      question: question.question,
      options: Array.isArray(question.options) && question.options.length > 0
        ? question.options
        : ['No options provided for this question.'],
    }));
  }, [activeQuiz, useDemoQuiz]);

  const {
    attempts,
    error: attemptsLoadError,
  } = useQuizAttemptsMe(activeQuiz?._id ?? '');

  const {
    submitAttempt,
    isSubmitting,
    error: submitError,
  } = useSubmitQuizAttempt();

  useEffect(() => {
    const resetTimer = window.setTimeout(() => {
      if (useDemoQuiz) {
        setRemainingSeconds(24 * 60 + 15);
        return;
      }

      if (!activeQuiz) {
        setRemainingSeconds(24 * 60 + 15);
        return;
      }

      const configuredMinutes = Number(activeQuiz.timeLimit || 25);
      setRemainingSeconds(Math.max(60, configuredMinutes * 60));
    }, 0);

    return () => window.clearTimeout(resetTimer);
  }, [activeQuiz, useDemoQuiz]);

  useEffect(() => {
    const resetTimer = window.setTimeout(() => {
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setReviewFlags({});
    }, 0);

    return () => window.clearTimeout(resetTimer);
  }, [activeQuiz?._id]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) => Math.max(0, currentSeconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const clampTimer = window.setTimeout(() => {
      if (quizQuestions.length === 0) {
        setCurrentQuestionIndex(0);
        return;
      }

      setCurrentQuestionIndex((currentIndex) => Math.min(currentIndex, quizQuestions.length - 1));
    }, 0);

    return () => window.clearTimeout(clampTimer);
  }, [quizQuestions.length]);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const latestAttempt = attempts[0];

  const questionStatuses = useMemo(() => {
    return quizQuestions.map((question, index) => {
      if (index === currentQuestionIndex) {
        return 'current' as QuestionStatus;
      }
      if (reviewFlags[question.id]) {
        return 'review' as QuestionStatus;
      }
      if (typeof selectedAnswers[question.id] === 'number') {
        return 'answered' as QuestionStatus;
      }
      return 'not-visited' as QuestionStatus;
    });
  }, [currentQuestionIndex, quizQuestions, reviewFlags, selectedAnswers]);

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleNext = () => {
    setCurrentQuestionIndex((currentIndex) => Math.min(currentIndex + 1, quizQuestions.length - 1));
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  };

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
          <Button
            variant="text"
            startIcon={<ArrowBackOutlined />}
            onClick={() => navigate(buildCourseLearnPath(courseId))}
            sx={{ color: 'text.primary', px: 0, '&:hover': { bgcolor: 'transparent', color: 'primary.main' } }}
          >
            Back to Course: Advanced React Patterns
          </Button>

          <Chip label="Quiz Mode" sx={{ bgcolor: '#EEF2FF', color: 'primary.main', fontWeight: 700 }} />

          <Button variant="text" startIcon={<ReportProblemOutlined />} sx={{ color: 'text.secondary', px: 0, '&:hover': { bgcolor: 'transparent', color: 'primary.main' } }}>
            Report Issue
          </Button>
        </Box>

        {quizLoadError ? (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {normalizeApiError(quizLoadError).message}
          </Alert>
        ) : null}

        {isQuizLoading && !useDemoQuiz ? (
          <Alert severity="info" sx={{ mb: 2.5 }}>
            Loading lesson quiz...
          </Alert>
        ) : null}

        {!isQuizLoading && !quizLoadError && !useDemoQuiz && !activeQuiz ? (
          <Alert severity="warning" sx={{ mb: 2.5 }}>
            No quiz is configured for this lesson yet.
          </Alert>
        ) : null}

        {attemptsLoadError ? (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {normalizeApiError(attemptsLoadError).message}
          </Alert>
        ) : null}

        {submitError ? (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {normalizeApiError(submitError).message}
          </Alert>
        ) : null}

        <Grid container spacing={2.5} sx={{ alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, xl: 8 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2.5}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
                        {activeQuiz?.title ?? 'Unit 3 Assessment: React Hooks & State'}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.75, color: 'text.secondary' }}>
                        Multiple Choice • {quizQuestions.length} Questions
                      </Typography>
                    </Box>

                    <Chip
                      label={`${formatTime(remainingSeconds)} Remaining`}
                      sx={{
                        px: 1,
                        height: 44,
                        borderRadius: '999px',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main',
                        fontWeight: 800,
                      }}
                    />
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.16em' }}>
                      QUESTION {currentQuestion ? currentQuestion.number : 0} OF {quizQuestions.length}
                    </Typography>

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={currentQuestion ? Boolean(reviewFlags[currentQuestion.id]) : false}
                          disabled={!currentQuestion}
                          onChange={(event) =>
                            setReviewFlags((currentFlags) => ({
                              ...currentFlags,
                              [currentQuestion?.id ?? '']: event.target.checked,
                            }))
                          }
                        />
                      }
                      label="Mark for Review"
                    />
                  </Box>

                  {currentQuestion ? (
                    <>
                      <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.45 }}>
                        {currentQuestion.question}
                      </Typography>

                      <Stack spacing={1.5}>
                        {currentQuestion.options.map((option, optionIndex) => {
                          const selected = selectedAnswers[currentQuestion.id] === optionIndex;

                          return (
                            <Box
                              key={`${option}-${optionIndex}`}
                              component="button"
                              type="button"
                              onClick={() =>
                                setSelectedAnswers((currentAnswers) => ({
                                  ...currentAnswers,
                                  [currentQuestion.id]: optionIndex,
                                }))
                              }
                              aria-pressed={selected}
                              sx={{
                                width: '100%',
                                textAlign: 'left',
                                p: 0,
                                border: '1px solid',
                                borderColor: selected ? 'primary.main' : '#E2E8F0',
                                borderRadius: '12px',
                                bgcolor: selected ? alpha('#0066FF', 0.06) : '#FFFFFF',
                                transition: 'all 160ms ease',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  boxShadow: '0 8px 20px rgba(0,102,255,0.08)',
                                },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.8 }}>
                                <Radio checked={selected} sx={{ color: selected ? 'secondary.main' : 'text.secondary' }} />
                                <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                  {option}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Stack>
                    </>
                  ) : (
                    <Alert severity="info">No questions are available for this quiz yet.</Alert>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, pt: 1.5, flexWrap: 'wrap' }}>
                    <Button variant="outlined" startIcon={<ArrowBackOutlined />} onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                      Previous
                    </Button>
                    <Button variant="contained" endIcon={<ArrowForwardOutlined />} onClick={handleNext}>
                      Next Question
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, xl: 4 }}>
            <Stack spacing={2.5} sx={{ height: '100%' }}>
              <Card>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Question Navigator
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                        Jump to any question and track progress instantly.
                      </Typography>
                    </Box>

                    <Grid container spacing={1.2}>
                      {quizQuestions.map((question, index) => {
                        const status = questionStatuses[index];
                        const isCurrent = status === 'current';
                        const isAnswered = status === 'answered';
                        const isMarked = status === 'review';

                        return (
                          <Grid key={question.id} size={3}>
                            <Box
                              component="button"
                              type="button"
                              onClick={() => goToQuestion(index)}
                              aria-label={`Go to question ${question.number}`}
                              sx={{
                                width: '100%',
                                height: 42,
                                borderRadius: '12px',
                                border: '1px solid',
                                borderColor: isCurrent ? 'primary.main' : isMarked ? '#F59E0B' : isAnswered ? 'primary.main' : '#E2E8F0',
                                bgcolor: isCurrent ? alpha(theme.palette.primary.main, 0.08) : isMarked ? alpha(theme.palette.warning.main, 0.14) : isAnswered ? 'primary.main' : '#FFFFFF',
                                color: isCurrent ? 'primary.main' : isMarked ? '#B45309' : isAnswered ? '#FFFFFF' : 'text.primary',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 160ms ease',
                                '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 18px rgba(15,23,42,0.08)' },
                              }}
                            >
                              {question.number}
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>

                    <Divider />

                    <Stack spacing={1.25}>
                      <LegendItem color={theme.palette.primary.main} label="Answered" />
                      <LegendItem color="#FFFFFF" label="Current" border />
                      <LegendItem color={theme.palette.warning.main} label="Marked for Review" />
                      <LegendItem color="#CBD5E1" label="Not Visited" />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Stack spacing={2}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Ready to finish?
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Make sure you have answered all questions before submitting.
                    </Typography>
                    {latestAttempt ? (
                      <Alert severity={latestAttempt.passed ? 'success' : 'warning'}>
                        Last score: {latestAttempt.percentage}% ({latestAttempt.passed ? 'Passed' : 'Not passed'})
                      </Alert>
                    ) : null}
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      size="large"
                      sx={{ py: 1.4 }}
                      onClick={() => {
                        if (!activeQuiz?._id || !currentQuestion) {
                          return;
                        }

                        const answers = buildQuizAttemptAnswers(selectedAnswers, quizQuestions);
                        void submitAttempt(activeQuiz._id, answers);
                      }}
                      disabled={isSubmitting || isQuizLoading || !currentQuestion || !activeQuiz?._id}
                    >
                      Submit Quiz
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
    </Box>
  );
}

function LegendItem({ color, label, border = false }: { color: string; label: string; border?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '999px',
          bgcolor: color,
          border: border ? '1px solid #94A3B8' : 'none',
        }}
      />
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  );
}
