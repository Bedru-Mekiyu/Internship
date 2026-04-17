import {
  useCreateCourseReviewMutation,
  useEnrollInCourseMutation,
  useGetCourseByIdQuery,
  useGetCourseModulesQuery,
  useGetCourseProgressQuery,
  useGetCoursesQuery,
} from '../store/api/courseApi';
import type { CourseReviewPayload } from '../types';

export const useCourses = () => {
  const coursesQuery = useGetCoursesQuery();
  const [enrollInCourse, enrollState] = useEnrollInCourseMutation();
  const [createCourseReview, reviewState] = useCreateCourseReviewMutation();

  const enroll = async (courseId: string) => {
    await enrollInCourse(courseId).unwrap();
  };

  const review = async (courseId: string, payload: CourseReviewPayload) => {
    await createCourseReview({ courseId, payload }).unwrap();
  };

  return {
    courses: coursesQuery.data ?? [],
    isLoading: coursesQuery.isLoading,
    isFetching: coursesQuery.isFetching,
    error: coursesQuery.error,
    refetch: coursesQuery.refetch,
    enroll,
    isEnrolling: enrollState.isLoading,
    review,
    isSubmittingReview: reviewState.isLoading,
  };
};

export const useCourseDetail = (courseId: string) => {
  return useGetCourseByIdQuery(courseId, {
    skip: !courseId,
  });
};

export const useCourseModules = (courseId: string) => {
  return useGetCourseModulesQuery(courseId, {
    skip: !courseId,
  });
};

export const useCourseProgress = (courseId: string) => {
  return useGetCourseProgressQuery(courseId, {
    skip: !courseId,
  });
};
