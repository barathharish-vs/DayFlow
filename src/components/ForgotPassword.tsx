import React, { useState } from 'react';
import './ForgotPassword.css';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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

    // Simulate reset request delay
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        {/* Brand Logo */}
        <div className="brand-header">
          <div className="brand-icon">
            <span className="material-symbols-outlined">bolt</span>
          </div>
          <span className="brand-title">DayFlow</span>
        </div>

        {!isSubmitted ? (
          <>
            <div className="text-header">
              <h1 className="forgot-title">Forgot password?</h1>
              <p className="forgot-subtitle">
                No worries, enter your email and we'll send you reset instructions to get you back into your flow.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="forgot-form" noValidate>
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
                    Sending link...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="success-state">
            <div className="success-icon-badge">
              <span className="material-symbols-outlined">mark_email_read</span>
            </div>
            <h2 className="success-title">Check your email</h2>
            <p className="success-desc">
              We’ve sent password reset instructions to <br />
              <strong className="user-email-highlight">{email}</strong>
            </p>

            <button
              type="button"
              className="submit-btn outline-btn"
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
            >
              Didn't receive it? Click to resend
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
