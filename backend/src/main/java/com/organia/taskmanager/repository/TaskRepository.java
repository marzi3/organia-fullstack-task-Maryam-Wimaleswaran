package com.organia.taskmanager.repository;

import com.organia.taskmanager.model.Task;
import com.organia.taskmanager.model.TaskStatus;
import com.organia.taskmanager.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Task entity operations.
 * All queries are scoped to the authenticated user for data isolation.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /** Find all tasks belonging to a user. */
    List<Task> findByUserOrderByCreatedAtDesc(User user);

    /** Find a specific task by ID and user — prevents cross-user access. */
    Optional<Task> findByIdAndUser(Long id, User user);

    /** Filter tasks by status for a user. */
    List<Task> findByUserAndStatusOrderByCreatedAtDesc(User user, TaskStatus status);

    /** Search tasks by title keyword for a user. */
    @Query("SELECT t FROM Task t WHERE t.user = :user AND LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY t.createdAt DESC")
    List<Task> searchByTitle(@Param("user") User user, @Param("keyword") String keyword);

    /** Paginated task retrieval for a user. */
    Page<Task> findByUser(User user, Pageable pageable);

    /** Count tasks by status for dashboard summary. */
    long countByUserAndStatus(User user, TaskStatus status);

    /** Count all tasks for a user. */
    long countByUser(User user);
}
