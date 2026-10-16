
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
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            UserSettingsRepository userSettingsRepository,
            PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.userSettingsRepository = userSettingsRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
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
        dto.setAvatarUrl(user.getAvatarUrl());

        if (settings != null) {
            dto.setDailyWaterGoal(settings.getDailyWaterGoal());
            dto.setNotificationsEnabled(settings.getNotificationsEnabled());
            dto.setWaterReminderFrequency(
                    settings.getWaterReminderFrequency()
            );
            dto.setTheme(settings.getTheme());
            dto.setTimezone(settings.getTimezone());
        }

        return dto;
    }
}
