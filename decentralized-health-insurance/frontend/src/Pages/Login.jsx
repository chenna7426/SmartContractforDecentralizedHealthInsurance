import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

function Login({ onSubmit, loading = false, notification }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
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
      email: email.trim().toLowerCase(),
      password,
    });
  };

  return (
    <section className="login-page animate-fade-in">
      <div className="login-container">
        <div className="login-panel">
          <div className="login-panel__eyebrow">Welcome back</div>
          <h1 className="login-panel__title">Sign in to continue your insurance workflow</h1>
          <p className="login-panel__desc">
            Access your dashboard, review claim status, and keep your MetaMask-connected wallet in sync with your account.
          </p>

          <ul className="login-panel__bullets">
            <li>Validate your account with trusted backend authentication</li>
            <li>Keep a secure user session after login</li>
            <li>Continue to claim submission and blockchain approvals</li>
          </ul>
        </div>

        <div className="login-form-panel">
          <div className="login-form-panel__eyebrow">Login</div>
          <h2 className="login-form-panel__title">Sign in to your account</h2>
          <p className="login-form-panel__sub">Use your registered email and password to access the dashboard.</p>

          {notification?.text && (
            <div className={`login-notification login-notification--${notification.type}`}>
              {notification.type === 'success' ? '✓' : '⚠'} {notification.text}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`login-input ${errors.email ? 'login-input--error' : ''}`}
              />
              {errors.email && <p className="login-error">{errors.email}</p>}
            </div>

            <div className="login-field">
              <label className="login-label">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`login-input ${errors.password ? 'login-input--error' : ''}`}
              />
              {errors.password && <p className="login-error">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-submit"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="login-footer-text">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Login;
