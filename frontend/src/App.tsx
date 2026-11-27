
import React from 'react';
import { useApp } from './context/AppContext';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import WaterTracker from './components/WaterTracker';
import Settings from './components/Settings';
import WeeklyWaterReport from './components/WeeklyWaterReport';
import WeeklyTaskReport from './components/WeeklyTaskReport';
import './App.css';

const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    handleAuthSuccess,
    currentScreen,
    setCurrentScreen,
    toastMessage,
  } = useApp();

  const showAuthPortal = !isAuthenticated;

  const handleLoginSuccess = async () => {
    await handleAuthSuccess();
  };

  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`app-root ${showAuthPortal ? 'auth-mode' : 'portal-mode'}`}>
      {isOffline && (
        <div className="offline-status-banner" role="status">
          <span className="material-symbols-outlined" style={{ fontSize: '1.15rem' }}>
            cloud_off
          </span>
          <span>
            You are currently offline. Cached interface is available, but saving updates requires an internet connection.
          </span>
        </div>
      )}

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
            ) : currentScreen === 'water-report' ? (
              <WeeklyWaterReport />
            ) : currentScreen === 'task-report' ? (
              <WeeklyTaskReport />
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
