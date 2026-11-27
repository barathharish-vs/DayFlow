import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { WaterLog } from '../types';
import './WaterTracker.css';

export const WaterTracker: React.FC = () => {
  const {
    user,
    updateUser,
    todayWaterTotal,
    addWaterLog,
    waterLogs,
    deleteWaterLog,
    resetTodayWater,
    weeklyWaterData,
  } = useApp();

  const [customAmount, setCustomAmount] = useState<string>('');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState<number>(user.dailyWaterGoal);

  const goal = user.dailyWaterGoal;
  const percentage = Math.min(100, Math.round((todayWaterTotal / goal) * 100));
  const remaining = Math.max(0, goal - todayWaterTotal);

  // SVG circular calculations
  const radius = 96;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customAmount, 10);
    if (!isNaN(val) && val > 0) {
      addWaterLog(val, 'custom');
      setCustomAmount('');
    }
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempGoal >= 500 && tempGoal <= 6000) {
      updateUser({ dailyWaterGoal: tempGoal });
      setIsEditingGoal(false);
    }
  };

  const getContainerIcon = (type: WaterLog['containerType']) => {
    switch (type) {
      case 'cup':
        return 'local_cafe';
      case 'bottle':
        return 'water_bottle';
      case 'glass':
        return 'water_full';
      default:
        return 'water_drop';
    }
  };

  return (
    <div className="water-tracker-container">
      {/* Page Header */}
      <header className="water-header">
        <div>
          <h1 className="water-title">Hydration Tracker</h1>
          <p className="water-subtitle">Maintain steady hydration throughout your workday for peak focus.</p>
        </div>
        <div className="water-header-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              if (window.confirm("Are you sure you want to reset today's water logs?")) {
                resetTodayWater();
              }
            }}
          >
            <span className="material-symbols-outlined">restart_alt</span>
            <span>Reset Today</span>
          </button>
        </div>
      </header>

      {/* Main Hydration Progress Card */}
      <div className="water-hero-card">
        {/* Left Side: Circular Gauge */}
        <div className="gauge-wrapper">
          <svg className="progress-ring" width="230" height="230">
            <circle
              className="progress-ring-bg"
              stroke="#e0f2fe"
              strokeWidth="16"
              fill="transparent"
              r={radius}
              cx="115"
              cy="115"
            />
            <circle
              className="progress-ring-circle"
              stroke="url(#waterGradient)"
              strokeWidth="16"
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="115"
              cy="115"
            />
            <defs>
              <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Metric in Gauge */}
          <div className="gauge-center-content">
            <span className="gauge-icon material-symbols-outlined">water_drop</span>
            <span className="gauge-amount">{todayWaterTotal}</span>
            <span className="gauge-unit">/ {goal} ml</span>
            <span className="gauge-percent-tag">{percentage}% Completed</span>
          </div>
        </div>

        {/* Right Side: Hydration Summary & Goal Adjustment */}
        <div className="gauge-meta-panel">
          <div className="summary-pill-group">
            <div className="summary-pill">
              <span className="pill-label">Remaining Today</span>
              <span className="pill-val">{remaining} ml</span>
            </div>
            <div className="summary-pill">
              <span className="pill-label">Daily Target</span>
              <div className="pill-goal-row">
                <span className="pill-val">{goal} ml</span>
                <button
                  type="button"
                  className="edit-goal-link"
                  onClick={() => setIsEditingGoal(!isEditingGoal)}
                >
                  {isEditingGoal ? 'Cancel' : 'Edit Goal'}
                </button>
              </div>
            </div>
          </div>

          {isEditingGoal && (
            <form onSubmit={handleSaveGoal} className="edit-goal-inline-form">
              <label className="input-hint-label">Adjust Daily Goal (ml)</label>
              <div className="inline-input-row">
                <input
                  type="number"
                  min="500"
                  max="6000"
                  step="100"
                  className="goal-input"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(Number(e.target.value))}
                />
                <button type="submit" className="save-goal-btn">
                  Save
                </button>
              </div>
            </form>
          )}

          {/* Quick Presets */}
          <div className="quick-presets-section">
            <span className="presets-title">Quick Log Intake</span>
            <div className="preset-buttons-row">
              <button
                type="button"
                className="preset-btn"
                onClick={() => addWaterLog(250, 'cup')}
              >
                <span className="material-symbols-outlined">local_cafe</span>
                <span className="preset-amount">+250 ml</span>
                <span className="preset-caption">Cup</span>
              </button>
              <button
                type="button"
                className="preset-btn"
                onClick={() => addWaterLog(350, 'glass')}
              >
                <span className="material-symbols-outlined">water_full</span>
                <span className="preset-amount">+350 ml</span>
                <span className="preset-caption">Glass</span>
              </button>
              <button
                type="button"
                className="preset-btn"
                onClick={() => addWaterLog(500, 'bottle')}
              >
                <span className="material-symbols-outlined">water_bottle</span>
                <span className="preset-amount">+500 ml</span>
                <span className="preset-caption">Bottle</span>
              </button>
              <button
                type="button"
                className="preset-btn highlight"
                onClick={() => addWaterLog(750, 'bottle')}
              >
                <span className="material-symbols-outlined">sports_bar</span>
                <span className="preset-amount">+750 ml</span>
                <span className="preset-caption">Flask</span>
              </button>
            </div>

            {/* Custom Amount Form */}
            <form onSubmit={handleAddCustom} className="custom-water-form">
              <input
                type="number"
                placeholder="Custom amount (e.g., 400 ml)"
                className="custom-amt-input"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="50"
                max="2500"
              />
              <button type="submit" className="custom-amt-submit">
                <span className="material-symbols-outlined">add</span>
                Add
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Two Column Section: Log History & Weekly Trend */}
      <div className="water-details-grid">
        {/* Today's Intake History */}
        <div className="water-card intake-history-card">
          <div className="card-top-title">
            <h3 className="section-title">Today's Drink Timeline</h3>
            <span className="badge-count">{waterLogs.length} entries</span>
          </div>

          <div className="history-entries-list">
            {waterLogs.length === 0 ? (
              <div className="empty-history-box">
                <span className="material-symbols-outlined">water_drop</span>
                <p>No water logged yet today. Take a sip and tap a button above!</p>
              </div>
            ) : (
              waterLogs.map((log) => (
                <div key={log.id} className="history-item">
                  <div className="history-item-left">
                    <div className="history-icon-circle">
                      <span className="material-symbols-outlined">
                        {getContainerIcon(log.containerType)}
                      </span>
                    </div>
                    <div>
                      <span className="history-item-amount">+{log.amount} ml</span>
                      <span className="history-item-type">({log.containerType})</span>
                    </div>
                  </div>

                  <div className="history-item-right">
                    <span className="history-item-time">{log.timeFormatted}</span>
                    <button
                      type="button"
                      className="delete-log-btn"
                      title="Remove entry"
                      onClick={() => deleteWaterLog(log.id)}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Weekly Hydration Graph */}
        <div className="water-card weekly-report-card">
          <div className="card-top-title">
            <h3 className="section-title">Weekly Hydration Performance</h3>
            <span className="badge-count">7-day view</span>
          </div>

          <p className="weekly-graph-intro">
            Consistent water intake boosts cognitive stamina and memory. Aim to hit your target every day.
          </p>

          <div className="weekly-bars-wrapper">
            {weeklyWaterData.map((d, index) => {
              const isGoalMet = d.amount >= d.goal;
              const fillPct = Math.min(100, Math.round((d.amount / d.goal) * 100));

              return (
                <div key={index} className="day-column">
                  <span className="day-val">{(d.amount / 1000).toFixed(1)}L</span>
                  <div className="day-bar-bg">
                    <div
                      className={`day-bar-fill ${isGoalMet ? 'achieved' : ''}`}
                      style={{ height: `${fillPct}%` }}
                    />
                  </div>
                  <span className="day-label">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;
