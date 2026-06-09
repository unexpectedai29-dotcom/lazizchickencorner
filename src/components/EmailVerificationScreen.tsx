import { Mail, CheckCircle, RefreshCw } from 'lucide-react';

interface EmailVerificationScreenProps {
  email: string;
  onLoginClick: () => void;
  isSandbox?: boolean;
  onSimulateVerify?: () => void;
}

export default function EmailVerificationScreen({
  email,
  onLoginClick,
  isSandbox = false,
  onSimulateVerify,
}: EmailVerificationScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Icon Graphic */}
      <div className="relative">
        <div className="w-20 h-20 bg-flame-orange/20 rounded-full flex items-center justify-center border border-flame-orange/40 animate-pulse">
          <Mail className="w-10 h-10 text-flame-orange" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-flame-yellow text-black p-1.5 rounded-full border-2 border-black">
          <CheckCircle className="w-4 h-4 fill-flame-yellow text-black" />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-3">
        <h3 className="font-display text-2xl text-white uppercase tracking-wider">
          Verify Your Email
        </h3>
        <p className="text-xs text-flame-gray leading-relaxed max-w-sm font-sans mx-auto">
          We have sent you a verification email to <span className="text-white font-mono font-bold font-semibold underline">{email}</span>. Please verify it and log in.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="w-full space-y-3 pt-2">
        <button
          onClick={onLoginClick}
          type="button"
          className="w-full bg-flame-orange hover:bg-flame-deep text-black font-display font-bold uppercase tracking-wider text-xs md:text-sm py-3 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Return & Log In</span>
        </button>
      </div>
    </div>
  );
}
