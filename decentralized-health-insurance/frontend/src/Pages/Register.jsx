import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Register.css";

function Register({ onSubmit, loading = false, notification }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Patient",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (!["Patient", "Hospital", "Admin"].includes(formData.role)) {
      nextErrors.role = "Please choose a valid role";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await onSubmit?.({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role,
    });
  };

  return (
    <section className="register-page animate-fade-in">
      <div className="register-container">
        <div className="register-panel">
          <div className="register-panel__eyebrow">Create account</div>
          <h1 className="register-panel__title">Open a secure account for claim management</h1>
          <p className="register-panel__desc">
            Register once and access the full DApp: claim submission, wallet connectivity, and protected dashboard views.
          </p>

          <ul className="register-panel__bullets">
            <li>Create a user profile backed by your MySQL database</li>
            <li>Use the same credentials to log in from any browser</li>
            <li>Your wallet stays connected independently from your account session</li>
          </ul>
        </div>

        <div className="register-form-panel">
          <div className="register-form-panel__eyebrow">Register</div>
          <h2 className="register-form-panel__title">Create a new account</h2>
          <p className="register-form-panel__sub">Fill in your details to start using the decentralized health insurance workflow.</p>

          {notification?.text && (
            <div className={`login-notification login-notification--${notification.type}`}>
              {notification.type === 'success' ? '✓' : '⚠'} {notification.text}
            </div>
          )}

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="register-field register-field--full">
              <label className="register-label">Full name</label>
              <input
                name="name"
                placeholder="Alex Morgan"
                value={formData.name}
                onChange={handleChange}
                className={`register-input ${errors.name ? 'register-input--error' : ''}`}
              />
              {errors.name && <p className="register-error">{errors.name}</p>}
            </div>

            <div className="register-field">
              <label className="register-label">Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`register-input ${errors.email ? 'register-input--error' : ''}`}
              />
              {errors.email && <p className="register-error">{errors.email}</p>}
            </div>

            <div className="register-field">
              <label className="register-label">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`register-select ${errors.role ? 'register-select--error' : ''}`}
              >
                <option value="Patient">Patient</option>
                <option value="Hospital">Hospital</option>
                <option value="Admin">Admin</option>
              </select>
              {errors.role && <p className="register-error">{errors.role}</p>}
            </div>

            <div className="register-field">
              <label className="register-label">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                className={`register-input ${errors.password ? 'register-input--error' : ''}`}
              />
              {errors.password && <p className="register-error">{errors.password}</p>}
            </div>

            <div className="register-field">
              <label className="register-label">Confirm password</label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`register-input ${errors.confirmPassword ? 'register-input--error' : ''}`}
              />
              {errors.confirmPassword && <p className="register-error">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="register-submit"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="register-footer-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Register;
