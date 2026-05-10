package com.organia.taskmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for sub-task creation and update.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubTaskRequest {
    private Long id;
    private String title;
    private boolean completed;
}
