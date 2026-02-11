# 🚀 MiT MERN Internship Project 2025
## Dynamic CMS & Advanced Learning Management System (LMS)

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

# 🏗 System Architecture

The application follows a **Modular Monolith (Microservices-Inspired)** architecture.

### Architecture Layers

1. **Presentation Layer** – React + TypeScript
2. **API Layer** – Express.js Routes & Middleware
3. **Business Logic Layer** – Services & Controllers
4. **Data Access Layer** – Mongoose Models
5. **Database Layer** – MongoDB
6. **External Services** – Email, Payments, Storage

---

# 🧰 Technology Stack

## 🎨 Frontend

- React.js 18+
- TypeScript
- Ant Design / Material UI
- Redux Toolkit
- React Query
- React Router
- Formik + Yup
- Recharts / Chart.js
- Socket.io Client
- Tailwind CSS

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
- Jest & Supertest
- Cypress (E2E Testing)
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
POST /api/courses/:id/review
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

---

# ✨ LMS Features

- Custom Video Player (90% Completion Logic)
- Quiz & Assessment Engine
- Assignment Submissions
- Certificate Generation
- Real-time Discussions (Socket.io)
- Live Sessions (WebRTC Ready)
- Drip Content Release
- Multi-language Support
- Payment Integration (Stripe/PayPal)
- Gamification (Badges, Leaderboards)
- Affiliate System
- White Label Branding

---

# 🧱 CMS Features

- Rich Text Editor (React Quill)
- Drag-and-drop Page Builder
- SEO Optimization
- Media Library with Filters
- Version Control
- Content Scheduling
- Role-based Permissions

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

- ✅ Unit Testing (Jest)
- ✅ Integration Testing (Supertest)
- ✅ Frontend Testing (React Testing Library)
- ✅ End-to-End Testing (Cypress)

---

# 🐳 Docker Setup

## Run with Docker Compose

```bash
docker-compose up --build
```

### Services

- MongoDB
- Backend API (Port 5000)
- Frontend (Port 3000)

### ⚙ Environment Variables

Create `.env` in `backend`:

```bash
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/mit_lms
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
```

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

# 👨‍💻 Internship Program

Developed under:

**MiT Full Stack MERN Internship Program 2025**
Addis Ababa, Ethiopia

🌐 https://mizantechinstitute.com

📧 contact@mizantechinstitute.com

⭐ If you find this project useful, give it a star!

---

