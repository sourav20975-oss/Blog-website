import { useRef, useState } from 'react';
import { uploadImage } from '../api';
import Markdown from './Markdown';

function Icon({ d, className = '' }) {
  return (
    <svg className={`h-4 w-4 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const ICONS = {
  bold: 'M6 4h8a4 4 0 010 8H6zM6 12h9a4 4 0 110 8H6z',
  italic: 'M19 4h-9M14 20H5M15 4L9 20',
  strike: 'M16 4H9a3 3 0 00-2.83 4M14 12a4 4 0 010 8H6M4 12h16',
  h1: 'M4 6v12M13 6v12M13 12h-1.5M18 18l3-2V6l-3 2',
  h2: 'M4 6v12M12 6v12M12 12h-1.5M17 8a2 2 0 013.46-1.36c.54.54.54 1.36.54 1.86 0 2-4 4-4 6h4.5',
  h3: 'M4 6v12M12 6v12M12 12h-1.5M17 7h4l-2.5 4a2.5 2.5 0 11-2 4l4.5-.5',
  quote: 'M7 16H4l2-6h3M17 16h-3l2-6h3M7 10a4 4 0 118 0v6',
  code: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
  codeblock: 'M8 9l-3 3 3 3M16 9l3 3-3 3M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z',
  bullet: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  number: 'M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1',
  link: 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
  table: 'M3 5h18v14H3zM3 10h18M9 5v14M15 5v14',
  hr: 'M3 12h18M8 7h8M8 17h8',
  image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M5 6a1 1 0 100-2 1 1 0 000 2zm-2 12V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2z',
};

function TBtn({ title, onClick, children, disabled }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white"
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="mx-1 h-5 w-px bg-borderc" />;

export default function MarkdownEditor({ value, onChange }) {
  const taRef = useRef(null);
  const fileRef = useRef(null);
  const [mode, setMode] = useState('write');
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState('');

  // text ko cursor/selection ke around modify karke wapas focus restore karo
  function insert(text, selStart = null, selEnd = null) {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    onChange(value.slice(0, s) + text + value.slice(e));
    requestAnimationFrame(() => {
      ta.focus();
      const a = selStart === null ? s + text.length : selStart;
      ta.setSelectionRange(a, selEnd === null ? a : selEnd);
    });
  }

  function wrap(before, after, placeholder = 'text') {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const selected = value.slice(s, e);

    // already wrapped? -> unwrap (toggle off)
    if (
      selected !== '' &&
      value.slice(Math.max(0, s - before.length), s) === before &&
      value.slice(e, e + after.length) === after
    ) {
      insert(selected, s - before.length, e - before.length);
      return;
    }
    const inner = selected || placeholder;
    const newText = before + inner + after;
    insert(newText, s + before.length, s + before.length + inner.length);
  }

  function prefixLines(prefixFn) {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const lineStart = value.lastIndexOf('\n', s - 1) + 1;
    let lineEnd = value.indexOf('\n', e);
    if (lineEnd === -1) lineEnd = value.length;

    const lines = value.slice(lineStart, lineEnd).split('\n');
    const nonEmpty = lines.filter((l) => l.trim());
    const allHave =
      typeof prefixFn === 'string' && nonEmpty.length > 0
        ? nonEmpty.every((l) => l.startsWith(prefixFn))
        : false;

    let i = 0;
    const newBlock = lines
      .map((l) => {
        if (!l.trim()) return l;
        const prefix = typeof prefixFn === 'string' ? prefixFn : `${++i}. `;
        if (allHave) return l.slice(prefix.length);
        return prefix + l;
      })
      .join('\n');

    const nextVal = value.slice(0, lineStart) + newBlock + value.slice(lineEnd);
    onChange(nextVal);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(lineStart, lineStart + newBlock.length);
    });
  }

  async function uploadAndInsert(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImgError('Sirf image files upload kar sakte ho');
      return;
    }
    setUploading(true);
    setImgError('');
    try {
      const { url } = await uploadImage(file);
      const alt = file.name.replace(/\.[^.]+$/, '');
      insert(`\n![${alt}](${url})\n`);
    } catch (err) {
      setImgError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function insertTable() {
    const table = '\n| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Cell | Cell | Cell |\n| Cell | Cell | Cell |\n\n';
    insert(table);
  }

  function insertLink() {
    wrap('[', '](https://)', 'link text');
  }

  function insertCodeBlock() {
    const ta = taRef.current;
    const selected = ta ? value.slice(ta.selectionStart, ta.selectionEnd) : '';
    const body = selected || '// code here';
    insert(`\n\`\`\`sql\n${body}\n\`\`\`\n`);
  }

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="overflow-hidden rounded-lg border border-borderc bg-card focus-within:border-orange-500">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-borderc p-1.5">
        <TBtn title="Bold (**)" onClick={() => wrap('**', '**', 'bold text')}>
          <Icon d={ICONS.bold} />
        </TBtn>
        <TBtn title="Italic (*)" onClick={() => wrap('*', '*', 'italic text')}>
          <Icon d={ICONS.italic} />
        </TBtn>
        <TBtn title="Strikethrough (~~)" onClick={() => wrap('~~', '~~', 'struck')}>
          <Icon d={ICONS.strike} />
        </TBtn>

        <Divider />

        <TBtn title="Heading 1 (#)" onClick={() => prefixLines('# ')}>
          <span className="px-0.5 text-xs font-bold">H1</span>
        </TBtn>
        <TBtn title="Heading 2 (##)" onClick={() => prefixLines('## ')}>
          <span className="px-0.5 text-xs font-bold">H2</span>
        </TBtn>
        <TBtn title="Heading 3 (###)" onClick={() => prefixLines('### ')}>
          <span className="px-0.5 text-xs font-bold">H3</span>
        </TBtn>

        <Divider />

        <TBtn title="Quote (>)" onClick={() => prefixLines('> ')}>
          <Icon d={ICONS.quote} />
        </TBtn>
        <TBtn title="Bullet list (-)" onClick={() => prefixLines('- ')}>
          <Icon d={ICONS.bullet} />
        </TBtn>
        <TBtn title="Numbered list (1.)" onClick={() => prefixLines(true)}>
          <Icon d={ICONS.number} />
        </TBtn>

        <Divider />

        <TBtn title="Inline code (`)" onClick={() => wrap('`', '`', 'code')}>
          <Icon d={ICONS.code} />
        </TBtn>
        <TBtn title="Code block" onClick={insertCodeBlock}>
          <Icon d={ICONS.codeblock} />
        </TBtn>
        <TBtn title="Link" onClick={insertLink}>
          <Icon d={ICONS.link} />
        </TBtn>

        <Divider />

        <TBtn title="Image upload" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            <Icon d={ICONS.image} />
          )}
        </TBtn>
        <TBtn title="Table" onClick={insertTable}>
          <Icon d={ICONS.table} />
        </TBtn>
        <TBtn title="Divider (---)" onClick={() => insert('\n\n---\n\n')}>
          <Icon d={ICONS.hr} />
        </TBtn>

        <div className="ml-auto flex items-center gap-0.5 pr-0.5">
          {[['write', 'Write'], ['split', 'Split'], ['preview', 'Preview']].map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`hidden rounded-md px-2.5 py-1.5 text-xs font-medium sm:block ${
                mode === m
                  ? 'bg-orange-500 text-white'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              {label}
            </button>
          ))}
          {/* mobile toggle */}
          <button
            type="button"
            onClick={() => setMode(mode === 'write' ? 'preview' : 'write')}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:hidden"
          >
            {mode === 'write' ? 'Preview' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className={`grid ${mode === 'split' ? 'md:grid-cols-2 md:divide-x md:divide-borderc' : ''}`}>
        {(mode === 'write' || mode === 'split') && (
          <div className="relative">
            <textarea
              ref={taRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onPaste={(e) => {
                if (e.clipboardData.files.length) {
                  e.preventDefault();
                  uploadAndInsert(e.clipboardData.files[0]);
                }
              }}
              onDrop={(e) => {
                if (e.dataTransfer.files.length) {
                  e.preventDefault();
                  uploadAndInsert(e.dataTransfer.files[0]);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              rows={16}
              placeholder={'# Apna heading likho...\n\nParagraph yahan aayega. Image **paste** ya **drop** bhi kar sakte ho.'}
              className="w-full resize-y bg-transparent px-4 py-3 font-mono text-sm leading-relaxed outline-none placeholder:text-zinc-600"
            />
            <div className="flex items-center justify-between border-t border-borderc px-4 py-1.5 text-[11px] text-zinc-500">
              <span>{words} words &middot; {value.length} chars</span>
              <span className="hidden sm:inline">Markdown supported — images paste/drop karke upload hoti hain</span>
            </div>
          </div>
        )}

        {(mode === 'preview' || mode === 'split') && (
          <div
            className={`blog-content prose prose-invert max-h-[32rem] max-w-none overflow-y-auto p-4 ${
              mode === 'preview' ? 'min-h-[16rem]' : ''
            }`}
          >
            {value.trim() ? (
              <Markdown>{value}</Markdown>
            ) : (
              <p className="text-sm italic text-zinc-600">Preview yahan dikhega...</p>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => {
          uploadAndInsert(e.target.files[0]);
          e.target.value = '';
        }}
      />
      {imgError && (
        <p className="border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {imgError}
        </p>
      )}
    </div>
  );
}
