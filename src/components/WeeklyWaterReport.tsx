import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import './WeeklyWaterReport.css';

interface DailyDetail {
  dayOfWeek: string;
  date: string;
  amountMl: number;
  goalMl: number;
  percentageAchieved: number;
  goalMet: boolean;
  logCount: number;
}

interface WeeklyWaterReportData {
  weekStartDate: string;
  weekEndDate: string;
  totalIntakeMl: number;
  averageDailyIntakeMl: number;
  dailyGoalMl: number;
  daysGoalMet: number;
  bestDayIntakeMl: number;
  bestDayName: string;
  lowestDayIntakeMl: number;
  lowestDayName: string;
  previousWeekTotalMl: number | null;
  weekOverWeekChangePercent: number | null;
  dailyDetails: DailyDetail[];
}

export const WeeklyWaterReport: React.FC = () => {
  const { setCurrentScreen, showToast } = useApp();
  const [reportDate, setReportDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<WeeklyWaterReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReport = async (dateStr: string) => {
    setLoading(true);
    try {
      const data = await api.getWeeklyWaterReport(dateStr);
      setReport(data);
    } catch {
      showToast('Could not load weekly water report');
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
    let csv = 'Day,Date,Intake (ml),Daily Goal (ml),Achieved (%),Goal Met,Log Entries\n';
    report.dailyDetails.forEach((d) => {
      csv += `${d.dayOfWeek},${d.date},${d.amountMl},${d.goalMl},${d.percentageAchieved}%,${d.goalMet ? 'Yes' : 'No'},${d.logCount}\n`;
    });
    csv += `\nTotal Intake,${report.totalIntakeMl} ml\nDaily Average,${report.averageDailyIntakeMl} ml\nDays Met Goal,${report.daysGoalMet} of 7\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DayFlow_Water_Report_${report.weekStartDate}_to_${report.weekEndDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="weekly-report-page">
      {/* Header Bar */}
      <header className="report-header">
        <div className="header-titles">
          <div className="breadcrumb-row">
            <button type="button" className="breadcrumb-back" onClick={() => setCurrentScreen('water')}>
              ← Back to Hydration
            </button>
            <span className="badge-live">Weekly Analytics</span>
          </div>
          <h1 className="report-main-title">Weekly Hydration Report</h1>
          <p className="report-subtext">
            Monday to Sunday comprehensive intake logs, daily goal attainment, and trend analysis.
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
          <p>Calculating weekly hydration performance...</p>
        </div>
      ) : report ? (
        <>
          {/* Top 4 Stat Cards */}
          <section className="report-metrics-grid">
            <div className="report-stat-card">
              <div className="stat-icon-wrapper water-blue">
                <span className="material-symbols-outlined">water_drop</span>
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Water Consumed</span>
                <span className="stat-value">{(report.totalIntakeMl / 1000).toFixed(2)} L</span>
                <span className="stat-sub">{report.totalIntakeMl} ml total</span>
              </div>
            </div>

            <div className="report-stat-card">
              <div className="stat-icon-wrapper water-teal">
                <span className="material-symbols-outlined">speed</span>
              </div>
              <div className="stat-content">
                <span className="stat-label">Daily Average Intake</span>
                <span className="stat-value">{report.averageDailyIntakeMl} ml</span>
                <span className="stat-sub">Goal: {report.dailyGoalMl} ml / day</span>
              </div>
            </div>

            <div className="report-stat-card">
              <div className="stat-icon-wrapper water-emerald">
                <span className="material-symbols-outlined">verified</span>
              </div>
              <div className="stat-content">
                <span className="stat-label">Days Goal Met</span>
                <span className="stat-value">{report.daysGoalMet} <span className="stat-max">/ 7 days</span></span>
                <span className="stat-sub">{Math.round((report.daysGoalMet / 7) * 100)}% consistency</span>
              </div>
            </div>

            <div className="report-stat-card">
              <div className="stat-icon-wrapper water-indigo">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <div className="stat-content">
                <span className="stat-label">Week-over-Week Change</span>
                <span className="stat-value">
                  {report.weekOverWeekChangePercent !== null
                    ? `${report.weekOverWeekChangePercent > 0 ? '+' : ''}${report.weekOverWeekChangePercent}%`
                    : 'Baseline'}
                </span>
                <span className="stat-sub">
                  {report.previousWeekTotalMl !== null && report.previousWeekTotalMl > 0
                    ? `Prev week: ${(report.previousWeekTotalMl / 1000).toFixed(1)} L`
                    : 'First week recorded'}
                </span>
              </div>
            </div>
          </section>

          {/* Daily Intake Breakdown Chart & Summary Details */}
          <section className="report-main-grid">
            {/* Visual Bar Comparison */}
            <div className="report-card chart-card">
              <div className="card-header-line">
                <h3 className="card-heading">Daily Intake vs Target</h3>
                <span className="target-indicator">
                  <span className="target-line-legend" /> Target: {report.dailyGoalMl} ml
                </span>
              </div>

              <div className="water-bars-chart">
                {report.dailyDetails.map((day) => {
                  const maxDisplay = Math.max(report.dailyGoalMl * 1.25, 3000);
                  const barHeight = Math.min(100, Math.round((day.amountMl / maxDisplay) * 100));
                  const targetPosition = Math.min(100, Math.round((day.goalMl / maxDisplay) * 100));

                  return (
                    <div key={day.date} className="chart-bar-col">
                      <span className="bar-top-value">{day.amountMl > 0 ? `${day.amountMl}` : '0'}</span>
                      <div className="bar-track">
                        <div
                          className="target-threshold-marker"
                          style={{ bottom: `${targetPosition}%` }}
                          title={`Target: ${day.goalMl} ml`}
                        />
                        <div
                          className={`bar-fill ${day.goalMet ? 'goal-surpassed' : ''}`}
                          style={{ height: `${barHeight}%` }}
                        />
                      </div>
                      <span className="bar-label">{day.dayOfWeek}</span>
                      <span className="bar-subdate">{day.date.split('-')[2]}</span>
                    </div>
                  );
                })}
              </div>

              <div className="chart-footer-note">
                <span className="material-symbols-outlined info-icon">info</span>
                <span>
                  Missing data represents zero recorded drinks for that day. Peak intake was in <strong>{report.bestDayName}</strong> with {report.bestDayIntakeMl} ml.
                </span>
              </div>
            </div>

            {/* Daily Detailed Table */}
            <div className="report-card table-card">
              <h3 className="card-heading">7-Day Log Audit</h3>
              <div className="table-responsive">
                <table className="daily-audit-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Date</th>
                      <th>Intake</th>
                      <th>Goal Progress</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.dailyDetails.map((d) => (
                      <tr key={d.date}>
                        <td className="fw-bold">{d.dayOfWeek}</td>
                        <td className="text-muted">{d.date}</td>
                        <td>{d.amountMl} ml</td>
                        <td>
                          <div className="table-progress-row">
                            <div className="table-bar-track">
                              <div
                                className={`table-bar-fill ${d.goalMet ? 'met' : ''}`}
                                style={{ width: `${Math.min(100, d.percentageAchieved)}%` }}
                              />
                            </div>
                            <span className="table-pct">{d.percentageAchieved}%</span>
                          </div>
                        </td>
                        <td>
                          {d.goalMet ? (
                            <span className="pill-badge pill-success">Goal Met</span>
                          ) : d.amountMl > 0 ? (
                            <span className="pill-badge pill-warning">Partial</span>
                          ) : (
                            <span className="pill-badge pill-neutral">No Logs</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="report-loading-state">
          <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#94a3b8' }}>error</span>
          <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)' }}>Unable to load water report data. Please check connection and try again.</p>
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

export default WeeklyWaterReport;
