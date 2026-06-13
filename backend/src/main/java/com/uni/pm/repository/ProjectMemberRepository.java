package com.uni.pm.repository;

import com.uni.pm.model.Project;
import com.uni.pm.model.ProjectMember;
import com.uni.pm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    List<ProjectMember> findByProject(Project project);
    Optional<ProjectMember> findByProjectAndUser(Project project, User user);
    boolean existsByProjectAndUser(Project project, User user);
}
