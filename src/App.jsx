import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MeetingSetup from "./pages/MeetingSetup";
import MeetingRoom from "./pages/MeetingRoom";
import JoinMeeting from "./pages/JoinMeeting";
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";
import Meetings from "./pages/Meetings";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================================
            PUBLIC ROUTES
        ========================================= */}

        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =========================================
            PROTECTED ROUTES
        ========================================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            JOIN MEETING
            Example:
            /join
        ========================================= */}

        <Route
          path="/join"
          element={
            <ProtectedRoute>
              <JoinMeeting />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            MEETING SETUP
            Example:
            /meeting/setup/ABC123
        ========================================= */}

        <Route
          path="/meeting/setup/:meetingId"
          element={
            <ProtectedRoute>
              <MeetingSetup />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            MEETING ROOM
            Example:
            /meeting/ABC123
        ========================================= */}

        <Route
          path="/meeting/:meetingId"
          element={
            <ProtectedRoute>
              <MeetingRoom />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            FALLBACK
        ========================================= */}

        <Route
          path="*"
          element={<Home />}
        />
           
        {/* settings */}
        <Route
     path="/settings"
     element={<Settings />}
     />

     <Route
  path="/meetings"
  element={<Meetings />}
/>
     

      </Routes>
    </BrowserRouter>
  );
}

export default App;

