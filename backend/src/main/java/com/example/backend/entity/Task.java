package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

/**
 * 任务实体（Entity）：对应数据库里的 task 表。
 * 每个任务属于某一个项目（多对一关系 Many-to-One）。
 */
@Entity
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;   // 任务标题

    private String status;  // 任务状态：TODO / IN_PROGRESS / DONE

    // 截止时间（存成字符串 "yyyy-MM-dd'T'HH:mm"，与前端 datetime-local 输入格式一致）
    // 这里用 String 是为了简单，日期计算都放在前端做；进阶时可以换成 LocalDateTime
    private String dueDate;

    // 多对一：多个任务属于同一个项目
    // project_id 就是数据库里的外键列
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    @JsonIgnore // 序列化时不展开整个 project 对象，避免循环引用
    private Project project;

    public Task() {
    }

    public Task(String title, String status, String dueDate, Project project) {
        this.title = title;
        this.status = status;
        this.dueDate = dueDate;
        this.project = project;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDueDate() {
        return dueDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    // 输出给前端时，把 project 的 id 暴露成 projectId，方便前端按项目过滤
    public Long getProjectId() {
        return project != null ? project.getId() : null;
    }
}
