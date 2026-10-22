import { useState, useEffect, useMemo } from 'react'
import './App.css'

const API_URL = 'http://localhost:8080/api'

function App() {
  // 项目与任务数据（初始为空，页面加载后从后端拉取）
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [activeProjectId, setActiveProjectId] = useState(null)

  // 表单输入
  const [newProjectName, setNewProjectName] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newDueDate, setNewDueDate] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [collapsed, setCollapsed] = useState(false) // 侧边栏是否收起

  // 页面加载时，并行拉取项目和任务
  useEffect(() => {
    const load = async () => {
      try {
        const [projRes, taskRes] = await Promise.all([
          fetch(`${API_URL}/projects`),
          fetch(`${API_URL}/tasks`),
        ])
        if (!projRes.ok || !taskRes.ok) throw new Error('加载数据失败')
        const projData = await projRes.json()
        const taskData = await taskRes.json()
        setProjects(projData)
        setTasks(taskData)
        if (projData.length > 0) setActiveProjectId(projData[0].id)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const activeProject = projects.find((p) => p.id === activeProjectId)

  // 当前项目的任务（前端按 projectId 过滤）
  const currentProjectTasks = useMemo(
    () => tasks.filter((t) => t.projectId === activeProjectId),
    [tasks, activeProjectId]
  )

  // 新增项目
  const handleAddProject = async (e) => {
    e.preventDefault()
    if (!newProjectName.trim()) return
    setError('')
    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName.trim(), icon: '📁' }),
      })
      if (!res.ok) throw new Error('新建项目失败')
      const created = await res.json()
      setProjects((prev) => [...prev, created])
      setActiveProjectId(created.id)
      setNewProjectName('')
    } catch (err) {
      setError(err.message)
    }
  }

  // 新增任务（自动归属到当前项目）
  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !activeProjectId) return
    setError('')
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          status: 'TODO',
          dueDate: newDueDate || null,
          projectId: activeProjectId,
        }),
      })
      if (!res.ok) throw new Error('新增任务失败')
      const created = await res.json()
      setTasks((prev) => [...prev, created])
      setNewTitle('')
      setNewDueDate('')
    } catch (err) {
      setError(err.message)
    }
  }

  // 移动任务状态
  const moveTask = async (id, nextStatus) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    setError('')
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          status: nextStatus,
          dueDate: task.dueDate,
          projectId: task.projectId,
        }),
      })
      if (!res.ok) throw new Error('更新任务失败')
      const saved = await res.json()
      setTasks((prev) => prev.map((t) => (t.id === id ? saved : t)))
    } catch (err) {
      setError(err.message)
    }
  }

  // 删除任务
  const deleteTask = async (id) => {
    setError('')
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('删除任务失败')
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  // 删除项目（连带删除其下所有任务，后端已配置级联删除）
  const handleDeleteProject = async (id) => {
    const proj = projects.find((p) => p.id === id)
    if (!proj) return
    if (!window.confirm(`确定删除项目「${proj.name}」及其所有任务吗？`)) return
    setError('')
    try {
      const res = await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('删除项目失败')
      const remaining = projects.filter((p) => p.id !== id)
      setProjects(remaining)
      setTasks((prev) => prev.filter((t) => t.projectId !== id))
      if (activeProjectId === id) {
        setActiveProjectId(remaining.length > 0 ? remaining[0].id : null)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  // 计算截止时间紧急程度：overdue / soon / normal / done / none
  const getDueStatus = (dueDateStr, taskStatus) => {
    if (!dueDateStr) return { type: 'none', text: '无截止时间' }
    const due = new Date(dueDateStr)
    const now = new Date()
    const diffHours = (due - now) / (1000 * 60 * 60)

    const formatted = due.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    if (taskStatus === 'DONE') return { type: 'done', text: `已完成 · ${formatted}` }
    if (diffHours < 0) return { type: 'overdue', text: `已逾期 · ${formatted}` }
    if (diffHours <= 24) return { type: 'soon', text: `即将到期 (${Math.ceil(diffHours)}h内) · ${formatted}` }
    return { type: 'normal', text: `${formatted} 截止` }
  }

  // 统计当前项目里「已逾期」或「24小时内到期」的未完成任务数
  const urgentCount = useMemo(() => {
    return currentProjectTasks.filter((t) => {
      const type = getDueStatus(t.dueDate, t.status).type
      return type === 'overdue' || type === 'soon'
    }).length
  }, [currentProjectTasks])

  const columns = [
    { key: 'TODO', label: '待办', subtitle: 'To Do', dotClass: 'dot-todo' },
    { key: 'IN_PROGRESS', label: '进行中', subtitle: 'In Progress', dotClass: 'dot-progress' },
    { key: 'DONE', label: '已完成', subtitle: 'Done', dotClass: 'dot-done' },
  ]

  if (loading) {
    return (
      <div className="apple-workspace">
        <p className="status-msg">加载中...</p>
      </div>
    )
  }

  return (
    <div className={`apple-workspace ${collapsed ? 'collapsed' : ''}`}>
      {/* 左侧：macOS 风格磨砂玻璃项目侧边栏 */}
      <aside className="apple-sidebar">
        <div className="sidebar-section-title">工作区项目</div>
        <ul className="project-list">
          {projects.map((proj) => {
            const count = tasks.filter((t) => t.projectId === proj.id && t.status !== 'DONE').length
            return (
              <li
                key={proj.id}
                className={`project-item ${proj.id === activeProjectId ? 'active' : ''}`}
                onClick={() => setActiveProjectId(proj.id)}
              >
                <span className="project-name">
                  <span className="project-icon">{proj.icon}</span>
                  {proj.name}
                </span>
                <span className="project-item-right">
                  {count > 0 && <span className="project-count">{count}</span>}
                  <button
                    className="project-delete-btn"
                    title="删除项目"
                    onClick={(e) => {
                      e.stopPropagation() // 防止触发切换项目
                      handleDeleteProject(proj.id)
                    }}
                  >
                    ×
                  </button>
                </span>
              </li>
            )
          })}
        </ul>

        <form onSubmit={handleAddProject} className="new-project-form">
          <input
            type="text"
            placeholder="+ 新建项目空间..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
        </form>
      </aside>

      {/* 右侧：主看板画布 */}
      <main className="apple-main">
        <header className="main-header">
          <div className="header-left">
            <button
              className="sidebar-toggle"
              title={collapsed ? '展开侧边栏' : '收起侧边栏'}
              onClick={() => setCollapsed(!collapsed)}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {collapsed ? (
                  <polyline points="9 18 15 12 9 6" />
                ) : (
                  <polyline points="15 18 9 12 15 6" />
                )}
              </svg>
            </button>
            <div className="header-title-group">
              <h1>{activeProject ? `${activeProject.icon} ${activeProject.name}` : '看板'}</h1>
              <p className="header-subtitle">
                共 {currentProjectTasks.length} 个任务 · 每个项目独立流转
              </p>
            </div>
          </div>

          {urgentCount > 0 && (
            <div className="reminder-banner">
              <span className="pulse-dot"></span>
              <span>
                当前项目有 <strong>{urgentCount}</strong> 项任务已逾期或将在 24 小时内到期
              </span>
            </div>
          )}
        </header>

        {error && <p className="status-msg error">出错了：{error}</p>}

        {/* 毛玻璃任务创建栏 */}
        <form onSubmit={handleAddTask} className="glass-task-creator">
          <input
            type="text"
            className="task-input-title"
            placeholder={activeProject ? `在「${activeProject.name}」中添加新任务...` : '请先创建一个项目'}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <div className="creator-controls">
            <label className="date-picker-label">
              <span>⏰ 截止提醒：</span>
              <input
                type="datetime-local"
                className="task-input-date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </label>
            <button type="submit" className="apple-primary-btn">新增卡片</button>
          </div>
        </form>

        {/* 三列看板网格 */}
        <div className="kanban-grid">
          {columns.map((col) => {
            const colTasks = currentProjectTasks.filter((t) => t.status === col.key)
            return (
              <div key={col.key} className="glass-column">
                <div className="column-header">
                  <div className="column-title-wrap">
                    <span className={`status-dot ${col.dotClass}`}></span>
                    <h2>{col.label}</h2>
                    <span className="column-subtitle">{col.subtitle}</span>
                  </div>
                  <span className="column-badge">{colTasks.length}</span>
                </div>

                <div className="card-stack">
                  {colTasks.length === 0 ? (
                    <div className="empty-column-hint">暂无{col.label}任务</div>
                  ) : (
                    colTasks.map((task) => {
                      const dueInfo = getDueStatus(task.dueDate, task.status)
                      return (
                        <div key={task.id} className="glass-card">
                          <div className="card-top">
                            <span className={`due-badge due-${dueInfo.type}`}>
                              {dueInfo.type === 'overdue' && '⚠️ '}
                              {dueInfo.type === 'soon' && '⏳ '}
                              {dueInfo.type === 'done' && '✓ '}
                              {dueInfo.text}
                            </span>
                            <button
                              className="icon-delete-btn"
                              onClick={() => deleteTask(task.id)}
                              title="删除任务"
                            >
                              ×
                            </button>
                          </div>

                          <p className={`card-title ${task.status === 'DONE' ? 'title-done' : ''}`}>
                            {task.title}
                          </p>

                          <div className="card-footer">
                            {col.key !== 'TODO' && (
                              <button
                                className="pill-action-btn"
                                onClick={() => moveTask(task.id, col.key === 'DONE' ? 'IN_PROGRESS' : 'TODO')}
                              >
                                ← 移回上一步
                              </button>
                            )}
                            {col.key !== 'DONE' && (
                              <button
                                className="pill-action-btn primary-pill"
                                onClick={() => moveTask(task.id, col.key === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                              >
                                推进下一步 →
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default App
