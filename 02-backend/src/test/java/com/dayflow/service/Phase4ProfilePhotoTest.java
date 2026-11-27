package com.dayflow.service;

import com.dayflow.dto.UserProfileDto;
import com.dayflow.entity.User;
import com.dayflow.entity.UserSettings;
import com.dayflow.repository.PasswordResetTokenRepository;
import com.dayflow.repository.UserRepository;
import com.dayflow.repository.UserSettingsRepository;
import com.dayflow.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class Phase4ProfilePhotoTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserSettingsRepository userSettingsRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private UserSettings testSettings;

    @BeforeEach
    void setUp() {
        testUser = new User("test@dayflow.io", "hashedPass", "Test User", null);
        testUser.setId(10L);

        testSettings = new UserSettings(testUser);
        testSettings.setId(20L);
    }

    @Test
    @DisplayName("Upload valid PNG profile photo updates user photo and returns /api/auth/profile-photo")
    void uploadValidProfilePhotoSuccess() {
        when(userRepository.findByEmail("test@dayflow.io")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userSettingsRepository.findByUserId(10L)).thenReturn(Optional.of(testSettings));

        // Valid PNG header: 89 50 4E 47
        byte[] validPng = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};

        UserProfileDto result = authService.uploadProfilePhoto("test@dayflow.io", validPng, "image/png", "avatar.png");

        assertNotNull(result);
        assertEquals("/api/auth/profile-photo", result.getAvatarUrl());
        assertEquals("test@dayflow.io", result.getEmail());
        assertNotNull(testUser.getProfilePhotoData());
        assertEquals("image/png", testUser.getProfilePhotoContentType());
    }

    @Test
    @DisplayName("Upload profile photo exceeding 5MB rejects with IllegalArgumentException")
    void uploadProfilePhotoTooLargeFails() {
        byte[] largeBytes = new byte[6 * 1024 * 1024]; // 6MB

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.uploadProfilePhoto("test@dayflow.io", largeBytes, "image/jpeg", "huge.jpg")
        );
        assertTrue(ex.getMessage().contains("exceeds maximum limit"));
    }

    @Test
    @DisplayName("Upload file with invalid magic bytes fails validation")
    void uploadInvalidMagicBytesFails() {
        byte[] fakeJpg = new byte[]{0x00, 0x00, 0x00, 0x00}; // Not JPEG / PNG / WebP

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.uploadProfilePhoto("test@dayflow.io", fakeJpg, "image/jpeg", "fake.jpg")
        );
        assertTrue(ex.getMessage().contains("valid image signature"));
    }

    @Test
    @DisplayName("Remove profile photo clears photo data and avatarUrl")
    void removeProfilePhotoSuccess() {
        testUser.setProfilePhotoData(new byte[]{1, 2, 3});
        testUser.setProfilePhotoContentType("image/png");
        testUser.setAvatarUrl("/api/auth/profile-photo");

        when(userRepository.findByEmail("test@dayflow.io")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userSettingsRepository.findByUserId(10L)).thenReturn(Optional.of(testSettings));

        UserProfileDto result = authService.removeProfilePhoto("test@dayflow.io");

        assertNotNull(result);
        assertNull(result.getAvatarUrl());
        assertNull(testUser.getProfilePhotoData());
        assertNull(testUser.getProfilePhotoContentType());
    }
}
