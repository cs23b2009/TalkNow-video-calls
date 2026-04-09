import { Navigate, Route, Routes } from "react-router";

import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import EmailVerificationPage from "./pages/EmailVerificationPage.jsx";

import { Toaster } from "react-hot-toast";

import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";
import FriendsPage from "./pages/FriendsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import { useSocket } from "./context/SocketContext.jsx";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { PhoneCall } from "lucide-react";
import { useNavigate } from "react-router";

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    socket.on("incoming:call", ({ from, offer }) => {
      toast((t) => (
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-full text-primary">
            <PhoneCall size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">Incoming Call</p>
            <p className="text-xs opacity-70">User is calling you...</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                toast.dismiss(t.id);
                const callId = [authUser._id, from].sort().join("-");
                navigate(`/call/${callId}`);
              }}
              className="btn btn-primary btn-xs"
            >
              Join
            </button>
            <button onClick={() => toast.dismiss(t.id)} className="btn btn-ghost btn-xs">
              Decline
            </button>
          </div>
        </div>
      ), { duration: 10000 });
    });

    return () => socket.off("incoming:call");
  }, [socket, authUser, navigate]);

  const isAuthenticated = Boolean(authUser);
  const isVerified = authUser?.isVerified;
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen" data-theme={theme}>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              isVerified ? (
                isOnboarded ? (
                  <Layout showSidebar={true}>
                    <HomePage />
                  </Layout>
                ) : (
                  <Navigate to="/onboarding" />
                )
              ) : (
                <Navigate to="/verify-email" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <SignUpPage />
            ) : (
              <Navigate to={isOnboarded ? "/" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to={isOnboarded ? "/" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/friends"
          element={
            isAuthenticated ? (
              isVerified ? (
                isOnboarded ? (
                  <Layout showSidebar={true}>
                    <FriendsPage />
                  </Layout>
                ) : (
                  <Navigate to="/onboarding" />
                )
              ) : (
                <Navigate to="/verify-email" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/notifications"
          element={
            isAuthenticated ? (
              isVerified ? (
                isOnboarded ? (
                  <Layout showSidebar={true}>
                    <NotificationsPage />
                  </Layout>
                ) : (
                  <Navigate to="/onboarding" />
                )
              ) : (
                <Navigate to="/verify-email" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/call/:id"
          element={
            isAuthenticated ? (
              isVerified ? (
                isOnboarded ? (
                  <CallPage />
                ) : (
                  <Navigate to="/onboarding" />
                )
              ) : (
                <Navigate to="/verify-email" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/chat/:id"
          element={
            isAuthenticated ? (
              isVerified ? (
                isOnboarded ? (
                  <Layout showSidebar={false}>
                    <ChatPage />
                  </Layout>
                ) : (
                  <Navigate to="/onboarding" />
                )
              ) : (
                <Navigate to="/verify-email" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              isVerified ? (
                isOnboarded ? (
                  <Layout showSidebar={true}>
                    <ProfilePage />
                  </Layout>
                ) : (
                  <Navigate to="/onboarding" />
                )
              ) : (
                <Navigate to="/verify-email" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/verify-email"
          element={
            isAuthenticated ? (
              !isVerified ? (
                <EmailVerificationPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/onboarding"
          element={
            isAuthenticated ? (
              isVerified ? (
                !isOnboarded ? (
                  <OnboardingPage />
                ) : (
                  <Navigate to="/" />
                )
              ) : (
                <Navigate to="/verify-email" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>

      <Toaster />
    </div>
  );
};
export default App;
