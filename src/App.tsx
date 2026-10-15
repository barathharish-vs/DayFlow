
import React from 'react';
import { useApp } from './context/AppContext';
import type { UserProfile } from './types';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import WaterTracker from './components/WaterTracker';
import Settings from './components/Settings';
import './App.css';

interface BackendUserProfile {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  dailyWaterGoal?: number | null;
  notificationsEnabled?: boolean | null;
  waterReminderFrequency?: number | null;
  theme?: string | null;
}

const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    loginDemoSession,
    currentScreen,
    setCurrentScreen,
    toastMessage,
  } = useApp();

  const showAuthPortal = !isAuthenticated;

  const handleLoginSuccess = async () => {
    const token = localStorage.getItem('dayflow_token');

    if (!token) {
      setCurrentScreen('login');
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem('dayflow_token');
        setCurrentScreen('login');
        alert('Could not verify your login. Please sign in again.');
        return;
      }

      const profile: BackendUserProfile = await response.json();

      if (!profile.email) {
        localStorage.removeItem('dayflow_token');
        setCurrentScreen('login');
        alert('The server returned an invalid user profile.');
        return;
      }

      const user: Partial<UserProfile> = {
        name: profile.name || profile.email.split('@')[0],
        email: profile.email,
        avatarUrl:
          profile.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80',
        dailyWaterGoal: profile.dailyWaterGoal ?? 2500,
        notificationsEnabled: profile.notificationsEnabled ?? true,
        waterReminderFrequency: profile.waterReminderFrequency ?? 60,
        theme:
          profile.theme === 'dark' || profile.theme === 'system'
            ? profile.theme
            : 'light',
      };

      loginDemoSession(user);
    } catch {
      localStorage.removeItem('dayflow_token');
      setCurrentScreen('login');
      alert('Cannot connect to the server. Please try again.');
    }
  };

  return (
    <div className={`app-root ${showAuthPortal ? 'auth-mode' : 'portal-mode'}`}>
      {toastMessage && (
        <div className="global-toast-notification" role="alert">
          <span className="material-symbols-outlined toast-icon">info</span>
          <span className="toast-text">{toastMessage}</span>
        </div>
      )}

      {showAuthPortal ? (
        <div className="auth-screens-wrapper">
          {currentScreen === 'register' ? (
            <Register
              onSwitchToLogin={() => setCurrentScreen('login')}
              onRegisterSuccess={() => {
                setCurrentScreen('login');
              }}
            />
          ) : currentScreen === 'forgot-password' ? (
            <ForgotPassword
              onBackToLogin={() => setCurrentScreen('login')}
            />
          ) : (
            <Login
              onSwitchToRegister={() => setCurrentScreen('register')}
              onSwitchToForgotPassword={() =>
                setCurrentScreen('forgot-password')
              }
              onLoginSuccess={handleLoginSuccess}
            />
          )}
        </div>
      ) : (
        <div className="app-main-layout">
          <Navigation />

          <main className="content-scroll-canvas">
            {currentScreen === 'tasks' ? (
              <Tasks />
            ) : currentScreen === 'water' ? (
              <WaterTracker />
            ) : currentScreen === 'settings' ? (
              <Settings />
            ) : (
              <Dashboard />
            )}
          </main>
        </div>
      )}
    </div>
  );
};

function App() {
  return <AppContent />;
}

export default App;
