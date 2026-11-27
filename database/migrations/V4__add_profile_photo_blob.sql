-- V4__add_profile_photo_blob.sql
-- Add profile photo binary storage and content type to users table

ALTER TABLE users
    ADD COLUMN profile_photo_data MEDIUMBLOB NULL AFTER avatar_url,
    ADD COLUMN profile_photo_content_type VARCHAR(50) NULL AFTER profile_photo_data;
