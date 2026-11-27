# DayFlow System Architecture

## Overview
DayFlow is a high-performance productivity and wellness ecosystem designed to unify task management and hydration tracking into a single daily workflow.

```
       +---------------------------------------------+
       |             DayFlow Web Client              |
       |       React 19 + TypeScript + Vite          |
       |  (Responsive Design, PWA, State Management) |
       +----------------------+----------------------+
                              |
                     HTTPS / JSON REST
                        JWT Bearer
                              v
       +---------------------------------------------+
       |          DayFlow Backend Service            |
       |        Spring Boot 3.4.4 + Java 17          |
       |---------------------------------------------|
       |  Controllers  |  Services  | Security / JWT  |
       +----------------------+----------------------+
                              |
                          JDBC / JPA
                         (Hibernate)
                              v
       +---------------------------------------------+
       |             DayFlow Database                |
       |       MySQL 8+ / Relational Persistence     |
       |  (Flyway Versioned Migrations, Indexes, FK) |
       +---------------------------------------------+
```

## Layers & Components

### 1. Presentation Layer (`01-frontend/`)
- **Technology**: React 19, TypeScript 5.8, Vite 6.
- **State Management**: Centralized `AppContext` coordinating auth sessions, task mutations, hydration logging, and theme persistence.
- **Offline Resilience**: Service worker caching and offline status detection.

### 2. Application & API Layer (`02-backend/`)
- **Technology**: Spring Boot 3, Spring Security 6, JJWT 0.12.
- **REST Endpoints**:
  - `/api/auth`: Registration, authentication, password reset, profile management.
  - `/api/tasks`: Full task CRUD, status toggling, categories, priorities, weekly reporting.
  - `/api/water`: Water logging, container types, daily aggregation, weekly hydration history.
  - `/api/settings`: Hydration goals, reminder intervals, preferences.
  - `/api/health`: Health monitoring and uptime check.

### 3. Persistence Layer (`03-database/`)
- **Technology**: MySQL 8.0+ / Spring Data JPA.
- **Flyway Migrations**: Automated baseline and incremental schema versioning (`V1`, `V2`).
- **Integrity**: Foreign keys with cascading deletions, unique constraints on emails and tokens, and composite indexes for user querying.
