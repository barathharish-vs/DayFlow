package com.dayflow.service;

import com.dayflow.dto.TaskDto;
import com.dayflow.entity.Task;
import com.dayflow.entity.User;
import com.dayflow.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final AuthService authService;

    public TaskService(TaskRepository taskRepository, AuthService authService) {
        this.taskRepository = taskRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getTasks(String userEmail, Boolean completed, String category, String priority, LocalDate dueDate) {
        User user = authService.getUserByEmail(userEmail);
        List<Task> tasks;
        if (completed == null && category == null && priority == null && dueDate == null) {
            tasks = taskRepository.findByUserIdOrderByDueDateAscDueTimeAscCreatedAtDesc(user.getId());
        } else {
            tasks = taskRepository.findFiltered(user.getId(), completed, category, priority, dueDate);
        }
        return tasks.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskDto getTaskById(String userEmail, Long taskId) {
        User user = authService.getUserByEmail(userEmail);
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Task not found or access denied"));
        return toDto(task);
    }

    @Transactional
    public TaskDto createTask(String userEmail, TaskDto dto) {
        User user = authService.getUserByEmail(userEmail);

        Task task = new Task();
        task.setUser(user);
        task.setTitle(dto.getTitle().trim());
        task.setDescription(dto.getDescription());
        task.setCategory(dto.getCategory() != null ? dto.getCategory() : "Work");
        task.setPriority(dto.getPriority() != null ? dto.getPriority() : "medium");
        task.setDueDate(dto.getDueDate());
        task.setDueTime(dto.getDueTime());
        task.setCompleted(dto.getCompleted() != null ? dto.getCompleted() : false);
        task.setReminder(dto.getReminder() != null ? dto.getReminder() : false);

        task = taskRepository.save(task);
        return toDto(task);
    }

    @Transactional
    public TaskDto updateTask(String userEmail, Long taskId, TaskDto dto) {
        User user = authService.getUserByEmail(userEmail);
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Task not found or access denied"));

        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            task.setTitle(dto.getTitle().trim());
        }
        if (dto.getDescription() != null) {
            task.setDescription(dto.getDescription());
        }
        if (dto.getCategory() != null) {
            task.setCategory(dto.getCategory());
        }
        if (dto.getPriority() != null) {
            task.setPriority(dto.getPriority());
        }
        if (dto.getDueDate() != null) {
            task.setDueDate(dto.getDueDate());
        }
        if (dto.getDueTime() != null) {
            task.setDueTime(dto.getDueTime());
        }
        if (dto.getCompleted() != null) {
            boolean wasCompleted = Boolean.TRUE.equals(task.getCompleted());
            task.setCompleted(dto.getCompleted());
            if (dto.getCompleted() && !wasCompleted) {
                task.setCompletedAt(LocalDateTime.now());
            } else if (!dto.getCompleted()) {
                task.setCompletedAt(null);
            }
        }
        if (dto.getReminder() != null) {
            task.setReminder(dto.getReminder());
        }

        task = taskRepository.save(task);
        return toDto(task);
    }

    @Transactional
    public TaskDto toggleTaskCompleted(String userEmail, Long taskId) {
        User user = authService.getUserByEmail(userEmail);
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Task not found or access denied"));

        boolean newStatus = !Boolean.TRUE.equals(task.getCompleted());
        task.setCompleted(newStatus);
        if (newStatus) {
            task.setCompletedAt(LocalDateTime.now());
        } else {
            task.setCompletedAt(null);
        }
        task = taskRepository.save(task);
        return toDto(task);
    }

    @Transactional
    public void deleteTask(String userEmail, Long taskId) {
        User user = authService.getUserByEmail(userEmail);
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Task not found or access denied"));

        taskRepository.delete(task);
    }

    @Transactional(readOnly = true)
    public com.dayflow.dto.WeeklyTaskReportDto getWeeklyTaskReport(String userEmail, LocalDate targetDate) {
        User user = authService.getUserByEmail(userEmail);
        LocalDate baseDate = (targetDate != null) ? targetDate : LocalDate.now();
        if (baseDate.isAfter(LocalDate.now())) {
            baseDate = LocalDate.now();
        }

        LocalDate monday = baseDate.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate sunday = monday.plusDays(6);

        // Fetch all user's tasks
        List<Task> allTasks = taskRepository.findByUserIdOrderByDueDateAscDueTimeAscCreatedAtDesc(user.getId());

        int totalTasksDue = 0;
        int completedCount = 0;
        int pendingCount = 0;
        int overdueCount = 0;
        int completedOnTime = 0;
        int completedLate = 0;
        int lowPriority = 0;
        int mediumPriority = 0;
        int highPriority = 0;

        List<TaskDto> weekCompletedTasks = new ArrayList<>();
        List<TaskDto> weekPendingTasks = new ArrayList<>();

        java.time.format.DateTimeFormatter dayFormatter = java.time.format.DateTimeFormatter.ofPattern("EEE");
        List<com.dayflow.dto.WeeklyTaskReportDto.DailyWorkloadDto> workload = new ArrayList<>();

        // Group by day of week
        for (int i = 0; i < 7; i++) {
            LocalDate d = monday.plusDays(i);
            int dueOnDay = 0;
            int completedOnDay = 0;

            for (Task t : allTasks) {
                if (t.getDueDate() != null && t.getDueDate().equals(d)) {
                    dueOnDay++;
                    totalTasksDue++;
                    String pri = t.getPriority() != null ? t.getPriority().toLowerCase() : "medium";
                    if ("high".equals(pri)) highPriority++;
                    else if ("low".equals(pri)) lowPriority++;
                    else mediumPriority++;

                    if (Boolean.TRUE.equals(t.getCompleted())) {
                        completedCount++;
                        weekCompletedTasks.add(toDto(t));
                        if (t.getCompletedAt() != null) {
                            LocalDate completedDate = t.getCompletedAt().toLocalDate();
                            if (!completedDate.isAfter(t.getDueDate())) {
                                completedOnTime++;
                            } else {
                                completedLate++;
                            }
                        } else {
                            completedOnTime++;
                        }
                    } else {
                        pendingCount++;
                        weekPendingTasks.add(toDto(t));
                        if (t.getDueDate().isBefore(LocalDate.now())) {
                            overdueCount++;
                        }
                    }
                }

                // Check if task completed on this day
                if (Boolean.TRUE.equals(t.getCompleted()) && t.getCompletedAt() != null) {
                    if (t.getCompletedAt().toLocalDate().equals(d)) {
                        completedOnDay++;
                    }
                }
            }

            workload.add(new com.dayflow.dto.WeeklyTaskReportDto.DailyWorkloadDto(
                    dayFormatter.format(d), d, dueOnDay, completedOnDay
            ));
        }

        double completionRate = totalTasksDue > 0
                ? Math.round(((double) completedCount / totalTasksDue) * 1000.0) / 10.0
                : 0.0;

        // Previous week completed calculation
        LocalDate prevMonday = monday.minusWeeks(1);
        LocalDate prevSunday = sunday.minusWeeks(1);
        int prevWeekCompleted = 0;
        for (Task t : allTasks) {
            if (t.getDueDate() != null && !t.getDueDate().isBefore(prevMonday) && !t.getDueDate().isAfter(prevSunday)) {
                if (Boolean.TRUE.equals(t.getCompleted())) {
                    prevWeekCompleted++;
                }
            }
        }

        com.dayflow.dto.WeeklyTaskReportDto report = new com.dayflow.dto.WeeklyTaskReportDto();
        report.setWeekStartDate(monday);
        report.setWeekEndDate(sunday);
        report.setTotalTasksDue(totalTasksDue);
        report.setTasksCompleted(completedCount);
        report.setTasksPending(pendingCount);
        report.setTasksOverdue(overdueCount);
        report.setCompletionRate(completionRate);
        report.setCompletedOnTime(completedOnTime);
        report.setCompletedLate(completedLate);
        report.setPreviousWeekCompleted(prevWeekCompleted);
        report.setPriorityBreakdown(new com.dayflow.dto.WeeklyTaskReportDto.PriorityBreakdownDto(lowPriority, mediumPriority, highPriority));
        report.setDailyWorkload(workload);
        report.setCompletedTasks(weekCompletedTasks);
        report.setPendingTasks(weekPendingTasks);

        return report;
    }

    private TaskDto toDto(Task task) {
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setCategory(task.getCategory());
        dto.setPriority(task.getPriority());
        dto.setDueDate(task.getDueDate());
        dto.setDueTime(task.getDueTime());
        dto.setCompleted(task.getCompleted());
        dto.setCompletedAt(task.getCompletedAt() != null ? task.getCompletedAt().toString() : null);
        dto.setReminder(task.getReminder());
        dto.setCreatedAt(task.getCreatedAt() != null ? task.getCreatedAt().toString() : null);
        return dto;
    }
}
