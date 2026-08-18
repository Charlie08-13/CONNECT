
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiArrowUpRight,
  FiCalendar,
  FiClock,
  FiLink,
  FiMoreHorizontal,
  FiRefreshCw,
  FiSearch,
  FiUsers,
  FiVideo,
  FiX,
} from "react-icons/fi";

const Meetings = () => {
  const navigate = useNavigate();

  // =====================================================
  // API BASE URL
  // =====================================================

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  // =====================================================
  // STATES
  // =====================================================

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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
  // FETCH ALL MEETINGS
  // =====================================================

  const fetchMeetings = useCallback(
    async (initialLoad = false) => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login", {
            replace: true,
          });
          return;
        }

        if (initialLoad) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/meetings`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login", {
            replace: true,
          });

          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch meetings."
          );
        }

        setMeetings(
          Array.isArray(data.meetings)
            ? data.meetings
            : []
        );
      } catch (err) {
        console.error("FETCH ALL MEETINGS ERROR:", err);

        setError(
          err.message || "Unable to load meetings."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [API_BASE_URL, navigate]
  );

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchMeetings(true);
  }, [fetchMeetings]);

  // =====================================================
  // DATE PARSER
  // =====================================================

  const getMeetingDate = (meeting) => {
    if (!meeting) {
      return null;
    }

    if (meeting.date) {
      const dateTimeString = meeting.time
        ? `${meeting.date}T${meeting.time}`
        : meeting.date;

      const parsedDate = new Date(dateTimeString);

      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    if (meeting.createdAt) {
      const createdDate = new Date(meeting.createdAt);

      if (!Number.isNaN(createdDate.getTime())) {
        return createdDate;
      }
    }

    return null;
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getMeetingStatus = (meeting) => {
    if (meeting?.status === "cancelled") {
      return "Cancelled";
    }

    if (meeting?.status === "completed") {
      return "Completed";
    }

    if (meeting?.status === "started") {
      return "Started";
    }

    const meetingDate = getMeetingDate(meeting);

    if (!meetingDate) {
      return "Scheduled";
    }

    const now = new Date();

    const duration =
      Number(meeting.duration) > 0
        ? Number(meeting.duration)
        : 30;

    const meetingEnd = new Date(
      meetingDate.getTime() + duration * 60 * 1000
    );

    if (meetingEnd < now) {
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
  // FORMAT DATE
  // =====================================================

  const formatMeetingDate = (meeting) => {
    const meetingDate = getMeetingDate(meeting);

    if (!meetingDate) {
      return "Date unavailable";
    }

    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

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

    return meetingDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatMeetingTime = (meeting) => {
    const meetingDate = getMeetingDate(meeting);

    if (!meetingDate) {
      return meeting?.time || "Time unavailable";
    }

    return meetingDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // =====================================================
  // PARTICIPANTS
  // =====================================================

  const getParticipantCount = (meeting) => {
    const uniqueParticipants = new Set();

    if (meeting?.organizer?.email) {
      uniqueParticipants.add(
        meeting.organizer.email
          .trim()
          .toLowerCase()
      );
    }

    if (Array.isArray(meeting?.participants)) {
      meeting.participants.forEach((participant) => {
        if (
          typeof participant === "string" &&
          participant.trim()
        ) {
          uniqueParticipants.add(
            participant.trim().toLowerCase()
          );
        } else if (
          participant &&
          typeof participant === "object"
        ) {
          const email =
            participant.email ||
            participant.user?.email;

          if (email) {
            uniqueParticipants.add(
              email.trim().toLowerCase()
            );
          }
        }
      });
    }

    return uniqueParticipants.size;
  };

  // =====================================================
  // SORT MEETINGS
  // =====================================================

  const sortedMeetings = useMemo(() => {
    return [...meetings].sort((a, b) => {
      const dateA = getMeetingDate(a);
      const dateB = getMeetingDate(b);

      if (!dateA && !dateB) {
        return 0;
      }

      if (!dateA) {
        return 1;
      }

      if (!dateB) {
        return -1;
      }

      return dateB.getTime() - dateA.getTime();
    });
  }, [meetings]);

  // =====================================================
  // FILTER MEETINGS
  // =====================================================

  const filteredMeetings = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return sortedMeetings.filter((meeting) => {
      const title =
        meeting?.title || "Untitled meeting";

      const meetingId =
        meeting?.meetingId ||
        meeting?.roomId ||
        meeting?._id ||
        "";

      const status = getMeetingStatus(meeting);

      const matchesSearch =
        !query ||
        title.toLowerCase().includes(query) ||
        meetingId.toLowerCase().includes(query) ||
        status.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    sortedMeetings,
    searchQuery,
    statusFilter,
  ]);

  // =====================================================
  // JOIN MEETING
  // =====================================================

  const handleJoinMeeting = (meeting) => {
    const meetingId =
      meeting?.meetingId ||
      meeting?.roomId;

    if (!meetingId) {
      return;
    }

    navigate(
      `/meeting/setup/${encodeURIComponent(
        meetingId
      )}`
    );
  };

  // =====================================================
  // CREATE MEETING
  // =====================================================

  const generateMeetingId = () => {
    const randomPart = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    return `CONNECT-${randomPart}`;
  };

  const handleCreateMeeting = () => {
    const meetingId = generateMeetingId();

    navigate(
      `/meeting/setup/${encodeURIComponent(
        meetingId
      )}`
    );
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    return status
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="dashboard">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="dashboard-sidebar">

        {/* LOGO */}

        <button
          type="button"
          className="dashboard-logo"
          onClick={() => navigate("/dashboard")}
        >
          <div className="dashboard-logo-icon">
            <FiVideo />
          </div>

          <span>CONNECT</span>
        </button>

        {/* MENU */}

        <div className="sidebar-section">

          <p className="sidebar-label">
            MENU
          </p>

          <nav className="sidebar-nav">

            <button
              type="button"
              className="sidebar-item"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              <FiArrowLeft />

              <span>
                Dashboard
              </span>
            </button>

            <button
              type="button"
              className="sidebar-item active"
            >
              <FiVideo />

              <span>
                Meetings
              </span>
            </button>

            <button
              type="button"
              className="sidebar-item"
              onClick={() =>
                navigate("/schedule")
              }
            >
              <FiCalendar />

              <span>
                Schedule
              </span>
            </button>

          </nav>
        </div>

        {/* BOTTOM */}

        <div className="sidebar-bottom">

          <nav className="sidebar-nav">

            <button
              type="button"
              className="sidebar-item"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              <FiMoreHorizontal />

              <span>
                More
              </span>
            </button>

            <button
              type="button"
              className="sidebar-item logout"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem(
                  "rememberMe"
                );

                navigate("/login", {
                  replace: true,
                });
              }}
            >
              <FiX />

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

          {/* SEARCH */}

          <div className="dashboard-search">

            <FiSearch />

            <input
              type="text"
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
            />

            {searchQuery && (
              <button
                type="button"
                className="search-clear"
                onClick={() =>
                  setSearchQuery("")
                }
                title="Clear search"
              >
                <FiX />
              </button>
            )}

          </div>

          {/* HEADER RIGHT */}

          <div className="dashboard-header-right">

            <button
              type="button"
              className="icon-button"
              title="Back to dashboard"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              <FiArrowLeft />
            </button>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="dashboard-content">

          {/* PAGE INTRO */}

          <section className="dashboard-intro">

            <div>

              <span className="dashboard-date">
                MEETING MANAGEMENT
              </span>

              <h1>
                All meetings
              </h1>

              <p>
                View and manage your complete
                meeting history.
              </p>

            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >

              <button
                type="button"
                className="dashboard-refresh"
                onClick={() =>
                  fetchMeetings(false)
                }
                disabled={refreshing}
                title="Refresh meetings"
              >
                <FiRefreshCw
                  className={
                    refreshing
                      ? "file-spinner"
                      : ""
                  }
                />

                Refresh
              </button>

              <button
                type="button"
                className="settings-save"
                onClick={
                  handleCreateMeeting
                }
              >
                <FiVideo />

                New meeting
              </button>

            </div>

          </section>

          {/* =================================================
              FILTERS
          ================================================= */}

          <section
            className="meetings-section"
            style={{
              marginBottom: "24px",
            }}
          >

            <div
              className="section-header"
              style={{
                marginBottom: "20px",
              }}
            >

              <div>

                <h2>
                  Meeting history
                </h2>

                <p>
                  {filteredMeetings.length}{" "}
                  {filteredMeetings.length === 1
                    ? "meeting"
                    : "meetings"}{" "}
                  found
                </p>

              </div>

            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >

              {[
                "All",
                "Scheduled",
                "In progress",
                "Started",
                "Completed",
                "Cancelled",
              ].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setStatusFilter(status)
                  }
                  className={
                    statusFilter === status
                      ? "settings-save"
                      : "settings-cancel"
                  }
                >
                  {status}
                </button>
              ))}

            </div>

          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="file-error"
              style={{
                marginBottom: "20px",
              }}
            >

              <div className="file-error-icon">
                <FiX />
              </div>

              <div className="file-error-content">

                <strong>
                  Unable to load meetings
                </strong>

                <span>
                  {error}
                </span>

              </div>

            </div>
          )}

          {/* =================================================
              MEETING LIST
          ================================================= */}

          <section className="meetings-section">

            <div className="meetings-list">

              {/* LOADING */}

              {loading ? (
                <div
                  className="empty-files"
                  style={{
                    padding: "60px 20px",
                  }}
                >

                  <FiRefreshCw
                    className="file-spinner"
                    style={{
                      fontSize: "32px",
                    }}
                  />

                  <strong>
                    Loading meetings...
                  </strong>

                  <span>
                    Fetching your complete
                    meeting history.
                  </span>

                </div>
              ) : filteredMeetings.length === 0 ? (

                /* EMPTY */

                <div
                  className="empty-files"
                  style={{
                    padding: "60px 20px",
                  }}
                >

                  <div className="empty-files-illustration">

                    <div className="empty-files-icon">
                      <FiVideo />
                    </div>

                  </div>

                  <strong>
                    {searchQuery ||
                    statusFilter !== "All"
                      ? "No matching meetings"
                      : "No meetings yet"}
                  </strong>

                  <span>
                    {searchQuery ||
                    statusFilter !== "All"
                      ? "Try changing your search or filter."
                      : "Your meetings will appear here once you create or join one."}
                  </span>

                  {!searchQuery &&
                    statusFilter === "All" && (
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
                    )}

                </div>
              ) : (

                /* MEETINGS */

                filteredMeetings.map(
                  (meeting, index) => {

                    const status =
                      getMeetingStatus(
                        meeting
                      );

                    const meetingId =
                      meeting?.meetingId ||
                      meeting?.roomId ||
                      "";

                    const participantCount =
                      getParticipantCount(
                        meeting
                      );

                    return (
                      <div
                        className="meeting-row"
                        key={
                          meeting?._id ||
                          meetingId ||
                          index
                        }
                        style={{
                          cursor:
                            meetingId
                              ? "pointer"
                              : "default",
                        }}
                        onClick={() => {
                          if (meetingId) {
                            handleJoinMeeting(
                              meeting
                            );
                          }
                        }}
                      >

                        {/* AVATAR */}

                        <div className="meeting-info">

                          <div className="meeting-avatar">
                            {(
                              meeting?.title ||
                              "M"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {meeting?.title ||
                                "Untitled meeting"}
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

                        {/* MEETING ID */}

                        <div
                          className="meeting-participants"
                          title="Meeting ID"
                        >

                          <FiLink />

                          <span
                            style={{
                              maxWidth:
                                "150px",
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {meetingId ||
                              "Unavailable"}
                          </span>

                        </div>

                        {/* PARTICIPANTS */}

                        <div
                          className="meeting-participants"
                          title="Participants"
                        >

                          <FiUsers />

                          {participantCount}

                        </div>

                        {/* STATUS */}

                        <span
                          className={`meeting-status ${getStatusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>

                        {/* ACTION */}

                        <button
                          type="button"
                          className="meeting-more"
                          title={
                            meetingId
                              ? "Join meeting"
                              : "Meeting ID unavailable"
                          }
                          disabled={!meetingId}
                          onClick={(e) => {
                            e.stopPropagation();

                            if (meetingId) {
                              handleJoinMeeting(
                                meeting
                              );
                            }
                          }}
                        >
                          {meetingId ? (
                            <FiArrowUpRight />
                          ) : (
                            <FiMoreHorizontal />
                          )}
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

    </div>
  );
};

export default Meetings;

