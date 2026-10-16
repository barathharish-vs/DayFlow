package com.dayflow.service;

import com.dayflow.dto.TaskDto;
import com.dayflow.entity.Task;
import com.dayflow.entity.User;
import com.dayflow.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
            task.setCompleted(dto.getCompleted());
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

        task.setCompleted(!task.getCompleted());
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
        dto.setReminder(task.getReminder());
        dto.setCreatedAt(task.getCreatedAt() != null ? task.getCreatedAt().toString() : null);
        return dto;
    }
}
