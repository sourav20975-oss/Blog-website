import { useEffect, useState } from 'react';
import { X, Download, ExternalLink, FileText, Loader2 } from 'lucide-react';
import { getPdfViewUrl, getPdfDownloadUrl } from '../api';
import { formatBytes } from './PdfCard';

export default function PdfViewerModal({ pdf, onClose }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!pdf) return null;

  const viewUrl = getPdfViewUrl(pdf._id);
  const downloadUrl = getPdfDownloadUrl(pdf._id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-6 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="rounded-lg bg-orange-500/10 p-2 text-orange-500">
              <FileText className="h-5 w-5" />
            </div>
            <div className="truncate">
              <h2 className="truncate text-sm font-bold text-white sm:text-base">
                {pdf.title}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span>{formatBytes(pdf.fileSize)}</span>
                <span>&middot;</span>
                <span>By {pdf.author || 'Sourav Kumar'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={downloadUrl}
              download={pdf.filename || 'document.pdf'}
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-orange-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-orange-600"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </a>

            <a
              href={`/handbook/${pdf._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-zinc-700 bg-zinc-800 p-2 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              title="Open fullscreen reader"
            >
              <ExternalLink className="h-4 w-4" />
            </a>

            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-700 bg-zinc-800 p-2 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              title="Close modal (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Content - Stream Viewer */}
        <div className="relative flex-1 bg-zinc-950 flex flex-col">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950 text-zinc-400 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-xs">Streaming handbook pages from MongoDB GridFS...</p>
            </div>
          )}

          <object
            data={`${viewUrl}#toolbar=1&navpanes=0`}
            type="application/pdf"
            className="h-full w-full border-none"
            onLoad={() => setLoading(false)}
          >
            <iframe
              src={`${viewUrl}#toolbar=1&navpanes=0`}
              title={pdf.title}
              className="h-full w-full border-none"
              onLoad={() => setLoading(false)}
            />
          </object>

          {/* Browser shields / blocker banner */}
          <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-900/90 px-4 py-2 text-xs text-zinc-400">
            <span>Notice browser blocking the preview?</span>
            <div className="flex items-center gap-3">
              <a
                href={`/handbook/${pdf._id}`}
                className="font-medium text-orange-400 hover:underline"
              >
                Open Fullscreen Reader &rarr;
              </a>
              <a
                href={downloadUrl}
                download={pdf.filename || 'handbook.pdf'}
                className="hover:text-zinc-200"
              >
                Download PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
