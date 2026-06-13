package com.uni.pm.dto;

import java.time.LocalDate;

public class ProjectDto {
    private Long id;
    private String name;
    private String description;
    private String status;
    private LocalDate createdAt;
    private UserDto owner;
    private int totalTasks;
    private int doneTasks;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
    public UserDto getOwner() { return owner; }
    public void setOwner(UserDto owner) { this.owner = owner; }
    public int getTotalTasks() { return totalTasks; }
    public void setTotalTasks(int totalTasks) { this.totalTasks = totalTasks; }
    public int getDoneTasks() { return doneTasks; }
    public void setDoneTasks(int doneTasks) { this.doneTasks = doneTasks; }
}
