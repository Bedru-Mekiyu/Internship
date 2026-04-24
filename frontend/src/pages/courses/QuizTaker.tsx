import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  Radio,
  Stack,
  Typography,
} from '@mui/material';
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
  }, [activeQuiz]);

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
      if (!activeQuiz) {
        setRemainingSeconds(24 * 60 + 15);
        return;
      }

      const configuredMinutes = Number(activeQuiz.timeLimit || 25);
      setRemainingSeconds(Math.max(60, configuredMinutes * 60));
    }, 0);

    return () => window.clearTimeout(resetTimer);
  }, [activeQuiz]);

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

  if (!lessonId) {
    return (
      <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Alert severity="warning">Select a lesson with a configured quiz to continue.</Alert>
      </Box>
    );
  }

  return (
      <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
          <Button
            variant="text"
            onClick={() => navigate(buildCourseLearnPath(courseId))}
            sx={{ color: 'text.primary', px: 0, '&:hover': { bgcolor: 'transparent', color: 'primary.main' } }}
          >
            Back to Course
          </Button>
        </Box>

        {quizLoadError ? (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {normalizeApiError(quizLoadError).message}
          </Alert>
        ) : null}

        {isQuizLoading ? (
          <Alert severity="info" sx={{ mb: 2.5 }}>
            Loading lesson quiz...
          </Alert>
        ) : null}

        {!isQuizLoading && !quizLoadError && !activeQuiz ? (
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
            <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2.5}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
                        {activeQuiz?.title ?? 'Lesson Quiz'}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.75, color: 'text.secondary' }}>
                        Multiple Choice • {quizQuestions.length} Questions
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {formatTime(remainingSeconds)} Remaining
                    </Typography>
                  </Box>

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
                                 borderColor: selected ? 'primary.main' : 'divider',
                                 borderRadius: 1.5,
                                 bgcolor: selected ? 'background.default' : 'background.paper',
                                 transition: 'border-color 160ms ease',
                                 overflow: 'hidden',
                                 cursor: 'pointer',
                                '&:hover': {
                                  borderColor: 'primary.main',
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
                    <Button variant="outlined" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                      Previous
                    </Button>
                    <Button variant="contained" onClick={handleNext}>
                      Next Question
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, xl: 4 }}>
            <Stack spacing={2.5} sx={{ height: '100%' }}>
              <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
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
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: isCurrent ? 'primary.main' : isMarked ? 'warning.main' : isAnswered ? 'primary.main' : 'divider',
                                bgcolor: isCurrent ? 'background.default' : isMarked ? 'warning.light' : isAnswered ? 'primary.main' : 'background.paper',
                                color: isCurrent ? 'primary.main' : isMarked ? 'warning.dark' : isAnswered ? '#FFFFFF' : 'text.primary',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'border-color 160ms ease',
                              }}
                            >
                              {question.number}
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>

                    <Stack spacing={1.25}>
                      <LegendItem color={theme.palette.primary.main} label="Answered" />
                      <LegendItem color="#FFFFFF" label="Current" border />
                      <LegendItem color={theme.palette.warning.main} label="Marked for Review" />
                      <LegendItem color={theme.palette.divider} label="Not Visited" />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
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
          borderRadius: 999,
          bgcolor: color,
          border: border ? '1px solid' : 'none',
          borderColor: border ? 'divider' : 'transparent',
        }}
      />
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  );
}
