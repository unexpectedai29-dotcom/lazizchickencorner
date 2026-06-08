import { useState, useEffect } from 'react';
import { 
  Flame, 
  MapPin, 
  Clock, 
  Phone, 
  Heart, 
  CheckCircle, 
  Share2, 
  PartyPopper, 
  AlertTriangle,
  ChevronRight,
  UserCheck,
  X,
  XCircle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { showToast } from './lib/toast';
import { dbService, authActions } from './firebase';
import { MenuItem, OrderItem, Order } from './types';
import { RESTAURANT_INFO } from './data';
import LCCLogo from './components/LCCLogo';
import { useAuth } from './providers/AuthProvider';

// Component Imports
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import AboutSection from './components/AboutSection';
import GallerySection from './components/GallerySection';
import ContactSection from './components/ContactSection';
import CartDrawer from './components/CartDrawer';
import AdminDashboard from './components/AdminDashboard';
import MyOrdersModal from './components/MyOrdersModal';
import AuthModal from './components/AuthModal';
import AdminLoginPage from './components/AdminLoginPage';
import PersonalDashboard from './components/PersonalDashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  const {
    user: currentUser,
    loading: isAuthLoading,
    isAdmin,
    logout: handleLogout,
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
  } = useAuth();
  
  // Cart, Orders, Admin toggles
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  // Success Notification
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  
  // Custom Toast stack state
  interface AppToast {
    id: string;
    message: string;
    type: 'success' | 'info' | 'error' | 'warning';
    title?: string;
  }
  const [toasts, setToasts] = useState<AppToast[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' | 'warning' = 'success', title?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const handleAddToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: 'success' | 'info' | 'error' | 'warning'; title?: string }>;
      if (customEvent.detail) {
        addToast(customEvent.detail.message, customEvent.detail.type || 'success', customEvent.detail.title);
      }
    };
    window.addEventListener('app-toast', handleAddToast);
    return () => window.removeEventListener('app-toast', handleAddToast);
  }, []);

  // Simulated Client Routing State
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Secure Route Protection + Automatic Session Restores
  useEffect(() => {
    if (!isAuthLoading) {
      if (isAdmin) {
        if (currentHash === '#/admin/login') {
          window.location.hash = '#/admin/dashboard';
        }
      } else {
        if (currentHash === '#/admin/dashboard') {
          window.location.hash = '#/admin/login';
        }
      }
    }
  }, [isAuthLoading, isAdmin, currentHash]);

  // Sync Cart to localStorage so customer menu doesn't wipe on simple refreshes
  useEffect(() => {
    const saved = localStorage.getItem('laziz_cart_items');
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        setCartItems([]);
      }
    }
  }, []);

  const saveCart = (items: OrderItem[]) => {
    setCartItems(items);
    localStorage.setItem('laziz_cart_items', JSON.stringify(items));
  };

  // Add Item to shopping list
  const handleAddToCart = (item: MenuItem) => {
    const existingIndex = cartItems.findIndex((ci) => ci.id === item.id);
    const updated = [...cartItems];

    if (existingIndex !== -1) {
      updated[existingIndex].quantity += 1;
    } else {
      updated.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
      });
    }
    saveCart(updated);
    showToast(`Added 1x ${item.name} to hot cart!`, 'success', 'Added To Cart');
  };

  // Update item quantity
  const handleUpdateQuantity = (itemId: string, delta: number) => {
    const updated = cartItems
      .map((ci) => {
        if (ci.id === itemId) {
          return { ...ci, quantity: ci.quantity + delta };
        }
        return ci;
      })
      .filter((ci) => ci.quantity > 0);
    saveCart(updated);
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  const triggerAlert = (message: string) => {
    showToast(message, 'success');
  };

  // View helper to scroll menu section
  const handleScrollToMenu = () => {
    const el = document.getElementById('menu');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  // Cinematic brand loader screen while auth state completes
  if (isAuthLoading) {
    return (
      <div className="fixed inset-0 bg-[#0B0B0B] z-50 flex flex-col items-center justify-center p-6 space-y-6">
        <div className="relative animate-pulse">
          <LCCLogo size="custom" className="w-64 h-56" glow={true} />
        </div>
        <div className="flex flex-col items-center space-y-2 text-center">
          <span className="font-display text-2xl md:text-3xl text-white tracking-widest uppercase animate-pulse">
            LAZIZ CHICKEN CORNER
          </span>
          <span className="font-mono text-[9px] text-flame-yellow uppercase tracking-widest leading-none">
            Restoring secure admin session...
          </span>
        </div>
      </div>
    );
  }

  // 1. Dedicated Cinematic Admin Login View
  if (currentHash === '#/admin/login') {
    if (!isAuthLoading && isAdmin) {
      return null;
    }
    return <AdminLoginPage />;
  }

  // 2. Protected Realtime Admin Dashboard
  if (currentHash === '#/admin/dashboard') {
    if (!isAdmin) {
      return null; // Secured routing guard
    }
    return (
      <div className="bg-flame-dark min-h-screen text-white select-none">
        {/* Navigation override inside Admin Panel */}
        <header className="bg-flame-black border-b border-flame-orange/20 px-6 py-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <LCCLogo size="custom" className="w-12 h-10" glow={true} />
            <span className="font-display text-xl tracking-wide uppercase text-white hidden sm:inline">
              LCC Admin Core
            </span>
            <span className="font-mono text-[9px] bg-flame-orange/20 text-[#FF9E00] border border-flame-orange/45 px-2 py-0.5 rounded font-black tracking-widest uppercase">
              SECURED LIVE
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-flame-gray font-mono hidden md:inline">{currentUser?.email}</span>
            <button
               onClick={() => {
                 handleLogout().then(() => {
                   window.location.hash = '#/admin/login';
                 });
               }}
               className="bg-red-950/25 border border-red-900/40 hover:bg-red-950/50 text-red-400 font-accent text-xs uppercase px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              Sign Out Securely
            </button>
            <button
               onClick={() => { window.location.hash = '#/'; }}
               className="bg-flame-orange hover:bg-flame-deep text-white font-accent text-xs uppercase px-4 py-1.5 rounded-md transition-all cursor-pointer shadow-lg shadow-flame-orange/20"
            >
              Back to Storefront
            </button>
          </div>
        </header>

        {/* Dashboard widget and controls */}
        <AdminDashboard onClose={() => { window.location.hash = '#/'; }} />
      </div>
    );
  }

  // 3. New Files Cloud Dashboard (Unified normal user dashboard and administrative console)
  if (currentHash === '#/dashboard') {
    if (isAuthLoading) {
      return (
        <div className="bg-[#0b0c0e] min-h-screen text-white flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-flame-orange animate-spin" />
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Verifying Security Token...</p>
        </div>
      );
    }
    if (!currentUser) {
      window.location.hash = '#/';
      // Open login modal shortly
      setTimeout(() => {
        openAuthModal('login');
      }, 300);
      return null;
    }
    return (
      <PersonalDashboard
        currentUser={currentUser}
        onClose={() => { window.location.hash = '#/'; }}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-flame-dark text-white font-sans overflow-x-hidden selection:bg-flame-orange selection:text-white">
      
      {/* Absolute floating multi-toast system container */}
      <div className="fixed bottom-6 right-6 z-55 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="pointer-events-auto w-full bg-[#121214] border border-white/5 shadow-2xl rounded-lg p-4 flex items-start gap-3 border-l-4 overflow-hidden relative"
              style={{
                borderLeftColor:
                  toast.type === 'success' ? '#FF6B00' : 
                  toast.type === 'warning' ? '#EAB308' : 
                  toast.type === 'error' ? '#EF4444' :   
                  '#3B82F6',                             
              }}
            >
              <div 
                className="absolute inset-0 opacity-2 pointer-events-none"
                style={{
                  backgroundColor:
                    toast.type === 'success' ? '#FF6B00' :
                    toast.type === 'warning' ? '#EAB308' :
                    toast.type === 'error' ? '#EF4444' :
                    '#3B82F6',
                }}
              />
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && <Flame className="w-5 h-5 text-flame-orange fill-flame-orange/20" />}
                {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
              </div>
              <div className="flex-1 space-y-0.5">
                {toast.title && (
                  <h5 className="font-accent text-[10px] uppercase tracking-wider text-white font-extrabold">
                    {toast.title}
                  </h5>
                )}
                <p className="text-xs text-flame-gray leading-relaxed font-sans font-medium">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-flame-gray hover:text-white transition-colors p-0.5 hover:bg-white/5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Primary Header */}
      <Navbar
        currentUser={currentUser}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenAdmin={() => { window.location.hash = '#/admin/dashboard'; }}
        onLogin={() => {
          triggerAlert(`Logged in successfully!`);
        }}
        onLogout={() => {
          triggerAlert(`Sign out successful.`);
        }}
        onOpenAuth={(mode = 'login') => {
          openAuthModal(mode);
        }}
      />

      {/* Cinematic Hero */}
      <Hero onViewMenuClick={handleScrollToMenu} onAddToCart={handleAddToCart} />

      {/* Main menu ordering catalog */}
      <MenuSection
        cartItems={cartItems}
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
      />

      {/* About story section */}
      <AboutSection />

      {/* Ambiance Gallery */}
      <GallerySection />

      {/* Contact schedules list */}
      <ContactSection />

      {/* checkout cart drawers */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            currentUser={currentUser}
            onUpdateQuantity={handleUpdateQuantity}
            onClearCart={handleClearCart}
            onLogin={() => {
              triggerAlert(`Login synced!`);
            }}
            onOrderSuccess={(orderId, orderDetails) => {
              setIsCartOpen(false);
              setSuccessOrderId(orderId);
              setSuccessOrder(orderDetails);
              showToast('Order successfully processed and sent to the oven!', 'success', 'Kitchen Fire Started');
            }}
            onOpenAuth={(mode = 'login') => {
              openAuthModal(mode);
            }}
          />
        )}
      </AnimatePresence>

      {/* Client order updates modal */}
      {currentUser && (
        <MyOrdersModal
          isOpen={isOrdersOpen}
          onClose={() => setIsOrdersOpen(false)}
          userId={currentUser.uid}
        />
      )}

      {/* Order Complete Success Dialog Overlay */}
      {successOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-flame-black/90 backdrop-blur-md" onClick={() => { setSuccessOrderId(null); setSuccessOrder(null); }} />
          
          <div className="relative bg-flame-card border border-flame-orange/30 p-8 rounded-xl max-w-md w-full text-center shadow-2xl z-10 space-y-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-flame-orange to-flame-yellow rounded-full flex items-center justify-center mx-auto shadow-lg shadow-flame-orange/30 animate-pulse">
              <PartyPopper className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[10px] text-flame-yellow uppercase tracking-widest font-black block">Order Placed Successfully</span>
              <h3 className="font-display text-3xl text-white uppercase tracking-wider">KITCHEN FIRES INITIALIZED!</h3>
              <p className="text-xs text-flame-gray leading-relaxed font-sans mt-2">
                We received your pickup request. Your ticket has been transferred to our Sironj kitchen crew near Nanni Bee Masjid. 
              </p>
            </div>

            {/* Generated order details block with itemized receipts, taxes, services, and grand totals */}
            <div className="bg-flame-black/50 border border-white/5 p-4 rounded-lg text-left text-xs space-y-3 font-sans">
              <div className="flex justify-between text-flame-gray font-mono text-[10px]">
                <span>ORDER TICKET ID:</span>
                <span className="text-white">#{successOrderId.substring(0, 12).toUpperCase()}</span>
              </div>
              
              {successOrder && (
                <>
                  <div className="border-t border-white/5 pt-2.5 space-y-1.5">
                    <span className="block text-[9px] text-flame-yellow font-mono uppercase tracking-wider font-bold">ITEMIZED SUMMARY:</span>
                    {successOrder.items.map((it, itemIdx) => (
                      <div key={itemIdx} className="flex justify-between text-white/90">
                        <span><strong className="text-flame-orange font-mono">{it.quantity}x</strong> {it.name}</span>
                        <span className="font-mono text-flame-gray">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/5 pt-2 space-y-1 text-[11px] text-flame-gray">
                    <div className="flex justify-between">
                      <span>Subtotal Items Price:</span>
                      <span className="font-mono text-white">₹{successOrder.totalPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST / SGST Levies:</span>
                      <span className="text-green-500 font-mono">₹0.00 (Promo)</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm border-t border-dashed border-white/5 mt-1.5 pt-1.5 text-white uppercase">
                      <span>Total Amount Due:</span>
                      <span className="text-flame-orange font-mono text-base font-black">₹{successOrder.totalPrice}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* CTA action handles */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSuccessOrderId(null);
                  setSuccessOrder(null);
                  setIsOrdersOpen(true);
                }}
                className="w-full bg-flame-orange hover:bg-flame-deep text-white font-accent text-xs uppercase py-3 rounded-md transition-colors font-semibold tracking-wider cursor-pointer"
              >
                📊 Track Live Order Status
              </button>
              <button
                onClick={() => {
                  setSuccessOrderId(null);
                  setSuccessOrder(null);
                }}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-accent text-xs uppercase py-3 rounded-md transition-colors tracking-wider"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Dynamic Premium Agency Footer */}
      <footer className="bg-flame-black border-t border-white/5 pt-16 pb-8 px-4 md:px-8 relative z-10 text-flame-gray text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          
          {/* Col 1 Brand identity */}
          <div className="md:col-span-4 space-y-4">
            <a href="#hero" className="flex items-center gap-3">
              <div className="relative">
                <LCCLogo size="custom" className="w-16 h-12" glow={true} />
              </div>
              <span className="font-display text-2xl tracking-wide text-white">LAZIZ CHICKEN CORNER</span>
            </a>
            <p className="font-sans leading-relaxed text-flame-gray select-none">
              Traditional Indian masalas meet explosive street food crunch. 
              Serving Sironj's favorite crispy chicken buckets, fiery cheddar burgers, flat pizzas, and periperi fries daily.
            </p>
          </div>

          {/* Col 2 Quick links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-accent text-sm text-white uppercase tracking-wider font-bold">Catalog Navigation</h4>
            <ul className="space-y-1.5 font-sans">
              <li><a href="#menu" className="hover:text-flame-orange transition-colors">Browsing Menu</a></li>
              <li><a href="#about" className="hover:text-flame-orange transition-colors">Our Spicy Heritage</a></li>
              <li><a href="#gallery" className="hover:text-flame-orange transition-colors">Diner Gallery</a></li>
              <li><a href="#contact" className="hover:text-flame-orange transition-colors">Pickup Contact</a></li>
            </ul>
          </div>

          {/* Col 3 Categories */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-accent text-sm text-white uppercase tracking-wider font-bold">Our Signatures</h4>
            <ul className="space-y-1.5 font-sans">
              <li><a href="#menu" className="hover:text-flame-orange transition-colors">Crispy Chicken Bucket</a></li>
              <li><a href="#menu" className="hover:text-flame-orange transition-colors">Double Deck Fire Burger</a></li>
              <li><a href="#menu" className="hover:text-flame-orange transition-colors">Tandoori Paneer / Meat Pizza</a></li>
              <li><a href="#menu" className="hover:text-flame-orange transition-colors">Spicy Crispy Club Sandwich</a></li>
            </ul>
          </div>

          {/* Col 4 Quick Contact */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-accent text-sm text-white uppercase tracking-wider font-bold">Store Assist</h4>
            <div className="space-y-2 font-mono">
              <span className="block text-white">Near Nanni Bee Masjid, Sironj</span>
              <span className="block text-flame-yellow">📞 {RESTAURANT_INFO.phone1}</span>
              <span className="block text-flame-yellow">📞 {RESTAURANT_INFO.phone2}</span>
              <span className="block text-flame-gray font-sans">Open daily until 11:00 PM</span>
            </div>
          </div>

        </div>

        {/* copyright metadata details */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-center gap-4 text-[10px] uppercase font-mono">
          <span>&copy; {new Date().getFullYear()} Laziz Chicken Corner. All rights specified.</span>
          <span className="flex items-center gap-1.5">
            CRAFTED BY ZAKI UDDIN <Heart className="w-3.5 h-3.5 text-flame-orange fill-flame-orange hover:scale-110 transition-transform" /> WEBSITE MAKER NAME ZAKI UDDIN
          </span>
        </div>
      </footer>

      {/* --- Unified Secure Root Modal Overlay --- */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onSuccess={(user) => {
          triggerAlert(`Authenticated successfully as ${user.displayName || user.email || user.phoneNumber || 'Customer'}!`);
          window.dispatchEvent(new CustomEvent('sandbox-auth-change'));
        }}
        initialMode={authModalMode}
      />

    </div>
  );
}
