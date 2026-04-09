import React, { useState } from 'react';
import useVerifyEmail from '../hooks/useVerifyEmail';
import Logo from '../components/Logo';

const EmailVerificationPage = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const { verifyEmailMutation, isVerifying, resendCodeMutation, isResending } = useVerifyEmail();

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take last char
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const verificationCode = code.join('');
    if (verificationCode.length === 6) {
      verifyEmailMutation(verificationCode);
    }
  };

  return (
    <div className="min-h-screen premium-gradient-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-10 rounded-[2.5rem] border border-white/20 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Logo className="size-12" showText={false} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-base-content tracking-tighter">Verify Email</h1>
            <p className="text-base-content/60 text-sm">
              We've sent a 6-digit code to your inbox. <br/>Enter it below to unlock TalkNow.
            </p>
          </div>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-between gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-input-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                autoFocus={index === 0}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isVerifying || code.some(d => !d)}
            className="w-full py-4 bg-primary text-primary-content font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all duration-300"
          >
            {isVerifying ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading loading-spinner loading-sm" /> Verifying...
              </span>
            ) : "Complete Verification"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-base-content/60">
            Didn't get the code?{' '}
            <button
              onClick={() => resendCodeMutation()}
              disabled={isResending}
              className="text-primary font-bold hover:underline disabled:opacity-50"
            >
              {isResending ? "Resending..." : "Resend Code"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
