package com.dayflow.service;

import com.dayflow.dto.DailyWaterSummaryDto;
import com.dayflow.dto.WaterLogDto;
import com.dayflow.dto.WeeklyWaterReportDto;
import com.dayflow.entity.User;
import com.dayflow.entity.UserSettings;
import com.dayflow.entity.WaterLog;
import com.dayflow.repository.UserRepository;
import com.dayflow.repository.UserSettingsRepository;
import com.dayflow.repository.WaterLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
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

    @Transactional(readOnly = true)
    public WeeklyWaterReportDto getWeeklyWaterReport(String userEmail, LocalDate targetDate) {
        User user = getUserByEmail(userEmail);
        UserSettings settings = userSettingsRepository.findByUserId(user.getId())
                .orElseGet(() -> new UserSettings(user));

        LocalDate baseDate = (targetDate != null) ? targetDate : LocalDate.now();
        // Disallow future base dates
        if (baseDate.isAfter(LocalDate.now())) {
            baseDate = LocalDate.now();
        }

        LocalDate monday = baseDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = monday.plusDays(6);

        int dailyGoal = settings.getDailyWaterGoal() != null ? settings.getDailyWaterGoal() : 2500;
        int totalWeeklyIntake = 0;
        int daysGoalMet = 0;
        int bestDayIntake = -1;
        String bestDayName = "None";
        int lowestDayIntake = Integer.MAX_VALUE;
        String lowestDayName = "None";

        List<WeeklyWaterReportDto.DailyIntakeDetailDto> details = new ArrayList<>();
        DateTimeFormatter dayNameFormatter = DateTimeFormatter.ofPattern("EEE");

        for (int i = 0; i < 7; i++) {
            LocalDate d = monday.plusDays(i);
            LocalDateTime start = d.atStartOfDay();
            LocalDateTime end = d.atTime(LocalTime.MAX);

            List<WaterLog> dayLogs = waterLogRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtDesc(user.getId(), start, end);
            int daySum = dayLogs.stream().mapToInt(WaterLog::getAmountMl).sum();
            totalWeeklyIntake += daySum;

            boolean goalMet = daySum >= dailyGoal && daySum > 0;
            if (goalMet) {
                daysGoalMet++;
            }

            double percentage = dailyGoal > 0 ? Math.round(((double) daySum / dailyGoal) * 1000.0) / 10.0 : 0.0;
            String dayName = dayNameFormatter.format(d);

            details.add(new WeeklyWaterReportDto.DailyIntakeDetailDto(
                    dayName, d, daySum, dailyGoal, percentage, goalMet, dayLogs.size()
            ));

            if (daySum > bestDayIntake) {
                bestDayIntake = daySum;
                bestDayName = dayName + " (" + d.getMonthValue() + "/" + d.getDayOfMonth() + ")";
            }
            if (daySum < lowestDayIntake) {
                lowestDayIntake = daySum;
                lowestDayName = dayName + " (" + d.getMonthValue() + "/" + d.getDayOfMonth() + ")";
            }
        }

        int averageDaily = Math.round((float) totalWeeklyIntake / 7f);

        // Previous week calculation
        LocalDate prevMonday = monday.minusWeeks(1);
        LocalDate prevSunday = sunday.minusWeeks(1);
        LocalDateTime prevStart = prevMonday.atStartOfDay();
        LocalDateTime prevEnd = prevSunday.atTime(LocalTime.MAX);
        int prevWeekTotal = waterLogRepository.sumAmountByUserIdAndLoggedAtBetween(user.getId(), prevStart, prevEnd);

        Double wowChange = null;
        if (prevWeekTotal > 0) {
            wowChange = Math.round(((double)(totalWeeklyIntake - prevWeekTotal) / prevWeekTotal) * 1000.0) / 10.0;
        }

        WeeklyWaterReportDto report = new WeeklyWaterReportDto();
        report.setWeekStartDate(monday);
        report.setWeekEndDate(sunday);
        report.setTotalIntakeMl(totalWeeklyIntake);
        report.setAverageDailyIntakeMl(averageDaily);
        report.setDailyGoalMl(dailyGoal);
        report.setDaysGoalMet(daysGoalMet);
        report.setBestDayIntakeMl(Math.max(0, bestDayIntake));
        report.setBestDayName(bestDayName);
        report.setLowestDayIntakeMl(lowestDayIntake == Integer.MAX_VALUE ? 0 : lowestDayIntake);
        report.setLowestDayName(lowestDayName);
        report.setPreviousWeekTotalMl(prevWeekTotal);
        report.setWeekOverWeekChangePercent(wowChange);
        report.setDailyDetails(details);

        return report;
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
