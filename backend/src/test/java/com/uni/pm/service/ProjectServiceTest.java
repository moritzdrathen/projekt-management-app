package com.uni.pm.service;

import com.uni.pm.dto.ProjectDto;
import com.uni.pm.model.*;
import com.uni.pm.repository.ProjectMemberRepository;
import com.uni.pm.repository.ProjectRepository;
import com.uni.pm.repository.TaskRepository;
import com.uni.pm.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private ProjectMemberRepository memberRepository;
    @Mock
    private TaskRepository taskRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserService userService;

    @InjectMocks
    private ProjectService projectService;

    private User admin;
    private User projectManager;
    private User employee;
    private Project project;

    @BeforeEach
    void setUp() {
        admin = new User();
        admin.setId(1L);
        admin.setUsername("admin");
        admin.setRole(Role.ADMIN);

        projectManager = new User();
        projectManager.setId(2L);
        projectManager.setUsername("pm");
        projectManager.setRole(Role.PROJECT_MANAGER);

        employee = new User();
        employee.setId(3L);
        employee.setUsername("employee");
        employee.setRole(Role.EMPLOYEE);

        project = new Project();
        project.setId(10L);
        project.setName("Testprojekt");
        project.setStatus(ProjectStatus.ACTIVE);
        project.setOwner(projectManager);
    }

    @Test
    void admin_sieht_alle_projekte() {
        when(projectRepository.findAll()).thenReturn(List.of(project));
        when(taskRepository.countByProject(project)).thenReturn(0L);
        when(taskRepository.countByProjectAndStatus(project, TaskStatus.DONE)).thenReturn(0L);
        when(userService.toDto(projectManager)).thenReturn(null);

        List<ProjectDto> result = projectService.getProjectsForUser(admin);

        assertThat(result).hasSize(1);
        verify(projectRepository).findAll();
        verify(projectRepository, never()).findProjectsForUser(any());
    }

    @Test
    void employee_sieht_nur_eigene_projekte() {
        when(projectRepository.findProjectsForUser(employee)).thenReturn(List.of(project));
        when(taskRepository.countByProject(project)).thenReturn(0L);
        when(taskRepository.countByProjectAndStatus(project, TaskStatus.DONE)).thenReturn(0L);
        when(userService.toDto(projectManager)).thenReturn(null);

        List<ProjectDto> result = projectService.getProjectsForUser(employee);

        assertThat(result).hasSize(1);
        verify(projectRepository).findProjectsForUser(employee);
        verify(projectRepository, never()).findAll();
    }

    @Test
    void fortschritt_korrekt_berechnet() {
        when(taskRepository.countByProject(project)).thenReturn(4L);
        when(taskRepository.countByProjectAndStatus(project, TaskStatus.DONE)).thenReturn(3L);
        when(userService.toDto(projectManager)).thenReturn(null);

        ProjectDto dto = projectService.toDto(project);

        assertThat(dto.getTotalTasks()).isEqualTo(4);
        assertThat(dto.getDoneTasks()).isEqualTo(3);
    }

    @Test
    void kein_zugriff_wenn_nicht_mitglied() {
        when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
        when(memberRepository.existsByProjectAndUser(project, employee)).thenReturn(false);

        assertThatThrownBy(() -> projectService.getProject(10L, employee))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void employee_darf_projekt_nicht_archivieren() {
        assertThatThrownBy(() -> projectService.archiveProject(10L, employee))
                .isInstanceOf(RuntimeException.class);
    }
}
