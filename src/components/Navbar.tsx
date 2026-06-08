import { useState } from 'react';
import { ShoppingCart, User, LogOut, ShieldAlert, ClipboardList, X, Menu, Copy, Check, AlertTriangle, Phone, HardDrive } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { authActions, isFirebaseSandbox, enableSandboxBypass, disableSandboxBypass, dbService } from '../firebase';
import LCCLogo from './LCCLogo';
import { showToast } from '../lib/toast';

interface NavbarProps {
  currentUser: any;
  cartCount: number;
  onOpenCart: () => void;
  onOpenOrders: () => void;
  onOpenAdmin: () => void;
  onLogin: (user: any) => void;
  onLogout: () => void;
  onOpenAuth: (mode?: 'login' | 'signup' | 'phone') => void;
}

export default function Navbar({
  currentUser,
  cartCount,
  onOpenCart,
  onOpenOrders,
  onOpenAdmin,
  onLogin,
  onLogout,
  onOpenAuth,
}: NavbarProps) {
  const [showDomainError, setShowDomainError] = useState(false);
  const [showPopupClosedError, setShowPopupClosedError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAuthSuccess = (user: any) => {
    onLogin(user);
    // Dispatch simple event for reactive listeners
    window.dispatchEvent(new CustomEvent('sandbox-auth-change'));
  };

  const handleDevAdminLogin = () => {
    authActions.loginWithGoogle(
      handleAuthSuccess,
      () => {},
      true
    );
  };

  const handleDevFilesAdminLogin = () => {
    const mockUser = {
      uid: 'PqUn9o3KQAg0bUWQ78IsjedZPxK2',
      email: 'files_admin@laziz.in',
      displayName: 'System Master Admin',
      emailVerified: true
    };
    localStorage.setItem('laziz_sandbox_user', JSON.stringify(mockUser));
    onLogin(mockUser);
    window.dispatchEvent(new CustomEvent('sandbox-auth-change'));
    window.location.hash = '#/dashboard';
    showToast('Securely logged in as Files Security Admin!', 'success', 'Admin Portal Access');
  };

  const handleDevNormalUserLogin = () => {
    const mockUser = {
      uid: 'sandbox_customer_789',
      email: 'john_doe@gmail.com',
      displayName: 'John Doe',
      emailVerified: true
    };
    localStorage.setItem('laziz_sandbox_user', JSON.stringify(mockUser));
    onLogin(mockUser);
    window.dispatchEvent(new CustomEvent('sandbox-auth-change'));
    window.location.hash = '#/dashboard';
    showToast('Logged in as customer "John Doe"!', 'success', 'User Access');
  };

  const copyDomain = () => {
    navigator.clipboard.writeText(window.location.hostname);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    authActions.logout(() => {
      onLogout();
      window.dispatchEvent(new CustomEvent('sandbox-auth-change'));
    });
  };

  const isAdmin = currentUser && dbService.isAdminEmail(currentUser.email);

  return (
    <nav className="sticky top-0 z-50 bg-flame-black/95 backdrop-blur-md border-b border-flame-orange/20 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo - LCC Chef Logo */}
        <a href="#hero" className="flex items-center gap-3 group">
          <div className="relative transition-transform duration-300 group-hover:scale-105">
            <LCCLogo size="custom" className="w-16 h-12" glow={true} />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl md:text-2xl tracking-wide text-white leading-none">
              LAZIZ <span className="text-flame-orange">CHICKEN</span>
            </span>
            <span className="font-mono text-[8px] tracking-widest text-flame-yellow leading-none font-bold uppercase mt-1">
              CORNER • SIRONJ
            </span>
          </div>
        </a>

        {/* Navigation Links - Desktop Only */}
        <div className="hidden lg:flex items-center gap-8 font-display text-base tracking-wider text-gray-300 uppercase">
          <a href="#hero" className="hover:text-flame-orange transition-all font-bold duration-200">Home</a>
          <a href="#menu" className="hover:text-flame-orange transition-all font-bold duration-200">Menu</a>
          <a href="#contact" className="hover:text-flame-orange transition-all font-bold duration-200">Contact</a>
        </div>

        {/* Action Controls & Call Line */}
        <div className="flex items-center gap-3">
          {/* Quick Mobile Call Button Shortcut */}
          <a 
            href="tel:9926715071" 
            className="md:hidden p-2 bg-gradient-to-r from-flame-orange to-amber-500 hover:brightness-110 text-black text-xs font-bold rounded-full cursor-pointer hover:scale-105 duration-200 shrink-0"
            title="Call Laziz Chicken Corner"
          >
            <Phone className="w-4 h-4 fill-black" />
          </a>

          {/* Desktop Call Hotline */}
          <div className="hidden md:flex items-center gap-2 bg-black/45 border border-white/5 py-1 px-3.5 rounded-xl mr-1">
            <div className="text-left shrink-0">
              <span className="text-[9px] uppercase font-mono text-zinc-500 block leading-none">Hotline</span>
              <a href="tel:9926715071" className="text-xs font-mono font-black text-white hover:text-flame-orange transition-all">9926715071</a>
            </div>
            <a
              href="tel:9926715071"
              className="flex items-center gap-1 bg-flame-orange hover:bg-flame-deep text-black font-display font-black text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-transform active:scale-95 duration-200 shrink-0"
            >
              <Phone className="w-3 h-3 fill-current" />
              <span>Call Now</span>
            </a>
          </div>
          
          {/* Status Badge in sandbox */}
          {isFirebaseSandbox && (
            localStorage.getItem('laziz_force_sandbox') === 'true' ? (
              <button
                onClick={disableSandboxBypass}
                className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full hover:bg-emerald-500/20 transition-all cursor-pointer group"
                title="Click to restore live physical Firebase connection"
              >
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-wider font-bold group-hover:underline">Sandbox Override Active</span>
              </button>
            ) : (
              <div className="hidden sm:inline-flex items-center gap-1.5 bg-flame-orange/10 border border-flame-orange/30 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-flame-yellow rounded-full animate-ping"></span>
                <span className="font-mono text-[10px] text-flame-yellow uppercase tracking-wide">Demo Sandbox Mode</span>
              </div>
            )
          )}

          {/* Admin Portal entrypoint - always visible to allow access */}
          <button
            onClick={() => { window.location.hash = '#/admin/login'; }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-accent uppercase tracking-wider transition-all cursor-pointer border ${
              isAdmin 
                ? 'bg-flame-orange/20 border-flame-orange/60 text-flame-orange hover:bg-flame-orange hover:text-white' 
                : 'bg-zinc-800/60 hover:bg-zinc-700/80 text-flame-gray hover:text-white border-white/5'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </button>

          {/* User Order History Toggle */}
          {currentUser && (
            <button
              onClick={onOpenOrders}
              className="p-2 text-flame-gray hover:text-white hover:bg-white/5 rounded-full transition-colors relative"
              title="My Orders"
            >
              <ClipboardList className="w-5.5 h-5.5" />
            </button>
          )}



          {/* Shopping Cart Button */}
          <button
            onClick={onOpenCart}
            className="p-2 bg-flame-orange hover:bg-flame-deep text-white rounded-full transition-colors relative flex items-center justify-center cursor-pointer"
            title="Open Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-flame-yellow text-flame-black font-mono font-bold text-xs w-5 h-5 flex items-center justify-center rounded-full border-2 border-flame-black">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Navigation Hamburger Menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-flame-gray hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer flex items-center justify-center shrink-0 border border-white/5"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Authentication State */}
          {currentUser ? (
            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-medium text-white max-w-[120px] truncate">
                  {currentUser.displayName || 'Guest User'}
                </span>
                <span className="text-[10px] text-flame-gray max-w-[120px] truncate">
                  {currentUser.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 border-l border-white/10 pl-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-accent uppercase tracking-wide px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-flame-orange" />
                <span>Login / Register</span>
              </button>

              {/* Developer quick login for sandbox ease */}
              {isFirebaseSandbox && (
                <div className="flex items-center gap-1 border-l border-white/5 pl-2">
                  <button
                    onClick={handleDevAdminLogin}
                    className="bg-flame-deep/20 hover:bg-flame-deep/40 text-flame-yellow text-[8px] font-mono tracking-widest px-2 py-1.5 rounded-md border border-flame-deep/40 cursor-pointer"
                    title="Dev Auto-Login as Food Store Admin"
                  >
                    STORE-ADM
                  </button>
                  <button
                    onClick={handleDevFilesAdminLogin}
                    className="bg-[#121b22] hover:bg-[#1c2c39] text-[#00E5FF] text-[8px] font-mono tracking-widest px-2 py-1.5 rounded-md border border-blue-500/20 cursor-pointer"
                    title="Dev Auto-Login as Files Admin PqUn9o3KQAg0bUWQ78IsjedZPxK2"
                  >
                    FILES-ADM
                  </button>
                  <button
                    onClick={handleDevNormalUserLogin}
                    className="bg-[#12221b] hover:bg-[#1a3728] text-emerald-400 text-[8px] font-mono tracking-widest px-2 py-1.5 rounded-md border border-emerald-500/20 cursor-pointer"
                    title="Dev Auto-Login as Customer"
                  >
                    USER-MOK
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* --- Unauthorized Auth Domain Fallback Instruction Modal --- */}
      {showDomainError && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-flame-orange/40 max-w-lg w-full rounded-2xl p-6 relative overflow-hidden shadow-[0_0_50px_rgba(255,107,0,0.15)] animate-flicker-subtle">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-flame-orange via-flame-yellow to-flame-orange"></div>
            
            <button 
              onClick={() => setShowDomainError(false)}
              className="absolute top-4 right-4 text-flame-gray hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 mt-2">
              <div className="p-3 bg-flame-orange/20 border border-flame-orange/40 rounded-xl text-flame-orange shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-left">
                <h3 className="font-display text-2xl text-white uppercase tracking-wider">
                  Firebase Domain Locked
                </h3>
                <p className="font-mono text-[9px] text-[#FF9E00] uppercase tracking-widest mt-0.5">
                  Auth Restriction (unauthorized-domain)
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4 font-sans text-sm text-flame-gray leading-relaxed text-left">
              <p>
                Your physical Firebase configurations are connected! However, Google's authentication system requires this specific preview domain to be whitelisted before sign-ins are allowed.
              </p>

              <div className="bg-black/60 border border-white/5 rounded-xl p-4 space-y-3">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-flame-yellow uppercase tracking-wider mb-1">Domain to Authorize:</span>
                  <div className="flex items-center justify-between gap-2 bg-zinc-900 px-3 py-2 rounded border border-white/5 font-mono text-xs text-white">
                    <span className="truncate selection:bg-flame-orange/40">{window.location.hostname}</span>
                    <button 
                      onClick={copyDomain}
                      className="shrink-0 flex items-center gap-1 text-[10px] uppercase font-bold text-flame-orange hover:text-white bg-flame-orange/10 px-2 py-1 rounded transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-2 mt-1 pl-1 text-[#E0E0E0]">
                  <div className="flex items-start gap-1.5">
                    <span className="text-[#FF6B00] font-sans font-bold">1.</span>
                    <span>Open your <strong>Firebase Console</strong> and click the <strong>Authentication</strong> tab.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-[#FF6B00] font-sans font-bold">2.</span>
                    <span>Navigate to <strong>Settings</strong> &rarr; <strong>Authorized Domains</strong>.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-[#FF6B00] font-sans font-bold">3.</span>
                    <span>Click <strong>Add Domain</strong> and paste the copied domain above.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={enableSandboxBypass}
                className="flex-1 bg-flame-orange hover:bg-flame-deep text-black font-display font-bold text-sm md:text-base px-4 py-2.5 rounded transition-transform duration-150 active:scale-95 text-center cursor-pointer uppercase tracking-wider"
              >
                Use Local Demo Sandbox Bypass
              </button>
              <button
                onClick={() => setShowDomainError(false)}
                className="border border-white/10 hover:bg-white/5 text-xs text-flame-gray hover:text-white px-4 py-2.5 rounded transition-colors uppercase tracking-wider font-accent cursor-pointer"
              >
                Close & Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Popup Blocked / Closed Fallback Instruction Modal --- */}
      {showPopupClosedError && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-flame-orange/40 max-w-lg w-full rounded-2xl p-6 relative overflow-hidden shadow-[0_0_50px_rgba(255,107,0,0.15)] animate-flicker-subtle">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-flame-orange via-flame-yellow to-flame-orange"></div>
            
            <button 
              onClick={() => setShowPopupClosedError(false)}
              className="absolute top-4 right-4 text-flame-gray hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 mt-2">
              <div className="p-3 bg-flame-orange/20 border border-flame-orange/40 rounded-xl text-flame-orange shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-left">
                <h3 className="font-display text-2xl text-white uppercase tracking-wider">
                  Sign-In Popup Blocked
                </h3>
                <p className="font-mono text-[9px] text-[#FF9E00] uppercase tracking-widest mt-0.5">
                  Auth Restriction (popup-closed-by-user)
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4 font-sans text-sm text-flame-gray leading-relaxed text-left">
              <p>
                The authentication window was unable to complete. This usually happens because:
              </p>

              <ul className="list-disc pl-5 space-y-1 text-xs text-[#E0E0E0]">
                <li>A browser extension or popup blocker closed the sign-in tab.</li>
                <li>The preview window frame blocked the Google login redirect.</li>
                <li>The sign-in window was closed before completing auth.</li>
              </ul>

              <div className="bg-flame-orange/5 border border-flame-orange/20 rounded-xl p-4 mt-2">
                <p className="text-xs text-flame-yellow leading-relaxed">
                  <strong>💡 Recommended:</strong> If you are testing this in the AI Studio preview environment, click <strong>Use Local Demo Sandbox Bypass</strong> below. It launches a fully functional sandbox session instantly without requiring physical external redirects!
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowPopupClosedError(false);
                  enableSandboxBypass();
                }}
                className="flex-1 bg-flame-orange hover:bg-flame-deep text-black font-display font-bold text-sm md:text-base px-4 py-2.5 rounded transition-transform duration-150 active:scale-95 text-center cursor-pointer uppercase tracking-wider"
              >
                Use Local Demo Sandbox Bypass
              </button>
              <button
                onClick={() => {
                  setShowPopupClosedError(false);
                  onOpenAuth('login');
                }}
                className="border border-white/10 hover:bg-white/5 text-xs text-flame-gray hover:text-white px-4 py-2.5 rounded transition-colors uppercase tracking-wider font-accent cursor-pointer text-center"
              >
                Close & Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden mt-3 border-t border-white/5 bg-flame-black/95 backdrop-blur-md overflow-hidden rounded-lg"
          >
            <div className="flex flex-col p-4 space-y-4 font-display text-sm tracking-widest uppercase">
              <motion.a 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                href="#hero" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-flame-orange py-2 px-1 border-b border-white/5 transition-all outline-none"
              >
                Home
              </motion.a>
              <motion.a 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                href="#menu" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-flame-orange py-2 px-1 border-b border-white/5 transition-all outline-none"
              >
                Menu
              </motion.a>
              <motion.a 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                href="#contact" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-flame-orange py-2 px-1 border-b border-white/5 transition-all outline-none"
              >
                Contact
              </motion.a>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="pt-2 flex flex-col gap-2"
              >
                <div className="text-[10px] font-mono text-flame-gray normal-case leading-normal">
                  📍 Sironj, near Nanni Bee Masjid.<br />
                  📞 Store Service line: <span className="text-flame-yellow">9926715071</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </nav>
  );
}
