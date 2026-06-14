# LearnSpace Architecture

> **Note:** This document is auto-generated from the codebase audit. All information is verified against the actual implementation.

---

## Table of Contents

- [System Overview](#system-overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Architecture](#database-architecture)
- [Authentication Flow](#authentication-flow)
- [Data Flow Patterns](#data-flow-patterns)
- [Real-Time Architecture](#real-time-architecture)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)

---

## System Overview

LearnSpace follows a **modular monolith** architecture pattern with a clear separation of concerns. The system consists of two main packages — a React SPA frontend and an Express API backend — communicating over HTTP and WebSocket.

```
┌──────────────┐         HTTP/WSS         ┌──────────────┐
│   Frontend   │ ◄──────────────────────► │   Backend    │
│  (React 19)  │                          │  (Express 5) │
│   + Nginx    │                          │  + Socket.IO │
└──────────────┘                          └──────┬───────┘
                                                 │
                                    ┌────────────┴────────────┐
                                    │         MongoDB         │
                                    │       (Mongoose 9)       │
                                    └─────────────────────────┘
```

---

## Frontend Architecture

### Stack Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| UI Framework | React 19 | Industry standard, large ecosystem |
| Build Tool | Vite 8 | Fast HMR, native ESM, TypeScript support |
| UI Library | MUI 9 | Comprehensive component library, accessibility |
| State Management | Redux Toolkit + RTK Query | Predictable state, built-in caching, optimistic updates |
| Routing | React Router 7 | Standard React routing with lazy loading |
| HTTP Client | Axios | Interceptors for CSRF, token refresh, error normalization |
| Testing | Vitest + Playwright | Vite-native unit testing, industry-standard E2E |

### Route Structure

The frontend defines routes in `App.tsx` using three categories:

**Public Routes** (no auth required):
- Marketing pages (`/`, `/about`, `/pricing`, `/contact`, etc.)
- Auth pages (`/auth/login`, `/auth/signup`, `/auth/verify-email`)
- Course catalog (`/courses/explore`, `/courses/:courseSlug`)
- CMS content pages (`/blog/:slug`, `/terms`, `/privacy`)

**Authenticated Routes** (wrapped in `RequireSession`):
- Dashboard (`/dashboard` — role-aware switch)
- Learning (`/courses/:courseId/learn`, `/courses/:courseId/lessons/:lessonId/quiz`)
- Discussions (`/discussions`, `/messages`)
- Certificates (`/certificates`)
- Profile (`/profile-settings`)

**Admin/Instructor Routes** (wrapped in `RequireRole`):
- Course management (`/courses/new`, `/instructor/dashboard`)
- CMS management (`/cms/content`, `/cms/media`)
- Admin panel (`/admin/dashboard`, `/admin/users`, `/admin/settings`)

### Component Architecture

```
App.tsx
├── AuthProvider (context)
│   ├── BrowserRouter
│   │   ├── MainLayout (public: Header + Footer)
│   │   │   ├── MarketingHomepagePage
│   │   │   ├── AboutPage
│   │   │   ├── ExploreCourses
│   │   │   ├── CourseDetailPage
│   │   │   ├── PricingPage
│   │   │   ├── ContactUs
│   │   │   └── CmsContentPage
│   │   │
│   │   ├── AuthLayout (no header/footer)
│   │   │   ├── PublicAuthPage (login)
│   │   │   ├── SignupAuthPage
│   │   │   ├── EmailVerificationPage
│   │   │   └── PasswordResetPage
│   │   │
│   │   ├── LearnSpaceShell (authenticated: sidebar + appbar)
│   │   │   ├── StudentDashboard
│   │   │   ├── InstructorDashboard
│   │   │   ├── AdminDashboard
│   │   │   ├── CoursePlayer
│   │   │   ├── QuizTaker
│   │   │   ├── CourseDiscussions
│   │   │   ├── ContentManager
│   │   │   ├── MediaLibrary
│   │   │   ├── UserManagement
│   │   │   └── (40+ additional pages)
│   │   │
│   │   └── NotFoundPage
```

### State Management Flow

```
┌──────────────────────────────────────────────────────────┐
│  Redux Store                                              │
│  ┌────────────────────────────────────────────────────┐  │
│  │  authSlice                                          │  │
│  │  ├─ user: AuthUser | null                           │  │
│  │  ├─ status: 'idle' | 'loading' | 'succeeded' | 'failed' │
│  │  └─ error: string | null                            │  │
│  ├────────────────────────────────────────────────────┤  │
│  │  baseApi (RTK Query)                                │  │
│  │  ├─ endpoints from courseApi                        │  │
│  │  ├─ endpoints from contentApi                       │  │
│  │  ├─ endpoints from quizApi                          │  │
│  │  ├─ endpoints from discussionApi                    │  │
│  │  ├─ endpoints from paymentApi                       │  │
│  │  └─ endpoints from dashboardApi                     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  AuthContext (wraps Redux + Axios)                        │
│  - manages login/register/logout lifecycle                │
│  - bootstraps CSRF token on mount                         │
│  - handles session refresh on page load                   │
│  - integrates with api.ts Axios interceptors              │
└───────────────────────────────────────────────────────────┘
```

### Data Fetching Strategy

- **RTK Query** for all CRUD operations with automatic cache invalidation via tag types: `Course`, `Content`, `Media`, `Discussion`, `Quiz`, `Payment`, `StudentDashboard`, `InstructorDashboard`, `AdminDashboard`
- **TanStack React Query** for supplementary/legacy data fetching patterns
- **Direct Axios** calls for auth operations, files uploads, and operations outside RTK Query
- **Socket.IO** for real-time discussion updates

---

## Backend Architecture

### Stack Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Runtime | Node.js 22 | LTS, performance, ecosystem |
| Framework | Express 5 | Mature, flexible, middleware ecosystem |
| Language | TypeScript (strict) | Type safety, maintainability |
| Database | MongoDB 7 + Mongoose 9 | Schema flexibility, document model fits LMS data |
| Auth | JWT (cookie-based) | Stateless, scalable, XSS-resistant |
| Validation | Joi | Declarative, composable, detailed error messages |
| Real-time | Socket.IO 4 | WebSocket with fallback, room support |
| File Upload | Multer + S3 | Flexible storage backends |
| PDF Generation | PDFKit | Server-side certificate rendering |
| Background Jobs | BullMQ | Optional, Redis-backed job queues |

### Middleware Pipeline

Middleware is applied in a specific order in `app.ts`. Each middleware has a specific responsibility:

```
1.  requestIdMiddleware       — Attaches UUID to each request (x-request-id)
2.  httpLogMiddleware          — Structured HTTP request logging
3.  prometheusHttpMiddleware   — Records request duration/count metrics
4.  compression                — Gzip/brotli response compression
5.  helmet                     — Security headers (CSP, HSTS, X-Frame-Options)
6.  cors                       — Configured CORS with whitelist
7.  cookieParser               — Cookie parsing
8.  express.json               — JSON body parsing (1MB limit)
9.  express.urlencoded         — URL-encoded body parsing (1MB limit)
10. sanitizeMiddleware          — Strips XSS from request bodies
11. Static /uploads            — File serving with security headers
12. csrfProtection             — Double-submit cookie CSRF
13. globalApiRateLimiter       — Optional global rate ceiling
14. Route-specific rate limiters — Per-endpoint rate limits
15. authMiddleware / roleMiddleware — JWT verification + RBAC
16. Route handlers              — Controllers + validation
17. errorMiddleware             — Global error handler (last)
```

### Controller Pattern

Every controller follows a consistent pattern:

```typescript
// Example: course.controller.ts
const asyncHandler = require('../utils/async-handler');

// List courses
exports.listCourses = asyncHandler(async (req, res) => {
  // 1. Parse query parameters
  // 2. Apply filters / pagination
  // 3. Query database
  // 4. Return response
  res.json({ success: true, data: courses });
});

// Create course
exports.createCourse = asyncHandler(async (req, res) => {
  // 1. Data already validated by Joi middleware
  // 2. Business logic (e.g., check instructor)
  // 3. Create in database
  // 4. Return response
  res.status(201).json({ success: true, data: course });
});
```

### Service Layer

Services encapsulate business logic that spans multiple models or involves external systems:

| Service | Responsibility |
|---------|---------------|
| `AuthService` | Registration, login, token generation/verification, password management |
| `EmailService` | Sending verification and password reset emails via Nodemailer |
| `PaymentGatewayService` | Creating checkout sessions, confirming payments, normalizing webhook states |
| `CacheService` | Redis-based course list caching with version-based invalidation |

---

## Database Architecture

### Schema Design Principles

1. **Embedded documents** for tightly coupled, bounded data (reviews in courses, questions in quizzes, blocks in content)
2. **References** for independent entities (User, Course, Enrollment, Payment)
3. **Compound indexes** for common query patterns (userId + courseId on enrollments)
4. **Unique indexes** for business constraints (slug on courses, email on users)

### Collection Relationships

```
users
  ├── has many → enrollments
  ├── has many → payments
  ├── has many → certificates
  ├── has many → discussions
  ├── has many → notifications
  ├── has many → quizattempts
  ├── has many → submissions
  └── has many → livesessions (as instructor)

courses
  ├── has many → modules (ordered array of ObjectIds)
  │   └── has many → lessons (ordered array of ObjectIds)
  │       └── has many → quizzes
  │           └── has many → quizattempts
  ├── has many → enrollments
  ├── has many → payments
  ├── has many → certificates
  ├── has many → discussions
  │   └── has many → replies (embedded)
  ├── has many → assignments
  │   └── has many → submissions
  ├── has many → livesessions
  └── has embedded → reviews[]
```

### Index Strategy

| Collection | Index | Purpose |
|------------|-------|---------|
| users | `{email: 1}` (unique) | Login lookup |
| users | `{role: 1, createdAt: -1}` | Admin user listing |
| users | `{email: 1, isActive: 1}` | Active user filtering |
| courses | `{slug: 1}` (unique) | URL-friendly lookups |
| courses | `{status: 1, updatedAt: -1}` | Published course listing |
| courses | `{instructor: 1}` | Instructor's course lookup |
| enrollments | `{userId: 1, courseId: 1}` (unique compound) | Enrollment constraint |
| discussions | `{courseId: 1}` | Course discussion listing |
| notifications | `{userId: 1, createdAt: -1}` | User notification inbox |
| payments | `{userId: 1, courseId: 1}` | Payment history |
| certificates | `{userId: 1, courseId: 1}` (unique compound) | Certificate uniqueness |
| modules | `{courseId: 1, order: 1}` | Ordered module listing |
| lessons | `{moduleId: 1}` | Module's lesson listing |
| quizzes | `{lessonId: 1, isPublished: 1}` | Published quiz lookup |

---

## Authentication Flow

### Login Flow

```
Client                        Server
  │                              │
  │  GET /api/auth/csrf-token    │
  │─────────────────────────────►│
  │◄─────────────────────────────│  Set-Cookie: csrfToken=abc
  │                              │
  │  POST /api/auth/login        │
  │  X-CSRF-Token: abc           │
  │  {email, password}           │
  │─────────────────────────────►│
  │                              │  Validate credentials
  │                              │  Generate accessToken (15m)
  │                              │  Generate refreshToken (7d)
  │◄─────────────────────────────│  Set-Cookie: accessToken=... (httpOnly)
  │                              │  Set-Cookie: refreshToken=... (httpOnly)
  │                              │  {user, role}
  │                              │
  │  GET /api/auth/me            │
  │  (cookies auto-sent)         │
  │─────────────────────────────►│
  │◄─────────────────────────────│  {user data}
```

### Token Refresh Flow

```
Client                        Server
  │                              │
  │  GET /api/protected-route    │
  │  (accessToken cookie)        │
  │─────────────────────────────►│
  │◄─────────────────────────────│  401 Unauthorized
  │                              │  (token expired)
  │                              │
  │  POST /api/auth/refresh-token│
  │  (refreshToken cookie)       │
  │─────────────────────────────►│
  │                              │  Verify refreshToken
  │                              │  Increment tokenVersion
  │                              │  Generate new token pair
  │◄─────────────────────────────│  Set-Cookie: new tokens
  │                              │
  │  Retry original request      │
  │  (new accessToken cookie)    │
  │─────────────────────────────►│
  │◄─────────────────────────────│  200 OK
```

### Session Revocation

When a user logs out or changes their password, the `tokenVersion` field on the User document is incremented. All existing JWT tokens (which contain the old `tokenVersion`) are immediately invalidated. This provides server-side session revocation without maintaining a token blacklist.

---

## Real-Time Architecture

### Socket.IO Server

The Socket.IO server shares the same HTTP server as Express, running on the same port.

```
Socket.IO Server
├── Authentication: JWT from accessToken cookie
│   ├── Verified on connect via AuthService.verifyToken
│   └── Failed auth → connection rejected
│
├── Rooms
│   ├── course:<courseId>    — Discussion rooms
│   └── user:<userId>        — Personal notification channel
│
├── Events (Client → Server)
│   ├── discussion:join      — Join course discussion room
│   └── discussion:leave     — Leave course discussion room
│
├── Events (Server → Client)
│   ├── discussion:new       — New discussion post in room
│   └── notification:new     — New notification for user
│
├── Connection State Recovery
│   └── 2-minute max disconnection tolerance
│
└── Redis Adapter (optional)
    └── Enables horizontal scaling across multiple server instances
```

---

## Security Architecture

### Defense in Depth Layers

```
Layer 1: Network
├── CORS whitelist
├── HTTPS (production)
└── Trust proxy configuration

Layer 2: HTTP
├── Helmet security headers
├── Body size limits (1MB JSON, 250MB uploads)
├── HTTP compression
└── X-Powered-By disabled

Layer 3: Authentication
├── JWT access tokens (15m, httpOnly cookie)
├── JWT refresh tokens (7d, rotated)
├── Token versioning (revocable sessions)
├── bcrypt password hashing (10 rounds)
└── Email verification required

Layer 4: Authorization
├── Role-Based Access Control (4 roles)
├── Route-level role middleware
└── Controller-level permission checks

Layer 5: Input Validation
├── Joi schema validation (all mutations)
├── stripUnknown + abortEarly: false
├── Input sanitization (XSS stripping)
└── ReDoS protection (regex length limits)

Layer 6: CSRF Protection
├── Double-submit cookie pattern
├── Skipped for safe methods (GET, HEAD, OPTIONS)
├── Skipped for webhooks and auth endpoints
└── Separate csrfToken cookie

Layer 7: Rate Limiting
├── Global API ceiling (optional)
├── Per-endpoint rate limiters
│   ├── Register: 5 requests / 15 minutes
│   ├── Login: 10 requests / 15 minutes
│   ├── Refresh: 30 requests / 15 minutes
│   └── Enroll: 10 requests / 1 minute
└── Redis-backed (optional) or in-memory fallback

Layer 8: File Upload
├── MIME type whitelist
├── Magic byte validation
├── Extension whitelist
├── Path traversal prevention
└── Configurable size limits

Layer 9: WebSocket
├── JWT auth on connect
├── Token version verification
├── Room-based access control
└── Per-socket rate limiting

Layer 10: Monitoring
├── Structured HTTP logging
├── Prometheus metrics (optional bearer auth)
├── Request ID tracing
└── Error normalization
```

---

## Deployment Architecture

### Docker Compose Stack

```
docker-compose.yml
│
├── Service: mongo
│   ├── Image: mongo:7.0.17
│   ├── Port: 27017
│   ├── Volume: mongo_data → /data/db
│   └── Healthcheck: mongosh ping
│
├── Service: backend
│   ├── Build: ./backend/Dockerfile (multi-stage)
│   ├── Port: 5000
│   ├── Depends on: mongo (healthy)
│   ├── Security: no-new-privileges
│   └── Healthcheck: /healthz endpoint
│
└── Service: frontend
    ├── Build: ./frontend/Dockerfile (multi-stage)
    ├── Port: 3000 → 8080
    ├── Depends on: backend (healthy)
    ├── Security: no-new-privileges, read_only, tmpfs
    └── Healthcheck: /healthz endpoint
```

### Container Hardening

| Measure | Backend | Frontend |
|---------|---------|----------|
| Base image (pinned) | `node:22-alpine3.21` | `nginx:1.27-alpine` |
| Multi-stage build | ✅ | ✅ |
| Non-root user | `node` | `nginx` |
| Read-only filesystem | ❌ | ✅ |
| tmpfs for writable dirs | ❌ | ✅ (nginx cache/run) |
| Deps: production only | `npm ci --omit=dev` | Static build |
| Health check | ✅ (30s interval) | ✅ (30s interval) |
| no-new-privileges | ✅ | ✅ |

---

## Error Handling

### Backend Error Pattern

All controllers use `asyncHandler` to forward errors to the centralized error middleware:

```typescript
// utils/async-handler.ts
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
exports.listCourses = asyncHandler(async (req, res) => {
  // Errors automatically forwarded to errorMiddleware
});
```

### Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "details": ["field-specific error (optional)"]
}
```

### Error Types Handled

| Error Type | Handler | HTTP Status |
|------------|---------|-------------|
| AppError (custom) | errorMiddleware | Configurable (4xx/5xx) |
| Mongoose ValidationError | errorMiddleware | 400 |
| Mongoose CastError | errorMiddleware | 400 |
| Mongoose DuplicateKeyError | errorMiddleware | 409 |
| JWT errors (expired/invalid) | errorMiddleware | 401 |
| Multer errors (file too large, etc.) | errorMiddleware | 400 |
| Generic errors | errorMiddleware | 500 |
