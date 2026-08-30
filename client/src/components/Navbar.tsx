import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";
import { useLogout } from "../api/hooks/useAuth";
import NotificationBell from "./NotificationBell";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/projects", label: "Projects" },
  { to: "/blog", label: "Blog" },
  { to: "/search", label: "Discover" },
  { to: "/network", label: "Network" },
];

export default function Navbar() {
  const { user } = useAuthStore();
  const { mobileNavOpen, toggleMobileNav, closeMobileNav } = useUIStore();
  const logout = useLogout();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout.mutateAsync();
    closeMobileNav();
    navigate("/login");
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="text-xl font-extrabold" onClick={closeMobileNav}>
          Dev<span className="text-brand-600">Connect</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {user &&
            links.map((l) => (
              <Link key={l.to} to={l.to} className="text-sm font-medium text-gray-700 hover:text-brand-600">
                {l.label}
              </Link>
            ))}

          {user ? (
            <div className="flex items-center gap-4">
              <NotificationBell />
              <Link to={`/profile/${user.id}`} className="text-sm font-medium text-gray-700 hover:text-brand-600">
                {user.name}
              </Link>
              <button onClick={handleLogout} className="btn-secondary py-1.5 text-sm">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-700">
                Log in
              </Link>
              <Link to="/register" className="btn-primary py-1.5 text-sm">
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          onClick={toggleMobileNav}
          aria-label="Toggle menu"
        >
          {mobileNavOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileNavOpen && (
        <div className="border-t border-gray-100 px-4 pb-4 md:hidden">
          {user &&
            links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={closeMobileNav}
                className="block py-2 text-sm font-medium text-gray-700"
              >
                {l.label}
              </Link>
            ))}

          {user ? (
            <>
              <Link
                to={`/profile/${user.id}`}
                onClick={closeMobileNav}
                className="block py-2 text-sm font-medium text-gray-700"
              >
                My Profile
              </Link>
              <button onClick={handleLogout} className="mt-2 w-full btn-secondary text-sm">
                Log out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" onClick={closeMobileNav} className="btn-secondary text-sm">
                Log in
              </Link>
              <Link to="/register" onClick={closeMobileNav} className="btn-primary text-sm">
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
