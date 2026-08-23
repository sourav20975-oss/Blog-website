import { useCallback, useEffect, useRef, useState } from 'react';
import { getCaptcha } from '../api';

// Parent ko captchaId dena zaroori hai (form submit ke time bhejna hota hai).
// Callbacks ref me rakhe hain taaki parent ke re-renders se captcha reload na ho.
export default function Captcha({ value, onChange, onError, onLoaded, refreshKey }) {
  const [captcha, setCaptcha] = useState(null);
  const [loading, setLoading] = useState(true);
  const onErrorRef = useRef(onError);
  const onLoadedRef = useRef(onLoaded);
  onErrorRef.current = onError;
  onLoadedRef.current = onLoaded;

  const load = useCallback(() => {
    setLoading(true);
    getCaptcha()
      .then((c) => {
        setCaptcha(c);
        onLoadedRef.current?.(c.id);
      })
      .catch((e) => onErrorRef.current?.(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load, refreshKey]);

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Captcha *
      </label>
      <div className="flex items-stretch gap-2">
        <div className="flex h-[50px] w-[160px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-borderc bg-white dark:bg-zinc-200">
          {loading ? (
            <span className="animate-pulse text-xs text-zinc-500">Loading...</span>
          ) : captcha ? (
            <div className="[&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: captcha.svg }} />
          ) : (
            <button type="button" onClick={load} className="text-xs text-orange-500">
              Reload captcha
            </button>
          )}
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Upar ka code likho"
          autoComplete="off"
          required
          className="min-w-0 flex-1 rounded-lg border border-borderc bg-card px-3 py-2 text-sm outline-none transition-colors placeholder:text-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40"
        />
        <button
          type="button"
          onClick={load}
          title="Naya captcha"
          aria-label="Refresh captcha"
          className="shrink-0 rounded-lg border border-borderc px-3 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-orange-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-orange-400"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0113.17-3M20 15a8 8 0 01-13.17 3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
