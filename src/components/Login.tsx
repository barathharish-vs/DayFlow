
import React, { useState } from 'react';
import './Login.css';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

interface LoginProps {
  onSwitchToRegister?: () => void;
  onSwitchToForgotPassword?: () => void;
  onLoginSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onSwitchToRegister,
  onSwitchToForgotPassword,
  onLoginSuccess,
}) => {
  const [formValues, setFormValues] = useState<LoginFormValues>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (name in errors) {
      setErrors((previous) => ({
        ...previous,
        [name]: undefined,
      }));
    }

    setFormValues((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formValues.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formValues.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formValues.password) {
      newErrors.password = 'Password is required.';
    } else if (formValues.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formValues.email.trim(),
          password: formValues.password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        let errorMsg = data?.message || data?.error;
        if (!errorMsg) {
          if (response.status === 500 || response.status === 502 || response.status === 504) {
            errorMsg = 'Backend server is not running on port 8080. Please start the backend.';
          } else {
            errorMsg = 'Login failed. Please check your email and password.';
          }
        }
        setErrors((previous) => ({
          ...previous,
          password: errorMsg,
        }));
        return;
      }

      // Store the authentication token returned by the backend.
      const token = data?.token ?? data?.accessToken;

      if (typeof token !== 'string' || token.length === 0) {
        setErrors((previous) => ({
          ...previous,
          password:
            'The server response did not contain a login token. Please check the backend response.',
        }));
        return;
      }

      localStorage.setItem('dayflow_token', token);

      setSuccessMessage('Login successful! Opening your dashboard...');

      setTimeout(() => {
        setSuccessMessage(null);
        onLoginSuccess?.();
      }, 600);
    } catch {
      setErrors((previous) => ({
        ...previous,
        password: 'Cannot connect to the server. Please try again.',
      }));
    }
  };

  return (
    <div className="login-page">
      <main className="login-card">
        <header className="login-header">
          <div className="login-logo-badge" aria-hidden="true">
            <span className="material-symbols-outlined">bolt</span>
          </div>
          <h1 className="login-title">DayFlow</h1>
          <p className="login-subtitle">
            Welcome back! Please enter your details.
          </p>
        </header>

        {successMessage && (
          <div className="form-success-banner" role="status">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '18px' }}
            >
              check_circle
            </span>
            <span>{successMessage}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">
              Email address
            </label>

            <div className="input-wrapper">
              <span className="input-icon-left" aria-hidden="true">
                <span className="material-symbols-outlined">mail</span>
              </span>

              <input
                id="email-input"
                name="email"
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="name@example.com"
                value={formValues.email}
                onChange={handleInputChange}
                autoComplete="email"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
            </div>

            {errors.email && (
              <span id="email-error" className="field-error-text" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">
              Password
            </label>

            <div className="input-wrapper">
              <span className="input-icon-left" aria-hidden="true">
                <span className="material-symbols-outlined">lock</span>
              </span>

              <input
                id="password-input"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input has-right-icon ${
                  errors.password ? 'input-error' : ''
                }`}
                placeholder="••••••••"
                value={formValues.password}
                onChange={handleInputChange}
                autoComplete="current-password"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
              />

              <button
                type="button"
                className="input-toggle-btn"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((previous) => !previous)}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            {errors.password && (
              <span
                id="password-error"
                className="field-error-text"
                role="alert"
              >
                {errors.password}
              </span>
            )}
          </div>

          <div className="form-options-row">
            <label className="remember-label" htmlFor="remember-checkbox">
              <input
                id="remember-checkbox"
                name="rememberMe"
                type="checkbox"
                className="remember-checkbox"
                checked={formValues.rememberMe}
                onChange={handleInputChange}
              />
              <span>Remember me</span>
            </label>

            <a
              href="#forgot-password"
              className="forgot-password-link"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToForgotPassword?.();
              }}
            >
              Forgot password?
            </a>
          </div>

          <button type="submit" className="submit-btn">
            Sign In
          </button>
        </form>

        <footer className="login-footer">
          <span>Don't have an account?</span>
          <a
            href="#create-account"
            className="create-account-link"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToRegister?.();
            }}
          >
            Create Account
          </a>
        </footer>
      </main>
    </div>
  );
};

export default Login;
