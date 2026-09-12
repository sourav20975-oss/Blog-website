import { useState, useEffect } from 'react';
import { slugifyHeading } from './Markdown';
import { List, ChevronDown, ChevronUp, AlignLeft, Type, Maximize2, Minimize2 } from 'lucide-react';

export function parseHeadings(markdown) {
  if (!markdown || typeof markdown !== 'string') return [];
  const lines = markdown.split('\n');
  const headings = [];

  let inCodeBlock = false;
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length; // 2 or 3
      const text = match[2].trim().replace(/[*_~`]/g, '');
      const id = slugifyHeading(text);
      if (text && id) {
        headings.push({ id, text, level });
      }
    }
  }

  return headings;
}

export default function TableOfContents({
  headings = [],
  fontSize = 'normal',
  setFontSize,
  isFocusMode = false,
  setIsFocusMode,
}) {
  const [activeId, setActiveId] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Track active heading & scroll progress
  useEffect(() => {
    if (!headings.length) return;

    const handleScroll = () => {
      // Calculate reading percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, Math.round((window.scrollY / totalHeight) * 100)));
        setReadingProgress(progress);
      }

      // Find active heading based on top offset
      const headingElements = headings
        .map((h) => ({ id: h.id, el: document.getElementById(h.id) }))
        .filter((item) => item.el !== null);

      if (!headingElements.length) return;

      const scrollPos = window.scrollY + 140; // offset for sticky navbar
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const item = headingElements[i];
        if (item.el.offsetTop <= scrollPos) {
          setActiveId(item.id);
          return;
        }
      }
      setActiveId(headingElements[0].id);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const scrollToHeading = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 90;
      const elPos = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elPos - navOffset,
        behavior: 'smooth',
      });
      setActiveId(id);
      setMobileOpen(false);
    }
  };

  if (!headings.length) return null;

  return (
    <aside className="w-full">
      {/* Mobile Drawer Trigger */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex w-full items-center justify-between rounded-xl border border-borderc bg-card/80 px-4 py-3 text-sm font-semibold text-zinc-800 shadow-sm backdrop-blur dark:text-zinc-200"
        >
          <span className="flex items-center gap-2">
            <List className="h-4 w-4 text-orange-500" />
            <span>Table of Contents ({headings.length} sections)</span>
          </span>
          {mobileOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {mobileOpen && (
          <div className="mt-2 rounded-xl border border-borderc bg-card/95 p-4 shadow-xl backdrop-blur">
            <nav className="space-y-1.5 max-h-72 overflow-y-auto">
              {headings.map((h) => (
                <button
                  key={h.id}
                  onClick={() => scrollToHeading(h.id)}
                  className={`block w-full text-left text-xs transition-colors py-1 ${
                    h.level === 3 ? 'pl-4' : 'pl-1 font-medium'
                  } ${
                    activeId === h.id
                      ? 'text-orange-600 dark:text-orange-400 font-semibold'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  {h.text}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Desktop Sticky Panel */}
      <div className="hidden lg:block sticky top-24 rounded-2xl border border-borderc/80 bg-card/60 p-5 backdrop-blur shadow-sm">
        {/* Header & Reading Progress */}
        <div className="flex items-center justify-between pb-3 border-b border-borderc/60">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <AlignLeft className="h-3.5 w-3.5 text-orange-500" />
            <span>On This Page</span>
          </div>
          <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[11px] font-semibold text-orange-600 dark:text-orange-400">
            {readingProgress}%
          </span>
        </div>

        {/* Progress Bar Line */}
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-150"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        {/* TOC Links */}
        <nav className="mt-4 max-h-[calc(100vh-280px)] overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
          {headings.map((h) => {
            const isActive = activeId === h.id;
            return (
              <button
                key={h.id}
                onClick={() => scrollToHeading(h.id)}
                className={`group flex w-full items-start text-left text-xs transition-all duration-150 py-1 rounded-md px-2 ${
                  h.level === 3 ? 'pl-5 text-zinc-500 dark:text-zinc-400' : 'font-medium'
                } ${
                  isActive
                    ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border-l-2 border-orange-500'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
                }`}
              >
                <span className="line-clamp-2 leading-relaxed">{h.text}</span>
              </button>
            );
          })}
        </nav>

        {/* Reading Preference Controls */}
        <div className="mt-6 pt-4 border-t border-borderc/60 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Type className="h-3.5 w-3.5" />
            <span>Text:</span>
            <button
              onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                fontSize === 'large'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
              }`}
              title="Toggle larger reading font size"
            >
              {fontSize === 'normal' ? '1x' : '1.2x'}
            </button>
          </div>

          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              isFocusMode
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
            }`}
            title="Toggle distraction-free focus mode"
          >
            {isFocusMode ? (
              <>
                <Minimize2 className="h-3 w-3" />
                <span>Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3 w-3" />
                <span>Focus</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
