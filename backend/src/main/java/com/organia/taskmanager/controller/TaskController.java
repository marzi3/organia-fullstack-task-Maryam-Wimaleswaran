package com.organia.taskmanager.controller;

import com.organia.taskmanager.dto.StatusUpdateRequest;
import com.organia.taskmanager.dto.TaskRequest;
import com.organia.taskmanager.dto.TaskResponse;
import com.organia.taskmanager.model.TaskStatus;
import com.organia.taskmanager.model.User;
import com.organia.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for task CRUD operations (protected — JWT required).
 * All operations are scoped to the authenticated user via @AuthenticationPrincipal.
 */
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /** Create a new task. */
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal User user
    ) {
        TaskResponse response = taskService.createTask(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** Get all tasks with optional status filter and search. */
    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) String search
    ) {
        List<TaskResponse> tasks = taskService.getAllTasks(user, status, search);
        return ResponseEntity.ok(tasks);
    }

    /** Get paginated tasks. */
    @GetMapping("/paginated")
    public ResponseEntity<Map<String, Object>> getTasksPaginated(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Map<String, Object> response = taskService.getTasksPaginated(user, page, size);
        return ResponseEntity.ok(response);
    }

    /** Get dashboard summary statistics. */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Long>> getTaskSummary(@AuthenticationPrincipal User user) {
        Map<String, Long> summary = taskService.getTaskSummary(user);
        return ResponseEntity.ok(summary);
    }

    /** Update a task by ID. */
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal User user
    ) {
        TaskResponse response = taskService.updateTask(id, request, user);
        return ResponseEntity.ok(response);
    }

    /** Update only the status of a task. */
    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal User user
    ) {
        TaskResponse response = taskService.updateTaskStatus(id, request.getStatus(), user);
        return ResponseEntity.ok(response);
    }

    /** Delete a task by ID. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        taskService.deleteTask(id, user);
        return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
    }
}
