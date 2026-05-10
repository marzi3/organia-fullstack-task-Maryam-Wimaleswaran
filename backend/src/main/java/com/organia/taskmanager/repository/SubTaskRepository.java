package com.organia.taskmanager.repository;

import com.organia.taskmanager.model.SubTask;
import com.organia.taskmanager.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for SubTask entity.
 */
@Repository
public interface SubTaskRepository extends JpaRepository<SubTask, Long> {
    void deleteByTask(Task task);
}
