import React, { useState } from 'react';
import { Mail, Lock, Phone, User, KeyRound, Cpu } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function LoginPage({ onNavigate, onLoginSuccess, onOtpRequest, addToast }) {
  const [activeTab, setActiveTab] = useState('login'); // login, signup, phone_otp
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Call our FastAPI backend /auth endpoint
    const endpoint = activeTab === 'login' ? 'login' : 'signup';
    const payload = activeTab === 'login'
      ? { email, password }
      : { email, password, phone, displayName };

    try {
      const response = await fetch(`/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = 'Authentication failed';
        if (data.detail) {
          errorMsg = Array.isArray(data.detail) ? data.detail[0].msg : data.detail;
        }
        throw new Error(errorMsg);
      }

      onLoginSuccess(data);
    } catch (err) {
      addToast('error', 'Authentication Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneOtpRequest = async (e) => {
    e.preventDefault();
    if (!phone) {
      addToast('warning', 'Phone Required', 'Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/otp/send?phone=${encodeURIComponent(phone)}`, {
        method: 'POST'
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || 'OTP dispatch failed');

      addToast('success', 'OTP Dispatched', `A 6-digit verification code was simulated: ${data.simulated_otp}`);
      onOtpRequest(phone);
    } catch (err) {
      addToast('error', 'OTP Request Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-10 px-4 relative">
      <div className="w-full max-w-md relative">
        {/* Glow halo background */}
        <div className="absolute -inset-1 bg-gradient-to-r from-neon-indigo via-neon-cyan to-neon-fuchsia rounded-2xl blur opacity-25" />

        <GlassCard className="relative p-6 border-white/10 shadow-2xl">
          {/* Header logo */}
          <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <div className="p-3 bg-neon-indigo/10 rounded-2xl border border-neon-indigo/30">
              <Cpu className="w-8 h-8 text-neon-cyan animate-pulse" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Access Platform Portal</h2>
            <p className="text-xs text-slate-400">Establish a secure node sync tunnel</p>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-white/5 mb-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 pb-3 text-center transition-colors ${activeTab === 'login' ? 'text-neon-cyan border-b-2 border-neon-cyan' : 'text-slate-400 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 pb-3 text-center transition-colors ${activeTab === 'signup' ? 'text-neon-cyan border-b-2 border-neon-cyan' : 'text-slate-400 hover:text-white'}`}
            >
              Create Account
            </button>
            <button
              onClick={() => setActiveTab('phone_otp')}
              className={`flex-1 pb-3 text-center transition-colors ${activeTab === 'phone_otp' ? 'text-neon-cyan border-b-2 border-neon-cyan' : 'text-slate-400 hover:text-white'}`}
            >
              OTP Verification
            </button>
          </div>

          {/* Core Auth Forms */}
          {activeTab !== 'phone_otp' ? (
            <form onSubmit={handleEmailAuth} className="space-y-4 text-xs">
              {activeTab === 'signup' && (
                <>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold block">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none transition"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-neon-indigo to-neon-cyan hover:shadow-neon-indigo/20 text-white transition disabled:opacity-50 mt-2 text-sm flex items-center justify-center gap-2"
              >
                {isLoading ? 'Establishing Connection...' : activeTab === 'login' ? 'Synchronize Node' : 'Establish Profile Node'}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePhoneOtpRequest} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Mobile Telephone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none transition"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-500 block leading-normal mt-1">
                  We'll generate a simulated OTP to authorize this secure pipeline session.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-neon-indigo to-neon-cyan hover:shadow-neon-indigo/20 text-white transition disabled:opacity-50 mt-2 text-sm flex items-center justify-center gap-2"
              >
                {isLoading ? 'Requesting...' : 'Request Pin Access'}
              </button>
            </form>
          )}

          {/* Go back CTA */}
          <div className="text-center mt-6">
            <button
              onClick={() => onNavigate('landing')}
              className="text-xs text-slate-500 hover:text-white transition"
            >
              &larr; Back to Landing Page
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
