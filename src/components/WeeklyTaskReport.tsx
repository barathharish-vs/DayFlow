import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import './WeeklyTaskReport.css';

interface DailyWorkload {
  dayOfWeek: string;
  date: string;
  tasksDue: number;
  tasksCompleted: number;
}

interface PriorityBreakdown {
  low: number;
  medium: number;
  high: number;
}

interface TaskItem {
  id: string;
  title: string;
  category: string;
  priority: string;
  dueDate: string;
  dueTime?: string;
  completed: boolean;
  completedAt?: string;
}

interface WeeklyTaskReportData {
  weekStartDate: string;
  weekEndDate: string;
  totalTasksDue: number;
  tasksCompleted: number;
  tasksPending: number;
  tasksOverdue: number;
  completionRate: number;
  completedOnTime: number;
  completedLate: number;
  previousWeekCompleted: number | null;
  priorityBreakdown: PriorityBreakdown;
  dailyWorkload: DailyWorkload[];
  completedTasks: TaskItem[];
  pendingTasks: TaskItem[];
}

export const WeeklyTaskReport: React.FC = () => {
  const { setCurrentScreen, showToast } = useApp();
  const [reportDate, setReportDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<WeeklyTaskReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReport = async (dateStr: string) => {
    setLoading(true);
    try {
      const data = await api.getWeeklyTaskReport(dateStr);
      setReport(data);
    } catch {
      showToast('Could not load weekly task report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(reportDate);
  }, [reportDate]);

  const handlePrevWeek = () => {
    const cur = new Date(reportDate);
    cur.setDate(cur.getDate() - 7);
    setReportDate(cur.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const cur = new Date(reportDate);
    cur.setDate(cur.getDate() + 7);
    const today = new Date();
    if (cur > today) {
      setReportDate(today.toISOString().split('T')[0]);
    } else {
      setReportDate(cur.toISOString().split('T')[0]);
    }
  };

  const isCurrentWeek = (): boolean => {
    if (!report) return true;
    const today = new Date().toISOString().split('T')[0];
    return today >= report.weekStartDate && today <= report.weekEndDate;
  };

  const exportCSV = () => {
    if (!report) return;
    let csv = 'Day,Date,Tasks Due,Tasks Completed\n';
    report.dailyWorkload.forEach((d) => {
      csv += `${d.dayOfWeek},${d.date},${d.tasksDue},${d.tasksCompleted}\n`;
    });
    csv += `\nTotal Tasks Due,${report.totalTasksDue}\nTasks Completed,${report.tasksCompleted}\nCompletion Rate,${report.completionRate}%\nTasks Overdue,${report.tasksOverdue}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DayFlow_Task_Report_${report.weekStartDate}_to_${report.weekEndDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="weekly-task-report-page">
      {/* Header Bar */}
      <header className="report-header">
        <div className="header-titles">
          <div className="breadcrumb-row">
            <button type="button" className="breadcrumb-back" onClick={() => setCurrentScreen('tasks')}>
              ← Back to Tasks
            </button>
            <span className="badge-live purple-badge">Productivity Analytics</span>
          </div>
          <h1 className="report-main-title">Weekly To-Do Report</h1>
          <p className="report-subtext">
            Performance metrics, deadline workload, completion breakdown, and overdue audits.
          </p>
        </div>

        <div className="report-header-actions">
          <button type="button" className="btn-secondary" onClick={exportCSV} title="Export CSV file">
            <span className="material-symbols-outlined">download</span>
            <span>Export CSV</span>
          </button>
          <button type="button" className="btn-secondary" onClick={() => window.print()} title="Print or save as PDF">
            <span className="material-symbols-outlined">print</span>
            <span>Print Report</span>
          </button>
        </div>
      </header>

      {/* Week Selector Bar */}
      <div className="week-selector-bar">
        <button type="button" className="week-nav-btn" onClick={handlePrevWeek} title="Previous Week">
          <span className="material-symbols-outlined">chevron_left</span>
          <span>Previous Week</span>
        </button>

        <div className="week-range-display">
          <span className="material-symbols-outlined">calendar_month</span>
          <span className="range-text">
            {report ? `${report.weekStartDate}  —  ${report.weekEndDate}` : 'Loading week...'}
          </span>
          {isCurrentWeek() && <span className="current-week-tag">Current Week</span>}
        </div>

        <button
          type="button"
          className="week-nav-btn"
          onClick={handleNextWeek}
          disabled={isCurrentWeek()}
          title={isCurrentWeek() ? 'Cannot view future weeks' : 'Next Week'}
        >
          <span>Next Week</span>
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      {loading ? (
        <div className="report-loading-state">
          <span className="material-symbols-outlined spinner">progress_activity</span>
          <p>Calculating weekly productivity metrics...</p>
        </div>
      ) : report ? (
        <>
          {/* Top 4 Stat Cards */}
          <section className="report-metrics-grid">
            <div className="report-stat-card">
              <div className="stat-icon-wrapper task-purple">
                <span className="material-symbols-outlined">format_list_bulleted</span>
              </div>
              <div className="stat-content">
                <span className="stat-label">Tasks Due This Week</span>
                <span className="stat-value">{report.totalTasksDue}</span>
                <span className="stat-sub">{report.tasksPending} currently pending</span>
              </div>
            </div>

            <div className="report-stat-card">
              <div className="stat-icon-wrapper task-green">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div className="stat-content">
                <span className="stat-label">Completion Rate</span>
                <span className="stat-value">{report.completionRate}%</span>
                <span className="stat-sub">{report.tasksCompleted} of {report.totalTasksDue} resolved</span>
              </div>
            </div>

            <div className="report-stat-card">
              <div className="stat-icon-wrapper task-blue">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <div className="stat-content">
                <span className="stat-label">On-Time Deliveries</span>
                <span className="stat-value">{report.completedOnTime}</span>
                <span className="stat-sub">{report.completedLate} completed after deadline</span>
              </div>
            </div>

            <div className="report-stat-card">
              <div className="stat-icon-wrapper task-amber">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div className="stat-content">
                <span className="stat-label">Overdue Tasks</span>
                <span className="stat-value">{report.tasksOverdue}</span>
                <span className="stat-sub">
                  {report.tasksOverdue > 0 ? 'Requires attention' : 'All clear!'}
                </span>
              </div>
            </div>
          </section>

          {/* Main 2-Column Section: Workload Bar Chart & Priority Breakdown */}
          <section className="report-main-grid">
            {/* Daily Workload Chart */}
            <div className="report-card chart-card">
              <div className="card-header-line">
                <h3 className="card-heading">Daily Workload & Deliveries</h3>
                <span className="legend-items">
                  <span className="legend-dot due-dot" /> Due
                  <span className="legend-dot done-dot" /> Done
                </span>
              </div>

              <div className="task-bars-chart">
                {report.dailyWorkload.map((day) => {
                  const maxTasks = Math.max(
                    ...report.dailyWorkload.map((d) => Math.max(d.tasksDue, d.tasksCompleted)),
                    5
                  );
                  const dueHeight = Math.min(100, Math.round((day.tasksDue / maxTasks) * 100));
                  const doneHeight = Math.min(100, Math.round((day.tasksCompleted / maxTasks) * 100));

                  return (
                    <div key={day.date} className="chart-bar-group">
                      <div className="dual-bars-track">
                        <div
                          className="sub-bar due-bar"
                          style={{ height: `${dueHeight}%` }}
                          title={`Due: ${day.tasksDue}`}
                        />
                        <div
                          className="sub-bar done-bar"
                          style={{ height: `${doneHeight}%` }}
                          title={`Completed: ${day.tasksCompleted}`}
                        />
                      </div>
                      <span className="bar-label">{day.dayOfWeek}</span>
                      <span className="bar-subdate">{day.date.split('-')[2]}</span>
                    </div>
                  );
                })}
              </div>

              <div className="priority-pills-row">
                <div className="priority-pill pill-high">
                  <span className="material-symbols-outlined">flag</span>
                  <span>{report.priorityBreakdown.high} High Priority</span>
                </div>
                <div className="priority-pill pill-med">
                  <span className="material-symbols-outlined">flag</span>
                  <span>{report.priorityBreakdown.medium} Medium Priority</span>
                </div>
                <div className="priority-pill pill-low">
                  <span className="material-symbols-outlined">flag</span>
                  <span>{report.priorityBreakdown.low} Low Priority</span>
                </div>
              </div>
            </div>

            {/* Resolved vs Pending Lists */}
            <div className="report-card lists-card">
              <h3 className="card-heading">Week Agenda Status</h3>

              <div className="agenda-section-title">
                <span>Completed Tasks ({report.completedTasks.length})</span>
              </div>
              <div className="agenda-tasks-list">
                {report.completedTasks.length === 0 ? (
                  <p className="empty-subtext">No completed tasks in this week's records.</p>
                ) : (
                  report.completedTasks.slice(0, 5).map((t) => (
                    <div key={t.id} className="agenda-task-item done">
                      <span className="material-symbols-outlined check-ico">check_circle</span>
                      <div className="agenda-task-info">
                        <span className="agenda-task-title">{t.title}</span>
                        <span className="agenda-task-meta">{t.category} • Due {t.dueDate}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="agenda-section-title mt-4">
                <span>Pending Tasks ({report.pendingTasks.length})</span>
              </div>
              <div className="agenda-tasks-list">
                {report.pendingTasks.length === 0 ? (
                  <p className="empty-subtext">All scheduled tasks completed!</p>
                ) : (
                  report.pendingTasks.slice(0, 5).map((t) => (
                    <div key={t.id} className="agenda-task-item pending">
                      <span className="material-symbols-outlined radio-ico">radio_button_unchecked</span>
                      <div className="agenda-task-info">
                        <span className="agenda-task-title">{t.title}</span>
                        <span className="agenda-task-meta">{t.category} • Due {t.dueDate}</span>
                      </div>
                      <span className={`priority-tiny-tag pri-${t.priority}`}>{t.priority}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="report-loading-state">
          <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#94a3b8' }}>error</span>
          <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)' }}>Unable to load task report data. Please check connection and try again.</p>
          <button
            type="button"
            className="btn-secondary"
            style={{ marginTop: '1rem' }}
            onClick={() => fetchReport(reportDate)}
          >
            <span className="material-symbols-outlined">refresh</span>
            <span>Retry</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default WeeklyTaskReport;
