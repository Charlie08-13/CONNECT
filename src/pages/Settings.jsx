import React from "react";
import {
  FiArrowLeft,
  FiBell,
  FiLock,
  FiUser,
  FiVideo,
  FiSave,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    React.useState(true);

  const [camera, setCamera] =
    React.useState(true);

  const [microphone, setMicrophone] =
    React.useState(true);

  const [profile, setProfile] =
    React.useState(() => {
      try {
        const savedUser =
          localStorage.getItem("user");

        return savedUser
          ? JSON.parse(savedUser)
          : {
              name: "User",
              email: "",
            };
      } catch {
        return {
          name: "User",
          email: "",
        };
      }
    });

  const handleSave = () => {
    localStorage.setItem(
      "user",
      JSON.stringify(profile)
    );

    alert("Settings saved successfully.");
  };

  return (
    <div className="settings-page">

      {/* HEADER */}
      <header className="settings-header">

        <button
          type="button"
          className="settings-back"
          onClick={() => navigate("/dashboard")}
        >
          <FiArrowLeft />
          <span>Back to dashboard</span>
        </button>

        <div>
          <h1>Settings</h1>
          <p>
            Manage your account and meeting preferences.
          </p>
        </div>

      </header>

      {/* CONTENT */}
      <main className="settings-content">

        {/* PROFILE */}
        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              <FiUser />
            </div>

            <div>
              <h2>Profile</h2>
              <p>
                Update your personal information.
              </p>
            </div>

          </div>

          <div className="settings-form">

            <div className="settings-field">

              <label>Name</label>

              <input
                type="text"
                value={profile.name || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    name: e.target.value,
                  })
                }
                placeholder="Your name"
              />

            </div>

            <div className="settings-field">

              <label>Email</label>

              <input
                type="email"
                value={profile.email || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    email: e.target.value,
                  })
                }
                placeholder="Your email"
              />

            </div>

          </div>

        </section>

        {/* MEETING SETTINGS */}
        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              <FiVideo />
            </div>

            <div>
              <h2>Meeting preferences</h2>
              <p>
                Configure your default meeting behavior.
              </p>
            </div>

          </div>

          <div className="settings-options">

            <div className="settings-option">

              <div className="settings-option-info">

                <strong>
                  Start camera automatically
                </strong>

                <span>
                  Turn on your camera when joining a meeting.
                </span>

              </div>

              <button
                type="button"
                className={`settings-toggle ${
                  camera ? "active" : ""
                }`}
                onClick={() =>
                  setCamera(!camera)
                }
                aria-label="Toggle camera"
              >
                <span />
              </button>

            </div>

            <div className="settings-option">

              <div className="settings-option-info">

                <strong>
                  Start microphone automatically
                </strong>

                <span>
                  Turn on your microphone when joining.
                </span>

              </div>

              <button
                type="button"
                className={`settings-toggle ${
                  microphone ? "active" : ""
                }`}
                onClick={() =>
                  setMicrophone(!microphone)
                }
                aria-label="Toggle microphone"
              >
                <span />
              </button>

            </div>

          </div>

        </section>

        {/* NOTIFICATIONS */}
        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              <FiBell />
            </div>

            <div>
              <h2>Notifications</h2>
              <p>
                Control how CONNECT notifies you.
              </p>
            </div>

          </div>

          <div className="settings-options">

            <div className="settings-option">

              <div className="settings-option-info">

                <strong>
                  Meeting notifications
                </strong>

                <span>
                  Receive notifications about upcoming meetings.
                </span>

              </div>

              <button
                type="button"
                className={`settings-toggle ${
                  notifications ? "active" : ""
                }`}
                onClick={() =>
                  setNotifications(!notifications)
                }
                aria-label="Toggle notifications"
              >
                <span />
              </button>

            </div>

          </div>

        </section>

        {/* SECURITY */}
        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              <FiLock />
            </div>

            <div>
              <h2>Security</h2>
              <p>
                Manage your account security.
              </p>
            </div>

          </div>

          <button
            type="button"
            className="settings-secondary-button"
          >
            Change password
          </button>

        </section>

        {/* SAVE */}
        <div className="settings-actions">

          <button
            type="button"
            className="settings-save-button"
            onClick={handleSave}
          >
            <FiSave />
            Save changes
          </button>

        </div>

      </main>

    </div>
  );
};

export default Settings;