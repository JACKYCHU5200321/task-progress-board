package com.example.backend.controller;

import com.example.backend.entity.Project;
import com.example.backend.repository.ProjectRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 项目接口：负责项目的增、查、删。
 */
@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class ProjectController {

    private final ProjectRepository repository;

    public ProjectController(ProjectRepository repository) {
        this.repository = repository;
    }

    // 查：获取所有项目  GET /api/projects
    @GetMapping
    public List<Project> getAllProjects() {
        return repository.findAll();
    }

    // 增：新建项目  POST /api/projects
    @PostMapping
    public Project createProject(@RequestBody Project project) {
        return repository.save(project);
    }

    // 删：删除项目（会连带删除其下所有任务）  DELETE /api/projects/{id}
    @DeleteMapping("/{id}")
    public void deleteProject(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
