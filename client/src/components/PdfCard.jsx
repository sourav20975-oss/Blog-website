import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Edit, Trash2, Bookmark } from 'lucide-react';
import { getPdfDownloadUrl } from '../api';
import { isPdfSaved, toggleSavePdf } from '../utils/bookmarks';

export function formatBytes(bytes, decimals = 1) {
  if (!bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function PdfCard({ pdf, onRead, onEdit, onDelete, isAdmin }) {
  const downloadUrl = getPdfDownloadUrl(pdf._id);
  const [saved, setSaved] = useState(() => isPdfSaved(pdf._id));

  useEffect(() => {
    const check = () => setSaved(isPdfSaved(pdf._id));
    window.addEventListener('bv:bookmarks-changed', check);
    return () => window.removeEventListener('bv:bookmarks-changed', check);
  }, [pdf._id]);

  const handleToggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleSavePdf(pdf);
    setSaved(nowSaved);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-borderc bg-card transition-all duration-200 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-sm">
      {/* Cover / Thumbnail */}
      <div
        className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 cursor-pointer border-b border-borderc"
        onClick={() => onRead(pdf)}
      >
        {pdf.coverImage ? (
          <img
            src={pdf.coverImage}
            alt={pdf.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 p-6 text-zinc-400">
            <FileText className="h-8 w-8 stroke-[1.5]" />
            <span className="text-[11px] font-medium tracking-wide uppercase">
              Handbook
            </span>
          </div>
        )}

        {/* Category Pill */}
        <span className="absolute left-2.5 top-2.5 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
          {pdf.category || 'General'}
        </span>

        {/* File Size */}
        <span className="absolute right-2.5 top-2.5 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-mono text-zinc-200 backdrop-blur">
          {formatBytes(pdf.fileSize)}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-4">
        <h3
          onClick={() => onRead(pdf)}
          className="cursor-pointer text-sm font-bold text-zinc-900 line-clamp-2 dark:text-zinc-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        >
          {pdf.title}
        </h3>

        {pdf.description && (
          <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
            {pdf.description}
          </p>
        )}

        {/* Author & Stats footer */}
        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between border-t border-borderc pt-2.5 text-[11px] text-zinc-400">
            <span>By {pdf.author || 'Sourav Kumar'}</span>
            <div className="flex items-center gap-2 text-zinc-400">
              <span>{pdf.views || 0} views</span>
              <span>&middot;</span>
              <span>{pdf.downloads || 0} downloads</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onRead(pdf)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-borderc bg-card py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Read Online</span>
            </button>
            <button
              type="button"
              onClick={handleToggleSave}
              className={`p-1.5 rounded-lg border border-borderc transition ${
                saved
                  ? 'bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400'
                  : 'bg-card text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
              title={saved ? 'Remove from saved' : 'Bookmark handbook'}
            >
              <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-current' : ''}`} />
            </button>
            <a
              href={downloadUrl}
              download={pdf.filename || 'handbook.pdf'}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </a>

            {isAdmin && (
              <div className="flex items-center gap-1">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(pdf)}
                    className="p-1.5 rounded-md border border-borderc text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(pdf)}
                    className="p-1.5 rounded-md border border-borderc text-zinc-500 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
