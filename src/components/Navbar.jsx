import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiVideo,
  FiArrowRight,
} from "react-icons/fi";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="logo" onClick={closeMenu}>
          <div className="logo-icon">
            <FiVideo />
          </div>

          <span>CONNECT</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>

          <Link to="/login" className="login-link">
            Login
          </Link>

          <Link to="/register" className="nav-cta">
            Get Started
            <FiArrowRight />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>

        <a href="#features" onClick={closeMenu}>
          Features
        </a>

        <a href="#how-it-works" onClick={closeMenu}>
          How It Works
        </a>

        <a href="#about" onClick={closeMenu}>
          About
        </a>

        <Link to="/login" onClick={closeMenu}>
          Login
        </Link>

        <Link
          to="/register"
          className="mobile-cta"
          onClick={closeMenu}
        >
          Get Started
          <FiArrowRight />
        </Link>

      </div>
    </nav>
  );
};

export default Navbar;