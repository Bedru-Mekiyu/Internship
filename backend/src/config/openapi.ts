/**
 * OpenAPI 3.0 specification for the LearnSpace backend API.
 *
 * This is the single source of truth for the public API contract.
 * It covers all route groups and their most important endpoints.
 */
export const openapi: Record<string, unknown> = {
  openapi: '3.0.3',
  info: {
    title: 'LearnSpace API',
    version: '1.0.0',
    description: `RESTful backend API for the LearnSpace learning management platform.

## Authentication

Most endpoints require a valid JWT access token. There are two ways to authenticate:

1. **Cookie-based** (recommended for browsers): An \`accessToken\` HTTP-only cookie is set after login.
2. **Bearer header**: \`Authorization: Bearer <token>\`

Refresh tokens are exchanged via the \`/api/auth/refresh-token\` endpoint.

## Roles

The system recognises four roles: \`student\`, \`instructor\`, \`admin\`, and \`content_manager\`.
Many endpoints enforce role-based access control (RBAC).`,
    contact: {
      name: 'LearnSpace Team',
      url: 'https://learnspace.example.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local development server',
    },
    {
      url: 'https://api.learnspace.example.com',
      description: 'Production server',
    },
  ],
  paths: {
    // ── Health ──────────────────────────────────────────────────────────
    '/healthz': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        operationId: 'healthCheck',
        responses: {
          '200': {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string', example: 'ok' } },
                },
              },
            },
          },
        },
      },
    },
    '/readyz': {
      get: {
        tags: ['System'],
        summary: 'Readiness check',
        operationId: 'readinessCheck',
        responses: {
          '200': {
            description: 'Server is ready (MongoDB connected)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ready' },
                    mongo: { type: 'string', example: 'connected' },
                  },
                },
              },
            },
          },
          '503': {
            description: 'Server is not ready (MongoDB disconnected)',
          },
        },
      },
    },

    // ── Auth ────────────────────────────────────────────────────────────
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user account',
        operationId: 'register',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'jane@example.com' },
                  password: { type: 'string', minLength: 8, example: 's3cur3P@ss' },
                  firstName: { type: 'string', example: 'Jane' },
                  lastName: { type: 'string', example: 'Doe' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User registered successfully' },
          '409': { description: 'Email already in use' },
          '400': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in with email and password',
        operationId: 'login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'jane@example.com' },
                  password: { type: 'string', example: 's3cur3P@ss' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful — sets accessToken cookie and returns user data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': { description: 'Invalid email or password' },
          '429': { description: 'Too many login attempts' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Log out (clear refresh token)',
        operationId: 'logout',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Logged out successfully' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        operationId: 'refreshToken',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Tokens refreshed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': { description: 'Invalid or expired refresh token' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user',
        operationId: 'getMe',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Current user profile',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request password reset email',
        operationId: 'forgotPassword',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Reset email sent (if account exists)' },
          '429': { description: 'Too many requests' },
        },
      },
    },
    '/api/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password using token from email',
        operationId: 'resetPassword',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                  token: { type: 'string', description: 'Reset token received via email' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Password reset successfully' },
          '400': { description: 'Invalid or expired token' },
        },
      },
    },
    '/api/auth/verify-email/{token}': {
      get: {
        tags: ['Auth'],
        summary: 'Verify email address with token',
        operationId: 'verifyEmail',
        parameters: [
          { name: 'token', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Email verified successfully' },
          '400': { description: 'Invalid or expired token' },
        },
      },
    },
    '/api/auth/resend-verification': {
      post: {
        tags: ['Auth'],
        summary: 'Resend email verification link',
        operationId: 'resendVerification',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Verification email resent' },
          '429': { description: 'Too many requests' },
        },
      },
    },
    '/api/auth/csrf-token': {
      get: {
        tags: ['Auth'],
        summary: 'Get CSRF token for state-changing requests',
        operationId: 'getCsrfToken',
        responses: {
          '200': {
            description: 'CSRF token',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { csrfToken: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },

    // ── Courses ─────────────────────────────────────────────────────────
    '/api/courses': {
      get: {
        tags: ['Courses'],
        summary: 'List courses (optionally filtered)',
        operationId: 'getCourses',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['draft', 'published', 'archived'] } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'level', in: 'query', schema: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
        ],
        responses: {
          '200': {
            description: 'Paginated list of courses',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedCourses' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Courses'],
        summary: 'Create a new course (instructor / admin)',
        operationId: 'createCourse',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CourseInput' } } },
        },
        responses: {
          '201': { description: 'Course created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Course' } } } },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/courses/{id}': {
      get: {
        tags: ['Courses'],
        summary: 'Get course by ID',
        operationId: 'getCourseById',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Course details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Course' } } } },
          '404': { description: 'Course not found' },
        },
      },
      put: {
        tags: ['Courses'],
        summary: 'Update course (instructor / admin)',
        operationId: 'updateCourse',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CourseInput' } } },
        },
        responses: {
          '200': { description: 'Course updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Course' } } } },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { description: 'Course not found' },
        },
      },
      delete: {
        tags: ['Courses'],
        summary: 'Delete course (instructor / admin)',
        operationId: 'deleteCourse',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Course deleted' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { description: 'Course not found' },
        },
      },
    },
    '/api/courses/{id}/enroll': {
      post: {
        tags: ['Courses'],
        summary: 'Enrol in a course (student)',
        operationId: 'enrollCourse',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Enrolled successfully' },
          '400': { description: 'Already enrolled or course unavailable' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { description: 'Course not found' },
        },
      },
    },
    '/api/courses/{id}/progress': {
      get: {
        tags: ['Courses'],
        summary: 'Get course progress (student)',
        operationId: 'getCourseProgress',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Course progress',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    progress: { type: 'number', example: 45 },
                    completedLessons: { type: 'array', items: { type: 'string' } },
                    status: { type: 'string', enum: ['enrolled', 'completed', 'dropped'] },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      patch: {
        tags: ['Courses'],
        summary: 'Update course progress (student)',
        operationId: 'updateCourseProgress',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  progress: { type: 'number', minimum: 0, maximum: 100 },
                  completedLessons: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Progress updated' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/courses/{id}/lessons/{lessonId}/complete': {
      post: {
        tags: ['Courses'],
        summary: 'Mark a lesson as completed (student)',
        operationId: 'completeCourseLesson',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'lessonId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Lesson marked complete' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { description: 'Course or lesson not found' },
        },
      },
    },
    '/api/courses/{id}/review': {
      post: {
        tags: ['Courses'],
        summary: 'Add a review for a course (student)',
        operationId: 'createCourseReview',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['rating'],
                properties: {
                  rating: { type: 'number', minimum: 1, maximum: 5 },
                  comment: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Review created' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/courses/{id}/modules': {
      get: {
        tags: ['Courses - Modules'],
        summary: 'Get modules for a course',
        operationId: 'getCourseModules',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'List of modules',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Module' },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Courses - Modules'],
        summary: 'Add a module to a course (instructor / admin)',
        operationId: 'addCourseModule',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'order'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  order: { type: 'integer' },
                  type: { type: 'string', default: 'Core' },
                  status: { type: 'string', enum: ['draft', 'published'], default: 'draft' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Module created' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/courses/modules/{moduleId}': {
      put: {
        tags: ['Courses - Modules'],
        summary: 'Update a module (instructor / admin)',
        operationId: 'updateCourseModule',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'moduleId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  order: { type: 'integer' },
                  status: { type: 'string', enum: ['draft', 'published'] },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Module updated' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { description: 'Module not found' },
        },
      },
      delete: {
        tags: ['Courses - Modules'],
        summary: 'Delete a module (instructor / admin)',
        operationId: 'deleteCourseModule',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'moduleId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Module deleted' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { description: 'Module not found' },
        },
      },
    },
    '/api/courses/{id}/modules/reorder': {
      patch: {
        tags: ['Courses - Modules'],
        summary: 'Reorder modules (instructor / admin)',
        operationId: 'reorderModules',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['moduleIds'],
                properties: {
                  moduleIds: { type: 'array', items: { type: 'string' }, description: 'Ordered array of module IDs' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Modules reordered' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/courses/modules/{moduleId}/lessons': {
      post: {
        tags: ['Courses - Lessons'],
        summary: 'Add a lesson to a module (instructor / admin)',
        operationId: 'addModuleLesson',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'moduleId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'content', 'type'],
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                  videoUrl: { type: 'string' },
                  type: { type: 'string', enum: ['video', 'text', 'quiz', 'assignment'] },
                  duration: { type: 'integer', description: 'Duration in minutes' },
                  order: { type: 'integer' },
                  status: { type: 'string', enum: ['draft', 'published', 'scheduled'], default: 'draft' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Lesson created' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/courses/modules/{moduleId}/lessons/{lessonId}': {
      put: {
        tags: ['Courses - Lessons'],
        summary: 'Update a lesson (instructor / admin)',
        operationId: 'updateModuleLesson',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'moduleId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'lessonId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                  videoUrl: { type: 'string' },
                  type: { type: 'string', enum: ['video', 'text', 'quiz', 'assignment'] },
                  duration: { type: 'integer' },
                  order: { type: 'integer' },
                  status: { type: 'string', enum: ['draft', 'published', 'scheduled'] },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Lesson updated' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { description: 'Lesson not found' },
        },
      },
      delete: {
        tags: ['Courses - Lessons'],
        summary: 'Delete a lesson (instructor / admin)',
        operationId: 'deleteModuleLesson',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'moduleId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'lessonId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Lesson deleted' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { description: 'Lesson not found' },
        },
      },
    },
    '/api/courses/modules/{moduleId}/lessons/reorder': {
      patch: {
        tags: ['Courses - Lessons'],
        summary: 'Reorder lessons within a module (instructor / admin)',
        operationId: 'reorderLessons',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'moduleId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['lessonIds'],
                properties: {
                  lessonIds: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Lessons reordered' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    // ── Assignments ─────────────────────────────────────────────────────
    '/api/assignments/course/{courseId}': {
      get: {
        tags: ['Assignments'],
        summary: 'List assignments for a course',
        operationId: 'getAssignmentsByCourse',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'courseId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'List of assignments',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Assignment' } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Assignments'],
        summary: 'Create an assignment (instructor / admin)',
        operationId: 'createAssignment',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'courseId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  dueDate: { type: 'string', format: 'date-time' },
                  moduleId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Assignment created' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/assignments/course/{courseId}/analytics': {
      get: {
        tags: ['Assignments'],
        summary: 'Get assignment analytics for a course (instructor / admin)',
        operationId: 'getAssignmentAnalyticsByCourse',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'courseId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Assignment analytics data' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/assignments/course/{courseId}/submissions/me': {
      get: {
        tags: ['Assignments'],
        summary: 'Get my submissions for a course (student)',
        operationId: 'getMySubmissionsByCourse',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'courseId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'My submissions',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Submission' } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/assignments/{assignmentId}/submissions': {
      post: {
        tags: ['Assignments'],
        summary: 'Submit an assignment (student)',
        operationId: 'submitAssignment',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'assignmentId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { content: { type: 'string', description: 'Submission text or file references' } },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Assignment submitted' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
      get: {
        tags: ['Assignments'],
        summary: 'Get all submissions for an assignment (instructor / admin)',
        operationId: 'getAssignmentSubmissions',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'assignmentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'List of submissions',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Submission' } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/assignments/{assignmentId}/submissions/{submissionId}/grade': {
      patch: {
        tags: ['Assignments'],
        summary: 'Grade a submission (instructor / admin)',
        operationId: 'gradeAssignmentSubmission',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'assignmentId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'submissionId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['grade'],
                properties: { grade: { type: 'number', minimum: 0, maximum: 100 } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Submission graded' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { description: 'Submission not found' },
        },
      },
    },

    // ── Live Sessions ───────────────────────────────────────────────────
    '/api/live-sessions/course/{courseId}': {
      get: {
        tags: ['Live Sessions'],
        summary: 'Get live sessions for a course',
        operationId: 'getLiveSessionsByCourse',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'courseId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'List of live sessions',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/LiveSession' } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Live Sessions'],
        summary: 'Create a live session (instructor / admin)',
        operationId: 'createLiveSession',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'courseId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'meetingUrl', 'startsAt'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  provider: { type: 'string', enum: ['jitsi', 'google-meet', 'zoom', 'custom'], default: 'custom' },
                  meetingUrl: { type: 'string', format: 'uri' },
                  startsAt: { type: 'string', format: 'date-time' },
                  endsAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Live session created' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '429': { description: 'Too many session creation requests' },
        },
      },
    },
    '/api/live-sessions/{sessionId}/status': {
      patch: {
        tags: ['Live Sessions'],
        summary: 'Update live session status (instructor / admin)',
        operationId: 'updateLiveSessionStatus',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['scheduled', 'live', 'completed', 'cancelled'] },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Session status updated' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { description: 'Session not found' },
        },
      },
    },

    // ── Quizzes ─────────────────────────────────────────────────────────
    '/api/quizzes/lesson/{lessonId}': {
      get: {
        tags: ['Quizzes'],
        summary: 'Get quizzes for a lesson',
        operationId: 'getQuizzesByLesson',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'lessonId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'List of quizzes',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Quiz' } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Quizzes'],
        summary: 'Create a quiz for a lesson (instructor / admin)',
        operationId: 'createQuiz',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'lessonId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'questions'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  timeLimit: { type: 'integer', description: 'Time limit in minutes' },
                  attempts: { type: 'integer', default: 1 },
                  passingScore: { type: 'integer', default: 70 },
                  isPublished: { type: 'boolean', default: true },
                  questions: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/QuizQuestionInput' },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Quiz created' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/quizzes/all-attempts/me': {
      get: {
        tags: ['Quizzes'],
        summary: 'Get all my quiz attempts (student)',
        operationId: 'getMyAllQuizAttempts',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'All quiz attempts for the current user' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/quizzes/{quizId}/attempts': {
      get: {
        tags: ['Quizzes'],
        summary: 'Get all attempts for a quiz (instructor / admin)',
        operationId: 'getQuizAttemptsForInstructor',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'quizId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'List of quiz attempts',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/QuizAttempt' } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/quizzes/{quizId}/attempts/me': {
      get: {
        tags: ['Quizzes'],
        summary: 'Get my attempts for a specific quiz (student)',
        operationId: 'getMyQuizAttempts',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'quizId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'My quiz attempts' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/quizzes/{quizId}/attempts/submit': {
      post: {
        tags: ['Quizzes'],
        summary: 'Submit a quiz attempt (student)',
        operationId: 'submitQuizAttempt',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'quizId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['answers'],
                properties: {
                  answers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        questionIndex: { type: 'integer' },
                        answer: { type: 'object', description: 'The selected answer(s)' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Quiz attempt recorded',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/QuizAttempt' } } },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    // ── Certificates ────────────────────────────────────────────────────
    '/api/certificates/me': {
      get: {
        tags: ['Certificates'],
        summary: 'Get my certificates (student)',
        operationId: 'getMyCertificates',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of certificates',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Certificate' } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/certificates/verify/{certificateId}': {
      get: {
        tags: ['Certificates'],
        summary: 'Verify a certificate by ID (public)',
        operationId: 'verifyCertificate',
        parameters: [{ name: 'certificateId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Certificate is valid' },
          '404': { description: 'Certificate not found' },
        },
      },
    },
    '/api/certificates/course/{courseId}/generate': {
      post: {
        tags: ['Certificates'],
        summary: 'Generate a certificate for a completed course (student)',
        operationId: 'generateCourseCertificate',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'courseId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '201': { description: 'Certificate generated' },
          '400': { description: 'Course not yet completed or certificate already exists' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { description: 'Too many certificate requests' },
        },
      },
    },
    '/api/certificates/{certificateId}/render': {
      get: {
        tags: ['Certificates'],
        summary: 'Render certificate HTML page',
        operationId: 'renderCertificatePage',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'certificateId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Certificate HTML' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { description: 'Certificate not found' },
        },
      },
    },
    '/api/certificates/{certificateId}/download-pdf': {
      get: {
        tags: ['Certificates'],
        summary: 'Download certificate as PDF',
        operationId: 'downloadCertificatePdf',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'certificateId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'PDF download',
            content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { description: 'Certificate not found' },
        },
      },
    },

    // ── Contact ─────────────────────────────────────────────────────────
    '/api/contact': {
      post: {
        tags: ['Contact'],
        summary: 'Submit a contact message (public)',
        operationId: 'createContactMessage',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'message'],
                properties: {
                  fullName: { type: 'string', example: 'Jane Doe' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Message submitted' },
          '400': { $ref: '#/components/responses/ValidationError' },
        },
      },
      get: {
        tags: ['Contact'],
        summary: 'List contact messages (admin)',
        operationId: 'getContactMessages',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['new', 'in_progress', 'resolved'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': {
            description: 'Paginated contact messages',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedContactMessages' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/contact/{contactMessageId}/assign': {
      patch: {
        tags: ['Contact'],
        summary: 'Assign a contact message to an admin (admin)',
        operationId: 'assignContactMessage',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'contactMessageId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { assignedTo: { type: 'string', description: 'User ID of the admin' } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Message assigned' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { description: 'Message not found' },
        },
      },
    },
    '/api/contact/{contactMessageId}/status': {
      patch: {
        tags: ['Contact'],
        summary: 'Update contact message status (admin)',
        operationId: 'updateContactMessageStatus',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'contactMessageId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['new', 'in_progress', 'resolved'] },
                  reviewNotes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Status updated' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { description: 'Message not found' },
        },
      },
    },

    // ── Users ───────────────────────────────────────────────────────────
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List users (admin)',
        operationId: 'getUsers',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['student', 'instructor', 'admin', 'content_manager'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': {
            description: 'Paginated list of users',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedUsers' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Create a user (admin)',
        operationId: 'createUser',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName', 'role'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  role: { type: 'string', enum: ['student', 'instructor', 'admin', 'content_manager'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User created' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/users/me': {
      patch: {
        tags: ['Users'],
        summary: 'Update own profile',
        operationId: 'updateMe',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  bio: { type: 'string' },
                  phone: { type: 'string' },
                  address: {
                    type: 'object',
                    properties: {
                      street: { type: 'string' },
                      city: { type: 'string' },
                      state: { type: 'string' },
                      zipCode: { type: 'string' },
                      country: { type: 'string' },
                    },
                  },
                  preferences: {
                    type: 'object',
                    properties: {
                      language: { type: 'string' },
                      timezone: { type: 'string' },
                      notifications: {
                        type: 'object',
                        properties: {
                          email: { type: 'boolean' },
                          push: { type: 'boolean' },
                          marketingEmails: { type: 'boolean' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Profile updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/users/me/avatar': {
      post: {
        tags: ['Users'],
        summary: 'Upload own avatar',
        operationId: 'uploadMeAvatar',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary', description: 'Avatar image file' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Avatar uploaded' },
          '400': { description: 'Invalid file' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/users/me/password': {
      patch: {
        tags: ['Users'],
        summary: 'Change own password',
        operationId: 'changePassword',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Password changed' },
          '400': { description: 'Incorrect current password or validation error' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/users/{userId}': {
      patch: {
        tags: ['Users'],
        summary: 'Update a user (admin)',
        operationId: 'updateUser',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  role: { type: 'string', enum: ['student', 'instructor', 'admin', 'content_manager'] },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'User updated' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { description: 'User not found' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete a user (admin)',
        operationId: 'deleteUser',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'User deleted' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { description: 'User not found' },
        },
      },
    },

    // ── Notifications ───────────────────────────────────────────────────
    '/api/notifications/me': {
      get: {
        tags: ['Notifications'],
        summary: 'Get my notifications',
        operationId: 'getMyNotifications',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'isRead', in: 'query', schema: { type: 'boolean' } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['enrollment', 'assignment', 'discussion', 'system'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': {
            description: 'Paginated notifications',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedNotifications' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/notifications/me/unread-count': {
      get: {
        tags: ['Notifications'],
        summary: 'Get unread notification count',
        operationId: 'getMyUnreadNotificationCount',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Unread count',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { count: { type: 'integer', example: 3 } },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/notifications/me/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        operationId: 'markAllNotificationsRead',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'All marked read' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/notifications/{notificationId}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark a single notification as read',
        operationId: 'markNotificationRead',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'notificationId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Notification marked read' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { description: 'Notification not found' },
        },
      },
    },
    '/api/notifications/{notificationId}': {
      delete: {
        tags: ['Notifications'],
        summary: 'Delete a notification',
        operationId: 'deleteNotification',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'notificationId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Notification deleted' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { description: 'Notification not found' },
        },
      },
    },
    '/api/notifications': {
      post: {
        tags: ['Notifications'],
        summary: 'Create a notification (instructor / admin)',
        operationId: 'createNotification',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'title', 'message', 'type'],
                properties: {
                  userId: { type: 'string' },
                  title: { type: 'string' },
                  message: { type: 'string' },
                  type: { type: 'string', enum: ['enrollment', 'assignment', 'discussion', 'system'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Notification created' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/notifications/bulk': {
      post: {
        tags: ['Notifications'],
        summary: 'Bulk-create notifications (admin)',
        operationId: 'createBulkNotifications',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userIds', 'title', 'message', 'type'],
                properties: {
                  userIds: { type: 'array', items: { type: 'string' } },
                  title: { type: 'string' },
                  message: { type: 'string' },
                  type: { type: 'string', enum: ['enrollment', 'assignment', 'discussion', 'system'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Bulk notifications created' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    // ── Settings ────────────────────────────────────────────────────────
    '/api/settings/public': {
      get: {
        tags: ['Settings'],
        summary: 'Get public settings (no auth required)',
        operationId: 'getPublicSettings',
        responses: {
          '200': {
            description: 'Public settings',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    platformName: { type: 'string' },
                    supportEmail: { type: 'string' },
                    socialLinks: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/settings': {
      get: {
        tags: ['Settings'],
        summary: 'Get all settings (admin)',
        operationId: 'getSettings',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'All settings' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
      patch: {
        tags: ['Settings'],
        summary: 'Update settings (admin)',
        operationId: 'updateSettings',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                additionalProperties: true,
              },
            },
          },
        },
        responses: {
          '200': { description: 'Settings updated' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/settings/reset': {
      post: {
        tags: ['Settings'],
        summary: 'Reset settings to defaults (admin)',
        operationId: 'resetSettings',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Settings reset' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    // ── Content ─────────────────────────────────────────────────────────
    '/api/content': {
      get: {
        tags: ['Content'],
        summary: 'List published content pages / posts (public)',
        operationId: 'getContents',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['page', 'post', 'block'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': {
            description: 'Paginated content list',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedContent' } } },
          },
        },
      },
      post: {
        tags: ['Content'],
        summary: 'Create content (content_manager / admin)',
        operationId: 'createContent',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'type', 'content'],
                properties: {
                  title: { type: 'string' },
                  type: { type: 'string', enum: ['page', 'post', 'block'] },
                  slug: { type: 'string' },
                  content: { type: 'string' },
                  blocks: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        type: { type: 'string' },
                        content: { type: 'object' },
                        order: { type: 'integer' },
                      },
                    },
                  },
                  status: { type: 'string', enum: ['draft', 'published', 'archived'], default: 'draft' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Content created' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/content/manage': {
      get: {
        tags: ['Content'],
        summary: 'List all content including drafts (content_manager / admin)',
        operationId: 'getManagedContents',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['draft', 'published', 'archived'] } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['page', 'post', 'block'] } },
        ],
        responses: {
          '200': { description: 'Managed content list' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/content/{slug}': {
      get: {
        tags: ['Content'],
        summary: 'Get content by slug (public)',
        operationId: 'getContentBySlug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Content item' },
          '404': { description: 'Content not found' },
        },
      },
    },
    '/api/content/{id}': {
      put: {
        tags: ['Content'],
        summary: 'Update content (content_manager / admin)',
        operationId: 'updateContent',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: {
          '200': { description: 'Content updated' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { description: 'Content not found' },
        },
      },
      delete: {
        tags: ['Content'],
        summary: 'Delete content (content_manager / admin)',
        operationId: 'deleteContent',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Content deleted' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { description: 'Content not found' },
        },
      },
    },
    '/api/content/upload': {
      post: {
        tags: ['Content'],
        summary: 'Upload a media file (content_manager / admin / instructor)',
        operationId: 'uploadMedia',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'File uploaded' },
          '400': { description: 'Invalid file' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/content/media': {
      get: {
        tags: ['Content'],
        summary: 'List uploaded media (content_manager / admin / instructor)',
        operationId: 'getMedia',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'List of media items' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/content/media/{id}': {
      delete: {
        tags: ['Content'],
        summary: 'Delete a media item (content_manager / admin / instructor)',
        operationId: 'deleteMedia',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Media deleted' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { description: 'Media not found' },
        },
      },
      patch: {
        tags: ['Content'],
        summary: 'Rename a media item',
        operationId: 'renameMedia',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: { name: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Media renamed' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { description: 'Media not found' },
        },
      },
    },

    // ── Dashboard ───────────────────────────────────────────────────────
    '/api/dashboard/student': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get student dashboard data',
        operationId: 'getStudentDashboard',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Student dashboard — enrolled courses, progress, upcoming deadlines',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    enrolledCourses: { type: 'array', items: { $ref: '#/components/schemas/Course' } },
                    overallProgress: { type: 'number' },
                    upcomingDeadlines: { type: 'array', items: { type: 'object' } },
                    recentActivity: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/dashboard/instructor': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get instructor dashboard data',
        operationId: 'getInstructorDashboard',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Instructor dashboard — course stats, student engagement',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalCourses: { type: 'integer' },
                    totalStudents: { type: 'integer' },
                    pendingReviews: { type: 'integer' },
                    recentSubmissions: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/dashboard/admin': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get admin dashboard data',
        operationId: 'getAdminDashboard',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Admin dashboard — platform-wide metrics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalUsers: { type: 'integer' },
                    totalCourses: { type: 'integer' },
                    totalRevenue: { type: 'number' },
                    newUsersThisMonth: { type: 'integer' },
                    activeCourses: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    // ── Payments ────────────────────────────────────────────────────────
    '/api/payments': {
      post: {
        tags: ['Payments'],
        summary: 'Create a payment (student)',
        operationId: 'createPayment',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['courseId', 'amount'],
                properties: {
                  courseId: { type: 'string' },
                  amount: { type: 'number' },
                  currency: { type: 'string', default: 'USD' },
                  provider: { type: 'string', enum: ['stripe', 'paypal', 'bank_transfer'], default: 'stripe' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Payment initiated, checkout URL returned' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '429': { description: 'Too many payment attempts' },
        },
      },
    },
    '/api/payments/me': {
      get: {
        tags: ['Payments'],
        summary: 'Get my payment history',
        operationId: 'getMyPayments',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Payment history',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Payment' } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { description: 'Too many requests' },
        },
      },
    },
    '/api/payments/{id}/confirm': {
      post: {
        tags: ['Payments'],
        summary: 'Confirm a payment (student)',
        operationId: 'confirmPayment',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Payment confirmed' },
          '400': { description: 'Invalid or expired payment' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '429': { description: 'Too many confirmation attempts' },
        },
      },
    },
    '/api/payments/webhook/{provider}': {
      post: {
        tags: ['Payments'],
        summary: 'Handle payment gateway webhook',
        operationId: 'handlePaymentWebhook',
        parameters: [{ name: 'provider', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Webhook received' },
          '400': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/api/payments/instructor/revenue': {
      get: {
        tags: ['Payments'],
        summary: 'Get instructor revenue report (instructor / admin)',
        operationId: 'getInstructorRevenue',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Revenue data' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/payments/admin/revenue': {
      get: {
        tags: ['Payments'],
        summary: 'Get admin revenue report (admin)',
        operationId: 'getAdminRevenue',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Revenue data' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    // ── Discussions ─────────────────────────────────────────────────────
    '/api/discussions/conversations': {
      get: {
        tags: ['Discussions'],
        summary: 'Get accessible discussion courses',
        operationId: 'getAccessibleDiscussionCourses',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'List of accessible course discussions' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/discussions/course/{courseId}': {
      get: {
        tags: ['Discussions'],
        summary: 'Get discussions for a course',
        operationId: 'getCourseDiscussions',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'courseId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'List of discussions',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Discussion' } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Discussions'],
        summary: 'Create a discussion message in a course',
        operationId: 'createDiscussionMessage',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'courseId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'content'],
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Discussion created' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
  },

  // ── Components ────────────────────────────────────────────────────────
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token from login. Include as `Authorization: Bearer <token>`.',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
          stack: { type: 'string', description: 'Stack trace (development only)' },
        },
        example: {
          message: 'Validation failed',
          errors: [{ field: 'email', message: 'Invalid email format' }],
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { type: 'object' } },
          total: { type: 'integer' },
          page: { type: 'integer' },
          limit: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
        example: {
          data: [],
          total: 42,
          page: 1,
          limit: 20,
          totalPages: 3,
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string', enum: ['student', 'instructor', 'admin', 'content_manager'] },
          avatar: { type: 'string', nullable: true },
          bio: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              zipCode: { type: 'string' },
              country: { type: 'string' },
            },
          },
          preferences: {
            type: 'object',
            properties: {
              language: { type: 'string' },
              timezone: { type: 'string' },
              notifications: {
                type: 'object',
                properties: {
                  email: { type: 'boolean' },
                  push: { type: 'boolean' },
                  marketingEmails: { type: 'boolean' },
                },
              },
            },
          },
          isActive: { type: 'boolean' },
          emailVerified: { type: 'boolean' },
          lastLogin: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Course: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          shortDescription: { type: 'string' },
          thumbnail: { type: 'string', nullable: true },
          instructor: { type: 'string', description: 'User ID of the instructor' },
          category: { type: 'string' },
          subcategory: { type: 'string', nullable: true },
          level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
          language: { type: 'string', default: 'en' },
          pricing: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['free', 'paid', 'subscription'] },
              amount: { type: 'number' },
              currency: { type: 'string' },
              discount: {
                type: 'object',
                properties: {
                  percentage: { type: 'number' },
                  validUntil: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
          duration: { type: 'integer', description: 'Duration in minutes' },
          modules: { type: 'array', items: { type: 'string' } },
          tags: { type: 'array', items: { type: 'string' } },
          prerequisites: { type: 'array', items: { type: 'string' } },
          learningOutcomes: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['draft', 'published', 'archived'] },
          featured: { type: 'boolean' },
          rating: {
            type: 'object',
            properties: {
              average: { type: 'number' },
              count: { type: 'integer' },
            },
          },
          enrollmentCount: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CourseInput: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          shortDescription: { type: 'string' },
          category: { type: 'string' },
          subcategory: { type: 'string' },
          level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
          language: { type: 'string' },
          pricing: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['free', 'paid', 'subscription'] },
              amount: { type: 'number' },
              currency: { type: 'string' },
            },
          },
          duration: { type: 'integer' },
          tags: { type: 'array', items: { type: 'string' } },
          prerequisites: { type: 'array', items: { type: 'string' } },
          learningOutcomes: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['draft', 'published', 'archived'] },
        },
      },
      Module: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          courseId: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string' },
          lessons: { type: 'array', items: { type: 'string' } },
          order: { type: 'integer' },
          status: { type: 'string', enum: ['draft', 'published'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Assignment: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          courseId: { type: 'string' },
          moduleId: { type: 'string', nullable: true },
          title: { type: 'string' },
          description: { type: 'string' },
          dueDate: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Submission: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          assignmentId: { type: 'string' },
          userId: { type: 'string' },
          content: { type: 'string' },
          grade: { type: 'number', nullable: true },
          submittedAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      LiveSession: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          courseId: { type: 'string' },
          instructorId: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          provider: { type: 'string', enum: ['jitsi', 'google-meet', 'zoom', 'custom'] },
          meetingUrl: { type: 'string', format: 'uri' },
          startsAt: { type: 'string', format: 'date-time' },
          endsAt: { type: 'string', format: 'date-time', nullable: true },
          status: { type: 'string', enum: ['scheduled', 'live', 'completed', 'cancelled'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Quiz: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          courseId: { type: 'string' },
          lessonId: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          questions: {
            type: 'array',
            items: { $ref: '#/components/schemas/QuizQuestion' },
          },
          timeLimit: { type: 'integer', nullable: true, description: 'Time limit in minutes' },
          attempts: { type: 'integer' },
          passingScore: { type: 'integer' },
          isPublished: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      QuizQuestion: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          type: { type: 'string', enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'] },
          options: { type: 'array', items: { type: 'string' } },
          correctAnswer: { type: 'object', description: 'Hidden from non-instructor responses' },
          points: { type: 'integer' },
          explanation: { type: 'string', nullable: true },
        },
      },
      QuizQuestionInput: {
        type: 'object',
        required: ['question', 'type'],
        properties: {
          question: { type: 'string' },
          type: { type: 'string', enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'] },
          options: { type: 'array', items: { type: 'string' } },
          correctAnswer: { type: 'object' },
          points: { type: 'integer', default: 1 },
          explanation: { type: 'string' },
        },
      },
      QuizAttempt: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          quizId: { type: 'string' },
          userId: { type: 'string' },
          answers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                questionIndex: { type: 'integer' },
                answer: { type: 'object' },
                isCorrect: { type: 'boolean' },
                pointsAwarded: { type: 'integer' },
              },
            },
          },
          score: { type: 'integer' },
          percentage: { type: 'integer' },
          passed: { type: 'boolean' },
          submittedAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Certificate: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { type: 'string' },
          courseId: { type: 'string' },
          certificateNumber: { type: 'string' },
          issuedAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ContactMessage: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          fullName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          message: { type: 'string' },
          status: { type: 'string', enum: ['new', 'in_progress', 'resolved'] },
          reviewNotes: { type: 'string' },
          assignedTo: { type: 'string', nullable: true },
          assignedAt: { type: 'string', format: 'date-time', nullable: true },
          reviewedBy: { type: 'string', nullable: true },
          reviewedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { type: 'string' },
          type: { type: 'string', enum: ['enrollment', 'assignment', 'discussion', 'system'] },
          title: { type: 'string' },
          message: { type: 'string' },
          isRead: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { type: 'string' },
          courseId: { type: 'string' },
          amount: { type: 'number' },
          currency: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
          method: { type: 'string', nullable: true },
          provider: { type: 'string', enum: ['stripe', 'paypal', 'bank_transfer'] },
          externalPaymentId: { type: 'string', nullable: true },
          transactionId: { type: 'string', nullable: true },
          checkoutUrl: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Discussion: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          courseId: { type: 'string' },
          userId: { type: 'string' },
          title: { type: 'string' },
          content: { type: 'string' },
          replies: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                userId: { type: 'string' },
                content: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PaginatedCourses: {
        allOf: [
          { $ref: '#/components/schemas/PaginatedResponse' },
          {
            type: 'object',
            properties: {
              data: { type: 'array', items: { $ref: '#/components/schemas/Course' } },
            },
          },
        ],
      },
      PaginatedUsers: {
        allOf: [
          { $ref: '#/components/schemas/PaginatedResponse' },
          {
            type: 'object',
            properties: {
              data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
            },
          },
        ],
      },
      PaginatedContactMessages: {
        allOf: [
          { $ref: '#/components/schemas/PaginatedResponse' },
          {
            type: 'object',
            properties: {
              data: { type: 'array', items: { $ref: '#/components/schemas/ContactMessage' } },
            },
          },
        ],
      },
      PaginatedNotifications: {
        allOf: [
          { $ref: '#/components/schemas/PaginatedResponse' },
          {
            type: 'object',
            properties: {
              data: { type: 'array', items: { $ref: '#/components/schemas/Notification' } },
            },
          },
        ],
      },
      PaginatedContent: {
        allOf: [
          { $ref: '#/components/schemas/PaginatedResponse' },
          {
            type: 'object',
            properties: {
              data: { type: 'array', items: { type: 'object' } },
            },
          },
        ],
      },
    },
    responses: {
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      Unauthorized: {
        description: 'Authentication required — missing or invalid token',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      Forbidden: {
        description: 'Insufficient role permissions',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
  },
};
