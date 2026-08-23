import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { resendOtp, verifyOtp } from '../api';
import { useAuth } from '../AuthContext';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginSession } = useAuth();
  const email = location.state?.email || '';
  const devOtp = location.state?.devOtp;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!email) navigate('/signup', { replace: true });
    else inputRef.current?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await verifyOtp({ email, otp });
      if (res.token && res.user) {
        loginSession(res.token, res.user);
        navigate('/', { state: { welcome: res.message } });
      } else {
        setInfo(res.message + ' — you can now log in');
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const res = await resendOtp(email);
      setInfo(res.message);
      if (res.devOtp) console.log('[DEV OTP]', res.devOtp);
      setCooldown(30);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-borderc bg-card px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40';
  const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400';

  return (
    <main className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="rounded-xl border border-borderc bg-card p-6 shadow-sm sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/10 text-2xl">
          ✉️
        </div>
        <h1 className="mt-4 text-center text-2xl font-extrabold">Verify Email</h1>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Enter the 6-digit OTP sent to <b>{email}</b>
        </p>

        {info && (
          <p className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
            {info}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className={labelClass}>OTP *</label>
            <input
              ref={inputRef}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              className={`${inputClass} text-center text-2xl font-bold tracking-[0.5em]`}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || otp.length !== 6}
            className="w-full rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white shadow-sm shadow-orange-500/30 transition-all hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50"
          >
            {submitting ? 'Verifying...' : 'Verify & Create Account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-600 dark:text-zinc-400">
          OTP nahi aaya?{' '}
          {cooldown > 0 ? (
            <span className="text-zinc-500">Retry in {cooldown}s...</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="font-semibold text-orange-500 hover:underline disabled:opacity-50 dark:text-orange-400"
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </p>

        <p className="mt-2 text-center text-xs text-zinc-500">
          Wrong email?{' '}
          <Link to="/signup" className="text-orange-500 hover:underline dark:text-orange-400">
            Sign up again
          </Link>
        </p>
      </div>
    </main>
  );
}
