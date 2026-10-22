package com.example.backend.repository;

import com.example.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 项目数据访问层：继承 JpaRepository 后自动拥有增删改查能力。
 */
public interface ProjectRepository extends JpaRepository<Project, Long> {
}
