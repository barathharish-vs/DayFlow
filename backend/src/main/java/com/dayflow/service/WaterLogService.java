package com.dayflow.service;

import com.dayflow.dto.DailyWaterSummaryDto;
import com.dayflow.dto.WaterLogDto;
import com.dayflow.entity.User;
import com.dayflow.entity.UserSettings;
import com.dayflow.entity.WaterLog;
import com.dayflow.repository.UserRepository;
import com.dayflow.repository.UserSettingsRepository;
import com.dayflow.repository.WaterLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WaterLogService {

    private final WaterLogRepository waterLogRepository;
    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

    public WaterLogService(
            WaterLogRepository waterLogRepository,
            UserRepository userRepository,
            UserSettingsRepository userSettingsRepository
    ) {
        this.waterLogRepository = waterLogRepository;
        this.userRepository = userRepository;
        this.userSettingsRepository = userSettingsRepository;
    }

    @Transactional(readOnly = true)
    public List<WaterLogDto> getWaterLogs(String userEmail) {
        User user = getUserByEmail(userEmail);
        return waterLogRepository.findByUserIdOrderByLoggedAtDesc(user.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public WaterLogDto addWaterLog(String userEmail, WaterLogDto dto) {
        User user = getUserByEmail(userEmail);

        WaterLog log = new WaterLog();
        log.setUser(user);
        log.setAmountMl(dto.getAmount());
        log.setContainerType(dto.getContainerType() != null ? dto.getContainerType() : "glass");
        log.setNotes(dto.getNotes());
        log.setLoggedAt(dto.getTimestamp() != null ? dto.getTimestamp() : LocalDateTime.now());

        log = waterLogRepository.save(log);
        return toDto(log);
    }

    @Transactional
    public void deleteWaterLog(String userEmail, Long id) {
        User user = getUserByEmail(userEmail);
        WaterLog log = waterLogRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Water log not found or access denied"));
        waterLogRepository.delete(log);
    }

    @Transactional
    public void resetTodayWater(String userEmail) {
        User user = getUserByEmail(userEmail);
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        List<WaterLog> todaysLogs = waterLogRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtDesc(
                user.getId(), startOfDay, endOfDay
        );
        waterLogRepository.deleteAll(todaysLogs);
    }

    @Transactional(readOnly = true)
    public DailyWaterSummaryDto getWaterSummary(String userEmail) {
        User user = getUserByEmail(userEmail);
        UserSettings settings = userSettingsRepository.findByUserId(user.getId())
                .orElseGet(() -> new UserSettings(user));

        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.atTime(LocalTime.MAX);

        int todayTotal = waterLogRepository.sumAmountByUserIdAndLoggedAtBetween(user.getId(), startOfToday, endOfToday);
        int dailyGoal = settings.getDailyWaterGoal() != null ? settings.getDailyWaterGoal() : 2500;
        double progress = dailyGoal > 0 ? Math.min(100.0, Math.round(((double) todayTotal / dailyGoal) * 1000.0) / 10.0) : 0.0;

        List<DailyWaterSummaryDto.DayTotalDto> weekly = new ArrayList<>();
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("EEE");

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(LocalTime.MAX);
            int daySum = waterLogRepository.sumAmountByUserIdAndLoggedAtBetween(user.getId(), start, end);
            String dayName = (i == 0) ? dayFormatter.format(date) + " (Today)" : dayFormatter.format(date);
            weekly.add(new DailyWaterSummaryDto.DayTotalDto(dayName, daySum, dailyGoal));
        }

        return new DailyWaterSummaryDto(todayTotal, dailyGoal, progress, weekly);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User account not found"));
    }

    private WaterLogDto toDto(WaterLog log) {
        WaterLogDto dto = new WaterLogDto();
        dto.setId(log.getId());
        dto.setAmount(log.getAmountMl());
        dto.setContainerType(log.getContainerType());
        dto.setTimestamp(log.getLoggedAt());
        dto.setTimeFormatted(log.getLoggedAt() != null ? log.getLoggedAt().format(TIME_FORMATTER) : "");
        dto.setNotes(log.getNotes());
        return dto;
    }
}
