import { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function App() {
  // Simple state to toggle between 'login' and 'register' screens
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register'>('login');

  return (
    <div className="app-container">
      {currentScreen === 'login' ? (
        <Login onSwitchToRegister={() => setCurrentScreen('register')} />
      ) : (
        <Register onSwitchToLogin={() => setCurrentScreen('login')} />
      )}
    </div>
  );
}

export default App;

