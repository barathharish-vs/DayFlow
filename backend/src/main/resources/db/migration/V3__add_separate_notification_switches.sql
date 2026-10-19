-- V3__add_separate_notification_switches.sql
-- Add independent notification switches for water reminders and task reminders in user_settings

ALTER TABLE user_settings
    ADD COLUMN water_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE AFTER notifications_enabled,
    ADD COLUMN task_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE AFTER water_reminders_enabled;
