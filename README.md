# DayFlow – Daily Workflow, Hydration & Task Orchestration Platform

<div align="center">
  <h3>Professional Full-Stack Productivity and Wellness Ecosystem</h3>
  <p>Unifying daily task management and hydration tracking into a singular, responsive application.</p>
</div>

---

## 1. Project Overview

**DayFlow** is a modern, production-grade full-stack productivity web application designed to help users harmonize their task scheduling and hydration wellness. Built with a clean 3-tier architecture, DayFlow features:

- **Unified Dashboard**: Live metrics, time-adaptive greeting, hydration progress wheel, urgent focus tasks, and 7-day intake charts.
- **Task Management**: Prioritized, category-tagged scheduling with status toggles, overdue indicators, and reminders.
- **Hydration Tracker**: Quick-logging containers (glass, bottle, mug), customized volume logging, progress tracking, and daily hydration summaries.
- **Analytics & Weekly Reports**: Detailed 7-day reports for task completion rates, workload distribution, and hydration goals vs actual intake.
- **Secure Authentication & Profile Settings**: Stateless JWT authentication, password resets, customizable water targets, reminder intervals, and theme toggling.
- **PWA & Offline Resilience**: Installable progressive web application with automatic offline status detection and local cache handling.

---

## 2. Technology Stack

### Frontend Layer (`01-frontend/`)
- **Framework**: React 19 + TypeScript (strict mode)
- **Tooling**: Vite 6, ESLint 9
- **Design & Icons**: Google Material Symbols, responsive CSS layout architecture (Desktop, Tablet, Mobile)
- **State & Storage**: React Context (`AppContext`), JWT local token storage, PWA Service Worker

### Backend Layer (`backend/`)
- **Framework**: Spring Boot 3.4.4, Java 17
- **Security**: Spring Security 6, JJWT (io.jsonwebtoken 0.12.6), BCrypt hashing
- **Data Persistence**: Spring Data JPA, Hibernate, MySQL Connector/J
- **Migrations**: Flyway version-controlled migrations
- **Validation**: Jakarta Validation API (Bean Validation / Hibernate Validator)

### Database Layer (`database/`)
- **Engine**: MySQL 8.0+ / Relational Relational Database Schema
- **Design**: Normalized tables with foreign key cascades, unique constraints, and composite indexes (`user_id`, `due_date`, `logged_at`).

---

## 3. Project Architecture

```
DayFlow/
│
├── 01-frontend/                     # React 19 + TypeScript + Vite Client
│   ├── public/                   # PWA Manifest, service worker, icons
│   ├── src/
│   │   ├── components/           # Dashboard, Tasks, WaterTracker, Reports, Auth
│   │   ├── context/              # AppContext global state manager
│   │   ├── services/             # API client with token injection & error mapping
│   │   ├── types.ts              # Strongly typed domain models
│   │   ├── App.tsx               # Primary screen router and shell
│   │   └── main.tsx              # Application mount point
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
│
├── backend/                      # Spring Boot 3 Java Backend
│   ├── src/main/java/com/dayflow/
│   │   ├── controller/           # REST endpoints (Auth, Tasks, Water, Settings)
│   │   ├── service/              # Business logic & weekly aggregations
│   │   ├── entity/               # JPA entities (User, Task, WaterLog, Settings)
│   │   ├── repository/           # Spring Data JPA repositories
│   │   ├── dto/                  # Data Transfer Objects & validation rules
│   │   └── security/             # JWT filter, UserDetailsService & WebSecurity
│   ├── src/main/resources/
│   │   ├── db/migration/         # Versioned Flyway SQL migrations (V1, V2)
│   │   └── application.properties # Server port, DB datasource, JWT settings
│   ├── pom.xml
│   └── .env.example
│
├── database/                     # Database Artifacts & Scripts
│   ├── migrations/               # Baseline and incremental Flyway migration scripts
│   ├── schema/                   # Consolidated DDL schema definition
│   ├── seeds/                    # Development seed data for instant testing
│   └── README.md                 # Entity relationship diagram & DB guide
│
├── docs/                         # Technical Architecture & API Documentation
│   ├── architecture.md           # End-to-end architecture & layers
│   ├── api-documentation.md      # Complete REST API reference
│   └── database-design.md        # Relational schema & performance indexes
│
├── .gitignore
└── README.md
```

---

## 4. Setup & Running the Application

### Prerequisites
- **Node.js**: v18+ (v22 LTS recommended) and npm
- **Java**: JDK 17+
- **Maven**: 3.8+ (or Maven Wrapper)
- **MySQL**: 8.0+

### Database Configuration
1. Create a MySQL database for DayFlow:
   ```sql
   CREATE DATABASE dayflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. (Optional) Run seed data:
   ```bash
   mysql -u root -p dayflow_db < database/seeds/seed.sql
   ```
   *Note: Flyway will automatically apply migrations `V1` and `V2` when the backend boots.*

### Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Configure credentials in `src/main/resources/application.properties` or via environment variables:
   ```bash
   export DB_USERNAME=root
   export DB_PASSWORD=your_password
   export JWT_SECRET=DayFlowSecretKeyForJwtAuthenticationMustBeAtLeast256BitsLong2026!
   ```
3. Build and launch:
   ```bash
   mvn spring-boot:run
   ```
   *The backend will boot on `http://localhost:8080`.*

### Frontend Setup
1. Navigate to the `01-frontend/` directory:
   ```bash
   cd 01-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
   *The client will start on `http://localhost:5173`.*

---

## 5. Demo Credentials
If using the development seed data:
- **Email**: `alex@dayflow.io`
- **Password**: `Password123!`

---

## 6. Testing & Quality Verification

- **Frontend Typecheck & Production Build**:
  ```bash
  cd 01-frontend
  npm run build
  ```
- **Frontend Code Quality & Linting**:
  ```bash
  npm run lint
  ```
- **Backend Unit & Regression Testing**:
  ```bash
  cd backend
  mvn test
  ```
