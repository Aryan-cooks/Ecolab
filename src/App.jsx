import React, { useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useStore } from "./store/useStore";

// Layout
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import GlobalTips from "./components/GlobalTips";

// Pages
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Calculator from "./pages/Calculator";
import Dashboard from "./pages/Dashboard";
import Suggestions from "./pages/Suggestions";
import Tracker from "./pages/Tracker";
import Chat from "./pages/Chat";
import Achievements from "./pages/Achievements";

function ProtectedRoute({ children }) {
  const { user, isLoading } = useStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-neon-green">
        <span className="material-symbols-outlined text-4xl animate-spin mb-4">
          terminal
        </span>
        <div className="text-xs font-bold tracking-widest uppercase">
          BOOTING_ECO_LAB_V2.4...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Check onboarding completeness
  const onboarded = user.location && user.location.city && user.location.state;
  if (!onboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function MainLayout() {
  const { user } = useStore();
  const location = useLocation();
  const showChrome =
    user &&
    location.pathname !== "/onboarding" &&
    location.pathname !== "/" &&
    location.pathname !== "/signup";

  return (
    <div className="min-h-screen bg-black text-neon-green grid-bg relative overflow-x-hidden">
      <div className="scanline"></div>

      {showChrome && <Sidebar />}
      {showChrome && <Header />}
      {showChrome && <GlobalTips />}

      <div className={`${showChrome ? "md:ml-64 pb-20 md:pb-8" : ""}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<Auth />} />

          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/calculator"
            element={
              <ProtectedRoute>
                <Calculator />
              </ProtectedRoute>
            }
          />

          <Route
            path="/suggestions"
            element={
              <ProtectedRoute>
                <Suggestions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tracker"
            element={
              <ProtectedRoute>
                <Tracker />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  const initStore = useStore((state) => state.initStore);

  useEffect(() => {
    initStore();
  }, [initStore]);

  return (
    <Router>
      <MainLayout />
    </Router>
  );
}
