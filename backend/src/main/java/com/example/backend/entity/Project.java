package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

/**
 * 项目实体（Entity）：对应数据库里的 project 表。
 * 一个项目下面有多个任务 —— 这就是「一对多」关系（One-to-Many）。
 */
@Entity
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // 项目名称

    private String icon; // 项目图标（emoji）

    // 一对多：一个项目对应多个任务
    // mappedBy 表示「多」的那一方（Task.project）是关系的维护者
    // cascade = ALL 表示删除项目时，连带删除它下面的所有任务
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // 序列化成 JSON 时不展开任务列表，避免循环引用
    private List<Task> tasks = new ArrayList<>();

    public Project() {
    }

    public Project(String name, String icon) {
        this.name = name;
        this.icon = icon;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public List<Task> getTasks() {
        return tasks;
    }

    public void setTasks(List<Task> tasks) {
        this.tasks = tasks;
    }
}
