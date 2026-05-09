# 🗂️ Organia Task Manager

> A full-stack Task Management Web Application built for the **Organia Innovations Labs Full Stack Developer Internship Assessment**.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green?logo=spring)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8?logo=tailwindcss)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

---

## 📋 Project Overview

Organia Task Manager is a modern, full-stack task management application that enables users to create, organize, and track tasks through an intuitive dashboard interface. The application features secure JWT authentication, RESTful APIs, responsive UI, and complete CRUD operations — all built with production-ready architecture.

---

## ✨ Features

### Core Features
- ✅ **User Authentication** — Register, Login, Logout with JWT tokens
- ✅ **Task CRUD** — Create, Read, Update, Delete tasks
- ✅ **Task Status Workflow** — To Do → In Progress → Completed
- ✅ **User Isolation** — Each user can only access their own tasks
- ✅ **Dashboard Analytics** — Real-time summary cards with task counts

### Bonus Features
- 🔍 **Search** — Search tasks by title
- 🏷️ **Filter** — Filter tasks by status
- 📄 **Pagination** — Paginated API endpoint
- 🎨 **Modern UI** — Glassmorphism, micro-animations, gradient accents
- 🐳 **Docker Support** — Complete Docker Compose setup
- 📱 **Responsive Design** — Mobile-first, works on all devices
- 🔐 **Role-based Access** — USER and ADMIN roles
- ✨ **Smooth Animations** — Framer Motion transitions throughout

---

## 🛠️ Technology Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| **Frontend**    | Next.js 15 (App Router), React 19     |
| **Styling**     | Tailwind CSS 4, Framer Motion          |
| **Backend**     | Spring Boot 3.2, Java 17              |
| **Database**    | PostgreSQL 16                          |
| **Auth**        | JWT (jjwt 0.12.5), BCrypt             |
| **ORM**         | Spring Data JPA / Hibernate           |
| **Containerization** | Docker, Docker Compose            |

---

## 📂 Folder Structure

```
organia-fullstack-task-maryam/
├── backend/                          # Spring Boot Backend
│   ├── src/main/java/com/organia/taskmanager/
│   │   ├── config/                   # Security & app config
│   │   ├── controller/               # REST controllers
│   │   ├── dto/                      # Request/Response DTOs
│   │   ├── exception/                # Global exception handling
│   │   ├── model/                    # JPA entities & enums
│   │   ├── repository/               # Spring Data JPA repos
│   │   ├── security/                 # JWT service & filter
│   │   └── service/                  # Business logic
│   ├── src/main/resources/
│   │   └── application.yml           # Configuration
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                         # Next.js Frontend
│   ├── src/
│   │   ├── app/                      # App Router pages
│   │   │   ├── dashboard/page.jsx
│   │   │   ├── login/page.jsx
│   │   │   ├── register/page.jsx
│   │   │   ├── layout.jsx
│   │   │   ├── page.jsx
│   │   │   └── globals.css
│   │   ├── components/               # Reusable UI components
│   │   ├── context/                  # React Context (Auth)
│   │   ├── services/                 # API service layer
│   │   ├── utils/                    # Auth utilities
│   │   └── middleware.js             # Route protection
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🚀 Setup & Run Instructions

### Prerequisites
- **Java 17+** (for backend)
- **Node.js 18+** (for frontend)
- **PostgreSQL 14+** (for database)
- **Docker** (optional, for containerized setup)

---

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/organia-fullstack-task-maryam.git
cd organia-fullstack-task-maryam

# Start all services
docker compose up --build
```

Access:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

---

### Option 2: Manual Setup

#### Database Setup

```sql
-- Create the database
CREATE DATABASE organia_tasks;
```

#### Backend Setup

```bash
cd backend

# Set environment variables (copy .env.example to .env and modify)
cp .env.example .env

# Run with Maven wrapper
chmod +x mvnw
./mvnw spring-boot:run
```

Backend will start at **http://localhost:8080**

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local to set NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Run development server
npm run dev
```

Frontend will start at **http://localhost:3000**

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default |
|---|---|---|
| `SPRING_DATASOURCE_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/organia_tasks` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `postgres` |
| `JWT_SECRET` | Secret key for JWT signing | (auto-generated) |
| `PORT` | Server port | `8080` |

### Frontend (`frontend/.env.local`)
| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:8080` |

---

## 📡 API Documentation

### Authentication Endpoints

#### `POST /auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "id": 1,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "USER"
}
```

---

#### `POST /auth/login`
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "id": 1,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "USER"
}
```

---

### Task Endpoints (🔒 Requires Authentication)

All task endpoints require the `Authorization: Bearer <token>` header.

#### `GET /tasks`
Get all tasks for the authenticated user.

**Query Parameters (optional):**
- `status` — Filter by status (`TO_DO`, `IN_PROGRESS`, `COMPLETED`)
- `search` — Search tasks by title keyword

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Complete project",
    "description": "Finish the full-stack assessment",
    "status": "IN_PROGRESS",
    "dueDate": "2024-12-31",
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-01T10:00:00"
  }
]
```

---

#### `POST /tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "TO_DO",
  "dueDate": "2024-12-31"
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "title": "New Task",
  "description": "Task description",
  "status": "TO_DO",
  "dueDate": "2024-12-31",
  "createdAt": "2024-01-01T10:00:00",
  "updatedAt": "2024-01-01T10:00:00"
}
```

---

#### `PUT /tasks/{id}`
Update an existing task.

**Request Body:**
```json
{
  "title": "Updated Task",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "dueDate": "2025-01-15"
}
```

**Response (200 OK):** Updated task object.

---

#### `PATCH /tasks/{id}/status`
Update only the status of a task.

**Request Body:**
```json
{
  "status": "COMPLETED"
}
```

**Response (200 OK):** Updated task object.

---

#### `DELETE /tasks/{id}`
Delete a task.

**Response (200 OK):**
```json
{
  "message": "Task deleted successfully"
}
```

---

#### `GET /tasks/summary`
Get dashboard summary statistics.

**Response (200 OK):**
```json
{
  "total": 10,
  "todo": 3,
  "inProgress": 4,
  "completed": 3
}
```

---

## 🔒 Authentication Flow

1. User registers or logs in via `/auth/register` or `/auth/login`
2. Backend validates credentials and returns a **JWT token**
3. Frontend stores the token in `localStorage`
4. All subsequent API requests include `Authorization: Bearer <token>` header
5. Backend's `JwtAuthenticationFilter` validates the token on every request
6. Tasks are scoped to the authenticated user — no cross-user access

---

## 🎯 Demo Credentials

After setting up the app, register a new account or use:

| Field | Value |
|---|---|
| **Name** | Demo User |
| **Email** | demo@organia.com |
| **Password** | demo123456 |

---

## 🌐 Deployment

### Live URLs
| Service | URL |
|---|---|
| **Frontend** | *Deploy to Vercel — add URL here* |
| **Backend** | *Deploy to Render/Railway — add URL here* |
| **Database** | *Use Neon/Supabase PostgreSQL — add connection string* |

### Deployment Steps

#### Frontend → Vercel
1. Push code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variable: `NEXT_PUBLIC_API_BASE_URL` = your backend URL
5. Deploy

#### Backend → Render
1. Create a new Web Service on [Render](https://render.com)
2. Set root directory to `backend`
3. Build command: `./mvnw clean package -DskipTests`
4. Start command: `java -jar target/*.jar`
5. Add environment variables (database URL, JWT secret, etc.)
6. Deploy

#### Database → Neon
1. Create a new database on [Neon](https://neon.tech)
2. Copy the connection string
3. Set `SPRING_DATASOURCE_URL` on Render to the Neon connection string

---

## 📸 Screenshots

> *Add screenshots of the application here*

| Landing Page | Dashboard |
|---|---|
| ![Landing Page](screenshots/landing.png) | ![Dashboard](screenshots/dashboard.png) |

| Login | Register |
|---|---|
| ![Login](screenshots/login.png) | ![Register](screenshots/register.png) |

---

## 🔮 Future Improvements

- [ ] Dark mode toggle
- [ ] Task due date reminders / notifications
- [ ] Task priority levels (Low, Medium, High)
- [ ] Task categories / tags
- [ ] Drag-and-drop Kanban board view
- [ ] Admin dashboard with user management
- [ ] Email verification on registration
- [ ] Password reset functionality
- [ ] Export tasks to CSV/PDF
- [ ] Real-time updates with WebSockets

---

## 📄 License

This project is built for the Organia Innovations Labs Internship Assessment.

---

**Built with ❤️ by Maryam Wimaleswaran**
