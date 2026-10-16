package com.dayflow.service;

import com.dayflow.dto.UpdateSettingsRequest;
import com.dayflow.dto.UserProfileDto;
import com.dayflow.entity.User;
import com.dayflow.entity.UserSettings;
import com.dayflow.repository.UserRepository;
import com.dayflow.repository.UserSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    private final UserSettingsRepository userSettingsRepository;
    private final UserRepository userRepository;

    public SettingsService(UserSettingsRepository userSettingsRepository, UserRepository userRepository) {
        this.userSettingsRepository = userSettingsRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileDto getSettings(String userEmail) {
        User user = getUserByEmail(userEmail);
        UserSettings settings = userSettingsRepository.findByUserId(user.getId())
                .orElseGet(() -> userSettingsRepository.save(new UserSettings(user)));
        return toDto(user, settings);
    }

    @Transactional
    public UserProfileDto updateSettings(String userEmail, UpdateSettingsRequest request) {
        User user = getUserByEmail(userEmail);
        UserSettings settings = userSettingsRepository.findByUserId(user.getId())
                .orElseGet(() -> new UserSettings(user));

        if (request.getDailyWaterGoal() != null) {
            settings.setDailyWaterGoal(request.getDailyWaterGoal());
        }
        if (request.getWaterReminderFrequency() != null) {
            settings.setWaterReminderFrequency(request.getWaterReminderFrequency());
        }
        if (request.getNotificationsEnabled() != null) {
            settings.setNotificationsEnabled(request.getNotificationsEnabled());
        }
        if (request.getTheme() != null) {
            settings.setTheme(request.getTheme());
        }
        if (request.getTimezone() != null) {
            settings.setTimezone(request.getTimezone());
        }

        settings.setUser(user);
        settings = userSettingsRepository.save(settings);

        return toDto(user, settings);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User account not found"));
    }

    private UserProfileDto toDto(User user, UserSettings settings) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setDailyWaterGoal(settings.getDailyWaterGoal());
        dto.setNotificationsEnabled(settings.getNotificationsEnabled());
        dto.setWaterReminderFrequency(settings.getWaterReminderFrequency());
        dto.setTheme(settings.getTheme());
        dto.setTimezone(settings.getTimezone());
        return dto;
    }
}
