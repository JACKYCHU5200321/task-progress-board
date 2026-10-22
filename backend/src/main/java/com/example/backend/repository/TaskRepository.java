package com.example.backend.repository;

import com.example.backend.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 任务数据访问层：继承 JpaRepository 后自动拥有增删改查能力。
 */
public interface TaskRepository extends JpaRepository<Task, Long> {

    // 按项目查询任务。方法名里的下划线 _ 表示「穿过 project 关系，取它的 id」，
    // 会生成 SQL：SELECT * FROM task WHERE project_id = ?
    // （不能写 findByProjectId，因为 Task 里有个 getProjectId() 方法，会引发歧义）
    List<Task> findByProject_Id(Long projectId);
}
