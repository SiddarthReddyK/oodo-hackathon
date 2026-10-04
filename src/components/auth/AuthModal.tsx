import React, { useState } from 'react';
import {
  PackageCheck,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Boxes,
  ArrowRightLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/inventory';

export const AuthModal: React.FC = () => {
  const { login, signup, requestPasswordResetOtp, verifyOtpAndResetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_request' | 'forgot_verify'>('login');

  const [loginId, setLoginId] = useState('dexter.morgan');
  const [email, setEmail] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('inventory_manager');
  const [password, setPassword] = useState('Stocksense2026!');
  const [reenterPassword, setReenterPassword] = useState('Stocksense2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP flow
  const [otpCode, setOtpCode] = useState('');
  const [sentOtpHint, setSentOtpHint] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const emailToUse = loginId.trim();
    const success = await login(emailToUse, password);
    if (!success) {
      setError('Account not found with this login. Please sign up to choose your role, or click a demo account below.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginId.trim()) {
      setError('Login ID / Full Name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    const success = await signup(loginId, email, signupRole, 'wh-northdock');
    if (!success) {
      setError('Failed to create account.');
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const emailToUse = loginId.includes('@') ? loginId : `${loginId}@stocksense.io`;
    const res = await requestPasswordResetOtp(emailToUse);
    if (res.success) {
      setSentOtpHint(res.simulatedOtp);
      setSuccessMsg(`A 6-digit OTP code was generated. (Demo Code: ${res.simulatedOtp})`);
      setMode('forgot_verify');
    }
  };

  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const emailToUse = loginId.includes('@') ? loginId : `${loginId}@stocksense.io`;
    const success = await verifyOtpAndResetPassword(emailToUse, otpCode, newPassword);
    if (success) {
      setSuccessMsg('Password reset successful! Logging you in...');
    } else {
      setError('Invalid code.');
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col lg:flex-row bg-[#f4f1ea] font-sans">
      {/* Left Forest Green Brand Column */}
      <div className="lg:w-[42%] bg-[#1e3a34] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between shrink-0">
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-sans">
            StockSense
          </span>
        </div>

        {/* Hero Card & Headline */}
        <div className="my-12 max-w-lg">
          {/* Warehouse Preview Card */}
          <div className="bg-[#24453e] border border-white/10 rounded-2xl p-4 shadow-xl mb-10">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-3 px-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-[#1e3a34] text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a34]"></span>
                Inbound ready
              </span>
              <span className="font-mono text-[11px] text-slate-300">WH-ND-01</span>
            </div>
            <div className="rounded-xl overflow-hidden aspect-[16/9] relative bg-slate-900">
              <img
                src="/src/assets/images/stocksense_warehouse_hero_1790401040429.jpg"
                alt="Warehouse operations aisle"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Every movement, accounted for.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-md">
            Coordinate receipts, deliveries, and stock across your warehouse from one dependable source of truth.
          </p>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-400">
          © 2026 StockSense Operations
        </div>
      </div>

      {/* Right Canvas with White Clean Card */}
      <div className="flex-1 flex flex-col justify-between items-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-[480px] my-auto">
          {/* Card Frame */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-stone-200/80">
            {mode === 'login' && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1c2a27] tracking-tight mb-1.5">
                  Welcome back
                </h2>
                <p className="text-xs text-stone-500 mb-6">
                  Sign in to continue to your warehouse workspace.
                </p>

                {error && (
                  <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Login ID */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1c2a27] mb-1.5">
                      Login ID or Email
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        placeholder="dexter.morgan or your@email.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-[#1c2a27] placeholder:text-stone-400 focus:outline-none focus:border-[#1e3a34] focus:ring-1 focus:ring-[#1e3a34]"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1c2a27] mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-[#1c2a27] placeholder:text-stone-400 focus:outline-none focus:border-[#1e3a34] focus:ring-1 focus:ring-[#1e3a34]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-stone-400 hover:text-stone-600 absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-[#1e3a34] accent-[#1e3a34] cursor-pointer"
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setMode('forgot_request')}
                      className="text-[#1e3a34] font-medium hover:underline text-xs"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Sign In CTA */}
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-[#1e3a34] hover:bg-[#162c27] text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm cursor-pointer mt-2"
                  >
                    Sign in
                  </button>

                  {/* Quick One-Click Demo Logins */}
                  <div className="pt-3 border-t border-stone-100">
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2 text-center">
                      Quick Demo Accounts
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginId('dexter.morgan@stocksense.io');
                          setPassword('Stocksense2026!');
                          login('dexter.morgan@stocksense.io', 'Stocksense2026!');
                        }}
                        className="p-2 rounded-xl border border-stone-200 hover:border-[#1e3a34] bg-stone-50/80 text-left transition-all cursor-pointer"
                      >
                        <div className="font-bold text-[11px] text-stone-900 flex items-center justify-between">
                          <span>Dexter Morgan</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-semibold">
                            Demo
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5">Manager · Switcher</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLoginId('jamie.wu@stocksense.io');
                          setPassword('Stocksense2026!');
                          login('jamie.wu@stocksense.io', 'Stocksense2026!');
                        }}
                        className="p-2 rounded-xl border border-stone-200 hover:border-[#b45309] bg-stone-50/80 text-left transition-all cursor-pointer"
                      >
                        <div className="font-bold text-[11px] text-stone-900 flex items-center justify-between">
                          <span>Jamie Wu</span>
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-semibold">
                            Fixed
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5">Staff · Floor Ops</div>
                      </button>
                    </div>
                  </div>

                  <div className="text-center text-xs text-stone-500 pt-2">
                    New to StockSense?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-[#1e3a34] font-semibold hover:underline"
                    >
                      Sign up with your role
                    </button>
                  </div>
                </form>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1c2a27] tracking-tight mb-1.5">
                  Create your account
                </h2>
                <p className="text-xs text-stone-500 mb-5">
                  Your operational role will be directly determined by this registration.
                </p>

                {error && (
                  <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#1c2a27] mb-1">
                      Full Name / Login ID *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        placeholder="e.g. Jordan Hayes"
                        className="w-full pl-10 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-xs text-[#1c2a27]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1c2a27] mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jordan@northdock.co"
                        className="w-full pl-10 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-xs text-[#1c2a27]"
                        required
                      />
                    </div>
                  </div>

                  {/* Explicit Role Selection at Signup */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1c2a27] mb-1.5">
                      Assign Operational Role *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSignupRole('inventory_manager')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          signupRole === 'inventory_manager'
                            ? 'bg-[#f6faf8] border-[#1e3a34] ring-1 ring-[#1e3a34] shadow-xs'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900">
                          <Boxes className="w-3.5 h-3.5 text-[#1e3a34]" />
                          <span>Inventory Manager</span>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-1 leading-snug">
                          Inbound receipts, outbound customer orders & reorders
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSignupRole('warehouse_staff')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          signupRole === 'warehouse_staff'
                            ? 'bg-[#fffcf7] border-[#b45309] ring-1 ring-[#b45309] shadow-xs'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900">
                          <ArrowRightLeft className="w-3.5 h-3.5 text-[#b45309]" />
                          <span>Warehouse Staff</span>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-1 leading-snug">
                          Transfers, picking, shelving & physical cycle counts
                        </p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1c2a27] mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 bg-white border border-stone-300 rounded-xl text-xs text-[#1c2a27]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-stone-400 hover:text-stone-600 absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1c2a27] mb-1">
                      Re-enter password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={reenterPassword}
                        onChange={(e) => setReenterPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 bg-white border border-stone-300 rounded-xl text-xs text-[#1c2a27]"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Role will be permanently assigned upon registration</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-[#1e3a34] hover:bg-[#162c27] text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm cursor-pointer mt-2"
                  >
                    Create account & Sign in
                  </button>

                  <div className="text-center text-xs text-stone-500 pt-2">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-[#1e3a34] font-semibold hover:underline"
                    >
                      Sign in
                    </button>
                  </div>
                </form>
              </div>
            )}

            {mode === 'forgot_request' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[#1c2a27] tracking-tight">
                  Reset Password (OTP)
                </h2>
                <p className="text-xs text-stone-500">
                  Enter your login username or email to receive a verification code.
                </p>

                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1c2a27] mb-1.5">
                      Login ID or Email
                    </label>
                    <input
                      type="text"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-[#1c2a27]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-[#1e3a34] hover:bg-[#162c27] text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
                  >
                    Send One-Time Password (OTP)
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-stone-500 hover:text-stone-800 text-xs"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              </div>
            )}

            {mode === 'forgot_verify' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[#1c2a27] tracking-tight">
                  Enter OTP Code
                </h2>
                <p className="text-xs text-stone-500">
                  {successMsg || 'Enter the 6-digit code sent to your email.'}
                </p>

                <form onSubmit={handleVerifyOtpAndReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1c2a27] mb-1.5">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder={sentOtpHint || '123456'}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-mono text-center tracking-widest text-[#1c2a27]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1c2a27] mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-[#1c2a27]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-[#1e3a34] hover:bg-[#162c27] text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
                  >
                    Confirm & Reset Password
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
