import {
  FiVideo,
  FiMessageCircle,
  FiMonitor,
  FiUsers,
  FiShield,
  FiFile,
  FiEdit3,
  FiArrowRight,
  FiCheck,
  FiPlay,
} from "react-icons/fi";

import { Link } from "react-router-dom";

const Home = () => {
  const features = [
    {
      icon: <FiVideo />,
      title: "HD Video Calling",
      description:
        "Connect with multiple people through smooth, real-time video and audio communication.",
    },
    {
      icon: <FiMonitor />,
      title: "Screen Sharing",
      description:
        "Share your screen instantly for presentations, meetings, coding sessions and collaboration.",
    },
    {
      icon: <FiMessageCircle />,
      title: "Real-Time Chat",
      description:
        "Send instant messages while you're in a meeting without interrupting the conversation.",
    },
    {
      icon: <FiFile />,
      title: "File Sharing",
      description:
        "Share documents, images and other files with everyone in your meeting.",
    },
    {
      icon: <FiEdit3 />,
      title: "Collaborative Whiteboard",
      description:
        "Draw, write and brainstorm together on a shared real-time whiteboard.",
    },
    {
      icon: <FiShield />,
      title: "Secure Communication",
      description:
        "Authentication and secure communication help keep your meetings protected.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create a meeting",
      description:
        "Create your meeting room with just one click and get a unique meeting ID.",
    },
    {
      number: "02",
      title: "Share the invite",
      description:
        "Send your meeting ID or invite link to your teammates, friends or classmates.",
    },
    {
      number: "03",
      title: "Connect & collaborate",
      description:
        "Start your video call, share your screen, chat, exchange files and collaborate.",
    },
  ];

  return (
    <main>

      {/* ================= HERO ================= */}
      <section className="hero">

        <div className="hero-background-circle circle-one"></div>
        <div className="hero-background-circle circle-two"></div>

        <div className="hero-container">

          {/* Hero Content */}
          <div className="hero-content">

            <div className="hero-badge">
              <span className="badge-dot"></span>
              Real-time collaboration platform
            </div>

            <h1>
              Connect.
              <br />
              <span>Collaborate.</span>
              <br />
              Create.
            </h1>

            <p>
              A powerful communication platform for video
              meetings, real-time collaboration, screen sharing,
              file sharing and more.
            </p>

            <div className="hero-buttons">

              <Link to="/register" className="primary-btn">
                Start a Meeting
                <FiArrowRight />
              </Link>

              <Link to="/login" className="secondary-btn">
                <FiPlay />
                Join a Meeting
              </Link>

            </div>

            <div className="hero-trust">

              <div className="trust-users">
                <div>A</div>
                <div>S</div>
                <div>V</div>
                <div>R</div>
              </div>

              <div>
                <strong>Built for collaboration</strong>
                <span>Connect with your team anywhere.</span>
              </div>

            </div>

          </div>

          {/* Hero Visual */}
          <div className="hero-visual">

            <div className="meeting-preview">

              {/* Window Header */}
              <div className="preview-header">

                <div className="window-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="preview-title">
                  CONNECT Meeting
                </div>

                <div className="meeting-status">
                  <span></span>
                  Live
                </div>

              </div>

              {/* Video Grid */}
              <div className="preview-grid">

                <div className="preview-card participant-one">
                  <div className="participant-avatar">A</div>

                  <div className="participant-info">
                    <span>Ashwini</span>
                    <small>🎤</small>
                  </div>
                </div>

                <div className="preview-card participant-two">
                  <div className="participant-avatar">S</div>

                  <div className="participant-info">
                    <span>Sahil</span>
                    <small>🎤</small>
                  </div>
                </div>

                <div className="preview-card participant-three">
                  <div className="participant-avatar">V</div>

                  <div className="participant-info">
                    <span>Vikash</span>
                    <small>🎤</small>
                  </div>
                </div>

                <div className="preview-card participant-four">
                  <div className="participant-avatar">
                    <FiUsers />
                  </div>

                  <div className="participant-info">
                    <span>+3 participants</span>
                  </div>
                </div>

              </div>

              {/* Meeting Controls */}
              <div className="preview-controls">

                <button>
                  <FiVideo />
                </button>

                <button>
                  <FiMessageCircle />
                </button>

                <button>
                  <FiMonitor />
                </button>

                <button className="preview-end">
                  <FiVideo />
                </button>

              </div>

            </div>

            {/* Floating Chat */}
            <div className="floating-chat">
              <div className="floating-chat-icon">
                <FiMessageCircle />
              </div>

              <div>
                <strong>Real-time chat</strong>
                <span>Hey! Welcome 👋</span>
              </div>
            </div>

            {/* Floating Users */}
            <div className="floating-users">
              <FiUsers />
              <span>7 people connected</span>
            </div>

          </div>

        </div>

      </section>

      {/* ================= FEATURES ================= */}
      <section className="features-section" id="features">

        <div className="section-container">

          <div className="section-heading">

            <span className="section-label">
              POWERFUL FEATURES
            </span>

            <h2>
              Everything you need to
              <br />
              <span>stay connected.</span>
            </h2>

            <p>
              CONNECT combines communication and collaboration
              tools into one simple platform.
            </p>

          </div>

          <div className="features-grid">

            {features.map((feature, index) => (
              <div className="feature-card" key={index}>

                <div className="feature-icon">
                  {feature.icon}
                </div>

                <h3>{feature.title}</h3>

                <p>{feature.description}</p>

                <div className="feature-arrow">
                  <FiArrowRight />
                </div>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="how-section" id="how-it-works">

        <div className="section-container">

          <div className="section-heading">

            <span className="section-label">
              HOW IT WORKS
            </span>

            <h2>
              Start connecting in
              <br />
              <span>three simple steps.</span>
            </h2>

          </div>

          <div className="steps-container">

            {steps.map((step, index) => (
              <div className="step-card" key={index}>

                <div className="step-number">
                  {step.number}
                </div>

                <div className="step-line"></div>

                <h3>{step.title}</h3>

                <p>{step.description}</p>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* ================= COLLABORATION ================= */}
      <section className="collaboration-section" id="about">

        <div className="collaboration-container">

          <div className="collaboration-content">

            <span className="section-label">
              BUILT FOR COLLABORATION
            </span>

            <h2>
              More than a
              <br />
              <span>video call.</span>
            </h2>

            <p>
              CONNECT gives teams everything they need to
              communicate, share ideas and work together
              in real time.
            </p>

            <div className="check-list">

              <div>
                <span>
                  <FiCheck />
                </span>
                Multi-user video conferencing
              </div>

              <div>
                <span>
                  <FiCheck />
                </span>
                Real-time messaging
              </div>

              <div>
                <span>
                  <FiCheck />
                </span>
                Screen and file sharing
              </div>

              <div>
                <span>
                  <FiCheck />
                </span>
                Collaborative whiteboard
              </div>

            </div>

            <Link to="/register" className="text-btn">
              Start collaborating
              <FiArrowRight />
            </Link>

          </div>

          <div className="collaboration-visual">

            <div className="collab-card">

              <div className="collab-header">
                <span>Team Workspace</span>
                <FiUsers />
              </div>

              <div className="collab-content">

                <div className="collab-video">
                  <div className="big-avatar">A</div>
                  <span>Ashwini</span>
                </div>

                <div className="collab-chat">

                  <div className="chat-title">
                    <FiMessageCircle />
                    Live Chat
                  </div>

                  <div className="message">
                    <strong>Sahil</strong>
                    <span>Ready to start?</span>
                  </div>

                  <div className="message">
                    <strong>Vikash</strong>
                    <span>Yes! 🚀</span>
                  </div>

                  <div className="chat-input">
                    Type a message...
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= CTA ================= */}
      <section className="cta-section">

        <div className="cta-container">

          <span className="section-label">
            READY TO CONNECT?
          </span>

          <h2>
            Bring your team
            <br />
            <span>together.</span>
          </h2>

          <p>
            Create a meeting and start collaborating
            in seconds.
          </p>

          <Link to="/register" className="primary-btn cta-btn">
            Get Started
            <FiArrowRight />
          </Link>

        </div>

      </section>

      {/* ================= FOOTER ================= */}
      <footer className="footer">

        <div className="footer-container">

          <div className="footer-brand">

            <div className="footer-logo">
              <div className="logo-icon">
                <FiVideo />
              </div>

              <span>CONNECT</span>
            </div>

            <p>
              Real-time communication and
              collaboration made simple.
            </p>

          </div>

          <div className="footer-links">

            <div>
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#about">About</a>
            </div>

            <div>
              <h4>Account</h4>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>

          </div>

        </div>

        <div className="footer-bottom">
          <span>© 2026 CONNECT. All rights reserved.</span>

          <span>
            Built for real-time collaboration.
          </span>
        </div>

      </footer>

    </main>
  );
};

export default Home;