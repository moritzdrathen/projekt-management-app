package com.uni.pm.repository;

import com.uni.pm.model.Project;
import com.uni.pm.model.Task;
import com.uni.pm.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProject(Project project);
    long countByProject(Project project);
    long countByProjectAndStatus(Project project, TaskStatus status);
}
