import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import socket from "../services/socket";

import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiMonitor,
  FiMessageSquare,
  FiUsers,
  FiPhoneOff,
  FiMoreHorizontal,
  FiCopy,
  FiCheck,
  FiX,
  FiSend,
  FiSettings,
  FiMaximize,
  FiEdit3,
  FiTrash2,
  FiPaperclip,
  FiDownload,
  FiFile,
  FiImage,
  FiFileText,
  FiMusic,
  FiPlay,
  FiShield,
  FiLock,
  FiUnlock,
  FiUserCheck,
  FiUserX,
  FiRefreshCw,
  FiCheckCircle,
} from "react-icons/fi";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const DEFAULT_WHITEBOARD_COLOR = "#111827";

const WHITEBOARD_COLORS = [
  "#111827",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ffffff",
];

const DEFAULT_MEDIA_STATUS = {
  micOn: true,
  cameraOn: true,
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Unable to read stored user:", error);
    return null;
  }
};

const getUserName = (user) => {
  return (
    user?.name ||
    user?.username ||
    user?.fullName ||
    user?.email?.split("@")[0] ||
    "User"
  );
};

const formatFileSize = (bytes = 0) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (type = "") => {
  if (type.startsWith("image/")) {
    return FiImage;
  }

  if (type.startsWith("audio/")) {
    return FiMusic;
  }

  if (type.startsWith("video/")) {
    return FiPlay;
  }

  if (
    type.includes("pdf") ||
    type.includes("text") ||
    type.includes("document") ||
    type.includes("word")
  ) {
    return FiFileText;
  }

  return FiFile;
};

/*
|--------------------------------------------------------------------------
| MEETING ROOM
|--------------------------------------------------------------------------
*/

const MeetingRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { meetingId } = useParams();

  /*
  |--------------------------------------------------------------------------
  | USER
  |--------------------------------------------------------------------------
  */

  const storedUser = useMemo(
    () => getStoredUser(),
    []
  );

  const setupState = location.state || {};

  const setupName =
    setupState.name || getUserName(storedUser);

  const setupMicOn =
    setupState.micOn !== undefined
      ? setupState.micOn
      : true;

  const setupCameraOn =
    setupState.cameraOn !== undefined
      ? setupState.cameraOn
      : true;

  const [currentUser, setCurrentUser] = useState({
    name: setupName,
    email: storedUser?.email || "",
  });

  /*
  |--------------------------------------------------------------------------
  | MEDIA REFS
  |--------------------------------------------------------------------------
  */

  const localVideoRef = useRef(null);

  const localStreamRef = useRef(null);

  const screenStreamRef = useRef(null);

  const screenTrackRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | WEBRTC REFS
  |--------------------------------------------------------------------------
  */

  const peerConnectionsRef = useRef({});

  const pendingCandidatesRef = useRef({});

  const remoteVideosRef = useRef({});

  const mountedRef = useRef(true);

  /*
  |--------------------------------------------------------------------------
  | MEDIA STATE
  |--------------------------------------------------------------------------
  */

  const [micOn, setMicOn] =
    useState(setupMicOn);

  const [cameraOn, setCameraOn] =
    useState(setupCameraOn);

  const [mediaError, setMediaError] =
    useState("");

  const [remoteMediaStatus, setRemoteMediaStatus] =
    useState({});

  const [remoteUsers, setRemoteUsers] =
    useState([]);

  const [isScreenSharing, setIsScreenSharing] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | PANELS
  |--------------------------------------------------------------------------
  */

  const [showChat, setShowChat] =
    useState(false);

  const [showParticipants, setShowParticipants] =
    useState(false);

  const [showWhiteboard, setShowWhiteboard] =
    useState(false);

  const [showFiles, setShowFiles] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | COMMON UI
  |--------------------------------------------------------------------------
  */

  const [copied, setCopied] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | CHAT
  |--------------------------------------------------------------------------
  */

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] = useState([
    {
      id: "system-message",
      name: "System",
      text: "Welcome to CONNECT 👋",
      time: "Now",
    },
  ]);

  /*
  |--------------------------------------------------------------------------
  | FILE SHARING
  |--------------------------------------------------------------------------
  */

  const fileInputRef = useRef(null);

  const [sharedFiles, setSharedFiles] =
    useState([]);

  const [fileError, setFileError] =
    useState("");

  const [isSharingFile, setIsSharingFile] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | WHITEBOARD
  |--------------------------------------------------------------------------
  */

  const canvasRef = useRef(null);

  const isDrawingRef = useRef(false);

  const lastPointRef = useRef({
    x: 0,
    y: 0,
  });

  const [isDrawing, setIsDrawing] =
    useState(false);

  const [isEraser, setIsEraser] =
    useState(false);

  const [whiteboardColor, setWhiteboardColor] =
    useState(DEFAULT_WHITEBOARD_COLOR);

  const [brushSize, setBrushSize] =
    useState(4);

  /*
  |--------------------------------------------------------------------------
  | WHITEBOARD PERMISSIONS
  |--------------------------------------------------------------------------
  */

  const [isOrganizer, setIsOrganizer] =
    useState(false);

  const [canDraw, setCanDraw] =
    useState(false);

  const [whiteboardPermissions, setWhiteboardPermissions] =
    useState({});

  /*
  |--------------------------------------------------------------------------
  | ORGANIZER DETECTION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (setupState.isOrganizer !== undefined) {
      setIsOrganizer(
        Boolean(setupState.isOrganizer)
      );
    }
  }, [setupState.isOrganizer]);

  /*
  |--------------------------------------------------------------------------
  | LOAD USER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem("user");

      if (!savedUser) {
        return;
      }

      const parsedUser =
        JSON.parse(savedUser);

      setCurrentUser({
        name: getUserName(parsedUser),
        email: parsedUser?.email || "",
      });
    } catch (error) {
      console.error(
        "Unable to load user:",
        error
      );
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | DRAW PERMISSION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const ownPermission =
      Boolean(
        whiteboardPermissions[socket.id]
      );

    setCanDraw(
      Boolean(isOrganizer) ||
        ownPermission
    );
  }, [
    isOrganizer,
    whiteboardPermissions,
  ]);

  /*
  |--------------------------------------------------------------------------
  | PARTICIPANT COUNT
  |--------------------------------------------------------------------------
  */

  const participantCount =
    remoteUsers.length + 1;

  /*
  |--------------------------------------------------------------------------
  | REMOVE PEER
  |--------------------------------------------------------------------------
  */

  const removePeer = useCallback(
    (socketId) => {
      const peerConnection =
        peerConnectionsRef.current[
          socketId
        ];

      if (peerConnection) {
        peerConnection.ontrack = null;
        peerConnection.onicecandidate = null;
        peerConnection.onconnectionstatechange =
          null;

        peerConnection.close();

        delete peerConnectionsRef.current[
          socketId
        ];
      }

      delete remoteVideosRef.current[
        socketId
      ];

      delete pendingCandidatesRef.current[
        socketId
      ];

      setRemoteUsers((previous) =>
        previous.filter(
          (user) =>
            user.id !== socketId
        )
      );

      setRemoteMediaStatus(
        (previous) => {
          const updated = {
            ...previous,
          };

          delete updated[socketId];

          return updated;
        }
      );

      setWhiteboardPermissions(
        (previous) => {
          const updated = {
            ...previous,
          };

          delete updated[socketId];

          return updated;
        }
      );
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | CREATE PEER CONNECTION
  |--------------------------------------------------------------------------
  */

  const createPeerConnection = useCallback(
    (remoteSocketId) => {
      if (
        peerConnectionsRef.current[
          remoteSocketId
        ]
      ) {
        return peerConnectionsRef.current[
          remoteSocketId
        ];
      }

      const peerConnection =
        new RTCPeerConnection({
          iceServers: [
            {
              urls:
                "stun:stun.l.google.com:19302",
            },
            {
              urls:
                "stun:stun1.l.google.com:19302",
            },
          ],
        });

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => {
            peerConnection.addTrack(
              track,
              localStreamRef.current
            );
          });
      }

      peerConnection.onicecandidate = (
        event
      ) => {
        if (!event.candidate) {
          return;
        }

        socket.emit("ice-candidate", {
          target: remoteSocketId,
          candidate: event.candidate,
        });
      };

      peerConnection.ontrack = (
        event
      ) => {
        const remoteStream =
          event.streams?.[0];

        if (!remoteStream) {
          return;
        }

        remoteVideosRef.current[
          remoteSocketId
        ] = remoteStream;

        setRemoteUsers(
          (previous) => {
            const existingUser =
              previous.find(
                (user) =>
                  user.id ===
                  remoteSocketId
              );

            if (existingUser) {
              return previous.map(
                (user) =>
                  user.id ===
                  remoteSocketId
                    ? {
                        ...user,
                        stream:
                          remoteStream,
                      }
                    : user
              );
            }

            return [
              ...previous,
              {
                id: remoteSocketId,
                stream:
                  remoteStream,
              },
            ];
          }
        );
      };

      peerConnection.onconnectionstatechange =
        () => {
          const state =
            peerConnection.connectionState;

          if (
            state === "failed" ||
            state === "closed" ||
            state === "disconnected"
          ) {
            removePeer(
              remoteSocketId
            );
          }
        };

      peerConnectionsRef.current[
        remoteSocketId
      ] = peerConnection;

      return peerConnection;
    },
    [removePeer]
  );

  /*
  |--------------------------------------------------------------------------
  | ADD PENDING ICE CANDIDATES
  |--------------------------------------------------------------------------
  */

  const addPendingCandidates =
    useCallback(
      async (
        socketId,
        peerConnection
      ) => {
        const candidates =
          pendingCandidatesRef.current[
            socketId
          ] || [];

        for (const candidate of candidates) {
          try {
            await peerConnection.addIceCandidate(
              new RTCIceCandidate(
                candidate
              )
            );
          } catch (error) {
            console.error(
              "Pending ICE error:",
              error
            );
          }
        }

        delete pendingCandidatesRef.current[
          socketId
        ];
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | START MEETING
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    mountedRef.current = true;

    let connectHandler;

    const startMeeting = async () => {
      try {
        setMediaError("");

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: true,
              audio: true,
            }
          );

        if (!mountedRef.current) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );

          return;
        }

        localStreamRef.current =
          stream;

        stream
          .getVideoTracks()
          .forEach((track) => {
            track.enabled =
              setupCameraOn;
          });

        stream
          .getAudioTracks()
          .forEach((track) => {
            track.enabled =
              setupMicOn;
          });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject =
            stream;
        }

        const joinRoom = () => {
          if (!mountedRef.current) {
            return;
          }

          socket.emit(
            "join-room",
            meetingId
          );
        };

        connectHandler = joinRoom;

        if (!socket.connected) {
          socket.connect();

          socket.once(
            "connect",
            joinRoom
          );
        } else {
          joinRoom();
        }
      } catch (error) {
        console.error(
          "Media access error:",
          error
        );

        setMediaError(
          "Unable to access your camera or microphone. Please check your browser permissions."
        );
      }
    };

    startMeeting();

    return () => {
      mountedRef.current = false;

      if (connectHandler) {
        socket.off(
          "connect",
          connectHandler
        );
      }

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        localStreamRef.current = null;
      }

      if (screenStreamRef.current) {
        screenStreamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        screenStreamRef.current = null;
      }

      Object.values(
        peerConnectionsRef.current
      ).forEach((connection) =>
        connection.close()
      );

      peerConnectionsRef.current = {};
      remoteVideosRef.current = {};
      pendingCandidatesRef.current = {};

      if (socket.connected) {
        socket.emit("leave-room", {
          roomId: meetingId,
        });
      }
    };
  }, [
    meetingId,
    setupCameraOn,
    setupMicOn,
  ]);

  /*
  |--------------------------------------------------------------------------
  | SOCKET EVENTS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleRoomInfo = (data) => {
      const participants =
        data?.participants || [];

      console.log(
        "Room participants:",
        participants
      );

      /*
      |--------------------------------------------------------------------------
      | ORGANIZER DETECTION
      |--------------------------------------------------------------------------
      */

      if (
        setupState.isOrganizer ===
        undefined
      ) {
        const firstParticipant =
          participants[0];

        let firstParticipantId =
          firstParticipant;

        if (
          typeof firstParticipant ===
          "object"
        ) {
          firstParticipantId =
            firstParticipant?.socketId ||
            firstParticipant?.id;
        }

        if (
          firstParticipantId ===
          socket.id
        ) {
          setIsOrganizer(true);
        }
      }

      /*
      |--------------------------------------------------------------------------
      | WHITEBOARD PERMISSIONS FROM ROOM INFO
      |--------------------------------------------------------------------------
      */

      if (data?.whiteboardPermissions) {
        setWhiteboardPermissions(
          data.whiteboardPermissions
        );
      }

      if (
        data?.permissions
      ) {
        setWhiteboardPermissions(
          data.permissions
        );
      }

      /*
      |--------------------------------------------------------------------------
      | EXISTING PARTICIPANTS
      |--------------------------------------------------------------------------
      */

      const existingRemoteParticipants =
        participants
          .map((participant) => {
            if (
              typeof participant ===
              "string"
            ) {
              return participant;
            }

            return (
              participant?.socketId ||
              participant?.id
            );
          })
          .filter(
            (id) =>
              id &&
              id !== socket.id
          );

      setRemoteUsers(
        existingRemoteParticipants.map(
          (id) => ({
            id,
            stream:
              remoteVideosRef.current[
                id
              ] || null,
          })
        )
      );
    };

    /*
    |--------------------------------------------------------------------------
    | USER JOINED
    |--------------------------------------------------------------------------
    */

    const handleUserJoined =
      async ({
        socketId,
      }) => {
        if (!socketId) {
          return;
        }

        const peerConnection =
          createPeerConnection(
            socketId
          );

        try {
          const offer =
            await peerConnection.createOffer();

          await peerConnection.setLocalDescription(
            offer
          );

          socket.emit("offer", {
            target: socketId,
            offer,
          });
        } catch (error) {
          console.error(
            "Offer creation error:",
            error
          );
        }
      };

    /*
    |--------------------------------------------------------------------------
    | OFFER
    |--------------------------------------------------------------------------
    */

    const handleOffer = async ({
      sender,
      offer,
    }) => {
      if (!sender || !offer) {
        return;
      }

      const peerConnection =
        createPeerConnection(sender);

      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(
            offer
          )
        );

        await addPendingCandidates(
          sender,
          peerConnection
        );

        const answer =
          await peerConnection.createAnswer();

        await peerConnection.setLocalDescription(
          answer
        );

        socket.emit("answer", {
          target: sender,
          answer,
        });
      } catch (error) {
        console.error(
          "Offer handling error:",
          error
        );
      }
    };

    /*
    |--------------------------------------------------------------------------
    | ANSWER
    |--------------------------------------------------------------------------
    */

    const handleAnswer = async ({
      sender,
      answer,
    }) => {
      const peerConnection =
        peerConnectionsRef.current[
          sender
        ];

      if (
        !peerConnection ||
        !answer
      ) {
        return;
      }

      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(
            answer
          )
        );

        await addPendingCandidates(
          sender,
          peerConnection
        );
      } catch (error) {
        console.error(
          "Answer handling error:",
          error
        );
      }
    };

    /*
    |--------------------------------------------------------------------------
    | ICE
    |--------------------------------------------------------------------------
    */

    const handleIceCandidate =
      async ({
        sender,
        candidate,
      }) => {
        if (!sender || !candidate) {
          return;
        }

        const peerConnection =
          peerConnectionsRef.current[
            sender
          ];

        if (
          !peerConnection ||
          !peerConnection.remoteDescription
        ) {
          if (
            !pendingCandidatesRef.current[
              sender
            ]
          ) {
            pendingCandidatesRef.current[
              sender
            ] = [];
          }

          pendingCandidatesRef.current[
            sender
          ].push(candidate);

          return;
        }

        try {
          await peerConnection.addIceCandidate(
            new RTCIceCandidate(
              candidate
            )
          );
        } catch (error) {
          console.error(
            "ICE candidate error:",
            error
          );
        }
      };

    /*
    |--------------------------------------------------------------------------
    | USER DISCONNECTED
    |--------------------------------------------------------------------------
    */

    const handleUserDisconnected = ({
      socketId,
    }) => {
      removePeer(socketId);
    };

    /*
    |--------------------------------------------------------------------------
    | CHAT
    |--------------------------------------------------------------------------
    */

    const handleReceiveMessage = (
      receivedMessage
    ) => {
      if (!receivedMessage) {
        return;
      }

      setMessages((previous) => {
        if (
          previous.some(
            (item) =>
              item.id ===
              receivedMessage.id
          )
        ) {
          return previous;
        }

        return [
          ...previous,
          receivedMessage,
        ];
      });
    };

    /*
    |--------------------------------------------------------------------------
    | MEDIA STATUS
    |--------------------------------------------------------------------------
    */

    const handleParticipantMediaStatus =
      ({
        socketId,
        micOn,
        cameraOn,
      }) => {
        if (!socketId) {
          return;
        }

        setRemoteMediaStatus(
          (previous) => ({
            ...previous,
            [socketId]: {
              micOn,
              cameraOn,
            },
          })
        );
      };

    /*
    |--------------------------------------------------------------------------
    | FILE RECEIVED
    |--------------------------------------------------------------------------
    */

    const handleReceiveSharedFile = (
      file
    ) => {
      if (!file) {
        return;
      }

      setSharedFiles(
        (previous) => {
          if (
            previous.some(
              (item) =>
                item.id === file.id
            )
          ) {
            return previous;
          }

          return [
            ...previous,
            file,
          ];
        }
      );
    };

    /*
    |--------------------------------------------------------------------------
    | WHITEBOARD DRAW
    |--------------------------------------------------------------------------
    */

    const handleWhiteboardDraw = (
      data
    ) => {
      drawRemoteLine(data);
    };

    /*
    |--------------------------------------------------------------------------
    | WHITEBOARD CLEAR
    |--------------------------------------------------------------------------
    */

    const handleWhiteboardClear =
      () => {
        clearCanvas(false);
      };

    /*
    |--------------------------------------------------------------------------
    | WHITEBOARD PERMISSION
    |--------------------------------------------------------------------------
    */

    const handleWhiteboardPermission =
      (data = {}) => {
        const {
          socketId,
          userId,
          participantId,
          canDraw: permission,
        } = data;

        const targetId =
          socketId ||
          userId ||
          participantId;

        if (!targetId) {
          return;
        }

        const allowed =
          Boolean(permission);

        setWhiteboardPermissions(
          (previous) => ({
            ...previous,
            [targetId]:
              allowed,
          })
        );

        if (
          targetId === socket.id
        ) {
          setCanDraw(
            allowed ||
              isOrganizer
          );
        }
      };

    /*
    |--------------------------------------------------------------------------
    | WHITEBOARD PERMISSIONS
    |--------------------------------------------------------------------------
    */

    const handleWhiteboardPermissions =
      (data = {}) => {
        const permissions =
          data.permissions ||
          data.whiteboardPermissions;

        if (!permissions) {
          return;
        }

        setWhiteboardPermissions(
          permissions
        );

        setCanDraw(
          Boolean(isOrganizer) ||
            Boolean(
              permissions[
                socket.id
              ]
            )
        );
      };

    /*
    |--------------------------------------------------------------------------
    | REGISTER EVENTS
    |--------------------------------------------------------------------------
    */

    socket.on(
      "room-info",
      handleRoomInfo
    );

    socket.on(
      "user-joined",
      handleUserJoined
    );

    socket.on(
      "offer",
      handleOffer
    );

    socket.on(
      "answer",
      handleAnswer
    );

    socket.on(
      "ice-candidate",
      handleIceCandidate
    );

    socket.on(
      "user-disconnected",
      handleUserDisconnected
    );

    socket.on(
      "receive-message",
      handleReceiveMessage
    );

    socket.on(
      "participant-media-status",
      handleParticipantMediaStatus
    );

    socket.on(
      "receive-shared-file",
      handleReceiveSharedFile
    );

    socket.on(
      "whiteboard-draw",
      handleWhiteboardDraw
    );

    socket.on(
      "whiteboard-clear",
      handleWhiteboardClear
    );

    socket.on(
      "whiteboard-permission",
      handleWhiteboardPermission
    );

    socket.on(
      "whiteboard-permissions",
      handleWhiteboardPermissions
    );

    return () => {
      socket.off(
        "room-info",
        handleRoomInfo
      );

      socket.off(
        "user-joined",
        handleUserJoined
      );

      socket.off(
        "offer",
        handleOffer
      );

      socket.off(
        "answer",
        handleAnswer
      );

      socket.off(
        "ice-candidate",
        handleIceCandidate
      );

      socket.off(
        "user-disconnected",
        handleUserDisconnected
      );

      socket.off(
        "receive-message",
        handleReceiveMessage
      );

      socket.off(
        "participant-media-status",
        handleParticipantMediaStatus
      );

      socket.off(
        "receive-shared-file",
        handleReceiveSharedFile
      );

      socket.off(
        "whiteboard-draw",
        handleWhiteboardDraw
      );

      socket.off(
        "whiteboard-clear",
        handleWhiteboardClear
      );

      socket.off(
        "whiteboard-permission",
        handleWhiteboardPermission
      );

      socket.off(
        "whiteboard-permissions",
        handleWhiteboardPermissions
      );
    };
  }, [
    createPeerConnection,
    addPendingCandidates,
    removePeer,
    isOrganizer,
    setupState.isOrganizer,
  ]);

  /*
  |--------------------------------------------------------------------------
  | CAMERA
  |--------------------------------------------------------------------------
  */

  const toggleCamera = () => {
    if (!localStreamRef.current) {
      return;
    }

    const tracks =
      localStreamRef.current.getVideoTracks();

    const newState = !cameraOn;

    tracks.forEach((track) => {
      track.enabled = newState;
    });

    setCameraOn(newState);

    socket.emit("media-status", {
      roomId: meetingId,
      micOn,
      cameraOn: newState,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | MICROPHONE
  |--------------------------------------------------------------------------
  */

  const toggleMicrophone = () => {
    if (!localStreamRef.current) {
      return;
    }

    const tracks =
      localStreamRef.current.getAudioTracks();

    const newState = !micOn;

    tracks.forEach((track) => {
      track.enabled = newState;
    });

    setMicOn(newState);

    socket.emit("media-status", {
      roomId: meetingId,
      micOn: newState,
      cameraOn,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | COPY MEETING ID
  |--------------------------------------------------------------------------
  */

  const copyMeetingId = async () => {
    try {
      await navigator.clipboard.writeText(
        meetingId
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Copy meeting ID error:",
        error
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CHAT
  |--------------------------------------------------------------------------
  */

  const sendMessage = (event) => {
    event.preventDefault();

    const trimmedMessage =
      message.trim();

    if (!trimmedMessage) {
      return;
    }

    const newMessage = {
      id: `${socket.id}-${Date.now()}`,
      name: currentUser.name,
      text: trimmedMessage,
      time: new Date().toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
    };

    setMessages(
      (previous) => [
        ...previous,
        newMessage,
      ]
    );

    socket.emit(
      "send-message",
      {
        roomId: meetingId,
        message: newMessage,
      }
    );

    setMessage("");
  };

  /*
  |--------------------------------------------------------------------------
  | FILE PICKER
  |--------------------------------------------------------------------------
  */

  const openFilePicker = () => {
    setFileError("");

    fileInputRef.current?.click();
  };

  /*
  |--------------------------------------------------------------------------
  | FILE SHARING
  |--------------------------------------------------------------------------
  */

  const handleFileSelected = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileError("");

    if (file.size > MAX_FILE_SIZE) {
      setFileError(
        "File is larger than 5MB. Please choose a smaller file."
      );

      event.target.value = "";

      return;
    }

    setIsSharingFile(true);

    const reader =
      new FileReader();

    reader.onload = () => {
      const sharedFile = {
        id: `${socket.id}-${Date.now()}`,
        name: file.name,
        type:
          file.type ||
          "application/octet-stream",
        size: file.size,
        data: reader.result,
        sender: currentUser.name,
        senderId: socket.id,
        time: new Date().toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
      };

      setSharedFiles(
        (previous) => [
          ...previous,
          sharedFile,
        ]
      );

      socket.emit(
        "share-file",
        {
          roomId: meetingId,
          file: sharedFile,
        }
      );

      setIsSharingFile(false);
    };

    reader.onerror = () => {
      setFileError(
        "Unable to read this file."
      );

      setIsSharingFile(false);
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  /*
  |--------------------------------------------------------------------------
  | SCREEN SHARE
  |--------------------------------------------------------------------------
  */

  const shareScreen = async () => {
    if (isScreenSharing) {
      stopScreenSharing();
      return;
    }

    try {
      const screenStream =
        await navigator.mediaDevices.getDisplayMedia(
          {
            video: true,
            audio: false,
          }
        );

      const screenTrack =
        screenStream.getVideoTracks()[0];

      if (!screenTrack) {
        return;
      }

      screenStreamRef.current =
        screenStream;

      screenTrackRef.current =
        screenTrack;

      setIsScreenSharing(true);

      Object.values(
        peerConnectionsRef.current
      ).forEach(
        (peerConnection) => {
          const sender =
            peerConnection
              .getSenders()
              .find(
                (item) =>
                  item.track?.kind ===
                  "video"
              );

          if (sender) {
            sender.replaceTrack(
              screenTrack
            );
          }
        }
      );

      if (localVideoRef.current) {
        localVideoRef.current.srcObject =
          screenStream;
      }

      screenTrack.onended = () => {
        stopScreenSharing();
      };
    } catch (error) {
      console.log(
        "Screen sharing cancelled:",
        error
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | STOP SCREEN SHARE
  |--------------------------------------------------------------------------
  */

  const stopScreenSharing = () => {
    const cameraTrack =
      localStreamRef.current
        ?.getVideoTracks()?.[0];

    Object.values(
      peerConnectionsRef.current
    ).forEach(
      (peerConnection) => {
        const sender =
          peerConnection
            .getSenders()
            .find(
              (item) =>
                item.track?.kind ===
                "video"
            );

        if (
          sender &&
          cameraTrack
        ) {
          sender.replaceTrack(
            cameraTrack
          );
        }
      }
    );

    if (
      localVideoRef.current &&
      localStreamRef.current
    ) {
      localVideoRef.current.srcObject =
        localStreamRef.current;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );
    }

    screenStreamRef.current = null;
    screenTrackRef.current = null;

    setIsScreenSharing(false);
  };

  /*
  |--------------------------------------------------------------------------
  | FULLSCREEN
  |--------------------------------------------------------------------------
  */

  const enterFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error(
        "Fullscreen error:",
        error
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | WHITEBOARD CANVAS SETUP
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | We use devicePixelRatio so drawing coordinates match
  | the actual canvas pixels on high-DPI displays.
  |
  */

  const setupWhiteboardCanvas =
    useCallback(() => {
      const canvas =
        canvasRef.current;

      if (!canvas) {
        return;
      }

      const rect =
        canvas.getBoundingClientRect();

      const cssWidth =
        Math.max(
          1,
          Math.floor(rect.width)
        );

      const cssHeight =
        Math.max(
          1,
          Math.floor(rect.height)
        );

      const dpr =
        Math.max(
          1,
          window.devicePixelRatio ||
            1
        );

      const oldCanvas =
        document.createElement(
          "canvas"
        );

      const oldWidth =
        canvas.width;

      const oldHeight =
        canvas.height;

      if (
        oldWidth > 0 &&
        oldHeight > 0
      ) {
        oldCanvas.width =
          oldWidth;

        oldCanvas.height =
          oldHeight;

        const oldContext =
          oldCanvas.getContext(
            "2d"
          );

        if (oldContext) {
          oldContext.drawImage(
            canvas,
            0,
            0
          );
        }
      }

      canvas.width =
        Math.floor(
          cssWidth * dpr
        );

      canvas.height =
        Math.floor(
          cssHeight * dpr
        );

      canvas.style.width =
        `${cssWidth}px`;

      canvas.style.height =
        `${cssHeight}px`;

      const context =
        canvas.getContext(
          "2d"
        );

      if (!context) {
        return;
      }

      context.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      context.lineCap =
        "round";

      context.lineJoin =
        "round";

      /*
      |--------------------------------------------------------------------------
      | RESTORE OLD DRAWING
      |--------------------------------------------------------------------------
      */

      if (
        oldWidth > 0 &&
        oldHeight > 0
      ) {
        context.drawImage(
          oldCanvas,
          0,
          0,
          oldWidth,
          oldHeight,
          0,
          0,
          cssWidth,
          cssHeight
        );
      }
    }, []);

  /*
  |--------------------------------------------------------------------------
  | CANVAS SIZE EFFECT
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!showWhiteboard) {
      return;
    }

    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const resizeCanvas = () => {
      setupWhiteboardCanvas();
    };

    /*
    |--------------------------------------------------------------------------
    | Wait one frame so the side panel has its final size.
    |--------------------------------------------------------------------------
    */

    const frame =
      requestAnimationFrame(
        resizeCanvas
      );

    window.addEventListener(
      "resize",
      resizeCanvas
    );

    return () => {
      cancelAnimationFrame(
        frame
      );

      window.removeEventListener(
        "resize",
        resizeCanvas
      );
    };
  }, [
    showWhiteboard,
    setupWhiteboardCanvas,
  ]);

  /*
  |--------------------------------------------------------------------------
  | CANVAS POSITION
  |--------------------------------------------------------------------------
  |
  | Coordinates are returned in CSS pixels.
  | The canvas context itself is scaled by DPR.
  |
  */

  const getCanvasPoint = (
    event
  ) => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return {
        x: 0,
        y: 0,
      };
    }

    const rect =
      canvas.getBoundingClientRect();

    return {
      x:
        event.clientX -
        rect.left,

      y:
        event.clientY -
        rect.top,
    };
  };

  /*
  |--------------------------------------------------------------------------
  | DRAW LINE
  |--------------------------------------------------------------------------
  */

  const drawLine = useCallback(
    (
      from,
      to,
      erase = false,
      color = DEFAULT_WHITEBOARD_COLOR,
      size = 4
    ) => {
      const canvas =
        canvasRef.current;

      if (!canvas) {
        return;
      }

      const context =
        canvas.getContext(
          "2d"
        );

      if (!context) {
        return;
      }

      const dpr =
        Math.max(
          1,
          window.devicePixelRatio ||
            1
        );

      /*
      |--------------------------------------------------------------------------
      | Reset transform before drawing.
      |--------------------------------------------------------------------------
      */

      context.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      context.lineCap =
        "round";

      context.lineJoin =
        "round";

      context.lineWidth =
        erase
          ? size * 3
          : size;

      context.globalCompositeOperation =
        erase
          ? "destination-out"
          : "source-over";

      context.strokeStyle =
        color;

      context.beginPath();

      context.moveTo(
        from.x,
        from.y
      );

      context.lineTo(
        to.x,
        to.y
      );

      context.stroke();

      context.globalCompositeOperation =
        "source-over";
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | START DRAWING
  |--------------------------------------------------------------------------
  */

  const startDrawing = (
    event
  ) => {
    if (!canDraw) {
      return;
    }

    if (
      event.pointerType ===
        "mouse" &&
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();

    const point =
      getCanvasPoint(event);

    isDrawingRef.current =
      true;

    setIsDrawing(true);

    lastPointRef.current =
      point;

    try {
      event.currentTarget.setPointerCapture(
        event.pointerId
      );
    } catch (error) {
      console.debug(
        "Pointer capture unavailable:",
        error
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Draw a tiny point immediately.
    |--------------------------------------------------------------------------
    */

    drawLine(
      point,
      {
        x: point.x + 0.01,
        y: point.y + 0.01,
      },
      isEraser,
      whiteboardColor,
      brushSize
    );
  };

  /*
  |--------------------------------------------------------------------------
  | DRAW
  |--------------------------------------------------------------------------
  */

  const draw = (event) => {
    if (
      !isDrawingRef.current ||
      !canDraw
    ) {
      return;
    }

    event.preventDefault();

    const point =
      getCanvasPoint(event);

    const drawingData = {
      from: {
        x: lastPointRef.current.x,
        y: lastPointRef.current.y,
      },

      to: {
        x: point.x,
        y: point.y,
      },

      erase: Boolean(isEraser),

      color:
        whiteboardColor ||
        DEFAULT_WHITEBOARD_COLOR,

      size:
        Number(brushSize) ||
        4,
    };

    drawLine(
      drawingData.from,
      drawingData.to,
      drawingData.erase,
      drawingData.color,
      drawingData.size
    );

    socket.emit(
      "whiteboard-draw",
      {
        roomId: meetingId,
        ...drawingData,
      }
    );

    lastPointRef.current =
      point;
  };

  /*
  |--------------------------------------------------------------------------
  | STOP DRAWING
  |--------------------------------------------------------------------------
  */

  const stopDrawing = (
    event
  ) => {
    if (
      !isDrawingRef.current
    ) {
      return;
    }

    isDrawingRef.current =
      false;

    setIsDrawing(false);

    try {
      if (
        event?.currentTarget?.hasPointerCapture?.(
          event.pointerId
        )
      ) {
        event.currentTarget.releasePointerCapture(
          event.pointerId
        );
      }
    } catch (error) {
      console.debug(
        "Pointer release unavailable:",
        error
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | REMOTE DRAW
  |--------------------------------------------------------------------------
  */

  const drawRemoteLine = (
    data
  ) => {
    if (
      !data?.from ||
      !data?.to
    ) {
      return;
    }

    drawLine(
      {
        x: Number(data.from.x) || 0,
        y: Number(data.from.y) || 0,
      },
      {
        x: Number(data.to.x) || 0,
        y: Number(data.to.y) || 0,
      },
      Boolean(data.erase),
      data.color ||
        DEFAULT_WHITEBOARD_COLOR,
      Number(data.size) ||
        4
    );
  };

  /*
  |--------------------------------------------------------------------------
  | CLEAR CANVAS
  |--------------------------------------------------------------------------
  */

  const clearCanvas = (
    broadcast = true
  ) => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const context =
      canvas.getContext(
        "2d"
      );

    if (!context) {
      return;
    }

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    if (
      broadcast &&
      canDraw
    ) {
      socket.emit(
        "whiteboard-clear",
        {
          roomId: meetingId,
        }
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | WHITEBOARD PERMISSION
  |--------------------------------------------------------------------------
  */

  const setParticipantWhiteboardPermission =
    (
      participantId,
      permission
    ) => {
      if (!isOrganizer) {
        return;
      }

      const allowed =
        Boolean(permission);

      socket.emit(
        "set-whiteboard-permission",
        {
          roomId: meetingId,
          socketId: participantId,
          canDraw: allowed,
        }
      );

      setWhiteboardPermissions(
        (previous) => ({
          ...previous,
          [participantId]:
            allowed,
        })
      );
    };

  /*
  |--------------------------------------------------------------------------
  | LEAVE MEETING
  |--------------------------------------------------------------------------
  */

  const leaveMeeting = () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to leave the meeting?"
      );

    if (!confirmed) {
      return;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );
    }

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );
    }

    Object.values(
      peerConnectionsRef.current
    ).forEach((connection) =>
      connection.close()
    );

    socket.emit(
      "leave-room",
      {
        roomId: meetingId,
      }
    );

    if (socket.connected) {
      socket.disconnect();
    }

    navigate(
      "/dashboard",
      {
        replace: true,
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE PANELS
  |--------------------------------------------------------------------------
  */

  const closePanels = () => {
    setShowChat(false);
    setShowParticipants(false);
    setShowWhiteboard(false);
    setShowFiles(false);

    isDrawingRef.current =
      false;

    setIsDrawing(false);
  };

  /*
  |--------------------------------------------------------------------------
  | WHITEBOARD PARTICIPANTS
  |--------------------------------------------------------------------------
  */

  const whiteboardParticipantList =
    remoteUsers.map(
      (user, index) => ({
        ...user,

        displayName:
          `Participant ${index + 1}`,

        canDraw:
          Boolean(
            whiteboardPermissions[
              user.id
            ]
          ),
      })
    );

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="meeting-room">

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="meeting-topbar">

        <div className="meeting-brand">

          <div className="meeting-brand-icon">
            <FiVideo />
          </div>

          <span>
            CONNECT
          </span>

        </div>

        <div className="meeting-details">

          <div className="meeting-title">
            Team Meeting
          </div>

          <div className="meeting-id">

            <span>
              {meetingId}
            </span>

            <button
              type="button"
              onClick={
                copyMeetingId
              }
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

        <div className="meeting-top-actions">

          {isOrganizer && (
            <span className="organizer-badge">
              <FiShield />
              Organizer
            </span>
          )}

          <button
            type="button"
            className="meeting-top-button"
            title="Settings"
          >
            <FiSettings />
          </button>

          <button
            type="button"
            className="meeting-top-button"
            title="Fullscreen"
            onClick={
              enterFullscreen
            }
          >
            <FiMaximize />
          </button>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="meeting-content">

        <div
          className={`video-grid ${
            showChat ||
            showParticipants ||
            showWhiteboard ||
            showFiles
              ? "with-panel"
              : ""
          }`}
        >

          {/* =================================================
              LOCAL VIDEO
          ================================================= */}

          <div className="participant-card local-participant">

            <div className="participant-video">

              {cameraOn &&
              !mediaError ? (
                <video
                  ref={
                    localVideoRef
                  }
                  autoPlay
                  muted
                  playsInline
                  className="local-video"
                />
              ) : (
                <div className="participant-avatar">
                  {currentUser.name
                    .charAt(
                      0
                    )
                    .toUpperCase()}
                </div>
              )}

              {!cameraOn && (
                <div className="camera-disabled">
                  <FiVideoOff />
                </div>
              )}

              {isScreenSharing && (
                <div className="screen-share-label">
                  <FiMonitor />
                  You are sharing your screen
                </div>
              )}

            </div>

            <div className="participant-info">

              <div className="participant-name">

                {currentUser.name}

                <span>
                  You
                </span>

              </div>

              <div className="participant-status">

                {micOn ? (
                  <FiMic />
                ) : (
                  <FiMicOff />
                )}

              </div>

            </div>

          </div>

          {/* =================================================
              REMOTE USERS
          ================================================= */}

          {remoteUsers.map(
            (user) => (
              <RemoteVideo
                key={user.id}
                user={user}
                mediaStatus={
                  remoteMediaStatus[
                    user.id
                  ] ||
                  DEFAULT_MEDIA_STATUS
                }
              />
            )
          )}

        </div>

        {/* ===================================================
            WAITING
        =================================================== */}

        {remoteUsers.length === 0 && (
          <div className="waiting-message">

            <div className="waiting-icon">
              <FiUsers />
            </div>

            <h3>
              Waiting for someone to join
            </h3>

            <p>
              Share the meeting ID with
              another person.
            </p>

            <button
              type="button"
              onClick={
                copyMeetingId
              }
              className="copy-meeting-button"
            >
              {copied ? (
                <>
                  <FiCheck />
                  Copied
                </>
              ) : (
                <>
                  <FiCopy />
                  Copy Meeting ID
                </>
              )}
            </button>

          </div>
        )}

        {/* ===================================================
            MEDIA ERROR
        =================================================== */}

        {mediaError && (
          <div className="media-error">

            <div>
              {mediaError}
            </div>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              <FiRefreshCw />
              Try again
            </button>

          </div>
        )}

        {/* ===================================================
            SIDE PANEL
        =================================================== */}

        {(showChat ||
          showParticipants ||
          showWhiteboard ||
          showFiles) && (

          <aside className="meeting-side-panel">

            {/* ===============================================
                PANEL HEADER
            =============================================== */}

            <div className="side-panel-header">

              <div>

                <h2>
                  {showChat
                    ? "Chat"
                    : showParticipants
                    ? "Participants"
                    : showWhiteboard
                    ? "Whiteboard"
                    : "Shared Files"}
                </h2>

                {showWhiteboard && (
                  <span className="panel-subtitle">
                    {canDraw
                      ? "You can draw"
                      : "View only"}
                  </span>
                )}

              </div>

              <button
                type="button"
                onClick={
                  closePanels
                }
              >
                <FiX />
              </button>

            </div>

            {/* ===============================================
                CHAT
            =============================================== */}

            {showChat && (
              <div className="chat-panel">

                <div className="chat-messages">

                  {messages.map(
                    (item) => (
                      <div
                        className="chat-message"
                        key={
                          item.id
                        }
                      >

                        <div className="chat-avatar">
                          {item.name
                            .charAt(
                              0
                            )
                            .toUpperCase()}
                        </div>

                        <div className="chat-message-content">

                          <div className="chat-message-header">

                            <strong>
                              {
                                item.name
                              }
                            </strong>

                            <span>
                              {
                                item.time
                              }
                            </span>

                          </div>

                          <p>
                            {
                              item.text
                            }
                          </p>

                        </div>

                      </div>
                    )
                  )}

                </div>

                <form
                  className="chat-input"
                  onSubmit={
                    sendMessage
                  }
                >

                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={
                      message
                    }
                    onChange={(
                      event
                    ) =>
                      setMessage(
                        event
                          .target
                          .value
                      )
                    }
                  />

                  <button type="submit">
                    <FiSend />
                  </button>

                </form>

              </div>
            )}

            {/* ===============================================
                PARTICIPANTS
            =============================================== */}

            {showParticipants && (
              <div className="participants-list">

                <div className="participant-count">
                  <FiUsers />
                  {participantCount} participants
                </div>

                <div className="participant-list-item">

                  <div className="list-avatar">
                    {currentUser.name
                      .charAt(
                        0
                      )
                      .toUpperCase()}
                  </div>

                  <div className="list-name">

                    <strong>
                      {
                        currentUser.name
                      }
                    </strong>

                    <span>
                      You
                    </span>

                  </div>

                  <div className="list-controls">

                    {micOn ? (
                      <FiMic />
                    ) : (
                      <FiMicOff />
                    )}

                  </div>

                </div>

                {remoteUsers.map(
                  (
                    user,
                    index
                  ) => {
                    const status =
                      remoteMediaStatus[
                        user.id
                      ] ||
                      DEFAULT_MEDIA_STATUS;

                    return (
                      <div
                        className="participant-list-item"
                        key={
                          user.id
                        }
                      >

                        <div className="list-avatar">
                          {String.fromCharCode(
                            82 +
                              index
                          )}
                        </div>

                        <div className="list-name">

                          <strong>
                            Participant{" "}
                            {index +
                              1}
                          </strong>

                        </div>

                        <div className="list-controls">

                          {status.micOn ? (
                            <FiMic />
                          ) : (
                            <FiMicOff />
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

            {/* ===============================================
                FILE SHARING
            =============================================== */}

            {showFiles && (
  <div className="shared-files-panel">

    {/* =========================================
        FILE UPLOAD HEADER
    ========================================= */}

    <div className="file-upload-card">

      <div className="file-upload-visual">
        <div className="file-upload-icon">
          <FiPaperclip />
        </div>

        <div className="file-upload-icon-glow" />
      </div>

      <div className="file-upload-content">

        <div className="file-upload-title-row">
          <h3>Share files</h3>

          <span className="file-upload-badge">
            <FiShield />
            Secure
          </span>
        </div>

        <p>
          Share documents, images, presentations and
          other files with everyone in this meeting.
        </p>

        <div className="file-upload-meta">

          <span>
            <FiShield />
            Meeting-only sharing
          </span>

          <span>
            <FiPaperclip />
            Maximum 5MB
          </span>

        </div>

      </div>

      {/* =========================================
          CHOOSE FILE BUTTON
      ========================================= */}

      <button
        type="button"
        className="file-upload-button"
        onClick={openFilePicker}
        disabled={isSharingFile}
      >
        {isSharingFile ? (
          <>
            <FiRefreshCw className="file-spinner" />
            Sharing...
          </>
        ) : (
          <>
            <FiPaperclip />
            Choose file
          </>
        )}
      </button>

    </div>

    {/* =========================================
        HIDDEN FILE INPUT
    ========================================= */}

    <input
      ref={fileInputRef}
      type="file"
      hidden
      onChange={handleFileSelected}
    />

    {/* =========================================
        FILE SECURITY / LIMIT INFO
    ========================================= */}

    <div className="file-limit-info">

      <div className="file-limit-icon">
        <FiShield />
      </div>

      <div className="file-limit-content">

        <strong>
          Maximum file size: 5MB
        </strong>

        <span>
          Files are shared only with participants
          in this meeting.
        </span>

      </div>

    </div>

    {/* =========================================
        ERROR MESSAGE
    ========================================= */}

    {fileError && (
      <div className="file-error">

        <div className="file-error-icon">
          <FiX />
        </div>

        <div className="file-error-content">

          <strong>
            Unable to share file
          </strong>

          <span>
            {fileError}
          </span>

        </div>

      </div>
    )}

    {/* =========================================
        SHARED FILES SECTION
    ========================================= */}

    <div className="shared-files-section">

      {/* =======================================
          SECTION HEADER
      ======================================= */}

      <div className="shared-files-heading">

        <div className="shared-files-heading-left">

          <div className="shared-files-heading-icon">
            <FiPaperclip />
          </div>

          <div>
            <h4>
              Shared files
            </h4>

            <span>
              Files shared in this meeting
            </span>
          </div>

        </div>

        <div className="shared-files-count">
          {sharedFiles.length}
        </div>

      </div>

      {/* =======================================
          EMPTY STATE
      ======================================= */}

      {sharedFiles.length === 0 ? (

        <div className="empty-files">

          <div className="empty-files-illustration">

            <div className="empty-files-icon">
              <FiPaperclip />
            </div>

            <div className="empty-files-dot dot-one" />
            <div className="empty-files-dot dot-two" />
            <div className="empty-files-dot dot-three" />

          </div>

          <strong>
            No files shared yet
          </strong>

          <span>
            Choose a file above to share it with
            everyone in this meeting.
          </span>

          <button
            type="button"
            className="empty-files-button"
            onClick={openFilePicker}
            disabled={isSharingFile}
          >
            {isSharingFile ? (
              <>
                <FiRefreshCw className="file-spinner" />
                Sharing...
              </>
            ) : (
              <>
                <FiPaperclip />
                Share your first file
              </>
            )}
          </button>

        </div>

      ) : (

        /* =====================================
           FILE LIST
        ===================================== */

        <div className="shared-files-list">

          {sharedFiles.map((file, index) => (

            <div
              className="shared-file-item"
              key={file.id || `${file.name}-${index}`}
            >

              {/* FILE ICON */}

              <div className="shared-file-icon">
                <FiPaperclip />
              </div>

              {/* FILE DETAILS */}

              <div className="shared-file-details">

                <strong
                  title={file.name || "Shared file"}
                >
                  {file.name || "Shared file"}
                </strong>

                <span>
                  {file.size
                    ? `${(
                        file.size /
                        (1024 * 1024)
                      ).toFixed(2)} MB`
                    : "Shared during meeting"}
                </span>

              </div>

              {/* FILE STATUS */}

              <div
                className="shared-file-status"
                title="Shared successfully"
              >
                <FiCheckCircle />
              </div>

              {/* =================================
                  DOWNLOAD BUTTON

                  Only shown when the received
                  file contains a data URL.
              ================================= */}

              {file.data && (
                <a
                  href={file.data}
                  download={file.name || "shared-file"}
                  className="shared-file-download"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  Download
                </a>
              )}

            </div>

          ))}

        </div>

      )}

    </div>

  </div>
)}

            {/* ===============================================
                WHITEBOARD
            =============================================== */}

            {showWhiteboard && (
              <div className="whiteboard-panel">

                {/* =========================================
                    PERMISSION STATUS
                ========================================= */}

                <div
                  className={`whiteboard-permission-banner ${
                    canDraw
                      ? "drawing-enabled"
                      : "view-only"
                  }`}
                >

                  {canDraw ? (
                    <>
                      <FiUnlock />

                      <div>
                        <strong>
                          Drawing enabled
                        </strong>

                        <span>
                          You can draw on the
                          shared whiteboard.
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <FiLock />

                      <div>
                        <strong>
                          View only
                        </strong>

                        <span>
                          The organizer controls
                          who can draw.
                        </span>
                      </div>
                    </>
                  )}

                </div>

                {/* =========================================
                    TOOLBAR
                ========================================= */}

                <div className="whiteboard-toolbar">

                  <div className="whiteboard-tool-group">

                    <button
                      type="button"
                      className={
                        !isEraser &&
                        canDraw
                          ? "active"
                          : ""
                      }
                      onClick={() => {
                        if (canDraw) {
                          setIsEraser(
                            false
                          );
                        }
                      }}
                      disabled={
                        !canDraw
                      }
                      title="Pen"
                    >
                      <FiEdit3 />
                    </button>

                    <button
                      type="button"
                      className={
                        isEraser &&
                        canDraw
                          ? "active"
                          : ""
                      }
                      onClick={() => {
                        if (canDraw) {
                          setIsEraser(
                            true
                          );
                        }
                      }}
                      disabled={
                        !canDraw
                      }
                      title="Eraser"
                    >
                      <FiTrash2 />
                    </button>

                  </div>

                  <div className="whiteboard-color-group">

                    {WHITEBOARD_COLORS.map(
                      (color) => (
                        <button
                          type="button"
                          key={
                            color
                          }
                          className={`color-swatch ${
                            whiteboardColor ===
                            color
                              ? "selected"
                              : ""
                          }`}
                          style={{
                            backgroundColor:
                              color,
                          }}
                          onClick={() => {
                            if (
                              !canDraw
                            ) {
                              return;
                            }

                            setWhiteboardColor(
                              color
                            );

                            setIsEraser(
                              false
                            );
                          }}
                          disabled={
                            !canDraw
                          }
                          title={`Use ${color}`}
                        />
                      )
                    )}

                  </div>

                  <div className="whiteboard-size-group">

                    <label>
                      Size
                    </label>

                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={
                        brushSize
                      }
                      onChange={(
                        event
                      ) =>
                        setBrushSize(
                          Number(
                            event
                              .target
                              .value
                          )
                        )
                      }
                      disabled={
                        !canDraw
                      }
                    />

                    <span>
                      {
                        brushSize
                      }
                      px
                    </span>

                  </div>

                  <button
                    type="button"
                    className="whiteboard-clear-button"
                    onClick={() =>
                      clearCanvas(
                        true
                      )
                    }
                    disabled={
                      !canDraw
                    }
                    title="Clear whiteboard"
                  >
                    <FiTrash2 />
                    Clear
                  </button>

                </div>

                {/* =========================================
                    CANVAS
                ========================================= */}

                <div
                  className="whiteboard-wrapper"
                  style={{
                    position:
                      "relative",
                  }}
                >

                  <canvas
                    ref={
                      canvasRef
                    }
                    className={`whiteboard-canvas ${
                      canDraw
                        ? "can-draw"
                        : "view-only"
                    }`}
                    style={{
                      display:
                        "block",

                      width:
                        "100%",

                      height:
                        "100%",

                      touchAction:
                        "none",

                      cursor:
                        canDraw
                          ? isEraser
                            ? "crosshair"
                            : "crosshair"
                          : "default",

                      userSelect:
                        "none",

                      WebkitUserSelect:
                        "none",

                      pointerEvents:
                        canDraw
                          ? "auto"
                          : "none",
                    }}
                    onPointerDown={
                      startDrawing
                    }
                    onPointerMove={
                      draw
                    }
                    onPointerUp={
                      stopDrawing
                    }
                    onPointerCancel={
                      stopDrawing
                    }
                    onPointerLeave={
                      stopDrawing
                    }
                  />

                  {!canDraw && (
                    <div
                      className="whiteboard-readonly-overlay"
                      style={{
                        pointerEvents:
                          "none",
                      }}
                    >

                      <div className="readonly-icon">
                        <FiLock />
                      </div>

                      <strong>
                        View-only whiteboard
                      </strong>

                      <span>
                        Ask the organizer to
                        give you drawing
                        permission.
                      </span>

                    </div>
                  )}

                  {canDraw &&
                    !isDrawing && (
                      <div
                        className="whiteboard-hint"
                        style={{
                          pointerEvents:
                            "none",
                        }}
                      >
                        {isEraser
                          ? "Erase anything on the board"
                          : "Draw, write, or sketch here"}
                      </div>
                    )}

                </div>

                {/* =========================================
                    ORGANIZER PERMISSION PANEL
                ========================================= */}

                {isOrganizer && (
                  <div className="whiteboard-access-panel">

                    <div className="access-header">

                      <div>

                        <div className="access-title">
                          <FiShield />
                          Drawing permissions
                        </div>

                        <p>
                          Allow selected
                          participants to draw.
                          Everyone can still
                          view the board.
                        </p>

                      </div>

                      <span className="organizer-only-label">
                        Organizer
                      </span>

                    </div>

                    <div className="access-list">

                      {whiteboardParticipantList.length ===
                      0 ? (
                        <div className="no-participants">
                          No other participants
                          are currently in the
                          meeting.
                        </div>
                      ) : (
                        whiteboardParticipantList.map(
                          (
                            participant
                          ) => (
                            <div
                              className="access-user"
                              key={
                                participant.id
                              }
                            >

                              <div className="access-user-avatar">
                                {participant.displayName
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </div>

                              <div className="access-user-info">

                                <strong>
                                  {
                                    participant.displayName
                                  }
                                </strong>

                                <span>
                                  {participant.canDraw
                                    ? "Can draw"
                                    : "View only"}
                                </span>

                              </div>

                              <button
                                type="button"
                                className={`permission-button ${
                                  participant.canDraw
                                    ? "revoke"
                                    : "allow"
                                }`}
                                onClick={() =>
                                  setParticipantWhiteboardPermission(
                                    participant.id,
                                    !participant.canDraw
                                  )
                                }
                              >
                                {participant.canDraw ? (
                                  <>
                                    <FiUserX />
                                    Revoke
                                  </>
                                ) : (
                                  <>
                                    <FiUserCheck />
                                    Allow
                                  </>
                                )}
                              </button>

                            </div>
                          )
                        )
                      )}

                    </div>

                  </div>
                )}

              </div>
            )}

          </aside>
        )}

      </main>

      {/* =====================================================
          BOTTOM CONTROLS
      ===================================================== */}

      <footer className="meeting-controls">

        <div className="controls-left">

          <span className="meeting-time">
            LIVE
          </span>

        </div>

        <div className="controls-center">

          {/* MIC */}

          <button
            type="button"
            className={`control-button ${
              !micOn
                ? "control-off"
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

          {/* CAMERA */}

          <button
            type="button"
            className={`control-button ${
              !cameraOn
                ? "control-off"
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

          {/* SCREEN SHARE */}

          <button
            type="button"
            className={`control-button ${
              isScreenSharing
                ? "control-active"
                : ""
            }`}
            title={
              isScreenSharing
                ? "Stop sharing"
                : "Share screen"
            }
            onClick={
              shareScreen
            }
          >
            <FiMonitor />
          </button>

          {/* CHAT */}

          <button
            type="button"
            className={`control-button ${
              showChat
                ? "control-active"
                : ""
            }`}
            onClick={() => {
              closePanels();

              setShowChat(true);
            }}
            title="Chat"
          >
            <FiMessageSquare />
          </button>

          {/* PARTICIPANTS */}

          <button
            type="button"
            className={`control-button ${
              showParticipants
                ? "control-active"
                : ""
            }`}
            onClick={() => {
              closePanels();

              setShowParticipants(
                true
              );
            }}
            title="Participants"
          >
            <FiUsers />

            <span className="participant-badge">
              {participantCount}
            </span>

          </button>

          {/* FILES */}

          <button
            type="button"
            className={`control-button ${
              showFiles
                ? "control-active"
                : ""
            }`}
            onClick={() => {
              closePanels();

              setShowFiles(true);
            }}
            title="Share files"
          >
            <FiPaperclip />
          </button>

          {/* WHITEBOARD */}

          <button
            type="button"
            className={`control-button ${
              showWhiteboard
                ? "control-active"
                : ""
            }`}
            onClick={() => {
              closePanels();

              setShowWhiteboard(
                true
              );
            }}
            title="Whiteboard"
          >
            <FiEdit3 />
          </button>

          {/* MORE */}

         

          {/* LEAVE */}

          <button
            type="button"
            className="leave-button"
            onClick={
              leaveMeeting
            }
            title="Leave meeting"
          >
            <FiPhoneOff />
          </button>

        </div>

        <div className="controls-right">

          <span>
            <FiShield />
            Secure meeting
          </span>

        </div>

      </footer>

    </div>
  );
};

/*
|--------------------------------------------------------------------------
| REMOTE VIDEO
|--------------------------------------------------------------------------
*/

const RemoteVideo = ({
  user,
  mediaStatus,
}) => {
  const videoRef =
    useRef(null);

  const safeMediaStatus =
    mediaStatus ||
    DEFAULT_MEDIA_STATUS;

  useEffect(() => {
    if (
      videoRef.current &&
      user.stream
    ) {
      videoRef.current.srcObject =
        user.stream;
    }
  }, [user.stream]);

  return (
    <div className="participant-card">

      <div className="participant-video">

        {safeMediaStatus.cameraOn &&
        user.stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="local-video"
          />
        ) : (
          <div className="participant-avatar">
            P
          </div>
        )}

        {!safeMediaStatus.cameraOn && (
          <div className="camera-disabled">
            <FiVideoOff />
          </div>
        )}

      </div>

      <div className="participant-info">

        <div className="participant-name">
          Participant
        </div>

        <div className="participant-status">

          {safeMediaStatus.micOn ? (
            <FiMic />
          ) : (
            <FiMicOff />
          )}

        </div>

      </div>

    </div>
  );
};

export default MeetingRoom;

