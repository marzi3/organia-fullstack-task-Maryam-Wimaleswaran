package com.organia.taskmanager.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing a sub-task within a main task.
 */
@Entity
@Table(name = "sub_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private boolean completed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;
}
