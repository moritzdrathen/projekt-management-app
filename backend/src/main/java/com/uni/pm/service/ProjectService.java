package com.uni.pm.service;

import com.uni.pm.dto.CreateProjectRequest;
import com.uni.pm.dto.ProjectDto;
import com.uni.pm.dto.UserDto;
import com.uni.pm.model.*;
import com.uni.pm.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public ProjectService(ProjectRepository projectRepository, ProjectMemberRepository memberRepository,
                          TaskRepository taskRepository, UserRepository userRepository, UserService userService) {
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public List<ProjectDto> getProjectsForUser(User currentUser) {
        List<Project> projects = currentUser.getRole() == Role.ADMIN
                ? projectRepository.findAll()
                : projectRepository.findProjectsForUser(currentUser);
        return projects.stream().map(this::toDto).collect(Collectors.toList());
    }

    public ProjectDto getProject(Long id, User currentUser) {
        Project project = projectRepository.findById(id).orElseThrow();
        checkAccess(project, currentUser);
        return toDto(project);
    }

    public ProjectDto createProject(CreateProjectRequest request, User owner) {
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setOwner(owner);
        project.setStatus(ProjectStatus.ACTIVE);
        Project saved = projectRepository.save(project);
        addMemberInternal(saved, owner);
        return toDto(saved);
    }

    public ProjectDto updateProject(Long id, CreateProjectRequest request, User currentUser) {
        Project project = projectRepository.findById(id).orElseThrow();
        checkOwnerOrAdmin(project, currentUser);
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        return toDto(projectRepository.save(project));
    }

    public ProjectDto archiveProject(Long id, User currentUser) {
        Project project = projectRepository.findById(id).orElseThrow();
        checkOwnerOrAdmin(project, currentUser);
        project.setStatus(ProjectStatus.ARCHIVED);
        return toDto(projectRepository.save(project));
    }

    public List<UserDto> getMembers(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        checkAccess(project, currentUser);
        return memberRepository.findByProject(project).stream()
                .map(m -> userService.toDto(m.getUser()))
                .collect(Collectors.toList());
    }

    public void addMember(Long projectId, Long userId, User currentUser) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        checkOwnerOrAdmin(project, currentUser);
        User user = userRepository.findById(userId).orElseThrow();
        addMemberInternal(project, user);
    }

    public void removeMember(Long projectId, Long userId, User currentUser) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        checkOwnerOrAdmin(project, currentUser);
        User user = userRepository.findById(userId).orElseThrow();
        memberRepository.findByProjectAndUser(project, user).ifPresent(memberRepository::delete);
    }

    private void addMemberInternal(Project project, User user) {
        if (!memberRepository.existsByProjectAndUser(project, user)) {
            ProjectMember member = new ProjectMember();
            member.setProject(project);
            member.setUser(user);
            memberRepository.save(member);
        }
    }

    private void checkAccess(Project project, User user) {
        if (user.getRole() == Role.ADMIN) return;
        if (project.getOwner().getId().equals(user.getId())) return;
        if (!memberRepository.existsByProjectAndUser(project, user)) {
            throw new RuntimeException("Kein Zugriff auf dieses Projekt");
        }
    }

    private void checkOwnerOrAdmin(Project project, User user) {
        if (user.getRole() == Role.ADMIN) return;
        if (!project.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Nur der Projektleiter oder ein Admin darf diese Aktion ausführen");
        }
    }

    public ProjectDto toDto(Project project) {
        ProjectDto dto = new ProjectDto();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setStatus(project.getStatus().name());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setOwner(userService.toDto(project.getOwner()));
        dto.setTotalTasks((int) taskRepository.countByProject(project));
        dto.setDoneTasks((int) taskRepository.countByProjectAndStatus(project, TaskStatus.DONE));
        return dto;
    }
}
