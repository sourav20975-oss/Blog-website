import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPosts, fetchPdfs } from '../api';
import { toggleTheme, getStoredTheme } from '../theme';
import {
  Search,
  BookOpen,
  FileText,
  Bookmark,
  Sun,
  Moon,
  PenTool,
  Home,
  X,
  CornerDownLeft,
  ArrowRight,
} from 'lucide-react';

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Fetch initial content when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);

      // Pre-fetch items for instant search
      const load = async () => {
        try {
          setLoading(true);
          const [postsRes, pdfsRes] = await Promise.all([
            fetchPosts({ limit: 20 }),
            fetchPdfs({ limit: 20 }),
          ]);
          setPosts(postsRes.posts || []);
          setPdfs(pdfsRes.pdfs || []);
        } catch (err) {
          console.error('Command palette preload failed:', err);
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else window.dispatchEvent(new CustomEvent('bv:open-command-palette'));
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Static navigation and actions
  const defaultActions = [
    {
      id: 'nav-home',
      title: 'Home — Articles & Feed',
      category: 'Navigation',
      icon: <Home className="h-4 w-4 text-orange-500" />,
      run: () => navigate('/'),
    },
    {
      id: 'nav-pdfs',
      title: 'Handbooks & Notes Library',
      category: 'Navigation',
      icon: <BookOpen className="h-4 w-4 text-blue-500" />,
      run: () => navigate('/pdfs'),
    },
    {
      id: 'nav-saved',
      title: 'Saved Library & Bookmarks',
      category: 'Navigation',
      icon: <Bookmark className="h-4 w-4 text-emerald-500" />,
      run: () => navigate('/saved'),
    },
    {
      id: 'nav-write',
      title: 'Write New Article / Note',
      category: 'Navigation',
      icon: <PenTool className="h-4 w-4 text-amber-500" />,
      run: () => navigate('/create'),
    },
    {
      id: 'action-theme',
      title: 'Toggle Color Theme (Dark / Light)',
      category: 'Actions',
      icon: getStoredTheme() === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />,
      run: () => {
        toggleTheme();
        window.dispatchEvent(new CustomEvent('bv:theme-changed'));
      },
    },
  ];

  // Filter items based on query
  const q = query.trim().toLowerCase();

  const filteredPosts = posts
    .filter((p) => !q || p.title.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.tags?.some((t) => t.toLowerCase().includes(q)))
    .map((p) => ({
      id: `post-${p.slug}`,
      title: p.title,
      subtitle: `${p.category || 'Article'} • ${p.readTime || 5} min read`,
      category: 'Articles',
      icon: <FileText className="h-4 w-4 text-orange-500" />,
      run: () => navigate(`/blogpost/${p.slug}`),
    }));

  const filteredPdfs = pdfs
    .filter((p) => !q || p.title.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
    .map((p) => ({
      id: `pdf-${p._id}`,
      title: p.title,
      subtitle: `${p.category || 'Handbook'} • PDF Reference`,
      category: 'Handbooks & Notes',
      icon: <BookOpen className="h-4 w-4 text-blue-500" />,
      run: () => navigate('/pdfs'),
    }));

  const filteredActions = defaultActions.filter(
    (a) => !q || a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
  );

  const allItems = [...filteredActions, ...filteredPosts, ...filteredPdfs];

  // Keyboard navigation within list
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < allItems.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].run();
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-borderc bg-card/95 shadow-2xl backdrop-blur-xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-borderc px-4 py-3.5">
          <Search className="h-5 w-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search articles, handbooks, tags, actions... (↑↓ to navigate)"
            className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
          {loading && allItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              Loading index...
            </div>
          ) : allItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              {allItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      item.run();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0">{item.icon}</div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.title}
                        </div>
                        {item.subtitle && (
                          <div className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="rounded bg-zinc-200/60 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        {item.category}
                      </span>
                      {isSelected && (
                        <CornerDownLeft className="h-3 w-3 text-orange-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="flex items-center justify-between border-t border-borderc bg-zinc-50/50 dark:bg-zinc-900/50 px-4 py-2 text-[11px] text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-borderc bg-card px-1 py-0.5 font-mono text-[10px]">↑</kbd>
              <kbd className="rounded border border-borderc bg-card px-1 py-0.5 font-mono text-[10px]">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-borderc bg-card px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
              to open
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-borderc bg-card px-1.5 py-0.5 font-mono text-[10px]">esc</kbd>
            to close
          </span>
        </div>
      </div>
    </div>
  );
}
