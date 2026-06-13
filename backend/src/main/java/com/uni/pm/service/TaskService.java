package com.uni.pm.service;

import com.uni.pm.dto.CreateTaskRequest;
import com.uni.pm.dto.TaskDto;
import com.uni.pm.model.*;
import com.uni.pm.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserService userService;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository,
                       UserRepository userRepository, ProjectMemberRepository memberRepository,
                       UserService userService) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
        this.userService = userService;
    }

    public List<TaskDto> getTasksForProject(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        checkAccess(project, currentUser);
        return taskRepository.findByProject(project).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public TaskDto createTask(Long projectId, CreateTaskRequest request, User currentUser) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        checkAccess(project, currentUser);
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setProject(project);
        task.setStatus(TaskStatus.OPEN);
        if (request.getAssignedToId() != null) {
            task.setAssignedTo(userRepository.findById(request.getAssignedToId()).orElse(null));
        }
        return toDto(taskRepository.save(task));
    }

    public TaskDto updateTask(Long projectId, Long taskId, CreateTaskRequest request, User currentUser) {
        Task task = getTaskInProject(projectId, taskId);
        checkAccess(task.getProject(), currentUser);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getAssignedToId() != null) {
            task.setAssignedTo(userRepository.findById(request.getAssignedToId()).orElse(null));
        } else {
            task.setAssignedTo(null);
        }
        return toDto(taskRepository.save(task));
    }

    public TaskDto updateTaskStatus(Long projectId, Long taskId, String status, User currentUser) {
        Task task = getTaskInProject(projectId, taskId);
        checkAccess(task.getProject(), currentUser);
        task.setStatus(TaskStatus.valueOf(status));
        return toDto(taskRepository.save(task));
    }

    public void deleteTask(Long projectId, Long taskId, User currentUser) {
        Task task = getTaskInProject(projectId, taskId);
        checkAccess(task.getProject(), currentUser);
        taskRepository.delete(task);
    }

    private Task getTaskInProject(Long projectId, Long taskId) {
        Task task = taskRepository.findById(taskId).orElseThrow();
        if (!task.getProject().getId().equals(projectId)) {
            throw new RuntimeException("Task gehört nicht zu diesem Projekt");
        }
        return task;
    }

    private void checkAccess(Project project, User user) {
        if (user.getRole() == Role.ADMIN) return;
        if (project.getOwner().getId().equals(user.getId())) return;
        if (!memberRepository.existsByProjectAndUser(project, user)) {
            throw new RuntimeException("Kein Zugriff auf dieses Projekt");
        }
    }

    public TaskDto toDto(Task task) {
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus().name());
        dto.setCreatedAt(task.getCreatedAt());
        if (task.getAssignedTo() != null) {
            dto.setAssignedTo(userService.toDto(task.getAssignedTo()));
        }
        return dto;
    }
}
