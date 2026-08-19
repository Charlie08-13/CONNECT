import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FiHome,
  FiVideo,
  FiCalendar,
  FiMessageSquare,
  FiFolder,
  FiSettings,
  FiLogOut,
  FiArrowUpRight,
  FiClock,
  FiUsers,
  FiMoreHorizontal,
  FiBell,
  FiSearch,
  FiLink,
  FiX,
  FiUser,
  FiShield,
  FiVolume2,
  FiCamera,
  FiMic,
  FiCheck,
  FiRefreshCw,
  FiEye,
  FiExternalLink,
} from "react-icons/fi";

const Dashboard = () => {
  const navigate = useNavigate();

  // =====================================================
  // API
  // =====================================================
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");
  // =====================================================
  // USER
  // =====================================================

  const [user] = useState(() => {
    try {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (!token) {
        return null;
      }

      if (!savedUser) {
        return {
          id: "",
          name: "User",
          email: "",
        };
      }

      const parsedUser = JSON.parse(savedUser);

      return {
        id: parsedUser.id || parsedUser._id || "",
        name: parsedUser.name || "User",
        email: parsedUser.email || "",
      };
    } catch (error) {
      console.error("Failed to load logged-in user:", error);

      return {
        id: "",
        name: "User",
        email: "",
      };
    }
  });

  // =====================================================
  // AUTH CHECK
  // =====================================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        replace: true,
      });
    }
  }, [navigate]);

  // =====================================================
  // UI STATES
  // =====================================================

  const [activeMenu, setActiveMenu] =
    useState("Dashboard");

  const [showJoinModal, setShowJoinModal] =
    useState(false);

  const [showSettings, setShowSettings] =
    useState(false);

  const [showAllMeetings, setShowAllMeetings] =
    useState(false);

  const [selectedMeeting, setSelectedMeeting] =
    useState(null);

  const [meetingCode, setMeetingCode] =
    useState("");

  const [joinError, setJoinError] =
    useState("");

  // =====================================================
  // MEETING DATA
  // =====================================================

  const [meetings, setMeetings] =
    useState([]);

  const [loadingMeetings, setLoadingMeetings] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [meetingError, setMeetingError] =
    useState("");

  // =====================================================
  // SETTINGS
  // =====================================================

  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings =
        localStorage.getItem(
          "connectSettings"
        );

      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error(
        "Failed to load settings:",
        error
      );
    }

    return {
      notifications: true,
      sound: true,
      autoCamera: true,
      autoMic: true,
      darkMode: false,
    };
  });

  // =====================================================
  // FETCH MEETINGS
  // =====================================================

  const fetchMeetings = useCallback(
    async (showLoader = false) => {
      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        if (showLoader) {
          setLoadingMeetings(true);
        } else {
          setRefreshing(true);
        }

        setMeetingError("");

        console.log(
          "Fetching meetings from:",
          `${API_BASE_URL}/api/meetings`
        );

        const response = await fetch(
          `${API_BASE_URL}/api/meetings`,
          {
            method: "GET",
            headers: {
              "Content-Type":
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        console.log(
          "MEETINGS API RESPONSE:",
          data
        );

        // =================================================
        // AUTH ERROR
        // =================================================

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login", {
            replace: true,
          });

          return;
        }

        // =================================================
        // SERVER ERROR
        // =================================================

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to fetch meetings."
          );
        }

        // =================================================
        // HANDLE DIFFERENT API RESPONSE FORMATS
        // =================================================

        let fetchedMeetings = [];

        if (Array.isArray(data)) {
          fetchedMeetings = data;
        } else if (
          Array.isArray(data?.meetings)
        ) {
          fetchedMeetings =
            data.meetings;
        } else if (
          Array.isArray(data?.data)
        ) {
          fetchedMeetings =
            data.data;
        } else if (
          Array.isArray(data?.results)
        ) {
          fetchedMeetings =
            data.results;
        }

        console.log(
          "NORMALIZED MEETINGS:",
          fetchedMeetings
        );

        // =================================================
        // REMOVE INVALID VALUES
        // =================================================

        const validMeetings =
          fetchedMeetings.filter(
            (meeting) =>
              meeting &&
              typeof meeting ===
                "object"
          );

        setMeetings(validMeetings);
      } catch (error) {
        console.error(
          "FETCH MEETINGS ERROR:",
          error
        );

        setMeetingError(
          error.message ||
            "Unable to load meetings."
        );
      } finally {
        setLoadingMeetings(false);
        setRefreshing(false);
      }
    },
    [API_BASE_URL, navigate]
  );

  // =====================================================
  // INITIAL FETCH + AUTO REFRESH
  // =====================================================

  useEffect(() => {
    fetchMeetings(true);

    const interval =
      setInterval(() => {
        fetchMeetings(false);
      }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchMeetings]);

  // =====================================================
  // GENERATE MEETING ID
  // =====================================================

  const generateMeetingId = () => {
    const randomPart =
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    return `CONNECT-${randomPart}`;
  };

  // =====================================================
  // START NEW MEETING
  // =====================================================

  const handleCreateMeeting = () => {
    const newMeetingId =
      generateMeetingId();

    console.log(
      "Creating new meeting:",
      newMeetingId
    );

    navigate(
      `/meeting/setup/${encodeURIComponent(
        newMeetingId
      )}`
    );
  };

  // =====================================================
  // NORMALIZE MEETING ID
  // =====================================================

  const normalizeMeetingId = (
    value
  ) => {
    if (!value) {
      return "";
    }

    let code = value.trim();

    code = code.replace(
      /\s+/g,
      ""
    );

    if (
      code.startsWith("http://") ||
      code.startsWith("https://")
    ) {
      try {
        const url =
          new URL(code);

        code = url.pathname;
      } catch (error) {
        console.error(
          "Invalid meeting URL:",
          error
        );

        return "";
      }
    }

    code = code.split("?")[0];
    code = code.split("#")[0];

    code = code.replace(/^\/+/, "");
    code = code.replace(/\/+$/, "");

    if (
      code.startsWith(
        "meeting/setup/"
      )
    ) {
      code =
        code.substring(
          "meeting/setup/".length
        );
    } else if (
      code.startsWith("meeting/")
    ) {
      code =
        code.substring(
          "meeting/".length
        );
    }

    if (
      code.startsWith("setup/")
    ) {
      code =
        code.substring(
          "setup/".length
        );
    }

    if (code.includes("/")) {
      code =
        code.split("/")[0];
    }

    return code.trim().toUpperCase();
  };

  // =====================================================
  // VALIDATE MEETING ID
  // =====================================================

  const isValidMeetingId = (
    code
  ) => {
    if (!code) {
      return false;
    }

    return /^CONNECT-[A-Z0-9]{6}$/.test(
      code
    );
  };

  // =====================================================
  // JOIN MEETING
  // =====================================================

  const handleJoinMeeting = (e) => {
    e.preventDefault();

    setJoinError("");

    if (!meetingCode.trim()) {
      setJoinError(
        "Please enter a meeting code or meeting link."
      );

      return;
    }

    const normalizedCode =
      normalizeMeetingId(
        meetingCode
      );

    console.log(
      "Original meeting input:",
      meetingCode
    );

    console.log(
      "Normalized meeting ID:",
      normalizedCode
    );

    if (
      !isValidMeetingId(
        normalizedCode
      )
    ) {
      setJoinError(
        "Invalid meeting ID. Please enter a valid CONNECT-XXXXXX meeting code or link."
      );

      return;
    }

    setShowJoinModal(false);
    setMeetingCode("");
    setJoinError("");

    navigate(
      `/meeting/setup/${encodeURIComponent(
        normalizedCode
      )}`
    );
  };

  // =====================================================
  // CLOSE JOIN MODAL
  // =====================================================

  const handleCloseJoinModal = () => {
    setShowJoinModal(false);
    setMeetingCode("");
    setJoinError("");
  };

  // =====================================================
  // OPEN JOIN MODAL
  // =====================================================

  const handleOpenJoinModal = () => {
    setMeetingCode("");
    setJoinError("");
    setShowJoinModal(true);
  };

  // =====================================================
  // OPEN SETTINGS
  // =====================================================

  const handleOpenSettings = () => {
    setActiveMenu("Settings");
    setShowSettings(true);
  };

  // =====================================================
  // CLOSE SETTINGS
  // =====================================================

  const handleCloseSettings = () => {
    setShowSettings(false);
    setActiveMenu("Dashboard");
  };

  // =====================================================
  // UPDATE SETTING
  // =====================================================

  const handleSettingChange = (
    settingName
  ) => {
    setSettings(
      (previous) => ({
        ...previous,
        [settingName]:
          !previous[settingName],
      })
    );
  };

  // =====================================================
  // SAVE SETTINGS
  // =====================================================

  const handleSaveSettings = () => {
    localStorage.setItem(
      "connectSettings",
      JSON.stringify(settings)
    );

    setShowSettings(false);
    setActiveMenu("Dashboard");
  };

  // =====================================================
  // SIDEBAR NAVIGATION
  // =====================================================

  const handleMenuClick = (
    menuName
  ) => {
    setActiveMenu(menuName);

    switch (menuName) {
      case "Dashboard":
        setShowSettings(false);
        navigate("/dashboard");
        break;

      case "Schedule":
        setShowSettings(false);
        navigate("/schedule");
        break;

      case "Meetings":
        setShowSettings(false);

        // IMPORTANT:
        // Do not navigate to dashboard again.
        // Open the real meetings modal.
        setShowAllMeetings(true);

        fetchMeetings(false);
        break;

      case "Messages":
        setShowSettings(false);
        console.log(
          "Messages clicked"
        );
        break;

      case "Files":
        setShowSettings(false);
        console.log(
          "Files clicked"
        );
        break;

      case "Settings":
        handleOpenSettings();
        break;

      default:
        break;
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem(
      "rememberMe"
    );

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // VIEW MEETING
  // =====================================================

  const handleViewMeeting = (
    meeting
  ) => {
    console.log(
      "Viewing meeting:",
      meeting
    );

    setSelectedMeeting(meeting);
  };

  // =====================================================
  // CLOSE MEETING VIEW
  // =====================================================

  const handleCloseMeetingView =
    () => {
      setSelectedMeeting(null);
    };

  // =====================================================
  // CLOSE ALL MEETINGS
  // =====================================================

  const handleCloseAllMeetings =
    () => {
      setShowAllMeetings(false);
      setActiveMenu("Dashboard");
    };

  // =====================================================
  // MENU
  // =====================================================

  const menuItems = [
    {
      name: "Dashboard",
      icon: FiHome,
    },
    {
      name: "Meetings",
      icon: FiVideo,
    },
    {
      name: "Schedule",
      icon: FiCalendar,
    },
    {
      name: "Messages",
      icon: FiMessageSquare,
    },
    {
      name: "Files",
      icon: FiFolder,
    },
  ];

  const bottomMenu = [
    {
      name: "Settings",
      icon: FiSettings,
    },
  ];

  // =====================================================
  // DATE HELPERS
  // =====================================================

  const getMeetingDate = (
    meeting
  ) => {
    if (!meeting) {
      return null;
    }

    // Backend date + time
    if (meeting.date) {
      const dateTimeString =
        meeting.time
          ? `${meeting.date}T${meeting.time}`
          : meeting.date;

      const parsedDate =
        new Date(
          dateTimeString
        );

      if (
        !Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        return parsedDate;
      }
    }

    // Other common backend fields
    const possibleDates = [
      meeting.startTime,
      meeting.startAt,
      meeting.scheduledAt,
      meeting.datetime,
      meeting.createdAt,
      meeting.updatedAt,
    ];

    for (const value of possibleDates) {
      if (!value) {
        continue;
      }

      const parsedDate =
        new Date(value);

      if (
        !Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        return parsedDate;
      }
    }

    return null;
  };

  // =====================================================
  // CURRENT MONTH
  // =====================================================

  const currentDate =
    new Date();

  const currentMonth =
    currentDate.getMonth();

  const currentYear =
    currentDate.getFullYear();

  const meetingsThisMonth =
    meetings.filter(
      (meeting) => {
        const meetingDate =
          getMeetingDate(
            meeting
          );

        if (!meetingDate) {
          return false;
        }

        return (
          meetingDate.getMonth() ===
            currentMonth &&
          meetingDate.getFullYear() ===
            currentYear
        );
      }
    );

  // =====================================================
  // MEETING HOURS
  // =====================================================

  const totalMeetingMinutes =
    meetingsThisMonth.reduce(
      (total, meeting) => {
        const duration =
          Number(
            meeting.duration
          );

        if (
          Number.isFinite(
            duration
          ) &&
          duration > 0
        ) {
          return (
            total + duration
          );
        }

        return total;
      },
      0
    );

  const meetingHours =
    totalMeetingMinutes / 60;

  const formattedMeetingHours =
    meetingHours < 10
      ? meetingHours.toFixed(1)
      : Math.round(
          meetingHours
        ).toString();

  // =====================================================
  // PEOPLE CONNECTED
  // =====================================================

  const connectedPeople =
    new Set();

  meetings.forEach(
    (meeting) => {
      if (
        meeting.organizer
          ?.email
      ) {
        connectedPeople.add(
          meeting.organizer.email
            .toLowerCase()
        );
      }

      if (
        typeof meeting.organizer ===
        "string"
      ) {
        connectedPeople.add(
          meeting.organizer
            .toLowerCase()
        );
      }

      if (
        Array.isArray(
          meeting.participants
        )
      ) {
        meeting.participants.forEach(
          (participant) => {
            if (
              typeof participant ===
                "string" &&
              participant.trim()
            ) {
              connectedPeople.add(
                participant
                  .trim()
                  .toLowerCase()
              );
            }

            if (
              participant &&
              typeof participant ===
                "object"
            ) {
              const email =
                participant.email ||
                participant.user?.email;

              if (email) {
                connectedPeople.add(
                  email
                    .toLowerCase()
                );
              }
            }
          }
        );
      }
    }
  );

  const peopleConnected =
    connectedPeople.size;

  // =====================================================
  // RECENT MEETINGS
  // =====================================================

  const recentMeetings =
    [...meetings]
      .sort((a, b) => {
        const dateA =
          getMeetingDate(a);

        const dateB =
          getMeetingDate(b);

        if (
          !dateA &&
          !dateB
        ) {
          return 0;
        }

        if (!dateA) {
          return 1;
        }

        if (!dateB) {
          return -1;
        }

        return (
          dateB.getTime() -
          dateA.getTime()
        );
      })
      .slice(0, 5);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatMeetingDate =
    (meeting) => {
      const meetingDate =
        getMeetingDate(
          meeting
        );

      if (!meetingDate) {
        return "Date unavailable";
      }

      const today =
        new Date();

      const yesterday =
        new Date();

      yesterday.setDate(
        yesterday.getDate() - 1
      );

      if (
        meetingDate.toDateString() ===
        today.toDateString()
      ) {
        return "Today";
      }

      if (
        meetingDate.toDateString() ===
        yesterday.toDateString()
      ) {
        return "Yesterday";
      }

      return meetingDate.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      );
    };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatMeetingTime =
    (meeting) => {
      const meetingDate =
        getMeetingDate(
          meeting
        );

      if (!meetingDate) {
        return meeting?.time || "";
      }

      return meetingDate.toLocaleTimeString(
        "en-US",
        {
          hour: "numeric",
          minute: "2-digit",
        }
      );
    };

  // =====================================================
  // PARTICIPANT COUNT
  // =====================================================

  const getParticipantCount =
    (meeting) => {
      const uniqueParticipants =
        new Set();

      const participants =
        Array.isArray(
          meeting?.participants
        )
          ? meeting.participants
          : [];

      participants.forEach(
        (participant) => {
          if (
            typeof participant ===
              "string" &&
            participant.trim()
          ) {
            uniqueParticipants.add(
              participant
                .trim()
                .toLowerCase()
            );
          }

          if (
            participant &&
            typeof participant ===
              "object"
          ) {
            const email =
              participant.email ||
              participant.user
                ?.email;

            if (email) {
              uniqueParticipants.add(
                email
                  .toLowerCase()
              );
            }
          }
        }
      );

      if (
        meeting?.organizer
          ?.email
      ) {
        uniqueParticipants.add(
          meeting.organizer.email
            .toLowerCase()
        );
      }

      return uniqueParticipants.size;
    };

  // =====================================================
  // GET STATUS
  // =====================================================

  const getMeetingStatus =
    (meeting) => {
      const backendStatus =
        String(
          meeting?.status || ""
        ).toLowerCase();

      if (
        backendStatus ===
          "cancelled" ||
        backendStatus ===
          "canceled"
      ) {
        return "Cancelled";
      }

      if (
        backendStatus ===
        "completed"
      ) {
        return "Completed";
      }

      if (
        backendStatus ===
        "started"
      ) {
        return "Started";
      }

      if (
        backendStatus ===
        "in progress"
      ) {
        return "In progress";
      }

      const meetingDate =
        getMeetingDate(
          meeting
        );

      if (!meetingDate) {
        return "Scheduled";
      }

      const now =
        new Date();

      const duration =
        Number(
          meeting.duration
        ) || 30;

      const meetingEnd =
        new Date(
          meetingDate.getTime() +
            duration *
              60 *
              1000
        );

      if (
        meetingEnd < now
      ) {
        return "Completed";
      }

      if (
        meetingDate <= now &&
        now <= meetingEnd
      ) {
        return "In progress";
      }

      return "Scheduled";
    };

  // =====================================================
  // MEETING ID
  // =====================================================

  const getMeetingId =
    (meeting) => {
      return (
        meeting?.meetingId ||
        meeting?.roomId ||
        meeting?.code ||
        meeting?._id ||
        "N/A"
      );
    };

  // =====================================================
  // USER INITIAL
  // =====================================================

  const userInitial =
    user?.name
      ? user.name
          .charAt(0)
          .toUpperCase()
      : "U";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="dashboard">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="dashboard-sidebar">

        <Link
          to="/dashboard"
          className="dashboard-logo"
        >
          <div className="dashboard-logo-icon">
            <FiVideo />
          </div>

          <span>CONNECT</span>
        </Link>

        <div className="sidebar-section">

          <p className="sidebar-label">
            MENU
          </p>

          <nav className="sidebar-nav">

            {menuItems.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <button
                    key={
                      item.name
                    }
                    type="button"
                    className={`sidebar-item ${
                      activeMenu ===
                      item.name
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleMenuClick(
                        item.name
                      )
                    }
                  >
                    <Icon />

                    <span>
                      {
                        item.name
                      }
                    </span>
                  </button>
                );
              }
            )}

          </nav>

        </div>

        <div className="sidebar-bottom">

          <nav className="sidebar-nav">

            {bottomMenu.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <button
                    key={
                      item.name
                    }
                    type="button"
                    className={`sidebar-item ${
                      activeMenu ===
                      item.name
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleMenuClick(
                        item.name
                      )
                    }
                  >
                    <Icon />

                    <span>
                      {
                        item.name
                      }
                    </span>
                  </button>
                );
              }
            )}

            <button
              type="button"
              className="sidebar-item logout"
              onClick={
                handleLogout
              }
            >
              <FiLogOut />

              <span>
                Logout
              </span>
            </button>

          </nav>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div className="dashboard-mobile-logo">

            <div className="dashboard-logo-icon">
              <FiVideo />
            </div>

            <span>
              CONNECT
            </span>

          </div>

          <div className="dashboard-search">

            <FiSearch />

            <input
              type="text"
              placeholder="Search meetings..."
            />

          </div>

          <div className="dashboard-header-right">

            <button
              type="button"
              className="icon-button"
              title="Notifications"
            >
              <FiBell />

              {settings.notifications && (
                <span className="notification-dot" />
              )}
            </button>

            <div className="profile">

              <div className="profile-avatar">
                {userInitial}
              </div>

              <div className="profile-info">

                <strong>
                  {user?.name ||
                    "User"}
                </strong>

                <span>
                  Online
                </span>

              </div>

            </div>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="dashboard-content">

          {/* GREETING */}

          <section className="dashboard-intro">

            <div>

              <span className="dashboard-date">
                {new Date()
                  .toLocaleDateString(
                    "en-US",
                    {
                      weekday:
                        "long",
                      month:
                        "long",
                      day:
                        "numeric",
                    }
                  )
                  .toUpperCase()}
              </span>

              <h1>
                Good afternoon{" "}
                {user?.name ||
                  "there"}{" "}
                <span>
                  👋
                </span>
              </h1>

              <p>
                Ready to connect
                with your team?
              </p>

            </div>

            {/* IMPROVED REFRESH BUTTON */}

            <button
              type="button"
              className={`dashboard-refresh ${
                refreshing
                  ? "refreshing"
                  : ""
              }`}
              onClick={() =>
                fetchMeetings(
                  false
                )
              }
              disabled={
                refreshing
              }
              title="Refresh meetings"
            >
              <FiRefreshCw
                className={
                  refreshing
                    ? "refresh-spin"
                    : ""
                }
              />

              <span>
                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </span>
            </button>

          </section>

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section className="quick-actions">

            <button
              type="button"
              className="action-card primary-action"
              onClick={
                handleCreateMeeting
              }
            >
              <div className="action-icon">
                <FiVideo />
              </div>

              <div className="action-content">

                <span>
                  Start a meeting
                </span>

                <small>
                  Start an instant
                  video meeting
                </small>

              </div>

              <FiArrowUpRight
                className="action-arrow"
              />

            </button>

            <button
              type="button"
              className="action-card"
              onClick={
                handleOpenJoinModal
              }
            >
              <div className="action-icon">
                <FiLink />
              </div>

              <div className="action-content">

                <span>
                  Join a meeting
                </span>

                <small>
                  Enter a meeting
                  code or link
                </small>

              </div>

              <FiArrowUpRight
                className="action-arrow"
              />

            </button>

            <button
              type="button"
              className="action-card"
              onClick={() =>
                handleMenuClick(
                  "Schedule"
                )
              }
            >
              <div className="action-icon">
                <FiCalendar />
              </div>

              <div className="action-content">

                <span>
                  Schedule
                </span>

                <small>
                  Plan a meeting
                  for later
                </small>

              </div>

              <FiArrowUpRight
                className="action-arrow"
              />

            </button>

          </section>

          {/* ERROR */}

          {meetingError && (
            <div
              className="file-error"
              style={{
                marginBottom:
                  "20px",
              }}
            >
              <div className="file-error-icon">
                <FiX />
              </div>

              <div className="file-error-content">

                <strong>
                  Unable to load
                  meetings
                </strong>

                <span>
                  {
                    meetingError
                  }
                </span>

              </div>

              <button
                type="button"
                onClick={() =>
                  fetchMeetings(
                    true
                  )
                }
                style={{
                  marginLeft:
                    "auto",
                  border:
                    "none",
                  background:
                    "transparent",
                  cursor:
                    "pointer",
                  fontWeight:
                    600,
                }}
              >
                Retry
              </button>

            </div>
          )}

          {/* =================================================
              STATS
          ================================================= */}

          <section className="dashboard-stats">

            <div className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon">
                  <FiVideo />
                </div>

                <span className="stat-change">
                  Live
                </span>

              </div>

              <strong>
                {
                  meetingsThisMonth.length
                }
              </strong>

              <span>
                Meetings this month
              </span>

            </div>

            <div className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon">
                  <FiClock />
                </div>

                <span className="stat-change">
                  Live
                </span>

              </div>

              <strong>
                {
                  formattedMeetingHours
                }h
              </strong>

              <span>
                Meeting hours
              </span>

            </div>

            <div className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon">
                  <FiUsers />
                </div>

                <span className="stat-change">
                  Live
                </span>

              </div>

              <strong>
                {
                  peopleConnected
                }
              </strong>

              <span>
                People connected
              </span>

            </div>

          </section>

          {/* =================================================
              RECENT MEETINGS
          ================================================= */}

          <section className="meetings-section">

            <div className="section-header">

              <div>

                <h2>
                  Recent meetings
                </h2>

                <p>
                  Your latest
                  meeting activity
                </p>

              </div>

              {/* FIXED VIEW ALL */}

              <button
                type="button"
                className="view-all"
                onClick={() => {
                  setShowAllMeetings(
                    true
                  );
                  setActiveMenu(
                    "Meetings"
                  );
                  fetchMeetings(
                    false
                  );
                }}
              >
                View all

                <FiArrowUpRight />

              </button>

            </div>

            <div className="meetings-list">

              {/* LOADING */}

              {loadingMeetings ? (
                <div
                  className="empty-files"
                  style={{
                    padding:
                      "40px 20px",
                  }}
                >
                  <FiRefreshCw
                    className="refresh-spin"
                    style={{
                      fontSize:
                        "28px",
                    }}
                  />

                  <strong>
                    Loading meetings...
                  </strong>

                  <span>
                    Fetching your
                    latest meeting
                    activity.
                  </span>

                </div>
              ) : recentMeetings.length ===
                0 ? (
                <div
                  className="empty-files"
                  style={{
                    padding:
                      "40px 20px",
                  }}
                >
                  <div className="empty-files-illustration">

                    <div className="empty-files-icon">
                      <FiVideo />
                    </div>

                  </div>

                  <strong>
                    No meetings yet
                  </strong>

                  <span>
                    Your real
                    meetings will
                    appear here
                    after they are
                    created.
                  </span>

                  <button
                    type="button"
                    className="empty-files-button"
                    onClick={
                      handleCreateMeeting
                    }
                  >
                    <FiVideo />

                    Start your first
                    meeting
                  </button>

                </div>
              ) : (
                recentMeetings.map(
                  (
                    meeting,
                    index
                  ) => {

                    const status =
                      getMeetingStatus(
                        meeting
                      );

                    const meetingId =
                      getMeetingId(
                        meeting
                      );

                    return (
                      <div
                        className="meeting-row"
                        key={
                          meeting._id ||
                          meeting.meetingId ||
                          index
                        }
                      >

                        {/* MEETING INFO */}

                        <div className="meeting-info">

                          <div className="meeting-avatar">
                            {(
                              meeting.title ||
                              "M"
                            )
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {
                                meeting.title ||
                                "Untitled meeting"
                              }
                            </strong>

                            <span>
                              {formatMeetingDate(
                                meeting
                              )}{" "}
                              ·{" "}
                              {formatMeetingTime(
                                meeting
                              )}
                            </span>

                          </div>

                        </div>

                        {/* PARTICIPANTS */}

                        <div className="meeting-participants">

                          <FiUsers />

                          {
                            getParticipantCount(
                              meeting
                            )
                          }

                        </div>

                        {/* STATUS */}

                        <span
                          className={`meeting-status ${status
                            .toLowerCase()
                            .replace(
                              /\s+/g,
                              "-"
                            )}`}
                        >
                          {
                            status
                          }
                        </span>

                        {/* VIEW */}

                        <button
                          type="button"
                          className="meeting-view-button"
                          onClick={() =>
                            handleViewMeeting(
                              meeting
                            )
                          }
                          title="View meeting"
                        >
                          <FiEye />

                          <span>
                            View
                          </span>
                        </button>

                        {/* MORE */}

                        <button
                          type="button"
                          className="meeting-more"
                          title="More options"
                        >
                          <FiMoreHorizontal />
                        </button>

                      </div>
                    );
                  }
                )
              )}

            </div>

          </section>

        </div>
      </main>

      {/* =====================================================
          JOIN MODAL
      ===================================================== */}

      {showJoinModal && (
        <div
          className="modal-overlay"
          onClick={
            handleCloseJoinModal
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
                handleCloseJoinModal
              }
              title="Close"
            >
              <FiX />
            </button>

            <div className="modal-icon">
              <FiVideo />
            </div>

            <h2>
              Join a meeting
            </h2>

            <p>
              Enter the meeting code
              or link shared with
              you.
            </p>

            <form
              onSubmit={
                handleJoinMeeting
              }
            >

              <label>
                Meeting code or link
              </label>

              <div
                className={`modal-input ${
                  joinError
                    ? "input-error"
                    : ""
                }`}
              >
                <FiLink />

                <input
                  type="text"
                  placeholder="e.g. CONNECT-ABC123"
                  value={
                    meetingCode
                  }
                  onChange={(e) => {
                    setMeetingCode(
                      e.target.value
                    );

                    if (
                      joinError
                    ) {
                      setJoinError(
                        ""
                      );
                    }
                  }}
                  autoFocus
                />
              </div>

              {joinError && (
                <p
                  className="join-error"
                  role="alert"
                >
                  {
                    joinError
                  }
                </p>
              )}

              <button
                type="submit"
                className="modal-submit"
              >
                Join meeting

                <FiArrowUpRight />

              </button>

            </form>

          </div>
        </div>
      )}

      {/* =====================================================
          ALL MEETINGS MODAL
      ===================================================== */}

      {showAllMeetings && (
        <div
          className="modal-overlay meetings-overlay"
          onClick={
            handleCloseAllMeetings
          }
        >
          <div
            className="all-meetings-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="all-meetings-header">

              <div>

                <h2>
                  All meetings
                </h2>

                <p>
                  {meetings.length} real{" "}
                  {meetings.length ===
                  1
                    ? "meeting"
                    : "meetings"}{" "}
                  found
                </p>

              </div>

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "10px",
                }}
              >

                <button
                  type="button"
                  className={`dashboard-refresh ${
                    refreshing
                      ? "refreshing"
                      : ""
                  }`}
                  onClick={() =>
                    fetchMeetings(
                      false
                    )
                  }
                  disabled={
                    refreshing
                  }
                  style={{
                    margin:
                      0,
                  }}
                >
                  <FiRefreshCw
                    className={
                      refreshing
                        ? "refresh-spin"
                        : ""
                    }
                  />

                  <span>
                    {refreshing
                      ? "Refreshing..."
                      : "Refresh"}
                  </span>
                </button>

                <button
                  type="button"
                  className="modal-close"
                  onClick={
                    handleCloseAllMeetings
                  }
                  title="Close"
                >
                  <FiX />
                </button>

              </div>

            </div>

            <div className="all-meetings-list">

              {meetings.length ===
              0 ? (
                <div
                  className="empty-files"
                  style={{
                    padding:
                      "50px 20px",
                  }}
                >
                  <div className="empty-files-icon">
                    <FiVideo />
                  </div>

                  <strong>
                    No meetings found
                  </strong>

                  <span>
                    There are currently
                    no meetings in your
                    account.
                  </span>
                </div>
              ) : (
                [...meetings]
                  .sort(
                    (a, b) => {
                      const dateA =
                        getMeetingDate(
                          a
                        );

                      const dateB =
                        getMeetingDate(
                          b
                        );

                      if (
                        !dateA ||
                        !dateB
                      ) {
                        return 0;
                      }

                      return (
                        dateB.getTime() -
                        dateA.getTime()
                      );
                    }
                  )
                  .map(
                    (
                      meeting,
                      index
                    ) => {

                      const status =
                        getMeetingStatus(
                          meeting
                        );

                      return (
                        <div
                          className="all-meeting-card"
                          key={
                            meeting._id ||
                            meeting.meetingId ||
                            index
                          }
                        >

                          <div className="all-meeting-card-left">

                            <div className="meeting-avatar">
                              {(
                                meeting.title ||
                                "M"
                              )
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </div>

                            <div>

                              <h3>
                                {
                                  meeting.title ||
                                  "Untitled meeting"
                                }
                              </h3>

                              <p>
                                {formatMeetingDate(
                                  meeting
                                )}{" "}
                                ·{" "}
                                {formatMeetingTime(
                                  meeting
                                )}
                              </p>

                              <small>
                                ID:{" "}
                                {
                                  getMeetingId(
                                    meeting
                                  )
                                }
                              </small>

                            </div>

                          </div>

                          <div className="all-meeting-card-middle">

                            <span className="meeting-participants">

                              <FiUsers />

                              {
                                getParticipantCount(
                                  meeting
                                )
                              }

                            </span>

                            <span
                              className={`meeting-status ${status
                                .toLowerCase()
                                .replace(
                                  /\s+/g,
                                  "-"
                                )}`}
                            >
                              {
                                status
                              }
                            </span>

                          </div>

                          <button
                            type="button"
                            className="meeting-view-button"
                            onClick={() =>
                              handleViewMeeting(
                                meeting
                              )
                            }
                          >
                            <FiEye />

                            <span>
                              View
                            </span>
                          </button>

                        </div>
                      );
                    }
                  )
              )}

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          SINGLE MEETING DETAILS
      ===================================================== */}

      {selectedMeeting && (
        <div
          className="modal-overlay"
          onClick={
            handleCloseMeetingView
          }
        >
          <div
            className="meeting-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="meeting-details-header">

              <div>

                <span>
                  MEETING DETAILS
                </span>

                <h2>
                  {
                    selectedMeeting.title ||
                    "Untitled meeting"
                  }
                </h2>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  handleCloseMeetingView
                }
              >
                <FiX />
              </button>

            </div>

            <div className="meeting-details-content">

              <div className="meeting-detail-item">

                <span>
                  Meeting ID
                </span>

                <strong>
                  {
                    getMeetingId(
                      selectedMeeting
                    )
                  }
                </strong>

              </div>

              <div className="meeting-detail-item">

                <span>
                  Date
                </span>

                <strong>
                  {formatMeetingDate(
                    selectedMeeting
                  )}
                </strong>

              </div>

              <div className="meeting-detail-item">

                <span>
                  Time
                </span>

                <strong>
                  {formatMeetingTime(
                    selectedMeeting
                  )}
                </strong>

              </div>

              <div className="meeting-detail-item">

                <span>
                  Duration
                </span>

                <strong>
                  {
                    Number(
                      selectedMeeting.duration
                    ) || 30
                  }{" "}
                  minutes
                </strong>

              </div>

              <div className="meeting-detail-item">

                <span>
                  Participants
                </span>

                <strong>
                  {
                    getParticipantCount(
                      selectedMeeting
                    )
                  }{" "}
                  people
                </strong>

              </div>

              <div className="meeting-detail-item">

                <span>
                  Status
                </span>

                <strong>
                  {
                    getMeetingStatus(
                      selectedMeeting
                    )
                  }
                </strong>

              </div>

              {selectedMeeting.description && (
                <div className="meeting-detail-description">

                  <span>
                    Description
                  </span>

                  <p>
                    {
                      selectedMeeting.description
                    }
                  </p>

                </div>
              )}

            </div>

            <div className="meeting-details-footer">

              <button
                type="button"
                className="settings-cancel"
                onClick={
                  handleCloseMeetingView
                }
              >
                Close
              </button>

              <button
                type="button"
                className="settings-save"
                onClick={() => {
                  const meetingId =
                    getMeetingId(
                      selectedMeeting
                    );

                  if (
                    meetingId &&
                    meetingId !==
                      "N/A"
                  ) {
                    navigate(
                      `/meeting/setup/${encodeURIComponent(
                        meetingId
                      )}`
                    );
                  }
                }}
              >
                <FiVideo />

                Open meeting

              </button>

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          SETTINGS MODAL
      ===================================================== */}

      {showSettings && (
        <div
          className="modal-overlay settings-overlay"
          onClick={
            handleCloseSettings
          }
        >

          <div
            className="settings-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="settings-header">

              <div className="settings-title">

                <div className="settings-main-icon">
                  <FiSettings />
                </div>

                <div>

                  <h2>
                    Settings
                  </h2>

                  <p>
                    Manage your CONNECT
                    preferences
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  handleCloseSettings
                }
                title="Close settings"
              >
                <FiX />
              </button>

            </div>

            {/* PROFILE */}

            <div className="settings-section">

              <div className="settings-section-title">

                <FiUser />

                <div>

                  <h3>
                    Profile
                  </h3>

                  <p>
                    Your account
                    information
                  </p>

                </div>

              </div>

              <div className="settings-profile">

                <div className="settings-avatar">
                  {userInitial}
                </div>

                <div className="settings-profile-info">

                  <strong>
                    {user?.name ||
                      "User"}
                  </strong>

                  <span>
                    {user?.email ||
                      "No email available"}
                  </span>

                </div>

              </div>

            </div>

            {/* MEETING SETTINGS */}

            <div className="settings-section">

              <div className="settings-section-title">

                <FiVideo />

                <div>

                  <h3>
                    Meeting preferences
                  </h3>

                  <p>
                    Control how meetings
                    start
                  </p>

                </div>

              </div>

              {/* CAMERA */}

              <div className="setting-row">

                <div className="setting-row-left">

                  <div className="setting-icon">
                    <FiCamera />
                  </div>

                  <div>

                    <strong>
                      Camera on join
                    </strong>

                    <span>
                      Automatically enable
                      your camera
                    </span>

                  </div>

                </div>

                <button
                  type="button"
                  className={`setting-switch ${
                    settings.autoCamera
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleSettingChange(
                      "autoCamera"
                    )
                  }
                  aria-pressed={
                    settings.autoCamera
                  }
                >
                  <span />
                </button>

              </div>

              {/* MIC */}

              <div className="setting-row">

                <div className="setting-row-left">

                  <div className="setting-icon">
                    <FiMic />
                  </div>

                  <div>

                    <strong>
                      Microphone on join
                    </strong>

                    <span>
                      Automatically enable
                      your microphone
                    </span>

                  </div>

                </div>

                <button
                  type="button"
                  className={`setting-switch ${
                    settings.autoMic
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleSettingChange(
                      "autoMic"
                    )
                  }
                  aria-pressed={
                    settings.autoMic
                  }
                >
                  <span />
                </button>

              </div>

            </div>

            {/* NOTIFICATIONS */}

            <div className="settings-section">

              <div className="settings-section-title">

                <FiBell />

                <div>

                  <h3>
                    Notifications
                  </h3>

                  <p>
                    Manage alerts and
                    sounds
                  </p>

                </div>

              </div>

              <div className="setting-row">

                <div className="setting-row-left">

                  <div className="setting-icon">
                    <FiBell />
                  </div>

                  <div>

                    <strong>
                      Notifications
                    </strong>

                    <span>
                      Receive meeting
                      notifications
                    </span>

                  </div>

                </div>

                <button
                  type="button"
                  className={`setting-switch ${
                    settings.notifications
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleSettingChange(
                      "notifications"
                    )
                  }
                  aria-pressed={
                    settings.notifications
                  }
                >
                  <span />
                </button>

              </div>

              <div className="setting-row">

                <div className="setting-row-left">

                  <div className="setting-icon">
                    <FiVolume2 />
                  </div>

                  <div>

                    <strong>
                      Meeting sounds
                    </strong>

                    <span>
                      Play sounds for
                      meeting events
                    </span>

                  </div>

                </div>

                <button
                  type="button"
                  className={`setting-switch ${
                    settings.sound
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleSettingChange(
                      "sound"
                    )
                  }
                  aria-pressed={
                    settings.sound
                  }
                >
                  <span />
                </button>

              </div>

            </div>

            {/* SECURITY */}

            <div className="settings-section">

              <div className="settings-section-title">

                <FiShield />

                <div>

                  <h3>
                    Privacy & security
                  </h3>

                  <p>
                    Your account is
                    protected
                  </p>

                </div>

              </div>

              <div className="security-info">

                <div className="security-check">
                  <FiCheck />
                </div>

                <div>

                  <strong>
                    Account secured
                  </strong>

                  <span>
                    Your authentication
                    and meeting data
                    are protected.
                  </span>

                </div>

              </div>

            </div>

            <div className="settings-footer">

              <button
                type="button"
                className="settings-cancel"
                onClick={
                  handleCloseSettings
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="settings-save"
                onClick={
                  handleSaveSettings
                }
              >
                <FiCheck />

                Save changes
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Dashboard;