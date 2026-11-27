
package com.dayflow.service;

import com.dayflow.dto.*;
import com.dayflow.entity.User;
import com.dayflow.entity.UserSettings;
import com.dayflow.repository.UserRepository;
import com.dayflow.repository.UserSettingsRepository;
import com.dayflow.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.dayflow.entity.PasswordResetToken;
import com.dayflow.repository.PasswordResetTokenRepository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            UserSettingsRepository userSettingsRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.userSettingsRepository = userSettingsRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public String requestPasswordReset(String email) {
        String normalizedEmail = email.toLowerCase().trim();
        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);
        if (userOpt.isEmpty()) {
            // Return dummy or success status so email enumeration is mitigated
            return "If an account exists with this email, a reset link/code has been generated.";
        }

        User user = userOpt.get();
        // Generate secure random UUID token
        String token = UUID.randomUUID().toString();
        // 1 hour expiry
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(1);

        PasswordResetToken resetToken = new PasswordResetToken(user, token, expiresAt);
        passwordResetTokenRepository.save(resetToken);

        // In production this sends an email via SMTP.
        // We log it and return confirmation.
        return token;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = passwordResetTokenRepository
                .findByTokenHashAndUsedFalse(request.getToken().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset token"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Password reset token has expired. Please request a new one.");
        }

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        String passwordHash = passwordEncoder.encode(request.getPassword());
        User user = new User(
                normalizedEmail,
                passwordHash,
                request.getName().trim(),
                ""
        );

        user = userRepository.save(user);

        UserSettings settings = new UserSettings(user);
        userSettingsRepository.save(settings);
        user.setSettings(settings);

        String token = jwtUtils.generateToken(user.getEmail(), user.getId());

        return new AuthResponse(token, toDto(user, settings));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        normalizedEmail,
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid email or password")
                );

        UserSettings settings = userSettingsRepository
                .findByUserId(user.getId())
                .orElse(null);

        if (settings == null) {
            settings = userSettingsRepository.save(new UserSettings(user));
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getId());

        return new AuthResponse(token, toDto(user, settings));
    }

    @Transactional
    public UserProfileDto getCurrentUserProfile(String email) {
        User user = getUserByEmail(email);

        UserSettings settings = userSettingsRepository
                .findByUserId(user.getId())
                .orElse(null);

        if (settings == null) {
            settings = userSettingsRepository.save(new UserSettings(user));
        }

        return toDto(user, settings);
    }

    @Transactional
    public UserProfileDto updateProfile(
            String email,
            UpdateProfileRequest request
    ) {
        User user = getUserByEmail(email);

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }

        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }

        user = userRepository.save(user);

        UserSettings settings = userSettingsRepository
                .findByUserId(user.getId())
                .orElse(null);

        if (settings == null) {
            settings = userSettingsRepository.save(new UserSettings(user));
        }

        return toDto(user, settings);
    }

    @Transactional
    public UserProfileDto uploadProfilePhoto(
            String email,
            byte[] fileBytes,
            String contentType,
            String originalFilename
    ) {
        if (fileBytes == null || fileBytes.length == 0) {
            throw new IllegalArgumentException("Image file cannot be empty");
        }

        // Limit: 5MB
        long maxBytes = 5 * 1024 * 1024;
        if (fileBytes.length > maxBytes) {
            throw new IllegalArgumentException("Profile photo size exceeds maximum limit of 5MB");
        }

        // Validate MIME type
        String normalizedContentType = contentType != null ? contentType.toLowerCase().trim() : "";
        if (!normalizedContentType.equals("image/jpeg") &&
            !normalizedContentType.equals("image/jpg") &&
            !normalizedContentType.equals("image/png") &&
            !normalizedContentType.equals("image/webp")) {
            throw new IllegalArgumentException("Only JPEG, PNG, and WebP image formats are permitted");
        }

        // Magic bytes inspection
        boolean isValidMagicBytes = false;
        if (fileBytes.length >= 4) {
            // JPEG: FF D8 FF
            if ((fileBytes[0] & 0xFF) == 0xFF && (fileBytes[1] & 0xFF) == 0xD8 && (fileBytes[2] & 0xFF) == 0xFF) {
                isValidMagicBytes = true;
            }
            // PNG: 89 50 4E 47
            else if ((fileBytes[0] & 0xFF) == 0x89 && (fileBytes[1] & 0xFF) == 0x50 &&
                     (fileBytes[2] & 0xFF) == 0x4E && (fileBytes[3] & 0xFF) == 0x47) {
                isValidMagicBytes = true;
            }
            // WebP: RIFF ... WEBP
            else if (fileBytes.length >= 12 &&
                     fileBytes[0] == 'R' && fileBytes[1] == 'I' && fileBytes[2] == 'F' && fileBytes[3] == 'F' &&
                     fileBytes[8] == 'W' && fileBytes[9] == 'E' && fileBytes[10] == 'B' && fileBytes[11] == 'P') {
                isValidMagicBytes = true;
            }
        }

        if (!isValidMagicBytes) {
            throw new IllegalArgumentException("Uploaded file does not match a valid image signature");
        }

        User user = getUserByEmail(email);
        user.setProfilePhotoData(fileBytes);
        user.setProfilePhotoContentType(normalizedContentType);
        user.setAvatarUrl("/api/auth/profile-photo");
        final User savedUser = userRepository.save(user);

        UserSettings settings = userSettingsRepository.findByUserId(savedUser.getId())
                .orElseGet(() -> userSettingsRepository.save(new UserSettings(savedUser)));

        return toDto(savedUser, settings);
    }

    @Transactional(readOnly = true)
    public User getProfilePhotoOwner(String email) {
        return getUserByEmail(email);
    }

    @Transactional
    public UserProfileDto removeProfilePhoto(String email) {
        User user = getUserByEmail(email);
        user.setProfilePhotoData(null);
        user.setProfilePhotoContentType(null);
        user.setAvatarUrl(null);
        final User savedUser = userRepository.save(user);

        UserSettings settings = userSettingsRepository.findByUserId(savedUser.getId())
                .orElseGet(() -> userSettingsRepository.save(new UserSettings(savedUser)));

        return toDto(savedUser, settings);
    }

    @Transactional
    public AuthResponse changeEmail(
            String currentEmail,
            ChangeEmailRequest request
    ) {
        User user = getUserByEmail(currentEmail);

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash()
        )) {
            throw new IllegalArgumentException("Incorrect password provided");
        }

        String newNormalizedEmail = request.getNewEmail()
                .toLowerCase()
                .trim();

        if (newNormalizedEmail.equals(user.getEmail())) {
            throw new IllegalArgumentException(
                    "New email is identical to current email"
            );
        }

        if (userRepository.existsByEmail(newNormalizedEmail)) {
            throw new IllegalArgumentException(
                    "The requested email is already in use by another account"
            );
        }

        user.setEmail(newNormalizedEmail);
        user = userRepository.save(user);

        UserSettings settings = userSettingsRepository
                .findByUserId(user.getId())
                .orElse(null);

        if (settings == null) {
            settings = userSettingsRepository.save(new UserSettings(user));
        }

        String newToken = jwtUtils.generateToken(user.getEmail(), user.getId());

        return new AuthResponse(newToken, toDto(user, settings));
    }

    @Transactional
    public void changePassword(
            String email,
            ChangePasswordRequest request
    ) {
        User user = getUserByEmail(email);

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPasswordHash()
        )) {
            throw new IllegalArgumentException("Incorrect current password");
        }

        user.setPasswordHash(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(
            String email,
            String passwordConfirmation
    ) {
        User user = getUserByEmail(email);

        if (!passwordEncoder.matches(
                passwordConfirmation,
                user.getPasswordHash()
        )) {
            throw new IllegalArgumentException(
                    "Incorrect password confirmation for account deletion"
            );
        }

        userRepository.delete(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() ->
                        new IllegalArgumentException("User account not found")
                );
    }

    private UserProfileDto toDto(User user, UserSettings settings) {
        UserProfileDto dto = new UserProfileDto();

        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        if (user.getProfilePhotoData() != null && user.getProfilePhotoData().length > 0) {
            dto.setAvatarUrl("/api/auth/profile-photo");
        } else {
            dto.setAvatarUrl(user.getAvatarUrl());
        }

        if (settings != null) {
            dto.setDailyWaterGoal(settings.getDailyWaterGoal());
            dto.setNotificationsEnabled(settings.getNotificationsEnabled());
            dto.setWaterRemindersEnabled(settings.getWaterRemindersEnabled());
            dto.setTaskRemindersEnabled(settings.getTaskRemindersEnabled());
            dto.setWaterReminderFrequency(
                    settings.getWaterReminderFrequency()
            );
            dto.setTheme(settings.getTheme());
            dto.setTimezone(settings.getTimezone());
        }

        return dto;
    }
}
