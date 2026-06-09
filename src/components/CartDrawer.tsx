import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, ShieldCheck, Mail, CalendarClock, PhoneOutgoing, UserPlus, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { dbService, isFirebaseSandbox, authActions, enableSandboxBypass } from '../firebase';
import { OrderItem, Order } from '../types';
import AuthModal from './AuthModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: OrderItem[];
  currentUser: any;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onClearCart: () => void;
  onLogin: (user: any) => void;
  onOrderSuccess: (orderId: string, orderDetails: Order) => void;
  onOpenAuth: (mode?: 'login' | 'signup' | 'phone') => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  currentUser,
  onUpdateQuantity,
  onClearCart,
  onLogin,
  onOrderSuccess,
  onOpenAuth,
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [notes, setNotes] = useState('');
  const [allergyNotes, setAllergyNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [openingTime, setOpeningTime] = useState('11:30 AM');
  const [closingTime, setClosingTime] = useState('11:00 PM');

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = dbService.subscribeStoreHours((data) => {
      if (data) {
        setOpeningTime(data.openingTime || '11:30 AM');
        setClosingTime(data.closingTime || '11:00 PM');
      }
    });
    return unsubscribe;
  }, [isOpen]);

  const totalPrice = cartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  const handleAuthSuccess = (user: any) => {
    onLogin(user);
    if (user?.displayName) setCustomerName(user.displayName);
    if (user?.phoneNumber) setPhone(user.phoneNumber);
  };

  // Submit flow
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentUser) {
      setErrorMessage('Please sign in to place a pickup order.');
      return;
    }
    if (!customerName || !phone || !pickupTime) {
      setErrorMessage('Please fill in Name, Phone, and Pickup Time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload: Omit<Order, 'createdAt' | 'updatedAt'> = {
        userId: currentUser.uid,
        customerName,
        phone,
        items: cartItems,
        totalPrice,
        orderStatus: 'pending',
        pickupTime,
        notes,
        allergyNotes
      };

      const orderId = await dbService.placeOrder(orderPayload);
      if (orderId) {
        onClearCart();
        onOrderSuccess(orderId, { ...orderPayload, id: orderId } as Order);
        // Clear fields
        setPhone('');
        setPickupTime('');
        setNotes('');
        setAllergyNotes('');
      } else {
        setErrorMessage('Failed to trigger database transaction. Try again.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Firestore operational permission error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Background Dim Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="absolute inset-0 bg-flame-black/75 backdrop-blur-sm"
      />

      {/* Drawer Card Slide-in */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        className="relative w-full max-w-lg bg-flame-black h-full flex flex-col shadow-2xl border-l border-white/5 z-10"
      >
        
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-flame-orange" />
            <h3 className="font-display text-2xl text-white uppercase tracking-wider">Your Hot Cart</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 text-flame-gray hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5.5 h-5.5" />
          </button>
        </div>

        {/* Dynamic Inner Workspace */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Cart items list */}
          {cartItems.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-flame-gray/30 mb-4 animate-bounce" />
              <p className="font-accent text-lg text-white uppercase tracking-wider">Your Cart Is Pure Ice</p>
              <p className="text-xs text-flame-gray max-w-xs mt-2 text-center">
                Add some spicy tandoori crispy chicken, burgers or peri-peri seasoned fries from our fire catalog to start a checkout!
              </p>
              <button 
                onClick={onClose}
                className="mt-6 px-5 py-2.5 bg-flame-orange text-white font-accent text-xs uppercase tracking-widest rounded-md cursor-pointer"
              >
                Go Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-accent text-[11px] text-flame-yellow uppercase tracking-widest font-bold border-b border-white/5 pb-2">
                Order Items ({cartItems.length})
              </h4>
              
              <div className="divide-y divide-white/5 space-y-4">
                {cartItems.map((ci) => (
                  <div key={ci.id} className="flex items-center justify-between pt-3 first:pt-0">
                    <div className="flex-1">
                      <span className="font-accent text-sm text-white uppercase tracking-wide block leading-snug">{ci.name}</span>
                      <span className="font-mono text-[11px] text-flame-gray">₹{ci.price} each</span>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-zinc-900 border border-white/10 rounded-full px-2.5 py-1 text-xs select-none">
                        <button 
                          onClick={() => onUpdateQuantity(ci.id, -1)}
                          className="hover:text-flame-orange font-bold text-xs"
                          title="Decrease"
                        >
                          -
                        </button>
                        <span className="font-mono text-xs font-bold text-white w-6 text-center">{ci.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(ci.id, 1)}
                          className="hover:text-flame-orange font-bold text-xs"
                          title="Increase"
                        >
                          +
                        </button>
                      </div>

                      {/* Total */}
                      <span className="font-mono text-sm text-white font-semibold w-16 text-right">
                        ₹{ci.price * ci.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total calculations */}
              <div className="bg-flame-card border border-white/5 p-4 rounded-lg mt-6">
                <div className="flex justify-between items-center text-xs text-flame-gray">
                  <span>Net Price</span>
                  <span className="font-mono">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-flame-gray mt-2">
                  <span>GST / Central Levies</span>
                  <span className="font-mono text-green-500 font-semibold">₹0.00 (Promo)</span>
                </div>
                <div className="flex justify-between items-center text-xs text-flame-gray mt-2">
                  <span>Pickup Charge</span>
                  <span className="font-mono text-green-500 font-semibold">₹0.00 (Free)</span>
                </div>
                <div className="flex justify-between items-center text-sm text-white border-t border-white/5 pt-3 mt-3">
                  <span className="font-accent uppercase tracking-wider font-bold">Total Amount Due</span>
                  <span className="font-mono text-lg text-flame-orange font-black">₹{totalPrice}</span>
                </div>
              </div>
            </div>
          )}

          {/* Checkout Info form if items exist */}
          {cartItems.length > 0 && (
            <div className="border-t border-white/5 pt-6 space-y-4">
              
              {!currentUser ? (
                /* Prompt login */
                <div className="bg-flame-orange/5 border border-flame-orange/20 p-5 rounded-lg text-center space-y-4">
                  <UserPlus className="w-8 h-8 text-flame-orange mx-auto animate-pulse" />
                  <div>
                    <h5 className="font-accent text-sm text-white uppercase tracking-wider">Authentication Required</h5>
                    <p className="text-[11px] text-flame-gray max-w-xs mx-auto mt-1 leading-normal">
                      To complete order placement and register your contact details securely, choose your favorite login method.
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenAuth('login')}
                    className="w-full bg-flame-orange hover:bg-flame-deep text-white text-xs font-accent uppercase tracking-wider py-2.5 rounded transition-all flex items-center justify-center gap-2 cursor-pointer font-bold"
                  >
                    <span>Login or Register Account</span>
                  </button>
                </div>
              ) : (
                /* Authenticated client checkout form */
                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  <h4 className="font-accent text-[11px] text-flame-yellow uppercase tracking-widest font-bold border-b border-white/5 pb-2">
                    Pickup Details
                  </h4>

                  {errorMessage && (
                    <div className="bg-red-500/10 border border-red-500/35 p-3 rounded text-[11px] text-red-400 font-sans leading-normal">
                      ⚠️ {errorMessage}
                    </div>
                  )}

                  {/* Customer Name */}
                  <div>
                    <label className="block text-[10px] text-flame-gray font-mono uppercase tracking-widest mb-1.5 font-bold">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Priyandh Sharma"
                      className="w-full bg-zinc-900 border border-white/10 text-white placeholder-zinc-600 px-3 py-2.5 rounded text-xs focus:outline-none focus:border-flame-orange"
                      id="checkout-name"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[10px] text-flame-gray font-mono uppercase tracking-widest mb-1.5 font-bold">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      pattern="^[0-9\s\+\-]{8,20}$"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765-43210"
                      className="w-full bg-zinc-900 border border-white/10 text-white placeholder-zinc-600 px-3 py-2.5 rounded text-xs focus:outline-none focus:border-flame-orange"
                      id="checkout-phone"
                    />
                  </div>

                  {/* Requested Pickup Time */}
                  <div>
                    <label className="block text-[10px] text-flame-gray font-mono uppercase tracking-widest mb-1.5 font-bold flex items-center justify-between">
                      <span>Requested Pickup Time *</span>
                      <span className="text-[9px] text-flame-yellow uppercase lowercase-none">Store hours: {openingTime} - {closingTime}</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      placeholder="e.g. 7:30 PM (or ASAP)"
                      className="w-full bg-zinc-900 border border-white/10 text-white placeholder-zinc-600 px-3 py-2.5 rounded text-xs focus:outline-none focus:border-flame-orange"
                      id="checkout-pickup-time"
                    />
                  </div>

                  {/* Kitchen & Allergy Instructions */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-flame-gray font-mono uppercase tracking-widest mb-1 font-bold">
                        Kitchen Instructions / Custom Requests (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Extra spicy masala, keep sauce separate, extra onions"
                        rows={2}
                        maxLength={500}
                        className="w-full bg-zinc-900 border border-white/10 text-white placeholder-zinc-600 px-3 py-2 rounded text-xs focus:outline-none focus:border-flame-orange resize-none"
                        id="checkout-notes"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-red-400 font-mono uppercase tracking-widest mb-1 font-bold flex items-center gap-1">
                        ⚠️ Allergy Information (Optional)
                      </label>
                      <textarea
                        value={allergyNotes}
                        onChange={(e) => setAllergyNotes(e.target.value)}
                        placeholder="e.g. Nut allergy, lactose intolerant, egg-free request"
                        rows={2}
                        maxLength={500}
                        className="w-full bg-zinc-900 border border-red-900/40 text-white placeholder-zinc-600 px-3 py-2 rounded text-xs focus:outline-none focus:border-red-500 resize-none font-sans"
                        id="checkout-allergy-notes"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-flame-orange hover:bg-flame-deep text-white font-accent text-sm uppercase tracking-wider py-3.5 rounded-md hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-4 glow-btn cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Transmitting Securely...' : '🔥 Complete Order & Send to Kitchen'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5 justify-center text-[10px] text-flame-gray font-mono uppercase mt-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-flame-yellow" />
                    <span>Double Encrypted Connection</span>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

      </motion.div>

    </div>
  );
}
