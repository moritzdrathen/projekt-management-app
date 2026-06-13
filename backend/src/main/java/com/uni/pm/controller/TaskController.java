package com.uni.pm.controller;

import com.uni.pm.dto.CreateTaskRequest;
import com.uni.pm.dto.TaskDto;
import com.uni.pm.dto.UpdateTaskStatusRequest;
import com.uni.pm.model.User;
import com.uni.pm.service.TaskService;
import com.uni.pm.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/tasks")
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;

    public TaskController(TaskService taskService, UserService userService) {
        this.taskService = taskService;
        this.userService = userService;
    }

    private User getCurrentUser(UserDetails userDetails) {
        return userService.getByUsername(userDetails.getUsername());
    }

    @GetMapping
    public List<TaskDto> getTasks(@PathVariable Long projectId,
                                   @AuthenticationPrincipal UserDetails userDetails) {
        return taskService.getTasksForProject(projectId, getCurrentUser(userDetails));
    }

    @PostMapping
    public ResponseEntity<TaskDto> createTask(@PathVariable Long projectId,
                                               @RequestBody CreateTaskRequest request,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(taskService.createTask(projectId, request, getCurrentUser(userDetails)));
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long projectId, @PathVariable Long taskId,
                                               @RequestBody CreateTaskRequest request,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(taskService.updateTask(projectId, taskId, request, getCurrentUser(userDetails)));
    }

    @PatchMapping("/{taskId}/status")
    public ResponseEntity<TaskDto> updateTaskStatus(@PathVariable Long projectId, @PathVariable Long taskId,
                                                     @RequestBody UpdateTaskStatusRequest request,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                taskService.updateTaskStatus(projectId, taskId, request.getStatus(), getCurrentUser(userDetails)));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long projectId, @PathVariable Long taskId,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        taskService.deleteTask(projectId, taskId, getCurrentUser(userDetails));
        return ResponseEntity.noContent().build();
    }
}
