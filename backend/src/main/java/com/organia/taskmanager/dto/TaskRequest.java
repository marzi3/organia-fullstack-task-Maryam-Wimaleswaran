package com.organia.taskmanager.dto;

import com.organia.taskmanager.model.Priority;
import com.organia.taskmanager.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for task creation and update requests.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Status is required")
    private TaskStatus status;

    private LocalDate dueDate;

    private String category;

    private Priority priority;

    private java.util.List<SubTaskRequest> subTasks = new java.util.ArrayList<>();
}
