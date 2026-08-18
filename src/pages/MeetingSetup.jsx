import { useEffect, useRef, useState } from "react";
import {
  useNavigate,
  Link,
  useParams,
} from "react-router-dom";

import {
  FiVideo,
  FiVideoOff,
  FiMic,
  FiMicOff,
  FiSettings,
  FiArrowRight,
  FiArrowLeft,
  FiCopy,
  FiCheck,
} from "react-icons/fi";

const MeetingSetup = () => {
  const navigate = useNavigate();
  const { meetingId } = useParams();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // =========================================
  // USER
  // =========================================

  const getStoredUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const user = JSON.parse(storedUser);

        return {
          name:
            user?.name ||
            user?.username ||
            "User",
        };
      }
    } catch (error) {
      console.error("Failed to read user:", error);
    }

    return {
      name: "User",
    };
  };

  const storedUser = getStoredUser();

  // =========================================
  // STATES
  // =========================================

  const [name, setName] = useState(storedUser.name);

  const [cameraOn, setCameraOn] = useState(true);

  const [micOn, setMicOn] = useState(true);

  const [copied, setCopied] = useState(false);

  const [mediaError, setMediaError] = useState("");

  // =========================================
  // GENERATE MEETING ID
  // =========================================

  const generateMeetingId = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let result = "";

    for (let i = 0; i < 8; i++) {
      result += characters.charAt(
        Math.floor(
          Math.random() * characters.length
        )
      );
    }

    return result;
  };

  const [generatedMeetingId] = useState(
    () => generateMeetingId()
  );

  const currentMeetingId =
    meetingId || generatedMeetingId;

  // =========================================
  // START CAMERA PREVIEW
  // =========================================

  useEffect(() => {
    let active = true;

    const startPreview = async () => {
      try {
        setMediaError("");

        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {
          setMediaError(
            "Your browser does not support camera and microphone access."
          );
          return;
        }

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

        if (!active) {
          stream.getTracks().forEach((track) =>
            track.stop()
          );
          return;
        }

        streamRef.current = stream;

        stream.getVideoTracks().forEach((track) => {
          track.enabled = cameraOn;
        });

        stream.getAudioTracks().forEach((track) => {
          track.enabled = micOn;
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error(
          "Preview media error:",
          error
        );

        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          setMediaError(
            "Camera or microphone permission was denied."
          );
        } else if (
          error.name === "NotFoundError"
        ) {
          setMediaError(
            "No camera or microphone was found."
          );
        } else {
          setMediaError(
            "Unable to access camera and microphone."
          );
        }
      }
    };

    startPreview();

    return () => {
      active = false;

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
      }
    };
  }, []);

  // =========================================
  // KEEP TRACK STATE SYNCHRONIZED
  // =========================================

  useEffect(() => {
    if (!streamRef.current) return;

    streamRef.current
      .getVideoTracks()
      .forEach((track) => {
        track.enabled = cameraOn;
      });
  }, [cameraOn]);

  useEffect(() => {
    if (!streamRef.current) return;

    streamRef.current
      .getAudioTracks()
      .forEach((track) => {
        track.enabled = micOn;
      });
  }, [micOn]);

  // =========================================
  // COPY MEETING ID
  // =========================================

  const copyMeetingId = async () => {
    try {
      await navigator.clipboard.writeText(
        currentMeetingId
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Unable to copy meeting ID:",
        error
      );
    }
  };

  // =========================================
  // JOIN MEETING
  // =========================================

  const handleJoin = (e) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) return;

    // Stop setup preview before entering meeting
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    navigate(`/meeting/${currentMeetingId}`, {
      state: {
        name: trimmedName,
        micOn,
        cameraOn,
      },
    });
  };

  // =========================================
  // TOGGLE MICROPHONE
  // =========================================

  const toggleMicrophone = () => {
    setMicOn((previous) => !previous);
  };

  // =========================================
  // TOGGLE CAMERA
  // =========================================

  const toggleCamera = () => {
    setCameraOn((previous) => !previous);
  };

  // =========================================
  // USER INITIAL
  // =========================================

  const userInitial = name
    ? name.charAt(0).toUpperCase()
    : "U";

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="meeting-setup-page">

      {/* HEADER */}

      <header className="meeting-setup-header">

        <Link
          to="/dashboard"
          className="setup-logo"
        >
          <div className="setup-logo-icon">
            <FiVideo />
          </div>

          <span>CONNECT</span>
        </Link>

        <button
          type="button"
          className="setup-settings"
          title="Meeting settings"
        >
          <FiSettings />
        </button>

      </header>

      {/* MAIN */}

      <main className="meeting-setup-main">

        <div className="setup-container">

          {/* HEADING */}

          <div className="setup-heading">

            <span className="setup-label">
              START MEETING
            </span>

            <h1>Ready to join?</h1>

            <p>
              Check your camera and microphone
              before entering the meeting.
            </p>

          </div>

          {/* VIDEO PREVIEW */}

          <div className="video-preview">

            {cameraOn && !mediaError ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="setup-preview-video"
              />
            ) : (
              <div className="camera-placeholder">

                <div className="preview-avatar">
                  {userInitial}
                </div>

                <span>
                  {mediaError
                    ? "Camera unavailable"
                    : "Your camera is off"}
                </span>

              </div>
            )}

            {/* STATUS */}

            <div className="preview-status">

              <span className="status-dot"></span>

              {cameraOn
                ? "Camera ready"
                : "Camera off"}

            </div>

            {/* CONTROLS */}

            <div className="preview-controls">

              <button
                type="button"
                className={`preview-control ${
                  micOn ? "active" : "off"
                }`}
                onClick={toggleMicrophone}
                title={
                  micOn
                    ? "Turn microphone off"
                    : "Turn microphone on"
                }
              >
                {micOn ? (
                  <FiMic />
                ) : (
                  <FiMicOff />
                )}
              </button>

              <button
                type="button"
                className={`preview-control ${
                  cameraOn ? "active" : "off"
                }`}
                onClick={toggleCamera}
                title={
                  cameraOn
                    ? "Turn camera off"
                    : "Turn camera on"
                }
              >
                {cameraOn ? (
                  <FiVideo />
                ) : (
                  <FiVideoOff />
                )}
              </button>

              <button
                type="button"
                className="preview-control"
                title="Device settings"
              >
                <FiSettings />
              </button>

            </div>

          </div>

          {/* ERROR */}

          {mediaError && (
            <div className="setup-media-error">
              {mediaError}
            </div>
          )}

          {/* MEETING INFORMATION */}

          <div className="setup-info">

            <div className="meeting-id-box">

              <div>

                <span>MEETING ID</span>

                <strong>
                  {currentMeetingId}
                </strong>

              </div>

              <button
                type="button"
                onClick={copyMeetingId}
                title="Copy meeting ID"
              >
                {copied ? (
                  <FiCheck />
                ) : (
                  <FiCopy />
                )}
              </button>

            </div>

          </div>

          {/* FORM */}

          <form
            className="setup-form"
            onSubmit={handleJoin}
          >

            <label htmlFor="displayName">
              Your name
            </label>

            <input
              id="displayName"
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter your name"
              autoComplete="name"
              required
            />

            <button
              type="submit"
              className="join-meeting-button"
            >
              Start meeting
              <FiArrowRight />
            </button>

          </form>

          {/* BACK */}

          <button
            type="button"
            className="back-dashboard"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <FiArrowLeft />
            Back to dashboard
          </button>

        </div>

      </main>

    </div>
  );
};

export default MeetingSetup;