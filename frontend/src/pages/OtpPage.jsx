import React, { useState, useRef, useEffect } from 'react';
import { KeyRound, ShieldAlert } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function OtpPage({ phone, onNavigate, onVerifySuccess, addToast }) {
  const [code, setCode] = useState(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const inputsRef = useRef([]);

  // Countdown timer logic
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newCode = [...code];
    newCode[index] = val.substring(val.length - 1);
    setCode(newCode);

    // Auto-focus next box
    if (val && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Backspace to focus previous box
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = code.join('');
    if (otpString.length < 6) {
      addToast('warning', 'Incomplete Code', 'Please enter all 6 digits of the OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otpString })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'OTP verification failed');
      }

      onVerifySuccess(data);
    } catch (err) {
      addToast('error', 'Verification Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendTimer(60);
    try {
      const response = await fetch(`/api/auth/otp/send?phone=${encodeURIComponent(phone)}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to resend');
      addToast('success', 'OTP Resent', `Simulated new verification code: ${data.simulated_otp}`);
    } catch (err) {
      addToast('error', 'Resend Failed', err.message);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-neon-indigo to-neon-fuchsia rounded-2xl blur opacity-20 animate-pulse" />
        
        <GlassCard className="relative p-6 border-white/10">
          <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <div className="p-3 bg-neon-indigo/10 rounded-2xl">
              <KeyRound className="w-8 h-8 text-neon-cyan animate-bounce" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Security Code Verification</h2>
            <p className="text-xs text-slate-400">
              Passcode dispatched to <span className="text-slate-200 font-semibold">{phone}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            {/* Passcode segment matrix */}
            <div className="flex justify-between gap-2">
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength="1"
                  value={digit}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  onChange={(e) => handleChange(e, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-12 h-14 bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl text-center text-xl font-bold text-white focus:outline-none transition shadow-inner"
                  required
                />
              ))}
            </div>

            <div className="text-center space-y-1.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-neon-indigo to-neon-cyan hover:shadow-neon-indigo/20 text-white transition disabled:opacity-50 text-xs flex items-center justify-center gap-2"
              >
                {isLoading ? 'Decrypting Secure Pin...' : 'Verify Cryptographic Node'}
              </button>

              <div className="flex items-center justify-between text-[11px] pt-2 px-1">
                {resendTimer > 0 ? (
                  <span className="text-slate-500">Resend available in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-neon-cyan hover:underline font-semibold"
                  >
                    Resend Auth Code
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="text-slate-400 hover:text-white"
                >
                  Change Number
                </button>
              </div>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
