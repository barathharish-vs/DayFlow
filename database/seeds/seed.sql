-- DayFlow Seed Data for Development and Testing
-- Password for all seed users is: Password123!
-- BCrypt hash of "Password123!" ($2a$10$wT0lQf/PjFf39U5h4/9HdeJmYy2v4zD1iW6/3.z8yXz1q7m.qgOfe or standard format)

-- 1. Insert Demo User Alex Morgan
INSERT INTO users (id, email, password_hash, name, avatar_url, created_at, updated_at)
VALUES (
    1,
    'alex@dayflow.io',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiMhW2I4vW/g1vL9gGf89eFkP0J5BvS',
    'Alex Morgan',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. User Settings for Demo User
INSERT INTO user_settings (id, user_id, daily_water_goal, water_reminder_frequency, notifications_enabled, theme, timezone, created_at, updated_at)
VALUES (
    1,
    1,
    2500,
    60,
    TRUE,
    'light',
    'UTC',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON DUPLICATE KEY UPDATE daily_water_goal=VALUES(daily_water_goal);

-- 3. Sample Tasks for Alex
INSERT INTO tasks (id, user_id, title, description, category, priority, due_date, due_time, completed, reminder, created_at, updated_at)
VALUES 
    (1, 1, 'Design System Review', 'Review DayFlow color palette, typography and responsive layout components.', 'Design', 'high', CURRENT_DATE, '10:00 AM', FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 1, 'Full-Stack Integration Testing', 'Verify JWT authentication, task completion, and hydration tracking end-to-end.', 'Engineering', 'high', CURRENT_DATE, '02:30 PM', FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 1, 'Morning Hydration Baseline', 'Drink 500ml water upon waking to kickstart metabolism and daily streak.', 'Personal', 'medium', CURRENT_DATE, '08:00 AM', TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (4, 1, 'Prepare Sprint Demo', 'Record walkthrough of weekly report charts and quick hydration logging.', 'Work', 'medium', CURRENT_DATE, '04:00 PM', FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 4. Sample Water Logs for Alex
INSERT INTO water_logs (id, user_id, amount_ml, container_type, logged_at, created_at)
VALUES 
    (1, 1, 250, 'glass', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 1, 500, 'bottle', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 1, 350, 'mug', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE amount_ml=VALUES(amount_ml);
