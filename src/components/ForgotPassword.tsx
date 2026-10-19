import React, { useState } from 'react';
import { api } from '../services/api';
import './ForgotPassword.css';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stage, setStage] = useState<'request' | 'reset' | 'success'>('request');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await api.forgotPassword(email);
      setIsLoading(false);
      if (res.resetToken && !res.resetToken.includes(' ')) {
        // If server returns dev reset token, pre-fill it for easy local testing
        setToken(res.resetToken);
      }
      setStage('reset');
      setSuccessMsg(res.message);
    } catch (err: unknown) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to request password reset');
    }
  };

  const handleApplyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter the reset token/code');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await api.resetPassword({ token: token.trim(), newPassword });
      setIsLoading(false);
      setSuccessMsg(res.message);
      setStage('success');
    } catch (err: unknown) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        {/* Brand Logo */}
        <div className="brand-header">
          <div className="brand-icon">
            <img src="/dayflow-icon-192.png" alt="DayFlow Logo" className="brand-logo-img" />
          </div>
          <span className="brand-title">DayFlow</span>
        </div>

        {stage === 'request' && (
          <>
            <div className="text-header">
              <h1 className="forgot-title">Forgot password?</h1>
              <p className="forgot-subtitle">
                No worries, enter your email and we'll generate reset instructions to get you back into your flow.
              </p>
            </div>

            <form onSubmit={handleRequestReset} className="forgot-form" noValidate>
              <div className="form-group">
                <label htmlFor="forgot-email" className="input-label">
                  Email Address
                </label>
                <div className={`input-field-wrapper ${error ? 'has-error' : ''}`}>
                  <span className="material-symbols-outlined input-leading-icon">mail</span>
                  <input
                    id="forgot-email"
                    type="email"
                    className="text-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    autoComplete="email"
                  />
                </div>
                {error && <span className="field-error-text">{error}</span>}
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="loading-state">
                    <span className="material-symbols-outlined spinner">progress_activity</span>
                    Generating link...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          </>
        )}

        {stage === 'reset' && (
          <>
            <div className="text-header">
              <h1 className="forgot-title">Reset your password</h1>
              <p className="forgot-subtitle">
                Enter your reset token and your new chosen password below.
              </p>
            </div>

            {successMsg && (
              <p style={{ color: '#059669', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
                {successMsg}
              </p>
            )}

            <form onSubmit={handleApplyReset} className="forgot-form" noValidate>
              <div className="form-group">
                <label htmlFor="reset-token" className="input-label">
                  Reset Token
                </label>
                <div className="input-field-wrapper">
                  <span className="material-symbols-outlined input-leading-icon">key</span>
                  <input
                    id="reset-token"
                    type="text"
                    className="text-input"
                    placeholder="Enter reset token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reset-new-password" className="input-label">
                  New Password
                </label>
                <div className="input-field-wrapper">
                  <span className="material-symbols-outlined input-leading-icon">lock</span>
                  <input
                    id="reset-new-password"
                    type="password"
                    className="text-input"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reset-confirm-password" className="input-label">
                  Confirm Password
                </label>
                <div className="input-field-wrapper">
                  <span className="material-symbols-outlined input-leading-icon">lock_reset</span>
                  <input
                    id="reset-confirm-password"
                    type="password"
                    className="text-input"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {error && <span className="field-error-text">{error}</span>}
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="loading-state">
                    <span className="material-symbols-outlined spinner">progress_activity</span>
                    Updating password...
                  </span>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </>
        )}

        {stage === 'success' && (
          <div className="success-state">
            <div className="success-icon-badge">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <h2 className="success-title">Password Updated!</h2>
            <p className="success-desc">
              Your DayFlow account password has been safely updated. You can now sign in with your new credentials.
            </p>

            <button
              type="button"
              className="submit-btn"
              onClick={onBackToLogin}
            >
              Sign In Now
            </button>
          </div>
        )}

        <div className="back-to-login-row">
          <button type="button" className="back-login-btn" onClick={onBackToLogin}>
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
