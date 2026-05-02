## 🚀Dynamic CMS & Advanced Learning Management System (LMS)

<p align="center">
  <img src="https://img.shields.io/badge/MERN-Full%20Stack-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Express.js-Backend-black?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker" />
  <img src="https://img.shields.io/badge/GitHub%20Actions-CI/CD-2088FF?style=for-the-badge&logo=github-actions" />
</p>

---

## 📌 Project Overview

This project is developed under the **MiT Full Stack Development Internship Program 2025**.

It consists of two fully integrated systems:

1. 🏢 **Dynamic Content Management Website (CMS)**
2. 🎓 **Advanced Learning Management System (LMS)**

The system replicates enterprise-level platforms like **LearnWorlds** and **Teachable**, implementing scalable architecture, authentication, dashboards, analytics, and deployment pipelines.

---

# 🎯 Learning Objectives

By completing this project, interns master:

- Full Stack MERN development
- RESTful API design
- Database schema architecture
- JWT authentication & RBAC
- LMS platform engineering
- CMS system development
- DevOps & CI/CD pipelines
- Docker containerization
- Modern UI/UX principles

---

# ✅ Week 1–4 Implementation Status

## Week 1–2 (Project Setup, Design, DB)

- [x] Backend and frontend workspaces initialized
- [x] TypeScript + Jest setup for backend
- [x] Core MongoDB/Mongoose schemas implemented (`users`, `courses`, `modules`, `lessons`, `enrollments`, `content`, `media`, etc.)
- [ ] Figma design links/screenshots documented in repository (external artifacts pending attachment)

## Week 3–4 (Backend API Development)

- [x] Authentication APIs: register, login, logout, forgot-password, reset-password, verify-email, refresh-token, me
- [x] Course APIs: list, detail, create, update, delete, enroll, progress, review
- [x] Content APIs: list, detail by slug, create, update, delete, upload, media
- [x] JWT auth + RBAC middleware
- [x] Input validation with Joi on core routes
- [x] Rate limiting on sensitive auth endpoints
- [x] Route-level backend tests with Supertest/Jest

## Week 5–6 (Frontend Foundation)

- [x] React app routed with protected pages (`/auth`, `/dashboard`, `/courses`, `/cms`)
- [x] Redux Toolkit auth/course slices and shared API service layer
- [x] Role-aware layout with dashboard/sidebar navigation
- [x] CMS content manager + media upload/library pages wired to backend APIs
- [x] Frontend tests/build configured and passing

## Week 7–8 (LMS Core)

- [x] Course modules and lessons API integration in learner player
- [x] Instructor dashboard wired to backend analytics
- [x] Instructor module/lesson management UI (create module, create lesson)
- [x] Lesson completion persistence (`completedLessons`) with next/previous learning flow
- [x] Course progress tracking with total/completed lesson metadata
- [x] Real-time course discussions (Socket.io rooms + REST history)
- [x] Assignment workflow (create, submit/update, grade, analytics)
- [x] Quiz workflow (create by lesson, submit attempts, auto-grade for objective types)

## Week 9–10 (Advanced Analytics & Payments)

- [x] Payment APIs (`/api/payments`) for real Stripe/PayPal checkout and payment history
- [x] Auto-enrollment after successful payment completion
- [x] Instructor revenue analytics (total revenue, transactions, monthly trend, top courses)
- [x] Dashboard UI integration for payment and revenue KPIs by role

## Week 11–12 (Deployment & Production Readiness)

- [x] Production Dockerfiles for backend and frontend (`backend/Dockerfile`, `frontend/Dockerfile`)
- [x] Nginx runtime config for frontend SPA and `/api` reverse proxy (`frontend/nginx.conf`)
- [x] End-to-end local environment via `docker-compose.yml` (MongoDB + backend + frontend)
- [x] Environment templates added (`backend/.env.example`, `frontend/.env.example`)
- [x] Health endpoints configured (`/healthz` on backend and frontend container)
- [x] CI workflow added for backend/frontend test + build (`.github/workflows/ci.yml`)

---

# 🏗 System Architecture

The application follows a **Modular Monolith (Microservices-Inspired)** architecture.

2. **API Layer** – Express.js Routes & Middleware
3. **Business Logic Layer** – Services & Controllers
4. **Data Access Layer** – Mongoose Models
5. **Database Layer** – MongoDB
6. **External Services** – Email, Payments, Storage

---

# 🗂 Project Structure

```text
📁 Backend            backend/
 ├── src/
 │   ├── config/
 │   ├── controllers/
 │   ├── middleware/
 │   ├── models/
 │   ├── routes/
 │   ├── services/
 │   ├── utils/
 │   ├── types/
 │   └── app.ts
 ├── tests/
 ├── uploads/
 ├── Dockerfile
 ├── package.json
 └── tsconfig.json

📁 Frontend           frontend/
 ├── public/
 ├── src/
 │   ├── components/
 │   ├── pages/
 │   ├── hooks/
 │   ├── services/
 │   ├── store/
 │   ├── types/
 │   ├── utils/
 │   ├── App.tsx
 │   └── index.tsx
 ├── package.json
 └── tsconfig.json
```

---

# 🧰 Technology Stack

## 🎨 Frontend

- React.js 19+ (Vite)
- TypeScript
- **Material UI (MUI) v9** — MiT materials allow Ant Design *or* MUI; this repo standardizes on MUI
- Redux Toolkit
- TanStack React Query
- React Router
- Formik + Yup
- Recharts
- Socket.io Client (via backend real-time features)

---

## ⚙ Backend

- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt
- Joi Validation
- Multer (File Upload)
- Socket.io
- Nodemailer

---

## 🚀 DevOps & Tools

- Git & GitHub
- Docker
- Docker Compose
- Nginx
- PM2
- AWS / DigitalOcean Deployment
- GitHub Actions (CI/CD)
- Jest & Supertest (backend)
- Vitest & React Testing Library (frontend)
- Playwright (E2E smoke tests in `frontend/e2e/`)
- ESLint & Prettier

---

# 🗄 Database Collections

| Collection | Purpose |
|------------|----------|
| users | User management |
| courses | Course information |
| modules | Course modules |
| lessons | Lessons |
| enrollments | Enrollment tracking |
| assignments | Course assignments |
| submissions | Assignment submissions |
| quizzes | Lesson quizzes |
| quizattempts | Quiz attempts and scoring |
| discussions | Course discussions |
| notifications | User notifications |
| payments | Payment records |
| content | CMS content |
| media | Media library |

---

# 🔐 Authentication & Authorization

- JWT Access Tokens (15 minutes)
- JWT Refresh Tokens (7 days)
- Role-Based Access Control (RBAC)

### Roles

- `student`
- `instructor`
- `admin`
- `content_manager`

---

# 📡 API Endpoints

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET /api/auth/verify-email/:token
POST /api/auth/refresh-token
GET /api/auth/me
```

## Course Management

```http
GET /api/courses
GET /api/courses/:id
POST /api/courses
PUT /api/courses/:id
DELETE /api/courses/:id
POST /api/courses/:id/enroll
GET /api/courses/:id/progress
PATCH /api/courses/:id/progress
POST /api/courses/:id/review
GET /api/courses/:id/modules
POST /api/courses/:id/modules
POST /api/courses/modules/:moduleId/lessons
POST /api/courses/:id/lessons/:lessonId/complete
GET /api/dashboard/student
GET /api/dashboard/instructor
GET /api/dashboard/admin
```

## CMS

```http
GET /api/content
GET /api/content/:slug
POST /api/content
PUT /api/content/:id
DELETE /api/content/:id
POST /api/content/upload
GET /api/content/media
```

## Payments & Revenue

```http
POST /api/payments
POST /api/payments/:id/confirm
POST /api/payments/webhook/:provider
GET /api/payments/me
GET /api/payments/instructor/revenue
GET /api/payments/admin/revenue
```

## Discussions, Assignments & Quizzes

```http
GET /api/discussions/course/:courseId
POST /api/discussions/course/:courseId

GET /api/assignments/course/:courseId
GET /api/assignments/course/:courseId/analytics
POST /api/assignments/course/:courseId
GET /api/assignments/course/:courseId/submissions/me
POST /api/assignments/:assignmentId/submissions
GET /api/assignments/:assignmentId/submissions
PATCH /api/assignments/:assignmentId/submissions/:submissionId/grade

GET /api/quizzes/lesson/:lessonId
POST /api/quizzes/lesson/:lessonId
POST /api/quizzes/:quizId/attempts
GET /api/quizzes/:quizId/attempts/me
GET /api/quizzes/:quizId/attempts

GET /api/certificates/me
POST /api/certificates/course/:courseId/generate
GET /api/certificates/verify/:certificateId
GET /api/certificates/:certificateId/render
GET /api/certificates/:certificateId/download

GET /api/live-sessions/course/:courseId
POST /api/live-sessions/course/:courseId
PATCH /api/live-sessions/:sessionId/status
```

---

# ✨ LMS Features

- Course module/lesson player with progress tracking and lesson completion
- Quiz engine with lesson-level quiz creation and student attempts
- Auto-grading for multiple-choice and true/false questions
- Assignment submission + instructor grading + analytics cards
- Completion certificates (student generation + listing + verification + server-rendered preview/download)
- Live session scheduling and join links for instructor/student workflow
- Real-time discussions (Socket.io + persistent history)
- Payment flow and role-based revenue dashboards
- Secure cookie auth + CSRF protection + hardened upload rules

---

# 🧱 CMS Features

- Dynamic content CRUD with role-based permissions
- Media upload and media library endpoints
- Content publishing workflow (`draft` / `published`)

---

# 📊 Dashboards

## 👨‍🎓 Student Dashboard

- Course progress tracking
- Achievements & badges
- Study streak
- Certificates

## 👨‍🏫 Instructor Dashboard

- Revenue analytics
- Student engagement stats
- Course ratings
- Completion rate tracking

## 🛡 Admin Dashboard

- Platform-wide analytics
- User management
- Course approvals
- System monitoring

---

# 🧪 Testing Strategy

- Unit and integration tests: **Jest** + **Supertest** (`backend/tests/`)
- Frontend unit/component tests: **Vitest** + **Testing Library** (`frontend/src/**/*.test.ts(x)`)
- E2E smoke tests: **Playwright** (`frontend/e2e/`)
- **CI** (`.github/workflows/ci.yml`): backend `npm run typecheck`, `npm test`, `npm run build`, `npm run lint`; frontend `npm test`, `npm run build`, `npm run lint`; E2E runs in CI with `npm run test:e2e` when browsers are installed

### MiT rubric alignment (stack choices)

| Topic | MiT guide mention | This repository |
|--------|-------------------|-----------------|
| UI library | Ant Design *or* MUI | **MUI** only |
| Frontend tests | RTL + Jest (example) | **Vitest** + Testing Library (Vite-native) |
| E2E | Cypress (example) | **Playwright** |
| CI lint | Sample workflow runs `npm run lint` | **Implemented**: `lint` on backend and frontend in CI |

### Run E2E (Playwright)

From `frontend/`:

```bash
npx playwright install
npm run test:e2e
```

### Run linters

```bash
cd backend && npm run lint
cd frontend && npm run lint
```

---

# 🐳 Docker Setup

## Run with Docker Compose

```bash
docker-compose up --build
```

For detached mode:

```bash
docker-compose up --build -d
```

To stop the stack:

```bash
docker-compose down
```

## Run with Production Override

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

To stop production override stack:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
```

### Services

- MongoDB
- Backend API (Port 5000)
- Frontend (Port 3000)

### 🛡 Container Hardening

- Pinned base images for Node, MongoDB, and Nginx runtime
- Non-root frontend runtime (`nginx-unprivileged`) and non-root backend process (`USER node`)
- Service health checks for `mongo`, `backend`, and container-level frontend `/healthz`
- `no-new-privileges` security option on app services
- Read-only filesystem + tmpfs mounts for frontend runtime container

### ⚙ Environment Variables

Create `.env` in `backend`:

```bash
NODE_ENV=development
PORT=5000
MONGODB_URL=
MONGO_URI=mongodb://127.0.0.1:27017/mit_lms
AUTO_START_INMEMORY_MONGO=true
CORS_ORIGIN=http://localhost:3000
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
CSRF_COOKIE_SECURE=false
CSRF_COOKIE_SAME_SITE=lax
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
PAYMENT_WEBHOOK_SECRET=your_secret
```

Run MongoDB locally (without Docker), then start backend:

```bash
# Terminal 1
mongod

# Terminal 2 (from backend/)
npm run dev
```

If local MongoDB is not running, development mode can auto-start an in-memory MongoDB instance
when `AUTO_START_INMEMORY_MONGO=true`.

For production (HTTPS), set secure cookie values explicitly:

```bash
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
CSRF_COOKIE_SECURE=true
CSRF_COOKIE_SAME_SITE=lax
```

Frontend environment template:

```bash
REACT_APP_API_URL=http://localhost:5000
```

Use `backend/.env.example` and `frontend/.env.example` as the base templates.
For production setup, use `backend/.env.production.example` and `frontend/.env.production.example`.

### ✅ Health Checks

- Backend: `GET /healthz`
- Frontend container: `GET /healthz`

---

# 🔒 Security Practices

- Password hashing with Bcrypt
- Input validation with Joi
- JWT authentication
- Role-based access control
- Secure headers
- HTTPS in production

---

# 📅 Internship Timeline

| Phase | Weeks | Deliverables |
|-------|-------|-------------|
| Setup | 1-2 | Project & DB Design |
| Backend | 3-4 | API Development |
| Frontend | 5-6 | UI Implementation |
| LMS Core | 7-8 | Course System |
| Advanced | 9-10 | Analytics & Payments |
| Deployment | 11-12 | Testing & Production |

---

# 📈 Future Improvements

- AI Course Recommendations
- Redis Caching
- Kubernetes Deployment
- React Native Mobile App
- Microservices Architecture

---



⭐ If you find this project useful, give it a star!

---

