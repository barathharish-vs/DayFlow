
import React, { useState } from 'react';
import './Register.css';

interface RegisterFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface RegisterProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess?: (name: string, email: string) => void;
}

export const Register: React.FC<RegisterProps> = ({
  onSwitchToLogin,
  onRegisterSuccess,
}) => {
  const [formValues, setFormValues] = useState<RegisterFormValues>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const passwordCriteria = {
    minLength: formValues.password.length >= 8,
    hasNumberOrSymbol: /[0-9!@#$%^&*(),.?":{}|<>]/.test(
      formValues.password
    ),
    hasUppercase: /[A-Z]/.test(formValues.password),
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    if (errors[name as keyof RegisterFormErrors]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }

    setServerError(null);
    setSuccessMessage(null);

    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: RegisterFormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formValues.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (
      formValues.fullName.trim().length < 2 ||
      formValues.fullName.trim().length > 100
    ) {
      newErrors.fullName = 'Name must be between 2 and 100 characters.';
    }

    if (!formValues.email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!emailRegex.test(formValues.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formValues.password) {
      newErrors.password = 'Password is required.';
    } else if (
      !passwordCriteria.minLength ||
      !passwordCriteria.hasNumberOrSymbol ||
      !passwordCriteria.hasUppercase
    ) {
      newErrors.password = 'Password must meet all requirements below.';
    } else if (formValues.password.length > 100) {
      newErrors.password = 'Password must not exceed 100 characters.';
    }

    if (!formValues.confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required.';
    } else if (formValues.password !== formValues.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setSuccessMessage(null);
    setServerError(null);

    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formValues.fullName.trim(),
          email: formValues.email.trim(),
          password: formValues.password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        let errorMsg = data?.message || data?.error;
        if (data?.errors && typeof data.errors === 'object') {
          errorMsg = Object.values(data.errors).join(', ');
        }
        if (!errorMsg) {
          if (response.status === 500 || response.status === 502 || response.status === 504) {
            errorMsg = 'Backend server is not running on port 8080. Please start the backend.';
          } else {
            errorMsg = 'Registration failed. Please check your details and try again.';
          }
        }
        setServerError(errorMsg);
        return;
      }

      setSuccessMessage(
        'Account created successfully! Please sign in.'
      );

      window.setTimeout(() => {
        setSuccessMessage(null);

        if (onRegisterSuccess) {
          onRegisterSuccess(
            formValues.fullName.trim(),
            formValues.email.trim()
          );
        } else {
          onSwitchToLogin();
        }
      }, 700);
    } catch {
      setServerError(
        'Cannot connect to the server. Please check that the backend is running.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <main className="register-card">
        <header className="register-header">
          <div className="register-logo-badge" aria-hidden="true">
            <span className="material-symbols-outlined">bolt</span>
          </div>

          <h1 className="register-title">DayFlow</h1>
          <p className="register-subtitle">
            Get started with DayFlow
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

        {serverError && (
          <div className="field-error-text" role="alert">
            {serverError}
          </div>
        )}

        <form
          className="register-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              Full Name
            </label>

            <div className="input-wrapper">
              <span className="input-icon-left" aria-hidden="true">
                <span className="material-symbols-outlined">
                  person
                </span>
              </span>

              <input
                id="register-name"
                name="fullName"
                type="text"
                className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                placeholder="Alex Morgan"
                value={formValues.fullName}
                onChange={handleInputChange}
                autoComplete="name"
                aria-invalid={errors.fullName ? 'true' : 'false'}
                aria-describedby={
                  errors.fullName ? 'register-name-error' : undefined
                }
              />
            </div>

            {errors.fullName && (
              <span
                id="register-name-error"
                className="field-error-text"
                role="alert"
              >
                {errors.fullName}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              Email Address
            </label>

            <div className="input-wrapper">
              <span className="input-icon-left" aria-hidden="true">
                <span className="material-symbols-outlined">mail</span>
              </span>

              <input
                id="register-email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="alex@example.com"
                value={formValues.email}
                onChange={handleInputChange}
                autoComplete="email"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={
                  errors.email ? 'register-email-error' : undefined
                }
              />
            </div>

            {errors.email && (
              <span
                id="register-email-error"
                className="field-error-text"
                role="alert"
              >
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              Password
            </label>

            <div className="input-wrapper">
              <span className="input-icon-left" aria-hidden="true">
                <span className="material-symbols-outlined">lock</span>
              </span>

              <input
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input has-right-icon ${errors.password ? 'input-error' : ''}`}
                placeholder="Create a secure password"
                value={formValues.password}
                onChange={handleInputChange}
                autoComplete="new-password"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={
                  errors.password ? 'register-password-error' : undefined
                }
              />

              <button
                type="button"
                className="input-toggle-btn"
                aria-label={
                  showPassword ? 'Hide password' : 'Show password'
                }
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            {errors.password && (
              <span
                id="register-password-error"
                className="field-error-text"
                role="alert"
              >
                {errors.password}
              </span>
            )}
          </div>

          <div className="form-group">
            <label
              className="form-label"
              htmlFor="register-confirm-password"
            >
              Confirm Password
            </label>

            <div className="input-wrapper">
              <span className="input-icon-left" aria-hidden="true">
                <span className="material-symbols-outlined">
                  lock_reset
                </span>
              </span>

              <input
                id="register-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`form-input has-right-icon ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Confirm your password"
                value={formValues.confirmPassword}
                onChange={handleInputChange}
                autoComplete="new-password"
                aria-invalid={
                  errors.confirmPassword ? 'true' : 'false'
                }
                aria-describedby={
                  errors.confirmPassword
                    ? 'register-confirm-password-error'
                    : undefined
                }
              />

              <button
                type="button"
                className="input-toggle-btn"
                aria-label={
                  showConfirmPassword
                    ? 'Hide confirm password'
                    : 'Show confirm password'
                }
                onClick={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
              >
                <span className="material-symbols-outlined">
                  {showConfirmPassword
                    ? 'visibility_off'
                    : 'visibility'}
                </span>
              </button>
            </div>

            {errors.confirmPassword && (
              <span
                id="register-confirm-password-error"
                className="field-error-text"
                role="alert"
              >
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <div className="password-requirements-box" aria-live="polite">
            <p className="requirements-title">
              Password requirements:
            </p>

            <ul className="requirements-list">
              <li
                className={`requirement-item ${passwordCriteria.minLength ? 'met' : ''}`}
              >
                <span
                  className={`material-symbols-outlined requirement-icon ${
                    passwordCriteria.minLength ? 'met' : 'unmet'
                  }`}
                >
                  {passwordCriteria.minLength
                    ? 'check_circle'
                    : 'radio_button_unchecked'}
                </span>
                <span>At least 8 characters long</span>
              </li>

              <li
                className={`requirement-item ${passwordCriteria.hasNumberOrSymbol ? 'met' : ''}`}
              >
                <span
                  className={`material-symbols-outlined requirement-icon ${
                    passwordCriteria.hasNumberOrSymbol ? 'met' : 'unmet'
                  }`}
                >
                  {passwordCriteria.hasNumberOrSymbol
                    ? 'check_circle'
                    : 'radio_button_unchecked'}
                </span>
                <span>Contains a number or symbol</span>
              </li>

              <li
                className={`requirement-item ${passwordCriteria.hasUppercase ? 'met' : ''}`}
              >
                <span
                  className={`material-symbols-outlined requirement-icon ${
                    passwordCriteria.hasUppercase ? 'met' : 'unmet'
                  }`}
                >
                  {passwordCriteria.hasUppercase
                    ? 'check_circle'
                    : 'radio_button_unchecked'}
                </span>
                <span>At least one uppercase letter</span>
              </li>
            </ul>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <footer className="register-footer">
          <span>Already have an account?</span>

          <a
            href="#sign-in"
            className="sign-in-link"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToLogin();
            }}
          >
            Sign In
          </a>
        </footer>
      </main>
    </div>
  );
};

export default Register;
