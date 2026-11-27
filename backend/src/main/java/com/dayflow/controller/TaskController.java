package com.dayflow.controller;

import com.dayflow.dto.TaskDto;
import com.dayflow.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<TaskDto>> getTasks(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Boolean completed,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate
    ) {
        return ResponseEntity.ok(taskService.getTasks(userDetails.getUsername(), completed, category, priority, dueDate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(taskService.getTaskById(userDetails.getUsername(), id));
    }

    @PostMapping
    public ResponseEntity<TaskDto> createTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TaskDto dto
    ) {
        return ResponseEntity.ok(taskService.createTask(userDetails.getUsername(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody TaskDto dto
    ) {
        return ResponseEntity.ok(taskService.updateTask(userDetails.getUsername(), id, dto));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TaskDto> toggleTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(taskService.toggleTaskCompleted(userDetails.getUsername(), id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        taskService.deleteTask(userDetails.getUsername(), id);
        return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
    }

    @GetMapping("/weekly-report")
    public ResponseEntity<com.dayflow.dto.WeeklyTaskReportDto> getWeeklyReport(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate targetDate
    ) {
        return ResponseEntity.ok(taskService.getWeeklyTaskReport(userDetails.getUsername(), targetDate));
    }
}
