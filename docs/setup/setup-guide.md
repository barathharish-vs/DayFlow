# DayFlow Setup & Installation Guide

This guide details setting up the DayFlow environment for local development and testing.

## Prerequisites
- **Node.js**: v18+ (v22 LTS recommended) and npm
- **Java**: JDK 17+
- **MySQL**: 8.0+
- **Git**

## 1. Database Setup
1. Start your local MySQL service.
2. Create the database:
   ```sql
   CREATE DATABASE dayflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Load seed data (optional):
   ```bash
   mysql -u root -p dayflow_db < database/seeds/seed.sql
   ```
   *Note: Flyway automatically applies all versioned migrations (`database/migrations/`) on backend startup.*

## 2. Backend Setup
1. Move to backend folder:
   ```bash
   cd backend
   ```
2. Configure credentials in `src/main/resources/application.properties` or environment variables:
   ```bash
   export DB_USERNAME=root
   export DB_PASSWORD=your_password
   ```
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```

## 3. Frontend Setup
1. Move to frontend folder:
   ```bash
   cd 01-frontend
   ```
2. Install dependencies and start Vite dev server:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173`.
