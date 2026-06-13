package com.uni.pm.controller;

import com.uni.pm.dto.CreateProjectRequest;
import com.uni.pm.dto.ProjectDto;
import com.uni.pm.dto.UserDto;
import com.uni.pm.model.User;
import com.uni.pm.service.ProjectService;
import com.uni.pm.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final UserService userService;

    public ProjectController(ProjectService projectService, UserService userService) {
        this.projectService = projectService;
        this.userService = userService;
    }

    private User getCurrentUser(UserDetails userDetails) {
        return userService.getByUsername(userDetails.getUsername());
    }

    @GetMapping
    public List<ProjectDto> getProjects(@AuthenticationPrincipal UserDetails userDetails) {
        return projectService.getProjectsForUser(getCurrentUser(userDetails));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProject(@PathVariable Long id,
                                                  @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(projectService.getProject(id, getCurrentUser(userDetails)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ProjectDto> createProject(@RequestBody CreateProjectRequest request,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(projectService.createProject(request, getCurrentUser(userDetails)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long id,
                                                     @RequestBody CreateProjectRequest request,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(projectService.updateProject(id, request, getCurrentUser(userDetails)));
    }

    @PatchMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ProjectDto> archiveProject(@PathVariable Long id,
                                                      @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(projectService.archiveProject(id, getCurrentUser(userDetails)));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<UserDto>> getMembers(@PathVariable Long id,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(projectService.getMembers(id, getCurrentUser(userDetails)));
    }

    @PostMapping("/{id}/members/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<Void> addMember(@PathVariable Long id, @PathVariable Long userId,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        projectService.addMember(id, userId, getCurrentUser(userDetails));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<Void> removeMember(@PathVariable Long id, @PathVariable Long userId,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        projectService.removeMember(id, userId, getCurrentUser(userDetails));
        return ResponseEntity.noContent().build();
    }
}
