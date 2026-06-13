package com.uni.pm.repository;

import com.uni.pm.model.Project;
import com.uni.pm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Gibt alle Projekte zurück, in denen der User Owner oder Member ist
    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members m WHERE p.owner = :user OR m.user = :user")
    List<Project> findProjectsForUser(@Param("user") User user);
}
