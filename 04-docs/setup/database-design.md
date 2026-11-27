# DayFlow Database Design

## Relational Entity-Relationship Model

```
+--------------------------------------------------------------+
| USERS                                                        |
+-------------------+--------------------+---------------------+
| Column            | Type               | Constraints         |
+-------------------+--------------------+---------------------+
| id                | BIGINT             | PK, AUTO_INCREMENT  |
| email             | VARCHAR(255)       | NOT NULL, UNIQUE    |
| password_hash     | VARCHAR(255)       | NOT NULL            |
| name              | VARCHAR(100)       | NOT NULL            |
| avatar_url        | VARCHAR(500)       | NULL                |
| created_at        | TIMESTAMP          | DEFAULT CURRENT_TIME|
| updated_at        | TIMESTAMP          | ON UPDATE CURRENT   |
+-------------------+--------------------+---------------------+

+--------------------------------------------------------------+
| USER_SETTINGS                                                |
+-------------------+--------------------+---------------------+
| Column            | Type               | Constraints         |
+-------------------+--------------------+---------------------+
| id                | BIGINT             | PK, AUTO_INCREMENT  |
| user_id           | BIGINT             | FK -> users(id) ON DEL CASCADE, UNIQUE |
| daily_water_goal  | INT                | NOT NULL, DEFAULT 2500|
| reminder_frequency| INT                | NOT NULL, DEFAULT 60|
| notifications_on  | BOOLEAN            | NOT NULL, DEFAULT 1 |
| theme             | VARCHAR(20)        | DEFAULT 'light'     |
| timezone          | VARCHAR(50)        | DEFAULT 'UTC'       |
| created_at        | TIMESTAMP          | DEFAULT CURRENT_TIME|
| updated_at        | TIMESTAMP          | ON UPDATE CURRENT   |
+-------------------+--------------------+---------------------+

+--------------------------------------------------------------+
| TASKS                                                        |
+-------------------+--------------------+---------------------+
| Column            | Type               | Constraints         |
+-------------------+--------------------+---------------------+
| id                | BIGINT             | PK, AUTO_INCREMENT  |
| user_id           | BIGINT             | FK -> users(id) ON DEL CASCADE, INDEX |
| title             | VARCHAR(255)       | NOT NULL            |
| description       | TEXT               | NULL                |
| category          | VARCHAR(50)        | NOT NULL, DEFAULT 'Work' |
| priority          | VARCHAR(20)        | NOT NULL, DEFAULT 'medium' |
| due_date          | DATE               | NOT NULL, INDEX     |
| due_time          | VARCHAR(10)        | NULL                |
| completed         | BOOLEAN            | DEFAULT FALSE       |
| completed_at      | TIMESTAMP          | NULL                |
| reminder          | BOOLEAN            | DEFAULT FALSE       |
| created_at        | TIMESTAMP          | DEFAULT CURRENT_TIME|
| updated_at        | TIMESTAMP          | ON UPDATE CURRENT   |
+-------------------+--------------------+---------------------+

+--------------------------------------------------------------+
| WATER_LOGS                                                   |
+-------------------+--------------------+---------------------+
| Column            | Type               | Constraints         |
+-------------------+--------------------+---------------------+
| id                | BIGINT             | PK, AUTO_INCREMENT  |
| user_id           | BIGINT             | FK -> users(id) ON DEL CASCADE, INDEX |
| amount_ml         | INT                | NOT NULL            |
| container_type    | VARCHAR(50)        | DEFAULT 'glass'     |
| logged_at         | TIMESTAMP          | DEFAULT CURRENT_TIME, INDEX |
| created_at        | TIMESTAMP          | DEFAULT CURRENT_TIME|
+-------------------+--------------------+---------------------+
```

## Performance & Indexing Strategy
1. `users(email)`: Unique B-tree index for rapid O(1) user lookups during login.
2. `tasks(user_id, due_date)`: Composite index optimizing user dashboard task filtering.
3. `water_logs(user_id, logged_at)`: Composite index for range queries generating weekly and daily hydration analytics.
4. `password_reset_tokens(token_hash)`: Unique index ensuring quick verification of reset tokens.
