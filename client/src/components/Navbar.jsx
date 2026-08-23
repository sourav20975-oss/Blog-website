import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { applyTheme, getStoredTheme } from '../theme';
import { useAuth } from '../AuthContext';

function SunIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36 6.36l-1.42-1.42M7.05 7.05L5.64 5.64m12.72 0l-1.42 1.41M7.05 16.95l-1.41 1.41M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      />
    </svg>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(getStoredTheme);
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Agar user OS se theme badle aur localStorage me choice save na ho
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      let saved = null;
      try {
        saved = localStorage.getItem('theme');
      } catch {
        /* ignore */
      }
      if (saved !== 'light' && saved !== 'dark') {
        const next = e.matches ? 'dark' : 'light';
        applyTheme(next);
        setTheme(next);
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'text-orange-500 bg-orange-500/10 dark:text-orange-400'
        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-900/5 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/10'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-borderc bg-surface/80 backdrop-blur-md supports-[backdrop-filter]:bg-surface/60">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold" onClick={() => setOpen(false)}>
          <span className="rounded-lg bg-orange-500 px-2 py-1 font-mono text-sm text-white shadow-sm shadow-orange-500/30">
            &lt;/&gt;
          </span>
          Blog<span className="text-orange-500 dark:text-orange-400">Verse</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden items-center gap-1 sm:flex">
            <NavLink to="/" className={linkClass} end>
              Home
            </NavLink>
            {isAdmin ? (
              <NavLink to="/create" className={linkClass}>
                New Post
              </NavLink>
            ) : null}
          </div>

          {isLoggedIn ? (
            <>
              <span className="hidden max-w-[10rem] truncate rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 md:block">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-zinc-300 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-orange-500 dark:text-zinc-300 dark:hover:text-orange-400"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-orange-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-orange-500/30 transition-all hover:bg-orange-600 active:scale-[0.98]"
              >
                Sign Up
              </Link>
            </>
          )}

          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className="ml-1 rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-900/5 hover:text-orange-500 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-orange-400"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <button
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-900/5 dark:text-zinc-300 dark:hover:bg-white/10 sm:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-borderc px-4 pb-3 pt-2 sm:hidden">
          <NavLink to="/" className={`${linkClass({ isActive: false })} block`} end onClick={() => setOpen(false)}>
            Home
          </NavLink>
          {isAdmin && (
            <>
              <NavLink
                to="/create"
                className={`${linkClass({ isActive: false })} mt-1 block`}
                onClick={() => setOpen(false)}
              >
                New Post
              </NavLink>
            </>
          )}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Logout ({user.name})
            </button>
          )}        </div>
      )}
    </header>
  );
}
