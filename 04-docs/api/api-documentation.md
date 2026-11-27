# DayFlow API Documentation

Base URL: `http://localhost:8080/api`

All authenticated endpoints require an `Authorization: Bearer <JWT>` header.

---

## 1. Authentication & User Profile (`/auth`)

### POST `/auth/register`
Create a new user account.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "dailyWaterGoal": 2500,
      "theme": "light"
    }
  }
  ```

### POST `/auth/login`
Authenticate with email and password.
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Response** `200 OK`: Returns token and user profile object.

### GET `/auth/me`
Retrieve currently authenticated user profile. Requires Bearer Token.

### PUT `/auth/profile`
Update user display name or avatar URL.

### POST `/auth/forgot-password`
Request a password reset link/token.
- **Request Body**: `{"email": "jane@example.com"}`

### POST `/auth/reset-password`
Reset password using reset token.
- **Request Body**:
  ```json
  {
    "token": "reset-uuid-token",
    "newPassword": "NewSecurePassword123!"
  }
  ```

---

## 2. Task Management (`/tasks`)

### GET `/tasks`
Fetch tasks for the authenticated user.
- **Query Parameters**:
  - `completed` (optional, boolean): Filter by completed status.
  - `category` (optional, string): Filter by category (e.g., "Work", "Personal").
  - `priority` (optional, string): Filter by priority ("low", "medium", "high").
  - `dueDate` (optional, ISO date): Filter by date (e.g. `2026-11-27`).

### POST `/tasks`
Create a new task.
- **Request Body**:
  ```json
  {
    "title": "Submit Quarterly Report",
    "description": "Finalize metrics for Q3",
    "category": "Work",
    "priority": "high",
    "dueDate": "2026-11-28",
    "dueTime": "11:00 AM",
    "reminder": true
  }
  ```

### PUT `/tasks/{id}`
Update an existing task by ID.

### PATCH `/tasks/{id}/toggle`
Toggle task completion status (updates `completed` and records `completed_at`).

### DELETE `/tasks/{id}`
Permanently delete a task.

### GET `/tasks/weekly-report`
Retrieve 7-day task completion summary and category breakdown.

---

## 3. Hydration Tracker (`/water`)

### GET `/water/today`
Retrieve all water logs and aggregated total for today.

### POST `/water`
Log water intake.
- **Request Body**:
  ```json
  {
    "amount": 250,
    "containerType": "glass"
  }
  ```

### DELETE `/water/{id}`
Delete a specific water intake entry.

### DELETE `/water/today`
Reset today's water intake logs.

### GET `/water/weekly-report`
Retrieve 7-day hydration progress vs daily goal.

---

## 4. Settings (`/settings`)

### GET `/settings`
Fetch current user settings (dailyWaterGoal, theme, notifications, reminders).

### PUT `/settings`
Update user settings.
