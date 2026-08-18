const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const getToken = () => {
  return localStorage.getItem("token");
};

const request = async (
  endpoint,
  options = {}
) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Something went wrong."
    );
  }

  return data;
};

// ==========================================
// MEETINGS
// ==========================================

export const createMeeting = (meetingData) => {
  return request("/api/meetings", {
    method: "POST",
    body: JSON.stringify(meetingData),
  });
};

export const getMyMeetings = () => {
  return request("/api/meetings/my");
};

export const getMeetingById = (meetingId) => {
  return request(
    `/api/meetings/${encodeURIComponent(
      meetingId
    )}`
  );
};

export const deleteMeeting = (meetingId) => {
  return request(
    `/api/meetings/${encodeURIComponent(
      meetingId
    )}`,
    {
      method: "DELETE",
    }
  );
};

export default {
  createMeeting,
  getMyMeetings,
  getMeetingById,
  deleteMeeting,
};