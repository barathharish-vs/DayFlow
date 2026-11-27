# DayFlow Database Documentation

DayFlow uses a normalized relational schema designed for MySQL 8+ and compatible relational database management systems.

## Schema Architecture

```
+-----------------------------------------------------------------+
| users                                                           |
|-----------------------------------------------------------------|
| id (BIGINT, PK, AUTO_INCREMENT)                                |
| email (VARCHAR(255), UNIQUE, NOT NULL)                          |
| password_hash (VARCHAR(255), NOT NULL)                          |
| name (VARCHAR(100), NOT NULL)                                   |
| avatar_url (VARCHAR(500), NULL)                                 |
| created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)               |
| updated_at (TIMESTAMP, ON UPDATE CURRENT_TIMESTAMP)             |
+-----------------------------------------------------------------+
       | 1                           | 1                   | 1
       |                             |                     |
       v 1                           v *                   v *
+----------------------+     +------------------+    +-----------------------+
| user_settings        |     | tasks            |    | water_logs            |
|----------------------|     |------------------|    |-----------------------|
| id (PK)              |     | id (PK)          |    | id (PK)               |
| user_id (FK -> users)|     | user_id (FK)     |    | user_id (FK)          |
| daily_water_goal(INT)|     | title            |    | amount_ml (INT)       |
| water_reminder_freq  |     | description      |    | container_type        |
| notifications_enabled|     | category         |    | logged_at (TIMESTAMP) |
| theme ('light'/'dark')     | priority         |    +-----------------------+
| timezone             |     | due_date (DATE)  |
+----------------------+     | due_time         |
                             | completed (BOOL) |
                             | completed_at     |
                             | reminder (BOOL)  |
                             +------------------+
                                      | 1
                                      v *
                             +------------------------+
                             | password_reset_tokens  |
                             |------------------------|
                             | id (PK)                |
                             | user_id (FK -> users)  |
                             | token_hash             |
                             | expires_at             |
                             | used (BOOLEAN)         |
                             +------------------------+
```

## Running Migrations
Flyway migrations are automated in the backend service upon startup located in `src/main/resources/db/migration` and cataloged in `database/migrations/`:
- `V1__initial_schema.sql`: Establishes users, user_settings, tasks, and water_logs.
- `V2__add_completed_at_and_password_resets.sql`: Adds task completion timestamps and tokenized password reset table.

## Seeding Sample Data
Execute `database/seeds/seed.sql` in your MySQL database client or terminal:
```bash
mysql -u root -p dayflow_db < database/seeds/seed.sql
```
