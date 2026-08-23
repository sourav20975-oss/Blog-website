import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

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
      className={`absolute right-2 top-2 rounded-md border border-borderc px-2.5 py-1 text-xs font-medium transition-colors ${
        copied
          ? 'bg-green-500/15 text-green-400'
          : 'bg-zinc-800/90 text-zinc-300 hover:text-white hover:bg-zinc-700'
      }`}
      aria-label="Copy code"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export default function Markdown({ children }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        pre({ children }) {
          return (
            <div className="relative group">
              <CopyButton getCode={() => extractText(children)} />
              <pre>{children}</pre>
            </div>
          );
        },
        a({ href, children }) {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              {children}
            </a>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto">
              <table>{children}</table>
            </div>
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
