import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api';
import Captcha from '../components/Captcha';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [captchaId, setCaptchaId] = useState(null);
  const [captchaText, setCaptchaText] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => {
    setError('');
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const refreshCaptcha = () => {
    setCaptchaId(null);
    setCaptchaText('');
    setRefreshKey((k) => k + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Password and Confirm Password do not match');
      return;
    }
    if (!captchaId) {
      setError('Captcha is loading — please wait a second');
      return;
    }
    setSubmitting(true);
    try {
      const res = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        captchaId,
        captchaText,
      });
      navigate('/verify-otp', {
        state: { email: res.email || form.email, devOtp: res.devOtp },
      });
    } catch (err) {
      if (err.message.toLowerCase().includes('captcha')) refreshCaptcha();
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-borderc bg-card px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40';
  const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400';

  return (
    <main className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="rounded-xl border border-borderc bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-2xl font-extrabold">
          Create <span className="text-orange-500 dark:text-orange-400">Account</span>
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          We'll email you an OTP — verify it to complete your signup
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input
              value={form.name}
              onChange={set('name')}
              placeholder="Sourav Kumar"
              required
              minLength={2}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="At least 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Confirm Password *</label>
            <input
              type="password"
              value={form.confirm}
              onChange={set('confirm')}
              placeholder="Repeat the same password"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>

          <Captcha
            value={captchaText}
            onChange={(v) => setCaptchaText(v)}
            onError={setError}
            onLoaded={setCaptchaId}
            refreshKey={refreshKey}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white shadow-sm shadow-orange-500/30 transition-all hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50"
          >
            {submitting ? 'Sending OTP...' : 'Sign Up — Send OTP'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-orange-500 hover:underline dark:text-orange-400">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
