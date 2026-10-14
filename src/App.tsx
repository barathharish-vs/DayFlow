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
import './App.css';

const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    loginDemoSession,
    currentScreen,
    setCurrentScreen,
    toastMessage,
  } = useApp();

  // If user is NOT authenticated, private screens are never shown
  const showAuthPortal = !isAuthenticated;

  return (
    <div className={`app-root ${showAuthPortal ? 'auth-mode' : 'portal-mode'}`}>
      {/* Toast Notification Container */}
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
              onRegisterSuccess={(_name, _email) => {
                // As requested: After registration, do not claim server account creation or auto-login.
                // Redirect user to Login with a prompt to sign in with their demo credentials.
                setCurrentScreen('login');
              }}
            />
          ) : currentScreen === 'forgot-password' ? (
            <ForgotPassword onBackToLogin={() => setCurrentScreen('login')} />
          ) : (
            /* Default fallback is always Login */
            <Login
              onSwitchToRegister={() => setCurrentScreen('register')}
              onSwitchToForgotPassword={() => setCurrentScreen('forgot-password')}
              onLoginSuccess={() => loginDemoSession()}
            />
          )}
        </div>
      ) : (
        <div className="app-main-layout">
          {/* Navigation (Sidebar on Desktop, Bottom bar on Mobile) */}
          <Navigation />

          {/* Protected Main View Area */}
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
