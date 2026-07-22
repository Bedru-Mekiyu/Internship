# Changelog

All notable changes to LearnSpace LMS are documented in this file.

## 1.1.0 — 2026-07-22

### Added
- Contact Admin management UI (search, filter, assign, status update, review notes)
- ROADMAP.md living document tracking all platform features
- `.nvmrc` for consistent Node.js 20 usage
- `.editorconfig` for cross-editor formatting consistency

### Changed
- Graceful shutdown now stops in-memory MongoDB server if running

## 1.0.0 — 2026-07-21

### Added
- Full assignment management UI (list, submit, grade) with RTK Query integration
- Live sessions page with card-based session display
- OpenAPI 3.0 specification covering 15 route groups
- Interactive API docs viewer at `/api-docs` (Swagger UI)
- React Error Boundary wrapping entire app shell
- PWA support (manifest, SVG icons, meta tags)
- Docker Compose dev stack (MongoDB 7, Redis 7, hot-reload)
- Docker Compose prod stack (Nginx + SPA, backend, MongoDB, Redis)
- Prettier configuration
- MIT License
- E2E smoke tests (Playwright) — 4 basic tests

### Fixed
- CI test database setup: conditional `MONGODB_URL` override
- CI notify job: includes `frontend-unit-tests` in FRONTEND_PASSED check
- npm audit vulnerabilities resolved (backend + frontend)

### Infrastructure
- Dockerfile frontend dev stage for Vite hot-reload in Docker
- Nginx config with SPA fallback + API proxy
- Multi-stage builds with alpine base images

## 0.9.0 — Initial Baseline

Core LearnSpace LMS platform with:
- User authentication (JWT, refresh tokens, email verification)
- Role-based access control (student, instructor, admin, content_manager)
- Course management (CRUD, modules, lessons)
- Content management system
- Discussion forums with real-time updates
- Quiz engine (builder + taker)
- Certificate generation (PDF)
- Payment integration (Stripe + PayPal)
- Notification system (email, in-app, real-time)
- Admin dashboard with analytics
- Comprehensive security controls (CSP, CSRF, rate limiting, input validation)
- 40+ backend integration tests
- GitHub Actions CI pipeline
