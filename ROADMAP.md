# LearnSpace LMS — Roadmap

> Living document — updated as the project evolves.

## Legend
- ✅ Done
- 🔄 In Progress
- ⬜ Not Started
- ❌ Blocked

## Core Platform

| Feature | Status | Notes |
|---------|--------|-------|
| User Authentication (JWT, refresh tokens, email verification) | ✅ | Session refresh, CSRF protection |
| Role-based Access Control (student, instructor, admin, content_manager) | ✅ | Middleware-level enforcement |
| Course Management (CRUD, modules, lessons) | ✅ | Full instructor workflow |
| Content Management System | ✅ | Pages, blocks, media library |
| Discussion Forums | ✅ | Socket.io real-time updates |
| Assignment Management | ✅ | Submit, grade, analytics |
| Quiz Engine | ✅ | Builder + taker |
| Live Sessions | ✅ | Zoom/Jitsi/Google Meet provider |
| Certificate Generation | ✅ | PDF via pdfkit |
| Payment Integration | ✅ | Checkout flow, payment gateway abstraction |
| Notifications (email, in-app, real-time) | ✅ | BullMQ queue, Socket.io |
| Admin Dashboard | ✅ | User management, analytics, approvals |

## Frontend Infrastructure

| Feature | Status | Notes |
|---------|--------|-------|
| TypeScript strict mode | ✅ | 0 lint errors, 0 type errors |
| RTK Query state management | ✅ | Auto-refresh, cache invalidation |
| MUI v9 component library | ✅ | Custom theme with design tokens |
| Lazy-loaded routes | ✅ | Code-split per page |
| Error boundary (app-level) | ✅ | Covers entire route tree |
| PWA manifest + icons | ✅ | Standalone mode, theme-color |
| Responsive layout | ✅ | Mobile-first breakpoints |
| E2E tests (Playwright) | ✅ | 10 spec files across core flows |
| Unit tests (Vitest) | ✅ | 23 tests passing |

## Backend Infrastructure

| Feature | Status | Notes |
|---------|--------|-------|
| OpenAPI 3.0 spec | ✅ | 15 route groups, Swagger UI viewer |
| Mongoose models | ✅ | 17 models with indexes |
| Auth middleware (JWT) | ✅ | Role-based enforcement |
| Input validation (Joi) | ✅ | Per-route schemas |
| Input sanitization | ✅ | Sanitize middleware |
| CSRF protection | ✅ | Cookie-based tokens |
| Rate limiting | ✅ | Global + per-route configurable |
| Security headers (Helmet) | ✅ | CSP, cross-origin policies |
| Structured logging | ✅ | Request-scoped, no PII leaks |
| Request IDs | ✅ | Traceable across requests |
| Prometheus metrics | ✅ | `/metrics` guarded endpoint |
| Graceful shutdown | ✅ | SIGTERM/SIGINT handlers |
| Health check | ✅ | `/healthz` endpoint |
| Redis caching | ✅ | Cache service abstraction |
| Email service | ✅ | Nodemailer with queue |
| Payment gateway abstraction | ✅ | Extendable provider pattern |
| Docker Compose (dev + prod) | ✅ | MongoDB 7, Redis 7, Nginx |

## Security

| Feature | Status | Notes |
|---------|--------|-------|
| Production secret validation | ✅ | 32+ char enforcement at startup |
| SQL/NoSQL injection prevention | ✅ | Parameterized queries via Mongoose |
| XSS protection | ✅ | Helmet CSP + sanitize middleware |
| CORS configuration | ✅ | Whitelist-based |
| Rate limiting | ✅ | 100 req/min global default |
| Duplicate key handling | ✅ | User-friendly 409 responses |
| No secrets in logs | ✅ | URI redaction utility |
| File upload restrictions | ✅ | Type/size validation |

## Testing

| Area | Status | Notes |
|------|--------|-------|
| Frontend unit tests | ✅ | 7 test files, 23 tests |
| Frontend E2E tests | ✅ | 10 Playwright spec files |
| Backend integration tests | 🔄 | 40+ test files — needs MongoDB |
| Security/integration tests | ✅ | Auth, authorization, CSRF flows |
| Database transaction tests | ✅ | Rollback/success paths |
| Payment service tests | ✅ | Gateway abstraction tests |
| Quiz engine tests | ✅ | Controller + routes |
| Assignment tests | ✅ | Controller + routes |

## DevOps

| Feature | Status | Notes |
|---------|--------|-------|
| CI pipeline (GitHub Actions) | ✅ | Lint → typecheck → test → build → E2E |
| Docker Compose (dev) | ✅ | Hot-reload, MongoDB, Redis |
| Docker Compose (prod) | ✅ | Nginx, optimized builds |
| Dockerfiles | ✅ | Multi-stage, alpine-based |
| Nginx config | ✅ | SPA fallback + API proxy |
| E2E CI with Playwright | ✅ | Cross-browser, retries, reports |

## Upcoming / In Progress

| Feature | Priority | Notes |
|---------|----------|-------|
| Contact Admin message management | ✅ **Done** (PR #12) | Search, status, assign, review |
| Backend test suite CI verification | High | Verify 40+ tests pass with MongoDB service |
| Automated DB backup strategy | Medium | Mongodump + S3/cloud storage |
| Performance optimization | Medium | Lazy loading audit, bundle analysis |
| Dark mode | Low | Theme toggle, system preference detection |
| Mobile push notifications | Low | Web push API integration |

## Planned (Next Quarter)

- AI-powered course recommendations
- Advanced analytics with custom report builder
- SCORM/LTI integration for institutional deployment
- Multi-language content support (i18n)
- Audit logging (admin action trail)
- Rate limit dashboards via Prometheus
