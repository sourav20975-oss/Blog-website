import { useEffect, useState } from 'react';
import { getCaptcha } from '../api';

// Captcha image + input. Parent owns captchaId/captchaText state:
//  - onLoaded(captchaId)   -> jab naya captcha server se aata hai
//  - refreshKey badlo      -> naya captcha load hoga (galat answer ke baad)
export default function Captcha({ value, onChange, onError, onLoaded, refreshKey, onRefresh }) {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    let alive = true;
    getCaptcha()
      .then((res) => {
        if (!alive) return;
        setSvg(res.svg);
        if (onLoaded) onLoaded(res.captchaId);
      })
      .catch((e) => {
        if (onError && alive) onError(e.message);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Security Check *
      </label>
      <div className="flex items-center gap-2">
        <div
          className="overflow-hidden rounded-lg border border-borderc bg-zinc-100 dark:bg-zinc-800 [&>svg]:h-14 [&>svg]:w-auto"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <button
          type="button"
          onClick={onRefresh}
          title="Get a new captcha"
          className="rounded-lg border border-borderc bg-card px-3 py-3 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
        >
          ↻
        </button>
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type the characters above"
        required
        autoComplete="off"
        className={`${inputBase} mt-2`}
      />
    </div>
  );
}

const inputBase =
  'w-full rounded-lg border border-borderc bg-card px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40';
