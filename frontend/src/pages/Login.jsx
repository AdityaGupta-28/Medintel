import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Eye, EyeOff, Loader2, AlertCircle,
  CheckCircle, User, Mail, Lock, Stethoscope,
} from 'lucide-react';
import { authService } from '../services/api';

const DEMO_TOKEN = 'demo_token_medintel';

/* ─── Password Strength ──────────────────────────────────── */
const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8)          score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score; // 0‒4
};
const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['', 'bg-red-500', 'bg-amber-400', 'bg-blue-500', 'bg-emerald-500'];

const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const s = getStrength(password);
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= s ? STRENGTH_COLOR[s] : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${s <= 1 ? 'text-red-500' : s === 2 ? 'text-amber-500' : s === 3 ? 'text-blue-500' : 'text-emerald-600'}`}>
        {STRENGTH_LABEL[s]}
      </p>
    </div>
  );
};

/* ─── Input Field ────────────────────────────────────────── */
const Field = ({ icon: Icon, label, error, children }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
    <div className={`relative flex items-center rounded-xl border transition-all ${error ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100'}`}>
      <Icon size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
      {children}
    </div>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

/* ─── Banner ─────────────────────────────────────────────── */
const Banner = ({ type, msg }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
    className={`mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
      type === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
        : 'bg-red-50 border-red-200 text-red-700'
    }`}
  >
    {type === 'success' ? <CheckCircle size={16} className="flex-shrink-0" /> : <AlertCircle size={16} className="flex-shrink-0" />}
    {msg}
  </motion.div>
);

/* ══════════════════════════════════════════════════════════ */
const Login = () => {
  const navigate  = useNavigate();
  const [tab, setTab] = useState('login'); // 'login' | 'signup'

  /* ── Login state ── */
  const [loginEmail,    setLoginEmail]    = useState('doctor@medintel.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPwd,  setShowLoginPwd]  = useState(false);
  const [loginLoading,  setLoginLoading]  = useState(false);
  const [loginError,    setLoginError]    = useState('');
  const [loginSuccess,  setLoginSuccess]  = useState(false);

  /* ── Sign‑up state ── */
  const [signupName,     setSignupName]     = useState('');
  const [signupEmail,    setSignupEmail]    = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm,  setSignupConfirm]  = useState('');
  const [signupRole,     setSignupRole]     = useState('Doctor');
  const [showSignupPwd,  setShowSignupPwd]  = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [signupLoading,  setSignupLoading]  = useState(false);
  const [signupError,    setSignupError]    = useState('');
  const [signupSuccess,  setSignupSuccess]  = useState(false);

  /* ─────────────────────────── Login handler ─── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const { data } = await authService.login({ email: loginEmail, password: loginPassword });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, role: data.role }));
      setLoginSuccess(true);
      setTimeout(() => navigate('/dashboard'), 900);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setLoginError('Invalid email or password. Please try again.');
      } else {
        // Backend unreachable → demo mode
        localStorage.setItem('token', DEMO_TOKEN);
        localStorage.setItem('user', JSON.stringify({ name: 'Dr. Demo', email: loginEmail, role: 'Doctor' }));
        setLoginSuccess(true);
        setTimeout(() => navigate('/dashboard'), 900);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  /* ─────────────────────────── Sign‑up handler ─── */
  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');

    // Client‑side validation
    if (signupPassword !== signupConfirm) {
      setSignupError('Passwords do not match.');
      return;
    }
    if (getStrength(signupPassword) < 2) {
      setSignupError('Please choose a stronger password (min 8 chars, mix of letters & numbers).');
      return;
    }

    setSignupLoading(true);
    try {
      const { data } = await authService.register({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        role: signupRole,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, role: data.role }));
      setSignupSuccess(true);
      setTimeout(() => navigate('/dashboard'), 900);
    } catch (err) {
      const status  = err?.response?.status;
      const message = err?.response?.data?.message;
      if (status === 400 && message?.includes('already')) {
        setSignupError('An account with this email already exists. Try signing in instead.');
      } else if (status) {
        setSignupError(message || 'Registration failed. Please try again.');
      } else {
        // Backend unreachable → demo mode
        localStorage.setItem('token', DEMO_TOKEN);
        localStorage.setItem('user', JSON.stringify({ name: signupName, email: signupEmail, role: signupRole }));
        setSignupSuccess(true);
        setTimeout(() => navigate('/dashboard'), 900);
      }
    } finally {
      setSignupLoading(false);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    setLoginError(''); setLoginSuccess(false);
    setSignupError(''); setSignupSuccess(false);
  };

  /* ──────────────────────────────────────── Render ─── */
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-200">
            <Activity size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">MedIntel</h1>
          <p className="mt-1 text-slate-500 text-sm">AI-Powered Healthcare Platform</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-xl border border-slate-100 overflow-hidden">
          {/* Tab Bar */}
          <div className="flex border-b border-slate-100 bg-slate-50">
            {['login', 'signup'].map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`relative flex-1 py-4 text-sm font-semibold transition-colors ${
                  tab === t ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
                {tab === t && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Forms */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* ─── LOGIN FORM ─── */}
              {tab === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                >
                  <AnimatePresence>
                    {loginError   && <Banner type="error"   msg={loginError} />}
                    {loginSuccess && <Banner type="success" msg="Login successful! Redirecting…" />}
                  </AnimatePresence>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <Field icon={Mail} label="Email Address" error={null}>
                      <input
                        type="email" required
                        className="w-full rounded-xl bg-transparent pl-10 pr-4 py-3 text-sm outline-none"
                        placeholder="doctor@medintel.com"
                        value={loginEmail}
                        onChange={(e) => { setLoginEmail(e.target.value); setLoginError(''); }}
                      />
                    </Field>

                    <Field icon={Lock} label="Password" error={null}>
                      <input
                        type={showLoginPwd ? 'text' : 'password'} required
                        className="w-full rounded-xl bg-transparent pl-10 pr-11 py-3 text-sm outline-none"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => { setLoginPassword(e.target.value); setLoginError(''); }}
                      />
                      <button type="button" onClick={() => setShowLoginPwd(v => !v)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors">
                        {showLoginPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </Field>

                    <div className="text-right">
                      <button type="button" className="text-xs text-primary-600 hover:underline">
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit" disabled={loginLoading || loginSuccess}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 transition-colors disabled:opacity-60 mt-2"
                    >
                      {loginLoading
                        ? <><Loader2 size={18} className="animate-spin" /> Signing in…</>
                        : 'Sign In'}
                    </button>
                  </form>

                  <p className="mt-5 text-center text-sm text-slate-500">
                    Don't have an account?{' '}
                    <button onClick={() => switchTab('signup')} className="font-semibold text-primary-600 hover:underline">
                      Create one
                    </button>
                  </p>
                </motion.div>
              )}

              {/* ─── SIGN‑UP FORM ─── */}
              {tab === 'signup' && (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                >
                  <AnimatePresence>
                    {signupError   && <Banner type="error"   msg={signupError} />}
                    {signupSuccess && <Banner type="success" msg="Account created! Redirecting…" />}
                  </AnimatePresence>

                  <form onSubmit={handleSignup} className="space-y-4">
                    <Field icon={User} label="Full Name" error={null}>
                      <input
                        type="text" required
                        className="w-full rounded-xl bg-transparent pl-10 pr-4 py-3 text-sm outline-none"
                        placeholder="Dr. Jane Smith"
                        value={signupName}
                        onChange={(e) => { setSignupName(e.target.value); setSignupError(''); }}
                      />
                    </Field>

                    <Field icon={Mail} label="Email Address" error={null}>
                      <input
                        type="email" required
                        className="w-full rounded-xl bg-transparent pl-10 pr-4 py-3 text-sm outline-none"
                        placeholder="jane@hospital.com"
                        value={signupEmail}
                        onChange={(e) => { setSignupEmail(e.target.value); setSignupError(''); }}
                      />
                    </Field>

                    {/* Role selector */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
                      <div className="relative flex items-center rounded-xl border border-slate-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                        <Stethoscope size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                        <select
                          value={signupRole}
                          onChange={(e) => setSignupRole(e.target.value)}
                          className="w-full rounded-xl bg-transparent pl-10 pr-4 py-3 text-sm outline-none appearance-none cursor-pointer"
                        >
                          <option value="Doctor">Doctor</option>
                          <option value="Receptionist">Receptionist</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                    </div>

                    <Field icon={Lock} label="Password" error={null}>
                      <input
                        type={showSignupPwd ? 'text' : 'password'} required minLength={8}
                        className="w-full rounded-xl bg-transparent pl-10 pr-11 py-3 text-sm outline-none"
                        placeholder="Min. 8 characters"
                        value={signupPassword}
                        onChange={(e) => { setSignupPassword(e.target.value); setSignupError(''); }}
                      />
                      <button type="button" onClick={() => setShowSignupPwd(v => !v)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors">
                        {showSignupPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </Field>
                    <PasswordStrength password={signupPassword} />

                    <Field icon={Lock} label="Confirm Password" error={null}>
                      <input
                        type={showConfirmPwd ? 'text' : 'password'} required
                        className={`w-full rounded-xl bg-transparent pl-10 pr-11 py-3 text-sm outline-none ${
                          signupConfirm && signupConfirm !== signupPassword ? 'text-red-500' : ''
                        }`}
                        placeholder="Re-enter password"
                        value={signupConfirm}
                        onChange={(e) => { setSignupConfirm(e.target.value); setSignupError(''); }}
                      />
                      <button type="button" onClick={() => setShowConfirmPwd(v => !v)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors">
                        {showConfirmPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </Field>
                    {signupConfirm && signupConfirm !== signupPassword && (
                      <p className="text-xs text-red-500 -mt-2">Passwords do not match.</p>
                    )}

                    <button
                      type="submit" disabled={signupLoading || signupSuccess}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 transition-colors disabled:opacity-60 mt-2"
                    >
                      {signupLoading
                        ? <><Loader2 size={18} className="animate-spin" /> Creating account…</>
                        : 'Create Account'}
                    </button>
                  </form>

                  <p className="mt-5 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <button onClick={() => switchTab('login')} className="font-semibold text-primary-600 hover:underline">
                      Sign in
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Demo hint */}
        <div className="mt-5 rounded-xl bg-white/70 border border-slate-200 p-4 text-center text-xs text-slate-500 leading-relaxed backdrop-blur">
          <p className="font-semibold text-slate-600 mb-1">🔬 Demo Credentials</p>
          <p>Email: <span className="font-mono text-slate-700">doctor@medintel.com</span></p>
          <p>Password: <span className="font-mono text-slate-700">password123</span></p>
          <p className="mt-1.5 text-slate-400">Works in demo mode even without a running backend.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
