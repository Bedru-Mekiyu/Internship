import { baseApi } from './baseApi';

export interface DiscussionAuthor {
  _id?: string;
  firstName?: string;
  lastName?: string;
}

export interface ApiDiscussion {
  _id: string;
  title: string;
  content: string;
  createdAt?: string;
  user?: DiscussionAuthor;
}

export interface DiscussionCourseRef {
  courseId: string;
  title: string;
}

export interface PostCourseDiscussionPayload {
  courseId: string;
  title: string;
  content: string;
}

export const discussionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccessibleDiscussionCourses: builder.query<DiscussionCourseRef[], void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBQ) {
        const normalizeCourses = (courses: Array<{ id?: string; title?: string }>) => {
          return courses
            .filter((course): course is { id: string; title: string } => Boolean(course.id && course.title))
            .map((course) => ({
              courseId: course.id,
              title: course.title,
            }));
        };

        const studentResult = await fetchWithBQ('/api/dashboard/student');
        if (studentResult.data && !studentResult.error) {
          const payload = studentResult.data as { enrolledCourses?: Array<{ courseId?: string; title?: string }> };
          const studentCourses = normalizeCourses(
            (payload.enrolledCourses ?? []).map((course) => ({ id: course.courseId, title: course.title })),
          );

          if (studentCourses.length > 0) {
            return { data: studentCourses };
          }
        }

        const instructorResult = await fetchWithBQ('/api/dashboard/instructor');
        if (instructorResult.data && !instructorResult.error) {
          const payload = instructorResult.data as { courses?: Array<{ _id?: string; title?: string }> };
          const instructorCourses = normalizeCourses(
            (payload.courses ?? []).map((course) => ({ id: course._id, title: course.title })),
          );

          if (instructorCourses.length > 0) {
            return { data: instructorCourses };
          }
        }

        const coursesResult = await fetchWithBQ('/api/courses');
        if (coursesResult.error) {
          return { error: coursesResult.error };
        }

        const payload = (coursesResult.data as Array<{ _id?: string; title?: string }>) ?? [];
        return {
          data: normalizeCourses(payload.map((course) => ({ id: course._id, title: course.title }))),
        };
      },
      providesTags: ['Course'],
    }),
    getCourseDiscussions: builder.query<ApiDiscussion[], string>({
      query: (courseId) => ({
        url: `/api/discussions/course/${courseId}`,
      }),
      providesTags: (_result, _error, courseId) => [{ type: 'Discussion', id: courseId }],
    }),
    postCourseDiscussion: builder.mutation<{ message?: string }, PostCourseDiscussionPayload>({
      query: ({ courseId, title, content }) => ({
        url: `/api/discussions/course/${courseId}`,
        method: 'POST',
        body: {
          title,
          content,
        },
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Discussion', id: arg.courseId }],
    }),
  }),
});

export const {
  useGetAccessibleDiscussionCoursesQuery,
  useGetCourseDiscussionsQuery,
  usePostCourseDiscussionMutation,
} = discussionApi;
