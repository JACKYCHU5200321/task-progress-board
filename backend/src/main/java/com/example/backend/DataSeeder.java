package com.example.backend;

import com.example.backend.entity.Project;
import com.example.backend.entity.Task;
import com.example.backend.repository.ProjectRepository;
import com.example.backend.repository.TaskRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 数据种子：应用启动后，如果数据库是空的，就插入几个示例项目 + 任务，
 * 方便第一次打开就能看到「多项目切换」和「截止时间预警」效果。
 * 已存在数据时不会重复插入。
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public DataSeeder(ProjectRepository projectRepository, TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    @Override
    public void run(String... args) {
        if (projectRepository.count() > 0) {
            return; // 已经有数据，跳过
        }

        Project p1 = projectRepository.save(new Project("全栈看板开发", "💻"));
        Project p2 = projectRepository.save(new Project("AI 智能体研究", "✨"));
        Project p3 = projectRepository.save(new Project("个人生活与健身", "🌱"));

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
        LocalDateTime now = LocalDateTime.now();

        taskRepository.save(new Task("设计 Apple 磨砂玻璃 UI 界面", "DONE", now.minusHours(5).format(fmt), p1));
        taskRepository.save(new Task("完成多项目切换与截止时间预警", "IN_PROGRESS", now.plusHours(6).format(fmt), p1));
        taskRepository.save(new Task("搭建 Spring Boot 后端与 H2 数据库", "TODO", now.minusHours(3).format(fmt), p1));
        taskRepository.save(new Task("设计 AI 拆解子任务的 Prompt 模板", "TODO", now.plusHours(48).format(fmt), p2));
    }
}
