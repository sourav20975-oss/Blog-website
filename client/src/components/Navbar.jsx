import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'text-orange-400 bg-zinc-800/60' : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-borderc bg-surface/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg" onClick={() => setOpen(false)}>
          <span className="rounded-lg bg-orange-500/15 px-2 py-1 font-mono text-orange-400">&lt;/&gt;</span>
          Blog<span className="text-orange-400">Verse</span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          <NavLink to="/" className={linkClass} end>Home</NavLink>
          <NavLink to="/create" className={linkClass}>New Post</NavLink>
        </div>

        <button
          className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-800 sm:hidden"
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
      </nav>

      {open && (
        <div className="border-t border-borderc px-4 pb-3 pt-2 sm:hidden">
          <NavLink to="/" className={linkClass} end onClick={() => setOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/create" className={`${linkClass({ isActive: false })} mt-1 block`} onClick={() => setOpen(false)}>
            New Post
          </NavLink>
        </div>
      )}
    </header>
  );
}
