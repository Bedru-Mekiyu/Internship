import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Radio,
  Stack,
  Typography,
} from '@mui/material';
import {
  AccessTimeOutlined,
  ArrowBackOutlined,
  ArrowForwardOutlined,
  BookmarkBorderOutlined,
  ChevronLeftOutlined,
  FlagOutlined,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { normalizeApiError } from '../../services/api';
import { buildCourseLearnPath } from '../../services/lessonFlow';
import { useLessonQuiz, useQuizAttemptsMe, useSubmitQuizAttempt } from '../../hooks/useQuiz';
import { useGetCourseByIdQuery } from '../../store/api/courseApi';

type QuestionStatus = 'not-visited' | 'answered' | 'review' | 'current';

interface QuizQuestion {
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
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number | null>>({});
  const [reviewFlags, setReviewFlags] = useState<Record<number, boolean>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Record<number, boolean>>({ 0: true });
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'warning'; message: string } | null>(null);
  const autoSubmitTriggeredRef = useRef(false);
  const prevQuizIdRef = useRef<string | undefined>(undefined);

  const { data: course } = useGetCourseByIdQuery(courseId ?? '', { skip: !courseId });
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

  const totalPoints = useMemo(() => {
    if (!activeQuiz) return 0;
    if (typeof activeQuiz.totalPoints === 'number') return activeQuiz.totalPoints;
    return (activeQuiz.questions || []).reduce((sum, item) => sum + Number(item.points || 1), 0);
  }, [activeQuiz]);

  const initialTimeRemaining = useMemo(() => {
    if (!activeQuiz) return 24 * 60 + 15;
    const configuredMinutes = Number(activeQuiz.timeLimit || 25);
    return Math.max(60, configuredMinutes * 60);
  }, [activeQuiz]);

  const [remainingSeconds, setRemainingSeconds] = useState(initialTimeRemaining);

  useEffect(() => {
    setRemainingSeconds(initialTimeRemaining);
  }, [initialTimeRemaining, setRemainingSeconds]);

  useEffect(() => {
    if (prevQuizIdRef.current === activeQuiz?._id) {
      return;
    }
    prevQuizIdRef.current = activeQuiz?._id;

    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setReviewFlags({});
    setVisitedQuestions({ 0: true });
    setSubmitStatus(null);
    autoSubmitTriggeredRef.current = false;
  }, [activeQuiz?._id]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) => Math.max(0, currentSeconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (remainingSeconds > 0 || !activeQuiz?._id || autoSubmitTriggeredRef.current) {
      return;
    }
    autoSubmitTriggeredRef.current = true;

    const answers = Object.entries(selectedAnswers)
      .filter(([, optionIndex]) => typeof optionIndex === 'number')
      .map(([questionIndex, optionIndex]) => {
        const index = Number(questionIndex);
        const answer = quizQuestions[index]?.options?.[Number(optionIndex)] ?? null;
        return { questionIndex: index, answer };
      })
      .filter((entry) => entry.questionIndex >= 0);

    void submitAttempt(activeQuiz._id, answers)
      .then((attempt) => {
        setSubmitStatus({
          type: attempt.passed ? 'success' : 'warning',
          message: `Time is up. Submitted automatically. Score: ${attempt.percentage}% (${attempt.passed ? 'Passed' : 'Not passed'}).`,
        });
      })
      .catch(() => {
        autoSubmitTriggeredRef.current = false;
      });
  }, [activeQuiz?._id, quizQuestions, remainingSeconds, selectedAnswers, submitAttempt]);

  const safeQuestionIndex = useMemo(() => {
    if (quizQuestions.length === 0) return 0;
    return Math.min(currentQuestionIndex, quizQuestions.length - 1);
  }, [currentQuestionIndex, quizQuestions.length]);

  const currentQuestion = quizQuestions[safeQuestionIndex];
  const latestAttempt = attempts[0];
  const answeredCount = useMemo(
    () => Object.values(selectedAnswers).filter((value) => typeof value === 'number').length,
    [selectedAnswers],
  );

  const questionStatuses = useMemo(() => {
    return quizQuestions.map((_, index) => {
      if (index === safeQuestionIndex) {
        return 'current' as QuestionStatus;
      }
      if (reviewFlags[index]) {
        return 'review' as QuestionStatus;
      }
      if (typeof selectedAnswers[index] === 'number') {
        return 'answered' as QuestionStatus;
      }
      if (visitedQuestions[index]) {
        return 'not-visited' as QuestionStatus;
      }
      return 'not-visited' as QuestionStatus;
    });
  }, [safeQuestionIndex, quizQuestions, reviewFlags, selectedAnswers, visitedQuestions]);

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setVisitedQuestions((current) => ({ ...current, [index]: true }));
  };

  const handleNext = () => {
    setCurrentQuestionIndex((currentIndex) => {
      const nextIndex = Math.min(currentIndex + 1, quizQuestions.length - 1);
      setVisitedQuestions((current) => ({ ...current, [nextIndex]: true }));
      return nextIndex;
    });
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex((currentIndex) => {
      const nextIndex = Math.max(currentIndex - 1, 0);
      setVisitedQuestions((current) => ({ ...current, [nextIndex]: true }));
      return nextIndex;
    });
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz?._id) {
      return;
    }

    const answers = Object.entries(selectedAnswers)
      .filter(([, optionIndex]) => typeof optionIndex === 'number')
      .map(([questionIndex, optionIndex]) => {
        const index = Number(questionIndex);
        const answer = quizQuestions[index]?.options?.[Number(optionIndex)] ?? null;
        return { questionIndex: index, answer };
      })
      .filter((entry) => entry.questionIndex >= 0);

    try {
      const attempt = await submitAttempt(activeQuiz._id, answers);
      setSubmitStatus({
        type: attempt.passed ? 'success' : 'warning',
        message: `Submitted successfully. Score: ${attempt.percentage}% (${attempt.passed ? 'Passed' : 'Not passed'}).`,
      });
    } catch {
      // handled by submitError alert
    }
  };

  if (!lessonId) {
    return (
      <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Alert severity="warning">Select a lesson with a configured quiz to continue.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 1.75, sm: 2.25, md: 2.75 } }}>
      <Card sx={{ mb: 1.75, borderColor: 'divider' }}>
        <CardContent sx={{ px: 2.2, py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2, flexWrap: 'wrap' }}>
            <Button
              variant="text"
              onClick={() => navigate(buildCourseLearnPath(courseId))}
              sx={{ color: 'text.secondary', px: 0, minWidth: 0, fontWeight: 500 }}
              startIcon={<ChevronLeftOutlined />}
            >
              Back to Course: {course?.title || 'Course'}
            </Button>
            <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Quiz Mode
              </Typography>
              <Button variant="outlined" size="small" startIcon={<FlagOutlined />} sx={{ borderColor: '#D5DBE7' }}>
                Report Issue
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {quizLoadError ? (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {normalizeApiError(quizLoadError).message}
        </Alert>
      ) : null}

      {isQuizLoading ? (
        <Alert severity="info" sx={{ mb: 1.5 }}>
          Loading lesson quiz...
        </Alert>
      ) : null}

      {!isQuizLoading && !quizLoadError && !activeQuiz ? (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          No quiz is configured for this lesson yet.
        </Alert>
      ) : null}

      {attemptsLoadError ? (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {normalizeApiError(attemptsLoadError).message}
        </Alert>
      ) : null}

      {submitError ? (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {normalizeApiError(submitError).message}
        </Alert>
      ) : null}

      {submitStatus ? (
        <Alert severity={submitStatus.type} sx={{ mb: 1.5 }}>
          {submitStatus.message}
        </Alert>
      ) : null}

      <Card sx={{ mb: 1.75, borderColor: 'divider' }}>
        <CardContent sx={{ px: 2.5, py: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', fontSize: { xs: '1.35rem', md: '2rem' } }}>
                {activeQuiz?.title ?? 'Assessment Quiz'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Multiple Choice • {quizQuestions.length} Questions • {totalPoints} Points
              </Typography>
            </Box>
            <Box
              sx={{
                px: 1.6,
                py: 0.9,
                borderRadius: 1.2,
                bgcolor: '#ECF2FF',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                fontWeight: 700,
              }}
            >
              <AccessTimeOutlined sx={{ fontSize: 18 }} />
              <Typography variant="body1" sx={{ fontWeight: 800 }}>
                {formatTime(remainingSeconds)} Remaining
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={1.75} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, xl: 8.6 }}>
          <Card sx={{ height: '100%', borderColor: 'divider' }}>
            <CardContent sx={{ p: { xs: 2.1, md: 2.6 } }}>
              <Stack spacing={2.1}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.09em' }}>
                    QUESTION {currentQuestion ? currentQuestion.number : 0} OF {quizQuestions.length}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<BookmarkBorderOutlined />}
                    disabled={!currentQuestion}
                    onClick={() => {
                      if (typeof safeQuestionIndex !== 'number') return;
                      setReviewFlags((current) => ({
                        ...current,
                        [safeQuestionIndex]: !current[safeQuestionIndex],
                      }));
                    }}
                    sx={{ borderColor: '#D5DBE7' }}
                  >
                    Mark for Review
                  </Button>
                </Box>

                {currentQuestion ? (
                  <>
                    <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.4 }}>
                      {currentQuestion.question}
                    </Typography>

                    <Stack spacing={1.15}>
                      {currentQuestion.options.map((option, optionIndex) => {
                        const selected = selectedAnswers[safeQuestionIndex] === optionIndex;

                        return (
                          <Box
                            key={`${option}-${optionIndex}`}
                            component="button"
                            type="button"
                            onClick={() => {
                              setSelectedAnswers((currentAnswers) => ({
                                ...currentAnswers,
                                [safeQuestionIndex]: optionIndex,
                              }));
                              setVisitedQuestions((current) => ({ ...current, [safeQuestionIndex]: true }));
                            }}
                            aria-pressed={selected}
                            sx={{
                              width: '100%',
                              textAlign: 'left',
                              p: 0,
                              border: '1px solid',
                              borderColor: selected ? 'primary.main' : '#D7DFEC',
                              borderRadius: 1,
                              bgcolor: '#FFFFFF',
                              transition: 'border-color 150ms ease',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              '&:hover': {
                                borderColor: 'primary.main',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.15, px: 1.4, py: 1.1 }}>
                              <Radio checked={selected} sx={{ color: selected ? 'primary.main' : '#94A3B8', p: 0.4 }} />
                              <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
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

                <Box sx={{ height: 1, bgcolor: 'divider', mt: 0.5 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    onClick={handlePrevious}
                    disabled={safeQuestionIndex === 0}
                    startIcon={<ArrowBackOutlined />}
                    sx={{ borderColor: '#D5DBE7', color: 'text.primary' }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForwardOutlined />}
                    disabled={safeQuestionIndex >= quizQuestions.length - 1}
                  >
                    Next Question
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, xl: 3.4 }}>
          <Stack spacing={1.75} sx={{ height: '100%' }}>
            <Card sx={{ borderColor: 'divider' }}>
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Question Navigator
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 0.8 }}>
                    {quizQuestions.map((question, index) => {
                      const status = questionStatuses[index];
                      const isCurrent = status === 'current';
                      const isAnswered = status === 'answered';
                      const isMarked = status === 'review';

                      return (
                        <Box
                          key={`${question.number}`}
                          component="button"
                          type="button"
                          onClick={() => goToQuestion(index)}
                          aria-label={`Go to question ${question.number}`}
                          sx={{
                            width: '100%',
                            height: 34,
                            borderRadius: 0.75,
                            border: '1px solid',
                            borderColor: isCurrent ? '#F4B84A' : isMarked ? '#F4B84A' : isAnswered ? '#4F46E5' : '#CFD6E4',
                            bgcolor: isAnswered ? '#4F46E5' : '#EEF3FB',
                            color: isAnswered ? '#FFFFFF' : isCurrent || isMarked ? '#D27A00' : 'text.secondary',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                          }}
                        >
                          {question.number}
                        </Box>
                      );
                    })}
                  </Box>

                  <Stack spacing={0.8} sx={{ pt: 0.4 }}>
                    <LegendItem color="#4F46E5" label="Answered" />
                    <LegendItem color="#A78BFA" label="Current" />
                    <LegendItem color="#F59E0B" label="Marked for Review" />
                    <LegendItem color="#D1D5DB" label="Not Visited" />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderColor: 'divider' }}>
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1.25} sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Ready to finish?
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Make sure you have answered all questions before submitting.
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {answeredCount} / {quizQuestions.length} answered
                  </Typography>
                  {latestAttempt ? (
                    <Alert severity={latestAttempt.passed ? 'success' : 'warning'} sx={{ textAlign: 'left' }}>
                      Last attempt: {latestAttempt.percentage}% ({latestAttempt.passed ? 'Passed' : 'Not passed'})
                    </Alert>
                  ) : null}
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={() => void handleSubmitQuiz()}
                    disabled={isSubmitting || isQuizLoading || !activeQuiz?._id}
                    sx={{ py: 1.1 }}
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

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: 999,
          bgcolor: color,
        }}
      />
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Box>
  );
}
