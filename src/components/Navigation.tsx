import React from 'react';
import { useApp } from '../context/AppContext';
import './Navigation.css';

interface NavItem {
  id: 'dashboard' | 'tasks' | 'water' | 'settings';
  label: string;
  icon: string;
  badge?: number;
}

export const Navigation: React.FC = () => {
  const { currentScreen, setCurrentScreen, user, tasks } = useApp();

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: 'dashboard',
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      icon: 'check_circle',
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'water',
      label: 'Water Tracker',
      icon: 'water_drop',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="app-sidebar" aria-label="Main Navigation">
        <div className="sidebar-top">
          {/* Logo & App Name */}
          <div className="sidebar-brand">
            <div className="sidebar-logo-icon">
              <span className="material-symbols-outlined">waves</span>
            </div>
            <span className="sidebar-brand-name">DayFlow</span>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-link-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setCurrentScreen(item.id)}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span className="nav-label">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Mini Profile in Sidebar */}
        <div className="sidebar-profile" onClick={() => setCurrentScreen('settings')}>
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="sidebar-profile-avatar"
          />
          <div className="sidebar-profile-info">
            <span className="sidebar-profile-name">{user.name}</span>
            <span className="sidebar-profile-email">{user.email}</span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentScreen(item.id)}
            >
              <div className="mobile-icon-wrapper">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {item.badge !== undefined && (
                  <span className="mobile-nav-badge">{item.badge}</span>
                )}
              </div>
              <span className="mobile-nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default Navigation;
