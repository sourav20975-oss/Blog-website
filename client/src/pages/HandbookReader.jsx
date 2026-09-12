import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchPdf, getPdfViewUrl, getPdfDownloadUrl } from '../api';
import { formatBytes } from '../components/PdfCard';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  AlertCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';

export default function HandbookReader() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streamLoading, setStreamLoading] = useState(true);
  const [error, setError] = useState('');
  const [useGoogleViewer, setUseGoogleViewer] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchPdf(id)
      .then((data) => {
        setPdf(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load handbook details');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-sm text-zinc-500">Loading handbook metadata...</p>
      </div>
    );
  }

  if (error || !pdf) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
        <h2 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Handbook Not Found
        </h2>
        <p className="mt-2 text-sm text-zinc-500">{error || 'This handbook does not exist.'}</p>
        <Link
          to="/pdfs"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Handbooks</span>
        </Link>
      </div>
    );
  }

  const rawViewUrl = getPdfViewUrl(pdf._id);
  const downloadUrl = getPdfDownloadUrl(pdf._id);
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(rawViewUrl)}&embedded=true`;
  const currentViewerUrl = useGoogleViewer ? googleViewerUrl : `${rawViewUrl}#toolbar=1&navpanes=0`;

  return (
    <div className="flex h-[calc(100vh-65px)] flex-col bg-zinc-950 text-white">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-white sm:text-base">
              {pdf.title}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <span className="rounded bg-orange-500/10 px-1.5 py-0.2 font-semibold text-orange-400">
                {pdf.category || 'Reference'}
              </span>
              <span>&middot;</span>
              <span>{formatBytes(pdf.fileSize)}</span>
              <span>&middot;</span>
              <span className="hidden sm:inline">By {pdf.author || 'Sourav Kumar'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Toggle fallback viewer if browser shields block direct PDF */}
          <button
            onClick={() => {
              setStreamLoading(true);
              setUseGoogleViewer(!useGoogleViewer);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
            title="Switch PDF rendering mode if page doesn't load"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="hidden md:inline">
              {useGoogleViewer ? 'Native Mode' : 'Alternative Viewer'}
            </span>
          </button>

          <a
            href={downloadUrl}
            download={pdf.filename || 'handbook.pdf'}
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-600 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </a>

          <a
            href={rawViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
            title="Open raw PDF file in new browser tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Open Raw</span>
          </a>
        </div>
      </div>

      {/* Embedded PDF Canvas */}
      <div className="relative flex-1 w-full overflow-hidden bg-zinc-950">
        {streamLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-zinc-950/95 text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-xs">Streaming handbook pages...</p>
          </div>
        )}

        <object
          data={currentViewerUrl}
          type="application/pdf"
          className="h-full w-full border-none"
          onLoad={() => setStreamLoading(false)}
        >
          <iframe
            src={currentViewerUrl}
            title={pdf.title}
            className="h-full w-full border-none"
            onLoad={() => setStreamLoading(false)}
          />
        </object>
      </div>
    </div>
  );
}
