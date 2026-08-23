import { Link } from 'react-router-dom';

const TOPICS = [
  { label: 'SQL Tutorial', slug: 'the-ultimate-sql-course' },
  { label: 'Docker Notes', slug: 'the-ultimate-docker-course' },
  { label: 'Linux & Networking', slug: 'the-ultimate-linux-networking-course' },
  { label: 'Git & Open Source', slug: 'the-ultimate-open-source-contribution-course' },
];

const SOCIALS = [
  {
    label: 'GitHub',
    href: 'https://github.com/sourav20975-oss',
    path: 'M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 015.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.27 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.66.8.55A11.51 11.51 0 0023.5 12C23.5 5.65 18.35.5 12 .5z',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/sourav-kumar-20975s/',
    path: 'M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.55V9h3.57v11.45z',
  },
  {
    label: 'X / Twitter',
    href: '#',
    path: 'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z',
  },
  {
    label: 'YouTube',
    href: '#',
    path: 'M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 00.5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 002.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 002.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z',
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-borderc bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="rounded-lg bg-orange-500 px-2 py-1 font-mono text-sm text-white">&lt;/&gt;</span>
            Blog<span className="text-orange-500 dark:text-orange-400">Verse</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Tutorials, notes and blogs — all in one place. Learn to code, free forever.
          </p>
          <div className="mt-4 flex gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="rounded-lg border border-borderc p-2 text-zinc-500 transition-colors hover:border-orange-500 hover:text-orange-500 dark:text-zinc-400 dark:hover:text-orange-400"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/" className="text-zinc-600 transition-colors hover:text-orange-500 dark:text-zinc-400 dark:hover:text-orange-400">
                Home
              </Link>
            </li>
            <li>
              <Link to="/create" className="text-zinc-600 transition-colors hover:text-orange-500 dark:text-zinc-400 dark:hover:text-orange-400">
                Write a Post
              </Link>
            </li>
          </ul>
        </div>

        {/* Topics */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Tutorials</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {TOPICS.map((t) => (
              <li key={t.slug}>
                <Link
                  to={`/blogpost/${t.slug}`}
                  className="text-zinc-600 transition-colors hover:text-orange-500 dark:text-zinc-400 dark:hover:text-orange-400"
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Stack */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Built With</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>MongoDB</li>
            <li>Express.js</li>
            <li>React (Vite)</li>
            <li>Node.js</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-borderc">
        <p className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-zinc-500 sm:px-6">
          &copy; {new Date().getFullYear()} BlogVerse &middot; Made with <span className="text-red-500">&#10084;</span> by{' '}
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">Sourav Kumar</span> using the MERN stack
        </p>
      </div>
    </footer>
  );
}
