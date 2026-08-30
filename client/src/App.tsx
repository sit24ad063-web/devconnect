import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import RealtimeProvider from "./components/RealtimeProvider";

import { useMe } from "./api/hooks/useAuth";
import { useAuthStore } from "./store/authStore";

import Login from "./pages/Login";
import Register from "./pages/Register";
import GithubCallback from "./pages/GithubCallback";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectForm from "./pages/ProjectForm";
import Blog from "./pages/Blog";
import PostDetail from "./pages/PostDetail";
import PostForm from "./pages/PostForm";
import Search from "./pages/Search";
import Network from "./pages/Network";
import Profile from "./pages/Profile";

export default function App() {
  const { data, isSuccess, isError } = useMe();

  const { user, initialized, setUser, setInitialized } = useAuthStore();

  // Bootstrap authentication session from the backend.
  useEffect(() => {
    if (isSuccess && data?.user) {
      setUser(data.user);
      setInitialized(true);
    }

    if (isError) {
      setUser(null);
      setInitialized(true);
    }
  }, [data, isSuccess, isError, setUser, setInitialized]);

  return (
    <RealtimeProvider>
      <Navbar />

      <main className="min-h-[calc(100vh-64px)]">
        <Routes>
          <Route
            path="/"
            element={
              !initialized ? (
                <div className="py-24 text-center text-gray-500">Loading...</div>
              ) : (
                <Navigate to={user ? "/dashboard" : "/login"} replace />
              )
            }
          />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route
            path="/oauth/callback"
            element={<GithubCallback />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/projects" element={<Projects />} />

          <Route
            path="/projects/new"
            element={
              <ProtectedRoute>
                <ProjectForm />
              </ProtectedRoute>
            }
          />

          <Route path="/blog" element={<Blog />} />

          <Route
            path="/blog/:slug"
            element={<PostDetail />}
          />

          <Route
            path="/blog/new"
            element={
              <ProtectedRoute>
                <PostForm />
              </ProtectedRoute>
            }
          />

          <Route path="/search" element={<Search />} />

          <Route
            path="/network"
            element={
              <ProtectedRoute>
                <Network />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/:id"
            element={<Profile />}
          />

          <Route
            path="*"
            element={
              <div className="p-8 text-center">
                Page not found.
              </div>
            }
          />
        </Routes>
      </main>
    </RealtimeProvider>
  );
}