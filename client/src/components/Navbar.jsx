import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { applyTheme, getStoredTheme } from '../theme';
import { useAuth } from '../AuthContext';
import { getTotalSavedCount } from '../utils/bookmarks';
import {
  Sun,
  Moon,
  Menu,
  X,
  BookOpen,
  Plus,
  LogOut,
  LogIn,
  User,
  Shield,
  Search,
  Bookmark,
} from 'lucide-react';

import Logo from './Logo';

export default function Navbar({ onOpenCommand }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(getStoredTheme);
  const [savedCount, setSavedCount] = useState(0);
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    setSavedCount(getTotalSavedCount());
    const handleBookmarkChange = () => setSavedCount(getTotalSavedCount());
    window.addEventListener('bv:bookmarks-changed', handleBookmarkChange);
    return () => window.removeEventListener('bv:bookmarks-changed', handleBookmarkChange);
  }, []);

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
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'text-zinc-900 bg-zinc-100 dark:text-white dark:bg-zinc-800'
        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-borderc bg-surface/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo - clean and authoritative */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link
            to="/"
            className="group flex items-center"
            onClick={() => setOpen(false)}
          >
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={linkClass} end>
              Articles
            </NavLink>
            <NavLink to="/pdfs" className={linkClass}>
              Handbooks &amp; Notes
            </NavLink>
            <NavLink to="/saved" className={linkClass}>
              <span className="flex items-center gap-1.5">
                <Bookmark className="h-3.5 w-3.5" />
                <span>Saved</span>
                {savedCount > 0 && (
                  <span className="rounded-full bg-orange-500/20 px-1.5 py-0.2 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                    {savedCount}
                  </span>
                )}
              </span>
            </NavLink>
            {isAdmin && (
              <NavLink to="/create" className={linkClass}>
                <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Write</span>
                </span>
              </NavLink>
            )}
          </div>
        </div>

        {/* Center/Right Command Palette Search Trigger */}
        <div className="flex items-center gap-2.5">
          {onOpenCommand && (
            <button
              onClick={onOpenCommand}
              className="flex items-center gap-2 rounded-xl border border-borderc bg-zinc-100/70 dark:bg-zinc-800/60 px-2.5 py-1.5 text-xs text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              title="Open Command Palette (Ctrl+K / ⌘K)"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-zinc-400">Search...</span>
              <kbd className="hidden sm:inline-block rounded border border-borderc bg-card px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                ⌘K
              </kbd>
            </button>
          )}

          {/* User Auth or Sign Up */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-borderc bg-card px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300">
                {isAdmin && <Shield className="h-3 w-3 text-orange-500" />}
                <span className="font-semibold truncate max-w-[110px]">{user.name}</span>
                {isAdmin && (
                  <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">
                    admin
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-lg border border-borderc px-2.5 py-1 text-xs font-medium text-zinc-600 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
                title="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-2.5 py-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="rounded-lg border border-borderc p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="rounded-lg border border-borderc p-1.5 text-zinc-600 dark:text-zinc-400 md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {open && (
        <div className="border-t border-borderc bg-card px-4 pb-4 pt-2 md:hidden">
          <div className="space-y-1">
            <NavLink
              to="/"
              className={linkClass}
              end
              onClick={() => setOpen(false)}
            >
              Articles
            </NavLink>
            <NavLink
              to="/pdfs"
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              Handbooks &amp; Notes
            </NavLink>
            <NavLink
              to="/saved"
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              <span className="flex items-center gap-1.5">
                <Bookmark className="h-3.5 w-3.5" />
                <span>Saved Vault ({savedCount})</span>
              </span>
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/create"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                Write Post
              </NavLink>
            )}
          </div>

          {isLoggedIn && (
            <div className="mt-3 border-t border-borderc pt-3 flex items-center justify-between">
              <span className="text-xs text-zinc-500">{user.name}</span>
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="text-xs font-medium text-red-500 hover:underline"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
