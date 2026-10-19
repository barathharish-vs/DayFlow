-- V2__add_completed_at_and_password_resets.sql
-- Add completed_at column to tasks table for historical completion tracking
ALTER TABLE tasks ADD COLUMN completed_at TIMESTAMP NULL AFTER completed;

-- Update existing completed tasks to have completed_at equal to updated_at for baseline consistency
UPDATE tasks SET completed_at = updated_at WHERE completed = TRUE AND completed_at IS NULL;

-- Create password_reset_tokens table for secure tokenized password reset
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reset_token_hash (token_hash),
    INDEX idx_reset_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
