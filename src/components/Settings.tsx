import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { UserProfile } from '../types';
import './Settings.css';

export const Settings: React.FC = () => {
  const { user, updateUser, logoutDemoSession, showToast } = useApp();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [dailyWaterGoal, setDailyWaterGoal] = useState(user.dailyWaterGoal);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user.notificationsEnabled);
  const [waterReminderFrequency, setWaterReminderFrequency] = useState(user.waterReminderFrequency);
  const [theme, setTheme] = useState(user.theme);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      email,
      dailyWaterGoal,
      notificationsEnabled,
      waterReminderFrequency,
      theme,
    });
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all DayFlow cached tasks and hydration records? This will restore initial defaults.')) {
      localStorage.clear();
      showToast('All local data cleared. Reloading defaults...');
      setTimeout(() => {
        window.location.reload();
      }, 700);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Do you want to log out of DayFlow?')) {
      logoutDemoSession();
      showToast('Logged out successfully');
    }
  };

  return (
    <div className="settings-page-container">
      {/* Header */}
      <header className="settings-header">
        <div>
          <h1 className="settings-main-title">Settings & Preferences</h1>
          <p className="settings-subtext">Manage your profile, daily goals, notifications, and local data.</p>
        </div>
      </header>

      <form onSubmit={handleSaveProfile} className="settings-form-layout">
        {/* Profile Card */}
        <section className="settings-section-card">
          <div className="section-card-header">
            <div className="section-card-icon">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div>
              <h2 className="section-card-title">Profile Information</h2>
              <p className="section-card-desc">Update your personal account credentials and profile picture.</p>
            </div>
          </div>

          <div className="profile-row-editor">
            <img src={user.avatarUrl} alt={user.name} className="profile-large-avatar" />
            <div className="avatar-edit-info">
              <span className="avatar-hint">Avatar photo linked to your account</span>
              <button
                type="button"
                className="change-avatar-btn"
                onClick={() => {
                  const newUrl = prompt('Enter a new image URL for your avatar:', user.avatarUrl);
                  if (newUrl) {
                    updateUser({ avatarUrl: newUrl });
                  }
                }}
              >
                Change Avatar
              </button>
            </div>
          </div>

          <div className="settings-form-grid">
            <div className="settings-field">
              <label className="field-label">Full Name</label>
              <input
                type="text"
                className="field-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="settings-field">
              <label className="field-label">Email Address</label>
              <input
                type="email"
                className="field-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
        </section>

        {/* Daily Hydration Preferences */}
        <section className="settings-section-card">
          <div className="section-card-header">
            <div className="section-card-icon blue-icon">
              <span className="material-symbols-outlined">water_drop</span>
            </div>
            <div>
              <h2 className="section-card-title">Hydration Targets</h2>
              <p className="section-card-desc">Calibrate your daily fluid targets and reminder frequencies.</p>
            </div>
          </div>

          <div className="settings-form-grid">
            <div className="settings-field">
              <label className="field-label">Daily Target (ml)</label>
              <input
                type="number"
                min="500"
                max="6000"
                step="100"
                className="field-input"
                value={dailyWaterGoal}
                onChange={(e) => setDailyWaterGoal(Number(e.target.value))}
              />
              <span className="field-explanation">Typical recommended baseline is 2,000 to 3,000 ml.</span>
            </div>

            <div className="settings-field">
              <label className="field-label">Reminder Interval</label>
              <select
                className="field-select"
                value={waterReminderFrequency}
                onChange={(e) => setWaterReminderFrequency(Number(e.target.value))}
              >
                <option value={30}>Every 30 minutes</option>
                <option value={45}>Every 45 minutes</option>
                <option value={60}>Every 1 hour (Recommended)</option>
                <option value={90}>Every 1.5 hours</option>
                <option value={120}>Every 2 hours</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notifications & System Preferences */}
        <section className="settings-section-card">
          <div className="section-card-header">
            <div className="section-card-icon amber-icon">
              <span className="material-symbols-outlined">notifications</span>
            </div>
            <div>
              <h2 className="section-card-title">System & Alerts</h2>
              <p className="section-card-desc">Control browser notification prompts and interface theme.</p>
            </div>
          </div>

          <div className="toggle-setting-row">
            <div>
              <span className="toggle-title">Push Notifications</span>
              <p className="toggle-desc">Receive real-time desktop reminders for pending tasks and hydration.</p>
            </div>
            <label className="switch-toggle">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />
              <span className="slider-round" />
            </label>
          </div>

          <div className="settings-form-grid" style={{ marginTop: '1rem' }}>
            <div className="settings-field">
              <label className="field-label">Interface Theme</label>
              <select
                className="field-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value as UserProfile['theme'])}
              >
                <option value="light">DayFlow Crisp Light (Default)</option>
                <option value="dark">Deep Indigo Dark</option>
                <option value="system">Follow System Preferences</option>
              </select>
            </div>
          </div>
        </section>

        {/* Action Save Bar */}
        <div className="settings-save-bar">
          <button type="submit" className="save-settings-btn">
            <span className="material-symbols-outlined">check</span>
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Account Danger / Data Management Zone */}
      <section className="settings-section-card danger-zone-card">
        <div className="section-card-header">
          <div className="section-card-icon red-icon">
            <span className="material-symbols-outlined">security</span>
          </div>
          <div>
            <h2 className="section-card-title danger-title">Session & Local Data</h2>
            <p className="section-card-desc">Sign out or reset local mock storage.</p>
          </div>
        </div>

        <div className="danger-actions-row">
          <button type="button" className="action-outline-btn" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            <span>Sign Out</span>
          </button>

          <button type="button" className="danger-btn" onClick={handleClearAllData}>
            <span className="material-symbols-outlined">delete_forever</span>
            <span>Reset Local Mock Data</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
