package com.example.backend.controller;

/**
 * 新增 / 更新任务时的请求体 DTO。
 * 前端会发送 { title, status, dueDate, projectId }，
 * 这里用 record（Java 16+ 的轻量数据类）来接收。
 */
public record TaskRequest(
        String title,
        String status,
        String dueDate,
        Long projectId
) {
}
