import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiVideo,
  FiShield,
} from "react-icons/fi";

// =========================================
// API CONFIG
// =========================================

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";


const Login = () => {
  const navigate = useNavigate();

  // =========================================
  // STATES
  // =========================================

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  // =========================================
  // HANDLE INPUT CHANGE
  // =========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  // =========================================
  // LOGIN
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const email = formData.email.trim();
    const password = formData.password;

    // Basic validation
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );

      console.log("Login successful:", response.data);

      // =====================================
      // GET TOKEN
      // =====================================

      const token = response.data?.token;

      if (!token) {
        throw new Error(
          "Login successful, but no authentication token was received."
        );
      }

      // =====================================
      // SAVE TOKEN
      // =====================================

      localStorage.setItem("token", token);

      // =====================================
      // SAVE USER
      // =====================================

      if (response.data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      // =====================================
      // SAVE REMEMBER ME
      // =====================================

      localStorage.setItem(
        "rememberMe",
        String(formData.remember)
      );

      // =====================================
      // REDIRECT TO DASHBOARD
      // =====================================

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);

      // =====================================
      // SERVER ERROR
      // =====================================

      if (error.response) {
        setError(
          error.response.data?.message ||
            "Invalid email or password."
        );
      }

      // =====================================
      // SERVER NOT RUNNING
      // =====================================

      else if (error.request) {
        setError(
          "Unable to connect to the server. Please make sure the backend is running on port 5000."
        );
      }

      // =====================================
      // OTHER ERROR
      // =====================================

      else {
        setError(
          error.message ||
            "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // FORGOT PASSWORD
  // =========================================

  const handleForgotPassword = (e) => {
    e.preventDefault();

    setError(
      "Forgot password functionality will be added next."
    );
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="auth-page">

      {/* =====================================
          LEFT SHOWCASE
      ===================================== */}

      <div className="auth-showcase">

        {/* LOGO */}

        <Link
          to="/"
          className="auth-logo"
        >
          <div className="logo-icon">
            <FiVideo />
          </div>

          <span>CONNECT</span>
        </Link>

        {/* SHOWCASE CONTENT */}

        <div className="auth-showcase-content">

          <span className="section-label">
            WELCOME BACK
          </span>

          <h1>
            Connect with
            <br />
            your <span>people.</span>
          </h1>

          <p>
            Join your meetings, collaborate
            with your team and stay connected
            wherever you are.
          </p>

          {/* FEATURES */}

          <div className="auth-features">

            <div>
              <FiVideo />

              <span>
                HD video meetings
              </span>
            </div>

            <div>
              <FiShield />

              <span>
                Secure communication
              </span>
            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="auth-showcase-footer">
          © 2026 CONNECT
        </div>

      </div>

      {/* =====================================
          RIGHT FORM
      ===================================== */}

      <div className="auth-form-container">

        <div className="auth-form-wrapper">

          {/* MOBILE LOGO */}

          <div className="mobile-auth-logo">

            <Link
              to="/"
              className="auth-logo"
            >
              <div className="logo-icon">
                <FiVideo />
              </div>

              <span>CONNECT</span>
            </Link>

          </div>

          {/* HEADING */}

          <div className="auth-heading">

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to continue to CONNECT
            </p>

          </div>

          {/* ERROR MESSAGE */}

          {error && (
            <div
              className="auth-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* =================================
              LOGIN FORM
          ================================= */}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email address
              </label>

              <div className="input-wrapper">

                <FiMail />

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  disabled={loading}
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="form-group">

              <div className="label-row">

                <label htmlFor="password">
                  Password
                </label>

                <a
                  href="#forgot-password"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </a>

              </div>

              <div className="input-wrapper">

                <FiLock />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={loading}
                >
                  {showPassword ? (
                    <FiEyeOff />
                  ) : (
                    <FiEye />
                  )}
                </button>

              </div>

            </div>

            {/* REMEMBER ME */}

            <div className="remember-row">

              <label className="checkbox-label">

                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  disabled={loading}
                />

                <span>
                  Remember me
                </span>

              </label>

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              {loading
                ? "Signing in..."
                : "Sign in"}

              {!loading && (
                <FiArrowRight />
              )}

            </button>

          </form>

          {/* DIVIDER */}

          <div className="auth-divider">
            <span>or</span>
          </div>

          {/* REGISTER */}

          <p className="auth-switch">

            Don't have an account?{" "}

            <Link to="/register">
              Create an account
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
};

export default Login;