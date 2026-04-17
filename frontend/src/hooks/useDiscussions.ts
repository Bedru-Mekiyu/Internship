import {
  useGetAccessibleDiscussionCoursesQuery,
  useGetCourseDiscussionsQuery,
  usePostCourseDiscussionMutation,
} from '../store/api/discussionApi';

export const useAccessibleDiscussionCourses = () => {
  const query = useGetAccessibleDiscussionCoursesQuery();

  return {
    courses: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useCourseDiscussions = (courseId: string) => {
  const query = useGetCourseDiscussionsQuery(courseId, {
    skip: !courseId,
  });

  return {
    discussions: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};

export const usePostDiscussion = () => {
  const [postCourseDiscussion, state] = usePostCourseDiscussionMutation();

  const postDiscussion = async (courseId: string, payload: { title: string; content: string }) => {
    return postCourseDiscussion({ courseId, ...payload }).unwrap();
  };

  return {
    postDiscussion,
    isPosting: state.isLoading,
    error: state.error,
  };
};
