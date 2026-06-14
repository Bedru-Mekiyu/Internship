# Contributing to LearnSpace

Thank you for considering contributing to LearnSpace! This document outlines the process for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Include:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. Check existing issues and roadmap
2. Describe the feature and its use case
3. Explain how it fits the project's scope

### Pull Requests

1. **Fork** the repository
2. **Create a branch:** `git checkout -b feat/your-feature` or `fix/your-fix`
3. **Make changes** following the code style
4. **Run quality checks** (see below)
5. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/)
6. **Push** and open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/learnspace.git
cd learnspace

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string

# Frontend
cd ../frontend
npm install

# Start development servers
# Terminal 1: mongod
# Terminal 2: cd backend && npm run dev
# Terminal 3: cd frontend && npm run dev
```

## Quality Checks

All checks must pass before a PR can be merged:

```bash
# Backend
cd backend
npm run lint          # ESLint (zero warnings)
npm run typecheck     # TypeScript compilation check
npm test              # All tests pass

# Frontend
cd frontend
npm run lint          # ESLint
npm run typecheck     # TypeScript compilation check
npm test              # All tests pass
npm run test:e2e      # E2E tests (if applicable)
```

## Code Style Guidelines

- **TypeScript:** Strict mode enabled. Avoid `any` types.
- **Formatting:** ESLint rules are enforced. Consider using Prettier.
- **Imports:** Group by: external → internal → relative
- **Naming:** camelCase for variables/functions, PascalCase for components/classes, kebab-case for files
- **Error handling:** Use `asyncHandler` wrapper for async route handlers. Throw `AppError` for expected errors.
- **API changes:** Use Joi validation for all mutation endpoints.

## Commit Message Format

```
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`, `perf`
Scopes: `auth`, `courses`, `content`, `quizzes`, `payments`, `discussions`, `certificates`, `frontend`, `backend`, `infra`, `deps`

Examples:
```
feat(auth): add OAuth2 Google login
fix(payments): handle Stripe webhook signature timeout
docs(readme): add deployment section
test(courses): add enrollment edge case tests
```

## Pull Request Checklist

- [ ] Code follows project style (lint passes)
- [ ] TypeScript compiles without errors
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] API changes documented
- [ ] Environment variables documented (if applicable)
- [ ] PR description clearly explains the change

## Project Structure

```
backend/       — Express 5 API server
frontend/      — React 19 SPA
  ├── src/
  │   ├── components/   — Shared UI components
  │   ├── pages/        — Route-level page components
  │   ├── hooks/        — Custom React hooks
  │   ├── services/     — API client, Socket.IO
  │   ├── store/        — Redux slices + RTK Query API
  │   ├── types/        — TypeScript type definitions
  │   ├── utils/        — Utility functions
  │   └── theme/        — MUI theme configuration
  └── e2e/              — Playwright E2E tests
```

## Getting Help

- Open an issue for bugs or feature requests
- Check the FAQ in the README
