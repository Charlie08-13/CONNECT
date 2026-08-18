import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiVideo,
  FiShield,
  FiUsers,
} from "react-icons/fi";

// =========================================
// API CONFIG
// =========================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// =========================================
// REGISTER
// =========================================

const Register = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    agree: false,
  });

  // =========================================
  // HANDLE INPUT CHANGE
  // =========================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
  };

  // =========================================
  // REGISTER USER
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const name =
      formData.name.trim();

    const email =
      formData.email.trim().toLowerCase();

    const password =
      formData.password;

    // ======================================
    // VALIDATION
    // ======================================

    if (!name) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    if (name.length < 2) {
      setError(
        "Name must be at least 2 characters."
      );
      return;
    }

    if (!email) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (!formData.agree) {
      setError(
        "Please agree to the Terms of Service and Privacy Policy."
      );
      return;
    }

    // ======================================
    // START LOADING
    // ======================================

    setLoading(true);

    try {
      const response =
        await axios.post(
          `${API_URL}/api/auth/register`,
          {
            name,
            email,
            password,
          }
        );

      console.log(
        "Registration successful:",
        response.data
      );

      // ====================================
      // GET TOKEN
      // ====================================

      const token =
        response.data?.token;

      if (!token) {
        throw new Error(
          "Registration successful, but no authentication token was received."
        );
      }

      // ====================================
      // SAVE TOKEN
      // ====================================

      localStorage.setItem(
        "token",
        token
      );

      // ====================================
      // SAVE USER
      // ====================================

      if (response.data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(
            response.data.user
          )
        );
      }

      // ====================================
      // REDIRECT
      // ====================================

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      // ====================================
      // SERVER ERROR
      // ====================================

      if (error.response) {
        setError(
          error.response.data?.message ||
            "Registration failed. Please try again."
        );
      }

      // ====================================
      // SERVER NOT RUNNING
      // ====================================

      else if (error.request) {
        setError(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      }

      // ====================================
      // OTHER ERROR
      // ====================================

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
  // RENDER
  // =========================================

  return (
    <div className="auth-page">

      {/* =====================================
          LEFT SIDE
      ===================================== */}

      <div className="auth-showcase register-showcase">

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
            JOIN CONNECT
          </span>

          <h1>
            Build.
            <br />
            Share.
            <br />
            <span>Connect.</span>
          </h1>

          <p>
            Create your account and start
            collaborating with your team
            in real time.
          </p>

          <div className="auth-features">

            <div>
              <FiUsers />

              <span>
                Connect with your team
              </span>
            </div>

            <div>
              <FiShield />

              <span>
                Secure & private meetings
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
          RIGHT SIDE
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
              Create your account
            </h2>

            <p>
              Start collaborating with CONNECT
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div
              className="auth-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* =================================
              REGISTER FORM
          ================================= */}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            <div className="form-group">

              <label htmlFor="name">
                Full name
              </label>

              <div className="input-wrapper">

                <FiUser />

                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  disabled={loading}
                />

              </div>

            </div>

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

              <label htmlFor="password">
                Password
              </label>

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
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
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

              <small className="input-hint">
                Use at least 6 characters.
              </small>

            </div>

            {/* TERMS */}

            <label className="terms-label">

              <input
                type="checkbox"
                name="agree"
                checked={formData.agree}
                onChange={handleChange}
                disabled={loading}
                required
              />

              <span>
                I agree to the{" "}

                <a
                  href="#terms"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >
                  Terms of Service
                </a>

                {" "}and{" "}

                <a
                  href="#privacy"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >
                  Privacy Policy
                </a>

              </span>

            </label>

            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create account"}

              {!loading && (
                <FiArrowRight />
              )}
            </button>

          </form>

          {/* DIVIDER */}

          <div className="auth-divider">
            <span>or</span>
          </div>

          {/* LOGIN LINK */}

          <p className="auth-switch">

            Already have an account?{" "}

            <Link to="/login">
              Sign in
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
};

export default Register;

