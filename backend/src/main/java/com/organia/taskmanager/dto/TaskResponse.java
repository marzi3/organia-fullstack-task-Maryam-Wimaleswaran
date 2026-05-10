package com.organia.taskmanager.dto;

import com.organia.taskmanager.model.Priority;
import com.organia.taskmanager.model.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for task responses sent to the client.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String category;
    private Priority priority;
    private java.util.List<SubTaskResponse> subTasks;
}
