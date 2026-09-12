import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check, ExternalLink, ZoomIn, X, Info, Lightbulb, AlertTriangle, AlertCircle } from 'lucide-react';

function extractText(node) {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node.props && node.props.children) return extractText(node.props.children);
  return '';
}

function CopyButton({ getCode }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <button
      onClick={onCopy}
      className={`absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-xs font-medium transition-all ${
        copied
          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white backdrop-blur'
      }`}
      aria-label="Copy code"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

// Interactive zoomable image for mid-article illustrations
function MarkdownImage({ src, alt }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!src) return null;

  return (
    <>
      <figure className="my-6 block overflow-hidden rounded-xl border border-borderc bg-card/60 p-2 shadow-sm transition-all hover:border-orange-500/40">
        <div className="relative group cursor-pointer overflow-hidden rounded-lg bg-zinc-950/5 dark:bg-black/30" onClick={() => setIsOpen(true)}>
          <img
            src={src}
            alt={alt || 'Blog illustration'}
            loading="lazy"
            className="w-full max-h-[500px] object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.01]"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-[2px]">
            <span className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              <ZoomIn className="h-3.5 w-3.5" /> Click to enlarge
            </span>
          </div>
        </div>
        {alt && (
          <figcaption className="mt-2 text-center text-xs italic text-zinc-500 dark:text-zinc-400">
            {alt}
          </figcaption>
        )}
      </figure>

      {/* Fullscreen Lightbox Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md transition-opacity"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-10 right-0 flex items-center gap-1 text-sm text-zinc-300 hover:text-white"
            >
              <X className="h-5 w-5" /> Close
            </button>
            <img
              src={src}
              alt={alt}
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl border border-zinc-800"
            />
            {alt && (
              <p className="mt-3 text-center text-sm font-medium text-zinc-300">
                {alt}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function slugifyHeading(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

export default function Markdown({ children }) {
  if (!children) return null;
  const raw = typeof children === 'string' ? children : '';
  if (raw.startsWith('[GZ]')) {
    return <p className="text-sm italic text-zinc-500">Notes content is loading...</p>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        h2({ children }) {
          const text = extractText(children);
          const id = slugifyHeading(text);
          return (
            <h2 id={id} className="group relative scroll-mt-24 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-10 mb-4 flex items-center">
              <span>{children}</span>
              <a href={`#${id}`} aria-hidden="true" className="ml-2 text-sm text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-orange-500 transition-opacity">
                #
              </a>
            </h2>
          );
        },
        h3({ children }) {
          const text = extractText(children);
          const id = slugifyHeading(text);
          return (
            <h3 id={id} className="group relative scroll-mt-24 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-8 mb-3 flex items-center">
              <span>{children}</span>
              <a href={`#${id}`} aria-hidden="true" className="ml-2 text-sm text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-orange-500 transition-opacity">
                #
              </a>
            </h3>
          );
        },
        pre({ children }) {
          return (
            <div className="relative my-5 group">
              <CopyButton getCode={() => extractText(children)} />
              <pre className="overflow-x-auto rounded-xl border border-borderc bg-zinc-950 p-4 text-sm font-mono leading-relaxed text-zinc-100 shadow-inner">
                {children}
              </pre>
            </div>
          );
        },
        code({ node, inline, className, children, ...props }) {
          if (inline) {
            return (
              <code className="rounded bg-orange-500/10 px-1.5 py-0.5 font-mono text-[0.875em] font-semibold text-orange-600 dark:text-orange-400" {...props}>
                {children}
              </code>
            );
          }
          return <code className={className} {...props}>{children}</code>;
        },
        img({ src, alt }) {
          return <MarkdownImage src={src} alt={alt} />;
        },
        a({ href, children }) {
          const isExternal = href?.startsWith('http');
          return (
            <a
              href={href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center gap-1 font-medium text-orange-600 dark:text-orange-400 hover:underline"
            >
              {children}
              {isExternal && <ExternalLink className="inline h-3 w-3 opacity-70" />}
            </a>
          );
        },
        table({ children }) {
          return (
            <div className="my-6 overflow-x-auto rounded-xl border border-borderc">
              <table className="w-full text-left text-sm">{children}</table>
            </div>
          );
        },
        blockquote({ children }) {
          // Check for GitHub style alert tags
          const text = extractText(children);
          let alertType = null;
          let cleanText = text;

          if (text.includes('[!NOTE]')) alertType = 'note';
          else if (text.includes('[!TIP]')) alertType = 'tip';
          else if (text.includes('[!WARNING]')) alertType = 'warning';
          else if (text.includes('[!CAUTION]')) alertType = 'caution';

          if (alertType) {
            const icons = {
              note: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
              tip: <Lightbulb className="h-5 w-5 text-emerald-500 shrink-0" />,
              warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
              caution: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
            };
            const styles = {
              note: 'border-blue-500/40 bg-blue-500/10 text-blue-900 dark:text-blue-200',
              tip: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200',
              warning: 'border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200',
              caution: 'border-rose-500/40 bg-rose-500/10 text-rose-900 dark:text-rose-200',
            };

            return (
              <div className={`my-5 flex gap-3 rounded-xl border p-4 text-sm ${styles[alertType]}`}>
                {icons[alertType]}
                <div className="flex-1">{children}</div>
              </div>
            );
          }

          return (
            <blockquote className="my-5 border-l-4 border-orange-500 pl-4 py-1 italic text-zinc-600 dark:text-zinc-400 bg-orange-500/5 rounded-r-lg">
              {children}
            </blockquote>
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
