import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FiArrowLeft,
  FiArrowRight,
  FiVideo,
  FiVideoOff,
  FiMic,
  FiMicOff,
  FiUsers,
  FiShield,
} from "react-icons/fi";


// =====================================================
// GET USER FROM LOCAL STORAGE
// =====================================================

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Error reading user:", error);
    return null;
  }
};


// =====================================================
// GET USER NAME
// =====================================================

const getUserName = (user) => {
  return (
    user?.name ||
    user?.username ||
    user?.fullName ||
    user?.email?.split("@")[0] ||
    ""
  );
};


// =====================================================
// JOIN MEETING COMPONENT
// =====================================================

const JoinMeeting = () => {
  const navigate = useNavigate();

  const { meetingId } = useParams();

  const videoRef = useRef(null);

  const streamRef = useRef(null);


  // ===================================================
  // USER
  // ===================================================

  const storedUser = getStoredUser();


  // ===================================================
  // STATE
  // ===================================================

  const [name, setName] = useState(
    getUserName(storedUser)
  );

  const [micOn, setMicOn] = useState(true);

  const [cameraOn, setCameraOn] = useState(true);

  const [loading, setLoading] = useState(true);

  const [joining, setJoining] = useState(false);

  const [error, setError] = useState("");


  // ===================================================
  // START CAMERA PREVIEW
  // ===================================================

  useEffect(() => {
    let mounted = true;

    const startPreview = async () => {
      try {
        setLoading(true);
        setError("");

        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {
          throw new Error(
            "Camera and microphone are not supported by this browser."
          );
        }

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

        if (!mounted) {
          stream
            .getTracks()
            .forEach((track) => track.stop());

          return;
        }

        streamRef.current = stream;

        // Initial camera state
        stream
          .getVideoTracks()
          .forEach((track) => {
            track.enabled = true;
          });

        // Initial microphone state
        stream
          .getAudioTracks()
          .forEach((track) => {
            track.enabled = true;
          });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setLoading(false);
      } catch (err) {
        console.error(
          "Camera/microphone error:",
          err
        );

        setLoading(false);

        setError(
          "Unable to access your camera or microphone. Please allow permissions and try again."
        );
      }
    };

    startPreview();

    // Cleanup
    return () => {
      mounted = false;

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
      }
    };
  }, []);


  // ===================================================
  // TOGGLE MICROPHONE
  // ===================================================

  const toggleMicrophone = () => {
    const newState = !micOn;

    setMicOn(newState);

    if (streamRef.current) {
      streamRef.current
        .getAudioTracks()
        .forEach((track) => {
          track.enabled = newState;
        });
    }
  };


  // ===================================================
  // TOGGLE CAMERA
  // ===================================================

  const toggleCamera = () => {
    const newState = !cameraOn;

    setCameraOn(newState);

    if (streamRef.current) {
      streamRef.current
        .getVideoTracks()
        .forEach((track) => {
          track.enabled = newState;
        });
    }
  };


  // ===================================================
  // JOIN MEETING
  // ===================================================

  const handleJoinMeeting = () => {
    setError("");

    const trimmedName = name.trim();

    // Validate meeting ID
    if (!meetingId) {
      setError(
        "Meeting ID is missing."
      );

      return;
    }

    // Validate name
    if (!trimmedName) {
      setError(
        "Please enter your name."
      );

      return;
    }

    setJoining(true);


    // =================================================
    // STOP PREVIEW STREAM
    // =================================================

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }


    // =================================================
    // IMPORTANT
    //
    // MeetingRoom.jsx reads these values from
    // location.state.
    // =================================================

    navigate(
      `/meeting/${meetingId}`,
      {
        state: {
          name: trimmedName,

          micOn: micOn,

          cameraOn: cameraOn,

          // Normal participant
          // isLeader MUST be false
          isLeader: false,
        },
      }
    );
  };


  // ===================================================
  // GO BACK
  // ===================================================

  const handleBack = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    navigate("/dashboard");
  };


  // ===================================================
  // INVALID MEETING ID
  // ===================================================

  if (!meetingId) {
    return (
      <div className="join-meeting-page">

        <div className="join-error-page">

          <div className="join-error-icon">
            <FiUsers />
          </div>

          <h1>
            Invalid meeting
          </h1>

          <p>
            The meeting ID is missing or invalid.
          </p>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Back to Dashboard
          </button>

        </div>

      </div>
    );
  }


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="join-meeting-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="join-header">

        <button
          className="join-back-button"
          onClick={handleBack}
        >
          <FiArrowLeft />
        </button>


        <div className="join-logo">

          <div className="join-logo-icon">
            <FiVideo />
          </div>

          <span>
            CONNECT
          </span>

        </div>


        <div className="join-secure">

          <FiShield />

          <span>
            Secure meeting
          </span>

        </div>

      </header>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="join-main">

        <div className="join-container">


          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <section className="join-preview-section">

            <div className="join-preview-card">


              {/* VIDEO */}

              <div className="join-video-wrapper">

                {cameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="join-video"
                  />
                ) : (
                  <div className="join-avatar">

                    <span>
                      {(
                        name ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>

                  </div>
                )}


                {/* NAME */}

                <div className="join-video-name">

                  {name || "You"}

                  <span>
                    You
                  </span>

                </div>


                {/* CAMERA OFF */}

                {!cameraOn && (
                  <div className="join-camera-off">

                    <FiVideoOff />

                  </div>
                )}

              </div>


              {/* PREVIEW CONTROLS */}

              <div className="join-preview-controls">

                <button
                  className={`join-media-button ${
                    !micOn
                      ? "off"
                      : ""
                  }`}
                  onClick={
                    toggleMicrophone
                  }
                  title={
                    micOn
                      ? "Mute microphone"
                      : "Unmute microphone"
                  }
                >
                  {micOn ? (
                    <FiMic />
                  ) : (
                    <FiMicOff />
                  )}
                </button>


                <button
                  className={`join-media-button ${
                    !cameraOn
                      ? "off"
                      : ""
                  }`}
                  onClick={
                    toggleCamera
                  }
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

              </div>

            </div>


            {loading && (
              <p className="join-loading">
                Starting camera and microphone...
              </p>
            )}

          </section>


          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <section className="join-form-section">

            <div className="join-form-card">


              {/* TITLE */}

              <div className="join-title">

                <div className="join-title-icon">
                  <FiUsers />
                </div>

                <span>
                  JOIN MEETING
                </span>

                <h1>
                  Ready to join?
                </h1>

                <p>
                  Enter your name and check your
                  camera and microphone before joining.
                </p>

              </div>


              {/* =================================================
                  MEETING ID
              ================================================= */}

              <div className="join-meeting-info">

                <span>
                  Meeting ID
                </span>

                <strong>
                  {meetingId}
                </strong>

              </div>


              {/* =================================================
                  NAME INPUT
              ================================================= */}

              <div className="join-input-group">

                <label htmlFor="meeting-name">
                  Your name
                </label>

                <input
                  id="meeting-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Enter your name"
                  maxLength={50}
                  autoComplete="name"
                />

              </div>


              {/* =================================================
                  SETTINGS
              ================================================= */}

              <div className="join-settings">


                {/* MICROPHONE */}

                <div className="join-setting">

                  <div className="join-setting-left">

                    <div className="join-setting-icon">

                      {micOn ? (
                        <FiMic />
                      ) : (
                        <FiMicOff />
                      )}

                    </div>

                    <div>

                      <strong>
                        Microphone
                      </strong>

                      <span>
                        {micOn
                          ? "On"
                          : "Off"}
                      </span>

                    </div>

                  </div>


                  <button
                    className={`join-toggle ${
                      micOn
                        ? "active"
                        : ""
                    }`}
                    onClick={
                      toggleMicrophone
                    }
                    type="button"
                  >
                    <span />
                  </button>

                </div>


                {/* CAMERA */}

                <div className="join-setting">

                  <div className="join-setting-left">

                    <div className="join-setting-icon">

                      {cameraOn ? (
                        <FiVideo />
                      ) : (
                        <FiVideoOff />
                      )}

                    </div>

                    <div>

                      <strong>
                        Camera
                      </strong>

                      <span>
                        {cameraOn
                          ? "On"
                          : "Off"}
                      </span>

                    </div>

                  </div>


                  <button
                    className={`join-toggle ${
                      cameraOn
                        ? "active"
                        : ""
                    }`}
                    onClick={
                      toggleCamera
                    }
                    type="button"
                  >
                    <span />
                  </button>

                </div>

              </div>


              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div className="join-error-message">
                  {error}
                </div>
              )}


              {/* =================================================
                  JOIN BUTTON
              ================================================= */}

              <button
                className="join-button"
                onClick={
                  handleJoinMeeting
                }
                disabled={joining}
              >

                {joining ? (
                  <>
                    <span className="join-spinner" />

                    Joining...
                  </>
                ) : (
                  <>
                    Join meeting

                    <FiArrowRight />
                  </>
                )}

              </button>


              {/* =================================================
                  SECURITY
              ================================================= */}

              <div className="join-security">

                <FiShield />

                <span>
                  Your meeting connection is
                  protected by secure peer-to-peer
                  communication.
                </span>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
};


export default JoinMeeting;

