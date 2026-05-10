package com.organia.taskmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for sub-task responses.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubTaskResponse {
    private Long id;
    private String title;
    private boolean completed;
}
