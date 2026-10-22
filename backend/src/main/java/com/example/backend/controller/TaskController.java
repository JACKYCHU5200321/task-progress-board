package com.example.backend.controller;

import com.example.backend.entity.Project;
import com.example.backend.entity.Task;
import com.example.backend.repository.ProjectRepository;
import com.example.backend.repository.TaskRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 任务接口：负责任务的增删改查（CRUD）。
 */
@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public TaskController(TaskRepository taskRepository, ProjectRepository projectRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
    }

    // 查：获取任务，支持 ?projectId=1 按项目过滤  GET /api/tasks
    @GetMapping
    public List<Task> getTasks(@RequestParam(required = false) Long projectId) {
        if (projectId != null) {
            return taskRepository.findByProject_Id(projectId);
        }
        return taskRepository.findAll();
    }

    // 增：新增任务  POST /api/tasks
    @PostMapping
    public Task createTask(@RequestBody TaskRequest req) {
        Project project = projectRepository.findById(req.projectId())
                .orElseThrow(() -> new RuntimeException("项目不存在：" + req.projectId()));
        Task task = new Task(req.title(), req.status(), normalizeDue(req.dueDate()), project);
        return taskRepository.save(task);
    }

    // 改：更新任务（移动状态 / 改标题 / 改截止时间）  PUT /api/tasks/{id}
    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody TaskRequest req) {
        return taskRepository.findById(id).map(existing -> {
            existing.setTitle(req.title());
            existing.setStatus(req.status());
            existing.setDueDate(normalizeDue(req.dueDate()));
            if (req.projectId() != null) {
                Project project = projectRepository.findById(req.projectId())
                        .orElseThrow(() -> new RuntimeException("项目不存在：" + req.projectId()));
                existing.setProject(project);
            }
            return taskRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("任务不存在：" + id));
    }

    // 删：删除任务  DELETE /api/tasks/{id}
    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskRepository.deleteById(id);
    }

    // 空字符串统一转成 null（前端未选截止时间时传空）
    private String normalizeDue(String dueDate) {
        return (dueDate == null || dueDate.isBlank()) ? null : dueDate;
    }
}
