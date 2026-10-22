# Task Progress Board

A full-stack kanban-style task management app with a macOS-inspired glassmorphism UI. Organize work across multiple projects, track deadlines with smart overdue alerts, and move tasks through **To Do → In Progress → Done** — all backed by a persistent database.

## ✨ Features

- **Multi-project workspace** — create and switch between projects, each with its own independent board.
- **One-click task flow** — move tasks between columns without drag-and-drop libraries.
- **Deadline tracking & smart alerts** — pick a due date; badges automatically show *Overdue*, *Due Soon (24h)*, *On Track*, or *Done*, plus a top banner summarizing urgent items.
- **macOS-style glass UI** — ambient mesh gradient background, frosted-glass sidebar and cards, pill buttons, and a collapsible sidebar.
- **Persistent storage** — data survives page refreshes via a file-based H2 database.

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, native CSS (glassmorphism) |
| Backend | Spring Boot 4.1, Spring Web MVC, Spring Data JPA |
| Database | H2 (file-based) |

## 🏗 Architecture

The backend follows a classic three-tier architecture:

- **Entity layer** — `Project` and `Task` JPA entities, linked by a One-to-Many relationship (`@OneToMany` / `@ManyToOne`).
- **Repository layer** — interfaces extending `JpaRepository` (zero boilerplate SQL).
- **Controller layer** — REST endpoints that return JSON.

```
React (port 5173)  ──HTTP/JSON──▶  Spring Boot (port 8080)  ──JPA──▶  H2 database
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- JDK 17+ (project is built with Java 25)

### 1. Start the backend

```bash
cd backend
./mvnw spring-boot:run
# or: ./mvnw package && java -jar target/backend-0.0.1-SNAPSHOT.jar
```

The API starts at `http://localhost:8080`. On first run, sample projects and tasks are seeded automatically.

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

> 💡 The H2 console (to inspect the database) is available at `http://localhost:8080/h2-console`.
> JDBC URL: `jdbc:h2:file:./data/kanban`, user `sa`, empty password.

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create a project |
| DELETE | `/api/projects/{id}` | Delete a project (cascades to its tasks) |
| GET | `/api/tasks` | List tasks (optional `?projectId=` filter) |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task |

## 📁 Project Structure

```
kanban-fullstack/
├── backend/                        # Spring Boot REST API
│   └── src/main/java/com/example/backend/
│       ├── entity/                 # Project, Task (JPA entities)
│       ├── repository/             # Spring Data repositories
│       ├── controller/             # REST controllers + request DTOs
│       └── DataSeeder.java         # Seeds sample data on first run
└── frontend/                       # React + Vite app
    └── src/
        ├── App.jsx                 # Main component & API integration
        └── App.css                 # Glassmorphism styling
```
