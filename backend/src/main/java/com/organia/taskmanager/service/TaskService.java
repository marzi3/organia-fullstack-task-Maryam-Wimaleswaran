package com.organia.taskmanager.service;

import com.organia.taskmanager.dto.TaskRequest;
import com.organia.taskmanager.dto.TaskResponse;
import com.organia.taskmanager.exception.ResourceNotFoundException;
import com.organia.taskmanager.model.Task;
import com.organia.taskmanager.model.TaskStatus;
import com.organia.taskmanager.model.User;
import com.organia.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service layer for task CRUD operations.
 * All operations are scoped to the authenticated user for data isolation.
 */
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    /** Create a new task for the authenticated user. */
    public TaskResponse createTask(TaskRequest request, User user) {
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus())
                .dueDate(request.getDueDate())
                .user(user)
                .build();

        Task saved = taskRepository.save(task);
        return mapToResponse(saved);
    }

    /** Get all tasks for the authenticated user, optionally filtered by status or search keyword. */
    public List<TaskResponse> getAllTasks(User user, TaskStatus status, String search) {
        List<Task> tasks;

        if (status != null) {
            tasks = taskRepository.findByUserAndStatusOrderByCreatedAtDesc(user, status);
        } else if (search != null && !search.isBlank()) {
            tasks = taskRepository.searchByTitle(user, search.trim());
        } else {
            tasks = taskRepository.findByUserOrderByCreatedAtDesc(user);
        }

        return tasks.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /** Get paginated tasks for a user. */
    public Map<String, Object> getTasksPaginated(User user, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Task> taskPage = taskRepository.findByUser(user, pageRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("tasks", taskPage.getContent().stream().map(this::mapToResponse).collect(Collectors.toList()));
        response.put("currentPage", taskPage.getNumber());
        response.put("totalItems", taskPage.getTotalElements());
        response.put("totalPages", taskPage.getTotalPages());

        return response;
    }

    /** Update a task — verifies ownership before modification. */
    public TaskResponse updateTask(Long taskId, TaskRequest request, User user) {
        Task task = taskRepository.findByIdAndUser(taskId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setDueDate(request.getDueDate());

        Task updated = taskRepository.save(task);
        return mapToResponse(updated);
    }

    /** Update only the status of a task. */
    public TaskResponse updateTaskStatus(Long taskId, TaskStatus status, User user) {
        Task task = taskRepository.findByIdAndUser(taskId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        task.setStatus(status);
        Task updated = taskRepository.save(task);
        return mapToResponse(updated);
    }

    /** Delete a task — verifies ownership before deletion. */
    public void deleteTask(Long taskId, User user) {
        Task task = taskRepository.findByIdAndUser(taskId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        taskRepository.delete(task);
    }

    /** Get dashboard summary counts for a user. */
    public Map<String, Long> getTaskSummary(User user) {
        Map<String, Long> summary = new HashMap<>();
        summary.put("total", taskRepository.countByUser(user));
        summary.put("todo", taskRepository.countByUserAndStatus(user, TaskStatus.TO_DO));
        summary.put("inProgress", taskRepository.countByUserAndStatus(user, TaskStatus.IN_PROGRESS));
        summary.put("completed", taskRepository.countByUserAndStatus(user, TaskStatus.COMPLETED));
        return summary;
    }

    /** Map Task entity to TaskResponse DTO. */
    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
