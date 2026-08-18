import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiHome,
  FiVideo,
  FiCalendar,
  FiMessageSquare,
  FiFolder,
  FiSettings,
  FiLogOut,
  FiClock,
  FiUsers,
  FiPlus,
  FiX,
  FiTrash2,
  FiCopy,
  FiCheck,
  FiArrowUpRight,
  FiFileText,
} from "react-icons/fi";

// ======================================================
// API URL
// ======================================================

// Works with either:
// VITE_API_URL=http://localhost:5000
// OR
// VITE_API_URL=http://localhost:5000/api

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const API_URL = RAW_API_URL.replace(/\/+$/, "").replace(
  /\/api$/,
  ""
);

// ======================================================
// COMPONENT
// ======================================================

const Schedule = () => {
  const navigate = useNavigate();

  // ====================================================
  // USER
  // ====================================================

  const [user, setUser] = useState({
    id: "",
    name: "User",
    email: "",
  });

  // ====================================================
  // PAGE STATE
  // ====================================================

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [scheduledMeetings, setScheduledMeetings] =
    useState([]);

  const [formError, setFormError] = useState("");
  const [apiError, setApiError] = useState("");

  // ====================================================
  // FORM
  // ====================================================

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    duration: "30",
    description: "",
    participants: "",
  });

  // ====================================================
  // GET TOKEN
  // ====================================================

  const getToken = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    return token ? token.trim() : null;
  };

  // ====================================================
  // AUTH HEADERS
  // ====================================================

  const getAuthHeaders = () => {
    const token = getToken();

    if (!token) {
      return null;
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // ====================================================
  // LOGOUT
  // ====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");

    navigate("/login", {
      replace: true,
    });
  };

  // ====================================================
  // LOAD SAVED USER
  // ====================================================

  const loadSavedUser = () => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        return;
      }

      const parsedUser = JSON.parse(savedUser);

      setUser({
        id:
          parsedUser.id ||
          parsedUser._id ||
          "",
        name: parsedUser.name || "User",
        email: parsedUser.email || "",
      });
    } catch (error) {
      console.error(
        "FAILED TO LOAD SAVED USER:",
        error
      );
    }
  };

  // ====================================================
  // PARSE API RESPONSE
  // ====================================================

  const parseResponse = async (response) => {
    const text = await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      console.error(
        "INVALID SERVER RESPONSE:",
        text
      );

      throw new Error(
        `Server returned an invalid response (${response.status}).`
      );
    }
  };

  // ====================================================
  // VERIFY AUTHENTICATION
  // ====================================================

  const verifyAuthentication = async () => {
    const headers = getAuthHeaders();

    if (!headers) {
      return false;
    }

    try {
      console.log(
        "VERIFYING TOKEN:",
        `${API_URL}/api/auth/me`
      );

      const response = await fetch(
        `${API_URL}/api/auth/me`,
        {
          method: "GET",
          headers,
        }
      );

      const data = await parseResponse(response);

      console.log(
        "AUTH RESPONSE:",
        response.status,
        data
      );

      if (!response.ok) {
        console.error(
          "TOKEN VERIFICATION FAILED:",
          data
        );

        return false;
      }

      if (data.user) {
        const currentUser = {
          id:
            data.user.id ||
            data.user._id ||
            "",
          name: data.user.name || "User",
          email: data.user.email || "",
        };

        setUser(currentUser);

        localStorage.setItem(
          "user",
          JSON.stringify(currentUser)
        );
      }

      return true;
    } catch (error) {
      console.error(
        "AUTH VERIFICATION ERROR:",
        error
      );

      return false;
    }
  };

  // ====================================================
  // FETCH MEETINGS
  // ====================================================

  const fetchMeetings = async () => {
    const headers = getAuthHeaders();

    if (!headers) {
      handleLogout();
      return;
    }

    try {
      setLoading(true);
      setApiError("");

      console.log(
        "FETCHING MEETINGS:",
        `${API_URL}/api/meetings`
      );

      const response = await fetch(
        `${API_URL}/api/meetings`,
        {
          method: "GET",
          headers,
        }
      );

      const data = await parseResponse(response);

      console.log(
        "MEETINGS API RESPONSE:",
        response.status,
        data
      );

      if (response.status === 401) {
        setApiError(
          "Your login session has expired. Please login again."
        );

        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch meetings."
        );
      }

      setScheduledMeetings(
        Array.isArray(data.meetings)
          ? data.meetings
          : []
      );
    } catch (error) {
      console.error(
        "FETCH MEETINGS ERROR:",
        error
      );

      setApiError(
        error.message ||
          "Unable to load meetings."
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // INITIAL PAGE LOAD
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const initializePage = async () => {
      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      loadSavedUser();

      const authenticated =
        await verifyAuthentication();

      if (!mounted) {
        return;
      }

      if (!authenticated) {
        handleLogout();
        return;
      }

      await fetchMeetings();
    };

    initializePage();

    return () => {
      mounted = false;
    };
  }, []);

  // ====================================================
  // NAVIGATION
  // ====================================================

  const handleNavigation = (menu) => {
    switch (menu) {
      case "Dashboard":
        navigate("/dashboard");
        break;

      case "Meetings":
        navigate("/dashboard");
        break;

      case "Schedule":
        navigate("/schedule");
        break;

      case "Messages":
        console.log("Messages clicked");
        break;

      case "Files":
        console.log("Files clicked");
        break;

      case "Settings":
        console.log("Settings clicked");
        break;

      default:
        break;
    }
  };

  // ====================================================
  // FORM CHANGE
  // ====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError("");
  };

  // ====================================================
  // OPEN FORM
  // ====================================================

  const openScheduleForm = () => {
    setFormError("");
    setApiError("");

    setFormData({
      title: "",
      date: "",
      time: "",
      duration: "30",
      description: "",
      participants: "",
    });

    setShowForm(true);
  };

  // ====================================================
  // CLOSE FORM
  // ====================================================

  const closeScheduleForm = () => {
    setShowForm(false);
    setFormError("");
  };

  // ====================================================
  // SCHEDULE MEETING
  // ====================================================

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();

    const headers = getAuthHeaders();

    if (!headers) {
      handleLogout();
      return;
    }

    const {
      title,
      date,
      time,
      duration,
      description,
      participants,
    } = formData;

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (!title.trim()) {
      setFormError(
        "Please enter a meeting title."
      );
      return;
    }

    if (!date) {
      setFormError(
        "Please select a meeting date."
      );
      return;
    }

    if (!time) {
      setFormError(
        "Please select a meeting time."
      );
      return;
    }

    const selectedDateTime = new Date(
      `${date}T${time}`
    );

    if (
      Number.isNaN(
        selectedDateTime.getTime()
      )
    ) {
      setFormError(
        "Please select a valid date and time."
      );
      return;
    }

    if (selectedDateTime <= new Date()) {
      setFormError(
        "Please select a future date and time."
      );
      return;
    }

    // --------------------------------------------------
    // PARTICIPANTS
    // --------------------------------------------------

    const participantList = participants
      .split(",")
      .map((email) =>
        email.trim().toLowerCase()
      )
      .filter(Boolean);

    // --------------------------------------------------
    // CREATE MEETING
    // --------------------------------------------------

    try {
      setFormError("");
      setApiError("");

      console.log(
        "CREATING MEETING:",
        `${API_URL}/api/meetings`
      );

      const response = await fetch(
        `${API_URL}/api/meetings`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            title: title.trim(),
            date,
            time,
            duration,
            description:
              description.trim(),
            participants:
              participantList,
          }),
        }
      );

      const data =
        await parseResponse(response);

      console.log(
        "CREATE MEETING RESPONSE:",
        response.status,
        data
      );

      // ------------------------------------------------
      // UNAUTHORIZED
      // ------------------------------------------------

      if (response.status === 401) {
        setFormError(
          "Your login session has expired. Please login again."
        );

        setTimeout(() => {
          handleLogout();
        }, 1000);

        return;
      }

      // ------------------------------------------------
      // API ERROR
      // ------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to schedule meeting."
        );
      }

      // ------------------------------------------------
      // SUCCESS
      // ------------------------------------------------

      if (data.meeting) {
        setScheduledMeetings(
          (previous) => [
            data.meeting,
            ...previous,
          ]
        );
      }

      setFormData({
        title: "",
        date: "",
        time: "",
        duration: "30",
        description: "",
        participants: "",
      });

      setShowForm(false);
      setFormError("");

      await fetchMeetings();
    } catch (error) {
      console.error(
        "CREATE MEETING ERROR:",
        error
      );

      setFormError(
        error.message ||
          "Unable to schedule meeting."
      );
    }
  };

  // ====================================================
  // DELETE MEETING
  // ====================================================

  const handleDeleteMeeting = async (
    meetingId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this scheduled meeting?"
      );

    if (!confirmed) {
      return;
    }

    const headers = getAuthHeaders();

    if (!headers) {
      handleLogout();
      return;
    }

    try {
      setApiError("");

      const response = await fetch(
        `${API_URL}/api/meetings/${meetingId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data =
        await parseResponse(response);

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete meeting."
        );
      }

      setScheduledMeetings(
        (previous) =>
          previous.filter(
            (meeting) =>
              meeting.meetingId !==
              meetingId
          )
      );
    } catch (error) {
      console.error(
        "DELETE MEETING ERROR:",
        error
      );

      setApiError(
        error.message ||
          "Unable to delete meeting."
      );
    }
  };

  // ====================================================
  // JOIN MEETING
  // ====================================================

  const handleJoinMeeting = (
    meetingId
  ) => {
    if (!meetingId) {
      return;
    }

    navigate(
      `/meeting/setup/${meetingId}`
    );
  };

  // ====================================================
  // COPY MEETING LINK
  // ====================================================

  const handleCopyLink = async (
    meetingId
  ) => {
    if (!meetingId) {
      return;
    }

    const link =
      `${window.location.origin}/meeting/${meetingId}`;

    try {
      await navigator.clipboard.writeText(
        link
      );

      setCopiedId(meetingId);

      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      console.error(
        "COPY LINK ERROR:",
        error
      );

      setApiError(
        "Unable to copy meeting link."
      );
    }
  };

  // ====================================================
  // FORMAT DATE
  // ====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(
      `${date}T00:00:00`
    );

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // ====================================================
  // FORMAT TIME
  // ====================================================

  const formatTime = (time) => {
    if (!time) {
      return "";
    }

    const [
      hours,
      minutes,
    ] = time.split(":");

    const parsedTime = new Date();

    parsedTime.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return parsedTime.toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  // ====================================================
  // UPCOMING MEETINGS
  // ====================================================

  const upcomingMeetings =
    scheduledMeetings
      .filter((meeting) => {
        if (
          !meeting.date ||
          !meeting.time
        ) {
          return false;
        }

        const meetingDate =
          new Date(
            `${meeting.date}T${meeting.time}`
          );

        return (
          !Number.isNaN(
            meetingDate.getTime()
          ) &&
          meetingDate >= new Date()
        );
      })
      .sort((a, b) => {
        const dateA =
          new Date(
            `${a.date}T${a.time}`
          );

        const dateB =
          new Date(
            `${b.date}T${b.time}`
          );

        return dateA - dateB;
      });

  // ====================================================
  // USER INITIAL
  // ====================================================

  const userInitial =
    user?.name
      ?.charAt(0)
      .toUpperCase() || "U";

  // ====================================================
  // MIN DATE
  // ====================================================

  const minDate =
    new Date()
      .toISOString()
      .split("T")[0];

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="dashboard">

      {/* SIDEBAR */}

      <aside className="dashboard-sidebar">

        <button
          type="button"
          className="dashboard-logo"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <div className="dashboard-logo-icon">
            <FiVideo />
          </div>

          <span>CONNECT</span>
        </button>

        <div className="sidebar-section">

          <p className="sidebar-label">
            MENU
          </p>

          <nav className="sidebar-nav">

            <button
              type="button"
              className="sidebar-item"
              onClick={() =>
                handleNavigation(
                  "Dashboard"
                )
              }
            >
              <FiHome />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className="sidebar-item"
              onClick={() =>
                handleNavigation(
                  "Meetings"
                )
              }
            >
              <FiVideo />
              <span>Meetings</span>
            </button>

            <button
              type="button"
              className="sidebar-item active"
            >
              <FiCalendar />
              <span>Schedule</span>
            </button>

            <button
              type="button"
              className="sidebar-item"
              onClick={() =>
                handleNavigation(
                  "Messages"
                )
              }
            >
              <FiMessageSquare />
              <span>Messages</span>
            </button>

            <button
              type="button"
              className="sidebar-item"
              onClick={() =>
                handleNavigation(
                  "Files"
                )
              }
            >
              <FiFolder />
              <span>Files</span>
            </button>

          </nav>
        </div>

        <div className="sidebar-bottom">

          <nav className="sidebar-nav">

            <button
              type="button"
              className="sidebar-item"
              onClick={() =>
                handleNavigation(
                  "Settings"
                )
              }
            >
              <FiSettings />
              <span>Settings</span>
            </button>

            <button
              type="button"
              className="sidebar-item logout"
              onClick={handleLogout}
            >
              <FiLogOut />
              <span>Logout</span>
            </button>

          </nav>

        </div>

      </aside>

      {/* MAIN */}

      <main className="dashboard-main">

        <header className="dashboard-header">

          <div className="dashboard-mobile-logo">

            <div className="dashboard-logo-icon">
              <FiVideo />
            </div>

            <span>CONNECT</span>

          </div>

          <div className="dashboard-header-right">

            <div className="profile">

              <div className="profile-avatar">
                {userInitial}
              </div>

              <div className="profile-info">

                <strong>
                  {user?.name || "User"}
                </strong>

                <span>Online</span>

              </div>

            </div>

          </div>

        </header>

        {/* CONTENT */}

        <div className="dashboard-content">

          <section className="dashboard-intro">

            <div>

              <span className="dashboard-date">
                MEETINGS
              </span>

              <h1>
                Schedule a{" "}
                <span>meeting.</span>
              </h1>

              <p>
                Plan your next meeting
                and invite your team.
              </p>

            </div>

            <button
              type="button"
              className="auth-submit"
              onClick={
                openScheduleForm
              }
            >
              <FiPlus />
              Schedule meeting
            </button>

          </section>

          {/* API ERROR */}

          {apiError && (
            <div
              className="auth-error"
              role="alert"
              style={{
                marginBottom: "20px",
              }}
            >
              {apiError}
            </div>
          )}

          {/* UPCOMING MEETINGS */}

          <section className="meetings-section">

            <div className="section-header">

              <div>

                <h2>
                  Upcoming meetings
                </h2>

                <p>
                  Meetings you have
                  scheduled
                </p>

              </div>

              <span>
                {upcomingMeetings.length}{" "}
                {upcomingMeetings.length ===
                1
                  ? "meeting"
                  : "meetings"}
              </span>

            </div>

            {loading ? (

              <div
                className="stat-card"
                style={{
                  textAlign: "center",
                  padding: "50px 30px",
                }}
              >

                <div
                  className="stat-icon"
                  style={{
                    margin:
                      "0 auto 20px",
                  }}
                >
                  <FiClock />
                </div>

                <h3>
                  Loading meetings...
                </h3>

                <p>
                  Fetching your meetings
                  from the server.
                </p>

              </div>

            ) : upcomingMeetings.length ===
              0 ? (

              <div
                className="stat-card"
                style={{
                  textAlign: "center",
                  padding: "50px 30px",
                }}
              >

                <div
                  className="stat-icon"
                  style={{
                    margin:
                      "0 auto 20px",
                  }}
                >
                  <FiCalendar />
                </div>

                <h3>
                  No upcoming meetings
                </h3>

                <p>
                  You haven't scheduled
                  any meetings yet.
                </p>

                <button
                  type="button"
                  className="auth-submit"
                  style={{
                    marginTop: "20px",
                    display: "inline-flex",
                  }}
                  onClick={
                    openScheduleForm
                  }
                >
                  <FiPlus />
                  Schedule your first
                  meeting
                </button>

              </div>

            ) : (

              <div className="meetings-list">

                {upcomingMeetings.map(
                  (meeting) => (

                    <div
                      className="meeting-row"
                      key={
                        meeting._id ||
                        meeting.meetingId
                      }
                    >

                      <div className="meeting-info">

                        <div className="meeting-avatar">
                          {meeting.title
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <strong>
                            {meeting.title}
                          </strong>

                          <span>
                            {formatDate(
                              meeting.date
                            )}{" "}
                            ·{" "}
                            {formatTime(
                              meeting.time
                            )}
                          </span>

                        </div>

                      </div>

                      <div
                        className="meeting-participants"
                        title="Duration"
                      >
                        <FiClock />
                        {meeting.duration} min
                      </div>

                      <div
                        className="meeting-participants"
                        title="Participants"
                      >
                        <FiUsers />
                        {meeting
                          .participants
                          ?.length || 0}
                      </div>

                      <button
                        type="button"
                        className="meeting-more"
                        title="Copy meeting link"
                        onClick={() =>
                          handleCopyLink(
                            meeting.meetingId
                          )
                        }
                      >
                        {copiedId ===
                        meeting.meetingId ? (
                          <FiCheck />
                        ) : (
                          <FiCopy />
                        )}
                      </button>

                      <button
                        type="button"
                        className="meeting-more"
                        title="Delete meeting"
                        onClick={() =>
                          handleDeleteMeeting(
                            meeting.meetingId
                          )
                        }
                      >
                        <FiTrash2 />
                      </button>

                      <button
                        type="button"
                        className="modal-submit"
                        onClick={() =>
                          handleJoinMeeting(
                            meeting.meetingId
                          )
                        }
                      >
                        Join
                        <FiArrowUpRight />
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        </div>

      </main>

      {/* SCHEDULE MODAL */}

      {showForm && (

        <div
          className="modal-overlay"
          onClick={
            closeScheduleForm
          }
        >

          <div
            className="join-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              className="modal-close"
              onClick={
                closeScheduleForm
              }
              title="Close"
            >
              <FiX />
            </button>

            <div className="modal-icon">
              <FiCalendar />
            </div>

            <h2>
              Schedule a meeting
            </h2>

            <p>
              Choose a date and time
              for your meeting.
            </p>

            {formError && (
              <div
                className="auth-error"
                role="alert"
              >
                {formError}
              </div>
            )}

            <form
              onSubmit={
                handleScheduleMeeting
              }
            >

              {/* TITLE */}

              <div className="form-group">

                <label htmlFor="title">
                  Meeting title
                </label>

                <div className="modal-input">

                  <FiVideo />

                  <input
                    id="title"
                    type="text"
                    name="title"
                    placeholder="e.g. Team Standup"
                    value={
                      formData.title
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

              </div>

              {/* DATE */}

              <div className="form-group">

                <label htmlFor="date">
                  Date
                </label>

                <div className="modal-input">

                  <FiCalendar />

                  <input
                    id="date"
                    type="date"
                    name="date"
                    value={
                      formData.date
                    }
                    onChange={
                      handleChange
                    }
                    min={minDate}
                    required
                  />

                </div>

              </div>

              {/* TIME */}

              <div className="form-group">

                <label htmlFor="time">
                  Start time
                </label>

                <div className="modal-input">

                  <FiClock />

                  <input
                    id="time"
                    type="time"
                    name="time"
                    value={
                      formData.time
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

              </div>

              {/* DURATION */}

              <div className="form-group">

                <label htmlFor="duration">
                  Duration
                </label>

                <div className="modal-input">

                  <FiClock />

                  <select
                    id="duration"
                    name="duration"
                    value={
                      formData.duration
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="15">
                      15 minutes
                    </option>

                    <option value="30">
                      30 minutes
                    </option>

                    <option value="45">
                      45 minutes
                    </option>

                    <option value="60">
                      1 hour
                    </option>

                    <option value="90">
                      1 hour 30 minutes
                    </option>

                    <option value="120">
                      2 hours
                    </option>

                  </select>

                </div>

              </div>

              {/* PARTICIPANTS */}

              <div className="form-group">

                <label htmlFor="participants">
                  Participants
                </label>

                <div className="modal-input">

                  <FiUsers />

                  <input
                    id="participants"
                    type="text"
                    name="participants"
                    placeholder="email1@example.com, email2@example.com"
                    value={
                      formData.participants
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

                <small className="input-hint">
                  Separate multiple emails
                  with commas.
                </small>

              </div>

              {/* DESCRIPTION */}

              <div className="form-group">

                <label htmlFor="description">
                  Description
                </label>

                <div className="modal-input">

                  <FiFileText />

                  <textarea
                    id="description"
                    name="description"
                    placeholder="Add meeting details..."
                    value={
                      formData.description
                    }
                    onChange={
                      handleChange
                    }
                    rows="3"
                  />

                </div>

              </div>

              {/* BUTTONS */}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "20px",
                }}
              >

                <button
                  type="button"
                  className="meeting-more"
                  style={{
                    flex: 1,
                  }}
                  onClick={
                    closeScheduleForm
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-submit"
                  style={{
                    flex: 2,
                  }}
                >
                  Schedule meeting
                  <FiArrowUpRight />
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Schedule;

