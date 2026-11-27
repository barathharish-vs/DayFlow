package com.dayflow.service;

import com.dayflow.dto.DailyWaterSummaryDto;
import com.dayflow.dto.TaskDto;
import com.dayflow.dto.WeeklyTaskReportDto;
import com.dayflow.dto.WeeklyWaterReportDto;
import com.dayflow.entity.Task;
import com.dayflow.entity.User;
import com.dayflow.entity.UserSettings;
import com.dayflow.entity.WaterLog;
import com.dayflow.repository.TaskRepository;
import com.dayflow.repository.UserRepository;
import com.dayflow.repository.UserSettingsRepository;
import com.dayflow.repository.WaterLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class Phase1ServicesUnitTest {

    @Mock
    private WaterLogRepository waterLogRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserSettingsRepository userSettingsRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private WaterLogService waterLogService;

    @InjectMocks
    private TaskService taskService;

    @InjectMocks
    private SettingsService settingsService;

    private User testUser;
    private UserSettings testSettings;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(100L);
        testUser.setEmail("test@dayflow.io");
        testUser.setName("Test User");

        testSettings = new UserSettings(testUser);
        testSettings.setDailyWaterGoal(2500);
    }

    @Test
    @DisplayName("WaterLogService: Daily summary correctly computes total and progress")
    void testWaterSummaryCalculation() {
        when(userRepository.findByEmail("test@dayflow.io")).thenReturn(Optional.of(testUser));
        when(userSettingsRepository.findByUserId(100L)).thenReturn(Optional.of(testSettings));
        when(waterLogRepository.sumAmountByUserIdAndLoggedAtBetween(eq(100L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(1500);

        DailyWaterSummaryDto summary = waterLogService.getWaterSummary("test@dayflow.io");

        assertNotNull(summary);
        assertEquals(1500, summary.getTodayTotal());
        assertEquals(2500, summary.getDailyGoal());
        assertEquals(60.0, summary.getProgressPercentage(), 0.01);
        assertEquals(7, summary.getWeeklyHistory().size());
    }

    @Test
    @DisplayName("WaterLogService: Weekly report calculates daysGoalMet, total, and breakdown accurately")
    void testWeeklyWaterReport() {
        when(userRepository.findByEmail("test@dayflow.io")).thenReturn(Optional.of(testUser));
        when(userSettingsRepository.findByUserId(100L)).thenReturn(Optional.of(testSettings));

        WaterLog log = new WaterLog();
        log.setAmountMl(3000);
        log.setLoggedAt(LocalDateTime.now());

        when(waterLogRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtDesc(eq(100L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(log))
                .thenReturn(Collections.emptyList());

        WeeklyWaterReportDto report = waterLogService.getWeeklyWaterReport("test@dayflow.io", LocalDate.now());

        assertNotNull(report);
        assertEquals(2500, report.getDailyGoalMl());
        assertEquals(7, report.getDailyDetails().size());
        assertTrue(report.getDaysGoalMet() >= 1);
    }

    @Test
    @DisplayName("TaskService: Creating task validates fields and assigns authenticated user")
    void testCreateTask() {
        when(authService.getUserByEmail("test@dayflow.io")).thenReturn(testUser);

        TaskDto input = new TaskDto();
        input.setTitle("Complete Phase 1 Tests");
        input.setCategory("Work");
        input.setPriority("high");
        input.setDueDate(LocalDate.now());

        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task saved = invocation.getArgument(0);
            saved.setId(500L);
            saved.setCreatedAt(LocalDateTime.now());
            return saved;
        });

        TaskDto result = taskService.createTask("test@dayflow.io", input);

        assertNotNull(result);
        assertEquals(500L, result.getId());
        assertEquals("Complete Phase 1 Tests", result.getTitle());
        assertEquals("high", result.getPriority());
        assertFalse(result.getCompleted());
    }

    @Test
    @DisplayName("TaskService: Toggling task sets completion flag and completedAt timestamp")
    void testToggleTaskCompleted() {
        when(authService.getUserByEmail("test@dayflow.io")).thenReturn(testUser);

        Task existing = new Task();
        existing.setId(500L);
        existing.setUser(testUser);
        existing.setTitle("Toggle Test");
        existing.setCompleted(false);
        existing.setDueDate(LocalDate.now());

        when(taskRepository.findByIdAndUserId(500L, 100L)).thenReturn(Optional.of(existing));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskDto toggled = taskService.toggleTaskCompleted("test@dayflow.io", 500L);

        assertTrue(toggled.getCompleted());
        assertNotNull(toggled.getCompletedAt());

        // Toggle back to reopen
        TaskDto reopened = taskService.toggleTaskCompleted("test@dayflow.io", 500L);
        assertFalse(reopened.getCompleted());
        assertNull(reopened.getCompletedAt());
    }

    @Test
    @DisplayName("TaskService: Weekly task report accurately calculates completion rate and priorities")
    void testWeeklyTaskReport() {
        when(authService.getUserByEmail("test@dayflow.io")).thenReturn(testUser);

        LocalDate today = LocalDate.now();
        Task t1 = new Task();
        t1.setId(1L);
        t1.setTitle("Task 1");
        t1.setDueDate(today);
        t1.setPriority("high");
        t1.setCompleted(true);
        t1.setCompletedAt(today.atTime(LocalTime.NOON));

        Task t2 = new Task();
        t2.setId(2L);
        t2.setTitle("Task 2");
        t2.setDueDate(today);
        t2.setPriority("medium");
        t2.setCompleted(false);

        when(taskRepository.findByUserIdOrderByDueDateAscDueTimeAscCreatedAtDesc(100L))
                .thenReturn(List.of(t1, t2));

        WeeklyTaskReportDto report = taskService.getWeeklyTaskReport("test@dayflow.io", today);

        assertNotNull(report);
        assertEquals(2, report.getTotalTasksDue());
        assertEquals(1, report.getTasksCompleted());
        assertEquals(1, report.getTasksPending());
        assertEquals(50.0, report.getCompletionRate(), 0.01);
        assertEquals(1, report.getCompletedOnTime());
        assertEquals(1, report.getPriorityBreakdown().getHigh());
        assertEquals(1, report.getPriorityBreakdown().getMedium());
        assertEquals(0, report.getPriorityBreakdown().getLow());
    }

    @Test
    @DisplayName("TaskService: Weekly task report safely handles tasks with null dueDate without NPE")
    void testWeeklyTaskReportWithNullDueDate() {
        when(authService.getUserByEmail("test@dayflow.io")).thenReturn(testUser);

        LocalDate today = LocalDate.now();
        Task t1 = new Task();
        t1.setId(1L);
        t1.setTitle("Valid Task");
        t1.setDueDate(today);
        t1.setPriority("high");
        t1.setCompleted(true);

        Task tNullDate = new Task();
        tNullDate.setId(2L);
        tNullDate.setTitle("Task with null due date");
        tNullDate.setDueDate(null);
        tNullDate.setPriority("low");
        tNullDate.setCompleted(false);

        when(taskRepository.findByUserIdOrderByDueDateAscDueTimeAscCreatedAtDesc(100L))
                .thenReturn(List.of(t1, tNullDate));

        assertDoesNotThrow(() -> {
            WeeklyTaskReportDto report = taskService.getWeeklyTaskReport("test@dayflow.io", today);
            assertNotNull(report);
            assertEquals(1, report.getTotalTasksDue());
        });
    }

    @Test
    @DisplayName("Security & Isolation: Accessing another user's task or log throws exception")
    void testAccessDeniedForNonOwnedResource() {
        when(authService.getUserByEmail("test@dayflow.io")).thenReturn(testUser);
        when(taskRepository.findByIdAndUserId(999L, 100L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            taskService.getTaskById("test@dayflow.io", 999L);
        });

        when(userRepository.findByEmail("test@dayflow.io")).thenReturn(Optional.of(testUser));
        when(waterLogRepository.findByIdAndUserId(999L, 100L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            waterLogService.deleteWaterLog("test@dayflow.io", 999L);
        });
    }

    @Test
    @DisplayName("SettingsService: Update separate notification switches persists preferences correctly")
    void testNotificationSwitchesPersistence() {
        when(userRepository.findByEmail("test@dayflow.io")).thenReturn(Optional.of(testUser));
        when(userSettingsRepository.findByUserId(100L)).thenReturn(Optional.of(testSettings));
        when(userSettingsRepository.save(any(UserSettings.class))).thenAnswer(invocation -> invocation.getArgument(0));

        com.dayflow.dto.UpdateSettingsRequest req = new com.dayflow.dto.UpdateSettingsRequest();
        req.setNotificationsEnabled(true);
        req.setWaterRemindersEnabled(false);
        req.setTaskRemindersEnabled(true);

        com.dayflow.dto.UserProfileDto updated = settingsService.updateSettings("test@dayflow.io", req);

        assertNotNull(updated);
        assertTrue(updated.getNotificationsEnabled());
        assertFalse(updated.getWaterRemindersEnabled());
        assertTrue(updated.getTaskRemindersEnabled());
    }
}
