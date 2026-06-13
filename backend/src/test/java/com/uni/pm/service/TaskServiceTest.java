package com.uni.pm.service;

import com.uni.pm.dto.TaskDto;
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

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProjectMemberRepository memberRepository;
    @Mock
    private UserService userService;

    @InjectMocks
    private TaskService taskService;

    private User projectManager;
    private User employee;
    private User outsider;
    private Project project;
    private Task task;

    @BeforeEach
    void setUp() {
        projectManager = new User();
        projectManager.setId(1L);
        projectManager.setUsername("pm");
        projectManager.setRole(Role.PROJECT_MANAGER);

        employee = new User();
        employee.setId(2L);
        employee.setUsername("employee");
        employee.setRole(Role.EMPLOYEE);

        outsider = new User();
        outsider.setId(3L);
        outsider.setUsername("outsider");
        outsider.setRole(Role.EMPLOYEE);

        project = new Project();
        project.setId(10L);
        project.setStatus(ProjectStatus.ACTIVE);
        project.setOwner(projectManager);

        task = new Task();
        task.setId(100L);
        task.setTitle("Testaufgabe");
        task.setStatus(TaskStatus.OPEN);
        task.setProject(project);
    }

    @Test
    void statusaenderung_wird_gespeichert() {
        when(taskRepository.findById(100L)).thenReturn(Optional.of(task));
        when(memberRepository.existsByProjectAndUser(project, employee)).thenReturn(true);
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskDto result = taskService.updateTaskStatus(10L, 100L, "IN_PROGRESS", employee);

        assertThat(result.getStatus()).isEqualTo("IN_PROGRESS");
        verify(taskRepository).save(task);
    }

    @Test
    void statusaenderung_auf_done_aendert_status_korrekt() {
        when(taskRepository.findById(100L)).thenReturn(Optional.of(task));
        when(memberRepository.existsByProjectAndUser(project, employee)).thenReturn(true);
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskDto result = taskService.updateTaskStatus(10L, 100L, "DONE", employee);

        assertThat(result.getStatus()).isEqualTo("DONE");
    }

    @Test
    void kein_zugriff_fuer_nicht_mitglieder() {
        when(taskRepository.findById(100L)).thenReturn(Optional.of(task));
        when(memberRepository.existsByProjectAndUser(project, outsider)).thenReturn(false);

        assertThatThrownBy(() -> taskService.updateTaskStatus(10L, 100L, "DONE", outsider))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Kein Zugriff");
    }

    @Test
    void task_gehoert_nicht_zu_projekt_wirft_fehler() {
        Project anderesProjekt = new Project();
        anderesProjekt.setId(99L);
        task.setProject(anderesProjekt);

        when(taskRepository.findById(100L)).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> taskService.updateTaskStatus(10L, 100L, "DONE", employee))
                .isInstanceOf(RuntimeException.class);
    }
}
