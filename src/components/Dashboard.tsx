import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { TaskCategory, Priority } from '../types';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const {
    user,
    tasks,
    toggleTaskCompleted,
    todayWaterTotal,
    addWaterLog,
    weeklyWaterData,
    setCurrentScreen,
    addTask,
  } = useApp();

  const [isQuickTaskModalOpen, setIsQuickTaskModalOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState<TaskCategory>('Work');
  const [quickPriority, setQuickPriority] = useState<Priority>('medium');

  // Stats calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const overdueTasks = tasks.filter((t) => !t.completed && t.dueDate < todayStr).length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Today's Focus Tasks: Due today or pending priority, sorted by priority and due time
  const priorityWeight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
  const sortedFocusTasks = [...tasks]
    .filter((t) => !t.completed || t.dueDate === todayStr)
    .sort((a, b) => {
      // Pending first
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      // High priority first
      const pDiff = (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
      if (pDiff !== 0) return pDiff;
      // Due date/time
      return (a.dueDate + (a.dueTime || '99:99')).localeCompare(b.dueDate + (b.dueTime || '99:99'));
    });

  const waterGoal = user.dailyWaterGoal;
  const waterPercentage = Math.min(100, Math.round((todayWaterTotal / waterGoal) * 100));

  // Helper for dynamic time-based greeting based on device local time
  const getGreetingData = (): { text: string; icon: string } => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { text: 'Good morning', icon: '☀️' };
    } else if (hour >= 12 && hour < 17) {
      return { text: 'Good afternoon', icon: '🌤️' };
    } else if (hour >= 17 && hour < 21) {
      return { text: 'Good evening', icon: '🌆' };
    } else {
      return { text: 'Good night', icon: '🌙' };
    }
  };

  const [greeting, setGreeting] = useState(getGreetingData);
  const [currentDate, setCurrentDate] = useState(() => new Date());

  React.useEffect(() => {
    const updateTime = () => {
      setGreeting(getGreetingData());
      setCurrentDate(new Date());
    };

    // Update greeting immediately when browser tab becomes visible/active again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateTime();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Interval check every 30 seconds to catch greeting boundary changes cleanly
    const interval = setInterval(updateTime, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  // Today's formatted date
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(currentDate);

  const handleCreateQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      category: quickCategory,
      priority: quickPriority,
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
      reminder: true,
    });

    setQuickTitle('');
    setIsQuickTaskModalOpen(false);
  };

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <header className="dashboard-header">
        <div className="header-greeting">
          <h1 className="greeting-title">
            {greeting.text}{user?.name ? `, ${user.name.trim().split(' ')[0]}` : ''}! {greeting.icon}
          </h1>
          <span className="current-date-badge">{todayFormatted}</span>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="header-action-btn primary-action"
            onClick={() => setIsQuickTaskModalOpen(true)}
          >
            <span className="material-symbols-outlined">add</span>
            <span>New Task</span>
          </button>
        </div>
      </header>

      {/* Overview Stat Cards Grid */}
      <section className="stats-cards-grid">
        {/* Card 1: Tasks Progress */}
        <div className="stat-card" onClick={() => setCurrentScreen('tasks')}>
          <div className="stat-card-header">
            <div>
              <span className="stat-card-title">Tasks Completed</span>
              <div className="stat-metric-large">
                {completedTasks} <span className="stat-metric-sub">/ {totalTasks}</span>
              </div>
            </div>
            <div className="stat-card-icon icon-tasks">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill progress-tasks"
              style={{ width: `${taskCompletionRate}%` }}
            />
          </div>
          <div className="stat-card-footer">
            <span className="trend-badge positive">
              <span className="material-symbols-outlined">trending_up</span>
              {taskCompletionRate}% done today
            </span>
            {overdueTasks > 0 ? (
              <span className="card-link-hint" style={{ color: '#ef4444', fontWeight: 600 }}>
                ⚠️ {overdueTasks} overdue
              </span>
            ) : (
              <span className="card-link-hint">View Tasks →</span>
            )}
          </div>
        </div>

        {/* Card 2: Hydration Intake */}
        <div className="stat-card" onClick={() => setCurrentScreen('water')}>
          <div className="stat-card-header">
            <div>
              <span className="stat-card-title">Water Intake</span>
              <div className="stat-metric-large">
                {todayWaterTotal} <span className="stat-metric-sub">/ {waterGoal} ml</span>
              </div>
            </div>
            <div className="stat-card-icon icon-water">
              <span className="material-symbols-outlined">water_drop</span>
            </div>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill progress-water"
              style={{ width: `${waterPercentage}%` }}
            />
          </div>
          <div className="stat-card-footer">
            <span className={`trend-badge ${waterPercentage >= 80 ? 'positive' : 'neutral'}`}>
              <span className="material-symbols-outlined">local_drink</span>
              {waterPercentage}% of daily goal
            </span>
            <span className="card-link-hint">Log Water →</span>
          </div>
        </div>

        {/* Card 3: Productivity Flow Score */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <span className="stat-card-title">Day Flow Index</span>
              <div className="stat-metric-large">
                {Math.round((taskCompletionRate + waterPercentage) / 2)}
                <span className="stat-metric-sub"> / 100</span>
              </div>
            </div>
            <div className="stat-card-icon icon-flow">
              <span className="material-symbols-outlined">bolt</span>
            </div>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill progress-flow"
              style={{ width: `${Math.round((taskCompletionRate + waterPercentage) / 2)}%` }}
            />
          </div>
          <div className="stat-card-footer">
            <span className="trend-badge positive">
              <span className="material-symbols-outlined">insights</span>
              Optimal Rhythm
            </span>
            <span className="card-link-hint">Keep Going!</span>
          </div>
        </div>
      </section>

      {/* Two Column Layout: Active Tasks & Water Quick-Log / Weekly Chart */}
      <div className="dashboard-main-grid">
        {/* Left Column: Today's Tasks */}
        <section className="dashboard-section tasks-section">
          <div className="section-header-row">
            <div className="section-title-group">
              <h2 className="section-heading">Today's Focus Tasks</h2>
              <span className="section-counter">{tasks.length} total</span>
            </div>
            <button
              type="button"
              className="section-text-btn"
              onClick={() => setCurrentScreen('tasks')}
            >
              See all
            </button>
          </div>

          <div className="task-items-list">
            {sortedFocusTasks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', padding: '1rem', textAlign: 'center' }}>
                🎉 All tasks completed or no tasks scheduled for today!
              </p>
            ) : (
              sortedFocusTasks.slice(0, 5).map((task) => {
                const isOverdue = !task.completed && task.dueDate < todayStr;
                return (
                  <div
                    key={task.id}
                    className={`task-row ${task.completed ? 'task-done' : ''}`}
                  >
                    <button
                      type="button"
                      className={`task-check-circle ${task.completed ? 'checked' : ''}`}
                      onClick={() => toggleTaskCompleted(task.id)}
                      aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {task.completed && (
                        <span className="material-symbols-outlined">check</span>
                      )}
                    </button>

                    <div className="task-row-content">
                      <div className="task-row-title-bar">
                        <span className="task-title-text">{task.title}</span>
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          {isOverdue && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                background: '#fee2e2',
                                color: '#b91c1c',
                                fontWeight: 600,
                              }}
                            >
                              Overdue
                            </span>
                          )}
                          <span className={`priority-tag priority-${task.priority}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      {task.description && (
                        <p className="task-desc-text">{task.description}</p>
                      )}
                      <div className="task-meta-bar">
                        <span className="meta-tag category-badge">{task.category}</span>
                        {task.dueTime && (
                          <span className="meta-tag time-badge">
                            <span className="material-symbols-outlined">schedule</span>
                            {task.dueTime}
                          </span>
                        )}
                        {task.reminder && (
                          <span className="meta-tag reminder-badge">
                            <span className="material-symbols-outlined">notifications_active</span>
                            Reminder on
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Column: Hydration Widget & Weekly Trend */}
        <section className="dashboard-section hydration-section">
          <div className="section-header-row">
            <div className="section-title-group">
              <h2 className="section-heading">Quick Water Log</h2>
              <span className="section-counter">{todayWaterTotal} ml today</span>
            </div>
            <button
              type="button"
              className="section-text-btn"
              onClick={() => setCurrentScreen('water')}
            >
              Details
            </button>
          </div>

          {/* Quick hydration buttons */}
          <div className="quick-hydrate-buttons">
            <button
              type="button"
              className="quick-drink-btn"
              onClick={() => addWaterLog(250, 'cup')}
            >
              <span className="material-symbols-outlined">local_cafe</span>
              <span className="drink-amt">+250 ml</span>
              <span className="drink-label">Small Glass</span>
            </button>
            <button
              type="button"
              className="quick-drink-btn"
              onClick={() => addWaterLog(500, 'bottle')}
            >
              <span className="material-symbols-outlined">water_bottle</span>
              <span className="drink-amt">+500 ml</span>
              <span className="drink-label">Full Bottle</span>
            </button>
            <button
              type="button"
              className="quick-drink-btn"
              onClick={() => addWaterLog(750, 'bottle')}
            >
              <span className="material-symbols-outlined">sports_bar</span>
              <span className="drink-amt">+750 ml</span>
              <span className="drink-label">Big Tumbler</span>
            </button>
          </div>

          {/* Weekly Mini Chart */}
          <div className="weekly-chart-box">
            <div className="chart-header">
              <span className="chart-title">7-Day Hydration History</span>
              <span className="chart-target">Target: {waterGoal} ml</span>
            </div>
            <div className="bar-chart-container">
              {weeklyWaterData.map((d, idx) => {
                const heightPercent = Math.min(100, Math.round((d.amount / d.goal) * 100));
                const isGoalReached = d.amount >= d.goal;
                return (
                  <div key={idx} className="chart-col">
                    <span className="bar-val">{(d.amount / 1000).toFixed(1)}L</span>
                    <div className="chart-bar-bg">
                      <div
                        className={`chart-bar-fill ${isGoalReached ? 'goal-reached' : ''}`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="chart-col-label">{d.day.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Quick Add Task Modal */}
      {isQuickTaskModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsQuickTaskModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Task</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsQuickTaskModalOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateQuickTask} className="quick-task-form">
              <div className="modal-form-group">
                <label className="modal-label">Task Title</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g., Prepare quarterly budget report"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="modal-row-split">
                <div className="modal-form-group">
                  <label className="modal-label">Category</label>
                  <select
                    className="modal-select"
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value as TaskCategory)}
                  >
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Health">Health</option>
                    <option value="Errands">Errands</option>
                  </select>
                </div>

                <div className="modal-form-group">
                  <label className="modal-label">Priority</label>
                  <select
                    className="modal-select"
                    value={quickPriority}
                    onChange={(e) => setQuickPriority(e.target.value as Priority)}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn cancel-btn"
                  onClick={() => setIsQuickTaskModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-btn submit-modal-btn">
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
