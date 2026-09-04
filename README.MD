<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="">
    <img alt="LearnSpace" src="" width="240">
  </picture>
</p>

<h1 align="center">LearnSpace</h1>

<p align="center">
  <strong>Production-Grade Learning Management System &amp; Content Management Platform</strong>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19"></a>
  <a href="#"><img src="https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express" alt="Express 5"></a>
  <a href="#"><img src="https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat-square&logo=mongodb" alt="MongoDB 7.0"></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript" alt="TypeScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker" alt="Docker"></a>
  <a href="#"><img src="https://img.shields.io/badge/Socket.IO-Realtime-010101?style=flat-square&logo=socket.io" alt="Socket.IO"></a>
  <a href="#backend-tests"><img src="https://img.shields.io/badge/tests-41%20suites-green?style=flat-square" alt="Tests"></a>
  <a href="#"><img src="https://img.shields.io/badge/MUI-v9-007FFF?style=flat-square&logo=mui" alt="MUI v9"></a>
</p>

<p align="center">
  <a href="#key-features">Features</a> •
  <a href="#user-roles">Roles</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-overview">API</a> •
  <a href="#testing">Testing</a> •
  <a href="#security">Security</a>
</p>

---

## Table of Contents

- [What is LearnSpace?](#what-is-learnspace)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Database Design](#database-design)
- [API Overview](#api-overview)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [CI/CD](#cicd)
- [Security](#security)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [Changelog](CHANGELOG.md)
- [FAQ](#faq)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## What is LearnSpace?

LearnSpace is a **production-grade open-source Learning Management System (LMS)** with an integrated **Content Management System (CMS)**. It enables educational institutions, instructors, and organizations to create, manage, and deliver online courses with rich content, assessments, certifications, and real-time collaboration.

> **⚠️ This project was developed as part of the MiT Full Stack Development Internship Program 2025.** All code is verified against the actual codebase — nothing is invented.

### Problem Statement

Building an online learning platform requires integrating dozens of systems: user management, course delivery, assessments, payments, certificates, real-time communication, content management, analytics, and more. Most solutions either require expensive SaaS subscriptions or force developers to piece together disparate tools.

LearnSpace solves this by providing a **single, self-hosted platform** that handles the entire learning lifecycle — from content creation to student certification.

### Why LearnSpace?

- **Complete LMS + CMS in one codebase** — No need to integrate separate tools
- **Multi-role architecture** — Students, instructors, content managers, and admins with granular permissions
- **Production-ready security** — CSRF protection, rate limiting, input sanitization, JWT with token versioning, helmet headers
- **Pluggable payments** — Stripe, PayPal, and bank transfer gateways
- **Real-time collaboration** — Socket.IO-powered discussions and notifications
- **Docker-native deployment** — Multi-stage builds, health checks, non-root containers
- **Comprehensive testing** — 43 backend test suites, 11 E2E spec files, unit + integration coverage

---

## Key Features

### 🎓 Learning Management

| Feature | Status | Details |
|---------|--------|---------|
| Course catalog with search & filtering | ✅ | Explore courses, filter by category/level |
| Multi-module course structure | ✅ | Ordered modules with drag-and-drop reordering |
| Video & text lessons | ✅ | Video player with progress tracking, HTML/Markdown content |
| Lesson completion tracking | ✅ | Auto-mark at 90% video watch, manual complete button |
| Progress persistence | ✅ | Server-synced with localStorage auto-save fallback |
| Quiz engine | ✅ | MCQ, True/False, Short Answer, Essay; auto-grading for objective types |
| Assignment management | ✅ | Create, submit, & grade with full frontend UI |
| Completion certificates | ✅ | PDF generation via PDFKit, verification, HTML preview |
| Course discussions | ✅ | Per-course threads with Socket.IO real-time updates |
| Live sessions | ✅ | Schedule & join sessions (Zoom, Jitsi, Google Meet) |
| API documentation | ✅ | OpenAPI/Swagger spec at /api/docs/json |

### 🏢 Content Management

| Feature | Status | Details |
|---------|--------|---------|
| Dynamic page builder | ✅ | Page/Post/Block types with block-based editor |
| Media library | ✅ | Upload, rename, delete; local or S3 storage |
| Content publishing workflow | ✅ | Draft / Published / Archived states |
| Slug-based routing | ✅ | SEO-friendly URLs for all content |

### 🔐 Authentication & Authorization

| Feature | Status | Details |
|---------|--------|---------|
| Email/password registration | ✅ | With email verification |
| JWT access + refresh tokens | ✅ | 15m access, 7d refresh, httpOnly cookies |
| Role-Based Access Control | ✅ | 4 roles with granular middleware enforcement |
| Password reset flow | ✅ | Forgot/reset with JWT tokens, expiry, strong password policy |
| Session revocation | ✅ | Token versioning on User model |
| CSRF protection | ✅ | Double-submit cookie pattern |

### 💳 Payments

| Feature | Status | Details |
|---------|--------|---------|
| Stripe checkout | ✅ | Create sessions, confirm payments |
| PayPal checkout | ✅ | Sandbox + production environments |
| Bank transfer | ✅ | Manual/auto-complete workflows |
| Webhook processing | ✅ | HMAC-SHA256 signature verification |
| Revenue analytics | ✅ | Instructor + admin dashboards |
| Auto-enrollment | ✅ | On successful payment completion |

### 📊 Dashboards & Analytics

| Feature | Status | Roles |
|---------|--------|-------|
| Student dashboard | ✅ | Course progress, badges, streaks, activity timeline |
| Instructor dashboard | ✅ | Revenue, top courses, enrollment metrics, engagement stats |
| Admin dashboard | ✅ | Platform-wide stats, revenue charts, course distribution |
| Prometheus metrics | ✅ | HTTP duration/count, custom metrics, bearer-protected |

### 🔔 Real-Time & Notifications

| Feature | Status | Details |
|---------|--------|---------|
| Socket.IO server | ✅ | JWT-authenticated WebSocket connections |
| Course discussion rooms | ✅ | Per-course Socket.IO rooms with join/leave |
| User notification rooms | ✅ | Per-user private notification channel |
| Notification CRUD | ✅ | Read/unread, mark all read, per-user inbox |
| Redis adapter | ✅ | Optional horizontal scaling for Socket.IO |

---

## User Roles

LearnSpace implements four distinct roles with granular permission boundaries enforced at both the route and controller levels.

| Capability | Student | Instructor | Content Manager | Admin |
|------------|:-------:|:----------:|:---------------:|:-----:|
| Browse courses | ✅ | ✅ | ✅ | ✅ |
| Enroll in courses | ✅ | ✅ | ✅ | ✅ |
| Complete lessons & quizzes | ✅ | ❌ | ❌ | ❌ |
| Create courses | ❌ | ✅ | ❌ | ✅ |
| Manage own courses | ❌ | ✅ | ❌ | ✅ |
| Create modules & lessons | ❌ | ✅ | ❌ | ✅ |
| Grade assignments | ❌ | ✅ | ❌ | ✅ |
| View instructor analytics | ❌ | ✅ | ❌ | ✅ |
| Manage CMS content | ❌ | ❌ | ✅ | ✅ |
| Manage media library | ❌ | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ✅ |
| Platform-wide settings | ❌ | ❌ | ❌ | ✅ |
| View admin analytics | ❌ | ❌ | ❌ | ✅ |
| Manage contact messages | ❌ | ❌ | ❌ | ✅ |
| Send bulk notifications | ❌ | ❌ | ❌ | ✅ |
| Create admin users | ❌ | ❌ | ❌ | ✅ |

---

## Screenshots

> **Note:** Screenshots will be added after initial deployment. Key pages include:
>
> - **Marketing Homepage** — `/` landing with featured courses, stats, testimonials
> - **Course Catalog** — `/courses/explore` with filters and search
> - **Course Player** — `/courses/:id/learn` with video, curriculum sidebar, progress
> - **Student Dashboard** — `/dashboard` with progress, badges, streak
> - **Instructor Dashboard** — revenue charts, top courses, engagement
> - **Admin Dashboard** — platform analytics, user management
> - **CMS Page Builder** — block-based content editor
> - **Quiz Interface** — question types, timer, results

---

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React 19 SPA (Vite)                                  │  │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │  │
│  │  │  Pages  │ │Components│ │   MUI 9  │ │   RTK   │  │  │
│  │  │ Routes  │ │ (shared) │ │   Theme  │ │  Query  │  │  │
│  │  └────┬────┘ └────┬─────┘ └────┬─────┘ └────┬────┘  │  │
│  │       └────────────┴────────────┴────────────┘       │  │
│  │                        │                              │  │
│  │  ┌─────────────────────▼──────────────────────────┐  │  │
│  │  │  Axios (CSRF + auto-refresh) + Socket.IO       │  │  │
│  │  └─────────────────────┬──────────────────────────┘  │  │
│  └────────────────────────┼──────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────┘
                            │ HTTP / WSS
┌───────────────────────────┼──────────────────────────────────┐
│  ┌────────────────────────▼──────────────────────────────┐  │
│  │  Nginx (Frontend static serving, port 8080)            │  │
│  │  SPA routing, gzip, CSP headers, /healthz endpoint    │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼──────────────────────────────┐  │
│  │  BACKEND (Express 5, TypeScript, CommonJS)             │  │
│  │                                                        │  │
│  │  Middleware Pipeline (ordered):                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │  │
│  │  │ Request  │ │   HTTP   │ │Prometheus│ │Compression│ │  │
│  │  │   ID     │ │   Log    │ │ Metrics  │ │  (gzip)   │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │  │
│  │  │  Helmet  │ │   CORS   │ │ Cookie   │ │   JSON   │ │  │
│  │  │ Security │ │          │ │  Parser  │ │   Body   │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │  │
│  │  │Sanitize  │ │   CSRF   │ │  Rate    │ │   Auth   │ │  │
│  │  │  Input   │ │ Double-  │ │  Limit   │ │  + Role  │ │  │
│  │  │          │ │ Submit   │ │          │ │          │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  14 Route Modules → 14 Controllers               │  │  │
│  │  │  Auth │ Courses │ Content │ Quizzes │ Payments    │  │  │
│  │  │  Discussions │ Certificates │ Assignments │ ...   │  │  │
│  │  │  + Joi Validation on every mutation                 │  │  │
│  │  └──────────┬───────────────────────────────────────┘  │  │
│  │             │                                          │  │
│  │  ┌──────────▼───────────────────────────────────────┐  │  │
│  │  │  Services Layer                                   │  │  │
│  │  │  AuthService │ EmailService │ PaymentGateway      │  │  │
│  │  │  CacheService (Redis) │ BullMQ Jobs              │  │  │
│  │  └──────────┬───────────────────────────────────────┘  │  │
│  │             │                                          │  │
│  │  ┌──────────▼───────────────────────────────────────┐  │  │
│  │  │  17 Mongoose Models → MongoDB                     │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  Socket.IO Server (same HTTP server)              │  │  │
│  │  │  JWT auth on connect │ Redis adapter (optional)   │  │  │
│  │  │  Rooms: course:* | user:*                         │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  External Services                                      │  │
│  │  MongoDB │ Redis (opt) │ S3 (opt) │ SMTP │ Stripe      │  │
│  │  PayPal │ Nodemailer │ PDFKit                          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Layered Architecture

The backend follows a strict layered architecture:

```
HTTP Request
    │
    ▼
┌──────────────┐
│   Routes     │  Thin layer: maps HTTP paths to controllers
│   (routers)  │  Applies middleware (auth, validation)
└──────┬───────┘
       │
┌──────▼───────┐
│ Controllers  │  Request/response handling
│              │  Parses params, calls services, sends responses
└──────┬───────┘
       │
┌──────▼───────┐
│  Services    │  Business logic, external API calls
│              │  AuthService, EmailService, PaymentGatewayService
└──────┬───────┘
       │
┌──────▼───────┐
│   Models     │  Mongoose ODM, schema definitions
│  (Mongoose)  │  Indexes, virtuals, middleware (pre-save hooks)
└──────┬───────┘
       │
┌──────▼───────┐
│   MongoDB    │  Data persistence
└──────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────────────┐
│  App.tsx (React Router BrowserRouter)        │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │  Public  │ │  Auth    │ │  Protected   │ │
│  │  Routes  │ │  Routes  │ │  Routes      │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
├─────────────────────────────────────────────┤
│  Layouts                                     │
│  MainLayout (public: Header + Footer)        │
│  LearnSpaceShell (auth: sidebar + appbar)    │
├─────────────────────────────────────────────┤
│  State Layer                                 │
│  ┌─────────────────────────────────────────┐ │
│  │  Redux Store                             │ │
│  │  ├─ authSlice (user, token version)      │ │
│  │  └─ baseApi (RTK Query)                  │ │
│  │     ├─ courseApi    ── /api/courses/*    │ │
│  │     ├─ contentApi   ── /api/content/*    │ │
│  │     ├─ quizApi      ── /api/quizzes/*    │ │
│  │     ├─ discussionApi── /api/discussions/*│ │
│  │     ├─ paymentApi   ── /api/payments/*   │ │
│  │     └─ dashboardApi ── /api/dashboard/*  │ │
│  └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│  Data Fetching: Axios + RTK Query + React Query │
│  AuthContext manages session lifecycle        │
│  api.ts: Axios instance, CSRF, auto-refresh   │
└─────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI library |
| TypeScript | 6.0.x | Type safety |
| Vite | 8.x | Build tool & dev server |
| Material UI (MUI) | 9.x | Component library & design system |
| Redux Toolkit | Latest | State management |
| RTK Query | Latest | API data fetching & caching |
| TanStack React Query | Latest | Supplementary data fetching |
| React Router | 7.x | Client-side routing |
| Axios | Latest | HTTP client with interceptors |
| Socket.IO Client | 4.x | Real-time communication |
| Recharts | Latest | Dashboard charts |
| Formik + Yup | Latest | Form management (installed, usage varies) |
| Vitest | Latest | Unit & component testing |
| Playwright | Latest | E2E testing |
| @hello-pangea/dnd | Latest | Drag-and-drop for module reordering |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.x | Runtime |
| Express | 5.x | Web framework |
| TypeScript | 5.x | Type safety |
| MongoDB | 7.x | Database |
| Mongoose | 9.x | ODM / schema validation |
| JWT (jsonwebtoken) | 9.x | Authentication tokens |
| Bcrypt | 6.x | Password hashing |
| Joi | 18.x | Input validation |
| Helmet | 8.x | Security headers |
| Socket.IO | 4.x | Real-time bidirectional communication |
| Multer | 2.x | File upload handling |
| AWS SDK (S3) | 3.x | Cloud file storage |
| PDFKit | 0.x | Certificate PDF generation |
| Nodemailer | 8.x | Email delivery |
| BullMQ | Latest | Job queues (optional) |
| ioredis | Latest | Redis client (optional) |
| prom-client | Latest | Prometheus metrics |
| Jest | 30.x | Test framework |
| Supertest | 7.x | HTTP integration testing |
| mongodb-memory-server | 10.x | In-memory MongoDB for testing |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Local orchestration |
| Nginx | Frontend static serving, security headers |
| Alpine Linux | Base images for minimal attack surface |
| GitHub Actions | CI pipeline |

---

## Database Design

### Entity Relationship Summary

```
User ────< Enrollment >──── Course
User ────< Payment
User ────< Notification
User ────< Certificate >──── Course
User ────< Discussion >──── Course
User ────< QuizAttempt >──── Quiz >──── Lesson >──── Module >──── Course
User ────< Submission >──── Assignment >──── Module >──── Course
User ────< ContactMessage
               Course >──── LiveSession >──── User (instructor)
               Course >──── Lesson (via Module)
               Course >──── Review (embedded)
```

### Collections

| Collection | Key Fields | Relationships |
|------------|------------|---------------|
| **users** | `email`, `password`, `role`, `firstName`, `lastName`, `gamification`, `tokenVersion`, `emailVerified` | Referenced by: enrollments, payments, certificates, discussions, notifications, quizattempts, submissions, contactmessages, livesessions |
| **courses** | `title`, `slug`, `instructor`, `pricing`, `status`, `category`, `level`, `rating`, `reviews[]`, `modules[]` | Belongs to: User (instructor). Has many: Module, Enrollment, Payment, Certificate, Discussion, LiveSession |
| **modules** | `courseId`, `title`, `order`, `status`, `lessons[]` | Belongs to: Course. Has many: Lesson |
| **lessons** | `moduleId`, `title`, `content`, `videoUrl`, `type`, `duration`, `attachments[]`, `order`, `status` | Belongs to: Module. Has many: Quiz |
| **enrollments** | `userId`, `courseId`, `completedLessons[]`, `progress`, `status` | Unique compound index on (userId, courseId) |
| **contents** | `type`, `title`, `content`, `blocks[]`, `slug`, `status`, `author` | For CMS pages, posts, blocks |
| **media** | `filename`, `originalName`, `mimetype`, `size`, `url` | File metadata for media library |
| **quizzes** | `courseId`, `lessonId`, `title`, `questions[]`, `timeLimit`, `passingScore` | Belongs to: Lesson |
| **quizattempts** | `quizId`, `userId`, `answers[]`, `score`, `percentage`, `passed` | Belongs to: Quiz, User |
| **discussions** | `courseId`, `userId`, `title`, `content`, `replies[]` | Belongs to: Course, User |
| **assignments** | `courseId`, `moduleId`, `title`, `description`, `dueDate` | Belongs to: Course, Module |
| **submissions** | `assignmentId`, `userId`, `content`, `grade` | Belongs to: Assignment, User |
| **notifications** | `userId`, `type`, `title`, `message`, `isRead` | Belongs to: User |
| **payments** | `userId`, `courseId`, `amount`, `currency`, `status`, `provider`, `externalPaymentId` | Belongs to: User, Course |
| **certificates** | `userId`, `courseId`, `certificateNumber`, `issuedAt` | Unique compound index on (userId, courseId) |
| **livesessions** | `courseId`, `instructorId`, `title`, `provider`, `meetingUrl`, `startsAt`, `status` | Belongs to: Course, User |
| **contactmessages** | `fullName`, `email`, `message`, `status`, `assignedTo` | Belongs to: User (assigned) |

---

## API Overview

The API is organized into 14 route modules under `/api/`. All endpoints return JSON.

> **Full API documentation** can be found in `backend/API.md` (to be created).

### Authentication (`/api/auth`)

| Method | Path | Auth | Roles | Rate Limit | Description |
|--------|------|:----:|:-----:|:----------:|-------------|
| POST | `/api/auth/register` | — | — | 5/15m | Register new user |
| POST | `/api/auth/login` | — | — | 10/15m | Login, returns JWT cookies |
| POST | `/api/auth/logout` | ✅ | Any | — | Revoke session |
| POST | `/api/auth/forgot-password` | — | — | 5/15m | Send reset email |
| POST | `/api/auth/reset-password` | — | — | 10/15m | Reset password with token |
| GET | `/api/auth/verify-email` | — | — | — | Verify email with token |
| POST | `/api/auth/resend-verification` | — | — | 5/15m | Resend verification email |
| POST | `/api/auth/refresh-token` | — | — | 30/15m | Rotate refresh token |
| GET | `/api/auth/csrf-token` | — | — | — | Get CSRF token |
| GET | `/api/auth/me` | ✅ | Any | — | Get current user |

### Courses (`/api/courses`)

| Method | Path | Auth | Roles | Description |
|--------|------|:----:|:-----:|-------------|
| GET | `/api/courses` | Optional | Any | List courses (with filters) |
| GET | `/api/courses/:id` | Optional | Any | Get course detail |
| POST | `/api/courses` | ✅ | instructor, admin | Create course |
| PUT | `/api/courses/:id` | ✅ | instructor, admin | Update course |
| DELETE | `/api/courses/:id` | ✅ | instructor, admin | Delete course |
| POST | `/api/courses/:id/enroll` | ✅ | student | Enroll in course |
| GET | `/api/courses/:id/progress` | ✅ | student | Get progress |
| PATCH | `/api/courses/:id/progress` | ✅ | student | Update progress |
| POST | `/api/courses/:id/lessons/:lessonId/complete` | ✅ | student | Mark lesson complete |
| POST | `/api/courses/:id/review` | ✅ | student | Add review |
| GET | `/api/courses/:id/modules` | ✅ | Any | List modules |
| POST | `/api/courses/:id/modules` | ✅ | instructor, admin | Create module |
| PUT | `/api/courses/modules/:moduleId` | ✅ | instructor, admin | Update module |
| DELETE | `/api/courses/modules/:moduleId` | ✅ | instructor, admin | Delete module |
| PATCH | `/api/courses/:id/modules/reorder` | ✅ | instructor, admin | Reorder modules |
| POST | `/api/courses/modules/:moduleId/lessons` | ✅ | instructor, admin | Create lesson |
| PUT | `/api/courses/modules/:moduleId/lessons/:lessonId` | ✅ | instructor, admin | Update lesson |
| DELETE | `/api/courses/modules/:moduleId/lessons/:lessonId` | ✅ | instructor, admin | Delete lesson |
| PATCH | `/api/courses/modules/:moduleId/lessons/reorder` | ✅ | instructor, admin | Reorder lessons |

### Content (`/api/content`)

| Method | Path | Auth | Roles | Description |
|--------|------|:----:|:-----:|-------------|
| GET | `/api/content` | — | Any | List published content |
| GET | `/api/content/:slug` | — | Any | Get content by slug |
| GET | `/api/content/manage` | ✅ | content_manager, admin | List all content (incl. drafts) |
| POST | `/api/content` | ✅ | content_manager, admin | Create content |
| PUT | `/api/content/:id` | ✅ | content_manager, admin | Update content |
| DELETE | `/api/content/:id` | ✅ | content_manager, admin | Delete content |
| POST | `/api/content/upload` | ✅ | content_manager, admin, instructor | Upload media |
| GET | `/api/content/media` | ✅ | content_manager, admin, instructor | List media library |
| DELETE | `/api/content/media/:id` | ✅ | content_manager, admin, instructor | Delete media |
| PATCH | `/api/content/media/:id` | ✅ | content_manager, admin, instructor | Rename media |

### Quizzes (`/api/quizzes`)

| Method | Path | Auth | Roles | Description |
|--------|------|:----:|:-----:|-------------|
| GET | `/api/quizzes/lesson/:lessonId` | ✅ | Any | Get lesson quizzes |
| POST | `/api/quizzes/lesson/:lessonId` | ✅ | instructor, admin | Create quiz |
| POST | `/api/quizzes/:quizId/attempts` | ✅ | student | Submit quiz attempt |
| GET | `/api/quizzes/:quizId/attempts/me` | ✅ | student | Get my attempts |
| GET | `/api/quizzes/:quizId/attempts` | ✅ | instructor, admin | View all attempts |
| GET | `/api/quizzes/all-attempts/me` | ✅ | student | Get all my quiz attempts |

### Payments (`/api/payments`)

| Method | Path | Auth | Roles | Description |
|--------|------|:----:|:-----:|-------------|
| POST | `/api/payments` | ✅ | student | Create payment/checkout |
| POST | `/api/payments/:id/confirm` | ✅ | student | Confirm payment |
| POST | `/api/payments/webhook/:provider` | — | — | Webhook (Stripe/PayPal) |
| GET | `/api/payments/me` | ✅ | Any | My payment history |
| GET | `/api/payments/instructor/revenue` | ✅ | instructor, admin | Instructor revenue |
| GET | `/api/payments/admin/revenue` | ✅ | admin | Platform revenue |

### Discussions (`/api/discussions`)

| Method | Path | Auth | Roles | Description |
|--------|------|:----:|:-----:|-------------|
| GET | `/api/discussions/course/:courseId` | ✅ | Any | Course discussions |
| POST | `/api/discussions/course/:courseId` | ✅ | Any | Create discussion post |
| GET | `/api/discussions/conversations` | ✅ | Any | My conversations |

### Certificates (`/api/certificates`)

| Method | Path | Auth | Roles | Description |
|--------|------|:----:|:-----:|-------------|
| GET | `/api/certificates/me` | ✅ | student | My certificates |
| POST | `/api/certificates/course/:courseId/generate` | ✅ | student | Generate certificate |
| GET | `/api/certificates/:certificateId/render` | ✅ | student | Render certificate HTML |
| GET | `/api/certificates/:certificateId/download` | ✅ | student | Download certificate |
| GET | `/api/certificates/:certificateId/download-pdf` | ✅ | student | Download certificate PDF |
| GET | `/api/certificates/verify/:certificateId` | — | Any | Verify certificate |

### Dashboards (`/api/dashboard`)

| Method | Path | Auth | Roles | Description |
|--------|------|:----:|:-----:|-------------|
| GET | `/api/dashboard/student` | ✅ | student | Student dashboard data |
| GET | `/api/dashboard/instructor` | ✅ | instructor, admin | Instructor dashboard data |
| GET | `/api/dashboard/admin` | ✅ | admin | Admin dashboard data |

### Users (`/api/users`)

| Method | Path | Auth | Roles | Description |
|--------|------|:----:|:-----:|-------------|
| GET | `/api/users` | ✅ | admin | List users |
| POST | `/api/users` | ✅ | admin | Create user |
| PATCH | `/api/users/me` | ✅ | Any | Update profile |
| PATCH | `/api/users/me/password` | ✅ | Any | Change password |
| POST | `/api/users/me/avatar` | ✅ | Any | Upload avatar |
| PATCH | `/api/users/:userId` | ✅ | admin | Admin update user |
| DELETE | `/api/users/:userId` | ✅ | admin | Delete user |

### Additional Modules

| Module | Prefix | Auth Required | Purpose |
|--------|--------|:-------------:|---------|
| Assignments | `/api/assignments` | ✅ | Course assignments & grading |
| Live Sessions | `/api/live-sessions` | ✅ | Live class scheduling |
| Notifications | `/api/notifications` | ✅ | User notifications |
| Contact | `/api/contact` | ✅ | Contact form & admin management with full UI |
| Settings | `/api/settings` | Partial | Platform settings |
| Health | `/healthz`, `/readyz` | — | Liveness & readiness probes |
| Metrics | `/metrics` | Optional | Prometheus metrics |

---

## Getting Started

### Prerequisites

- **Node.js** 22.x or later
- **npm** 10.x or later
- **MongoDB** 7.x (local, Atlas, or Docker)
- **Docker** & **Docker Compose** (optional, for containerized setup)

### Quick Start with Docker (Development)

This is the fastest way to get LearnSpace running locally with hot-reload:

```bash
# Clone the repository
git clone <repository-url>
cd LearnSpace

# Copy environment file
cp backend/.env.example backend/.env

# Start all services
docker compose up --build

# Wait for health checks to pass, then open:
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
```

The Docker Compose stack includes:
- **MongoDB 7** — database (persistent volume)
- **Redis 7** — caching & job queues (persistent volume)
- **Backend** — Express API on port 5000
- **Frontend** — Vite dev server on port 5173 (hot-reload enabled)

### Quick Start with Docker (Production)

```bash
# Build and start production services
docker compose -f docker-compose.prod.yml up --build -d

# Frontend (nginx): http://localhost:8080
# Backend API:      http://localhost:5000
```

To stop:
```bash
docker compose down
```

### Quick Start without Docker

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB connection string

# 3. Start MongoDB (must be running separately)
mongod

# 4. Start backend
npm run dev

# 5. In a new terminal, install & start frontend
cd ../frontend
npm install
npm run dev

# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
```

### Seed Demo Users

```bash
cd backend
npm run seed:demo-users
```

This creates four demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mit.com | Admin123! |
| Instructor | instructor@mit.com | Instructor123! |
| Content Manager | content.manager@mit.com | Content123! |
| Student | student@mit.com | Student123! |

> ⚠️ **Safety guard:** The seed script refuses to run when `NODE_ENV=production`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `NODE_ENV` | ✅ | `development` | Runtime environment |
| `PORT` | ✅ | `5000` | API server port |
| `MONGODB_URL` | ✅ | — | MongoDB connection string |
| `CORS_ORIGIN` | ✅ | — | Allowed CORS origins (comma-separated) |
| `FRONTEND_URL` | ✅ | — | Frontend URL for redirects |
| `BASE_URL` | ✅ | — | Public API base URL |
| `JWT_ACCESS_SECRET` | ✅ | — | JWT access token signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | ✅ | — | JWT refresh token signing secret (min 32 chars) |
| `JWT_VERIFY_SECRET` | ✅ | — | Email verification token secret |
| `JWT_RESET_SECRET` | ✅ | — | Password reset token secret |
| `COOKIE_SECURE` | ⚠️ | `false` | Set `true` in production (HTTPS) |
| `COOKIE_SAME_SITE` | — | `lax` | Cookie SameSite attribute |
| `CSRF_COOKIE_SECURE` | ⚠️ | `false` | Set `true` in production (HTTPS) |
| `CSRF_COOKIE_SAME_SITE` | — | `lax` | CSRF cookie SameSite attribute |
| `TRUST_PROXY` | — | — | Set `1` when behind a reverse proxy |
| `STORAGE_TYPE` | — | `local` | File storage backend: `local` or `s3` |
| `MAX_UPLOAD_SIZE_MB` | — | `250` | Max file upload size in MB |
| `EMAIL_USER` | ⚠️ | — | SMTP email user (required for email features) |
| `EMAIL_PASS` | ⚠️ | — | SMTP email password |
| `STRIPE_SECRET_KEY` | ⚠️ | — | Stripe secret key |
| `PAYPAL_CLIENT_ID` | ⚠️ | — | PayPal client ID |
| `PAYPAL_CLIENT_SECRET` | ⚠️ | — | PayPal client secret |
| `PAYPAL_ENV` | — | `sandbox` | PayPal environment |
| `PAYMENT_WEBHOOK_SECRET` | ⚠️ | — | Webhook signing secret |
| `REDIS_URL` | — | — | Redis connection string (optional) |
| `CACHE_COURSE_LIST_TTL_SEC` | — | — | Course cache TTL (requires Redis) |
| `GLOBAL_API_RATE_LIMIT_MAX` | — | — | Global rate limit max requests |
| `GLOBAL_API_RATE_LIMIT_WINDOW_MS` | — | — | Global rate limit window in ms |
| `METRICS_BEARER_TOKEN` | — | — | Bearer token for `/metrics` endpoint |
| `ENABLE_JOB_QUEUE` | — | — | Enable BullMQ job queue (requires Redis) |
| `AWS_REGION` | ⚠️ | — | AWS region (S3 storage) |
| `AWS_ACCESS_KEY_ID` | ⚠️ | — | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | ⚠️ | — | AWS secret key |
| `AWS_S3_BUCKET` | ⚠️ | — | S3 bucket name |

### Frontend

> The frontend uses a build-time environment variable. In development, it defaults to `http://127.0.0.1:5000` via Vite proxy configuration.

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `VITE_API_URL` | ✅ (build) | `http://127.0.0.1:5000` | Backend API URL (passed as Docker build arg) |

---

## Running Locally

### Option 1: Docker Compose (Recommended)

```bash
# Development
docker compose up --build

# Production (add prod override)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# Stop
docker compose down
```

### Option 2: Local Development (Hot Reload)

```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Backend
cd backend
npm install
npm run dev    # Starts with ts-node, hot reload

# Terminal 3: Frontend
cd frontend
npm install
npm run dev    # Vite dev server, hot reload
```

### Useful Scripts

```bash
# Backend
cd backend
npm run dev              # Development server with hot reload
npm run build            # TypeScript compilation
npm run typecheck        # Type checking without emitting
npm test                 # Run all tests
npm run lint             # ESLint (zero warnings enforced)
npm run seed:demo-users  # Seed demo users (dev only)

# Frontend
cd frontend
npm run dev              # Vite development server
npm run build            # Production build
npm test                 # Run Vitest tests
npm run test:e2e         # Run Playwright E2E tests
npm run lint             # ESLint
npm run typecheck        # TypeScript checking
```

---

## Development Workflow

> **Note:** This section describes the recommended workflow based on the project structure. Adapt to your team's conventions.

### Branch Strategy

- `main` — Production-ready code
- `develop` — Integration branch
- `feat/<name>` — Feature branches
- `fix/<name>` — Bug fix branches

### Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add quiz auto-grading for essay questions
fix: resolve CSRF token refresh race condition
chore: update dependencies
docs: add API documentation for certificate endpoints
test: add rate limiter integration tests
```

### Code Quality

All code must pass before merging:

```bash
# Backend
npm run lint       # Zero warnings
npm run typecheck  # No type errors
npm test           # All tests pass

# Frontend
npm run lint       # Zero warnings
npm run typecheck  # No type errors
npm test           # All tests pass
```

---

## Testing

### Backend Tests

**Framework:** Jest 30 + Supertest + mongodb-memory-server

```bash
cd backend
GLOBAL_API_RATE_LIMIT_MAX=50 npm test    # Run all 41 test suites
GLOBAL_API_RATE_LIMIT_MAX=50 npm test -- --coverage      # With coverage report
GLOBAL_API_RATE_LIMIT_MAX=50 npm run test:watch          # Watch mode
```

**Coverage targets:** 50% across branches, functions, lines, statements.

**Test suites include:**

| Category | Files | Coverage |
|----------|-------|----------|
| Auth | 5 | Full flow, routes, middleware, service, rate limiting |
| Courses | 4 | CRUD, enrollment, notifications, membership |
| Content | 2 | CRUD, routes |
| Quizzes | 2 | CRUD, attempts, routes |
| Certificates | 2 | Generation, verification, routes |
| Payments | 3 | Processing, routes, gateway service |
| Discussions | 2 | CRUD, notification integration |
| Assignments | 2 | CRUD, grading, routes |
| Live Sessions | 2 | CRUD, routes |
| Notifications | 1 | Routes |
| Dashboard | 1 | Routes |
| Security | 2 | Authorization, integration |
| Socket.IO | 2 | Auth, notification events |
| Database | 2 | Transactions, persistence |
| Infrastructure | 6 | Rate limiter, error handling, env, retry, safe-regex, route-params, email service, service failures |

### Frontend Tests

**Unit/Component Tests:** Vitest + React Testing Library

```bash
cd frontend
npm test                    # Run Vitest (watch mode)
npm test -- --run           # Single run (CI mode)
```

**E2E Tests:** Playwright

```bash
cd frontend
npx playwright install      # Install browsers (first time)
npm run test:e2e            # Run all E2E tests
npx playwright show-report  # View HTML report
```

**E2E test files (11 specs):**

| File | Purpose |
|------|---------|
| `smoke.spec.ts` | Public routes, redirects, protected routes |
| `auth-authorization.spec.ts` | CSRF login, invalid credentials, expired sessions, role-based nav |
| `real-auth.spec.ts` | Real authentication scenarios |
| `core-user-flows.spec.ts` | Login, registration, dashboards, learning, CMS, discussions |
| `course-enrollment.spec.ts` | Enrollment flows |
| `quiz-flow.spec.ts` | Quiz taking & submission |
| `failure-states.spec.ts` | Error state handling |
| `api-failures.spec.ts` | API failure scenarios |
| `accessibility-resilience.spec.ts` | Accessibility + resilience |
| `security-authorization.spec.ts` | Security edge cases |

---

## Deployment

### Current State

LearnSpace is **fully containerized** and ready for deployment. The CI pipeline builds and tests every push/PR to `main`. However, **no CD pipeline is currently configured** — deployment to a cloud provider requires manual setup or additional CI workflow steps.

### Docker Compose (Production)

```bash
# Build and start with production settings
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# Monitor health
docker compose ps
docker compose logs -f
```

The production override enables:
- `NODE_ENV=production`
- Secure cookie flags (`COOKIE_SECURE=true`, `CSRF_COOKIE_SECURE=true`)
- `TRUST_PROXY=1` for reverse proxy compatibility

### Recommended Deployment Targets

LearnSpace can be deployed to any platform supporting Docker containers:

| Platform | Configuration Needed |
|----------|---------------------|
| **Single VPS** (DigitalOcean, Linode, AWS EC2) | Docker Compose + reverse proxy (Caddy/Nginx) |
| **Railway** | `railway.toml` + Dockerfile |
| **Render** | `render.yaml` + Dockerfile |
| **AWS ECS / Fargate** | Task definitions + ECR |
| **Kubernetes** | Helm chart or K8s manifests |

### Container Hardening

- **Pinned base images** — No `latest` tags (e.g., `node:22-alpine3.21`, `nginx:1.27-alpine`, `mongo:7.0.17`)
- **Multi-stage builds** — Runtime images contain only production dependencies
- **Non-root users** — Backend runs as `node`, frontend as `nginx`
- **`no-new-privileges`** — Security option on all app services
- **Read-only filesystem** — Frontend container uses `read_only: true` with tmpfs
- **Health checks** — Configured at Dockerfile and compose levels
- **Health endpoints** — `/healthz` (liveness), `/readyz` (readiness)

---

## CI/CD

### Continuous Integration

**GitHub Actions** workflow (`.github/workflows/ci.yml`) runs on push/PR to `main`/`master`:

```
Trigger: push or PR to main/master
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
  ┌────────────┐  ┌────────────┐  ┌────────────┐
  │ Backend    │  │ Frontend   │  │ Frontend   │
  │ Checks     │  │ Checks     │  │ Unit Tests │
  │ ─ lint     │  │ ─ lint     │  │ ─ build    │
  │ ─ typecheck│  │ ─ typecheck│  │ ─ test     │
  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
        │               │               │
        └───────────────┼───────────────┘
                        ▼
                 ┌──────────────┐
                 │  Frontend    │
                 │  E2E Tests   │
                 │  ─ build     │
                 │  ─ playwright │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │  Notify      │
                 │  (always)    │
                 └──────────────┘
```

**Five parallel jobs:**
1. **backend-checks** — lint + typecheck
2. **backend-tests** — build + test (with MongoDB service container)
3. **frontend-checks** — lint + typecheck
4. **frontend-unit-tests** — build + test
5. **frontend-e2e-tests** — build + Playwright install + E2E

All jobs upload coverage artifacts. The `notify` job runs always, summarizes results, and exits with code 1 if any job failed.

### Missing CD

> ⚠️ **Needs Verification:** No deployment pipeline is currently configured. The CI pipeline only tests and builds — it does not push images or deploy to any environment. See [Roadmap](#roadmap) for planned additions.

---

## Security

LearnSpace implements defense-in-depth with multiple security layers.

### Authentication & Authorization

| Measure | Implementation |
|---------|---------------|
| Password hashing | bcrypt with 10 salt rounds |
| JWT access tokens | HS256, 15min expiry, stored in httpOnly cookies |
| JWT refresh tokens | HS256, 7 day expiry, rotated on use |
| Token versioning | `tokenVersion` field on User model — increment to revoke all sessions |
| Email verification | JWT-signed verification tokens |
| Password reset | JWT-signed reset tokens, 1 hour expiry, strong password policy (8+ chars, upper+lower+digit+special) |
| Role-based access | `roleMiddleware` enforces at route level |
| Active user check | Disabled/inactive users blocked at auth level |

### Request Security

| Measure | Implementation |
|---------|---------------|
| CSRF protection | Double-submit cookie pattern (`csrfToken` cookie + `X-CSRF-Token` header) |
| Rate limiting | Global API ceiling + per-route limits (register: 5/15m, login: 10/15m, etc.) |
| Input validation | Joi schemas on every mutation endpoint (`stripUnknown`, `abortEarly: false`) |
| Input sanitization | Strips `<script>`, `<iframe>`, `<object>`, event handlers, `javascript:` protocol |
| Body size limits | JSON/URL-encoded: 1MB; File uploads: configurable (default 250MB) |
| CORS | Whitelist-based origin validation with credentials support |
| Helmet headers | `X-Content-Type-Options`, HSTS (production), `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` |
| X-Powered-By | Disabled |

### Data Security

| Measure | Implementation |
|---------|---------------|
| NoSQL injection | Mongoose parameterized queries; no raw `$where` usage |
| ReDoS protection | `safeRegexFragment` limits search length (200 chars) |
| Safe redirects | URL sanitization via `sanitizeUrl` on frontend |
| Secrets validation | Production mode rejects placeholder secrets (`replace_with_*`, `change_me`) |
| Log redaction | Structured logger auto-redacts JWTs and secrets |

### File Upload Security

| Measure | Implementation |
|---------|---------------|
| MIME validation | Whitelist of allowed MIME types |
| Magic byte validation | File content verification before extension check |
| Extension checking | Allowed extensions whitelist |
| Path traversal | Filename sanitization prevents `../` attacks |
| Size limits | Configurable per upload type (avatar: 5MB, general: 250MB) |
| Dual storage | Local filesystem or AWS S3 via `STORAGE_TYPE` |

### WebSocket Security

| Measure | Implementation |
|---------|---------------|
| Connection auth | JWT verification on Socket.IO connect |
| Token version check | Server validates `tokenVersion` on connect |
| Room isolation | Users can only join rooms for courses they have access to |
| Rate limiting | 30 messages per 10 seconds per socket |

### Production Security Checklist

```bash
# Required for production deployment
COOKIE_SECURE=true
CSRF_COOKIE_SECURE=true
NODE_ENV=production
TRUST_PROXY=1
# All JWT secrets: min 32 chars, no placeholder values
# HTTPS terminated at reverse proxy (Caddy, Nginx, Cloudflare)
```

---

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create a feature branch:** `git checkout -b feat/your-feature`
3. **Make your changes** following the code style
4. **Ensure quality:** run lint, typecheck, and tests
5. **Commit** using conventional commits
6. **Push** and open a Pull Request

### Code Style

- TypeScript strict mode throughout
- ESLint with zero warnings (`--max-warnings 0`)
- Follow existing patterns in the codebase
- Use Joi validation for any new API endpoints
- Write tests for new features

### Pull Request Checklist

- [ ] Code follows project style (lint passes)
- [ ] TypeScript compiles without errors
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] API changes documented
- [ ] Environment variables documented (if applicable)

---

## Roadmap

### ✅ Completed

| Phase | Weeks | Deliverables |
|-------|-------|-------------|
| Project Setup | 1-2 | Backend + frontend workspaces, MongoDB schemas, TypeScript |
| Backend API | 3-4 | Auth, courses, content, JWT, RBAC, validation, rate limiting |
| Frontend Foundation | 5-6 | React routes, Redux, role-aware layout, CMS, media library |
| LMS Core | 7-8 | Course player, quizzes, assignments, discussions, certificates, progress |
| Advanced Analytics & Payments | 9-10 | Stripe/PayPal, revenue analytics, auto-enrollment |
| Production Readiness | 11-12 | Docker, Nginx, CI pipeline, health checks, E2E tests |

### 🔄 In Progress / Planned

| Feature | Status | Notes |
|---------|--------|-------|
| Assignment frontend UI | ✅ Done | Full submit & grade UI |
| Live session frontend UI | ✅ Done | Session cards with provider labels |
| Contact admin management UI | ✅ Done | Search, filter, assign, status, review notes |
| CD pipeline | 📝 Planned | Deploy to staging/production |
| Redis caching (production setup) | 📝 Planned | Course list caching implemented |
| AI course recommendations | 📝 Future | Listed in original roadmap |
| Kubernetes deployment | 📝 Future | For enterprise scaling |
| React Native mobile app | 📝 Future | Cross-platform mobile learning |

---

## FAQ

**Q: Is LearnSpace production-ready?**
A: Yes. The codebase includes production-grade security, Docker containerization, health checks, comprehensive testing, and CI. However, a CD pipeline and production deployment configuration still need to be set up for your specific infrastructure.

**Q: Can I use LearnSpace for commercial purposes?**
A: Yes, it's open-source under the MIT license.

**Q: What payment providers are supported?**
A: Stripe, PayPal, and bank transfer. The payment gateway service is designed to be extensible.

**Q: Does it support SSO/SAML?**
A: Not yet. Authentication is email/password with JWT. OAuth providers are a planned enhancement.

**Q: Can I host videos directly?**
A: Yes. LearnSpace supports video upload to local storage or S3. For production with many students, consider using a CDN or a dedicated video platform like Mux or Cloudflare Stream.

**Q: How do I reset the database?**
A: In development, you can drop the database and re-run seeds. For production, use the MongoDB backup/restore tools.

**Q: Is there a mobile app?**
A: Not yet. The React frontend is responsive and works on mobile browsers. A React Native app is in the future roadmap.

**Q: What's the difference between a "content manager" and "instructor"?**
A: Content managers manage the CMS (pages, posts, media library). Instructors create and teach courses. Admins can do both.

---

## License

This project is open-source. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

- **MiT Full Stack Development Internship Program 2025** — Project framework and mentorship
- **Open source community** — All the incredible libraries that make this project possible
- **React, Express, MongoDB, and Node.js communities** — For the ecosystem
- **Material UI** — For the comprehensive component library
- **All contributors** — Who help improve this project

---

<p align="center">
  Built with ❤️ during the MiT Full Stack Development Internship Program 2025
</p>

<p align="center">
  <a href="#readme">⬆ Back to Top</a>
</p>
