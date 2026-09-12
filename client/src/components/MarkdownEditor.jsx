import { useRef, useState } from 'react';
import { uploadImage } from '../api';
import Markdown from './Markdown';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Code,
  FileCode,
  Link,
  Image as ImageIcon,
  Table,
  Minus,
  Sparkles,
  Info,
  Lightbulb,
  AlertTriangle,
  Loader2,
  UploadCloud,
  Columns,
  Eye,
  PenLine,
} from 'lucide-react';

function TBtn({ title, onClick, children, disabled, active = false }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg p-2 text-xs font-medium transition-all ${
        active
          ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 disabled:opacity-40'
      }`}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="mx-1 h-5 w-px bg-borderc" />;

export default function MarkdownEditor({ value = '', onChange }) {
  const taRef = useRef(null);
  const fileRef = useRef(null);
  const [mode, setMode] = useState('split'); // 'write' | 'split' | 'preview'
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imgError, setImgError] = useState('');
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState({ url: '', alt: '' });

  // Insert text at cursor or around selection
  function insert(text, selStart = null, selEnd = null) {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const next = (value || '').slice(0, s) + text + (value || '').slice(e);
    onChange(next);
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
    const selected = (value || '').slice(s, e);

    if (
      selected !== '' &&
      (value || '').slice(Math.max(0, s - before.length), s) === before &&
      (value || '').slice(e, e + after.length) === after
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
    const lineStart = (value || '').lastIndexOf('\n', s - 1) + 1;
    let lineEnd = (value || '').indexOf('\n', e);
    if (lineEnd === -1) lineEnd = (value || '').length;

    const lines = (value || '').slice(lineStart, lineEnd).split('\n');
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

    const nextVal = (value || '').slice(0, lineStart) + newBlock + (value || '').slice(lineEnd);
    onChange(nextVal);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(lineStart, lineStart + newBlock.length);
    });
  }

  // Handle image upload from file or paste
  async function handleImageUpload(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImgError('Please select a valid image file (PNG, JPG, WEBP, SVG)');
      return;
    }
    setUploading(true);
    setUploadProgress(10);
    setImgError('');

    try {
      const res = await uploadImage(file, (p) => setUploadProgress(p));
      const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      // Insert beautiful markdown figure right at cursor position
      insert(`\n\n![${alt}](${res.url})\n\n`);
    } catch (err) {
      setImgError(err.message || 'Image upload failed. Try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  function handleUrlImageInsert(e) {
    e.preventDefault();
    if (!urlInput.url) return;
    const alt = urlInput.alt || 'Illustration';
    insert(`\n\n![${alt}](${urlInput.url.trim()})\n\n`);
    setUrlInput({ url: '', alt: '' });
    setShowUrlModal(false);
  }

  function insertAlert(type) {
    const alerts = {
      note: '\n> [!NOTE]\n> Here is an important note or context for readers.\n\n',
      tip: '\n> [!TIP]\n> Pro-tip: Here is a best practice or shortcut.\n\n',
      warning: '\n> [!WARNING]\n> Caution: Keep this in mind before proceeding.\n\n',
    };
    insert(alerts[type] || alerts.note);
  }

  function insertTemplate() {
    const template = `## Introduction

Write a brief overview of what this tutorial or article covers.

> [!TIP]
> This guide assumes you have basic familiarity with the topic.

## Prerequisites

- Required tool or package 1
- Required tool or package 2

## Step 1: Getting Started

Explain the first concept in detail. Below is a practical code example:

\`\`\`javascript
// Example code snippet
function initialize() {
  console.log("Setup complete!");
}
\`\`\`

## Architecture & Visual Overview

You can add an image right here in the middle of the article to explain the flow.

| Feature | Description | Status |
| :--- | :--- | :--- |
| Core API | Fast & modern | Supported |
| PDF Storage | Up to 50MB via GridFS | Supported |

## Conclusion

Summarize the key takeaways and provide next steps for the reader.
`;
    if (!value || window.confirm('Replace current content with tutorial template?')) {
      onChange(template);
    }
  }

  const words = (value || '').trim() ? (value || '').trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="overflow-hidden rounded-2xl border border-borderc bg-card shadow-sm focus-within:border-orange-500/60 transition-colors">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 border-b border-borderc bg-zinc-50/50 dark:bg-zinc-900/40 p-2 backdrop-blur">
        <div className="flex flex-wrap items-center gap-0.5">
          <TBtn title="Bold (**text**)" onClick={() => wrap('**', '**', 'bold text')}>
            <Bold className="h-4 w-4" />
          </TBtn>
          <TBtn title="Italic (*text*)" onClick={() => wrap('*', '*', 'italic text')}>
            <Italic className="h-4 w-4" />
          </TBtn>
          <TBtn title="Strikethrough (~~text~~)" onClick={() => wrap('~~', '~~', 'struck text')}>
            <Strikethrough className="h-4 w-4" />
          </TBtn>

          <Divider />

          <TBtn title="Heading 1 (#)" onClick={() => prefixLines('# ')}>
            <Heading1 className="h-4 w-4" />
          </TBtn>
          <TBtn title="Heading 2 (##)" onClick={() => prefixLines('## ')}>
            <Heading2 className="h-4 w-4" />
          </TBtn>
          <TBtn title="Heading 3 (###)" onClick={() => prefixLines('### ')}>
            <Heading3 className="h-4 w-4" />
          </TBtn>

          <Divider />

          <TBtn title="Quote (>)" onClick={() => prefixLines('> ')}>
            <Quote className="h-4 w-4" />
          </TBtn>
          <TBtn title="Bullet list (-)" onClick={() => prefixLines('- ')}>
            <List className="h-4 w-4" />
          </TBtn>
          <TBtn title="Numbered list (1.)" onClick={() => prefixLines(true)}>
            <ListOrdered className="h-4 w-4" />
          </TBtn>

          <Divider />

          <TBtn title="Inline code (`)" onClick={() => wrap('`', '`', 'code')}>
            <Code className="h-4 w-4" />
          </TBtn>
          <TBtn
            title="Code block"
            onClick={() => insert('\n```javascript\n// write your code here\n```\n')}
          >
            <FileCode className="h-4 w-4" />
          </TBtn>
          <TBtn title="Link" onClick={() => wrap('[', '](https://)', 'link title')}>
            <Link className="h-4 w-4" />
          </TBtn>

          <Divider />

          {/* MID-CONTENT IMAGE INSERTION BUTTONS */}
          <TBtn
            title="Upload image from computer (Cloudinary)"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
            ) : (
              <span className="flex items-center gap-1 font-semibold text-orange-600 dark:text-orange-400">
                <UploadCloud className="h-4 w-4" />
                <span className="hidden lg:inline text-[11px]">Upload Image</span>
              </span>
            )}
          </TBtn>

          <TBtn title="Insert Image via URL" onClick={() => setShowUrlModal(true)}>
            <ImageIcon className="h-4 w-4" />
          </TBtn>

          <TBtn
            title="Insert Table"
            onClick={() =>
              insert('\n| Column 1 | Column 2 | Column 3 |\n| :--- | :--- | :--- |\n| Data 1 | Data 2 | Data 3 |\n\n')
            }
          >
            <Table className="h-4 w-4" />
          </TBtn>

          <TBtn title="Horizontal Divider" onClick={() => insert('\n\n---\n\n')}>
            <Minus className="h-4 w-4" />
          </TBtn>

          <Divider />

          {/* Callout alerts */}
          <TBtn title="Insert Note Alert" onClick={() => insertAlert('note')}>
            <Info className="h-4 w-4 text-blue-500" />
          </TBtn>
          <TBtn title="Insert Tip Alert" onClick={() => insertAlert('tip')}>
            <Lightbulb className="h-4 w-4 text-emerald-500" />
          </TBtn>
          <TBtn title="Insert Warning Alert" onClick={() => insertAlert('warning')}>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </TBtn>

          <TBtn title="Insert Starter Template" onClick={insertTemplate}>
            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden xl:inline text-[11px]">Template</span>
            </span>
          </TBtn>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 rounded-lg border border-borderc bg-card p-1">
          <button
            type="button"
            onClick={() => setMode('write')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === 'write' ? 'bg-orange-500 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <PenLine className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Write</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('split')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === 'split' ? 'bg-orange-500 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Columns className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Split</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === 'preview' ? 'bg-orange-500 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>
      </div>

      {/* Uploading progress notification */}
      {uploading && (
        <div className="flex items-center gap-3 border-b border-orange-500/20 bg-orange-500/10 px-4 py-2 text-xs font-medium text-orange-600 dark:text-orange-400">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          <span>Uploading image to Cloudinary... {uploadProgress > 0 ? `${uploadProgress}%` : ''}</span>
        </div>
      )}

      {/* Image Error Alert */}
      {imgError && (
        <div className="flex items-center justify-between border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          <span>{imgError}</span>
          <button onClick={() => setImgError('')} className="font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Modal for Inserting Image URL */}
      {showUrlModal && (
        <div className="border-b border-borderc bg-zinc-50 dark:bg-zinc-900 p-4 transition-all">
          <form onSubmit={handleUrlImageInsert} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Image URL (e.g. https://images.unsplash.com/...)
              </label>
              <input
                type="url"
                required
                value={urlInput.url}
                onChange={(e) => setUrlInput((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://..."
                className="w-full rounded-lg border border-borderc bg-card px-3 py-1.5 text-xs outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Caption / Description (Alt text)
              </label>
              <input
                type="text"
                value={urlInput.alt}
                onChange={(e) => setUrlInput((prev) => ({ ...prev, alt: e.target.value }))}
                placeholder="Database schema diagram"
                className="w-full rounded-lg border border-borderc bg-card px-3 py-1.5 text-xs outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition-colors"
              >
                Insert
              </button>
              <button
                type="button"
                onClick={() => setShowUrlModal(false)}
                className="rounded-lg border border-borderc px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Editor & Preview Workspace */}
      <div className={`grid ${mode === 'split' ? 'md:grid-cols-2 md:divide-x md:divide-borderc' : ''}`}>
        {(mode === 'write' || mode === 'split') && (
          <div className="relative">
            <textarea
              ref={taRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onPaste={(e) => {
                if (e.clipboardData?.files?.length) {
                  const file = e.clipboardData.files[0];
                  if (file.type.startsWith('image/')) {
                    e.preventDefault();
                    handleImageUpload(file);
                  }
                }
              }}
              onDrop={(e) => {
                if (e.dataTransfer?.files?.length) {
                  const file = e.dataTransfer.files[0];
                  if (file.type.startsWith('image/')) {
                    e.preventDefault();
                    handleImageUpload(file);
                  }
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              rows={18}
              placeholder={`# Your Title...\n\nWrite your blog here. You can paste screenshots or drop images anywhere in the middle of your article to illustrate concepts!\n\n![Example Diagram](https://...)`}
              className="w-full resize-y bg-transparent px-5 py-4 font-mono text-sm leading-relaxed outline-none placeholder:text-zinc-500"
            />
          </div>
        )}

        {(mode === 'preview' || mode === 'split') && (
          <div
            className={`blog-content max-h-[36rem] overflow-y-auto p-6 ${
              mode === 'preview' ? 'min-h-[22rem]' : ''
            }`}
          >
            {value.trim() ? (
              <Markdown>{value}</Markdown>
            ) : (
              <div className="flex h-full items-center justify-center p-12 text-center text-zinc-400">
                <p className="text-sm italic">Live preview will render here as you type or insert images...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleImageUpload(e.target.files[0]);
            e.target.value = '';
          }
        }}
      />

      {/* Editor Footer Status Bar */}
      <div className="flex flex-wrap items-center justify-between border-t border-borderc bg-zinc-50/50 dark:bg-zinc-900/30 px-4 py-2 text-xs text-zinc-500">
        <div className="flex items-center gap-4">
          <span>
            <strong className="text-zinc-700 dark:text-zinc-300">{words}</strong> words
          </span>
          <span>
            <strong className="text-zinc-700 dark:text-zinc-300">{(value || '').length}</strong> characters
          </span>
          <span>
            Est. read: <strong className="text-zinc-700 dark:text-zinc-300">{readTime} min</strong>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-400">
          <span>Tip: Paste screenshot (Ctrl+V) directly to upload image mid-article</span>
        </div>
      </div>
    </div>
  );
}
