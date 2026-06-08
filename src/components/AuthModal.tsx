import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, ShieldCheck, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { authActions, isFirebaseSandbox } from '../firebase';
import EmailVerificationScreen from './EmailVerificationScreen';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  initialMode?: 'login' | 'signup' | 'phone';
}

type AuthTab = 'login' | 'signup' | 'phone';

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialMode);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  // Flow States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  // Dual Verification OTP State
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState('');
  const [generatedPhoneOtp, setGeneratedPhoneOtp] = useState('');
  const [enteredEmailOtp, setEnteredEmailOtp] = useState('');
  const [enteredPhoneOtp, setEnteredPhoneOtp] = useState('');
  const [tempUser, setTempUser] = useState<any>(null);
  const [tempPhone, setTempPhone] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [tempDisplayName, setTempDisplayName] = useState('');
  const [otpActionMode, setOtpActionMode] = useState<'login' | 'signup' | ''>('');
  const [smtpConfigured, setSmtpConfigured] = useState<boolean | null>(null);
  const [smtpSendingError, setSmtpSendingError] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode === 'phone' ? 'login' : initialMode);
      setErrorMsg('');
      setSuccessMsg('');
      setIsLoading(false);
      setConfirmationResult(null);
      setUnverifiedEmail('');
      
      // Reset Dual OTP states
      setIsVerifyingOtp(false);
      setGeneratedEmailOtp('');
      setGeneratedPhoneOtp('');
      setEnteredEmailOtp('');
      setEnteredPhoneOtp('');
      setTempUser(null);
      setTempPhone('');
      setTempEmail('');
      setTempPassword('');
      setTempDisplayName('');
      setOtpActionMode('');
      setSmtpConfigured(null);
      setSmtpSendingError('');
      setPreviewUrl('');
    }
  }, [isOpen, initialMode]);

  // Handle Resend countdown
  useEffect(() => {
    if (secondsLeft > 0) {
      const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [secondsLeft]);

  if (!isOpen) return null;

  // Handles Google Login
  const handleGoogleLogin = (forceAdmin = false) => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    authActions.loginWithGoogle(
      (user) => {
        setSuccessMsg('Successfully signed in with Google!');
        setIsLoading(false);
        setTimeout(() => {
          onSuccess(user);
          onClose();
        }, 800);
      },
      (err) => {
        console.error('Google Sign-in failed', err);
        setIsLoading(false);
        const code = err?.code || '';
        if (code === 'auth/unauthorized-domain' || String(err?.message || '').includes('unauthorized-domain')) {
          setErrorMsg('This domain has not been authorized in your Firebase Console authentication settings.');
        } else if (code === 'auth/popup-closed-by-user') {
          setErrorMsg('The sign-in popup was closed before completing. Please try again.');
        } else {
          setErrorMsg(err?.message || 'Failed to authenticate with Google.');
        }
      },
      forceAdmin
    );
  };

  // Calls real backend SMTP OTP dispatcher
  const sendRealEmailOtp = async (targetEmail: string, otpCode: string, name: string) => {
    try {
      setPreviewUrl('');
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: targetEmail,
          otp: otpCode,
          name: name,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSmtpConfigured(true);
        setSmtpSendingError('');
        if (data.previewUrl) {
          setPreviewUrl(data.previewUrl);
          setSuccessMsg(`✨ Real OTP verification email generated! Click "Open Dispatched Test Email" below to inspect.`);
        } else {
          setSuccessMsg(`✨ Real OTP verification code successfully sent to ${targetEmail}! Check Inbox or Spam.`);
        }
      } else {
        setSmtpConfigured(false);
        setSmtpSendingError(data.error || 'Failed to dispatch email.');
      }
    } catch (err: any) {
      console.warn("Failed to contact backend SMTP dispatcher.", err);
      setSmtpConfigured(false);
      setSmtpSendingError('Mail server offline. Please enter the generated code below for validation.');
    }
  };

  // Handles Email & Password Login
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    authActions.loginWithEmail(
      email,
      password,
      (user) => {
        setIsLoading(false);
        setIsVerifyingOtp(false);
        
        const finalUser = {
          ...user,
          phoneNumber: phoneNumber || user?.phoneNumber || '',
          emailVerified: true
        };

        // Persist user and sync Auth State
        localStorage.setItem(isFirebaseSandbox ? 'laziz_sandbox_user' : 'laziz_last_known_user', JSON.stringify(finalUser));
        // Dispatch immediately to synchronize components
        window.dispatchEvent(new Event('sandbox-auth-change'));

        onSuccess(finalUser);
        onClose();
      },
      (err) => {
        setIsLoading(false);
        const code = err?.code || '';
        if (code === 'auth/unverified-email') {
          setUnverifiedEmail(err.email || email);
          setIsVerifyingOtp(false);
        } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/user-not-found') {
          setErrorMsg('Incorrect email or password.');
        } else {
          setErrorMsg(err?.message || 'Failed to sign in. Please verify your credentials or connection.');
        }
      }
    );
  };

  // Handles Email Sign-Up
  const handleEmailSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      setErrorMsg('Email, Password, and Full Name are required.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Generate a secure 6-digit OTP code first, and do NOT register with Firebase Auth immediately
    const eOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedEmailOtp(eOtp);
    setTempEmail(email);
    setTempPassword(password);
    setTempDisplayName(displayName);
    setTempPhone(phoneNumber);
    setOtpActionMode('signup');

    setIsVerifyingOtp(true);
    setSuccessMsg('Account registration initiated! Email OTP verification code dispatched.');
    sendRealEmailOtp(email, eOtp, displayName).finally(() => {
      setIsLoading(false);
    });
  };

  // Handles Email OTP Verification
  const handleEmailOtpVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (enteredEmailOtp !== generatedEmailOtp) {
      setErrorMsg('Incorrect simulated Email verification OTP code. Please enter the correct code.');
      return;
    }

    setIsLoading(true);
    setSuccessMsg('🔥 Splendid! Email OTP verification passed successfully!');

    // Only after entering correct OTP, call Firebase Auth to authorize and establish active session!
    if (otpActionMode === 'login') {
      authActions.loginWithEmail(
        tempEmail,
        tempPassword,
        (user) => {
          setIsLoading(false);
          setIsVerifyingOtp(false);
          
          const finalUser = {
            ...user,
            phoneNumber: tempPhone || user?.phoneNumber || '',
            emailVerified: true
          };

          // Persist user and sync Auth State
          localStorage.setItem(isFirebaseSandbox ? 'laziz_sandbox_user' : 'laziz_last_known_user', JSON.stringify(finalUser));
          // Dispatch immediately to synchronize components
          window.dispatchEvent(new Event('sandbox-auth-change'));

          onSuccess(finalUser);
          onClose();
        },
        (err) => {
          setIsLoading(false);
          const code = err?.code || '';
          if (code === 'auth/unverified-email') {
            setUnverifiedEmail(err.email || tempEmail);
            setIsVerifyingOtp(false);
          } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
            setErrorMsg('Incorrect email or password.');
          } else if (code === 'auth/user-not-found') {
            setErrorMsg('No user registered with this email. Click "Sign Up" above.');
          } else {
            setErrorMsg(err?.message || 'Failed to sign in. Please verify your credentials or connection.');
          }
        }
      );
    } else {
      authActions.signUpWithEmail(
        tempEmail,
        tempPassword,
        tempDisplayName,
        (user) => {
          setIsLoading(false);
          setIsVerifyingOtp(false);

          const finalUser = {
            ...user,
            phoneNumber: tempPhone || user?.phoneNumber || '',
            emailVerified: true
          };

          // Persist user and sync Auth State
          localStorage.setItem(isFirebaseSandbox ? 'laziz_sandbox_user' : 'laziz_last_known_user', JSON.stringify(finalUser));
          // Dispatch immediately to synchronize components
          window.dispatchEvent(new Event('sandbox-auth-change'));

          onSuccess(finalUser);
          onClose();
        },
        (err) => {
          setIsLoading(false);
          const code = err?.code || '';
          if (code === 'auth/email-already-in-use') {
            setErrorMsg('This email is already registered. Please sign in instead.');
          } else {
            setErrorMsg(err?.message || 'Failed to create account.');
          }
        },
        tempPhone || undefined
      );
    }
  };

  // Send SMS verification to Phone
  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setErrorMsg('Please specify a valid phone number with country code (e.g., +919876543210).');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    authActions.sendSmsCode(
      phoneNumber,
      'recaptcha-container',
      (res) => {
        setConfirmationResult(res);
        setIsLoading(false);
        setSuccessMsg(isFirebaseSandbox ? 'SANDBOX: Verification code is "123456"!' : 'Verification text sent to your phone!');
        setSecondsLeft(60);
      },
      (err) => {
        setIsLoading(false);
        console.error('Sms send error', err);
        const code = err?.code || '';
        if (code === 'auth/unauthorized-domain' || String(err?.message || '').includes('unauthorized-domain')) {
          setErrorMsg('SMS Auth is blocked: Auth Domain restricted. Try sandbox mode bypass!');
        } else {
          setErrorMsg(err?.message || 'Failed to dispatch verification code. Ensure your phone number contains the country code.');
        }
      }
    );
  };

  // Confirm OTP SMS verification code
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      setErrorMsg('Please enter the 6-digit code received.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    confirmationResult.confirm(verificationCode)
      .then((result: any) => {
        setSuccessMsg('Phone number authenticated successfully!');
        setIsLoading(false);
        setTimeout(() => {
          onSuccess(result.user);
          onClose();
        }, 800);
      })
      .catch((err: any) => {
        setIsLoading(false);
        console.error('OTP confirmation failed', err);
        setErrorMsg(err?.message || 'Invalid 6-digit verification code. Please try again.');
      });
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[110] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0F0F0F] border border-flame-orange/40 max-w-md w-full rounded-2xl p-5 md:p-6 relative shadow-[0_0_50px_rgba(255,107,0,0.15)] my-auto max-h-[85vh] flex flex-col overflow-y-auto no-scrollbar">
        
        {/* Glow bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-flame-orange via-flame-yellow to-flame-orange"></div>

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-flame-gray hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand headers */}
        <div className="text-center mt-2">
          <h3 className="font-display text-2xl text-white tracking-wide uppercase">
            LAZIZ <span className="text-flame-orange">CHICKEN</span>
          </h3>
          <p className="font-sans text-[10px] text-flame-gray uppercase tracking-widest mt-0.5">
            Sironj Spicy Fast-Food • Customer Secure Portal
          </p>
        </div>

        {unverifiedEmail ? (
          <EmailVerificationScreen 
            email={unverifiedEmail}
            onLoginClick={() => {
              setUnverifiedEmail('');
              setActiveTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            isSandbox={isFirebaseSandbox}
            onSimulateVerify={() => {
              authActions.simulateVerifySandboxEmail(unverifiedEmail);
              setSuccessMsg('SANDBOX SUCCESS: Email successfully verified! You can now log in.');
              setTimeout(() => {
                setUnverifiedEmail('');
                setActiveTab('login');
                setErrorMsg('');
                setSuccessMsg('');
              }, 1200);
            }}
          />
        ) : isVerifyingOtp ? (
          <form onSubmit={handleEmailOtpVerifySubmit} className="space-y-4 mt-5">
            <div className="bg-black/60 border border-white/5 p-4 rounded-xl space-y-4 shadow-inner">
              <div className="text-center pb-2 border-b border-white/5">
                <span className="inline-block px-2.5 py-1 rounded bg-[#FF4500]/10 border border-[#FF4500]/30 text-flame-orange font-mono text-[9px] uppercase tracking-wider font-extrabold shadow-sm animate-pulse">
                  🔒 EMAIL OTP REQUIRED TO VERIFY
                </span>
                <p className="text-[11px] text-zinc-400 font-sans mt-2 leading-relaxed">
                  To authenticate <strong className="text-white">{email || tempUser?.email}</strong>, we require your Email OTP verification check-code.
                </p>
              </div>

              {/* Email OTP Field */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] uppercase tracking-wider text-flame-gray font-mono">
                  Email OTP Verification Code
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-flame-gray" />
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredEmailOtp}
                    onChange={(e) => setEnteredEmailOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter email 6-digit OTP"
                    className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2.5 font-mono text-sm tracking-widest text-white placeholder-zinc-700 focus:outline-none focus:border-flame-orange focus:ring-1 focus:ring-flame-orange/30 font-sans"
                    required
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg flex items-center gap-2 text-xs text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}
            
            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg flex items-center gap-2 text-xs animate-pulse">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="leading-snug">{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] transform text-black font-display font-bold uppercase tracking-wider text-xs md:text-sm py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>Unlock Account & Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsVerifyingOtp(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="w-full text-center text-[10px] text-flame-gray hover:text-white uppercase tracking-wider font-mono py-1 block underline"
            >
              ← Cancel and Return
            </button>

            {/* Live Gateway or Real SMTP status */}
            {smtpConfigured === true ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2 mt-2 shadow-inner text-left font-sans animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-mono text-[9px] uppercase tracking-widest font-black">
                    📬 Direct Email Dispatch Successful
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  We have dispatched a secure authentication OTP directly to <strong className="text-white">{email || tempUser?.email}</strong>. Please check your inbox and spam folders!
                </p>
                {previewUrl && (
                  <div className="mt-3 pt-2.5 border-t border-emerald-500/10 space-y-1.5">
                    <p className="text-[8px] text-flame-yellow uppercase tracking-widest font-mono font-bold">
                      🧪 Mail Sandbox Active:
                    </p>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-flame-orange to-amber-500 hover:from-flame-orange/90 hover:to-amber-500/90 text-black font-accent text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all w-full justify-center shadow-md shadow-flame-orange/10"
                    >
                      <span>📥 Open Dispatched Test Email</span>
                      <ArrowRight className="w-3.5 h-3.5 text-black" />
                    </a>
                    <p className="text-[8px] text-zinc-500 leading-normal">
                      Since custom SMTP variables are not configured in your settings, a real compiled SMTP message was sent to the test server. Click above to verify.
                    </p>
                  </div>
                )}
                {smtpSendingError && (
                  <p className="text-[9px] text-red-400 italic mt-1">
                    Error: {smtpSendingError}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-flame-orange/5 border border-flame-orange/20 rounded-xl space-y-3 mt-2 shadow-inner text-left">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-flame-orange animate-ping"></span>
                  <span className="font-mono text-[9px] text-flame-yellow uppercase tracking-widest font-black">
                    📶 SIMULATION Fallback (SMTP NOT CONFIG)
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                  SMTP configuration (SMTP_USER, SMTP_PASS) is not yet set in your secrets. Please declare them under Settings &gt; Secrets to enable inbox-direct emails. Enjoy this simulated key code for testing:
                </p>
                <div className="grid grid-cols-1 gap-2 mt-1">
                  <div className="bg-black border border-white/5 p-2 rounded-lg text-center shadow-inner">
                    <span className="block text-[8px] text-flame-gray uppercase tracking-wider font-mono">✉️ Email Token</span>
                    <span className="block text-xs font-mono font-bold text-white tracking-widest bg-white/5 py-1 px-2 rounded mt-1 select-all border border-white/5">
                      {generatedEmailOtp}
                    </span>
                  </div>
                </div>
                <p className="text-[9px] text-[#FF9E00]/50 font-sans text-center">
                  * Set your real SMTP login details in AI Studio to receive direct OTP emails in your actual inbox.
                </p>
              </div>
            )}
          </form>
        ) : (
          <>
            {/* Tab selector */}
            {!confirmationResult && (
          <div className="flex bg-black border border-white/5 p-1 rounded-lg mt-5">
            <button
              onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
              className={`flex-1 text-center py-2 text-xs font-accent uppercase tracking-wider rounded-md transition-colors ${
                activeTab === 'login' ? 'bg-flame-orange text-black font-bold' : 'text-flame-gray hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setErrorMsg(''); }}
              className={`flex-1 text-center py-2 text-xs font-accent uppercase tracking-wider rounded-md transition-colors ${
                activeTab === 'signup' ? 'bg-flame-orange text-black font-bold' : 'text-flame-gray hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Message states */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg flex items-start gap-2 text-xs text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1.5">
              <span className="leading-snug block">{errorMsg}</span>
              {(errorMsg.toLowerCase().includes('network') || errorMsg.toLowerCase().includes('internet') || errorMsg.toLowerCase().includes('failed to fetch') || errorMsg.toLowerCase().includes('fetch')) && (
                <div className="pt-1.5 border-t border-red-500/20 mt-1.5">
                  <p className="text-[9px] text-zinc-400 mb-1">
                    Firebase connection was blocked or unreachable. We recommend running in offline simulation mode instead.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('laziz_force_sandbox', 'true');
                      window.location.reload();
                    }}
                    className="bg-flame-orange hover:bg-flame-deep text-black font-mono font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded transition-colors cursor-pointer"
                  >
                    🔌 Enable Local Sandbox Bypass Offline
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg flex items-start gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#0F0F0F]/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-20">
            <Loader2 className="w-8 h-8 text-flame-orange animate-spin" />
            <span className="font-mono text-[10px] text-flame-gray uppercase tracking-widest mt-2 animate-pulse">
              Authenticating Credentials...
            </span>
          </div>
        )}

        {/* --- FORM MODULES --- */}
        <div className="mt-5">
          {activeTab === 'login' && !confirmationResult && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider text-flame-gray font-mono">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-flame-gray" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-flame-orange focus:ring-1 focus:ring-flame-orange/30 font-sans"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 col-span-1">
                <label className="block text-[10px] uppercase tracking-wider text-flame-gray font-mono">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-flame-gray" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-flame-orange focus:ring-1 focus:ring-flame-orange/30 font-sans"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-flame-orange hover:bg-flame-deep text-black font-display font-bold uppercase tracking-wider text-xs md:text-sm py-3 rounded-lg transition-colors cursor-pointer"
              >
                Log In Securely
              </button>
            </form>
          )}

          {activeTab === 'signup' && !confirmationResult && (
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider text-flame-gray font-mono">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-flame-gray" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="E.g., Shoaib Khan"
                    className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-flame-orange focus:ring-1 focus:ring-flame-orange/30 font-sans"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider text-flame-gray font-mono">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-flame-gray" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-flame-orange focus:ring-1 focus:ring-flame-orange/30 font-sans"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider text-flame-gray font-mono">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-flame-gray" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="E.g. +91 98765 43210"
                    className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-flame-orange focus:ring-1 focus:ring-flame-orange/30 font-sans"
                  />
                </div>
                <span className="block text-[9px] text-[#FF9E00]/60 uppercase tracking-wide leading-tight mt-1">
                  * Optional. Used for order notifications and dispatcher contact.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider text-flame-gray font-mono">Password (6+ chars)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-flame-gray" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create safe password"
                    className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-flame-orange focus:ring-1 focus:ring-flame-orange/30 font-sans"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-flame-orange hover:bg-flame-deep text-black font-display font-bold uppercase tracking-wider text-xs md:text-sm py-3 rounded-lg transition-colors cursor-pointer"
              >
                Create Account
              </button>
            </form>
          )}

          {activeTab === 'phone' && !confirmationResult && (
            <form onSubmit={handleSendSms} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider text-flame-gray font-mono">Mobile Number (with country code)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-flame-gray" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-flame-orange focus:ring-1 focus:ring-flame-orange/30 font-sans"
                    required
                  />
                </div>
                <span className="block text-[9px] text-[#FF9E00]/60 uppercase tracking-wide leading-tight mt-1">
                  * Must include international code (e.g. +91 for India).
                </span>
              </div>

              {/* Invisible Recaptcha container target */}
              <div id="recaptcha-container" className="hidden"></div>

              <button
                type="submit"
                className="w-full bg-flame-orange hover:bg-flame-deep text-black font-display font-bold uppercase tracking-wider text-xs md:text-sm py-3 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Send Verification OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* OTP Verification Code form */}
          {confirmationResult && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider text-flame-yellow font-mono text-center">
                  Enter 6-Digit SMS Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full bg-black border-2 border-flame-orange/60 rounded-xl px-4 py-3 text-center font-mono text-2xl tracking-[0.75em] text-white placeholder-zinc-800 focus:outline-none focus:border-flame-orange focus:ring-1 focus:ring-flame-orange text-center uppercase"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-display font-bold uppercase tracking-wider text-xs md:text-sm py-3 rounded-lg transition-colors cursor-pointer"
              >
                Verify & Sign In
              </button>

              <div className="flex justify-between items-center text-[10.5px] text-flame-gray">
                <span>Didn't receive text?</span>
                {secondsLeft > 0 ? (
                  <span>Resend in {secondsLeft}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmationResult(null);
                      setVerificationCode('');
                    }}
                    className="text-flame-orange hover:underline uppercase tracking-wider font-accent"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* --- SOCIAL SIGN IN --- */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <span className="relative bg-[#0F0F0F] px-3 font-mono text-[9px] uppercase tracking-widest text-flame-gray select-none">
            Or Sign In With
          </span>
        </div>

        <button
          onClick={() => handleGoogleLogin(false)}
          className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-accent uppercase tracking-wider text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          {/* Custom vector beautiful Google Icon */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.67 0 3.2.58 4.38 1.71l3.27-3.27C17.7 1.63 15.03 1 12 1 7.37 1 3.4 3.66 1.45 7.5l3.8 2.95C6.18 7.04 8.85 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.46c-.28 1.48-1.11 2.73-2.37 3.58l3.66 2.84c2.14-1.97 3.74-4.87 3.74-8.52z"
            />
            <path
              fill="#FBBC05"
              d="M5.25 14.55c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18l-3.8-2.95C.54 8.76 0 10.32 0 12s.54 3.24 1.45 4.77l3.8-2.22z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.1.74-2.5 1.18-4.3 1.18-3.15 0-5.82-2-6.75-4.91L1.45 15.5C3.4 19.34 7.37 22 12 22z"
            />
          </svg>
          <strong>Google Account</strong>
        </button>

        {isFirebaseSandbox && (
          <div className="mt-4 flex flex-col items-center justify-center gap-1">
            <button
              onClick={() => handleGoogleLogin(true)}
              className="w-full bg-flame-orange/10 hover:bg-flame-orange/20 border border-flame-orange/30 text-flame-yellow font-mono text-[9px] uppercase tracking-widest py-1.5 rounded-lg cursor-pointer"
            >
              👑 Direct Whitelisted Admin Link (Sandbox Ease)
            </button>
            <p className="text-[8px] text-zinc-600 text-center uppercase mt-1 leading-snug font-mono">
              Sandbox mode is active. You can type any information to mock authenticate!
            </p>
          </div>
        )}
          </>
        )}

      </div>
    </div>
  );
}