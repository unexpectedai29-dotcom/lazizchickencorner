import React, { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import LCCLogo from './LCCLogo';
import { Mail, Lock, ShieldAlert, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import { isFirebaseSandbox, authActions } from '../firebase';
import EmailVerificationScreen from './EmailVerificationScreen';

export default function AdminLoginPage() {
  const { login, signUp } = useAuth();
  const [email, setEmail] = useState('lazizchickencorners@gmail.com');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      let resUser;
      if (isSignUp) {
        resUser = await signUp(email.trim(), password);
      } else {
        resUser = await login(email.trim(), password);
      }

      if (resUser && resUser.isUnverifiedSignUp) {
        setUnverifiedEmail(resUser.email || email.trim());
      } else {
        window.location.hash = '#/admin/dashboard';
      }
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/unverified-email') {
        setUnverifiedEmail(err.email || email.trim());
      } else {
        const code = err?.code || '';
        const msg = err?.message || err?.toString() || '';
        if (isSignUp) {
          if (msg.includes('already') || msg.includes('exists') || code === 'auth/email-already-in-use') {
            setErrorMsg("User already exists. Please sign in");
          } else if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed') || msg.includes('OPERATION_NOT_ALLOWED')) {
            setErrorMsg("Email & Password registration is disabled in your Firebase Console.");
          } else {
            setErrorMsg(err.message || "Failed to create account. Please try again.");
          }
        } else {
          if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed') || msg.includes('OPERATION_NOT_ALLOWED')) {
            setErrorMsg("Email & Password login is disabled in your Firebase/Auth Console settings.");
          } else if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
            setErrorMsg("This domain is unauthorized in Firebase. Please add this URL to the authorized domains.");
          } else if (code === 'auth/configuration-not-found' || msg.includes('configuration-not-found')) {
            setErrorMsg("Firebase Auth configuration not found.");
          } else {
            setErrorMsg("Email or password is incorrect.");
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center px-4 relative overflow-hidden select-none">
      
      {/* Background radial atmosphere & orange flare glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-flame-orange/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[15%] w-[300px] h-[300px] bg-flame-yellow/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Login Card with premium structural design */}
      <div className="w-full max-w-md bg-[#0F0F0F] border border-flame-orange/30 p-8 rounded-2xl relative shadow-[0_0_80px_rgba(255,107,0,0.1)] z-10 transition-all">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-flame-orange via-flame-yellow to-flame-orange" />

        {unverifiedEmail ? (
          <EmailVerificationScreen 
            email={unverifiedEmail}
            onLoginClick={() => {
              setUnverifiedEmail('');
              setIsSignUp(false);
              setErrorMsg(null);
            }}
            isSandbox={isFirebaseSandbox}
            onSimulateVerify={() => {
              authActions.simulateVerifySandboxEmail(unverifiedEmail);
              setUnverifiedEmail('');
              setIsSignUp(false);
              setErrorMsg(null);
            }}
          />
        ) : (
          <>
            {/* Logo and Greeting Header */}
            <div className="flex flex-col items-center mb-8 text-center pt-2">
              <LCCLogo size="custom" className="w-24 h-20 mb-3" glow={true} />
              <span className="font-mono text-[9px] text-[#FF9E00] uppercase tracking-widest leading-none font-bold">
                {isSignUp ? "Generate Owner Credentials" : "Authorized Personnel Only"}
              </span>
              <h2 className="font-display text-3xl text-white uppercase tracking-wider mt-1">
                {isSignUp ? "OWNER SIGN UP" : "OWNER CONTROL"}
              </h2>
              <p className="text-[11px] text-flame-gray max-w-sm mt-2 font-sans leading-relaxed">
                {isSignUp 
                  ? "Register your administrative credentials to manage Laziz Chicken Corner storefront."
                  : "Please authenticate using Sironj's official Laziz Chicken Corner administrative credentials."}
              </p>
            </div>

            {/* Inner error message block */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-xs flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                <div className="space-y-2 flex-1 text-left">
                  <strong className="block font-mono uppercase tracking-wider text-[10px]">Permission Rejected</strong>
                  <p className="font-sans leading-relaxed">{errorMsg}</p>
                  
                  {(!isFirebaseSandbox) && (
                    <div className="pt-2 border-t border-red-500/20 mt-2 space-y-2">
                      <p className="text-[10px] text-flame-yellow font-mono uppercase tracking-wider font-bold">
                        Troubleshooting your Live Firebase:
                      </p>
                      <ul className="list-disc pl-4 text-[10px] text-flame-gray space-y-1 font-sans">
                        <li>
                          <strong>First time on live Firebase?</strong> If this is a new live database, please toggle <span className="text-white hover:underline cursor-pointer" onClick={() => setIsSignUp(true)}>"Create store credentials"</span> below to register the admin email <code className="text-white text-[9px] font-mono break-all font-bold">lazizchickencorners@gmail.com</code> with your chosen password first.
                        </li>
                        <li>
                          <strong>Is Email/Password Login Method enabled?</strong> You must enable <em>Email/Password</em> provider in your <em>Firebase Console &rarr; Authentication &rarr; Sign-in method</em>. If disabled, Firebase rejects registrations and logins.
                        </li>
                        <li>
                          <strong>Bypass / Test offline:</strong> If you don't have Firebase access or just want to explore, switch to Sandbox Mode to log in instantly.
                        </li>
                      </ul>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.setItem('laziz_force_sandbox', 'true');
                          window.location.reload();
                        }}
                        className="bg-flame-orange hover:bg-flame-deep text-black font-mono font-bold text-[9px] uppercase tracking-wider px-2.5 py-1.5 rounded transition-all cursor-pointer mt-1"
                      >
                        🔌 Switch to Sandbox Mode (Instantly Log In)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleAdminSubmit} className="space-y-5">
              {/* Email Address Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="admin-email" className="block text-[10px] uppercase tracking-wider text-flame-gray font-mono font-bold">
                    Email Address
                  </label>
                  {isSignUp && (
                    <span className="text-[9px] text-[#FF9E00] font-mono uppercase tracking-widest font-bold">
                      🔒 Official Admin Account Only
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-flame-gray" />
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="administrator@gmail.com"
                    className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-flame-orange focus:ring-1 focus:ring-flame-orange/30 font-sans transition-all selection:bg-flame-orange/40 disabled:opacity-75 disabled:text-zinc-500 disabled:border-zinc-800 disabled:bg-[#111]"
                    required
                    disabled={isLoading || isSignUp}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label htmlFor="admin-password" className="block text-[10px] uppercase tracking-wider text-flame-gray font-mono font-bold">
                  Security Key / Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-flame-gray" />
                  <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••"
                    className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-flame-orange focus:ring-1 focus:ring-flame-orange/30 font-sans transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Connect Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-flame-orange hover:bg-flame-deep disabled:bg-zinc-800 text-black disabled:text-zinc-600 font-accent uppercase tracking-wider py-3 rounded-lg font-extrabold text-xs transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-flame-orange/15"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-600" />
                    <span>Processing secure access...</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? "Generate Store Credentials" : "Secure Sign In"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle between Login and Signup */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setEmail('lazizchickencorners@gmail.com');
                  setErrorMsg(null);
                }}
                className="text-[11px] text-flame-gray hover:text-white transition-colors cursor-pointer font-sans underline"
              >
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account yet? Create store credentials"}
              </button>
            </div>

            {/* Sandbox tip */}
            {isFirebaseSandbox && (
              <div className="mt-5 p-3.5 bg-flame-orange/5 border border-flame-orange/15 rounded-xl text-center font-sans">
                <p className="text-[10px] text-flame-yellow font-mono uppercase tracking-wider font-bold">
                  Demo Sandbox Guide
                </p>
                <p className="text-[11px] text-flame-gray mt-1 leading-relaxed">
                  Use <strong className="text-white font-mono break-all">lazizchickencorners@gmail.com</strong> with security key <strong className="text-white font-mono">lazizchicken</strong> to log in.
                </p>
              </div>
            )}

            {/* Database Mode Switcher link */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => {
                  if (isFirebaseSandbox) {
                    localStorage.removeItem('laziz_force_sandbox');
                  } else {
                    localStorage.setItem('laziz_force_sandbox', 'true');
                  }
                  window.location.reload();
                }}
                className="text-[10px] text-zinc-500 hover:text-flame-orange font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                {isFirebaseSandbox ? "🔌 Switch to Real Firebase Live" : "🛠️ Play with Sandbox local DB simulation"}
              </button>
            </div>

            {/* Meta help links */}
            <div className="mt-8 pt-6 border-t border-white/5 text-center flex justify-between items-center text-[10px] uppercase font-mono text-flame-gray">
              <a
                href="#/"
                className="hover:text-flame-orange transition-colors flex items-center gap-1"
              >
                &larr; Back to Store
              </a>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-flame-yellow" /> Secure Lock
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
