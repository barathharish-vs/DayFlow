import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { UserProfile } from '../types';
import UserAvatar from './UserAvatar';
import InstallPwaCard from './InstallPwaCard';
import './Settings.css';

export const Settings: React.FC = () => {
  const { user, updateUser, logoutDemoSession, showToast, requestNotificationPermission, refreshData } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [dailyWaterGoal, setDailyWaterGoal] = useState(user.dailyWaterGoal);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user.notificationsEnabled);
  const [waterRemindersEnabled, setWaterRemindersEnabled] = useState(user.waterRemindersEnabled ?? true);
  const [taskRemindersEnabled, setTaskRemindersEnabled] = useState(user.taskRemindersEnabled ?? true);
  const [waterReminderFrequency, setWaterReminderFrequency] = useState(user.waterReminderFrequency);
  const [theme, setTheme] = useState(user.theme);
  const [browserPermission, setBrowserPermission] = useState<string>(() => {
    return 'Notification' in window ? Notification.permission : 'unsupported';
  });

  React.useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setDailyWaterGoal(user.dailyWaterGoal);
    setNotificationsEnabled(user.notificationsEnabled);
    setWaterRemindersEnabled(user.waterRemindersEnabled ?? true);
    setTaskRemindersEnabled(user.taskRemindersEnabled ?? true);
    setWaterReminderFrequency(user.waterReminderFrequency);
    setTheme(user.theme);
  }, [user]);

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      showToast('Browser notifications are not supported on this device.');
      return;
    }
    const perm = await requestNotificationPermission();
    setBrowserPermission(perm);
    if (perm === 'granted') {
      showToast('Browser notification permission granted! 🔔');
    } else if (perm === 'denied') {
      showToast('Notifications blocked in browser. Change permission in browser site settings.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image file is too large. Maximum size is 5MB.');
      e.target.value = '';
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setPhotoError('Only JPEG, PNG, and WebP image formats are supported.');
      e.target.value = '';
      return;
    }

    setPhotoError(null);
    setSelectedPhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreviewUrl(objectUrl);
  };

  const handleCancelPreview = () => {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoPreviewUrl(null);
    setSelectedPhotoFile(null);
    setPhotoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSavePhoto = async () => {
    if (!selectedPhotoFile) return;
    setIsUploadingPhoto(true);
    setPhotoError(null);

    try {
      await api.uploadProfilePhoto(selectedPhotoFile);
      showToast('Profile photo saved successfully! 📸');
      handleCancelPreview();
      await refreshData();
    } catch (err: unknown) {
      setPhotoError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;
    setIsUploadingPhoto(true);
    setPhotoError(null);

    try {
      await api.deleteProfilePhoto();
      showToast('Profile photo removed.');
      handleCancelPreview();
      await refreshData();
    } catch (err: unknown) {
      setPhotoError(err instanceof Error ? err.message : 'Failed to remove photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      dailyWaterGoal,
      notificationsEnabled,
      waterRemindersEnabled,
      taskRemindersEnabled,
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
            <div className="avatar-preview-container">
              {photoPreviewUrl ? (
                <img
                  src={photoPreviewUrl}
                  alt="Photo Preview"
                  className="profile-large-avatar"
                />
              ) : (
                <UserAvatar
                  avatarUrl={user.avatarUrl}
                  name={user.name}
                  size="lg"
                  className="profile-large-avatar"
                />
              )}
            </div>

            <div className="avatar-edit-info">
              <span className="avatar-hint">
                JPG, PNG, or WebP (max 5MB). Photo is securely stored with your account.
              </span>

              {photoError && (
                <div style={{ color: '#ef4444', fontSize: '0.8125rem', fontWeight: 600 }}>
                  ⚠️ {photoError}
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {photoPreviewUrl ? (
                  <>
                    <button
                      type="button"
                      className="save-photo-btn"
                      style={{
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.4rem 0.9rem',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                      disabled={isUploadingPhoto}
                      onClick={handleSavePhoto}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        {isUploadingPhoto ? 'hourglass_top' : 'save'}
                      </span>
                      <span>{isUploadingPhoto ? 'Saving...' : 'Save New Photo'}</span>
                    </button>

                    <button
                      type="button"
                      className="cancel-btn"
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      disabled={isUploadingPhoto}
                      onClick={handleCancelPreview}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="change-avatar-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '4px' }}>
                        photo_camera
                      </span>
                      <span>Choose Photo</span>
                    </button>

                    {user.avatarUrl && (
                      <button
                        type="button"
                        className="danger-btn"
                        style={{
                          padding: '0.375rem 0.8rem',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                        }}
                        disabled={isUploadingPhoto}
                        onClick={handleRemovePhoto}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          delete
                        </span>
                        <span>Remove</span>
                      </button>
                    )}
                  </>
                )}
              </div>
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
              <label className="field-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="field-input"
                value={email}
                disabled
                title="Account email address"
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

          {/* Master Notifications Switch */}
          <div className="toggle-setting-row">
            <div>
              <span className="toggle-title">Master Notifications</span>
              <p className="toggle-desc">Enable or disable all in-app and browser notifications across DayFlow.</p>
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

          {/* Water Reminders Switch */}
          <div className="toggle-setting-row" style={{ opacity: notificationsEnabled ? 1 : 0.6 }}>
            <div>
              <span className="toggle-title">Hydration Reminders 💧</span>
              <p className="toggle-desc">Receive periodic drink reminders during active browser sessions.</p>
            </div>
            <label className="switch-toggle">
              <input
                type="checkbox"
                checked={waterRemindersEnabled}
                disabled={!notificationsEnabled}
                onChange={(e) => setWaterRemindersEnabled(e.target.checked)}
              />
              <span className="slider-round" />
            </label>
          </div>

          {/* Task Reminders Switch */}
          <div className="toggle-setting-row" style={{ opacity: notificationsEnabled ? 1 : 0.6 }}>
            <div>
              <span className="toggle-title">Task Schedule Reminders ⏰</span>
              <p className="toggle-desc">Receive alerts when scheduled tasks reach their due time.</p>
            </div>
            <label className="switch-toggle">
              <input
                type="checkbox"
                checked={taskRemindersEnabled}
                disabled={!notificationsEnabled}
                onChange={(e) => setTaskRemindersEnabled(e.target.checked)}
              />
              <span className="slider-round" />
            </label>
          </div>

          {/* Browser Desktop Permission Status & Action */}
          <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--bg-card-secondary, #f8fafc)', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Desktop Notification Permission:
                </span>
                <span
                  style={{
                    marginLeft: '0.5rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: browserPermission === 'granted' ? '#dcfce7' : browserPermission === 'denied' ? '#fee2e2' : '#f1f5f9',
                    color: browserPermission === 'granted' ? '#15803d' : browserPermission === 'denied' ? '#b91c1c' : '#475569',
                  }}
                >
                  {browserPermission.toUpperCase()}
                </span>
              </div>

              {browserPermission !== 'granted' && browserPermission !== 'unsupported' && (
                <button
                  type="button"
                  className="action-outline-btn"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                  onClick={handleRequestPermission}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>notifications_active</span>
                  <span>Enable Desktop Alerts</span>
                </button>
              )}
            </div>

            {browserPermission === 'denied' && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#b91c1c' }}>
                ⚠️ Desktop notifications are currently blocked by your browser. To unblock: click the lock / settings icon next to the URL in your browser's address bar and set Notifications to <strong>Allow</strong>.
              </p>
            )}

            <p style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Note: Reminders trigger while DayFlow is open in an active browser tab or window.
            </p>
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

      {/* PWA Installation & Offline Info */}
      <InstallPwaCard />

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
