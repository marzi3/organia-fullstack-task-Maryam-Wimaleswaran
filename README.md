# 🗂️ Organia Task Manager

> A high-performance, full-stack Task Management Web Application.


---

## 📋 Project Overview

Organia Task Manager is a modern, production-ready task management application that enables users to create, organize, and track tasks through an intuitive dashboard. It features secure authentication, real-time search, priority management, multiple views (List, Calendar, Kanban Board, Insights, Admin Panel), and full CRUD operations.

---


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
- Backend Runtime Environment
- Frontend Runtime Environment
- Database Server

### 1. Clone the Repository

```bash
git clone https://github.com/marzi3/organia-fullstack-task-Maryam-Wimaleswaran.git
cd organia-fullstack-task-Maryam-Wimaleswaran
```

### 2. Database Setup

```bash
# Open your database terminal
CREATE DATABASE organia_tasks;
```

### 3. Backend Setup

```bash
cd backend
```

Configure `src/main/resources/application.yml`:

```yaml
configuration:
  database:
    url: protocol://localhost:port/organia_tasks
    username: db_user
    password: your_password
```

Run:

```bash
chmod +x mvnw
./mvnw start
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
| **Frontend** | *Add your Vercel or Netlify URL here* |
| **Backend** | *Add your Render URL here* |

---

## ☁️ Deployment Guide

### Frontend (Vercel)
1. Import repository to Vercel.
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable `NEXT_PUBLIC_API_BASE_URL` pointing to your Render backend.
4. Deploy!

### Backend (Render)
1. Create a New Web Service.
2. Build Command: `./mvnw clean package -DskipTests`
3. Start Command: `java -jar target/*.jar`
4. Add Database Environment Variables.
---

## 🎯 Demo Credentials

| Field | Value |
|---|---|
| **Admin Email** | `admin@organia.com` |
| **Password** | `Admin@123` |

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
  "name": "Admin User",
  "email": "admin@organia.com",
  "password": "Admin@123"
}
```

**Login Request:**

```json
{
  "email": "admin@organia.com",
  "password": "Admin@123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBvcmdhbmlhLmNvbSIsImlhdCI6MTcxNTQ1NjAwMCwiZXhwIjoxNzE1NTQyNDAwfQ.example_signature_Hk9z2X...",
  "id": 1,
  "name": "Admin User",
  "email": "admin@organia.com",
  "role": "ADMIN"
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
│   │   ├── config/          # Security and global configuration
│   │   ├── controller/      # API controllers
│   │   ├── dto/             # Data objects
│   │   ├── exception/       # Error handling
│   │   ├── model/           # Data models
│   │   ├── repository/      # Data access layer
│   │   ├── security/        # Auth security
│   │   └── service/         # Logic layer
│   └── src/main/resources/
│       └── application.yml
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Application pages
│   │   ├── components/      # UI components
│   │   ├── context/         # Auth context
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
