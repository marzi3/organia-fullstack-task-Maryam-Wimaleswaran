# 🗂️ Organia Task Manager

> A high-performance, full-stack Task Management Web Application.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green?logo=spring)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8?logo=tailwindcss)

---

## 📋 Project Overview

Organia Task Manager is a modern, production-ready task management application that enables users to create, organize, and track tasks through an intuitive dashboard. Built with a **Next.js 16** frontend and **Spring Boot 3.2** backend, it features secure JWT authentication, real-time search, priority management, multiple views (List, Calendar, Kanban Board, Insights, Admin Panel), and full CRUD operations.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion |
| **Backend** | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA |
| **Database** | PostgreSQL 16 (Supabase for production) |
| **Authentication** | JWT (JSON Web Tokens) with HS512 signing |
| **Build Tools** | Maven (Backend), npm (Frontend) |
| **Deployment** | Vercel (Frontend), Render (Backend), Supabase (Database) |

---

## ✨ Features

### Core Features
- ✅ User Authentication — Register, Login, Logout with JWT tokens
- ✅ Task CRUD — Create, Read, Update, Delete tasks
- ✅ Task Status Workflow — To Do → In Progress → Completed
- ✅ User Isolation — Each user can only access their own tasks
- ✅ Dashboard Analytics — Real-time summary cards with task counts
- ✅ Error Handling — Global exception handler with structured error responses

### Advanced Features
- 🔍 Real-time search by title
- ⚡ Sort by priority, due date, or title
- ⭐ Priority levels — Urgent, High, Medium, Low with color indicators
- 📁 Categories — Organize tasks into Work, Personal, or custom lists
- ✅ Subtasks / Checklists — Inline checklists with progress tracking
- 📅 Calendar View — Visual calendar with priority-colored task dots
- 📊 Kanban Board — Drag-and-drop board (To Do / In Progress / Done)
- 📈 Insights Dashboard — Charts and statistics for task trends
- 🌙 Dark Mode — Full dark/light theme toggle
- 📱 Responsive Design — Mobile-first with collapsible sidebar
- 🔔 Overdue Alerts — Visual indicators for past-due tasks
- 🔄 One-click Reschedule — Reschedule overdue tasks to today

---

## 📸 Screenshots

> Add screenshots to a `screenshots/` folder and update the paths below.

<!--
![Dashboard](./screenshots/dashboard.png)
![Calendar View](./screenshots/calendar.png)
![Kanban Board](./screenshots/kanban.png)
![Dark Mode](./screenshots/dark-mode.png)
-->

---

## 🚀 Setup and Run Instructions

### Prerequisites
- Java 17+ — [Download](https://adoptium.net/)
- Node.js 18+ — [Download](https://nodejs.org/)
- PostgreSQL 16 — [Download](https://www.postgresql.org/download/)

### 1. Clone the Repository

```bash
git clone https://github.com/marzi3/organia-fullstack-task-Maryam-Wimaleswaran.git
cd organia-fullstack-task-Maryam-Wimaleswaran
```

### 2. Database Setup

```bash
psql -U postgres
CREATE DATABASE organia_tasks;
\q
```

### 3. Backend Setup

```bash
cd backend
```

Configure `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/organia_tasks
    username: postgres
    password: your_password
```

Run:

```bash
chmod +x mvnw
./mvnw spring-boot:run
```

Backend starts at **http://localhost:8080**

### 4. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Run:

```bash
npm run dev
```

Frontend starts at **http://localhost:3000**

---

## 🌐 Live URLs

| Service | URL |
|---|---|
| **Frontend** | *Add your Vercel URL here* |
| **Backend** | *Add your Render URL here* |

---

## 🎯 Demo Credentials

| Field | Value |
|---|---|
| **Email** | `demo@organia.com` |
| **Password** | `Demo@123` |

> You can also register a new account from the sign-up page.

---

## 📡 API Documentation

Base URL: `http://localhost:8080` (local) or your deployed backend URL.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get JWT token |

**Register Request:**

```json
{
  "name": "Maryam W",
  "email": "maryam@organia.io",
  "password": "Demo@123"
}
```

**Login Request:**

```json
{
  "email": "maryam@organia.io",
  "password": "Demo@123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "id": 1,
  "name": "Maryam W",
  "email": "maryam@organia.io",
  "role": "USER"
}
```

### Tasks (Requires `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | Get all tasks for authenticated user |
| GET | `/tasks/summary` | Get task count summary |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/{id}` | Update a task |
| PATCH | `/tasks/{id}/status` | Update task status only |
| DELETE | `/tasks/{id}` | Delete a task |

### Administration (Requires `ROLE_ADMIN`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/users` | List all users with task counts |
| DELETE | `/admin/users/{id}` | Permanently delete a user account |

**Query Parameters for `GET /tasks`:**

| Parameter | Type | Description |
|---|---|---|
| `status` | String | `TO_DO`, `IN_PROGRESS`, `COMPLETED` |
| `search` | String | Search by title |
| `category` | String | Filter by category |
| `priority` | String | `URGENT`, `HIGH`, `MEDIUM`, `LOW` |

**Create Task Request:**

```json
{
  "title": "Design landing page",
  "description": "Create wireframes for the product page",
  "status": "TO_DO",
  "dueDate": "2026-05-15",
  "priority": "HIGH",
  "category": "Work",
  "subTasks": [
    { "title": "Research competitors", "completed": false },
    { "title": "Create mobile layout", "completed": false }
  ]
}
```

**Task Summary Response:**

```json
{
  "total": 8,
  "todo": 4,
  "inProgress": 2,
  "completed": 2
}
```

### Error Responses

All errors return structured JSON:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Title is required",
  "fieldErrors": {
    "title": "Title is required"
  }
}
```

| Status Code | Meaning |
|---|---|
| 400 | Validation error (missing/invalid fields) |
| 401 | Unauthorized (invalid or missing JWT) |
| 403 | Forbidden (accessing another user's task) |
| 404 | Task not found |
| 409 | Duplicate email on registration |

---

## 🛡️ Error Handling

The application implements comprehensive error handling at every layer:

### Backend
- **`GlobalExceptionHandler`** — catches all exceptions and returns structured JSON responses
- **`@Valid` annotations** — validates request DTOs with field-level error messages
- **`JwtAuthenticationFilter`** — returns 401 for invalid/expired tokens
- **Task ownership validation** — returns 403 if a user tries to access another user's task

### Frontend
- **Try-catch blocks** — all API calls wrapped with error handling
- **Toast notifications** — user-friendly error/success messages
- **Loading states** — spinners shown during API calls
- **Optimistic updates** — subtask toggles update UI instantly, revert on failure
- **Auth guard** — middleware redirects unauthenticated users to login

---

## 🛡️ Proper Error Handling

The application implements a robust, multi-layer error handling strategy:

### 1. Backend Validation & Exception Handling
- **Structured Error Responses**: All errors return a consistent JSON format with status codes, error types, and descriptive messages.
- **Global Exception Handler**: A `@ControllerAdvice` handles everything from `ResourceNotFound` (404) to `DataIntegrityViolation` (409).
- **Request Validation**: Uses JSR-303 Bean Validation (`@Valid`, `@NotBlank`, etc.) on DTOs to catch invalid data before it reaches the service layer.
- **Security Exceptions**: JWT errors are caught and return structured 401/403 responses instead of generic server errors.

### 2. Frontend Resilience
- **Centralized API Wrapper**: A core request utility catches non-OK responses and normalizes them into meaningful JS Errors.
- **Toast Notifications**: Interactive UI feedback using a custom toast system for both success and error states.
- **Form Validation**: Real-time client-side validation prevents submitting empty titles or invalid dates.
- **Auth Guard**: Middleware ensures users are redirected to login if their token expires or is invalid.

---

## 📁 Project Structure

```
organia-fullstack-task/
├── backend/
│   ├── src/main/java/com/organia/taskmanager/
│   │   ├── config/          # Security, JWT, CORS configuration
│   │   ├── controller/      # REST API controllers
│   │   ├── dto/             # Request/Response DTOs
│   │   ├── exception/       # Global exception handler
│   │   ├── model/           # JPA entities (Task, User, SubTask)
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── security/        # JWT filter, service, auth entry point
│   │   └── service/         # Business logic layer
│   └── src/main/resources/
│       └── application.yml
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # UI components (TaskCard, CalendarView, etc.)
│   │   ├── context/         # Auth context provider
│   │   └── services/        # API service layer
│   └── .env.local
│
└── README.md
```

---

## 👩‍💻 Author

**Maryam Wimaleswaran**
- GitHub: [@marzi3](https://github.com/marzi3)

---

## 📄 License

This project is open-source and available under the MIT License.
