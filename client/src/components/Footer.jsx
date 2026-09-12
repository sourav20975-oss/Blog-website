import { Link } from 'react-router-dom';
import Logo from './Logo';

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
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-borderc bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="inline-block group">
            <Logo size="md" />
          </Link>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Open-source developer publications, comprehensive engineering tutorials, and reference handbooks.
          </p>
          <div className="mt-4 flex gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="rounded-xl border border-borderc p-2 text-zinc-500 transition-colors hover:border-orange-500 hover:text-orange-500 dark:text-zinc-400 dark:hover:text-orange-400"
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
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            Navigation
          </h3>
          <ul className="mt-4 space-y-2.5 text-xs sm:text-sm">
            <li>
              <Link to="/" className="text-zinc-600 transition-colors hover:text-orange-500 dark:text-zinc-400">
                Home
              </Link>
            </li>
            <li>
              <Link to="/pdfs" className="text-zinc-600 transition-colors hover:text-orange-500 dark:text-zinc-400">
                PDF Vault (Books &amp; Notes)
              </Link>
            </li>
            <li>
              <Link to="/create" className="text-zinc-600 transition-colors hover:text-orange-500 dark:text-zinc-400">
                Write Article
              </Link>
            </li>
          </ul>
        </div>

        {/* Topics */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            Tutorial Topics
          </h3>
          <ul className="mt-4 space-y-2.5 text-xs sm:text-sm">
            {TOPICS.map((t) => (
              <li key={t.slug}>
                <Link
                  to={`/blogpost/${t.slug}`}
                  className="text-zinc-600 transition-colors hover:text-orange-500 dark:text-zinc-400"
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Architecture */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            Architecture
          </h3>
          <ul className="mt-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
            <li>&bull; MongoDB Atlas (Database)</li>
            <li>&bull; MongoDB GridFS (50MB PDFs)</li>
            <li>&bull; Cloudinary CDN (Images)</li>
            <li>&bull; React 18 + Vite</li>
            <li>&bull; Tailwind CSS + Typography</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-borderc">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-zinc-500 sm:px-6">
          &copy; {new Date().getFullYear()} BlogVerse &middot; Developed by{' '}
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">Sourav Kumar</span>
        </p>
      </div>
    </footer>
  );
}
