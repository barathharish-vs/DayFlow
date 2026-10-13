import React, { useState } from 'react';
import './Login.css';

/**
 * TypeScript Interfaces
 * These define the "shape" of our form data and errors so TypeScript can catch mistakes.
 */
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
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  // 1. State for form input values
  const [formValues, setFormValues] = useState<LoginFormValues>({
    email: '',
    password: '',
    rememberMe: false,
  });

  // 2. State for validation errors
  const [errors, setErrors] = useState<LoginFormErrors>({});

  // 3. State to toggle password visibility (show/hide)
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // 4. State to simulate a successful submission message (without calling a backend)
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Updates state when user types into an input field or checks a checkbox
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Clear any previous error on this field as soon as user types
    if (errors[name as keyof LoginFormErrors]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    }

    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  /**
   * Validates form fields and returns true if all checks pass
   */
  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Email checks
    if (!formValues.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formValues.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password checks
    if (!formValues.password) {
      newErrors.password = 'Password is required.';
    } else if (formValues.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevents browser from reloading the page
    setSuccessMessage(null);

    const isValid = validateForm();
    if (isValid) {
      // In this phase, we do NOT connect to a real backend.
      // We display a gentle success notification to confirm validation works.
      setSuccessMessage('Validation passed! Ready for backend connection in future phases.');
    }
  };

  return (
    <div className="login-page">
      <main className="login-card">
        {/* Brand Logo & Header */}
        <header className="login-header">
          <div className="login-logo-badge" aria-hidden="true">
            <span className="material-symbols-outlined">bolt</span>
          </div>
          <h1 className="login-title">DayFlow</h1>
          <p className="login-subtitle">Welcome back! Please enter your details.</p>
        </header>

        {/* Validation Success Feedback Banner */}
        {successMessage && (
          <div className="form-success-banner" role="status">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              check_circle
            </span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
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

          {/* Password Field */}
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
                className={`form-input has-right-icon ${errors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
                value={formValues.password}
                onChange={handleInputChange}
                autoComplete="current-password"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                className="input-toggle-btn"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.password && (
              <span id="password-error" className="field-error-text" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          {/* Remember Me Checkbox & Forgot Password Link */}
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
                alert('Forgot Password will be linked in a later phase!');
              }}
            >
              Forgot password?
            </a>
          </div>

          {/* Sign In Submit Button */}
          <button type="submit" className="submit-btn">
            Sign In
          </button>
        </form>

        {/* Footer Link to Create Account */}
        <footer className="login-footer">
          <span>Don't have an account?</span>
          <a
            href="#create-account"
            className="create-account-link"
            onClick={(e) => {
              e.preventDefault();
              if (onSwitchToRegister) {
                onSwitchToRegister();
              } else {
                alert('Registration screen will be connected in a later phase!');
              }
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
