import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Task, TaskCategory, Priority } from '../types';
import './Tasks.css';

export const Tasks: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompleted } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
   const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('12:00');
  const [reminder, setReminder] = useState(true);

  const categories = ['All', 'Work', 'Personal', 'Fitness', 'Health', 'Errands'];

  const openCreateModal = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setCategory('Work');
    setPriority('medium');
    setDueDate(new Date().toISOString().split('T')[0]);
    setDueTime('12:00');
    setReminder(true);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setCategory(task.category);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setDueTime(task.dueTime || '12:00');
    setReminder(task.reminder);
    setIsModalOpen(true);
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        dueDate,
        dueTime,
        reminder,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        dueDate,
        dueTime,
        completed: false,
        reminder,
      });
    }

    setIsModalOpen(false);
  };

  // Filter tasks based on tabs, category & search
  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'pending' && t.completed) return false;
    if (activeTab === 'completed' && !t.completed) return false;
    if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q) ?? false;
      return matchTitle || matchDesc;
    }
    return true;
  });

  return (
    <div className="tasks-page-container">
      {/* Page Header */}
      <header className="tasks-header">
        <div>
          <h1 className="tasks-main-title">Task Management</h1>
          <p className="tasks-subtext">Organize, track priorities, and stay in control of your daily agenda.</p>
        </div>
        <button type="button" className="add-task-btn" onClick={openCreateModal}>
          <span className="material-symbols-outlined">add_task</span>
          <span>Add New Task</span>
        </button>
      </header>

      {/* Control Bar: Search & Status Tabs */}
      <div className="tasks-control-bar">
        {/* Status Tabs */}
        <div className="task-status-tabs">
          <button
            type="button"
            className={`status-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            type="button"
            className={`status-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({tasks.filter((t) => !t.completed).length})
          </button>
          <button
            type="button"
            className={`status-tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed ({tasks.filter((t) => t.completed).length})
          </button>
        </div>

        {/* Search Input */}
        <div className="task-search-wrapper">
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            type="text"
            className="task-search-input"
            placeholder="Search tasks by name or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="category-pills-row">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="task-cards-stream">
        {filteredTasks.length === 0 ? (
          <div className="empty-tasks-placeholder">
            <span className="material-symbols-outlined empty-icon">task_alt</span>
            <h3 className="empty-title">No tasks found</h3>
            <p className="empty-desc">
              {searchQuery
                ? 'Try adjusting your search query or filters.'
                : 'All caught up! Add a new task to continue your flow.'}
            </p>
            <button type="button" className="empty-add-btn" onClick={openCreateModal}>
              Create a Task
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`task-card-item ${task.completed ? 'is-completed' : ''} priority-border-${task.priority}`}
            >
              <div className="task-left-section">
                <button
                  type="button"
                  className={`task-checkbox-btn ${task.completed ? 'checked' : ''}`}
                  onClick={() => toggleTaskCompleted(task.id)}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark completed'}
                >
                  {task.completed && (
                    <span className="material-symbols-outlined">check</span>
                  )}
                </button>

                <div className="task-details-col">
                  <div className="task-top-line">
                    <h3 className="task-item-title">{task.title}</h3>
                    <span className={`priority-badge priority-${task.priority}`}>
                      {task.priority} priority
                    </span>
                  </div>

                  {task.description && (
                    <p className="task-item-description">{task.description}</p>
                  )}

                  <div className="task-bottom-meta">
                    <span className="meta-badge category-pill-tag">
                      <span className="material-symbols-outlined">label</span>
                      {task.category}
                    </span>
                    <span className="meta-badge date-pill-tag">
                      <span className="material-symbols-outlined">event</span>
                      {task.dueDate} {task.dueTime ? `@ ${task.dueTime}` : ''}
                    </span>
                    {task.reminder && (
                      <span className="meta-badge reminder-active-tag">
                        <span className="material-symbols-outlined">notifications_active</span>
                        Reminder
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="task-card-actions">
                <button
                  type="button"
                  className="icon-action-btn edit-btn"
                  title="Edit task"
                  onClick={() => openEditModal(task)}
                >
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button
                  type="button"
                  className="icon-action-btn delete-btn"
                  title="Delete task"
                  onClick={() => deleteTask(task.id)}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingTaskId ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="task-form">
              <div className="modal-form-group">
                <label className="modal-label">Task Title *</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g., Update sprint review deck"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">Description / Notes</label>
                <textarea
                  className="modal-textarea"
                  rows={3}
                  placeholder="Additional context or checklist items..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="modal-row-split">
                <div className="modal-form-group">
                  <label className="modal-label">Category</label>
                  <select
                    className="modal-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
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
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="modal-row-split">
                <div className="modal-form-group">
                  <label className="modal-label">Due Date</label>
                  <input
                    type="date"
                    className="modal-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-form-group">
                  <label className="modal-label">Time</label>
                  <input
                    type="time"
                    className="modal-input"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-checkbox-row">
                <label className="checkbox-control">
                  <input
                    type="checkbox"
                    checked={reminder}
                    onChange={(e) => setReminder(e.target.checked)}
                  />
                  <span>Send notification reminder for this task</span>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-btn submit-modal-btn">
                  {editingTaskId ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
